import assert from 'node:assert/strict';
import { access, readFile, stat } from 'node:fs/promises';
import { resolve } from 'node:path';

const root = process.cwd();
const read = (relativePath) => readFile(resolve(root, relativePath), 'utf8');
const exists = (relativePath) => access(resolve(root, relativePath));

const [indexHtml, topMenu, manifestText, indexJson, favicon] = await Promise.all([
  read('src/index.html'),
  read('src/app/components/top-menu/top-menu.component.html'),
  read('public/site.webmanifest'),
  read('public/assets/content/blog/index.json'),
  readFile(resolve(root, 'public/favicon.ico')),
]);

const manifest = JSON.parse(manifestText);
assert.equal(manifest.display, 'standalone', 'manifest must define standalone display mode');
assert.equal(manifest.theme_color, '#1f1e3b', 'manifest theme must match the public theme color');
assert.equal(manifest.icons.length, 2, 'manifest must define the 192px and 512px icons');

for (const icon of manifest.icons) {
  const relativePath = 'public/' + icon.src.replace(/^\//, '');
  await exists(relativePath);
  assert.equal(icon.type, 'image/png', 'manifest icons must be PNG files');
  assert.match(icon.sizes, /^\d+x\d+$/, 'manifest icon sizes must be explicit');
}

for (const size of [16, 32, 48, 180, 192, 512]) {
  const png = await readFile(resolve(root, 'public/assets/icons/icon-' + size + '.png'));
  assert.deepEqual(
    [...png.subarray(0, 8)],
    [137, 80, 78, 71, 13, 10, 26, 10],
    'icon-' + size + '.png must be a PNG',
  );
  assert.equal(png.readUInt32BE(16), size, 'icon-' + size + '.png width must be square');
  assert.equal(png.readUInt32BE(20), size, 'icon-' + size + '.png height must be square');
}

assert.equal(favicon.readUInt16LE(0), 0, 'favicon reserved field must be zero');
assert.equal(favicon.readUInt16LE(2), 1, 'favicon must be an ICO resource');
const faviconCount = favicon.readUInt16LE(4);
assert.equal(faviconCount, 3, 'favicon must contain exactly the 16, 32, and 48 pixel layers');
const faviconEntries = [];
for (let index = 0; index < faviconCount; index += 1) {
  const entryOffset = 6 + index * 16;
  const width = favicon[entryOffset] || 256;
  const height = favicon[entryOffset + 1] || 256;
  const bytesInResource = favicon.readUInt32LE(entryOffset + 8);
  const resourceOffset = favicon.readUInt32LE(entryOffset + 12);
  assert.equal(width, height, 'favicon layers must be square');
  assert.ok([16, 32, 48].includes(width), 'favicon layer size must be 16, 32, or 48 pixels');
  assert.ok(bytesInResource > 0, 'favicon layer must contain image data');
  assert.ok(
    resourceOffset + bytesInResource <= favicon.length,
    'favicon layer must fit inside the ICO file',
  );
  const resource = favicon.subarray(resourceOffset, resourceOffset + bytesInResource);
  assert.deepEqual(
    [...resource.subarray(0, 8)],
    [137, 80, 78, 71, 13, 10, 26, 10],
    'ICO layers must contain complete PNG data',
  );
  assert.equal(resource.readUInt32BE(16), width, 'ICO PNG width must match its directory entry');
  assert.equal(resource.readUInt32BE(20), height, 'ICO PNG height must match its directory entry');
  faviconEntries.push(width);
}
assert.deepEqual(
  faviconEntries.sort((a, b) => a - b),
  [16, 32, 48],
  'favicon must include every required layer',
);

for (const source of [indexHtml, topMenu]) {
  assert.doesNotMatch(
    source,
    /logo(?:_signature)?\.webp/,
    'removed WebP logos must not be referenced',
  );
}
assert.match(
  indexHtml,
  /rel="manifest" href="site\.webmanifest"/,
  'index must advertise the web manifest',
);
assert.match(
  indexHtml,
  /rel="apple-touch-icon" sizes="180x180"/,
  'index must advertise the Apple touch icon',
);
assert.match(
  indexHtml,
  /name="theme-color" content="#1f1e3b"/,
  'index must expose the theme color',
);
assert.match(
  indexJson,
  /"avatar": "\/assets\/NatiAboutMe\.webp"/,
  'blog data must use the canonical portrait',
);
await exists('public/assets/NatiAboutMe.webp');
await assert.rejects(exists('public/assets/content/blog/images/authors/natalia_ferreira.webp'));

const iconFiles = [
  'autoconfianca.svg',
  'autoconhecimento.svg',
  'desenvolvimento-rotinas.svg',
  'gerenciamento-emocoes.svg',
  'relacionamentos.svg',
  'transicao-carreira.svg',
];
let iconBytes = 0;
for (const iconFile of iconFiles) {
  const source = await read('public/assets/icons/' + iconFile);
  assert.doesNotMatch(
    source,
    /SVGRepo_iconCarrier/,
    iconFile + ' must not contain a duplicate carrier group',
  );
  iconBytes += (await stat(resolve(root, 'public/assets/icons/' + iconFile))).size;
}
assert.ok(iconBytes < 87200, 'optimized service SVGs must stay below the audited 87 kB total');

console.log('Asset and favicon contract passed.');
