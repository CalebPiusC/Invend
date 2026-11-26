import assert from 'node:assert/strict';
import { mkdir } from 'node:fs/promises';
import { join } from 'node:path';
import { launchBrowser } from './helpers/chromium.mjs';

// Run against a live dev or production server. No real accounts/providers required.
const origin = process.env.SELVORA_HOME_URL ?? 'http://localhost:3000/';
const artifacts = process.env.SELVORA_SCREENSHOT_DIR;
if (artifacts) await mkdir(artifacts, { recursive: true });
const browser = await launchBrowser();
let scans = 0;
const errors = [];
const results = [];
try {
  const context = await browser.newContext({ reducedMotion: 'reduce' });
  const page = await context.newPage();
  page.on('pageerror', (error) => errors.push(error.message));
  const businessRequests = [];
  page.on('request', (request) => {
    if (new URL(request.url()).pathname.startsWith('/api/v1/'))
      businessRequests.push(request.url());
  });

  async function fit(label) {
    const size = await page.evaluate(() => ({
      width: innerWidth,
      scroll: document.documentElement.scrollWidth,
    }));
    assert.ok(
      size.scroll <= size.width + 1,
      `${label}: horizontal overflow ${JSON.stringify(size)}`,
    );
  }
  async function accessible(label) {
    const result = await page.evaluate(() =>
      window.axe.run(document, {
        runOnly: { type: 'tag', values: ['wcag2a', 'wcag2aa', 'wcag21a', 'wcag21aa'] },
      }),
    );
    assert.deepEqual(
      result.violations.map((v) => ({ id: v.id, nodes: v.nodes.map((n) => n.target) })),
      [],
      `${label}: accessibility violations`,
    );
    scans++;
  }
  async function screenshot(name, fullPage = false) {
    if (artifacts) await page.screenshot({ path: join(artifacts, `${name}.png`), fullPage });
  }

  for (const width of [320, 390, 768, 900, 1280, 1440]) {
    await page.setViewportSize({ width, height: width < 600 ? 844 : 1000 });
    const response = await page.goto(origin, { waitUntil: 'networkidle', timeout: 120000 });
    assert.equal(response.status(), 200);
    await page.evaluate(() => document.fonts.ready);
    await page.addScriptTag({ path: 'node_modules/axe-core/axe.min.js' });
    assert.equal(await page.getByRole('heading', { level: 1 }).count(), 1);
    assert.match(await page.title(), /Selvora.*AI sales assistant/);
    assert.equal(
      await page.getByTestId('sample-label').count(),
      0,
      'public page does not inherit the sample workspace provider',
    );
    assert.equal(
      await page.evaluate(
        () => getComputedStyle(document.querySelector('main').parentElement).backgroundColor,
      ),
      'rgb(248, 249, 250)',
    );
    await page.getByAltText(/Nigerian roadside shop/).evaluate((image) => image.decode());
    await fit(`${width} homepage`);
    await accessible(`${width} homepage`);
    if (width === 390 || width === 1440) {
      await screenshot(`homepage-${width}`);
      await screenshot(`homepage-${width}-full`, true);
    }

    if (width < 900) {
      const menu = page.locator('button[aria-controls="public-mobile-menu"]');
      await menu.click();
      assert.equal(await menu.getAttribute('aria-expanded'), 'true');
      await accessible(`${width} open menu`);
      await page.keyboard.press('Escape');
      assert.equal(await menu.getAttribute('aria-expanded'), 'false');
      assert.equal(await menu.evaluate((node) => node === document.activeElement), true);
      await menu.click();
      await page
        .getByRole('navigation', { name: 'Mobile site navigation' })
        .getByRole('link', { name: 'Features', exact: true })
        .click();
      assert.equal(await menu.getAttribute('aria-expanded'), 'false');
    } else {
      await page
        .getByRole('navigation', { name: 'Main navigation' })
        .getByRole('link', { name: 'Features', exact: true })
        .click();
    }
    const featureTop = await page
      .locator('#features')
      .evaluate((element) => element.getBoundingClientRect().top);
    assert.ok(featureTop >= 70 && featureTop < 150, `anchor clears sticky header: ${featureTop}`);

    for (let i = 0; i < 4; i++) {
      await page.getByRole('tab').nth(i).click();
      assert.equal(await page.getByRole('tab').nth(i).getAttribute('aria-selected'), 'true');
      await page.getByRole('tabpanel').scrollIntoViewIfNeeded();
      if (i === 0)
        await page.getByAltText(/demonstration photo/).evaluate((image) => image.decode());
      await fit(`${width} walkthrough ${i}`);
      await accessible(`${width} walkthrough ${i}`);
      if (i === 2) {
        await page.getByRole('button', { name: 'Try approving this reply' }).click();
        assert.equal(
          await page.getByRole('button', { name: 'Approved in this demo' }).isDisabled(),
          true,
        );
        assert.match(await page.getByRole('status').textContent(), /No message was sent/);
        await page.getByRole('button', { name: 'Reset demo' }).click();
      }
      if (i === 3)
        assert.equal(await page.getByText('Payment not confirmed', { exact: true }).count(), 1);
    }
    await page.getByRole('tab').first().focus();
    await page.keyboard.press('End');
    assert.equal(
      await page
        .getByRole('tab')
        .last()
        .evaluate((element) => element === document.activeElement),
      true,
    );
    await page.keyboard.press('Home');
    assert.equal(
      await page
        .getByRole('tab')
        .first()
        .evaluate((element) => element === document.activeElement),
      true,
    );

    for (const detail of await page.locator('details').all()) {
      await detail.locator('summary').click();
      assert.equal(await detail.evaluate((element) => element.open), true);
      await fit(`${width} expanded FAQ`);
      await detail.locator('summary').click();
    }
    await page.getByRole('link', { name: 'Back to top ↑', exact: true }).click();
    const headingTop = await page
      .getByRole('heading', { level: 1 })
      .evaluate((element) => element.getBoundingClientRect().top);
    const headerBottom = await page
      .getByRole('banner')
      .evaluate((element) => element.getBoundingClientRect().bottom);
    assert.ok(headingTop >= headerBottom, `${width}: back-to-top heading hidden by sticky header`);
    results.push(
      `${width}px: navigation, all four demos, approval/reset, keyboard, FAQs, back-to-top, no overflow`,
    );
  }

  assert.deepEqual(
    businessRequests,
    [],
    'homepage and demonstrations never call private business APIs',
  );
  assert.deepEqual(errors, [], 'homepage must have no runtime page errors');

  // Every public internal link has a real anchor or the preserved workspace entry.
  for (const href of await page
    .locator('a[href]')
    .evaluateAll((links) => links.map((link) => link.getAttribute('href')))) {
    if (href.startsWith('#'))
      assert.equal(await page.locator(`[id="${href.slice(1)}"]`).count(), 1, href);
    else
      assert.ok(
        href === '/' ||
          href === '/app' ||
          href === '/app?auth=sign-in' ||
          href === '/app?auth=sign-up',
        `unexpected/dead homepage link: ${href}`,
      );
  }

  // Existing auth and utility routes remain usable, without converting account CTAs into demo logins.
  await page.goto(new URL('/app?auth=sign-in', origin).href, { waitUntil: 'networkidle' });
  await page.getByRole('heading', { name: 'Welcome back.' }).waitFor();
  assert.equal(await page.getByTestId('sample-label').count(), 0);
  await page.goto(new URL('/app?auth=sign-up', origin).href, { waitUntil: 'networkidle' });
  await page.getByRole('button', { name: 'Create your account' }).waitFor();
  assert.equal(await page.getByTestId('sample-label').count(), 0);

  const callback = await context.request.get(new URL('/auth/callback', origin).href, {
    maxRedirects: 0,
  });
  assert.ok([302, 303, 307, 308].includes(callback.status()));
  assert.match(callback.headers().location, /\/app\?auth=sign-in&auth_error=1$/);

  await page.goto(new URL('/invitations/accept', origin).href, { waitUntil: 'networkidle' });
  assert.equal(
    await page.getByRole('link', { name: 'Open sign in in a new tab' }).getAttribute('href'),
    '/app?auth=sign-in',
  );
  const receipt = await page.goto(new URL('/receipts/shared', origin).href, {
    waitUntil: 'networkidle',
  });
  assert.equal(receipt.status(), 200);
  assert.match(
    await page.getByRole('main').getByRole('alert').textContent(),
    /invalid, expired, revoked/,
  );
  assert.match(receipt.headers()['cache-control'], /no-store/);

  const manifest = await (
    await context.request.get(new URL('/manifest.webmanifest', origin).href)
  ).json();
  assert.equal(manifest.id, '/');
  assert.equal(manifest.start_url, '/app');

  // Smoke the retained app rather than substituting a static homepage demo for it.
  await page.goto(new URL('/app', origin).href, { waitUntil: 'networkidle' });
  await page.getByTestId('sample-label').waitFor();
  const nav = page.getByRole('navigation', { name: 'Main navigation' });
  for (const tab of ['Orders', 'Catalogue', 'Insights', 'Settings', 'Inbox']) {
    await nav.getByRole('button', { name: tab, exact: true }).click();
    await page.getByRole('region', { name: `${tab} screen`, exact: true }).waitFor();
  }
  assert.deepEqual(errors, [], 'preserved route smoke must have no runtime errors');
  console.log(results.join('\n'));
  console.log(
    `PASS: ${scans} axe scans; private-data isolation, accurate demo actions, auth/utility redirects, receipt privacy, manifest continuity and five existing app destinations.`,
  );
  await context.close();
} finally {
  await browser.close();
}
