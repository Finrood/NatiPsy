import assert from 'node:assert/strict';
import { createRequire } from 'node:module';
import test from 'node:test';

const require = createRequire(import.meta.url);
const { renderPostMarkdown } = require('../src/scripts/generate-blog-index.js');

test('creates unique anchors for duplicate and accented headings', () => {
  const { html, headings } = renderPostMarkdown(
    '## Saúde Mental\n\n## Saúde Mental\n\n### Ação e Cuidado',
  );
  assert.deepEqual(
    headings.map(({ id }) => id),
    ['saude-mental', 'saude-mental-2', 'acao-e-cuidado'],
  );
  assert.match(html, /id="saude-mental-2"/);
});
