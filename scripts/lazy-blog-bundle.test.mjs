import assert from 'node:assert/strict';
import { existsSync } from 'node:fs';
import { readFile } from 'node:fs/promises';
import test from 'node:test';

// Angular 22.2 emits per-target stats (browser-stats.json) instead of stats.json.
const statsPath =
  process.env.BUNDLE_STATS ||
  ['dist/nati-psy/stats.json', 'dist/nati-psy/browser-stats.json'].find((candidate) =>
    existsSync(candidate),
  );

test('keeps BlogPost and DOMPurify out of the initial browser graph', async () => {
  assert.ok(statsPath, 'a browser stats file must exist under dist/nati-psy/');
  const stats = JSON.parse(await readFile(statsPath, 'utf8'));
  const outputs = Object.values(stats.outputs);
  const blogPostOutputs = outputs.filter(
    (output) => output.entryPoint === 'src/app/components/blog-post/blog-post.component.ts',
  );
  const initialOutputs = outputs.filter((output) => output.entryPoint === 'src/main.ts');
  assert.ok(blogPostOutputs.length > 0, 'BlogPostComponent must have a lazy output entry');
  assert.ok(initialOutputs.length > 0, 'the stats file must include the browser entry');

  const initialInputs = initialOutputs.flatMap((output) => Object.keys(output.inputs || {}));
  assert.equal(
    initialInputs.some((input) => input.includes('blog-post.component.ts')),
    false,
  );
  assert.equal(
    initialInputs.some((input) => input.includes('dompurify')),
    false,
  );

  const lazyInputs = blogPostOutputs.flatMap((output) => Object.keys(output.inputs || {}));
  assert.ok(lazyInputs.some((input) => input.includes('blog-post.component.ts')));
  assert.ok(lazyInputs.some((input) => input.includes('dompurify')));
});
