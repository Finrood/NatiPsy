import process from 'node:process';

export const smokePaths = [
  { path: '/', markers: ['Terapia Online | Psicoterapia'] },
  { path: '/blog', markers: ['<section id="blog-list-start"', 'Blog'] },
  { path: '/sitemap.xml', markers: ['<urlset', '<loc>'] },
  {
    path: process.env.SMOKE_ARTICLE_PATH || '/blog/carreira-mulheres-negras-fadiga-racial',
    markers: ['<article', '<h1'],
  },
];

export function validateSmokeResponse(path, status, body) {
  if (status !== 200) {
    throw new Error(`${path} returned HTTP ${status}; expected 200`);
  }

  const expected = smokePaths.find((entry) => entry.path === path)?.markers ?? [];
  const normalizedBody = body.toLowerCase();
  const missing = expected.filter((marker) => !normalizedBody.includes(marker.toLowerCase()));
  if (missing.length > 0) {
    throw new Error(`${path} returned 200 without stable markers: ${missing.join(', ')}`);
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
    try {
      const response = await fetch(url, {
        redirect: 'manual',
        signal: AbortSignal.timeout(10_000),
        headers: {
          Accept: path.endsWith('.xml')
            ? 'application/xml,text/xml;q=0.9,*/*;q=0.8'
            : 'text/html,application/xhtml+xml;q=0.9,*/*;q=0.8',
          'User-Agent':
            'Mozilla/5.0 (X11; Linux x86_64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/125.0.0.0 Safari/537.36 NatiPsyProductionSmoke/1.0',
        },
      });
      const body = await response.text();
      try {
        validateSmokeResponse(path, response.status, body);
      } catch (error) {
        const ray = response.headers.get('cf-ray');
        const server = response.headers.get('server');
        throw new Error(
          `${error.message} (host=${url.hostname}, server=${server ?? 'unknown'}, cf-ray=${ray ?? 'none'})`,
        );
      }
      console.log(`PASS ${response.status} ${url}`);
    } catch (error) {
      if (error?.name === 'TimeoutError' || error?.name === 'AbortError') {
        throw new Error(`${path} timed out after 10000ms`);
      }
      throw error;
    }
  }
}

if (import.meta.url === `file://${process.argv[1]}`) {
  runSmokeCheck().catch((error) => {
    console.error(`FAIL ${error.message}`);
    process.exitCode = 1;
  });
}
