# NatiPsy

This project was generated using [Angular CLI](https://github.com/angular/angular-cli) version 19.2.0.

## Development server

To start a local development server, run:

```bash
ng serve
```

Once the server is running, open your browser and navigate to `http://localhost:4200/`. The application will automatically reload whenever you modify any of the source files.

## Code scaffolding

Angular CLI includes powerful code scaffolding tools. To generate a new component, run:

```bash
ng generate component component-name
```

For a complete list of available schematics (such as `components`, `directives`, or `pipes`), run:

```bash
ng generate --help
```

## Building

To build the project run:

```bash
ng build
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

This will compile your project and store the build artifacts in the `dist/` directory. By default, the production build optimizes your application for performance and speed.

## Container deployment

The production container is a static Nginx image pinned by digest and listens on unprivileged port `8080`. Compose runs it as UID/GID `101:101` with a read-only root filesystem, dropped capabilities, `no-new-privileges`, and writable Nginx paths supplied through `tmpfs`. The external `caddy-network` must be created by the host/reverse-proxy owner (`docker network create caddy-network`) before `docker compose up -d`; Caddy should proxy to service `psicologa-web:8080`. The image healthcheck requests `/index.html`.

## Running unit tests

To execute unit tests with the [Karma](https://karma-runner.github.io) test runner, use the following command:

```bash
ng test
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

For end-to-end (e2e) testing, run:

```bash
ng e2e
```

Angular CLI does not come with an end-to-end testing framework by default. You can choose one that suits your needs.

## Additional Resources

For more information on using the Angular CLI, including detailed command references, visit the [Angular CLI Overview and Command Reference](https://angular.dev/tools/cli) page.
