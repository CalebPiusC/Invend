import { test } from 'node:test';
import assert from 'node:assert/strict';
import { readFile } from 'node:fs/promises';
import vm from 'node:vm';
import sharp from 'sharp';
import {
  INVEND_BAG_PATH,
  INVEND_CHARCOAL,
  INVEND_GOLD,
  INVEND_HANDLE_PATH,
} from '../web/lib/brand-mark.ts';

const publicFile = (name) => readFile(`web/public/${name}`);

test('Invend manifest keeps the installed identity, colours, scope and workspace entry', async () => {
  const manifest = JSON.parse(await publicFile('manifest.webmanifest'));
  assert.equal(manifest.name, 'Invend — AI sales assistant');
  assert.equal(manifest.short_name, 'Invend');
  assert.equal(manifest.display, 'standalone');
  assert.equal(manifest.start_url, '/app');
  assert.equal(manifest.id, '/', 'existing installations must not become a different app');
  assert.equal(manifest.scope, '/');
  assert.equal(manifest.theme_color, '#242066');
  assert.equal(manifest.background_color, '#F8FAFC');
  for (const size of [192, 512]) {
    const icon = manifest.icons.find((i) => i.sizes === `${size}x${size}`);
    assert.ok(icon);
    assert.equal(icon.src, `/invend-icon-${size}.png`);
    assert.equal(icon.type, 'image/png');
    const png = await publicFile(icon.src.slice(1));
    assert.equal(png.subarray(1, 4).toString(), 'PNG');
    assert.equal(png.readUInt32BE(16), size);
    assert.equal(png.readUInt32BE(20), size);
    assert.deepEqual(png, await publicFile(`icon-${size}.png`), 'legacy URLs serve the new mark');
  }
  assert.match(manifest.icons.find((i) => i.sizes === '512x512').purpose, /maskable/);
});

test('scalable logo variants and legacy SVG URLs share the new geometry, not a raster or old mark', async () => {
  for (const name of [
    'invend-logo.svg',
    'invend-logo-inverse.svg',
    'invend-icon.svg',
    'invend-compact.svg',
    'favicon.svg',
    'icon.svg',
    'selvora-mark.svg',
  ]) {
    const svg = (await publicFile(name)).toString();
    assert.ok(svg.includes(`d="${INVEND_BAG_PATH}"`), name);
    assert.ok(svg.includes(`d="${INVEND_HANDLE_PATH}" fill="none"`), 'handle must stay open');
    assert.ok(svg.includes(INVEND_GOLD), name);
    assert.match(svg, /viewBox="0 0 \d+ 64"/);
    assert.match(svg, /aria-label="[Ii]nvend"/);
    assert.doesNotMatch(svg, /<image\b|<text\b|selvora/i, name);
  }
  assert.deepEqual(await publicFile('selvora-mark.svg'), await publicFile('favicon.svg'));
});

test('touch icon and favicon contain correctly sized real PNG images', async () => {
  const apple = await publicFile('apple-touch-icon.png');
  assert.equal(apple.readUInt32BE(16), 180);
  assert.equal(apple.readUInt32BE(20), 180);
  const ico = await publicFile('favicon.ico');
  assert.equal(ico.readUInt16LE(0), 0);
  assert.equal(ico.readUInt16LE(2), 1);
  assert.equal(ico.readUInt16LE(4), 3);
  [16, 32, 48].forEach((size, index) => {
    const start = 6 + index * 16;
    assert.equal(ico[start], size);
    assert.equal(ico[start + 1], size);
    const offset = ico.readUInt32LE(start + 12);
    const length = ico.readUInt32LE(start + 8);
    assert.ok(offset + length <= ico.length);
    assert.equal(ico.subarray(offset + 1, offset + 4).toString(), 'PNG');
    assert.equal(ico.readUInt32BE(offset + 16), size);
    assert.equal(ico.readUInt32BE(offset + 20), size);
  });
});

test('the refined install mark uses charcoal/gold and stays inside the maskable safe circle', async () => {
  const charcoal = [28, 28, 28];
  const gold = [245, 183, 0];
  assert.equal(INVEND_CHARCOAL, '#1C1C1C');
  assert.equal(INVEND_GOLD, '#F5B700');
  for (const size of [192, 512]) {
    const { data, info } = await sharp(await publicFile(`invend-icon-${size}.png`))
      .ensureAlpha()
      .raw()
      .toBuffer({ resolveWithObject: true });
    assert.equal(info.channels, 4);
    assert.deepEqual([...data.subarray(0, 3)], charcoal);
    let goldPixels = 0;
    let whitePixels = 0;
    let radius = 0;
    for (let y = 0; y < size; y++) {
      for (let x = 0; x < size; x++) {
        const index = (y * size + x) * 4;
        const rgb = [...data.subarray(index, index + 3)];
        if (rgb.every((value, channel) => value === gold[channel])) goldPixels++;
        if (rgb.every((value) => value === 255)) whitePixels++;
        // Ignore barely visible antialiasing at the edge of the silhouette.
        if (rgb.some((value, channel) => Math.abs(value - charcoal[channel]) > 12))
          radius = Math.max(radius, Math.hypot(x + 0.5 - size / 2, y + 0.5 - size / 2));
      }
    }
    assert.ok(
      goldPixels > 0 && whitePixels > 0,
      'the mark and its accent must both survive rasterisation',
    );
    assert.ok(radius < size * 0.4, `${size}px icon fits the central 80%-diameter safe circle`);
  }
});

async function worker() {
  const handlers = {};
  const cached = [];
  const calls = [];
  const stores = new Map([
    ['selvora-static-v1', new Map([['/offline.html', 'old branding']])],
    ['selvora-static-v2', new Map([['/invend-icon-192.png', 'previous bag icon']])],
    ['another-app-cache', new Map([['/offline.html', 'unrelated content']])],
  ]);
  let claimed = false;
  const context = {
    self: {
      addEventListener: (name, fn) => (handlers[name] = fn),
      skipWaiting: () => {},
      clients: { claim: () => (claimed = true) },
    },
    caches: {
      open: async (name) => {
        if (!stores.has(name)) stores.set(name, new Map());
        return {
          addAll: async (urls) => {
            cached.push(...urls);
            urls.forEach((url) => stores.get(name).set(url, `cached:${url}`));
          },
          match: async (url) => stores.get(name).get(url),
        };
      },
      keys: async () => [...stores.keys()],
      delete: async (name) => stores.delete(name),
    },
    fetch: async (req) => {
      calls.push(req);
      throw new Error('offline');
    },
  };
  vm.runInNewContext((await publicFile('sw.js')).toString(), context);
  const dispatch = (event) =>
    new Promise((resolve, reject) =>
      handlers[event]({ waitUntil: (p) => p.then(resolve, reject) }),
    );
  await dispatch('install');
  return { handlers, cached, calls, stores, dispatch, claimed: () => claimed };
}

test('branding upgrade evicts the old offline cache without deleting another app’s cache', async () => {
  const sw = await worker();
  assert.deepEqual(sw.cached, ['/offline.html', '/invend-icon-192.png']);
  await sw.dispatch('activate');
  assert.equal(sw.stores.has('selvora-static-v1'), false);
  assert.equal(sw.stores.has('selvora-static-v2'), false);
  assert.equal(sw.stores.has('selvora-static-v3'), true);
  assert.equal(sw.stores.has('another-app-cache'), true);
  assert.equal(sw.claimed(), true);
});

test('service worker never caches authenticated pages; navigation uses only its current offline fallback', async () => {
  const sw = await worker();
  let response;
  sw.handlers.fetch({
    request: { mode: 'navigate', url: '/app' },
    respondWith: (p) => (response = p),
  });
  assert.equal(await response, 'cached:/offline.html', 'do not use a stale cache’s offline page');
  assert.equal(sw.calls.length, 1);
  for (const mode of ['cors', 'same-origin']) {
    let intercepted = false;
    sw.handlers.fetch({
      request: { mode, url: '/api/v1/messages' },
      respondWith: () => (intercepted = true),
    });
    assert.equal(intercepted, false);
  }
  assert.deepEqual(sw.cached, ['/offline.html', '/invend-icon-192.png']);
});

test('offline document shows Invend without changing the reconnection action', async () => {
  const html = (await publicFile('offline.html')).toString();
  assert.match(html, /<title>Invend — Offline<\/title>/);
  assert.match(html, /your Invend workspace/);
  assert.match(html, /location.reload\(\)/);
  assert.doesNotMatch(html, /selvora/i);
});
