import assert from 'node:assert/strict';
import fs from 'node:fs';

const post = JSON.parse(fs.readFileSync('public/assets/content/blog/posts/carreira-mulheres-negras-fadiga-racial.json', 'utf8'));
for (const field of ['seoTitle', 'seoDescription', 'socialTitle', 'socialDescription']) {
  assert.equal(typeof post[field], 'string', `${field} should be generated`);
  assert.ok(post[field].trim().length > 0, `${field} should not be empty`);
}
assert.ok(post.seoTitle.length <= 60, 'seoTitle should be concise');
assert.ok(post.seoDescription.length <= 160, 'seoDescription should be concise');
assert.ok(post.title.length > post.seoTitle.length, 'editorial title should remain independent');

const prerendered = fs.readFileSync(
  'dist/nati-psy/browser/blog/carreira-mulheres-negras-fadiga-racial/index.html',
  'utf8',
);
assert.match(
  prerendered,
  /<title>Fadiga racial e carreira: caminhos para o bem-estar<\/title>/,
  'prerendered title must use the dedicated SEO title without a duplicate suffix',
);
assert.match(
  prerendered,
  /<meta name="description" content="Entenda como a fadiga de batalha racial/,
  'prerendered description must use the dedicated SEO description',
);
assert.match(
  prerendered,
  /<meta property="og:title" content="Fadiga racial e bem-estar na carreira de mulheres negras">/,
  'prerendered Open Graph title must use the social title',
);
assert.match(
  prerendered,
  /<meta name="twitter:title" content="Fadiga racial e bem-estar na carreira de mulheres negras">/,
  'prerendered Twitter title must use the social title',
);
for (const marker of [
  'property="og:image:width" content="1024"',
  'property="og:image:height" content="1536"',
  'property="og:image:type" content="image/webp"',
  'property="og:image:alt"',
  'rel="canonical" href="https://psicologanataliaferreira.com/blog/carreira-mulheres-negras-fadiga-racial"',
]) {
  assert.ok(prerendered.includes(marker), `prerendered head should include ${marker}`);
}

console.log('Blog SEO field contract passed.');
