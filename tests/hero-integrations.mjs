import assert from 'node:assert/strict';
import { createHash } from 'node:crypto';
import { mkdir, readFile, writeFile } from 'node:fs/promises';
import { join } from 'node:path';
import { launchBrowser } from './helpers/chromium.mjs';

// Local browser acceptance, not native-install/provider/physical-device acceptance.
// Synthetic browser-install events are explicitly isolated from real browser prompting.
const origin = process.env.INVEND_HOME_URL ?? 'http://localhost:3000/';
const artifacts = process.env.INVEND_SCREENSHOT_DIR ?? '.next/invend-hero-integrations/browser';
const widths = process.env.INVEND_HERO_WIDTHS?.split(',').map(Number) ?? [
  320, 375, 390, 430, 640, 699, 700, 768, 900, 1024, 1099, 1100, 1280, 1440, 1920,
];
const tools = [
  ['whatsapp', 'WhatsApp Business', 'Coming soon', /Meta approval/],
  ['gmail', 'Gmail', 'Coming soon', /first planned live channel/],
  ['instagram', 'Instagram', 'Planned', /Messaging implementation and Meta review/],
  ['facebook', 'Facebook', 'Planned', /not implemented or approved/],
  ['assistant', 'Invend WhatsApp Assistant', 'Coming soon', /explicit YES confirmation/],
  ['pdf', 'Receipt PDFs', 'Available', /not a third-party connection/],
  [
    'spreadsheets',
    'CSV & Excel-compatible exports',
    'Planned',
    /CSV\/XLSX export is not implemented/,
  ],
];
const assetHashes = {
  'whatsapp.svg': '1ade6e20deab1142d69f3437f8252952373084bfd1fe76be1b55da9cf01d827c',
  'gmail.svg': '6e0a1db3ce3893a809c3293bf0780902cad270ed443bb118cfcbc40647e272ab',
  'instagram.svg': '821d3a84a192e97a1744a140afd871e8a81d8f7b81fdc33cbf54e74f09ee6143',
  'facebook.svg': '003fc3e7814ddcd270e030014f120f4cb8bef38be40022ebca913cafb7617a76',
};
await mkdir(artifacts, { recursive: true });
const checks = [],
  errors = [],
  consoleErrors = [],
  badAssets = [],
  privateRequests = [];
function watch(page) {
  page.on('pageerror', (error) => errors.push(error.message));
  page.on('console', (message) => {
    if (message.type() === 'error') consoleErrors.push(message.text());
  });
  page.on('response', (response) => {
    if (
      response.status() >= 400 &&
      ['image', 'script', 'stylesheet', 'font'].includes(response.request().resourceType())
    )
      badAssets.push({ url: response.url(), status: response.status() });
  });
  page.on('request', (request) => {
    if (new URL(request.url()).pathname.startsWith('/api/v1/')) privateRequests.push(request.url());
  });
}
async function avoidNativePromotion(page) {
  await page.addInitScript(() => {
    window.addEventListener('beforeinstallprompt', (event) => {
      if (!event.__heroTest) {
        event.preventDefault();
        event.stopImmediatePropagation();
      }
    });
  });
}
async function settle(page) {
  await page.evaluate(
    () => new Promise((resolve) => requestAnimationFrame(() => requestAnimationFrame(resolve))),
  );
}
async function go(page) {
  const response = await page.goto(origin, { waitUntil: 'networkidle', timeout: 120000 });
  assert.equal(response.status(), 200);
  await page.evaluate(() => document.fonts.ready);
  await page.addScriptTag({ path: 'node_modules/axe-core/axe.min.js' });
  await settle(page);
}
async function accessible(page, label) {
  const result = await page.evaluate(async () => {
    const result = await window.axe.run(document, {
      runOnly: { type: 'tag', values: ['wcag2a', 'wcag2aa', 'wcag21a', 'wcag21aa'] },
    });
    return {
      overflow: document.documentElement.scrollWidth - innerWidth,
      violations: result.violations.map((v) => ({
        id: v.id,
        nodes: v.nodes.map((n) => ({ target: n.target, reason: n.failureSummary })),
      })),
    };
  });
  checks.push({ label, ...result });
  assert.ok(result.overflow <= 1, `${label}: horizontal overflow ${result.overflow}`);
  assert.deepEqual(result.violations, [], `${label}: accessibility`);
}
async function capture(page, name, locator) {
  if (locator)
    await locator.screenshot({
      path: join(artifacts, `${name}.png`),
      animations: 'disabled',
      style: 'header, a[href="#main-content"]:not(:focus) { visibility: hidden; }',
    });
  else await page.screenshot({ path: join(artifacts, `${name}.png`), animations: 'disabled' });
}
const node = (page, id) => page.locator(`[data-integration-node="${id}"]`);
const panel = (page) => page.locator('#integration-info');
const install = (page) => page.getByRole('button', { name: 'Install Invend', exact: true });
async function center(page, locator) {
  await locator.evaluate((element) =>
    element.scrollIntoView({ block: 'center', behavior: 'instant' }),
  );
  await settle(page);
}
async function panelFits(page, label) {
  const box = await panel(page).boundingBox();
  const viewport = page.viewportSize();
  const header = await page.getByRole('banner').boundingBox();
  assert.ok(
    box.x >= 8 && box.x + box.width <= viewport.width - 8,
    `${label}: panel fits horizontally ${JSON.stringify(box)}`,
  );
  assert.ok(
    box.y >= (viewport.width >= 700 ? header.y + header.height + 8 : 8),
    `${label}: panel clears viewport/header ${JSON.stringify(box)}`,
  );
  assert.ok(
    box.y + box.height <= viewport.height - 8,
    `${label}: panel fits vertically ${JSON.stringify(box)}`,
  );
  const close = await panel(page).getByRole('button', { name: 'Close tool details' }).boundingBox();
  assert.ok(
    close.y >= box.y && close.y + close.height <= box.y + box.height,
    `${label}: close remains visible`,
  );
  assert.equal(
    await panel(page)
      .getByRole('button', { name: 'Close tool details' })
      .evaluate((element) => {
        const rect = element.getBoundingClientRect();
        return element.contains(
          document.elementFromPoint(rect.x + rect.width / 2, rect.y + rect.height / 2),
        );
      }),
    true,
    `${label}: close is actually hittable above following page content`,
  );
}

const browser = await launchBrowser();
try {
  const page = await browser.newPage({ reducedMotion: 'reduce' });
  page.setDefaultTimeout(15000);
  watch(page);
  await avoidNativePromotion(page);
  for (const [name, expected] of Object.entries(assetHashes)) {
    const bytes = await readFile(`web/public/images/integrations/${name}`);
    assert.equal(
      createHash('sha256').update(bytes).digest('hex'),
      expected,
      `${name}: original artwork remains byte-identical`,
    );
    assert.doesNotMatch(
      bytes.toString(),
      /<script|<foreignObject|onload=|href="https?:/i,
      `${name}: no active/external resource`,
    );
  }
  for (const width of widths) {
    const height = width < 600 ? 844 : 900;
    await page.setViewportSize({ width, height });
    await go(page);
    assert.equal(
      await page.getByRole('heading', { level: 1 }).innerText(),
      'Every customer conversation.\nEvery order. One workspace.',
    );
    assert.equal(await page.locator('#home + section').getAttribute('id'), 'integrations');
    const phone = await page.getByTestId('hero-phone').boundingBox();
    const dashboard = await page.getByTestId('hero-dashboard').boundingBox();
    const caption = await page.getByTestId('workspace-preview').locator('figcaption').boundingBox();
    const copy = await page.locator('#home > div').first().boundingBox();
    assert.ok(
      copy.y + copy.height < height,
      `${width}: opening copy/CTAs fit without a blank full-screen hero`,
    );
    assert.ok(phone.width >= 260 && phone.width <= 340, `${width}: prominent phone`);
    assert.ok(
      phone.height / phone.width > 1.9 && phone.height / phone.width < 2.5,
      `${width}: realistic portrait proportions`,
    );
    assert.ok(
      phone.x < dashboard.x + dashboard.width &&
        phone.x + phone.width > dashboard.x + dashboard.width - 30,
      `${width}: natural front/right overlap`,
    );
    assert.ok(caption.y >= phone.y + phone.height + 8, `${width}: no caption/device overlap`);
    if (width >= 1100)
      assert.ok(
        phone.y < height - 170 && dashboard.y < height - 120,
        `${width}: upper showcase visible in first fold`,
      );
    assert.equal(await page.getByTestId('workspace-preview').getByRole('button').count(), 0);
    assert.match(
      await page.getByTestId('workspace-preview').locator('figcaption').innerText(),
      /Illustrative interfaces with fictional data/,
    );
    assert.equal(
      await page.locator('#home [data-primary-cta]').getAttribute('href'),
      '/app?auth=sign-up',
    );
    assert.equal(
      await page.getByRole('link', { name: 'See how it works', exact: true }).getAttribute('href'),
      '#how-it-works',
    );
    assert.deepEqual(
      await page.locator('#home [data-primary-cta]').evaluate((el) => ({
        background: getComputedStyle(el).backgroundColor,
        color: getComputedStyle(el).color,
        border: getComputedStyle(el).borderTopColor,
      })),
      { background: 'rgb(22, 132, 91)', color: 'rgb(255, 255, 255)', border: 'rgb(17, 107, 73)' },
    );
    assert.equal(await page.getByRole('dialog').count(), 0, 'no automatic installation promotion');
    await accessible(page, `${width} opening`);
    if ([320, 390, 768, 1440, 1920].includes(width)) {
      await capture(page, `hero-${width}`);
      await capture(page, `hero-complete-${width}`, page.locator('#home'));
    }

    await install(page).focus();
    assert.equal(await page.locator('#invend-install-tooltip').isVisible(), true);
    await install(page).click();
    const dialog = page.getByRole('dialog');
    assert.equal(await dialog.getAttribute('open'), '');
    assert.match(await dialog.innerText(), /installed web app—not a native Android or iOS app/);
    assert.match(await dialog.innerText(), /Customer data is not cached for offline use/);
    assert.equal(await page.evaluate(() => document.body.style.overflow), 'hidden');
    for (let i = 0; i < 7; i++) {
      await page.keyboard.press('Tab');
      assert.equal(
        await dialog.evaluate((el) => el.contains(document.activeElement)),
        true,
        'native modal keeps focus inside',
      );
    }
    const bounds = await dialog.boundingBox();
    assert.ok(
      bounds.x >= 12 &&
        bounds.width <= width - 24 &&
        bounds.y >= 12 &&
        bounds.y + bounds.height <= height - 12,
    );
    await accessible(page, `${width} installation guidance`);
    if ([320, 390, 768, 1440].includes(width)) await capture(page, `installation-${width}`);
    await page.keyboard.press('Escape');
    assert.equal(await install(page).evaluate((el) => el === document.activeElement), true);
    assert.equal(await page.evaluate(() => document.body.style.overflow), '');

    await page.getByRole('link', { name: 'See how it works', exact: true }).click();
    await page.waitForFunction(() => location.hash === '#how-it-works');
    await settle(page);
    const workTop = await page.locator('#how-it-works').boundingBox();
    const header = await page.getByRole('banner').boundingBox();
    assert.ok(
      workTop.y >= header.y + header.height - 1,
      'existing workflow destination clears fixed header',
    );
    await page
      .locator('#integrations')
      .evaluate((el) => el.scrollIntoView({ behavior: 'instant' }));
    await settle(page);
    if (width >= 1100) {
      assert.equal(
        await page.getByRole('navigation', { name: 'Main navigation', exact: true }).isVisible(),
        true,
      );
      assert.equal(
        await page.getByRole('navigation', { name: 'Account navigation', exact: true }).isVisible(),
        true,
      );
      assert.equal(await page.getByRole('button', { name: 'Open navigation' }).isVisible(), false);
      assert.equal(
        await page.locator('#features-navigation-trigger').getAttribute('aria-expanded'),
        'false',
      );
    }
    assert.equal(await page.locator('[data-integration-node]').count(), 7);
    assert.doesNotMatch(
      await page.getByTestId('integration-map').innerText(),
      /Paystack|synced|connected successfully/i,
    );
    for (const el of await page.locator('[data-integration-node]').all()) {
      const box = await el.boundingBox();
      assert.ok(
        box.x >= 12 && box.x + box.width <= width - 12,
        'nodes fit without diagram overflow',
      );
      assert.ok(box.width >= 44 && box.height >= 44, 'comfortable selectable node');
    }
    if ([320, 390, 768, 1440, 1920].includes(width))
      await capture(page, `integrations-${width}`, page.locator('#integrations'));
    for (const [id, name, status, boundary] of tools) {
      await center(page, node(page, id));
      const before = await page.getByTestId('integration-map').boundingBox();
      await node(page, id).click();
      await panel(page).waitFor();
      await settle(page);
      assert.equal(await page.locator('#integration-info').count(), 1);
      assert.equal(await panel(page).getByRole('heading', { level: 3 }).innerText(), name);
      assert.match(await panel(page).innerText(), new RegExp(status));
      assert.match(await panel(page).innerText(), boundary);
      assert.equal(await node(page, id).getAttribute('aria-pressed'), 'true');
      assert.equal(await page.locator('[data-integration-node][aria-expanded="true"]').count(), 1);
      assert.equal(
        await page.locator(`[data-route="${id}"]`).getAttribute('data-selected'),
        'true',
      );
      const after = await page.getByTestId('integration-map').boundingBox();
      assert.equal(after.height, before.height, `${width}/${id}: panel does not shift layout`);
      await panelFits(page, `${width}/${id}`);
      await accessible(page, `${width} ${name} panel`);
      if ([390, 1440].includes(width)) await capture(page, `tool-${id}-${width}`);
      await panel(page).getByRole('button', { name: 'Close tool details' }).click();
      assert.equal(await node(page, id).evaluate((el) => el === document.activeElement), true);
      assert.equal(await panel(page).count(), 0, 'close does not reopen on restored focus');
    }
    await center(page, node(page, 'whatsapp'));
    await node(page, 'whatsapp').focus();
    await page.keyboard.press('ArrowRight');
    assert.equal(await node(page, 'gmail').evaluate((el) => el === document.activeElement), true);
    assert.equal(await panel(page).getAttribute('data-pinned'), 'false');
    await page.keyboard.press('Enter');
    assert.equal(await panel(page).getAttribute('data-pinned'), 'true');
    await page.keyboard.press('End');
    assert.equal(
      await node(page, 'spreadsheets').evaluate((el) => el === document.activeElement),
      true,
    );
    await page.keyboard.press('Enter');
    await page.keyboard.press('Tab');
    assert.equal(
      await panel(page)
        .getByRole('button', { name: 'Close tool details' })
        .evaluate((el) => el === document.activeElement),
      true,
    );
    await page.keyboard.press('Escape');
    assert.equal(
      await node(page, 'spreadsheets').evaluate((el) => el === document.activeElement),
      true,
    );
    assert.equal(await panel(page).count(), 0);
    await node(page, 'pdf').focus();
    await page.keyboard.press('Enter');
    await page.locator('#integration-readiness > summary').focus();
    await panel(page).waitFor({ state: 'detached' });
    assert.equal(
      await page
        .locator('#integration-readiness > summary')
        .evaluate((el) => el === document.activeElement),
      true,
      'leaving a pinned panel does not steal keyboard focus',
    );
    await page.locator('#integration-readiness > summary').click();
    await accessible(page, `${width} truthful rollout and file formats`);
    await page.locator('#integration-readiness > summary').click();
    console.log(
      `PASS ${width}px: integrated phone/dashboard, first-fold CTAs, real routes, install modal, seven bounded tool panels, focus, readiness, desktop scroll preservation and no overflow.`,
    );
  }

  // Hover travel and pin semantics in a real pointer browser, not jsdom only.
  await page.setViewportSize({ width: 1440, height: 900 });
  await go(page);
  await center(page, node(page, 'whatsapp'));
  await node(page, 'whatsapp').hover();
  await panel(page).waitFor();
  assert.equal(await panel(page).getAttribute('data-pinned'), 'false');
  await panel(page).hover();
  await page.waitForTimeout(240); // Exceed the defined 180ms pointer travel grace.
  assert.equal(await panel(page).isVisible(), true);
  await page.mouse.move(10, 880);
  await panel(page).waitFor({ state: 'detached' });
  await node(page, 'whatsapp').click();
  await node(page, 'gmail').hover();
  assert.equal(await panel(page).getByRole('heading').innerText(), 'WhatsApp Business');
  await node(page, 'gmail').click();
  assert.equal(await panel(page).getByRole('heading').innerText(), 'Gmail');
  await page.locator('#integrations-title').click();
  assert.equal(await panel(page).count(), 0);

  // Short viewport/landscape cases must flip or clamp the anchored desktop panel.
  for (const [width, height] of [
    [1440, 600],
    [844, 390],
    [390, 480],
  ]) {
    await page.setViewportSize({ width, height });
    await go(page);
    for (const [id] of tools) {
      await center(page, node(page, id));
      await node(page, id).click();
      await settle(page);
      await panelFits(page, `${width}x${height}/${id}`);
      await panel(page).getByRole('button', { name: 'Close tool details' }).click();
    }
    await accessible(page, `${width}x${height} short viewport`);
    await page.locator('#home').evaluate((el) => el.scrollIntoView({ behavior: 'instant' }));
    await install(page).click();
    const d = await page.getByRole('dialog').boundingBox();
    assert.ok(d.height <= height - 24 && d.y >= 12);
    await accessible(page, `${width}x${height} short install modal`);
    await capture(page, `short-install-${width}x${height}`);
    await page.keyboard.press('Escape');
  }

  // Normal-motion entrances are finite; only two slow illustrative dots run, with an explicit pause.
  await page.setViewportSize({ width: 1440, height: 900 });
  await page.emulateMedia({ reducedMotion: 'no-preference' });
  await go(page);
  await page.waitForFunction(() =>
    document
      .getElementById('home')
      .getAnimations({ subtree: true })
      .every((animation) => animation.playState === 'finished'),
  );
  await page.locator('#home [data-primary-cta]').hover();
  await page.waitForFunction(() =>
    getComputedStyle(document.querySelector('#home [data-primary-cta]')).transform.includes(
      '1.035',
    ),
  );
  await capture(page, 'normal-motion-hero');
  await center(page, page.getByTestId('integration-map'));
  await page.waitForFunction(
    () => document.querySelector('[data-testid="integration-map"]').dataset.motion === 'playing',
  );
  const dot = page.locator('svg[viewBox="0 0 1100 560"] > circle').first();
  const initialDistance = await dot.evaluate((el) => getComputedStyle(el).offsetDistance);
  await page.waitForFunction(
    (previous) =>
      getComputedStyle(document.querySelector('svg[viewBox="0 0 1100 560"] > circle'))
        .offsetDistance !== previous,
    initialDistance,
  );
  await page.getByRole('button', { name: 'Pause diagram animation' }).click();
  assert.equal(await dot.evaluate((el) => getComputedStyle(el).animationPlayState), 'paused');
  await page.waitForFunction(() =>
    [...document.querySelectorAll('[data-integration-node]')].every((element) =>
      element.getAnimations().every((animation) => animation.playState === 'finished'),
    ),
  );
  await accessible(page, 'normal-motion diagram paused');
  await capture(page, 'normal-motion-network-paused');
  await page.getByRole('button', { name: 'Resume diagram animation' }).click();
  assert.equal(await dot.evaluate((el) => getComputedStyle(el).animationPlayState), 'running');
  await accessible(page, 'normal-motion diagram running');
  await page.locator('#pricing').evaluate((el) => el.scrollIntoView({ behavior: 'instant' }));
  await page.waitForFunction(
    () => document.querySelector('[data-testid="integration-map"]').dataset.motion === 'paused',
  );
  await page.emulateMedia({ reducedMotion: 'reduce' });
  assert.equal(await dot.evaluate((el) => getComputedStyle(el).display), 'none');
  assert.equal(
    await page.getByTestId('hero-phone').evaluate((el) => getComputedStyle(el).animationName),
    'none',
  );

  // Native prompt outcomes are synthetic. We test lifecycle semantics, not OS installation.
  await go(page);
  for (const outcome of ['dismissed', 'accepted', 'failure']) {
    await page.evaluate((outcome) => {
      window.__installCalls = 0;
      const event = new Event('beforeinstallprompt', { cancelable: true });
      Object.assign(event, {
        __heroTest: true,
        prompt: () => {
          window.__installCalls++;
          return outcome === 'failure'
            ? Promise.reject(new Error('simulated browser refusal'))
            : Promise.resolve();
        },
        userChoice: Promise.resolve({ outcome }),
      });
      window.dispatchEvent(event);
      window.__installPrevented = event.defaultPrevented;
    }, outcome);
    assert.equal(
      await page.evaluate(() => window.__installCalls),
      0,
      'never prompts automatically',
    );
    assert.equal(await page.evaluate(() => window.__installPrevented), true);
    await install(page).click();
    await page.waitForFunction(() => window.__installCalls === 1);
    assert.equal(await install(page).count(), 1, 'acceptance/request is not installation proof');
    if (outcome === 'failure') {
      assert.match(await page.getByRole('dialog').innerText(), /could not open the install prompt/);
      await page.keyboard.press('Escape');
    } else {
      await page.waitForFunction(
        (value) => document.querySelector('#home [role="status"]').textContent.includes(value),
        outcome === 'accepted' ? 'Installation requested' : 'dismissed',
      );
      await install(page).click();
      await page.getByRole('dialog').waitFor();
      assert.equal(
        await page.evaluate(() => window.__installCalls),
        1,
        'single-use native event is not replayed',
      );
      await page.keyboard.press('Escape');
    }
  }
  await page.evaluate(() => window.dispatchEvent(new Event('appinstalled')));
  assert.equal(await install(page).count(), 0, 'known installation hides the action');
  const cache = await page.evaluate(async () => {
    const registration = await navigator.serviceWorker.ready;
    const paths = (await (await caches.open('invend-static-v6')).keys())
      .map((request) => new URL(request.url).pathname)
      .sort();
    return { scope: new URL(registration.scope).pathname, paths };
  });
  assert.deepEqual(
    cache,
    { scope: '/', paths: ['/invend-icon-192.png', '/offline.html'] },
    'homepage registration preserves the private-data-safe cache',
  );
  console.log(
    'PASS pointer travel/pinning, short windows, finite/reduced/pausable motion, synthetic install outcomes and real safe SW registration.',
  );
} finally {
  await browser.close();
}

// A fresh browser per touch case avoids the bundled single-process Chromium context-lifecycle issue.
for (const scenario of [
  {
    name: 'iphone',
    userAgent:
      'Mozilla/5.0 (iPhone; CPU iPhone OS 18_0 like Mac OS X) AppleWebKit/605.1.15 Version/18.0 Mobile/15E148 Safari/604.1',
    text: /Share menu/,
    standalone: false,
  },
  {
    name: 'android',
    userAgent:
      'Mozilla/5.0 (Linux; Android 14; Pixel 8) AppleWebKit/537.36 Chrome/130.0.0.0 Mobile Safari/537.36',
    text: /Install app or Add to Home screen/,
    standalone: false,
  },
  {
    name: 'installed-ios',
    userAgent:
      'Mozilla/5.0 (iPhone; CPU iPhone OS 18_0 like Mac OS X) AppleWebKit/605.1.15 Mobile/15E148',
    standalone: true,
  },
]) {
  const touchBrowser = await launchBrowser();
  try {
    const page = await touchBrowser.newPage({
      viewport: { width: 390, height: 844 },
      isMobile: true,
      hasTouch: true,
      userAgent: scenario.userAgent,
      reducedMotion: 'reduce',
    });
    watch(page);
    await avoidNativePromotion(page);
    if (scenario.standalone)
      await page.addInitScript(() =>
        Object.defineProperty(navigator, 'standalone', { configurable: true, get: () => true }),
      );
    await go(page);
    if (scenario.standalone) assert.equal(await install(page).count(), 0);
    else {
      await install(page).tap();
      assert.match(await page.getByRole('dialog').innerText(), scenario.text);
      await accessible(page, `${scenario.name} platform instructions`);
      await capture(page, `touch-install-${scenario.name}`);
      await page.touchscreen.tap(3, 3);
      await page.getByRole('dialog').waitFor({ state: 'hidden' });
      assert.equal(await page.evaluate(() => document.body.style.overflow), '');
      await node(page, 'whatsapp').tap();
      assert.equal(await node(page, 'whatsapp').getAttribute('aria-pressed'), 'true');
      for (let i = 0; i < 4; i++)
        await panel(page).getByRole('button', { name: 'Next tool' }).tap();
      assert.equal(await panel(page).getByRole('heading').innerText(), 'Invend WhatsApp Assistant');
      assert.match(await panel(page).innerText(), /Separate|separate/);
      await accessible(page, `${scenario.name} tapped companion panel`);
      await capture(page, `touch-assistant-${scenario.name}`);
      await panel(page).getByRole('button', { name: 'Close tool details' }).tap();
      assert.equal(await panel(page).count(), 0);
    }
    console.log(
      `PASS ${scenario.name}: browser-emulated touch/platform guidance${scenario.standalone ? ', known installed action hidden' : ', backdrop dismissal and single-panel switching'}.`,
    );
  } finally {
    await touchBrowser.close();
  }
}
assert.deepEqual(errors, [], 'no runtime errors');
assert.deepEqual(consoleErrors, [], 'no console errors');
assert.deepEqual(badAssets, [], 'no asset failures');
assert.deepEqual(privateRequests, [], 'marketing never requests tenant APIs');
await writeFile(
  join(artifacts, 'results.json'),
  JSON.stringify(
    {
      widths,
      axeScans: checks.length,
      checks,
      errors,
      consoleErrors,
      badAssets,
      privateRequests,
      assetHashes,
      limits: [
        'Local Chromium and touch/UA emulation, not physical devices or assistive-technology certification.',
        'Install prompt outcomes were simulated; actual browser/OS install approval was not performed.',
        'No live providers, deployment or external Arena preview connectivity asserted.',
      ],
    },
    null,
    2,
  ) + '\n',
);
console.log(
  `PASS: ${widths.length} widths, ${checks.length} whole-document axe scans, original logo checksums, PWA lifecycle, keyboard/touch tools, real safe SW and preserved desktop navigation.`,
);
