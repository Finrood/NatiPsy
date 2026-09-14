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

This generates the blog artifacts and production output under `dist/`.

## Unit tests

```bash
npm test -- --watch=false
```

## End-to-end and accessibility tests

Install Chromium once, then run the Playwright/axe suite:

```bash
npm run e2e:install
npm run e2e
```

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
