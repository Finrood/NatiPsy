import { readdir } from 'node:fs/promises';
import { extname, join } from 'node:path';

export async function findPrivateContent(root) {
  const violations = [];
  async function visit(directory) {
    for (const entry of await readdir(directory, { withFileTypes: true })) {
      const path = join(directory, entry.name);
      if (entry.isDirectory()) {
        await visit(path);
      } else if (extname(entry.name).toLowerCase() === '.md') {
        violations.push(path);
      }
    }
  }

  await visit(root);
  return violations;
}

export async function assertPublicContent(root = process.argv[2] || 'dist/nati-psy/browser') {
  const violations = await findPrivateContent(root);
  if (violations.length > 0) {
    throw new Error(`Private Markdown sources found in production output:\n${violations.join('\n')}`);
  }
  console.log(`PASS no Markdown sources in ${root}`);
}

if (import.meta.url === new URL(process.argv[1], 'file://').href) {
  assertPublicContent().catch((error) => {
    console.error(error.message);
    process.exitCode = 1;
  });
}
