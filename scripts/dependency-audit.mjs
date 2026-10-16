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
const packageList = [...packages.values()];
// NOTE: querybatch entries only carry {id, modified} — severity and summary
// must be resolved per advisory via the full vuln record. Reading them from
// the batch response silently degrades every finding to UNKNOWN.
const affectedById = new Map();
for (const [index, result] of (report.results ?? []).entries()) {
  const dependency = packageList[index];
  for (const advisory of result.vulns ?? []) {
    if (advisory.withdrawn) continue;
    if (!affectedById.has(advisory.id)) affectedById.set(advisory.id, []);
    affectedById.get(advisory.id).push(dependency);
  }
}

async function fetchDetail(id) {
  const detailResponse = await fetch(`https://api.osv.dev/v1/vulns/${id}`, {
    signal: AbortSignal.timeout(30_000),
  });
  if (!detailResponse.ok) {
    throw new Error(`OSV vuln lookup failed for ${id} with HTTP ${detailResponse.status}`);
  }
  return detailResponse.json();
}

// Small bounded pool to stay friendly to the OSV API.
const ids = [...affectedById.keys()];
const details = new Map();
const concurrency = 5;
for (let cursor = 0; cursor < ids.length; cursor += concurrency) {
  const batch = await Promise.all(ids.slice(cursor, cursor + concurrency).map(fetchDetail));
  for (const detail of batch) details.set(detail.id, detail);
}

const findings = [];
for (const [id, dependencies] of affectedById) {
  const detail = details.get(id);
  const severity = String(detail?.database_specific?.severity ?? 'UNKNOWN').toUpperCase();
  // Fail closed when OSV carries no severity for an advisory.
  const rank = severityRank[severity] ?? 2;
  const summary = detail?.summary ?? 'No summary provided';
  for (const dependency of dependencies) {
    const minimum = dependency.production ? severityRank.MODERATE : severityRank.HIGH;
    if (rank >= minimum) {
      findings.push({
        dependency: `${dependency.name}@${dependency.version}`,
        severity,
        id,
        summary,
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
