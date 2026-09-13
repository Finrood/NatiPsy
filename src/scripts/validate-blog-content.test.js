const fs = require('fs/promises');
const os = require('os');
const path = require('path');
const test = require('node:test');
const assert = require('node:assert/strict');
const { comparePosts, validateContentDirectory } = require('./validate-blog-content');

async function fixture() {
  const root = await fs.mkdtemp(path.join(os.tmpdir(), 'natipsy-blog-'));
  const contentDir = path.join(root, 'content');
  const imagesDir = path.join(root, 'images');
  await fs.mkdir(imagesDir, { recursive: true });
  await fs.writeFile(path.join(imagesDir, 'hero.webp'), 'fixture');
  return { contentDir, imagesDir };
}

test('validates a publishable post and deterministic date/slug ordering', async () => {
  const { contentDir, imagesDir } = await fixture();
  await fs.mkdir(contentDir);
  await fs.writeFile(path.join(contentDir, 'zeta.md'), '---\ntitle: Zeta\ndescription: d\ndate: 2025-01-01\ncategories: [A]\nimage: hero.webp\n---\nbody');

  const result = validateContentDirectory(contentDir, imagesDir);
  assert.deepEqual(result.errors, []);
  assert.ok(comparePosts({ date: '2025-01-01', slug: 'zeta' }, { date: '2025-01-01', slug: 'alpha' }) > 0);
});

test('reports malformed fields, invalid slug, missing image, and traversal', async () => {
  const { contentDir, imagesDir } = await fixture();
  await fs.mkdir(contentDir);
  await fs.writeFile(path.join(contentDir, 'Not Safe.md'), '---\ntitle: 4\ndescription: \ndate: 2025-02-30\ncategories: nope\nimage: ../secret.webp\n---\nbody');

  const { errors } = validateContentDirectory(contentDir, imagesDir);
  assert.match(errors.join('\n'), /slug/);
  assert.match(errors.join('\n'), /title/);
  assert.match(errors.join('\n'), /description/);
  assert.match(errors.join('\n'), /date/);
  assert.match(errors.join('\n'), /categories/);
  assert.match(errors.join('\n'), /escapes/);
});

test('does not publish an explicit draft', async () => {
  const { contentDir, imagesDir } = await fixture();
  await fs.mkdir(contentDir);
  await fs.writeFile(path.join(contentDir, 'draft.md'), '---\ndraft: true\n---\nprivate');

  assert.deepEqual(validateContentDirectory(contentDir, imagesDir), { errors: [], posts: [] });
});
