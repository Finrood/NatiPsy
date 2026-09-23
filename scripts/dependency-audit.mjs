import assert from 'node:assert/strict';
import { readFile } from 'node:fs/promises';

const lockfile = JSON.parse(
  await readFile(new URL('../package-lock.json', import.meta.url), 'utf8'),
);
const severityRank = { LOW: 0, MODERATE: 1, HIGH: 2, CRITICAL: 3 };
const packages = new Map();

for (const [packagePath, entry] of Object.entries(lockfile.packages ?? {})) {
  if (packagePath === '' || !entry.version) continue;
  const name = entry.name ?? packagePath.split('node_modules/').at(-1);
  if (!name) continue;
  const key = `${name}@${entry.version}`;
  const existing = packages.get(key);
  packages.set(key, {
    name,
    version: entry.version,
    production: Boolean(existing?.production || entry.dev !== true),
  });
}

assert.ok(packages.size > 0, 'package-lock.json must contain installable packages');

const response = await fetch('https://api.osv.dev/v1/querybatch', {
  method: 'POST',
  headers: { 'content-type': 'application/json' },
  body: JSON.stringify({
    queries: [...packages.values()].map(({ name, version }) => ({
      package: { name, ecosystem: 'npm' },
      version,
    })),
  }),
  signal: AbortSignal.timeout(30_000),
});

if (!response.ok) {
  throw new Error(`OSV dependency audit failed with HTTP ${response.status}`);
}

const report = await response.json();
const findings = [];
const packageList = [...packages.values()];

for (const [index, result] of (report.results ?? []).entries()) {
  const dependency = packageList[index];
  for (const advisory of result.vulns ?? []) {
    if (advisory.withdrawn) continue;
    const severity = String(advisory.database_specific?.severity ?? 'UNKNOWN').toUpperCase();
    const rank = severityRank[severity] ?? 2;
    const minimum = dependency.production ? severityRank.MODERATE : severityRank.HIGH;
    if (rank >= minimum) {
      findings.push({
        dependency: `${dependency.name}@${dependency.version}`,
        severity,
        id: advisory.id,
        summary: advisory.summary ?? 'No summary provided',
      });
    }
  }
}

if (findings.length > 0) {
  console.error('Dependency policy failed:');
  for (const finding of findings) {
    console.error(`- ${finding.severity} ${finding.id} ${finding.dependency}: ${finding.summary}`);
  }
  process.exitCode = 1;
} else {
  console.log(`Dependency policy passed: scanned ${packages.size} locked packages with OSV.`);
}
