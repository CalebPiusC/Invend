import assert from 'node:assert/strict';
import { mkdir } from 'node:fs/promises';
import { join } from 'node:path';
import { launchBrowser } from './helpers/chromium.mjs';
import { fullPageScreenshot } from './helpers/full-page-screenshot.mjs';

// Start the development or production web server with DATA_MODE=mock.
// No real provider, account, message or payment is involved in these checks.
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
      result.violations.map((violation) => ({
        id: violation.id,
        nodes: violation.nodes.map((node) => ({
          target: node.target,
          summary: node.failureSummary,
        })),
      })),
      [],
      `${label}: accessibility violations`,
    );
    scans++;
  }
  async function screenshot(name, fullPage = false) {
    if (!artifacts) return;
    const path = join(artifacts, `${name}.png`);
    if (fullPage) await fullPageScreenshot(page, path);
    else await page.screenshot({ path });
  }
  async function top() {
    await page.evaluate(
      () =>
        new Promise((resolve) => {
          window.scrollTo(0, 0);
          requestAnimationFrame(() => requestAnimationFrame(resolve));
        }),
    );
  }

  for (const width of [320, 390, 768, 900, 1100, 1280, 1440]) {
    await page.setViewportSize({ width, height: width < 600 ? 844 : 1000 });
    const response = await page.goto(origin, { waitUntil: 'networkidle', timeout: 120000 });
    assert.equal(response.status(), 200);
    await page.evaluate(() => document.fonts.ready);
    await page.addScriptTag({ path: 'node_modules/axe-core/axe.min.js' });
    assert.equal(await page.getByRole('heading', { level: 1 }).count(), 1);
    assert.match(await page.title(), /Invend.*AI sales assistant/);
    assert.doesNotMatch(await page.locator('body').innerText(), /selvora/i);
    const homeBrand = page.getByRole('banner').getByRole('link', { name: 'Invend home' });
    assert.equal(await homeBrand.innerText(), 'invend');
    assert.equal(await homeBrand.locator('svg[data-brand="invend"]').count(), 1);
    assert.equal(
      await page.getByTestId('sample-label').count(),
      0,
      'no tenant provider on the public homepage',
    );
    assert.equal(
      await page.locator('#home').evaluate((element) => getComputedStyle(element).backgroundColor),
      'rgb(36, 32, 102)',
    );
    await page.getByAltText(/fictional Nigerian vendor/).evaluate((image) => image.decode());
    await fit(`${width} homepage`);
    await accessible(`${width} homepage`);

    const menu = page.locator('button[aria-controls="site-navigation"]');
    if (width < 1100) {
      await menu.click();
      assert.equal(await menu.getAttribute('aria-expanded'), 'true');
      await accessible(`${width} mobile navigation`);
    }
    const features = page.getByRole('button', { name: 'Features', exact: true });
    await features.focus();
    await page.keyboard.press('ArrowDown');
    const panel = page.locator('#feature-navigation');
    assert.equal(await panel.getByRole('link').count(), 7);
    assert.equal(
      await panel
        .getByRole('link')
        .first()
        .evaluate((element) => element === document.activeElement),
      true,
    );
    await accessible(`${width} grouped feature navigation`);
    await page.keyboard.press('Escape');
    assert.equal(await features.getAttribute('aria-expanded'), 'false');
    assert.equal(await features.evaluate((element) => element === document.activeElement), true);
    await page.keyboard.press('ArrowUp');
    assert.equal(
      await panel
        .getByRole('link')
        .last()
        .evaluate((element) => element === document.activeElement),
      true,
    );
    await panel.getByRole('link', { name: /Smart Catalogue/ }).click();
    if (width < 1100) assert.equal(await menu.getAttribute('aria-expanded'), 'false');
    const targetTop = await page
      .locator('#smart-catalogue')
      .evaluate((element) => element.getBoundingClientRect().top);
    const headerBottom = await page
      .getByRole('banner')
      .evaluate((element) => element.getBoundingClientRect().bottom);
    assert.ok(
      targetTop >= headerBottom && targetTop < 150,
      `${width} anchor clearance: ${targetTop}`,
    );

    const negotiation = page.getByTestId('negotiation-demo');
    assert.equal(await negotiation.getByText('Owner review required', { exact: true }).count(), 1);
    await negotiation.getByRole('button', { name: 'Approve sample counter-offer' }).click();
    assert.match(
      await negotiation.getByRole('status').textContent(),
      /No message was sent and no order was changed/,
    );
    await fit(`${width} approval`);
    await accessible(`${width} approval`);
    await negotiation.getByRole('button', { name: '₦22,000', exact: true }).click();
    assert.equal(await negotiation.getByText('Within the price boundary').count(), 1);
    await negotiation.getByRole('button', { name: 'Try the rule-checked reply' }).click();
    assert.match(await negotiation.getByRole('status').textContent(), /No message was sent/);
    await negotiation.getByRole('button', { name: 'Reset demo' }).click();

    const catalogue = page.getByTestId('catalogue-demo');
    await catalogue.getByRole('button', { name: 'Review sample details' }).click();
    assert.equal(
      await catalogue.getByRole('button', { name: 'Confirm sample product' }).isDisabled(),
      true,
    );
    await catalogue.getByRole('button', { name: 'Increase sample stock' }).click();
    assert.equal(
      await catalogue.getByRole('status', { name: 'Sample stock count' }).textContent(),
      '13',
    );
    await catalogue.getByRole('checkbox').check();
    await catalogue.getByRole('button', { name: 'Confirm sample product' }).click();
    assert.match(
      await catalogue.locator('p[role="status"]').textContent(),
      /No product or photo was saved/,
    );
    await fit(`${width} catalogue confirmation`);
    await accessible(`${width} catalogue confirmation`);
    await catalogue.getByRole('button', { name: 'Reset demo' }).click();

    const inbox = page.getByTestId('inbox-demo');
    for (const name of ['Chidi Okafor', 'Lola Adeyemi', 'Amaka Bello']) {
      await inbox.getByRole('button', { name: new RegExp(name) }).click();
      assert.equal(
        await inbox.getByRole('button', { name: new RegExp(name) }).getAttribute('aria-pressed'),
        'true',
      );
    }
    assert.match(await inbox.textContent(), /including a planned integration/);
    await fit(`${width} inbox`);
    await accessible(`${width} inbox`);

    const lead = page.getByTestId('lead-demo');
    await lead.getByRole('button', { name: /Ready to buy/ }).click();
    assert.equal(
      await lead.getByRole('button', { name: 'Queue sample follow-up' }).isDisabled(),
      true,
    );
    await lead.getByRole('checkbox').check();
    await lead.getByRole('button', { name: 'Queue sample follow-up' }).click();
    assert.match(await lead.getByRole('status').textContent(), /No message will be sent/);
    await fit(`${width} follow-up`);
    await accessible(`${width} follow-up`);
    await lead.getByRole('button', { name: 'Reset demo' }).click();

    const order = page.getByTestId('order-demo');
    await order.getByRole('button', { name: 'Create sample draft' }).click();
    await order.getByRole('button', { name: 'Review payment step' }).click();
    await order.getByRole('button', { name: 'Test a payment screenshot' }).click();
    assert.equal(
      await order.getByRole('button', { name: 'Record sample confirmation' }).isDisabled(),
      true,
    );
    assert.equal(await order.getByText('Payment not confirmed', { exact: true }).count(), 1);
    assert.equal(await order.getByText('SAMPLE RECEIPT', { exact: true }).count(), 0);
    await accessible(`${width} unverified payment screenshot`);
    await order.getByRole('checkbox').check();
    await order.getByRole('button', { name: 'Record sample confirmation' }).click();
    assert.equal(await order.getByText('SAMPLE RECEIPT', { exact: true }).count(), 1);
    assert.equal(await order.getByText('₦23,500', { exact: true }).count(), 1);
    assert.equal(
      await order.getByText('Illustrative receipt. Not proof of a real payment.').count(),
      1,
    );
    await fit(`${width} receipt`);
    await accessible(`${width} receipt`);
    await order.getByRole('button', { name: 'Reset demo' }).click();

    const control = page.getByTestId('control-demo');
    await control.getByRole('button', { name: 'Take over demo conversation' }).click();
    assert.equal(
      await control.getByText('AI replies are paused in this demonstration.').count(),
      1,
    );
    await accessible(`${width} human takeover`);
    await control.getByRole('button', { name: 'Hand back to assistant' }).click();
    await control.getByRole('combobox').selectOption('Bisi');
    await control.getByRole('button', { name: 'Approve sample reply' }).click();
    assert.match(await control.getByRole('status').textContent(), /No message was sent/);
    await fit(`${width} staff assignment`);
    await control.getByRole('button', { name: 'Reset demo' }).click();

    const integrations = page.getByTestId('integration-status');
    assert.equal(await integrations.getByRole('listitem').count(), 6);
    assert.match(
      await integrations
        .getByRole('listitem')
        .filter({ has: page.getByText('SMS', { exact: true }) })
        .textContent(),
      /Exploring · not supported/,
    );
    assert.match(await page.locator('#pricing').textContent(), /not published in this preview/);

    for (const details of await page.locator('details').all()) {
      await details.locator('summary').click();
      assert.equal(await details.evaluate((element) => element.open), true);
    }
    await accessible(`${width} expanded FAQs`);
    await fit(`${width} FAQs`);
    for (const details of await page.locator('details').all())
      await details.locator('summary').click();
    await page.getByRole('link', { name: 'Back to top', exact: true }).click();
    assert.ok(
      (await page
        .getByRole('heading', { level: 1 })
        .evaluate((element) => element.getBoundingClientRect().top)) >= headerBottom,
    );
    await top();
    if (width === 390 || width === 1440) {
      await screenshot(`homepage-${width}`);
      await screenshot(`homepage-${width}-full`, true);
    }
    results.push(
      `${width}px: navigation/keyboard, pricing boundaries, photo review, inbox, consent-led follow-up, payment gate/receipt, takeover and assignment, FAQs; no overflow`,
    );
  }

  assert.deepEqual(
    businessRequests,
    [],
    'marketing demonstrations never call private business APIs',
  );
  assert.deepEqual(errors, [], 'homepage runtime errors');
  for (const href of await page
    .locator('a[href]')
    .evaluateAll((links) => links.map((link) => link.getAttribute('href')))) {
    if (href.startsWith('#'))
      assert.equal(await page.locator(`[id="${href.slice(1)}"]`).count(), 1, href);
    else
      assert.ok(
        ['/app', '/app?auth=sign-in', '/app?auth=sign-up'].includes(href),
        `unexpected homepage link: ${href}`,
      );
  }

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
  assert.equal(manifest.theme_color, '#242066');
  assert.equal(manifest.background_color, '#F8FAFC');

  await page.goto(new URL('/app', origin).href, { waitUntil: 'networkidle' });
  await page.getByTestId('sample-label').waitFor();
  const nav = page.getByRole('navigation', { name: 'Main navigation' });
  for (const tab of ['Orders', 'Catalogue', 'Insights', 'Settings', 'Inbox']) {
    await nav.getByRole('button', { name: tab, exact: true }).click();
    await page.getByRole('region', { name: `${tab} screen`, exact: true }).waitFor();
  }
  assert.deepEqual(errors, [], 'retained application runtime errors');
  console.log(results.join('\n'));
  console.log(
    `PASS: ${scans} whole-document axe scans; all six demos, private-data isolation, honest integration states, pricing disclosure, auth/utility routing, receipt privacy, manifest and five app destinations.`,
  );
  await context.close();
} finally {
  await browser.close();
}
