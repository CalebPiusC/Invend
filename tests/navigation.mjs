import assert from 'node:assert/strict';
import { mkdir, writeFile } from 'node:fs/promises';
import { join } from 'node:path';
import { launchBrowser } from './helpers/chromium.mjs';

// Local browser acceptance. No real signup, provider connection, message, payment or tenant data.
const origin = process.env.SELVORA_HOME_URL ?? 'http://localhost:3000/';
const artifacts = process.env.SELVORA_SCREENSHOT_DIR ?? '.next/invend-navigation/browser';
const widths = process.env.SELVORA_NAV_WIDTHS?.split(',').map(Number) ?? [
  320, 375, 390, 430, 768, 900, 1024, 1099, 1100, 1280, 1440, 1920,
];
const features = [
  ['inbox', 'Customer conversations', 'Smart Customer Inbox'],
  ['assistance', 'AI-assisted replies', 'AI-Assisted Customer Conversations'],
  ['catalogue', 'Product catalogue', 'Photo-First Catalogue'],
  ['orders', 'Order management', 'Order Management'],
  ['payments', 'Payment tracking', 'Payment Tracking'],
  ['receipts', 'Digital receipts', 'Digital Receipts'],
  ['insights', 'Business insights', 'Business Insights'],
  ['team', 'Team management', 'Team Management'],
];
await mkdir(artifacts, { recursive: true });
const browser = await launchBrowser();
const checks = [],
  errors = [],
  consoleErrors = [],
  badAssets = [],
  privateRequests = [];
let completed = false;
try {
  const context = await browser.newContext({ reducedMotion: 'reduce' });
  const page = await context.newPage();
  page.setDefaultTimeout(15000);
  function watch(target) {
    target.on('pageerror', (error) => errors.push(error.message));
    target.on('console', (message) => {
      if (message.type() === 'error') consoleErrors.push(message.text());
    });
    target.on('response', (response) => {
      if (
        response.status() >= 400 &&
        ['image', 'script', 'font', 'stylesheet'].includes(response.request().resourceType())
      )
        badAssets.push({ url: response.url(), status: response.status() });
    });
    target.on('request', (request) => {
      if (
        target.url().startsWith('http') &&
        new URL(target.url()).pathname === '/' &&
        new URL(request.url()).pathname.startsWith('/api/v1/')
      )
        privateRequests.push(request.url());
    });
  }
  watch(page);
  const trigger = () => page.getByRole('button', { name: 'Features', exact: true });
  const menu = () => page.getByRole('region', { name: 'Explore Invend features' });
  const dialog = () => page.getByRole('dialog', { name: 'Site navigation' });
  const mobileToggle = () => page.getByRole('button', { name: 'Open navigation' });
  const settle = () =>
    page.evaluate(
      () => new Promise((resolve) => requestAnimationFrame(() => requestAnimationFrame(resolve))),
    );
  const screenshot = (name) =>
    page.screenshot({ path: join(artifacts, `${name}.png`), animations: 'disabled' });
  const focused = (locator) => locator.evaluate((element) => element === document.activeElement);
  async function waitFocused(locator) {
    await page.waitForFunction(
      (element) => element === document.activeElement,
      await locator.elementHandle(),
    );
  }
  async function expanded(value) {
    await page.waitForFunction(
      (open) =>
        document.getElementById('features-navigation-trigger').getAttribute('aria-expanded') ===
        String(open),
      value,
    );
  }
  async function go(path = '/') {
    const response = await page.goto(new URL(path, origin).href, {
      waitUntil: 'networkidle',
      timeout: 120000,
    });
    if (response) assert.equal(response.status(), 200);
    await page.evaluate(() => document.fonts.ready);
    await page.addScriptTag({ path: 'node_modules/axe-core/axe.min.js' });
    await settle();
  }
  async function accessibility(label) {
    const result = await page.evaluate(async () => {
      const { violations } = await window.axe.run(document, {
        runOnly: { type: 'tag', values: ['wcag2a', 'wcag2aa', 'wcag21a', 'wcag21aa'] },
      });
      return {
        violations: violations.map((v) => ({
          id: v.id,
          nodes: v.nodes.map((n) => ({ target: n.target, summary: n.failureSummary })),
        })),
        overflow: document.documentElement.scrollWidth - innerWidth,
      };
    });
    checks.push({ label, ...result });
    assert.deepEqual(result.violations, [], `${label}: accessibility`);
    assert.ok(result.overflow <= 1, `${label}: horizontal overflow ${result.overflow}`);
  }
  async function openFeatures(mobile) {
    if (mobile) {
      await mobileToggle().click();
      await dialog().locator('summary').click();
    } else {
      await trigger().click();
      await expanded(true);
    }
  }
  async function selectFeature(index, mobile) {
    await openFeatures(mobile);
    if (mobile)
      await dialog()
        .getByRole('link', { name: new RegExp(`^${features[index][1]}`) })
        .click();
    else await menu().locator(`[data-feature-link="${features[index][0]}"]`).click();
    const panel = page.getByRole('tabpanel', { name: features[index][2], exact: true });
    await panel.waitFor();
    await waitFocused(panel);
    await page.waitForFunction((i) => location.hash === `#feature-panel-${i}`, index);
    await settle(); // Allow the hash-change selection/scroll effect to complete before measuring.
    const box = await panel.boundingBox();
    const header = await page.getByRole('banner').boundingBox();
    assert.ok(
      box.y >= header.y + header.height - 1,
      `panel ${index} clears floating header: ${box.y}`,
    );
    assert.equal(await page.getByRole('tabpanel').count(), 1);
    assert.equal(await page.locator('#mobile-navigation').getAttribute('open'), null);
    await expanded(false);
    assert.equal(await page.evaluate(() => document.body.style.overflow), '');
  }

  for (const width of widths) {
    const mobile = width < 1100;
    await page.setViewportSize({ width, height: width < 600 ? 844 : 900 });
    await go();
    const bar = page.getByTestId('navigation-pill');
    const initialBox = await bar.boundingBox();
    const title = await page.getByRole('heading', { level: 1 }).boundingBox();
    assert.ok(
      initialBox.y + initialBox.height + 20 < title.y,
      `${width}: header leaves the hero readable`,
    );
    assert.ok(initialBox.x >= 12 && initialBox.x + initialBox.width <= width - 12);
    assert.equal(
      await bar.evaluate((element) => getComputedStyle(element).backgroundColor),
      'rgba(0, 0, 0, 0)',
    );
    assert.match(
      await bar.evaluate((element) => getComputedStyle(element).fontFamily),
      /Plus Jakarta Sans/,
    );
    assert.equal(await page.getByRole('banner').getAttribute('data-solid'), 'false');
    if (!mobile) {
      const nav = await page.getByRole('navigation', { name: 'Main navigation' }).boundingBox();
      const brand = await page
        .getByRole('banner')
        .getByRole('link', { name: 'Invend home' })
        .boundingBox();
      const account = await page
        .getByRole('navigation', { name: 'Account navigation' })
        .boundingBox();
      assert.ok(
        Math.abs(nav.x + nav.width / 2 - width / 2) < 1,
        `${width}: central nav is genuinely centred`,
      );
      assert.ok(
        brand.x + brand.width + 24 < nav.x && nav.x + nav.width + 24 < account.x,
        `${width}: balanced non-overlapping zones`,
      );
      assert.equal(await mobileToggle().isVisible(), false);
    } else assert.equal(await trigger().isVisible(), false);
    await accessibility(`${width}: transparent header`);
    await screenshot(`top-${width}`);
    await page.evaluate(() => scrollTo({ top: 80, behavior: 'instant' }));
    await page.waitForFunction(() => document.querySelector('header').dataset.solid === 'true');
    const compactBox = await bar.boundingBox();
    assert.ok(compactBox.height < initialBox.height && compactBox.y >= 10);
    assert.equal(
      await bar.evaluate((element) => getComputedStyle(element).backgroundColor),
      'rgb(255, 254, 252)',
    );
    assert.equal(
      await bar.evaluate((element) => getComputedStyle(element).borderTopColor),
      'rgb(234, 234, 234)',
    );
    const scrolledTitle = await page.getByRole('heading', { level: 1 }).boundingBox();
    assert.ok(
      Math.abs(scrolledTitle.y + 80 - title.y) < 1,
      'scroll appearance must not move page layout',
    );
    await page
      .locator('#features')
      .evaluate((element) => element.scrollIntoView({ behavior: 'instant' }));
    await page.waitForFunction(
      () =>
        document.getElementById('features-navigation-trigger').getAttribute('aria-current') ===
        'location',
    );
    await screenshot(`scrolled-${width}`);
    await accessibility(`${width}: solid active header`);
    await page.evaluate(() => scrollTo({ top: 0, behavior: 'instant' }));
    await page.waitForFunction(() => document.querySelector('header').dataset.solid === 'false');

    if (mobile) {
      await mobileToggle().click();
      assert.equal(await page.evaluate(() => document.body.style.overflow), 'hidden');
      assert.ok(await focused(dialog().getByRole('link', { name: 'Home', exact: true })));
      assert.equal(
        await dialog().getByRole('link').count(),
        6,
        'closed details are absent from the accessibility tree',
      );
      const box = await dialog().boundingBox();
      assert.ok(
        box.x >= 12 && box.y >= 12 && box.y + box.height <= page.viewportSize().height - 11,
      );
      assert.equal(
        await dialog().evaluate((element) => element.scrollWidth > element.clientWidth),
        false,
      );
      await accessibility(`${width}: mobile drawer`);
      await screenshot(`drawer-${width}`);
      const y = await page.evaluate(() => scrollY);
      await page.mouse.move(2, 200);
      await page.mouse.wheel(0, 700);
      await settle();
      assert.equal(
        await page.evaluate(() => scrollY),
        y,
        'drawer prevents background wheel scrolling',
      );
      for (let index = 0; index < 12; index++) {
        await page.keyboard.press('Tab');
        assert.ok(
          await dialog().evaluate((element) => element.contains(document.activeElement)),
          'modal focus containment',
        );
      }
      await dialog().getByRole('link', { name: 'Get started' }).focus();
      await page.keyboard.press('Tab');
      assert.ok(await focused(dialog().getByRole('button', { name: 'Close navigation' })));
      await page.keyboard.press('Shift+Tab');
      assert.ok(await focused(dialog().getByRole('link', { name: 'Get started' })));
      await dialog().locator('summary').click();
      assert.equal(await dialog().getByRole('link').count(), 15);
      assert.equal(await dialog().getByRole('complementary').count(), 0);
      assert.equal(await dialog().getByRole('heading').count(), 4);
      await accessibility(`${width}: expanded feature categories`);
      await screenshot(`features-${width}`);
      await dialog()
        .getByRole('link', { name: /^Team management/ })
        .focus();
      await screenshot(`features-bottom-${width}`);
      await page.keyboard.press('Escape');
      assert.ok(await focused(mobileToggle()));
      assert.equal(await page.evaluate(() => document.body.style.overflow), '');
      await mobileToggle().click();
      assert.equal(
        await dialog().locator('details').getAttribute('open'),
        null,
        'reopening starts with a compact menu',
      );
      await page.mouse.click(2, 200);
      await page.waitForFunction(() => !document.getElementById('mobile-navigation').open);
      assert.ok(await focused(mobileToggle()));
    } else {
      await trigger().hover();
      await expanded(true);
      const triggerBox = await trigger().boundingBox();
      const shellBox = await menu().boundingBox();
      await page.mouse.move(triggerBox.x + triggerBox.width / 2, shellBox.y + 4);
      await page.waitForTimeout(100); // Deliberately cross the hover bridge more slowly than one frame.
      await menu().getByRole('heading', { name: 'Conversations', exact: true }).hover();
      await page.waitForTimeout(250);
      await expanded(true);
      const panel = await menu().locator(':scope > div').boundingBox();
      const aside = await menu().getByRole('complementary').boundingBox();
      assert.ok(panel.x >= 12 && panel.x + panel.width <= width - 12);
      assert.ok(
        panel.y + panel.height <= page.viewportSize().height - 12,
        'mega menu fits viewport',
      );
      assert.ok(
        aside.width / panel.width > 0.25 && aside.width / panel.width < 0.34,
        'roughly 70/30 layout',
      );
      assert.equal(await menu().getByRole('heading').count(), 4);
      assert.equal(await menu().getByRole('link').count(), 10);
      await accessibility(`${width}: feature mega menu`);
      await screenshot(`mega-${width}`);
      for (const [key] of features) {
        await menu().locator(`[data-feature-link="${key}"]`).hover();
        assert.equal(
          await menu().locator('[data-preview-feature]').getAttribute('data-preview-feature'),
          key,
        );
        if (width === 1440) {
          await accessibility(`${width}: ${key} preview`);
          await screenshot(`preview-${key}`);
        }
      }
      await page.mouse.move(width / 2, 850);
      await expanded(false);
      await trigger().click();
      await expanded(true);
      await page.mouse.move(10, 800);
      await page.waitForTimeout(250);
      await expanded(true); // Click-open menu stays pinned until a deliberate dismissal.
      await page.mouse.click(width / 2, 30);
      await expanded(false); // Blank bar is outside the menu too.
      await trigger().focus();
      await page.keyboard.press('ArrowDown');
      await expanded(true);
      await waitFocused(menu().locator('[data-feature-link="inbox"]'));
      await page.keyboard.press('ArrowRight');
      assert.ok(await focused(menu().locator('[data-feature-link="catalogue"]')));
      assert.equal(
        await menu().locator('[data-preview-feature]').getAttribute('data-preview-feature'),
        'catalogue',
      );
      const focusStyle = await menu()
        .locator('[data-feature-link="catalogue"]')
        .evaluate((element) => ({
          width: getComputedStyle(element).outlineWidth,
          color: getComputedStyle(element).outlineColor,
        }));
      assert.deepEqual(focusStyle, { width: '2px', color: 'rgb(17, 107, 73)' });
      await screenshot(`keyboard-${width}`);
      await page.keyboard.press('Home');
      await page.keyboard.press('Shift+Tab');
      assert.ok(await focused(trigger()));
      await expanded(false);
      await page.keyboard.press('Space');
      await expanded(true);
      await waitFocused(menu().locator('[data-feature-link="inbox"]'));
      for (let index = 0; index < 10; index++) await page.keyboard.press('Tab');
      assert.ok(
        await focused(
          page
            .getByRole('navigation', { name: 'Main navigation' })
            .getByRole('link', { name: 'How it works' }),
        ),
      );
      await expanded(false);
      await trigger().focus();
      await page.keyboard.press('ArrowUp');
      await expanded(true);
      await waitFocused(menu().locator('[data-feature-link="team"]'));
      await page.keyboard.press('Escape');
      await expanded(false);
      assert.ok(await focused(trigger()));
    }
    for (const index of width === 390 || width === 1440 ? [0, 1, 2, 3, 4, 5, 6, 7] : [0, 7]) {
      await selectFeature(index, mobile);
      await accessibility(`${width}: destination ${features[index][0]}`);
    }
    console.log(
      `PASS ${width}px: top/solid/active geometry, ${mobile ? 'modal/accordion/scroll lock' : 'mega menu/previews/pointer/keyboard'}, focus, destinations and accessibility.`,
    );
  }

  // Repeated deep links, a manual tour change, and history all select the existing correct panel.
  await page.setViewportSize({ width: 1440, height: 900 });
  await go('/#feature-panel-2');
  await waitFocused(page.getByRole('tabpanel', { name: features[2][2] }));
  await page.getByRole('tab', { name: features[7][2], exact: true }).click();
  await selectFeature(2, false);
  assert.equal(
    await page.locator('[role="tab"][aria-selected="true"]').getAttribute('id'),
    'feature-tab-2',
  );
  await selectFeature(4, false);
  await page.goBack();
  await waitFocused(page.getByRole('tabpanel', { name: features[2][2] }));
  await page.goForward();
  await waitFocused(page.getByRole('tabpanel', { name: features[4][2] }));

  // Crossing the breakpoint never strands focus in a now-hidden control or leaves the body locked.
  await trigger().focus();
  await page.keyboard.press('Enter');
  await waitFocused(menu().locator('[data-feature-link="inbox"]'));
  await page.setViewportSize({ width: 390, height: 844 });
  await waitFocused(mobileToggle());
  await expanded(false);
  await mobileToggle().click();
  await page.setViewportSize({ width: 1440, height: 900 });
  await waitFocused(trigger());
  assert.equal(await page.locator('#mobile-navigation').getAttribute('open'), null);
  assert.equal(await page.evaluate(() => document.body.style.overflow), '');

  for (const viewport of [
    { width: 1440, height: 600 },
    { width: 844, height: 390 },
    { width: 390, height: 480 },
  ]) {
    await page.setViewportSize(viewport);
    await go();
    await openFeatures(viewport.width < 1100);
    const panel = viewport.width < 1100 ? dialog() : menu().locator(':scope > div');
    const box = await panel.boundingBox();
    assert.ok(
      box.y >= 10 && box.y + box.height <= viewport.height - 10,
      'short viewport remains contained',
    );
    if (viewport.width < 1100) {
      await dialog()
        .getByRole('link', { name: /^Team management/ })
        .focus();
      const action = await dialog().getByRole('link', { name: 'Get started' }).boundingBox();
      assert.ok(
        action.y >= 0 && action.y + action.height < viewport.height,
        'auth actions stay reachable',
      );
    } else await menu().getByRole('link', { name: 'Explore this feature' }).focus();
    await accessibility(`${viewport.width}×${viewport.height}: short viewport`);
    await screenshot(`short-${viewport.width}-${viewport.height}`);
    await page.keyboard.press('Escape');
  }

  // Real animation states: restrained CTA scaling, menu exit retention/inertness and reduced-motion opt-out.
  await page.setViewportSize({ width: 1440, height: 900 });
  await page.emulateMedia({ reducedMotion: 'no-preference' });
  await go();
  const cta = page
    .getByRole('navigation', { name: 'Account navigation' })
    .getByRole('link', { name: 'Get started' });
  await cta.hover();
  await page.waitForTimeout(240);
  assert.match(
    await cta.evaluate((element) => getComputedStyle(element).transform),
    /^matrix\(1\.035,/,
  );
  assert.equal(
    await cta.evaluate((element) => getComputedStyle(element).color),
    'rgb(255, 255, 255)',
  );
  assert.equal(
    await cta.evaluate((element) => getComputedStyle(element).backgroundColor),
    'rgb(17, 107, 73)',
  );
  await page.mouse.down();
  await page.waitForTimeout(240);
  assert.match(
    await cta.evaluate((element) => getComputedStyle(element).transform),
    /^matrix\(0\.98,/,
  );
  await page.mouse.move(5, 200);
  await page.mouse.up();
  await trigger().focus();
  await page.keyboard.press('Enter');
  await expanded(true);
  await waitFocused(menu().locator('[data-feature-link="inbox"]'));
  await page.waitForTimeout(220);
  await page.keyboard.press('Escape');
  const exiting = await page.locator('#features-mega-menu').evaluate((element) => ({
    hidden: element.hidden,
    inert: element.inert,
    ariaHidden: element.getAttribute('aria-hidden'),
    transition: getComputedStyle(element).transitionDuration,
  }));
  assert.equal(exiting.hidden, false, 'exit animation retains the panel briefly');
  assert.equal(exiting.inert, true);
  assert.equal(exiting.ariaHidden, 'true');
  assert.match(exiting.transition, /0.18s/);
  await page.waitForFunction(() => document.getElementById('features-mega-menu').hidden);
  await page.emulateMedia({ reducedMotion: 'reduce' });
  await cta.hover();
  assert.equal(await cta.evaluate((element) => getComputedStyle(element).transform), 'none');
  assert.equal(await cta.evaluate((element) => getComputedStyle(element).transitionDuration), '0s');
  await trigger().click();
  await expanded(true);
  assert.equal(await menu().evaluate((element) => getComputedStyle(element).animationName), 'none');
  await page.keyboard.press('Escape');
  await page.evaluate(() => document.documentElement.classList.add('dark'));
  await accessibility('application dark preference keeps the navigation palette');
  await page.evaluate(() => document.documentElement.classList.remove('dark'));

  // The bundled single-process browser is unreliable with independent concurrent contexts.
  // Use a fresh process for touch emulation rather than altering application code or assertions.
  await browser.close();
  const touchBrowser = await launchBrowser();
  try {
    const touch = await touchBrowser.newContext({
      hasTouch: true,
      reducedMotion: 'reduce',
      viewport: { width: 1280, height: 900 },
    });
    const touchPage = await touch.newPage();
    watch(touchPage);
    await touchPage.goto(origin, { waitUntil: 'networkidle' });
    const touchTrigger = touchPage.getByRole('button', { name: 'Features', exact: true });
    await touchTrigger.tap();
    assert.equal(await touchTrigger.getAttribute('aria-expanded'), 'true');
    await touchTrigger.tap();
    assert.equal(await touchTrigger.getAttribute('aria-expanded'), 'false');
    await touchPage.setViewportSize({ width: 390, height: 844 });
    for (const [label, heading] of [
      ['Sign in', 'Welcome back.'],
      ['Get started', 'Create your account'],
    ]) {
      await touchPage.goto(origin, { waitUntil: 'networkidle' });
      await touchPage.getByRole('button', { name: 'Open navigation' }).tap();
      await touchPage.getByRole('dialog').getByRole('link', { name: label, exact: true }).tap();
      if (label === 'Sign in') await touchPage.getByRole('heading', { name: heading }).waitFor();
      else await touchPage.getByRole('button', { name: heading }).waitFor();
      assert.equal(
        await touchPage.getByTestId('sample-label').count(),
        0,
        'auth must not be a fabricated demo login',
      );
      assert.equal(await touchPage.evaluate(() => document.body.style.overflow), '');
    }
  } finally {
    await touchBrowser.close();
  }
  assert.deepEqual(errors, [], 'runtime errors');
  assert.deepEqual(consoleErrors, [], 'console errors');
  assert.deepEqual(badAssets, [], 'asset failures');
  assert.deepEqual(privateRequests, [], 'navigation must not request tenant APIs');
  completed = true;
  console.log(
    `PASS ${checks.length} whole-document accessibility scans; repeated hashes/history, responsive focus handoff, short viewports, motion/CTA, emulated touch/auth, no runtime/console/asset errors or private requests.`,
  );
} finally {
  await writeFile(
    join(artifacts, 'results.json'),
    JSON.stringify(
      { completed, widths, checks, errors, consoleErrors, badAssets, privateRequests },
      null,
      2,
    ),
  );
  await browser.close();
}
