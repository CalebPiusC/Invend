import assert from 'node:assert/strict';
import { mkdir } from 'node:fs/promises';
import { join } from 'node:path';
import { launchBrowser } from './helpers/chromium.mjs';

// Run against DATA_MODE=mock. No live account, provider, email or database is used.
const origin = process.env.SELVORA_TEST_URL ?? 'http://localhost:3000/app';
const artifacts = process.env.SELVORA_SCREENSHOT_DIR;
if (artifacts) await mkdir(artifacts, { recursive: true });
// This CI Chromium runs in single-process mode; give each isolated context a fresh browser.
for (const width of [390, 1440]) {
  const browser = await launchBrowser();
  try {
    const context = await browser.newContext({
      viewport: { width, height: width < 768 ? 844 : 1000 },
      isMobile: width < 768,
      hasTouch: width < 768,
      reducedMotion: 'reduce',
    });
    const page = await context.newPage();
    const errors = [];
    page.on('pageerror', (error) => errors.push(error.message));
    const goto = async (path) => {
      const response = await page.goto(new URL(path, origin).href, {
        waitUntil: 'networkidle',
        timeout: 120000,
      });
      assert.equal(response.status(), 200, path);
      await page.evaluate(() => document.fonts.ready);
    };
    const check = async (surface, hasSymbol = true) => {
      assert.doesNotMatch(await page.locator('body').innerText(), /selvora/i, surface);
      assert.doesNotMatch(await page.title(), /selvora/i, surface);
      const names = await page
        .locator('[aria-label], [alt], [title]')
        .evaluateAll((elements) =>
          elements.map((element) =>
            ['aria-label', 'alt', 'title'].map((name) => element.getAttribute(name)).join(' '),
          ),
        );
      assert.doesNotMatch(names.join('\n'), /selvora/i, surface);
      assert.ok(
        await page.evaluate(() => document.documentElement.scrollWidth <= innerWidth + 1),
        `${surface} fits ${width}px`,
      );
      if (hasSymbol) {
        await page.locator('svg[data-brand="invend"]:visible').first().waitFor();
        assert.ok(await page.locator('svg[data-brand="invend"]:visible').count(), surface);
      }
      if (artifacts) await page.screenshot({ path: join(artifacts, `${surface}-${width}.png`) });
    };

    await goto('/');
    for (const logo of await page.getByRole('link', { name: 'Invend home' }).all()) {
      assert.equal(await logo.innerText(), 'invend');
    }
    assert.equal(await page.locator('link[rel="icon"][href="/favicon.svg"]').count(), 1);
    assert.equal(await page.locator('link[rel="icon"][href="/favicon.ico"]').count(), 1);
    assert.equal(
      await page.locator('link[rel="apple-touch-icon"]').getAttribute('href'),
      '/apple-touch-icon.png',
    );
    assert.equal(
      await page.locator('meta[name="apple-mobile-web-app-title"]').getAttribute('content'),
      'Invend',
    );
    await check('homepage');

    // Seed the previous offline cache in this isolated browser context before registration.
    // Also prove that updating this app does not delete an unrelated cache.
    await page.evaluate(async () => {
      await (
        await caches.open('selvora-static-v1')
      ).put('/offline.html', new Response('<title>Selvora — Offline</title>Old offline copy'));
      await (
        await caches.open('selvora-static-v2')
      ).put('/invend-icon-192.png', new Response('previous bag icon'));
      await (await caches.open('unrelated-test-cache')).put('/unrelated', new Response('keep'));
    });

    await goto('/app?auth=sign-in');
    await page.getByRole('heading', { name: 'Welcome back.' }).waitFor();
    assert.equal(await page.getByTestId('sample-label').count(), 0);
    assert.match(await page.title(), /Invend/);
    await check('sign-in');
    await page.getByRole('button', { name: 'Switch to dark mode' }).click();
    assert.equal(await page.evaluate(() => localStorage.getItem('selvora-theme')), 'dark');
    await goto('/app?auth=sign-in');
    await page.waitForFunction(() => document.documentElement.classList.contains('dark'));
    await check('sign-in-dark');
    await page.getByRole('button', { name: 'Switch to light mode' }).click();
    await goto('/app?auth=sign-up');
    await page.getByRole('button', { name: 'Create your account' }).waitFor();
    await check('registration');

    await goto('/app');
    await page.getByText('40 conversations', { exact: true }).waitFor();
    await check('workspace');
    if (width >= 768) {
      await page.getByRole('button', { name: 'Collapse sidebar' }).click();
      const compact = page.getByRole('img', { name: 'Invend', exact: true });
      assert.equal(await compact.locator('svg[data-brand="invend"]').count(), 1);
      await check('workspace-compact');
      await page.getByRole('button', { name: 'Switch to dark mode' }).click();
      await page.waitForFunction(() => document.documentElement.classList.contains('dark'));
      await check('workspace-compact-dark');
      await page.getByRole('button', { name: 'Switch to light mode' }).click();
      await page.getByRole('button', { name: 'Expand sidebar' }).click();
    }
    const nav = page.getByRole('navigation', {
      name: width >= 768 ? 'Main navigation' : 'Mobile navigation',
    });
    await nav.getByRole('button', { name: 'Settings', exact: true }).click();
    await page.getByRole('button', { name: 'channels', exact: true }).click();
    assert.match(await page.locator('main').innerText(), /Invend’s WhatsApp helper is separate/);
    await check('channels');
    await page.getByRole('button', { name: 'Link WhatsApp helper' }).click();
    await page.getByLabel('WhatsApp link code').waitFor();
    assert.match(await page.locator('main').innerText(), /Send this code to Invend’s WhatsApp/);
    await check('helper');
    await page.getByRole('button', { name: 'Back to channels' }).click();
    await page.getByRole('button', { name: 'Try sample onboarding' }).click();
    await page.getByLabel('Business name', { exact: true }).waitFor();
    await check('onboarding');
    for (let step = 0; step < 3; step++)
      await page.getByRole('button', { name: 'Continue', exact: true }).click();
    await page.getByRole('button', { name: 'Let’s get you settled', exact: true }).click();
    await page.getByText('40 conversations', { exact: true }).waitFor();
    await check('workspace-after-onboarding');

    await goto('/invitations/accept');
    await page.getByRole('heading', { name: 'Join your Invend team' }).waitFor();
    await check('invitation', false);

    // Actual browser registration/update and offline navigation, not just the VM unit test.
    await page.evaluate(() => navigator.serviceWorker.ready);
    await page.waitForFunction(() => navigator.serviceWorker.controller !== null);
    const cachesState = await page.evaluate(async () => {
      const names = await caches.keys();
      const cache = await caches.open('selvora-static-v3');
      return {
        names,
        urls: (await cache.keys()).map((request) => new URL(request.url).pathname).sort(),
      };
    });
    assert.ok(!cachesState.names.includes('selvora-static-v1'));
    assert.ok(!cachesState.names.includes('selvora-static-v2'));
    assert.ok(cachesState.names.includes('selvora-static-v3'));
    assert.ok(cachesState.names.includes('unrelated-test-cache'));
    assert.deepEqual(cachesState.urls, ['/invend-icon-192.png', '/offline.html']);
    for (const asset of [
      '/favicon.svg',
      '/favicon.ico',
      '/apple-touch-icon.png',
      '/invend-logo.svg',
      '/invend-logo-inverse.svg',
      '/invend-icon.svg',
      '/invend-compact.svg',
      '/invend-icon-192.png',
      '/invend-icon-512.png',
    ]) {
      const response = await context.request.get(new URL(asset, origin).href);
      assert.equal(response.status(), 200, asset);
      assert.ok((await response.body()).length > 0, asset);
    }
    assert.deepEqual(errors, [], `${width}px online runtime errors`);
    await context.setOffline(true);
    await page.goto(new URL('/app?offline-brand-check=1', origin).href, { waitUntil: 'load' });
    assert.equal(await page.title(), 'Invend — Offline');
    assert.match(await page.locator('body').innerText(), /your Invend workspace/);
    await check('offline', false);
    await context.setOffline(false);
    await page.getByRole('button', { name: 'Try again' }).click();
    await page.getByTestId('sample-label').waitFor();
    await page.getByText('40 conversations', { exact: true }).waitFor();
    await check('reconnected-workspace');
    console.log(
      `PASS ${width}px: homepage/auth/onboarding/workspace/channels/helper/invitation branding, theme compatibility, favicon/app assets, real cache upgrade, offline fallback and reconnection.`,
    );
    await context.close();
  } finally {
    await browser.close();
  }
}
