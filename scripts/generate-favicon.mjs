import { readFile, writeFile } from 'node:fs/promises';
import { dirname, resolve } from 'node:path';
import { fileURLToPath } from 'node:url';

const root = resolve(dirname(fileURLToPath(import.meta.url)), '..');
const sizes = [16, 32, 48];
const pngs = await Promise.all(
  sizes.map((size) => readFile(resolve(root, `public/assets/icons/icon-${size}.png`))),
);

const directorySize = 6 + sizes.length * 16;
let resourceOffset = directorySize;
const directory = Buffer.alloc(directorySize);
directory.writeUInt16LE(0, 0);
directory.writeUInt16LE(1, 2);
directory.writeUInt16LE(sizes.length, 4);

pngs.forEach((png, index) => {
  const entryOffset = 6 + index * 16;
  const size = sizes[index];
  directory[entryOffset] = size;
  directory[entryOffset + 1] = size;
  directory.writeUInt16LE(1, entryOffset + 4);
  directory.writeUInt16LE(32, entryOffset + 6);
  directory.writeUInt32LE(png.length, entryOffset + 8);
  directory.writeUInt32LE(resourceOffset, entryOffset + 12);
  resourceOffset += png.length;
});

await writeFile(resolve(root, 'public/favicon.ico'), Buffer.concat([directory, ...pngs]));
