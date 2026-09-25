import assert from 'node:assert/strict';
import { readFile } from 'node:fs/promises';
import { resolve } from 'node:path';

const readTemplate = async (relativePath) => readFile(resolve(process.cwd(), relativePath), 'utf8');

const [topMenu, blogList, blogPost, blogCard] = await Promise.all([
  readTemplate('src/app/components/top-menu/top-menu.component.html'),
  readTemplate('src/app/components/blog-list/blog-list.component.html'),
  readTemplate('src/app/components/blog-post/blog-post.component.html'),
  readTemplate('src/app/components/blog-card/blog-card.component.ts'),
]);

for (const [name, template] of [
  ['top-menu', topMenu],
  ['blog-list', blogList],
  ['blog-post', blogPost],
  ['blog-card', blogCard],
]) {
  const svgTags = template.match(/<svg\b[^>]*>/g) ?? [];
  assert.ok(svgTags.length > 0, name + ' should contain its expected icon markup');
  assert.ok(
    svgTags.every((tag) => tag.includes('aria-hidden="true"') && tag.includes('focusable="false"')),
    name + ' decorative SVGs must be hidden from assistive technology',
  );
  const scaleClasses =
    template.match(/(?:motion-safe:)?(?:group-)?hover:scale(?:-[^\s"]+)?/g) ?? [];
  assert.ok(
    scaleClasses.every((className) => className.startsWith('motion-safe:')),
    name + ' scale-on-hover interactions must respect prefers-reduced-motion',
  );
}

assert.match(
  topMenu,
  /isMenuOpen\(\) \? 'text-white focus:ring-white' : 'text-primary-blue focus:ring-primary-blue'/,
  'mobile menu toggle must keep its focus indicator visible on both backgrounds',
);
assert.match(
  topMenu,
  /\[attr\.aria-expanded\]="isMenuOpen\(\)\.toString\(\)"/,
  'mobile menu toggle must expose its expanded state',
);
assert.match(
  topMenu,
  /\[disabled\]="!menuReady\(\)"/,
  'menu should not promise interaction before hydration',
);

assert.match(blogList, /role="alert"/, 'blog list errors must be announced as alerts');
assert.match(blogPost, /role="alert"/, 'blog post errors must be announced as alerts');
assert.match(
  blogList,
  /<div class="block (?:h-48|relative aspect-\[2\/1\]) bg-gray-200 overflow-hidden" aria-hidden="true">[\s\S]*?\[ngSrc\]/,
  'blog card media must not create a second keyboard stop',
);
assert.doesNotMatch(
  blogList,
  /Leia mais|Read more/,
  'blog cards must not repeat their title link with a read-more link',
);
assert.equal(
  (blogList.match(/\[routerLink\]="\['\/blog', post\.slug\]"/g) ?? []).length,
  1,
  'blog cards must expose one primary post link',
);
assert.match(
  blogCard,
  /aria-hidden="true"[\s\S]*?\[ngSrc\]/,
  'reusable card media must not create a second keyboard stop',
);
assert.doesNotMatch(
  blogCard,
  /Leia mais|Read more/,
  'reusable cards must not duplicate their title link',
);
assert.equal(
  (blogCard.match(/\[routerLink\]="\['\/blog', post\.slug\]"/g) ?? []).length,
  2,
  'the reusable card must expose one conditional title link for each supported heading level',
);

const buttons = blogList.match(/<button\b[^>]*>/g) ?? [];
assert.ok(buttons.length > 0, 'blog list should contain its filter and pagination controls');
assert.ok(
  buttons.every((button) => /\btype="button"/.test(button)),
  'non-submit blog list buttons must declare type="button"',
);

console.log('Accessibility interaction contract passed.');
