# NatiPsy

This project uses Angular 22 with SSR/prerendered routes.

## Requirements

Use Node.js `22.22.3+`, `24.15.0+`, or `26.0.0+` (the Angular-supported lines) and npm 10+.

## Development server

```bash
npm start
```

Open `http://localhost:4200/` after the server starts. The command regenerates the blog artifacts before starting Angular.

## Code scaffolding

```bash
npx ng generate component component-name
npx ng generate --help
```

## Building

```bash
npm run build
```

Blog Markdown and authored blog images live under `content/blog`, outside the
public asset tree. The blog generator stages a clean publish set, copies only
assets referenced by validated publishable posts, atomically replaces generated
outputs, and the production build fails if Markdown sources enter `dist`.

## Production robots monitoring

`npm run smoke:robots` checks the live `/robots.txt` policy, including one
canonical `Sitemap` directive. The same bounded assertion runs daily through
GitHub Actions and can be run manually after deployment. Configure the
repository secret `SMOKE_BASE_URL`; a failure should be routed to the
deployment/on-call notification destination. The workflow retries once after a
failed probe; treat two consecutive failures as an alert and record the DNS or
origin change, origin logs, and two-network results in the deployment log.

## Production smoke monitoring

After a deployment, set `SMOKE_BASE_URL` and run `npm run smoke:production`.
The same bounded check runs daily through GitHub Actions and fails on origin
errors, redirects, timeouts, or the deliberate home-heading smoke marker
mismatch. Configure the repository secret `SMOKE_BASE_URL` and route workflow
failures to the deployment/on-call notification destination. The workflow
retries once after a failed probe; treat two consecutive failures as an alert.

For each deployment incident, record the DNS/origin change, origin logs, and
results from two independent network vantage points in the deployment log. The
repository cannot attest to those external observations until an operator has
filled them in.

This will compile your project and store the build artifacts in the `dist/` directory. By default, the production build optimizes your application for performance and speed.

## Container deployment

The production container is a static Nginx image pinned by digest and listens on unprivileged port `8080`. Compose runs it as UID/GID `101:101` with a read-only root filesystem, dropped capabilities, `no-new-privileges`, and writable Nginx paths supplied through `tmpfs`. The external `caddy-network` must be created by the host/reverse-proxy owner (`docker network create caddy-network`) before `docker compose up -d`; Caddy should proxy to service `psicologa-web:8080`. The image healthcheck requests `/index.html`.

## Optional SSR server

The Angular SSR server is optional; the production Docker image serves the prerendered browser output with Nginx. When running the Node server, set `PUBLIC_ORIGIN` to the canonical absolute `http(s)` origin (for example `https://psicologanataliaferreira.com`). It is deliberately not derived from request `Host` or forwarded headers. `/healthz` is the liveness endpoint, and SIGTERM/SIGINT drain the listener before exit.

## Running unit tests

To execute unit tests with the [Karma](https://karma-runner.github.io) test runner, use the following command:

```bash
npm test -- --watch=false
```

## End-to-end and accessibility tests

Install Chromium once, then run the Playwright/axe suite:

```bash
npm run e2e:install
npm run e2e
```

## Quality gates

The GitHub Actions quality workflow runs the following checks. Run the same
commands locally before opening or updating a pull request:

```bash
npm ci
npm run build:blog-index
git diff --exit-code -- public/assets/content/blog src/routes.txt public/sitemap.xml
npm run audit:security
npm test -- --watch=false
npm run build -- --configuration=production
docker build --check .
```

## Running end-to-end tests
The suite covers home/mobile navigation, filter URL state, article direct/client navigation, console/hydration warnings, and serious/critical axe violations.

## Production build and Docker

```bash
npm run build
docker build --check .
docker compose config
```

The production image serves the generated static browser output through Nginx. See `nginx.conf` for route and cache behavior.

## Additional resources

See the [Angular CLI documentation](https://angular.dev/tools/cli) for general CLI commands.
