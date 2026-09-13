import fs from 'node:fs';
import path from 'node:path';

const distDir = path.resolve(process.env.BUNDLE_DIST || 'dist/nati-psy/browser');
const indexPath = path.join(distDir, 'index.html');
const policy = JSON.parse(fs.readFileSync('performance-budgets.json', 'utf8'));

if (!fs.existsSync(indexPath)) {
  console.error(`Bundle output not found at ${indexPath}. Run the production build first.`);
  process.exit(1);
}

const html = fs.readFileSync(indexPath, 'utf8');
const assets = [
  ...html.matchAll(/<script[^>]+src="([^"]+)"/g),
  ...html.matchAll(/<link[^>]+rel="stylesheet"[^>]+href="([^"]+)"/g),
].map(match => match[1]).filter(asset => !asset.startsWith('http'));

const uniqueAssets = [...new Set(assets)];
const files = uniqueAssets.map(asset => {
  const filePath = path.resolve(distDir, asset.replace(/^\//, ''));
  return { asset, bytes: fs.statSync(filePath).size };
});
const initialBytes = files.reduce((total, file) => total + file.bytes, 0);
const report = {
  distDir,
  initialBytes,
  initialKiB: Number((initialBytes / 1024).toFixed(2)),
  files,
  warningBytes: policy.initial.warningBytes,
  errorBytes: policy.initial.errorBytes,
};
console.log(JSON.stringify(report, null, 2));

const baselinePath = process.env.BUNDLE_BASELINE_FILE;
if (baselinePath && fs.existsSync(baselinePath)) {
  const baseline = JSON.parse(fs.readFileSync(baselinePath, 'utf8'));
  const increasePercent = ((initialBytes - baseline.initialBytes) / baseline.initialBytes) * 100;
  console.log(`Initial bundle change: ${increasePercent.toFixed(2)}%`);
  if (increasePercent > policy.regression.maxIncreasePercent) {
    console.error(`Initial bundle increased beyond ${policy.regression.maxIncreasePercent}% policy.`);
    process.exitCode = 1;
  }
}

if (initialBytes > policy.initial.errorBytes) {
  console.error('Initial bundle exceeds the error budget.');
  process.exitCode = 1;
} else if (initialBytes > policy.initial.warningBytes) {
  console.warn('Initial bundle exceeds the warning budget.');
}
