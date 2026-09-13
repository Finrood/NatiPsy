import process from 'node:process';

const canonicalSitemap = 'https://psicologanataliaferreira.com/sitemap.xml';

export function validateRobots(body, expectedSitemap = canonicalSitemap) {
  const userAgentLines = body.match(/^User-agent:\s*\*\s*$/gim) || [];
  const allowLines = body.match(/^Allow:\s*\/\s*$/gim) || [];
  const disallowLines = body.match(/^Disallow:\s*\/404\s*$/gim) || [];
  const sitemapLines = body.match(/^Sitemap:\s*(\S+)\s*$/gim) || [];

  if (userAgentLines.length !== 1 || allowLines.length !== 1 || disallowLines.length !== 1) {
    throw new Error('robots.txt must contain exactly one canonical User-agent, Allow, and /404 Disallow directive');
  }

  if (sitemapLines.length !== 1 || sitemapLines[0].split(':').slice(1).join(':').trim() !== expectedSitemap) {
    throw new Error(`robots.txt must contain exactly one Sitemap: ${expectedSitemap} directive`);
  }
}

export async function runRobotsSmokeCheck(baseUrl = process.env.SMOKE_BASE_URL) {
  if (!baseUrl) {
    throw new Error('SMOKE_BASE_URL is required, for example https://example.com');
  }

  const url = new URL('/robots.txt', baseUrl);
  const response = await fetch(url, { redirect: 'manual' });
  if (response.status !== 200) {
    throw new Error(`/robots.txt returned HTTP ${response.status}; expected 200`);
  }
  validateRobots(await response.text());
  console.log(`PASS ${response.status} ${url}`);
}

if (import.meta.url === `file://${process.argv[1]}`) {
  runRobotsSmokeCheck().catch((error) => {
    console.error(`FAIL ${error.message}`);
    process.exitCode = 1;
  });
}
