import { APP_BASE_HREF } from '@angular/common';
import { CommonEngine, isMainModule } from '@angular/ssr/node';
import express from 'express';
import { dirname, join, resolve } from 'node:path';
import { existsSync, statSync } from 'node:fs';
import { fileURLToPath } from 'node:url';
import bootstrap from './main.server';

const serverDistFolder = dirname(fileURLToPath(import.meta.url));
const browserDistFolder = resolve(serverDistFolder, '../browser');
const indexHtml = join(serverDistFolder, 'index.server.html');

/**
 * Pages that render with a noindex robots meta carry error semantics
 * (404 / error pages): reflect them in the HTTP status so search engines
 * don't record soft-404s. Matches attribute order both ways.
 */
const NO_INDEX_META =
  /<meta[^>]*(?:name="robots"[^>]*content="[^"]*noindex|content="[^"]*noindex"[^>]*name="robots")[^>]*>/i;

/** Angular/esbuild output hashes aren't hex-only (e.g. main-TARQSBXP.js). */
const HASHED_ASSET = /-[A-Za-z0-9_-]{8}(\.[cm]?js|\.css)$/;

const app = express();
const commonEngine = new CommonEngine({
  allowedHosts: [
    'localhost',
    '127.0.0.1',
    'psicologanataliaferreira.com',
    'www.psicologanataliaferreira.com',
  ],
});

/**
 * Example Express Rest API endpoints can be defined here.
 * Uncomment and define endpoints as necessary.
 *
 * Example:
 * ```ts
 * app.get('/api/**', (req, res) => {
 *   // Handle API request
 * });
 * ```
 */

/**
 * Serve prerendered pages when they exist (/, /blog, prerendered posts).
 * Users and crawlers hit these instantly instead of paying runtime SSR
 * cost per request; routes without a pre-built page fall through to the
 * CommonEngine below.
 */
app.use((req, res, next) => {
  if (req.method !== 'GET' && req.method !== 'HEAD') {
    next();
    return;
  }

  try {
    const decodedPath = decodeURIComponent(req.path).replace(/\/+$/, '') || '/';
    const routeDir = resolve(browserDistFolder, `.${decodedPath}`);

    // Traversal guard: anything escaping the browser folder is ignored.
    if (!routeDir.startsWith(browserDistFolder)) {
      next();
      return;
    }

    const candidate = join(routeDir, 'index.html');
    if (existsSync(candidate) && statSync(candidate).isFile()) {
      // Prerendered HTML is regenerated on every deploy: allow immediate updates.
      res.setHeader('Cache-Control', 'public, max-age=0, must-revalidate');
      res.sendFile(candidate, (err) => err && next(err));
      return;
    }
  } catch {
    // Malformed percent-encoding or FS errors fall through to SSR.
  }
  next();
});

/**
 * Serve static files from /browser with intent-revealing cache headers:
 * - hashed JS/CSS bundles: immutable for a year
 * - crawl-control documents (robots.txt/sitemap.xml): refresh hourly
 * - unhashed media (images/favicon/icons): one week
 */
app.use(
  express.static(browserDistFolder, {
    index: false,
    setHeaders: (res, filePath) => {
      if (HASHED_ASSET.test(filePath)) {
        res.setHeader('Cache-Control', 'public, max-age=31536000, immutable');
      } else if (/\.(txt|xml)$/.test(filePath)) {
        res.setHeader('Cache-Control', 'public, max-age=3600');
      } else {
        res.setHeader('Cache-Control', 'public, max-age=604800');
      }
    },
  }),
);

/**
 * Handle all other GET requests by rendering the Angular application.
 * Uses middleware instead of a wildcard route pattern because Express 5
 * (path-to-regexp v8) no longer accepts the '*'/'**' route syntax.
 */
app.use((req, res, next) => {
  if (req.method !== 'GET' && req.method !== 'HEAD') {
    next();
    return;
  }

  const { protocol, originalUrl, baseUrl, headers } = req;

  commonEngine
    .render({
      bootstrap,
      documentFilePath: indexHtml,
      url: `${protocol}://${headers.host}${originalUrl}`,
      publicPath: browserDistFolder,
      providers: [{ provide: APP_BASE_HREF, useValue: baseUrl }],
    })
    .then((html) => {
      if (NO_INDEX_META.test(html)) {
        res.status(404);
      }
      res.send(html);
    })
    .catch((err) => next(err));
});

/**
 * Start the server if this module is the main entry point.
 * The server listens on the port defined by the `PORT` environment variable, or defaults to 4000.
 */
if (isMainModule(import.meta.url)) {
  const port = process.env['PORT'] || 4000;
  app.listen(port, () => {
    console.log(`Node Express server listening on http://localhost:${port}`);
  });
}

export default app;
