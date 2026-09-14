import assert from 'node:assert/strict';
import fs from 'node:fs';

const listTemplate = fs.readFileSync('src/app/components/blog-list/blog-list.component.html', 'utf8');
const listComponent = fs.readFileSync('src/app/components/blog-list/blog-list.component.ts', 'utf8');
const postTemplate = fs.readFileSync('src/app/components/blog-post/blog-post.component.html', 'utf8');

assert.match(listTemplate, /@for \(post of displayedPosts; track post\.slug; let index = \$index\)/);
assert.match(listTemplate, /class="block relative aspect-\[2\/1\]/);
assert.match(listTemplate, /fill\s+class="object-cover/);
assert.match(listTemplate, /\[priority\]="shouldPrioritizeFirstImage && index === 0"/);
assert.match(listTemplate, /\[loading\]="shouldPrioritizeFirstImage && index === 0 \? 'eager' : 'lazy'"/);
assert.match(listComponent, /@Input\(\) firstImagePriority\?: boolean/);
assert.match(listComponent, /get shouldPrioritizeFirstImage\(\): boolean/);
assert.doesNotMatch(listTemplate, /width="400" height="200"/);

assert.match(postTemplate, /class="relative w-full aspect-\[2\/1\]/);
assert.match(postTemplate, /fill\s+class="object-cover transform/);
assert.match(postTemplate, /priority\s+sizes="100vw"/);
assert.doesNotMatch(postTemplate, /width="768"\s+height="384"/);
assert.match(postTemplate, /class="relative aspect-\[2\/1\] bg-gray-200"/);
assert.match(postTemplate, /fill\s+class="object-cover"\s+loading="lazy"/);

console.log('Blog image geometry and priority contract passed.');
