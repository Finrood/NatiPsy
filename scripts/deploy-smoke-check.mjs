import process from 'node:process';

export const smokePaths = [
  { path: '/', marker: '<html' },
  { path: '/blog', marker: '<html' },
  { path: '/sitemap.xml', marker: '<urlset' },
  {
    path: process.env.SMOKE_ARTICLE_PATH || '/blog/carreira-mulheres-negras-fadiga-racial',
    marker: '<html',
  },
];

export function validateSmokeResponse(path, status, body) {
  if (status !== 200) {
    throw new Error(`${path} returned HTTP ${status}; expected 200`);
  }

  const expected = smokePaths.find((entry) => entry.path === path)?.marker;
  if (expected && !body.toLowerCase().includes(expected)) {
    throw new Error(`${path} returned 200 without the expected ${expected} marker`);
  }
}

export async function runSmokeCheck(baseUrl = process.env.SMOKE_BASE_URL) {
  if (!baseUrl) {
    throw new Error('SMOKE_BASE_URL is required, for example https://example.com');
  }

  const origin = new URL(baseUrl);
  if (!['http:', 'https:'].includes(origin.protocol)) {
    throw new Error('SMOKE_BASE_URL must use HTTP or HTTPS');
  }

  for (const { path } of smokePaths) {
    const url = new URL(path, origin);
    const response = await fetch(url, { redirect: 'manual' });
    const body = await response.text();
    validateSmokeResponse(path, response.status, body);
    console.log(`PASS ${response.status} ${url}`);
  }
}

if (import.meta.url === `file://${process.argv[1]}`) {
  runSmokeCheck().catch((error) => {
    console.error(`FAIL ${error.message}`);
    process.exitCode = 1;
  });
}
