import sharp from 'sharp';

/**
 * Capture the actual viewport in tiles. The bundled headless Chromium can repeat
 * its first texture after 8192px in a single fullPage image. This avoids that
 * artifact on long story pages without changing any application source/styles.
 * The sticky header is static only during capture so it appears once in the image.
 */
export async function fullPageScreenshot(page, destination) {
  const viewport = page.viewportSize();
  if (!viewport) throw new Error('A fixed viewport is required for visual review.');
  const header = page.getByRole('banner');
  const original = await header.evaluate((element) => ({
    value: element.style.getPropertyValue('position'),
    priority: element.style.getPropertyPriority('position'),
  }));
  try {
    await header.evaluate((element) =>
      element.style.setProperty('position', 'static', 'important'),
    );
    const height = await page.evaluate(() => Math.ceil(document.documentElement.scrollHeight));
    const tiles = [];
    for (let top = 0; top < height; top += viewport.height) {
      await page.evaluate(
        (y) =>
          new Promise((resolve) => {
            window.scrollTo(0, y);
            requestAnimationFrame(() => requestAnimationFrame(resolve));
          }),
        top,
      );
      const actualTop = await page.evaluate(() => Math.round(window.scrollY));
      const offset = top - actualTop;
      const tileHeight = Math.min(viewport.height - offset, height - top);
      const buffer = await page.screenshot({ type: 'png', animations: 'disabled' });
      const tile = await sharp(buffer)
        .extract({ left: 0, top: offset, width: viewport.width, height: tileHeight })
        .toBuffer();
      tiles.push({ input: tile, left: 0, top });
    }
    await sharp({ create: { width: viewport.width, height, channels: 3, background: '#ffffff' } })
      .composite(tiles)
      .png()
      .toFile(destination);
  } finally {
    await header.evaluate((element, position) => {
      if (position.value) element.style.setProperty('position', position.value, position.priority);
      else element.style.removeProperty('position');
    }, original);
    await page.evaluate(() => window.scrollTo(0, 0));
  }
}
