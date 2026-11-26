// Run with Node.js 22: node scripts/write-brand-assets.mjs
// Uses the project's existing fontkit, local font and Sharp; no remote assets/dependencies.
import { readFile, writeFile } from 'node:fs/promises';
import sharp from 'sharp';
import fontkit from '@pdf-lib/fontkit';
import { INVEND_BAG_PATH, INVEND_GOLD, INVEND_HANDLE_PATH } from '../web/lib/brand-mark.ts';

const violet = '#4338CA';
const indigo = '#242066';
const symbol = (color) =>
  `<path d="${INVEND_HANDLE_PATH}" fill="none" stroke="${color}" stroke-width="4" stroke-linecap="round"/><path d="${INVEND_BAG_PATH}" fill="${color}" fill-rule="evenodd" clip-rule="evenodd"/><circle cx="48" cy="23" r="2.8" fill="${INVEND_GOLD}"/>`;
const svg = (width, height, body, label = 'Invend') =>
  `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 ${width} ${height}" role="img" aria-label="${label}"><title>${label}</title>${body}</svg>\n`;
const icon = svg(64, 64, symbol(violet));
const tile = svg(
  64,
  64,
  `<rect width="64" height="64" rx="14" fill="${violet}"/><g transform="translate(6.4 6.4) scale(.8)">${symbol('#FFFFFF')}</g>`,
);
const app = svg(
  64,
  64,
  `<rect width="64" height="64" fill="${violet}"/><g transform="translate(6.4 6.4) scale(.8)">${symbol('#FFFFFF')}</g>`,
);

// Outline the existing Plus Jakarta Sans wordmark so the SVG needs no installed font.
const font = fontkit.create(
  await readFile(
    'node_modules/@fontsource/plus-jakarta-sans/files/plus-jakarta-sans-latin-700-normal.woff',
  ),
);
const run = font.layout('invend');
const scale = 42 / font.unitsPerEm;
let cursor = 0;
const paths = run.glyphs
  .map((glyph, index) => {
    const position = run.positions[index];
    const path = `<path transform="translate(${(cursor + position.xOffset).toFixed(2)} ${position.yOffset})" d="${glyph.path.toSVG()}"/>`;
    cursor += position.xAdvance;
    return path;
  })
  .join('');
const width = Math.ceil(50 + cursor * scale + 6);
const wordmark = (color) =>
  `<g fill="${color}" transform="translate(50 48) scale(${scale} ${-scale})">${paths}</g>`;
const horizontal = svg(
  width,
  64,
  `<g transform="translate(0 7) scale(.8)">${symbol(violet)}</g>${wordmark(indigo)}`,
  'invend',
);
const inverse = svg(
  width,
  64,
  `<g transform="translate(0 7) scale(.8)">${symbol('#FFFFFF')}</g>${wordmark('#FFFFFF')}`,
  'invend',
);

for (const [name, contents] of Object.entries({
  'invend-icon.svg': icon,
  'invend-compact.svg': tile,
  'invend-logo.svg': horizontal,
  'invend-logo-inverse.svg': inverse,
  'favicon.svg': tile,
  // Existing URLs remain valid, but no longer serve the old symbol.
  'icon.svg': tile,
  'selvora-mark.svg': tile,
}))
  await writeFile(`web/public/${name}`, contents);
for (const size of [192, 512]) {
  const png = await sharp(Buffer.from(app)).resize(size, size).png().toBuffer();
  await writeFile(`web/public/invend-icon-${size}.png`, png);
  await writeFile(`web/public/icon-${size}.png`, png);
}
await sharp(Buffer.from(app)).resize(180, 180).png().toFile('web/public/apple-touch-icon.png');

// PNG-backed ICO frames, supported by current Windows browsers; no image library added.
const frames = await Promise.all(
  [16, 32, 48].map((size) => sharp(Buffer.from(tile)).resize(size, size).png().toBuffer()),
);
const header = Buffer.alloc(6 + frames.length * 16);
header.writeUInt16LE(1, 2);
header.writeUInt16LE(frames.length, 4);
let offset = header.length;
frames.forEach((frame, index) => {
  const start = 6 + index * 16;
  header[start] = [16, 32, 48][index];
  header[start + 1] = header[start];
  header.writeUInt16LE(1, start + 4);
  header.writeUInt16LE(32, start + 6);
  header.writeUInt32LE(frame.length, start + 8);
  header.writeUInt32LE(offset, start + 12);
  offset += frame.length;
});
await writeFile('web/public/favicon.ico', Buffer.concat([header, ...frames]));
console.log(
  'Invend logos, favicon, touch icon and PWA icons generated; existing icon URLs updated.',
);
