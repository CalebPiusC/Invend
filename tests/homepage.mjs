import assert from 'node:assert/strict';
import { mkdir, writeFile } from 'node:fs/promises';
import { join } from 'node:path';
import { launchBrowser } from './helpers/chromium.mjs';
import { fullPageScreenshot } from './helpers/full-page-screenshot.mjs';

// Local browser verification only. No live provider, account creation, message or payment.
const origin = process.env.INVEND_HOME_URL ?? 'http://localhost:3000/';
const artifacts = process.env.INVEND_SCREENSHOT_DIR;
const widths = process.env.INVEND_HOME_WIDTHS?.split(',').map(Number) ?? [
  320, 375, 390, 430, 768, 900, 1024, 1100, 1280, 1440, 1920,
];
if (artifacts) await mkdir(artifacts, { recursive: true });
const browser = await launchBrowser();
const checks = [];
const errors = [];
const badAssets = [];
const businessRequests = [];
const featureNames = [
  'Smart Customer Inbox',
  'AI-Assisted Customer Conversations',
  'Photo-First Catalogue',
  'Order Management',
  'Payment Tracking',
  'Digital Receipts',
  'Business Insights',
  'Team Management',
];
const navigation = [
  ['Home', '#home'],
  ['Features', '#features'],
  ['How it works', '#how-it-works'],
  ['Pricing', '#pricing'],
  ['About', '#about'],
  ['Sign in', '/app?auth=sign-in'],
  ['Get started', '/app?auth=sign-up'],
];
let scans = 0;
try {
  const context = await browser.newContext({ reducedMotion: 'reduce' });
  const page = await context.newPage();
  page.setDefaultTimeout(15000);
  page.on('pageerror', (error) => errors.push(error.message));
  page.on('request', (request) => {
    if (
      new URL(page.url()).pathname === '/' &&
      new URL(request.url()).pathname.startsWith('/api/v1/')
    )
      businessRequests.push(request.url());
  });
  page.on('response', (response) => {
    if (
      response.status() >= 400 &&
      ['image', 'stylesheet', 'script', 'font'].includes(response.request().resourceType())
    )
      badAssets.push({ url: response.url(), status: response.status() });
  });
  const settle = () =>
    page.evaluate(
      () => new Promise((resolve) => requestAnimationFrame(() => requestAnimationFrame(resolve))),
    );
  async function go(path = '/') {
    const previousDocument = page.url().split('#')[0];
    const response = await page.goto(new URL(path, origin).href, {
      waitUntil: 'networkidle',
      timeout: 120000,
    });
    if (response) assert.equal(response.status(), 200, path);
    else
      assert.equal(
        page.url().split('#')[0],
        previousDocument,
        'only a same-document navigation has no HTTP response',
      );
    await page.evaluate(() => document.fonts.ready);
    return response;
  }
  async function fit(label) {
    const dimensions = await page.evaluate(() => ({
      width: innerWidth,
      scroll: document.documentElement.scrollWidth,
    }));
    assert.ok(
      dimensions.scroll <= dimensions.width + 1,
      `${label}: overflow ${JSON.stringify(dimensions)}`,
    );
  }
  async function accessible(label) {
    const result = await page.evaluate(() =>
      window.axe.run(document, {
        runOnly: { type: 'tag', values: ['wcag2a', 'wcag2aa', 'wcag21a', 'wcag21aa'] },
      }),
    );
    const violations = result.violations.map((v) => ({
      id: v.id,
      nodes: v.nodes.map((n) => ({ target: n.target, summary: n.failureSummary })),
    }));
    checks.push({ label, violations });
    assert.deepEqual(violations, [], `${label}: accessibility`);
    scans++;
    await fit(label);
  }
  async function capture(name, locator) {
    if (!artifacts) return;
    if (locator)
      await locator.screenshot({
        path: join(artifacts, `${name}.png`),
        animations: 'disabled',
        // Component-only captures exclude fixed chrome. Offscreen fixed elements can be
        // painted into beyond-viewport crops by the bundled headless compositor.
        style: 'header, a[href="#main-content"]:not(:focus) { visibility: hidden; }',
      });
    else await page.screenshot({ path: join(artifacts, `${name}.png`), animations: 'disabled' });
  }
  async function scrollTo(selector) {
    await page
      .locator(selector)
      .evaluate((element) => element.scrollIntoView({ block: 'start', behavior: 'instant' }));
    await settle();
  }
  async function selectFeature(index, width) {
    if (width < 900)
      await page.getByRole('combobox', { name: /Choose a feature/ }).selectOption(String(index));
    else await page.getByRole('tab', { name: featureNames[index], exact: true }).click();
    const panel = page.getByRole('tabpanel', { name: featureNames[index], exact: true });
    await panel.waitFor();
    assert.equal(await page.getByRole('tabpanel').count(), 1);
    assert.equal(await page.locator('[role="tab"][aria-selected="true"]').count(), 1);
    return panel;
  }

  for (const width of widths) {
    await page.setViewportSize({ width, height: width < 600 ? 844 : 1000 });
    await go('/');
    await page.addScriptTag({ path: 'node_modules/axe-core/axe.min.js' });
    await settle();
    assert.equal(await page.getByRole('heading', { level: 1 }).count(), 1);
    assert.match(await page.title(), /Invend.*One workspace/);
    assert.doesNotMatch(await page.locator('body').innerText(), /selvora/i);
    assert.equal(await page.getByTestId('sample-label').count(), 0);
    const hero = await page.locator('#home').boundingBox();
    const heroCopy = await page.locator('#home > div').first().boundingBox();
    const height = page.viewportSize().height;
    const phone = await page.getByTestId('hero-phone').boundingBox();
    const dashboard = await page.getByTestId('hero-dashboard').boundingBox();
    const caption = await page.getByTestId('workspace-preview').locator('figcaption').boundingBox();
    assert.ok(
      heroCopy.y + heroCopy.height < height,
      `${width}: opening copy and CTAs fit the initial viewport`,
    );
    assert.equal(await page.locator('#home [data-testid="workspace-preview"]').count(), 1);
    assert.equal(await page.locator('#home + section').getAttribute('id'), 'integrations');
    assert.ok(
      phone.width >= 260 && phone.width <= 340,
      `${width}: phone is a prominent, deliberately mobile interface`,
    );
    assert.ok(
      phone.x + phone.width > dashboard.x + dashboard.width - 30,
      `${width}: phone overlaps towards the right`,
    );
    assert.ok(
      caption.y >= phone.y + phone.height + 8,
      `${width}: illustration caption clears the phone`,
    );
    assert.ok(
      hero.height > heroCopy.height + 500,
      `${width}: product showcase is part of the hero`,
    );
    if (width >= 1100) {
      assert.ok(
        phone.y < height - 180 && dashboard.y < height - 130,
        `${width}: upper product showcase is visible without scrolling`,
      );
    }
    assert.equal(
      await page.getByTestId('workspace-preview').getByRole('button').count(),
      0,
      'illustrations never impersonate functional product controls',
    );
    await page.waitForFunction(() => document.querySelector('header').dataset.solid === 'false');
    assert.equal(await page.locator('meta[name="theme-color"]').getAttribute('content'), '#FFFEFC');
    for (const [selector, colour] of Object.entries({
      '#home': 'rgb(255, 254, 252)',
      '#integrations': 'rgb(247, 247, 245)',
      '#the-problem': 'rgb(255, 248, 230)',
      '#features': 'rgb(255, 255, 255)',
      '#pricing': 'rgb(255, 254, 250)',
      '[aria-labelledby="start-title"]': 'rgb(28, 28, 28)',
    })) {
      assert.equal(
        await page
          .locator(selector)
          .evaluate((element) => getComputedStyle(element).backgroundColor),
        colour,
      );
    }
    await accessible(`${width} initial homepage`);
    await capture(`hero-${width}`);

    const mobile = width < 1100;
    const toggle = page.getByRole('button', { name: 'Open navigation' });
    let nav;
    if (mobile) {
      await toggle.click();
      const dialog = page.getByRole('dialog', { name: 'Site navigation' });
      nav = dialog.getByRole('navigation', { name: 'Mobile navigation' });
      assert.equal(await page.evaluate(() => document.body.style.overflow), 'hidden');
      assert.equal(
        await nav
          .getByRole('link')
          .first()
          .evaluate((element) => element === document.activeElement),
        true,
      );
      assert.deepEqual(
        await nav
          .getByRole('link')
          .evaluateAll((links) => links.map((link) => link.getAttribute('href'))),
        navigation.filter(([name]) => name !== 'Features').map(([, href]) => href),
      );
      assert.equal(await nav.locator('details > summary').innerText(), 'Features');
      for (let i = 0; i < 12; i++) {
        await page.keyboard.press('Tab');
        assert.equal(
          await dialog.evaluate((element) => element.contains(document.activeElement)),
          true,
          `${width} native modal focus containment`,
        );
      }
      await accessible(`${width} mobile drawer`);
      await capture(`navigation-${width}`);
      await page.keyboard.press('Escape');
      assert.equal(await toggle.getAttribute('aria-expanded'), 'false');
      assert.equal(await toggle.evaluate((element) => element === document.activeElement), true);
      assert.equal(await page.evaluate(() => document.body.style.overflow), '');
    } else {
      nav = page.getByRole('navigation', { name: 'Main navigation' });
      assert.deepEqual(
        await nav.evaluate((element) =>
          [...element.children].map((control) => control.textContent.trim()),
        ),
        navigation.slice(0, 5).map(([name]) => name),
      );
      assert.equal(
        await nav.getByRole('button', { name: 'Features' }).getAttribute('aria-expanded'),
        'false',
      );
      assert.deepEqual(
        await page
          .getByRole('navigation', { name: 'Account navigation' })
          .getByRole('link')
          .evaluateAll((links) =>
            links.map((link) => [link.textContent.trim(), link.getAttribute('href')]),
          ),
        navigation.slice(5),
      );
    }
    // Exercise all five section links, not just their hrefs; test active section and header clearance.
    for (const [name, href] of navigation.slice(0, 5)) {
      if (mobile) {
        await toggle.click();
        nav = page.getByRole('navigation', { name: 'Mobile navigation' });
      }
      if (href === '#features') {
        if (mobile) {
          await nav.locator('details > summary').click();
          await nav.getByRole('link', { name: 'Explore all features' }).click();
        } else {
          await nav.getByRole('button', { name: 'Features' }).click();
          await page
            .getByRole('region', { name: 'Explore Invend features' })
            .getByRole('link', { name: 'See all features' })
            .click();
        }
      } else await nav.locator(`a[href="${href}"]`).click();
      if (mobile) assert.equal(await toggle.getAttribute('aria-expanded'), 'false');
      await page.waitForFunction(
        (hash) =>
          document
            .querySelector(
              hash === '#features'
                ? '#features-navigation-trigger'
                : `nav[aria-label="Main navigation"] a[href="${hash}"]`,
            )
            .getAttribute('aria-current') === 'location',
        href,
      );
      await settle();
      if (href !== '#home') {
        const top = await page
          .locator(href)
          .evaluate((element) => element.getBoundingClientRect().top);
        const bottom = await page
          .getByRole('banner')
          .evaluate((element) => element.getBoundingClientRect().bottom);
        assert.ok(top >= bottom - 1 && top < 150, `${width} ${name} clears header: ${top}`);
        assert.equal(await page.getByRole('banner').getAttribute('data-solid'), 'true');
      }
    }
    // A large native jump from outside every observed nav section must not retain About.
    await scrollTo('footer');
    await page.waitForFunction(
      () =>
        document
          .querySelector('nav[aria-label="Main navigation"] a[href="#about"]')
          .getAttribute('aria-current') === 'location',
    );
    await scrollTo('#workspace');
    await page.waitForFunction(
      () =>
        document
          .querySelector('nav[aria-label="Main navigation"] a[href="#home"]')
          .getAttribute('aria-current') === 'location',
    );
    assert.equal(
      await page.getByRole('banner').getAttribute('data-solid'),
      'true',
      `${width}: the floating header is solid over the hero product showcase`,
    );
    // Native scroll (not link state) updates the active nav; returning to the hero restores transparency.
    await scrollTo('#features');
    await page.waitForFunction(
      () =>
        document.querySelector('#features-navigation-trigger').getAttribute('aria-current') ===
        'location',
    );
    if (width >= 900) {
      const tabs = page.getByRole('tab');
      await tabs.first().focus();
      await page.keyboard.press('ArrowDown');
      assert.equal(
        await tabs.nth(1).evaluate((element) => element === document.activeElement),
        true,
      );
      await page.keyboard.press('End');
      assert.equal(await tabs.nth(7).getAttribute('aria-selected'), 'true');
      await page.keyboard.press('ArrowRight');
      assert.equal(await tabs.first().getAttribute('aria-selected'), 'true');
      await page.keyboard.press('Tab');
      assert.equal(
        await page.getByRole('tabpanel').evaluate((element) => element === document.activeElement),
        true,
      );
    }
    const inbox = await selectFeature(0, width);
    await inbox.getByRole('button', { name: /Lola Adeyemi/ }).click();
    assert.match(await inbox.innerText(), /WhatsApp · fictional conversation/);
    await inbox.getByRole('button', { name: /Chidi Okafor/ }).click();
    assert.match(await inbox.innerText(), /Yaba, Lagos · delivery enquiry/);
    await accessible(`${width} inbox selection`);

    const assistance = await selectFeature(1, width);
    assert.match(await assistance.getByRole('status').innerText(), /₦2,000 below your minimum/);
    await assistance.getByRole('button', { name: '₦22,000', exact: true }).click();
    assert.match(await assistance.getByRole('status').innerText(), /Inside your price boundary/);
    await accessible(`${width} price boundary`);

    const catalogue = await selectFeature(2, width);
    await catalogue.getByRole('button', { name: 'Review sample details' }).click();
    const confirmProduct = catalogue.getByRole('button', { name: 'Confirm sample product' });
    assert.equal(await confirmProduct.isDisabled(), true);
    await catalogue.getByRole('checkbox').check();
    await catalogue.getByRole('button', { name: 'Increase sample stock' }).click();
    assert.equal(
      await catalogue.getByRole('status', { name: 'Sample stock count' }).textContent(),
      '13',
    );
    assert.equal(await catalogue.getByRole('checkbox').isChecked(), false);
    assert.equal(await confirmProduct.isDisabled(), true);
    await catalogue.getByRole('checkbox').check();
    await confirmProduct.click();
    assert.match(
      await catalogue.getByRole('status', { name: 'Sample product review' }).innerText(),
      /No product or photo was saved/,
    );
    await accessible(`${width} catalogue review and confirmation`);
    if (width === 390 || width === 1440) await capture(`catalogue-${width}`, catalogue);
    await catalogue.getByRole('button', { name: 'Reset', exact: true }).click();

    const order = await selectFeature(3, width);
    await order.getByRole('button', { name: 'Create sample draft' }).click();
    await order.getByRole('button', { name: 'Review sample order' }).click();
    assert.match(await order.innerText(), /Payment not confirmed/);
    await accessible(`${width} order review`);
    await order.getByRole('button', { name: 'Explore payment tracking' }).click();
    const payment = page.getByRole('tabpanel', { name: 'Payment Tracking' });
    await payment.waitFor();
    await payment.getByRole('button', { name: 'Test a payment screenshot' }).click();
    assert.match(await payment.getByRole('status').innerText(), /Payment is still unconfirmed/);
    assert.equal(
      await payment.getByRole('button', { name: 'Record sample confirmation' }).isDisabled(),
      true,
    );
    await accessible(`${width} unverified screenshot`);
    await selectFeature(5, width);
    assert.equal(
      await page.getByRole('tabpanel').getByText('SAMPLE RECEIPT', { exact: true }).count(),
      0,
    );
    await page.getByRole('button', { name: 'Review sample payment' }).click();
    await payment.getByRole('checkbox').check();
    await payment.getByRole('button', { name: 'Record sample confirmation' }).click();
    assert.match(await payment.getByRole('status').innerText(), /No real transfer was verified/);
    await payment.getByRole('button', { name: 'View sample receipt' }).click();
    const receipt = page.getByRole('tabpanel', { name: 'Digital Receipts' });
    assert.equal(await receipt.getByText('SAMPLE RECEIPT', { exact: true }).count(), 1);
    assert.equal(await receipt.getByText('₦23,500', { exact: true }).count(), 1);
    assert.match(await receipt.innerText(), /Not proof of a real payment/);
    await accessible(`${width} confirmation-gated receipt`);
    if (width === 390 || width === 1440) await capture(`receipt-${width}`, receipt);
    await selectFeature(4, width);
    await payment.getByRole('button', { name: 'Reset', exact: true }).click();
    await selectFeature(5, width);
    assert.equal(
      await page.getByRole('tabpanel').getByText('SAMPLE RECEIPT', { exact: true }).count(),
      0,
    );

    const insights = await selectFeature(6, width);
    await insights.getByRole('button', { name: 'Conversations', exact: true }).click();
    assert.match(
      await insights.getByRole('img').getAttribute('aria-label'),
      /Total 22. Not business performance/,
    );
    await accessible(`${width} fictional insights`);
    const team = await selectFeature(7, width);
    await team.getByRole('combobox').selectOption('Bisi');
    assert.match(await team.getByRole('status').innerText(), /Assigned to Bisi in this demo/);
    await team.getByRole('button', { name: 'Take over sample conversation' }).click();
    assert.match(await team.innerText(), /Assistant replies paused/);
    await accessible(`${width} assigned human takeover`);
    await team.getByRole('button', { name: 'Hand back to assistant' }).click();
    assert.match(await team.getByRole('status').innerText(), /Rule-bound assistance can resume/);

    const owner = page.getByTestId('owner-decision-demo');
    await owner.getByRole('button', { name: 'Edit', exact: true }).click();
    await owner.getByRole('textbox', { name: /Counter-offer/ }).fill('20000');
    await owner.getByRole('button', { name: 'Save sample edit' }).click();
    assert.match(await owner.getByRole('alert').innerText(), /between ₦22,000 and ₦24,000/);
    await accessible(`${width} owner edit validation`);
    await owner.getByRole('textbox', { name: /Counter-offer/ }).fill('23000.50');
    await owner.getByRole('button', { name: 'Save sample edit' }).click();
    assert.match(await owner.innerText(), /₦23,000.50/);
    assert.equal(
      await owner
        .getByRole('button', { name: 'Approve', exact: true })
        .evaluate((element) => element === document.activeElement),
      true,
    );
    await owner.getByRole('button', { name: 'Approve', exact: true }).click();
    assert.match(await owner.getByRole('status').innerText(), /No message sent. No order saved/);
    await accessible(`${width} owner approval`);
    if (width === 390 || width === 1440) await capture(`owner-approved-${width}`, owner);
    await owner.getByRole('button', { name: 'Reset example' }).click();
    await owner.getByRole('button', { name: 'Reject', exact: true }).click();
    assert.match(await owner.getByRole('status').innerText(), /proposed reply was not sent/);
    await accessible(`${width} owner rejection`);
    await owner.getByRole('button', { name: 'Reset example' }).click();

    await page.locator('#integration-readiness > summary').click();
    const integration = page.getByTestId('integration-status');
    assert.equal(await integration.getByRole('listitem').count(), 7);
    assert.match(
      await integration.getByRole('listitem').nth(0).innerText(),
      /WhatsApp Business.*Second major channel/s,
    );
    assert.match(
      await integration.getByRole('listitem').nth(1).innerText(),
      /Gmail.*First planned live channel/s,
    );
    assert.match(
      await integration.getByRole('listitem').nth(4).innerText(),
      /Invend WhatsApp Assistant.*explicit YES confirmation/s,
    );
    assert.match(
      await integration.getByRole('listitem').nth(5).innerText(),
      /Available.*not a third-party connection/s,
    );
    assert.match(
      await integration.getByRole('listitem').nth(6).innerText(),
      /CSV\/XLSX export is not implemented/,
    );
    assert.match(await integration.innerText(), /TikTok messaging remains research-only/);
    assert.match(await integration.innerText(), /SMS is exploratory and unsupported/);
    await accessible(`${width} honest integration readiness`);
    await page.locator('#integration-readiness > summary').click();
    assert.match(await page.locator('#pricing').innerText(), /Not yet published/);
    assert.doesNotMatch(
      await page.locator('#pricing').innerText(),
      /Starter|Growth|Scale|₦|free trial|recommended|most popular/i,
    );
    for (const details of await page.getByTestId('homepage-faq').locator('details').all())
      await details.locator('summary').click();
    await accessible(`${width} expanded FAQs`);
    for (const details of await page.getByTestId('homepage-faq').locator('details').all())
      await details.locator('summary').click();
    for (const href of await page
      .locator('a[href]')
      .evaluateAll((links) => links.map((link) => link.getAttribute('href')))) {
      if (href.startsWith('#'))
        assert.equal(await page.locator(`[id="${href.slice(1)}"]`).count(), 1, href);
      else
        assert.ok(
          ['/app', '/app?auth=sign-in', '/app?auth=sign-up'].includes(href),
          `real destination: ${href}`,
        );
    }
    await page.getByRole('link', { name: 'Back to top', exact: true }).click();
    await page.waitForFunction(
      () => window.scrollY < 2 && document.querySelector('header').dataset.solid === 'false',
    );
    assert.equal(
      await page
        .getByRole('banner')
        .evaluate((element) => getComputedStyle(element).backgroundColor),
      'rgba(0, 0, 0, 0)',
    );
    assert.equal(
      await page.evaluate(() => getComputedStyle(document.documentElement).scrollBehavior),
      'auto',
    );
    assert.equal(
      await page
        .locator('#home > div')
        .first()
        .evaluate((element) => getComputedStyle(element).animationName),
      'none',
    );
    assert.equal(
      await page
        .getByTestId('workflow-stack')
        .locator(':scope > li')
        .first()
        .evaluate((element) => getComputedStyle(element).position),
      'relative',
    );
    if (width === 390 || width === 1440) {
      await selectFeature(0, width);
      await page.evaluate(() => window.scrollTo({ top: 0, behavior: 'instant' }));
      await fullPageScreenshot(page, join(artifacts ?? '.next', `homepage-${width}-full.png`));
      for (const id of [
        'workspace',
        'the-problem',
        'the-solution',
        'features',
        'how-it-works',
        'owner-control',
        'integrations',
        'pricing',
        'about',
      ]) {
        await capture(`${id}-${width}`, page.locator(`#${id}`));
      }
      await go('/#smart-catalogue');
      assert.equal((await page.reload({ waitUntil: 'networkidle' })).status(), 200);
      await page.getByRole('tabpanel', { name: 'Photo-First Catalogue' }).waitFor();
      await page.waitForFunction(() => {
        const y = document
          .querySelector('[data-testid="feature-tour"]')
          .getBoundingClientRect().top;
        return y >= 70 && y < 250;
      });
      const linkedY = await page
        .getByTestId('feature-tour')
        .evaluate((element) => element.getBoundingClientRect().top);
      assert.ok(
        linkedY >= 70 && linkedY < 250,
        `legacy anchor retains a usable scroll position: ${linkedY}`,
      );
    }
    console.log(
      `PASS ${width}px: phone-first integrated hero, seven navigation destinations, eight feature previews, owner decisions, payment/receipt gates, disclosures, reduced motion and no overflow.`,
    );
  }

  // Actual normal-motion sticky stacking, not normalised screenshots or style-only assertions.
  await page.emulateMedia({ reducedMotion: 'no-preference' });
  for (const width of [1024, 1440, 1920]) {
    await page.setViewportSize({ width, height: 1000 });
    await go('/');
    const cards = page.getByTestId('workflow-stack').locator(':scope > li');
    const target = await cards
      .last()
      .evaluate((element) => element.getBoundingClientRect().top + scrollY - 205);
    await page.evaluate((y) => window.scrollTo({ top: y, behavior: 'instant' }), target);
    await settle();
    const boxes = await cards.evaluateAll((elements) =>
      elements.map((element) => {
        const rect = element.getBoundingClientRect();
        return { top: rect.top, bottom: rect.bottom, position: getComputedStyle(element).position };
      }),
    );
    assert.ok(
      boxes.every((box) => box.position === 'sticky'),
      `${width} sticky panels`,
    );
    for (let i = 1; i < boxes.length; i++) {
      assert.ok(
        boxes[i].top > boxes[i - 1].top + 25 && boxes[i].top < boxes[i - 1].top + 50,
        `${width} progressive overlap: ${JSON.stringify(boxes)}`,
      );
      assert.ok(
        boxes[i - 1].bottom > boxes[i].top + 150,
        `${width} earlier panel overlaps, not separate columns`,
      );
    }
    await capture(`stacking-${width}`);
    await fit(`${width} stacked panels`);
    const before = await page.evaluate(() => scrollY);
    await page.mouse.wheel(0, 320);
    await page.waitForFunction((y) => scrollY > y + 100, before);
    await scrollTo('footer');
    await page.waitForFunction(
      () =>
        document
          .querySelector('nav[aria-label="Main navigation"] a[href="#about"]')
          .getAttribute('aria-current') === 'location',
    );
    await scrollTo('#workspace');
    await page.waitForFunction(
      () =>
        document.querySelector('header').dataset.solid === 'true' &&
        document
          .querySelector('nav[aria-label="Main navigation"] a[href="#home"]')
          .getAttribute('aria-current') === 'location',
    );
    await capture(`phone-dashboard-${width}`);
  }
  await page.setViewportSize({ width: 390, height: 844 });
  await go('/');
  assert.equal(
    await page
      .getByTestId('workflow-stack')
      .locator(':scope > li')
      .first()
      .evaluate((element) => getComputedStyle(element).position),
    'relative',
  );
  await page.getByRole('button', { name: 'Open navigation' }).click();
  await page.setViewportSize({ width: 1440, height: 650 });
  await page.waitForFunction(() => !document.querySelector('dialog').open);
  assert.equal(await page.evaluate(() => document.body.style.overflow), '');
  assert.equal(
    await page
      .getByTestId('workflow-stack')
      .locator(':scope > li')
      .first()
      .evaluate((element) => getComputedStyle(element).position),
    'relative',
  );
  await page.setViewportSize({ width: 1440, height: 1000 });
  await go('/');
  await page.addScriptTag({ path: 'node_modules/axe-core/axe.min.js' });
  await accessible('normal-motion desktop');
  await page.evaluate(() => document.documentElement.classList.add('dark'));
  await accessible('marketing remains light with an application dark preference');
  await page.evaluate(() => document.documentElement.classList.remove('dark'));
  assert.deepEqual(businessRequests, [], 'marketing must never call private tenant APIs');
  assert.deepEqual(badAssets, [], 'all requested assets load');
  assert.deepEqual(errors, [], 'homepage runtime errors');

  // Auth destinations are exercised through actual links, never a fabricated login.
  await page
    .getByRole('navigation', { name: 'Account navigation' })
    .getByRole('link', { name: 'Sign in', exact: true })
    .click();
  await page.getByRole('heading', { name: 'Welcome back.' }).waitFor();
  assert.equal(await page.getByTestId('sample-label').count(), 0);
  assert.equal(await page.locator('meta[name="theme-color"]').getAttribute('content'), '#242066');
  await go('/');
  await page
    .getByRole('navigation', { name: 'Account navigation' })
    .getByRole('link', { name: 'Get started', exact: true })
    .click();
  await page.getByRole('button', { name: 'Create your account' }).waitFor();
  assert.equal(await page.getByTestId('sample-label').count(), 0);
  const callback = await context.request.get(new URL('/auth/callback', origin).href, {
    maxRedirects: 0,
  });
  assert.ok([302, 303, 307, 308].includes(callback.status()));
  assert.match(callback.headers().location, /\/app\?auth=sign-in&auth_error=1$/);
  await go('/invitations/accept');
  assert.equal(
    await page.getByRole('link', { name: 'Open sign in in a new tab' }).getAttribute('href'),
    '/app?auth=sign-in',
  );
  const shared = await go('/receipts/shared');
  assert.match(
    await page.getByRole('main').getByRole('alert').innerText(),
    /invalid, expired, revoked/,
  );
  assert.match(shared.headers()['cache-control'], /no-store/);
  const manifest = await (
    await context.request.get(new URL('/manifest.webmanifest', origin).href)
  ).json();
  assert.equal(manifest.id, '/');
  assert.equal(manifest.start_url, '/app');
  assert.equal(manifest.theme_color, '#242066');
  assert.equal(manifest.background_color, '#F8FAFC');
  await go('/app');
  await page.getByTestId('sample-label').waitFor();
  const appNav = page.getByRole('navigation', { name: 'Main navigation' });
  for (const tab of ['Orders', 'Catalogue', 'Insights', 'Settings', 'Inbox']) {
    await appNav.getByRole('button', { name: tab, exact: true }).click();
    await page.getByRole('region', { name: `${tab} screen`, exact: true }).waitFor();
  }
  assert.deepEqual(errors, [], 'retained application runtime errors');
  console.log(
    `PASS: ${scans} whole-document axe scans; all specified widths/interactions, actual sticky overlap, reduced motion, private-data isolation, honest pricing/readiness, auth/utility routes, receipt privacy and five app destinations.`,
  );
  if (artifacts)
    await writeFile(
      join(artifacts, 'checks.json'),
      JSON.stringify(
        {
          origin,
          widths,
          scans,
          checks,
          errors,
          badAssets,
          businessRequests,
          limitations: [
            'Local Chromium only; no live providers or payments.',
            'Full-page mosaics temporarily normalise the header; viewport captures and geometry checks verify real sticky positioning.',
          ],
        },
        null,
        2,
      ),
    );
  await context.close();
} finally {
  if (artifacts)
    await writeFile(
      join(artifacts, 'last-run.json'),
      JSON.stringify({ scans, checks, errors, badAssets, businessRequests }, null, 2),
    );
  await browser.close();
}
