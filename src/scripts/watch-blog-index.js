const fs = require('fs');
const path = require('path');
const { spawnSync } = require('child_process');
const { defaultContentDir } = require('./validate-blog-content');

const contentDir = defaultContentDir();
const validator = path.join(__dirname, 'validate-blog-content.js');
const generator = path.join(__dirname, 'generate-blog-index.js');
let timer;

function generate() {
  const validation = spawnSync(process.execPath, [validator], { stdio: 'inherit' });
  if (validation.status !== 0) {
    console.error('[Blog Watch] Validation failed; waiting for the next source change.');
    return;
  }
  const result = spawnSync(process.execPath, [generator], { stdio: 'inherit' });
  if (result.status !== 0) console.error('[Blog Watch] Generation failed; waiting for the next source change.');
}

generate();
const watcher = fs.watch(contentDir, (_event, filename) => {
  if (!filename || path.extname(filename) !== '.md') return;
  clearTimeout(timer);
  timer = setTimeout(generate, 100);
});

process.on('SIGINT', () => {
  watcher.close();
  clearTimeout(timer);
  process.exit(0);
});
