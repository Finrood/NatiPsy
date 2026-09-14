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

console.log('Blog SEO field contract passed.');
