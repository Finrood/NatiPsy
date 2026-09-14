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

## Production serving model

The production image serves Angular's prerendered browser output as static files
with Nginx. The build generates `index.html` for `/`, `/blog`, and each article;
Nginx resolves those extensionless paths internally, redirects trailing-slash
variants to their canonical no-slash URLs, and returns the branded
`/404/index.html` with HTTP 404 and `noindex` for unknown paths. The Express SSR
entry point is not the production serving contract.

This will compile your project and store the build artifacts in the `dist/` directory. By default, the production build optimizes your application for performance and speed.

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
