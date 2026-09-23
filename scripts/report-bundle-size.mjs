import fs from 'node:fs';
import path from 'node:path';

const distRoot = path.resolve(process.env.BUNDLE_DIST_ROOT || 'dist/nati-psy');
const distDir = path.join(distRoot, 'browser');
const indexPath = path.join(distDir, 'index.html');
const statsPath = path.resolve(process.env.BUNDLE_STATS_FILE || path.join(distRoot, 'stats.json'));
const policy = JSON.parse(fs.readFileSync('performance-budgets.json', 'utf8'));

if (!fs.existsSync(indexPath) || !fs.existsSync(statsPath)) {
  console.error(`Bundle output or stats not found. Expected ${indexPath} and ${statsPath}.`);
  process.exit(1);
}

const stats = JSON.parse(fs.readFileSync(statsPath, 'utf8'));
const outputs = stats.outputs || {};
const html = fs.readFileSync(indexPath, 'utf8');
const entryAssets = [
  ...html.matchAll(/<script[^>]+src="([^"]+)"/g),
  ...html.matchAll(/<link[^>]+rel="stylesheet"[^>]+href="([^"]+)"/g),
]
  .map((match) => match[1])
  .filter((asset) => !asset.startsWith('http'));

const initialAssets = new Set(entryAssets.map((asset) => asset.replace(/^\//, '')));
const queue = [...initialAssets];
while (queue.length > 0) {
  const asset = queue.shift();
  const output = outputs[asset];
  if (!output) {
    throw new Error(`Initial asset ${asset} is missing from ${statsPath}.`);
  }
  for (const imported of output.imports || []) {
    if (imported.kind !== 'import-statement' || initialAssets.has(imported.path)) {
      continue;
    }
    initialAssets.add(imported.path);
    queue.push(imported.path);
  }
}

const files = [...initialAssets].map((asset) => {
  const filePath = path.resolve(distDir, asset);
  if (!fs.existsSync(filePath)) {
    throw new Error(`Initial asset ${asset} is missing from ${distDir}.`);
  }
  return { asset, bytes: fs.statSync(filePath).size };
});
const initialBytes = files.reduce((total, file) => total + file.bytes, 0);
const lazyFiles = Object.entries(outputs)
  .filter(([asset]) => !initialAssets.has(asset))
  .filter(([asset]) => !asset.endsWith('.mjs') && fs.existsSync(path.resolve(distDir, asset)))
  .map(([asset, output]) => ({
    asset,
    bytes: fs.statSync(path.resolve(distDir, asset)).size,
    entryPoint: output.entryPoint ?? null,
  }))
  .filter((file) => file.bytes > 0);
const lazyBytes = lazyFiles.reduce((total, file) => total + file.bytes, 0);
const report = {
  distDir,
  statsPath,
  initialBytes,
  initialKiB: Number((initialBytes / 1024).toFixed(2)),
  files,
  lazyBytes,
  lazyKiB: Number((lazyBytes / 1024).toFixed(2)),
  lazyFiles,
  warningBytes: policy.initial.warningBytes,
  errorBytes: policy.initial.errorBytes,
};
console.log(JSON.stringify(report, null, 2));

const baselinePath = path.resolve(process.env.BUNDLE_BASELINE_FILE || 'performance-baseline.json');
if (!fs.existsSync(baselinePath)) {
  console.error(`Bundle baseline not found at ${baselinePath}.`);
  process.exitCode = 1;
} else {
  const baseline = JSON.parse(fs.readFileSync(baselinePath, 'utf8'));
  const increasePercent = ((initialBytes - baseline.initialBytes) / baseline.initialBytes) * 100;
  console.log(`Initial bundle change: ${increasePercent.toFixed(2)}%`);
  if (increasePercent > policy.regression.maxIncreasePercent) {
    console.error(
      `Initial bundle increased beyond ${policy.regression.maxIncreasePercent}% policy.`,
    );
    process.exitCode = 1;
  }
}

if (initialBytes > policy.initial.errorBytes) {
  console.error('Initial bundle exceeds the error budget.');
  process.exitCode = 1;
} else if (initialBytes > policy.initial.warningBytes) {
  console.warn('Initial bundle exceeds the warning budget.');
}
