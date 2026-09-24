# NatiPsy — Authoritative Technical Audit and Improvement Backlog

This is the single authoritative file for project findings. Do not create a second audit, TODO, or improvement ledger. New findings, implementation PR links, status changes, and closure evidence belong here.

## Audit control

| Field | Value |
| --- | --- |
| Last reconciled | 2026-09-24 |
| Verified code baseline | `master` at `c18de1267a43b1ee798d7a549c2c211ecabba5db` after [PR #74](https://github.com/Finrood/NatiPsy/pull/74); owner deployment remains pending |
| Original audit baseline | 2026-09-12 at `23d203a`; retained below as historical evidence |
| Scope | Angular frontend and SSR, content pipeline, tests, dependencies, Docker, Compose, Nginx, production HTTP behavior, accessibility, responsive design, UX, performance, security, reliability, SEO, structured data, and content architecture |
| Current AUD findings | **46** (`AUD-001` through `AUD-046`): **40 RESOLVED, 6 PARTIAL, 0 REOPENED, 0 OPEN** |
| Current actionable findings | **6**: `AUD-001`, `AUD-024`, `AUD-033`, `AUD-039`, `AUD-040`, `AUD-044` (mostly post-deployment verification) |
| Implementation PR coverage | `AUD-001`–`AUD-042` merged as PRs #30–#71; `AUD-043` was implemented by merged PR #44, PR #72 was closed as superseded, and follow-up fixes merged in [PR #74](https://github.com/Finrood/NatiPsy/pull/74) |
| Historical findings | **23**: 20 resolved, 3 carried into the 2026-09-12 backlog |
| Total unique findings documented | **66** (23 historical + 40 from the 2026-09-12 audit + 3 added on 2026-09-24) |

`RESOLVED` means the merged implementation and relevant checks have no known remaining acceptance gap. `PARTIAL` means material work is merged but an explicit operational, external, visual, or owner-dependent acceptance check remains unverified. `REOPENED` means new live/build evidence contradicts a prior acceptance claim. `OPEN` means a newly identified problem has no completed fix. A merged PR is implementation evidence, not automatic closure.

## Current verification (2026-09-24)

- The [Quality run on the verified code baseline](https://github.com/Finrood/NatiPsy/actions/runs/35924531455) passed. A separate clean checkout passed the pinned install, lint, format check, production build, 60 unit tests, and 42 local Chromium tests. The OSV policy scanned 751 locked packages successfully; a fresh npm audit reported zero production or development advisories.
- The public site serves matching main/style asset hashes, and its feed, sitemap, and robots file match the generated files byte-for-byte. The production smoke and robots checks passed from the review environment. All eight sitemap URLs returned 200; an unknown URL returned a real 404. The RSS feed returns 200 with `application/rss+xml`, short revalidating cache, security headers, and valid XML.
- The [GitHub-hosted Production smoke workflow](https://github.com/Finrood/NatiPsy/actions/workflows/production-smoke.yml) still receives Cloudflare 403 from Bot Fight Mode (correlated in Cloudflare Security Analytics with runner IP `52.234.40.200` and Ray IDs `a403792aee0f7af4-SJC` / `a403792bfadb5585-SJC`). The owner explicitly declined outage alerts. The follow-up removes the daily schedule, retains a manual smoke command, and reports Cloudflare Ray IDs on failure. Do not claim a green GitHub-hosted uptime monitor or weaken Bot Fight Mode globally.
- The pre-fix production browser suite passed **29/42**. [PR #74](https://github.com/Finrood/NatiPsy/pull/74) addresses the twelve pre-hydration failures by keeping filter controls disabled until ready while retaining native article links, and the remaining CSP violation by permitting only Cloudflare's chosen analytics beacon. Its local build passed 48 browser tests, 60 unit tests, lint, formatting, article-fragment and security-header checks; PR Quality, container and Nginx jobs passed. Production acceptance awaits the owner's deployment.
- The follow-up also corrects the broken category URL and preserves all nine prerendered article heading IDs. A four-viewport homepage review (320, 390, 768, 1440 px) found no horizontal overflow or overlapping primary CTA; a local mobile Lighthouse run recorded accessibility/SEO 100, CLS 0, and performance 78. These code fixes have not yet been deployed.
- Cloudflare Email Address Obfuscation is off. The six live sitemap pages now contain a real `mailto:` link and no `/cdn-cgi/l/email-protection` link. Google Search Console domain ownership is verified by a DNS TXT record; the sitemap was resubmitted on 24 September. Live URL inspection found `/blog`, both service pages, the contact/privacy page, and the article available to Google, and indexing requests for all five were accepted. Google's index/coverage updates remain asynchronous.
- GitHub reports `master` protected with required `quality` check, up-to-date branch requirement, pull requests without a human approval requirement, linear history, conversation resolution, and force-push/deletion disabled. Administrators retain an explicit recovery path, not a routine bypass. The owner approved the public identity, SEO wording, crawler policy, category classification, and quarterly editorial review.

## Historical baseline (2026-09-12; not current)

The following measurements explain the original findings. They must not be read as the current build, dependency, or production state.

- Production build: passed with Node `v26.8.2`; 3 routes prerendered. Initial browser payload is **492.26 kB raw / 131.59 kB estimated transfer**. `main` is 212.02 kB raw. The documentation-only audit expansion changed the styles artifact again, reinforcing AUD-034.
- Unit tests: **24 passed in 13 files** with Node `v26.8.2`. The shell’s Node `v22.22.2` cannot start Angular 22 because Angular requires at least `22.22.3`, proving the toolchain is not pinned adequately.
- Dependency audit: **7 advisories** in the full tree (**4 high, 3 moderate, 0 critical**). The production-only tree has one moderate `qs` advisory through Express. The current final Docker image serves static files and does not contain Node dependencies, but the repository also advertises an SSR server.
- Docker/Compose: `docker compose config` and `docker build --check .` pass. A real build transferred **334.26 MB** of context. The repository directory is **384 MB**, chiefly `node_modules`, `.git`, and `.angular`; no `.dockerignore` exists, so Docker receives an effectively empty ignore file. Two complete build attempts then failed inside `npm ci` because the audit environment’s Docker DNS returned `EAI_AGAIN` for `registry.npmjs.org`; this is recorded as an environment limitation, not misreported as a repository failure. The exact Nginx base/config was still tested with the already-built browser output.
- Browser checks: exercised the home page, mobile navigation, blog filters, archive, article, and client-side route transitions at 390×844. Chrome reported `NgOptimizedImage` aspect-ratio and LCP-priority warnings. A second gap pass confirmed that article navigation leaves focus on `<body>`, the article H1 begins around y=696 px, ten article-topic chips occupy 208 px, and nine content headings have neither IDs nor a table of contents.
- Prerender/hydration payload: the final generated article HTML is **113,858 bytes**. Its `ng-state` block is **26,613 bytes**, including two copies of the same approximately 10.8 kB post object—one from Angular's automatic HTTP transfer cache and one from the application's custom `TransferState` key. A distinctive body sentence appears three times in the document: once as rendered article HTML and twice in serialized state.
- Live HTTP checks, repeated after the interrupted audit: `/`, `/blog`, `/sitemap.xml`, and an unknown route return **Cloudflare 523**. `/robots.txt` returns a Cloudflare-generated policy, not `public/robots.txt`.
- Repository coverage: all tracked application, template, style, content, configuration, container, script, and test files were inspected. Generated bundles and asset dimensions were checked separately.

## Priority and follow-up rules

- `P0`: current production availability or crawl-control incident. Diagnose immediately.
- `P1`: high-impact correctness, security, data, SEO, or delivery risk.
- `P2`: material performance, maintainability, accessibility, or UX issue.
- `P3`: useful polish or strategic improvement with lower urgency.
- Reproduce the current gap on the verified baseline before implementing a follow-up. Previously merged PRs must not be recreated.
- Keep each remaining fix scoped, test the live/prerendered behavior named in its acceptance criteria, and close it only when the evidence is recorded here.
- Do not fabricate clinical, credential, address, review, or business information. Where owner input is required, implement only the safe infrastructure and record the unanswered decision.

## Current actionable findings

| Finding | State | Remaining acceptance or next action |
| --- | --- | --- |
| AUD-001 | PARTIAL / P1 | Manual smoke remains; GitHub runner is challenged by Cloudflare. No scheduled outage alerts, per owner decision. |
| AUD-024 | PARTIAL / P2 | Retained Cloudflare Analytics has an exact CSP allowlist in the follow-up; verify live after deployment. |
| AUD-033 | PARTIAL / P3 | Search Console is verified and sitemap resubmitted; await processing/indexing and decide when to activate the canonical-host redirect after deployment. |
| AUD-039 | PARTIAL / P2 | Nine static article fragments pass locally; verify live after deployment. |
| AUD-040 | PARTIAL / P2 | Category link and test are fixed locally; verify live after deployment. |
| AUD-044 | PARTIAL / P1 | Slow-load and no-JavaScript browser tests pass locally; verify production after deployment. |

## Finding record

The original `Evidence` and `Why this matters` paragraphs below describe the 2026-09-12 pre-fix state. The status line and current verification above take precedence for present-day state. Every original implementation has a merged PR; AUD-043's implementation is in PR #44 even though its dedicated PR #72 was superseded.

### AUD-001 — Production origin is unreachable through Cloudflare

- **Status / priority:** `PARTIAL / P1`
- **Implementation PR:** [#30](https://github.com/Finrood/NatiPsy/pull/30)
- **Current gap (2026-09-24):** The origin is reachable and the direct four-path smoke passes. GitHub-hosted Production smoke receives Cloudflare 403 because Bot Fight Mode challenges the runner; Cloudflare Security Analytics correlates its IP and Ray IDs. The owner explicitly chose **no outage alerts**, so the follow-up removes the daily schedule, retains manual invocation, and adds diagnostic Ray IDs. Do not claim this is a working external monitor. Cloudflare Free Bot Fight Mode has no narrow bypass for this runner; disabling it globally would be an unwarranted security reduction.
- **Branch:** `codex/aud-001-production-origin-523`
- **Area:** Production, reliability, SEO
- **Evidence:** On 2026-09-12, repeated requests to the home page, `/blog`, `/sitemap.xml`, the article route, and an unknown route returned Cloudflare HTTP `523` with `error code: 523`. Only Cloudflare’s managed `/robots.txt` was available.
- **Why this matters:** A 523 means Cloudflare cannot reach the configured origin. Users and search crawlers cannot load the site, so every design, conversion, and ranking improvement is irrelevant until origin connectivity is restored. Prolonged failure can remove pages from search results.
- **Best fix:** Diagnose production outside the application code: confirm the Cloudflare A/AAAA records point to the current public origin; remove a stale AAAA record if the origin has no working IPv6; confirm the host, Caddy, Docker service, port mapping, firewall, TLS mode, and external `caddy-network`; inspect origin and reverse-proxy logs; confirm Cloudflare IP ranges are allowed. In the repository, add a deploy smoke check that fails unless `/`, `/blog`, `/sitemap.xml`, and one known article return 200 with expected content. Add an external uptime check that alerts on two consecutive failures. Never “fix” this by bypassing TLS or disabling the firewall globally.
- **Acceptance:** From two external networks, all known URLs return 200; origin logs show the requests; the deploy smoke test fails on a simulated 523/non-200; an alert destination is documented; the PR states which DNS/origin change was made. If production access is unavailable to the implementer, the PR must say `OWNER ACTION REQUIRED` and must not claim the incident is resolved.

### AUD-002 — Cloudflare’s managed robots file hides the repository sitemap directive

- **Status / priority:** `RESOLVED / P2`
- **Implementation PR:** [#31](https://github.com/Finrood/NatiPsy/pull/31)
- **Closure evidence (2026-09-24):** The owner approved the current crawler policy. Live `/robots.txt` exactly exposes `User-agent: *`, `Allow: /`, `Disallow: /404`, and the canonical sitemap; Cloudflare's managed override is not replacing it, and the scheduled robots smoke passes. Search Console's robots exclusion is the intentionally blocked raw Markdown source asset, not a public HTML page.
- **Branch:** `codex/aud-002-live-robots-sitemap`
- **Area:** Deployment, crawl control, SEO
- **Evidence:** `public/robots.txt` allows crawling and declares `Sitemap: https://psicologanataliaferreira.com/sitemap.xml`. The live `/robots.txt` is a much larger Cloudflare-generated content-signals file and contains no `Sitemap:` line.
- **Why this matters:** Production behavior differs from source control, and crawlers lose a direct sitemap discovery signal. It also means a future repository robots change may never reach users.
- **Best fix:** In Cloudflare, disable the managed robots override or configure it to preserve/append the project’s required directives. Add a post-deploy assertion that fetches the public file and verifies exactly one `User-agent: *`, `Allow: /`, `Disallow: /404`, and the canonical `Sitemap:` line. Keep AI-crawler policy as an explicit owner decision; do not accidentally change it while restoring the sitemap.
- **Acceptance:** The live file includes the canonical sitemap URL, the deployed policy matches the owner-approved crawler policy, and an automated check detects future edge/source drift. External dashboard work must be recorded in the PR.

### AUD-003 — The deployed Nginx contract creates soft 404s and contradicts the SSR contract

- **Status / priority:** `RESOLVED / P1`
- **Implementation PR:** [#32](https://github.com/Finrood/NatiPsy/pull/32)
- **Branch:** `codex/aud-003-deployment-contract-404`
- **Area:** Docker, Nginx, SSR, SEO
- **Files:** `Dockerfile:18-28`, `nginx.conf:25-36`, `src/server.ts:102-130`, `package.json:11`
- **Evidence:** Angular builds both browser and server outputs, and `serve:ssr:NatiPsy` advertises Express SSR with 404 status handling. The final image copies only `dist/nati-psy/browser` into Nginx. Runtime testing showed an unknown path returns the homepage shell with HTTP 200. It also showed `/blog` and the canonical article URL return 301 to trailing-slash directories, even though internal links, sitemap, and canonical tags intentionally use no trailing slash. The Express status logic is not deployed.
- **Why this matters:** Unknown URLs become soft 404s, which wastes crawl capacity and sends contradictory indexing signals. Canonical URLs incur an avoidable redirect to a conflicting form; behind an HTTP reverse proxy, Nginx can construct an absolute `http://` directory redirect unless forwarded-origin behavior is deliberately configured. Two unaligned production paths also increase maintenance and incident risk.
- **Best fix:** Make one explicit deployment decision. Recommended for this small, fully prerenderable site: use a static contract, generate a real `/404/index.html`, and configure Nginx to serve `$uri/index.html` internally for known extensionless routes without exposing a trailing-slash redirect. Unknown routes must use a branded 404 via `error_page`; never use a universal `/index.html` 200 fallback. If runtime SSR is genuinely required, deploy the Node server instead and remove the static-only fallback. Configure trusted proxy/origin handling or relative redirects for any redirects that remain. Remove the unused production SSR claim or label it development-only. Add status/content/location tests for root, both slash forms, archive, article, assets, malformed paths, and unknown paths.
- **Acceptance:** The Docker image has one documented serving model; canonical no-slash deep links return 200 without a hop; trailing-slash variants perform one intentional permanent redirect to the canonical no-slash URL; no redirect downgrades HTTPS or loses the public host/port; unknown paths return a branded page with HTTP 404 and `noindex`; assets return their correct status; README and scripts describe the same production model.

### AUD-004 — The header is transparent on the initial SSR/hydrated render

- **Status / priority:** `RESOLVED / P1`
- **Implementation PR:** [#33](https://github.com/Finrood/NatiPsy/pull/33)
- **Branch:** `codex/aud-004-header-initial-background`
- **Area:** Design, hydration, accessibility
- **Files:** `src/app/components/top-menu/top-menu.component.html:1-7`
- **Evidence:** At initial load the header’s computed background was transparent and none of the `[ngClass]` background classes were present. After the first scroll event, `bg-white/95 backdrop-blur-md` appeared. On mobile, the navy logo and menu icon can sit over dark page/browser content before any interaction.
- **Why this matters:** The navigation is visually unreliable at the most important first paint, and contrast depends on content behind a fixed header. It also indicates an SSR/hydration regression that unit smoke tests do not catch.
- **Best fix:** Put the safe initial background classes in the static `class` list, then conditionally add only state deltas such as shadow/open color/translation. Alternatively use one deterministic computed class that produces identical SSR and first-client output. Do not defer the default state to a scroll event.
- **Acceptance:** Before scrolling or clicking, computed background is nontransparent at 320, 390, 768, and 1440 px; logo, toggle, and navigation pass contrast; there is no hydration warning; a prerender/hydration regression test asserts the initial class or computed style.

### AUD-005 — Blog query parameters cannot be cleared and invalid values are not normalized

- **Status / priority:** `RESOLVED / P1`
- **Implementation PR:** [#34](https://github.com/Finrood/NatiPsy/pull/34)
- **Branch:** `codex/aud-005-blog-query-normalization`
- **Area:** Functional correctness, URL state, SEO
- **Files:** `src/app/components/blog-list/blog-list.component.ts:63-70,129-176`
- **Evidence:** Selecting `Carreira` produces `/blog?category=Carreira`; selecting “Todas” leaves that parameter in the URL. `updateQueryParams()` deletes null-valued keys and then navigates with `queryParamsHandling: 'merge'`, so old values survive. Arbitrary `page`, `sortBy`, and `sortDir` strings are accepted; `page=999` renders an empty archive even when posts exist.
- **Why this matters:** UI state and shareable URLs disagree, users can land on false empty states, and crawlers can discover many meaningless parameter combinations.
- **Best fix:** Define parsers for the allowed sort fields/directions and positive integer pages. Let Angular receive `null` for keys that must be removed, or replace the complete query object without `merge`. Once total pages are known, clamp out-of-range pages and replace the URL with the canonical normalized form. Default state must serialize to `/blog` with no query string.
- **Acceptance:** Tests cover set/clear category, set/clear nondefault sort, invalid enum values, `0`, negative, nonnumeric, and excessive pages; UI and URL always agree; default state is `/blog`; normalization uses `replaceUrl` and does not add a history entry.

### AUD-006 — Blog-list state orchestration permits stale work and still relies on manual change detection

- **Status / priority:** `RESOLVED / P1`
- **Implementation PR:** [#35](https://github.com/Finrood/NatiPsy/pull/35)
- **Branch:** `codex/aud-006-blog-reactive-state`
- **Area:** Angular architecture, reliability
- **Files:** `src/app/components/blog-list/blog-list.component.ts:24-133`
- **Evidence:** Every query-parameter emission starts `loadInitialData()`, including page-only changes that only need slicing. Nested subscriptions are not cancelled when a newer parameter state arrives. Rapid changes can let older work overwrite newer state. The component uses mutable public fields plus repeated `markForCheck()` calls, while only the top menu was migrated under the historical signals finding.
- **Why this matters:** The current design is harder to reason about, does redundant processing, and is vulnerable when HTTP latency or the number of posts grows.
- **Best fix:** Build a single typed route-state stream or signal model. Use `switchMap` for cancellable data work; compute categories, filtered/sorted posts, pagination, loading, and empty states from the source index; do not reload the index for page-only changes. Use `toSignal`/`computed` or an async view model so manual `detectChanges`/`markForCheck` is unnecessary. Preserve TransferState behavior and URL normalization from AUD-005 without requiring that PR to be merged.
- **Acceptance:** A marble/fakeAsync test proves an older delayed result cannot overwrite a newer selection; page changes do not issue/reprocess a new index request; component teardown cancels work; templates render from a single consistent state; existing filter/sort/pagination behavior remains intact.

### AUD-007 — Date-only blog dates shift to the previous day and render in English

- **Status / priority:** `RESOLVED / P1`
- **Implementation PR:** [#36](https://github.com/Finrood/NatiPsy/pull/36)
- **Branch:** `codex/aud-007-blog-date-locale`
- **Area:** Content correctness, localization, hydration
- **Files:** `src/app/services/blog.service.ts:36-44,63-70,172-179`, `src/app/components/blog-list/blog-list.component.html:134-137`, `src/app/components/blog-post/blog-post.component.html:95-100`
- **Evidence:** Frontmatter says `2025-04-21`, while a browser in `America/Sao_Paulo` displayed `20 Apr 2025` and `20 April 2025`. Parsing midnight UTC as a JavaScript `Date` shifts the calendar day in negative offsets. Angular’s default locale also produces English month names on a Portuguese page.
- **Why this matters:** The publication date is factually wrong for Brazilian visitors, visually inconsistent with the content language, and may differ between server and browser time zones.
- **Best fix:** Model publication dates as date-only values (`YYYY-MM-DD`) rather than local instants. Either keep the string through the model and formatter or explicitly format in UTC. Register/provide `pt-BR`, use a consistent UTC/date-only formatter, and render semantic `<time datetime="2025-04-21">`. Use the same value for visible text, sitemap, Open Graph, and JSON-LD.
- **Acceptance:** The same date appears as 21 April in UTC, São Paulo, and at least one positive-offset timezone; Portuguese month text is used; SSR and hydrated text match; unit tests freeze time zones or test the pure formatter.

### AUD-008 — Raw Markdown sources are copied into the public production bundle

- **Status / priority:** `RESOLVED / P1`
- **Implementation PR:** [#37](https://github.com/Finrood/NatiPsy/pull/37)
- **Branch:** `codex/aud-008-private-content-sources`
- **Area:** Content pipeline, privacy, release safety
- **Files:** `angular.json:23-27`, `src/scripts/generate-blog-index.js:6-9`, `public/assets/content/blog/*.md`
- **Evidence:** The asset glob copies all of `public`; the production output contains `assets/content/blog/carreira-mulheres-negras-fadiga-racial.md`. The generator may skip an invalid post, but its source file would still be deployed and directly readable.
- **Why this matters:** Draft, unpublished, invalid, or editor-only text can leak even when it is absent from the visible blog index. This is a publishing-control and confidentiality failure.
- **Best fix:** Move authored Markdown outside `public`, for example to repository-level `content/blog`. Generate only the public index and per-post sanitized output into a generated assets directory. Add an explicit `draft`/`published` rule, and ensure drafts produce neither JSON, route, sitemap entry, nor copied source. Add a build assertion that `dist` contains no `.md`, draft, source map containing content, or stale generated post.
- **Acceptance:** Production `dist` has no Markdown; published posts work; drafts and invalid posts are absent from every public artifact; deleting or unpublishing a post removes stale JSON/routes/sitemap entries; tests use temporary fixtures.

### AUD-009 — The blog generator validates weakly, fails open, and accepts unsafe paths

- **Status / priority:** `RESOLVED / P1`
- **Implementation PR:** [#38](https://github.com/Finrood/NatiPsy/pull/38)
- **Branch:** `codex/aud-009-blog-generator-validation`
- **Area:** Build scripts, data integrity, security
- **Files:** `src/scripts/generate-blog-index.js:98-203`
- **Evidence:** Missing required fields and parse failures are logged and skipped while the build continues. Field types and useful constraints are not comprehensively checked. Slugs are derived without URL-safety validation. `path.join(imagesDir, image)` is not a containment check, author avatars are not verified, and equal dates have no deterministic secondary ordering. `start` and `watch` run the generator only once, so editing/adding Markdown while the development watcher is running leaves the visible generated JSON stale.
- **Why this matters:** A malformed post can silently disappear after deployment; a traversal-like image value can escape the intended directory; output order can change across systems; metadata errors propagate into UI and SEO.
- **Best fix:** Extract the generator into testable functions and validate all frontmatter with an explicit schema: URL-safe unique slug, nonempty title/description, strict date-only date, categories array, valid author shape, supported image extension, and optional SEO fields. Resolve referenced files and reject any `path.relative(base, candidate)` that starts with `..` or is absolute. Collect all errors and exit nonzero; never partially publish. Sort by date then slug. Validate generated routes and XML, and write outputs atomically after validation succeeds. Add a lightweight content watch process (or Angular builder integration) so development updates regenerate on Markdown changes without recursive rebuild loops.
- **Acceptance:** Fixture tests cover malformed YAML, missing/wrong types, invalid date, duplicate/unsafe slug, `../` path, missing images/avatar, drafts, and equal dates; a single invalid publishable post post fails the build with file-specific messages; no partial generated files are left behind; editing a Markdown fixture during the documented development command updates its generated JSON once.

### AUD-010 — Dependency audit reports seven known vulnerabilities

- **Status / priority:** `RESOLVED / P1`
- **Implementation PR:** [#39](https://github.com/Finrood/NatiPsy/pull/39)
- **Branch:** `codex/aud-010-dependency-advisories`
- **Area:** Supply chain, security
- **Files:** `package.json`, `package-lock.json`
- **Evidence:** `npm audit` reports 4 high and 3 moderate advisories through `brace-expansion`, `browserslist`, `js-yaml`, `socket.io-parser`, `baseline-browser-mapping`, `body-parser`, and `qs`. `npm audit --omit=dev` still reports the moderate `qs` path through Express. All currently report a fix path.
- **Why this matters:** Development dependencies execute in CI/build environments, and Express becomes production-relevant if the advertised SSR server is deployed. Unused legacy test packages unnecessarily preserve several paths.
- **Best fix:** Update compatible direct/transitive packages and lockfile, remove obsolete Karma/Jasmine paths as described in AUD-027, and resolve the Express chain according to the deployment decision. Do not use `npm audit fix --force` or accept major changes blindly. Review changelogs, regenerate the lock deterministically, run tests/build, and document any accepted advisory with exact exposure and expiry.
- **Acceptance:** `npm audit` has no high advisories and no unapproved production advisories; unit tests and production build pass; lockfile changes contain no unexplained package churn; CI enforces the agreed severity policy.

### AUD-011 — Missing `.dockerignore` sends a 384 MB context and can overwrite container dependencies

- **Status / priority:** `RESOLVED / P1`
- **Implementation PR:** [#40](https://github.com/Finrood/NatiPsy/pull/40)
- **Branch:** `codex/aud-011-dockerignore-context`
- **Area:** Docker, build performance, reproducibility, secret hygiene
- **Files:** `Dockerfile:7-13`; missing `.dockerignore`
- **Evidence:** Repository disk usage is 384 MB (`node_modules` about 334 MB, `.git` 27 MB, `.angular` 19 MB). Docker reports a two-byte effective ignore input. After `RUN npm ci`, `COPY . .` can copy host `node_modules` over Linux/container-installed dependencies.
- **Why this matters:** Builds upload hundreds of unnecessary megabytes, invalidate cache frequently, risk native-module/architecture contamination, and may expose Git history, editor files, logs, coverage, or local secrets to the build context.
- **Best fix:** Add a narrowly scoped `.dockerignore` covering `.git`, `node_modules`, `dist`, `.angular`, `coverage`, logs, OS/IDE files, audit screenshots, local environment files, and secret/key patterns while explicitly retaining required manifests, source, public assets, and config. Keep `COPY package*.json` before source copying. Validate with BuildKit context output and a clean build.
- **Acceptance:** Context drops to the actual source size (target below 10 MB unless assets justify more); clean Docker build succeeds; changing source does not rerun `npm ci`; host `node_modules` cannot enter an image layer; required files are not accidentally excluded.

### AUD-012 — SEO metadata leaks across routes and publishes false social-image attributes

- **Status / priority:** `RESOLVED / P1`
- **Implementation PR:** [#41](https://github.com/Finrood/NatiPsy/pull/41)
- **Branch:** `codex/aud-012-seo-meta-lifecycle`
- **Area:** SEO, social sharing, SPA correctness
- **Files:** `src/app/services/seo.service.ts:7-87`, `src/index.html:13-29`
- **Evidence:** `keywords`, `article:published_time`, and `article:author` are set when present but not removed when absent on the next SPA route. Static `og:image:width=1200`, `og:image:height=630`, `twitter:url`, and the homepage `twitter:image:alt` remain on article routes. The actual hero is 853×1280 and the article image is 1024×1536, so the declared 1200×630 dimensions are false.
- **Why this matters:** Crawlers and social platforms receive mixed metadata from the previously visited page and incorrect image geometry/alt text, causing bad previews and ambiguous classification.
- **Best fix:** Make `SeoConfig` own the full metadata state, including optional image width, height, MIME type, and alt. For every managed tag, either set the supplied value or remove the prior tag. Keep route-independent tags static only when truly universal. Prefer a dedicated owner-approved 1200×630 social image; otherwise emit real dimensions. Test direct SSR and client route transitions in both directions.
- **Acceptance:** Home→article→blog→home leaves no stale article tags; each page has one canonical and one correct value per managed tag; image URL, dimensions, type, and alt match the actual asset; SSR HTML matches post-navigation state.

### AUD-013 — Article route reuse can leave stale content, related posts, and JSON-LD

- **Status / priority:** `RESOLVED / P1`
- **Implementation PR:** [#42](https://github.com/Finrood/NatiPsy/pull/42)
- **Branch:** `codex/aud-013-blog-jsonld-lifecycle`
- **Area:** Structured data, SPA correctness
- **Files:** `src/app/components/blog-post/blog-post.component.ts:44-74,149-191`, `src/app/services/seo.service.ts:101-119`
- **Evidence:** Angular reuses `BlogPostComponent` when only `:slug` changes. Each parameter emission starts a separate post subscription that is cancelled only when the component is destroyed, so a slow response for article A can overwrite faster article B and its related posts. `loadPost()` also clears `this.post` before removing the previous slug-specific schema script. The new script receives a different ID, and `ngOnDestroy()` eventually removes only the last script.
- **Why this matters:** Rapid or slow-network navigation can show the wrong article for the URL, and the DOM can claim that multiple articles are the primary page. Search engines and share/debug tools may parse stale content/schema.
- **Best fix:** Drive the route with one `paramMap.pipe(distinctUntilChanged(), switchMap(...))` pipeline and cancel both post and related-post work when the slug changes. Represent loading/not-found/error/success atomically. Use one stable `json-ld-blog-post` slot and replace it, or remove the previous ID before resetting state. Escape `<` in serialized JSON as `\u003c` so future content cannot terminate the script element. Also add `BreadcrumbList` for the visible breadcrumb, using the same canonical URLs.
- **Acceptance:** With A delayed and B fast, A→B renders only B and B’s related posts; direct-load A has one BlogPosting; A→B has only B schema; B→blog has no BlogPosting; JSON parses and contains canonical URLs; malicious fixture text containing `</script>` cannot create a new DOM element; tests cover reused parameter navigation.

### AUD-014 — Person and professional-service structured data contain semantically invalid claims

- **Status / priority:** `RESOLVED / P2`
- **Implementation PR:** [#43](https://github.com/Finrood/NatiPsy/pull/43)
- **Closure evidence (2026-09-24):** The owner confirmed the published business facts. The generated homepage JSON-LD parsed as a linked `WebPage` graph in Schema.org Validator with zero errors and zero warnings. Google's Rich Results Test detected no eligible rich-result item, which is expected for this `WebSite`/`WebPage`/`Person`/`Service` graph and is not a validation error. Do not invent an address, rating, or issuer.
- **Branch:** `codex/aud-014-structured-data-entities`
- **Area:** SEO, schema, trust
- **Files:** `src/app/components/hero/hero.component.ts:16-37`, `src/app/components/about-me/about-me.component.ts:16-33`
- **Evidence:** `ProfessionalService.address.addressLocality` is the text “Atendimento Online,” which is not a locality, while `geo` asserts Florianópolis coordinates. `Person.hasCredential` is a plain string although Schema.org expects a `EducationalOccupationalCredential` object. Homepage entities are separate unlinked scripts.
- **Why this matters:** Incorrect structured data reduces machine confidence and may be treated as misleading. For a health-related service, unverified location or credential statements carry extra trust risk.
- **Best fix:** Build one linked `@graph` using stable `@id` values for `WebSite`, `WebPage`, `Person`, and the service. Model online coverage with `areaServed`, `availableChannel`, or service properties. Include physical address/geo only if the owner confirms a genuine customer-facing location. Model CRP as a credential object with credential category and issuing/recognizing organization only after owner verification. Validate syntax with Schema.org and Google tools, while recognizing that valid markup does not guarantee a rich result.
- **Acceptance:** No field contains a value of the wrong semantic type; graph entities reference each other; every business fact has owner confirmation in the PR; tests parse the JSON-LD; external validators report no actionable errors. Do not invent an address, rating, review, price, or credential issuer.

### AUD-015 — No CI protects build, tests, generated files, security, or deployment behavior

- **Status / priority:** `RESOLVED / P1`
- **Implementation PR:** [#44](https://github.com/Finrood/NatiPsy/pull/44)
- **Branch:** `codex/aud-015-ci-quality-gates`
- **Area:** Delivery, reliability
- **Files:** missing `.github/workflows/*`
- **Evidence:** There is no repository CI. A PR can merge with broken generation, tests, build, vulnerable dependencies, or changed generated artifacts.
- **Why this matters:** The current project relies on contributors remembering environment-specific commands. Several audit findings would have been caught automatically.
- **Best fix:** Add a least-privilege GitHub Actions workflow pinned to supported Node and npm. Run `npm ci`, generator, a generated-file cleanliness check, lint/format check once available, unit tests with coverage, production build, dependency policy, and Docker build/check. Add a separate post-deploy smoke job only when deployment credentials/environment are safely available. Pin action major versions and grant read-only permissions by default; never expose secrets to fork PRs.
- **Acceptance:** A normal PR runs deterministic checks; intentionally stale generated JSON and a failing test both fail CI; dependency caching keys from the lockfile; workflow permissions are explicit; README lists the same commands developers can run locally.

### AUD-016 — Tests are mostly smoke tests and README advertises an e2e target that does not exist

- **Status / priority:** `RESOLVED / P1`
- **Implementation PR:** [#45](https://github.com/Finrood/NatiPsy/pull/45)
- **Branch:** `codex/aud-016-test-strategy-e2e`
- **Area:** Testing, documentation, accessibility
- **Files:** `src/**/*.spec.ts`, `angular.json:90-97`, `README.md:39-55`
- **Evidence:** All 24 unit tests pass, but most only construct components. Critical filter, cache, SEO lifecycle, generator, routing-status, hydration, and error paths are not covered. `README.md` says the project is Angular CLI 19 although dependencies are Angular 22, says tests use Karma, recommends a nonexistent `ng e2e`, and tells users to run raw `ng build`, which bypasses the required blog generator. `.vscode/launch.json` still opens Karma’s removed browser debug URL on port 9876.
- **Why this matters:** Passing tests provide limited regression confidence, and onboarding instructions fail immediately.
- **Best fix:** Add focused tests for the behaviors named in this audit and sensible coverage thresholds for services/scripts, not superficial line coverage. Add Playwright e2e covering home anchors, mobile menu/focus, blog filter clear, sort/pagination URL state, article direct load and client navigation, unknown-route status in the chosen server, and absence of console image/hydration warnings. Add automated axe checks for primary pages. Update README to exact Node, install, test, e2e, build, and Docker commands.
- **Acceptance:** `npm test`, a real `npm run e2e`, and the documented production-status test run from a clean clone; at least one test fails before each targeted regression fix and passes after; HTTP mocks are verified; no README command references a missing target.

### AUD-017 — Sorting mutates the shared post cache and changes later related-post results

- **Status / priority:** `RESOLVED / P2`
- **Implementation PR:** [#46](https://github.com/Finrood/NatiPsy/pull/46)
- **Branch:** `codex/aud-017-blog-cache-immutability`
- **Area:** Logic, reliability
- **Files:** `src/app/services/blog.service.ts:81-118,191-217`
- **Evidence:** Without a category filter, `filteredPosts = posts`; `.sort()` mutates that same cached array. A user sorting by title can therefore change the order later used by `getRelatedPosts().slice(0, maxPosts)`.
- **Why this matters:** Service results depend on prior UI actions, making related articles and default order nondeterministic across navigation.
- **Best fix:** Treat cache entries as immutable: clone before every sort/filter result, or use `toSorted` with supported transpilation. Rank related posts explicitly by shared-category count, then publication date, then slug as a deterministic tie-breaker. Do not expose the mutable cache reference to callers.
- **Acceptance:** Tests prove title sorting does not alter the next default-date result or the underlying cache; related ranking is deterministic and excludes the current slug; subscriber-side mutation cannot corrupt later calls.

### AUD-018 — Concurrent first-use calls can fetch the blog index twice

- **Status / priority:** `RESOLVED / P2`
- **Implementation PR:** [#47](https://github.com/Finrood/NatiPsy/pull/47)
- **Branch:** `codex/aud-018-blog-index-request-cache`
- **Area:** Performance, SSR reliability
- **Files:** `src/app/services/blog.service.ts:47-79,120-129`, `src/app/components/blog-list/blog-list.component.ts:63-74`
- **Evidence:** BlogList starts `getPostsList()` and `getAllCategories()` separately before `postsCache` is populated. `fetchPostsIndex()` caches only after the response and has no shared in-flight Observable, so both subscribers can issue `/index.json` requests.
- **Why this matters:** It duplicates network/server work on first render and can create inconsistent error timing.
- **Best fix:** Maintain a private shared index Observable with `shareReplay({bufferSize: 1, refCount: false})`, seeded from TransferState when present. Clear/recreate it only after an error if retries are intended. Alternatively derive posts and categories from one load in the component. Preserve server TransferState serialization without leaking state across SSR requests.
- **Acceptance:** Two concurrent service calls produce one HTTP request; both receive the same data; client hydration produces zero request when TransferState is present; a failed load follows a documented retry behavior; tests verify all four cases.

### AUD-019 — BlogPost and DOMPurify remain in the initial homepage bundle

- **Status / priority:** `RESOLVED / P2`
- **Implementation PR:** [#48](https://github.com/Finrood/NatiPsy/pull/48)
- **Branch:** `codex/aud-019-lazy-blog-post-route`
- **Area:** Performance, routing
- **Files:** `src/app/app.routes.ts:1-28`, `src/app/components/blog-post/blog-post.component.ts:6-8`
- **Evidence:** `BlogPostComponent` is eagerly imported because a prior lazy-navigation race was worked around. Bundle stats attribute about 16.1 kB of app code and 37.4 kB of DOMPurify to initial `main`; homepage visitors do not need either. Build-time Markdown parsing already removed the larger historical parser cost.
- **Why this matters:** Roughly 53.5 kB raw plus parsing remains on every entry page, and the workaround hides an unresolved routing/hydration defect.
- **Best fix:** Reproduce the original first-navigation freeze with an e2e test, fix its actual cause (likely component state/change detection or navigation data flow), then restore `loadComponent` for `:slug`. Keep DOMPurify in the article chunk, or sanitize generated HTML at build time with an allowlist and retain a defense-in-depth rendering policy.
- **Acceptance:** Direct article load and first client navigation both render reliably; BlogPost and DOMPurify appear only in a lazy chunk; homepage bundle and behavior regress neither; tests cover slow network and hydration navigation.

### AUD-020 — The homepage embeds the entire blog archive instead of a focused preview

- **Status / priority:** `RESOLVED / P2`
- **Implementation PR:** [#49](https://github.com/Finrood/NatiPsy/pull/49)
- **Branch:** `codex/aud-020-blog-preview-archive-separation`
- **Area:** UX, information architecture, performance, semantics
- **Files:** `src/app/components/home/home.component.ts:14-32`, `src/app/components/blog-list/*`
- **Evidence:** Home imports the full archive, including filters, sort, pagination, query-parameter logic, and FormsModule. The mobile page measured about 11,968 px tall. The dedicated `/blog` page still uses an `h2`, so it has no `h1`. Bundle stats show Angular Forms contributes about 43.3 kB in the archive chunk for two native selects.
- **Why this matters:** Homepage visitors pay for archive controls and face an excessively long conversion path; blog URLs and home state are unnecessarily coupled; `/blog` has a weak heading hierarchy.
- **Best fix:** Extract a reusable presentational post-card and create a lightweight `BlogPreviewComponent` for home showing the latest 3 posts plus one “Ver todos” link. Keep filters, sorting, pagination, query state, and a real `h1` only in `BlogArchiveComponent`. Replace two-way FormsModule bindings with explicit native value/change handling or small signals if Forms is otherwise unnecessary. Once home contains only a preview, make the navigation item labeled “Blog” route to `/blog`, not back to the home fragment.
- **Acceptance:** Home has no archive controls/query-param side effects and shows at most 3 posts; `/blog` has exactly one descriptive `h1`; the top-menu Blog item and preview CTA reach `/blog`; cards share one implementation; FormsModule leaves the home path and preferably the archive chunk; mobile page length and JS decrease without losing article discovery.

### AUD-021 — Blog images violate declared aspect ratios and archive LCP priority guidance

- **Status / priority:** `RESOLVED / P2`
- **Implementation PR:** [#50](https://github.com/Finrood/NatiPsy/pull/50)
- **Branch:** `codex/aud-021-responsive-blog-images`
- **Area:** Performance, layout stability, UX
- **Files:** `src/app/components/blog-list/blog-list.component.html:112-123`, `src/app/components/blog-post/blog-post.component.html:52-60,149-155`
- **Evidence:** The source image is 1024×1536, while cards declare 400×200 and the article declares 768×384, triggering Angular `NG02952`. On `/blog`, Angular also reports `NG02955` because the first archive image is LCP but is lazy-loaded.
- **Why this matters:** Incorrect intrinsic geometry produces warnings and can cause suboptimal source selection or layout instability. Lazy-loading the actual LCP delays the largest visible element.
- **Best fix:** Use a `position: relative` fixed-aspect crop container with `ngSrc` `fill`, `object-cover`, and accurate `sizes`, or generate matching landscape derivatives at build time. Mark only the first above-fold archive image as priority when the archive owns the page; keep below-fold/home-preview/related images lazy. Avoid marking multiple images high priority.
- **Acceptance:** No `NG02952` or `NG02955` appears on home, archive, or article; rendered crops match design at 320–1440 px; LCP resource is discovered early; CLS and transferred image bytes do not regress.

### AUD-022 — Article title and description are too long for search/social presentation

- **Status / priority:** `RESOLVED / P2`
- **Implementation PR:** [#51](https://github.com/Finrood/NatiPsy/pull/51)
- **Closure evidence (2026-09-24):** The owner approved the implemented Portuguese discovery wording; generated metadata and focused tests pass.
- **Branch:** `codex/aud-022-blog-seo-fields`
- **Area:** SEO, content modeling
- **Files:** `public/assets/content/blog/carreira-mulheres-negras-fadiga-racial.md:1-20`, `src/app/models/blog-post.model.ts`, `src/app/components/blog-post/blog-post.component.ts:149-190`
- **Evidence:** The article title is 127 characters and becomes roughly 151 with the site suffix; its description is 195 characters. The same strings are forced into the on-page heading, document title, Open Graph, Twitter, sitemap image text, and JSON-LD.
- **Why this matters:** Search engines and social clients truncate or rewrite overly long presentation text. One field cannot serve both an expressive editorial heading and concise discovery metadata well.
- **Best fix:** Add optional `seoTitle`, `seoDescription`, and `socialTitle`/`socialDescription` frontmatter with fallbacks. Keep the full editorial `h1`. The generator should validate nonempty fields and warn on clearly excessive lengths without pretending character count guarantees a pixel width. Use the SEO variants consistently in title/meta/OG/Twitter; keep JSON-LD headline faithful and within supported guidance. Have the owner approve wording.
- **Acceptance:** The current article has owner-approved concise discovery text; generated JSON includes fields; direct SSR emits the intended values; fallbacks work for old content; tests prevent accidental empty or duplicated suffixes.

### AUD-023 — Google Fonts makes builds and first visits depend on a third party

- **Status / priority:** `RESOLVED / P2`
- **Implementation PR:** [#52](https://github.com/Finrood/NatiPsy/pull/52)
- **Branch:** `codex/aud-023-self-host-fonts`
- **Area:** Privacy, performance, reliability, CSP
- **Files:** `src/index.html:34-44`, `src/styles.css:20-22`, `nginx.conf:30,53,69`
- **Evidence:** The first production build failed when Angular could not reach `fonts.googleapis.com`; the build succeeded only with network access. Runtime markup also loads Google CSS with an inline `onload` handler and contacts Google domains.
- **Why this matters:** Builds are not offline/reproducible, font display depends on a third party, and a mental-health visitor’s browser contacts Google. The inline handler also forces a weaker CSP.
- **Best fix:** Download properly licensed Montserrat WOFF2 files for only the used character set/weights, preferably a variable font, store them under a versioned local font directory, define `@font-face` with `font-display: swap`, and preload only the critical local file if measurement justifies it. Remove Google preconnects, stylesheet/noscript links, and corresponding CSP origins.
- **Acceptance:** A network-disabled production build passes; browser requests no Google font domain; text remains legible during font load; font files are cached correctly and include Portuguese glyphs; licensing/source is documented.

### AUD-024 — Content Security Policy and security-header coverage are broader and less consistent than needed

- **Status / priority:** `PARTIAL / P2`
- **Implementation PR:** [#53](https://github.com/Finrood/NatiPsy/pull/53)
- **Current gap (2026-09-24):** The owner chose to retain Cloudflare Web Analytics. The follow-up allows only `https://static.cloudflareinsights.com/beacon.min.js` in `script-src`; a focused header test passes. The old live CSP still blocks the beacon until deployment; check production console and CSP afterward.
- **Branch:** `codex/aud-024-nginx-security-headers`
- **Area:** Security, Nginx
- **Files:** `nginx.conf:25-76`, `src/index.html:41`
- **Evidence:** CSP permits `script-src 'unsafe-inline'`, `style-src 'unsafe-inline'`, and any HTTPS destination for `img-src` and `connect-src`. Source markup has an inline font `onload`; generated prerendered HTML also contains Angular event-replay bootstrap scripts, serialized state, critical inline CSS, and another asynchronous stylesheet `onload`. Headers are repeated in three locations and omitted from the exact `/50x.html` location because Nginx `add_header` inheritance stops when a location defines its own set.
- **Why this matters:** Broad directives reduce CSP’s protection against injection and exfiltration; copied header blocks drift; error responses should receive the same protections.
- **Best fix:** After AUD-023, remove the source inline handler and tighten CSP to required origins. Inventory the optimized/prerendered output, not just `src/index.html`: configure Angular-compatible nonces or deterministic CSP hashes for required inline event-replay/style-loader blocks, or explicitly document any narrow directive that cannot yet be removed. Do not disable hydration or critical-CSS optimization just to silence CSP without measuring the tradeoff. Add `frame-ancestors`, `object-src 'none'`, `base-uri 'self'`, `form-action`, and an owner-approved `Permissions-Policy`. Centralize repeated headers with an included config or apply them at server level without shadowing. Disable version disclosure and verify HSTS is appropriate for all subdomains before retaining `preload`.
- **Acceptance:** Security headers appear on 200, 404, 50x, HTML, and asset responses as intended; CSP produces no violations during core flows; no wildcard `https:` connect permission remains without documented need; automated tests parse headers.

### AUD-025 — The optional Express SSR server has a prefix-unsafe path guard and incomplete proxy hardening

- **Status / priority:** `RESOLVED / P2`
- **Implementation PR:** [#54](https://github.com/Finrood/NatiPsy/pull/54)
- **Branch:** `codex/aud-025-ssr-server-hardening`
- **Area:** Backend, security, reliability
- **Files:** `src/server.ts:52-79,107-140`
- **Evidence:** The traversal check uses `routeDir.startsWith(browserDistFolder)`, which is not a path-boundary test (`/browser-evil` shares the prefix `/browser`). Absolute render URLs are built from `req.protocol` and `headers.host`; proxy trust/canonical-host behavior and error middleware are not explicit.
- **Why this matters:** The server is callable through a documented script and may later become production without security review. Prefix checks and untrusted proxy metadata are common sources of path or canonical-origin errors.
- **Best fix:** First honor AUD-003’s deployment decision. If SSR remains supported, use `path.relative(browserDistFolder, routeDir)` and reject absolute or `..`-prefixed results; allow only normalized GET/HEAD routes; derive the public origin from a validated configuration or strict allowed host/proxy policy; add Helmet-equivalent headers, compression, request/error logging without sensitive data, explicit 404/error middleware, graceful shutdown, and a health endpoint. If SSR is removed, delete server-only code/dependencies/scripts instead of maintaining a dormant backend.
- **Acceptance:** Traversal and encoded-path tests cannot leave the browser root; hostile Host/forwarded headers cannot change canonicals; errors return controlled status/body; SIGTERM drains cleanly; documentation matches deployment.

### AUD-026 — Container images and runtime lack reproducibility and health/hardening controls

- **Status / priority:** `RESOLVED / P2`
- **Implementation PR:** [#55](https://github.com/Finrood/NatiPsy/pull/55)
- **Branch:** `codex/aud-026-container-repro-hardening`
- **Area:** Docker, operations, security
- **Files:** `Dockerfile`, `docker-compose.yml`
- **Evidence:** Mutable `node:22-alpine` and obsolete/mutable `nginx:1.27-alpine` tags are used without digest pins. The build Node tag can resolve below Angular’s patch minimum. Runtime inspection showed the container command starts as UID 0, with no configured healthcheck, read-only filesystem, capability drop, `User`, or `no-new-privileges`. The external network prerequisite is undocumented.
- **Why this matters:** Identical commits can build on different base contents; cached tags can break Angular compatibility; orchestrators cannot distinguish “running” from “healthy”; unnecessary privileges increase impact after compromise.
- **Best fix:** After choosing the serving model, pin a maintained Node LTS version compatible with Angular and a maintained Nginx/unprivileged image by version plus digest; automate digest updates. Run as nonroot on an unprivileged port, provide writable tmp/cache paths via `tmpfs`, use a read-only root filesystem, drop capabilities, set `no-new-privileges`, and add a lightweight healthcheck for a static known path. Document creation/ownership of `caddy-network` and reverse-proxy expectations.
- **Acceptance:** Two clean builds use recorded base digests; container starts as nonroot with read-only root; health transitions to healthy and fails when Nginx stops; Caddy can reach the documented port/network; application and caching tests pass.

### AUD-027 — Node/npm/Angular versions and dependency roles are not reproducible or minimal

- **Status / priority:** `RESOLVED / P2`
- **Implementation PR:** [#56](https://github.com/Finrood/NatiPsy/pull/56)
- **Branch:** `codex/aud-027-toolchain-dependency-hygiene`
- **Area:** Tooling, maintainability, supply chain
- **Files:** `package.json`, `package-lock.json`; missing `.nvmrc`/`.node-version`
- **Evidence:** There is no `engines` or `packageManager`; the default Node 22.22.2 failed before tests while Node 26 passed. The Node 26 production build also emits repeated `DEP0205 module.register()` deprecation warnings from the current toolchain. Angular runtime packages are `22.1.5` while CLI/build/SSR are `22.1.7` and ranges use carets. Vitest is configured, yet Karma, Jasmine, launchers, coverage adapters, and instrumentation remain. `@angular/platform-browser-dynamic` appears unused. Tailwind/PostCSS build tools are runtime dependencies. A 64.38 kB lazy Angular-animation chunk exists solely for the mobile-menu fade, which CSS can provide.
- **Why this matters:** Contributor/CI behavior changes by machine, lock refreshes can drift patch versions, install/audit surface is larger, and unused test stacks cause vulnerabilities.
- **Best fix:** Select and document one supported Node line, pin it in `engines`, `.nvmrc` or `.node-version`, Docker, and CI; pin the npm version with `packageManager`. Align compatible Angular packages to one patch and use the project’s chosen range policy. Prove unused packages with imports/config before removal; remove the Karma/Jasmine stack and unused dynamic platform/instrumentation; move build-only tools to `devDependencies`. Replace the one menu animation with an accessible CSS transition, then remove `@angular/animations` and `provideAnimationsAsync` if no remaining import needs them. Add Renovate or Dependabot with grouped Angular updates.
- **Acceptance:** Clean install/test/build succeeds on the documented toolchain; unsupported Node fails with a clear message; removed packages are absent from lock/audit; Angular package versions are intentionally aligned; the animation chunk is gone without changing menu/focus/reduced-motion behavior; runtime dependency list contains only code required by the selected production model.

### AUD-028 — There is no lint or formatting gate

- **Status / priority:** `RESOLVED / P2`
- **Implementation PR:** [#57](https://github.com/Finrood/NatiPsy/pull/57)
- **Branch:** `codex/aud-028-lint-format`
- **Area:** Code quality, simplicity
- **Files:** missing ESLint/Prettier configuration; project TypeScript/templates/styles
- **Evidence:** No lint/format scripts or configuration exist. Current code already has inconsistent quote/spacing style and at least one unused import (`provideZoneChangeDetection` in `src/main.server.ts`). A machine-specific JetBrains module file, `NatiPsy.iml`, is tracked even though editor project state is not part of the application.
- **Why this matters:** Low-level defects and style churn consume review attention; Angular template accessibility and TypeScript mistakes are not checked consistently.
- **Best fix:** Add current Angular ESLint flat configuration for TypeScript and templates, with unused imports, unsafe patterns, and accessibility-oriented template rules chosen to match the project. Add Prettier with Angular/HTML/CSS/Markdown support and stable scripts: `lint`, `lint:fix`, `format`, `format:check`. Apply one isolated mechanical baseline in this PR, without behavioral refactors, and integrate checks into CI. Remove the tracked `.iml` artifact and ignore `*.iml` unless the team explicitly standardizes JetBrains metadata.
- **Acceptance:** `npm run lint` and `npm run format:check` pass; deliberate unused imports and template violations fail; generated JSON/build output is excluded; the PR separates config from any unavoidable bulk formatting commit.

### AUD-029 — Bundle budgets allow major regressions and bundle composition is not tracked

- **Status / priority:** `RESOLVED / P2`
- **Implementation PR:** [#58](https://github.com/Finrood/NatiPsy/pull/58)
- **Branch:** `codex/aud-029-performance-budgets`
- **Area:** Performance, CI
- **Files:** `angular.json:43-55`, build tooling
- **Evidence:** Current initial output is 492.08 kB raw, but warnings start at 1 MB and errors at 2 MB. The initial bundle could roughly quadruple before CI/build fails. There is no stored/reportable chunk budget or regression comparison.
- **Why this matters:** Performance regressions can merge gradually even though mobile visitors are sensitive to JavaScript parse/execute cost and slow networks.
- **Best fix:** Establish measured raw and transferred baselines after AUD-019/AUD-020 where practical. Set an initial warning close enough to catch meaningful growth and an error threshold with modest headroom; retain component-style budgets. Add a stats-based CI report for initial and key lazy chunks and fail on an agreed percentage/byte increase. Track image/font budgets separately where tooling permits.
- **Acceptance:** Current optimized build passes; a fixture/dependency that adds a meaningful initial payload fails; CI prints human-readable before/current sizes; thresholds and adjustment policy are documented rather than tuned merely to silence failures.

### AUD-030 — Remaining accessibility defects affect contrast, keyboard efficiency, announcements, and motion

- **Status / priority:** `RESOLVED / P2`
- **Implementation PR:** [#59](https://github.com/Finrood/NatiPsy/pull/59)
- **Branch:** `codex/aud-030-accessibility-interactions`
- **Area:** Accessibility, UX
- **Files:** `src/app/components/top-menu/top-menu.component.html:52-70`, `src/app/components/blog-list/blog-list.component.html:81-155`, `src/app/components/blog-post/blog-post.component.html:34-45`, interactive templates and `src/styles.css:24-34`
- **Evidence:** The open-menu navy toggle on dark rose measured approximately **2.41:1**, below the 3:1 non-text/UI contrast target. Each archive card exposes image, title, and “Leia mais” as three tab stops to the same URL. Error containers are not alerts/live regions; several decorative SVGs are not hidden from assistive technology. Several blog buttons omit `type="button"`, making them accidental submit buttons if the component is ever placed inside a form. Reduced-motion CSS shortens transitions but hover scaling can still jump because not every transform is `motion-safe`.
- **Why this matters:** Controls can be hard to perceive, keyboard navigation is repetitive, async errors may not be announced, and motion-sensitive users can still receive abrupt movement.
- **Best fix:** Use white/light toggle and matching focus ring while the rose menu state is active. Give each card one descriptive primary link, or remove redundant links from the tab order without invalid nested interactivity. Use `role="alert"`/appropriate live semantics for async failures, `aria-hidden="true" focusable="false"` on decorative SVGs, explicitly type every non-submit button, and gate all nonessential transform/motion classes with `motion-safe`. Run keyboard, screen-reader-oriented DOM, axe, and contrast checks.
- **Acceptance:** Toggle/icon/focus indicator pass 3:1 and text 4.5:1 as applicable; one card is efficient to traverse; errors announce once; decorative icons have no accessible name; reduced-motion mode has no nonessential scale/scroll animation; axe has no serious/critical issues on core pages.

### AUD-031 — Mobile homepage hierarchy hides the primary conversion action far below the fold

- **Status / priority:** `RESOLVED / P2`
- **Implementation PR:** [#60](https://github.com/Finrood/NatiPsy/pull/60)
- **Closure evidence (2026-09-24):** The follow-up browser suite reviewed 320×568, 390×844, 768×1024, and 1440×900; the primary CTA was visible in the early mobile viewport, with no horizontal overflow or service-card/WhatsApp overlap. Mobile Lighthouse recorded accessibility and SEO 100, CLS 0, and performance 78 (simulated LCP about 4.4 s, a future performance opportunity, not a hidden perfect score). A local Montserrat preload and narrow-screen layout adjustments are included for the owner's next deployment.
- **Branch:** `codex/aud-031-mobile-home-conversion`
- **Area:** Responsive design, UX, conversion
- **Files:** `src/app/components/hero/hero.component.html`, `src/app/components/services/services.component.html`, home composition
- **Evidence:** At 390×844, the portrait consumes most of the first viewport, the H1 wraps to about five lines, and the primary appointment CTA begins around y=1358. The full home page is about 11,968 px and service cards repeat similar WhatsApp actions.
- **Why this matters:** Mobile visitors cannot quickly see both the service promise and next action. Repeated equal-weight CTAs create visual fatigue rather than a clear decision path.
- **Best fix:** Design the mobile-first hero so identity/value proposition and one primary CTA appear substantially earlier: use a smaller or art-directed mobile crop, tighter type with a concise owner-approved display heading, and reorder the portrait after key copy if testing supports it. Keep one dominant section CTA and make repeated card actions contextual or consolidate them. Preserve the calm visual tone, tap targets, readable line length, and desktop composition. Do not change clinical claims without approval.
- **Acceptance:** Screenshot review at 320×568, 390×844, 768×1024, and 1440×900; at 390 px the visitor sees the core proposition and primary CTA no later than the early second viewport, with no clipping/overlap; CTA hierarchy is unambiguous; Lighthouse/CLS and accessibility do not regress.

### AUD-032 — Brand assets are inefficient and favicon coverage is malformed/incomplete

- **Status / priority:** `RESOLVED / P3`
- **Implementation PR:** [#61](https://github.com/Finrood/NatiPsy/pull/61)
- **Branch:** `codex/aud-032-assets-favicon-manifest`
- **Area:** Assets, performance, browser UX, branding
- **Files:** `public/assets/icons/*`, `public/assets/logo*`, `public/favicon.ico`, `src/index.html:31-32`
- **Evidence:** Six service SVGs total about 87 kB and duplicate the same geometry in SVGRepo `tracerCarrier` and `iconCarrier` groups. The author portrait is a byte-for-byte duplicate of `NatiAboutMe.webp` under a second path. `logo.webp` and `logo_signature.webp` are larger than their PNG equivalents. The favicon contains one non-square 48×64 image. There is no Apple touch icon, 192/512 app icon, web manifest, or `theme-color`.
- **Why this matters:** Unoptimized vectors waste transfer/parse bytes; browsers and saved-home-screen experiences may render a distorted or low-quality identity; redundant formats add maintenance without savings.
- **Best fix:** Run trusted SVG optimization with visual diffs, remove duplicate groups/metadata, and consider a sprite only if it reduces real bytes without complicating accessibility. Reference one canonical portrait instead of storing identical bytes twice, and keep the smallest lossless/raster format per logo after visual comparison. Generate owner-approved square 16/32/48 favicon layers plus 180, 192, and 512 icons; add manifest and theme colors consistent with the design system. Never alter the recognizable logo geometry during automated optimization.
- **Acceptance:** Pixel/visual comparison shows no material icon/logo change; total asset bytes fall; favicon reports square layers and renders in major browsers; manifest passes browser validation; all referenced files exist and receive appropriate caching.

### AUD-033 — Search classification lacks focused pages, freshness, and an evidence-based trust/content workflow

- **Status / priority:** `PARTIAL / P3`
- **Implementation PR:** [#62](https://github.com/Finrood/NatiPsy/pull/62)
- **Current gap (2026-09-24):** Search Console domain ownership was verified with a Cloudflare DNS TXT record. The canonical sitemap was resubmitted on 24 September; its previous read on 22 September still reported three pages, so processing remains pending. The homepage is indexed; `/blog`, `/terapia-online`, `/orientacao-profissional`, `/contato-e-privacidade`, and the article all passed live URL inspection as available to Google, and indexing requests for all five were accepted. Historical exclusions include old Hostgator soft 404s/5xx; the robots-blocked example is the deliberately blocked raw Markdown asset. The owner approved a quarterly manual editorial review of service/trust copy, citations, identity, privacy/crisis boundaries, and real material-review dates; do not auto-stamp freshness. A validated but **undeployed** Cloudflare Redirect Rule would 301 exact `www` and HTTP apex requests to HTTPS apex while preserving path/query: filter `(http.host eq "www.psicologanataliaferreira.com") or (http.host eq "psicologanataliaferreira.com" and not ssl)`, target `concat("https://psicologanataliaferreira.com", http.request.uri.path)`, preserve query string. Activating it changes production traffic before the owner's planned deployment, so it remains a deliberate follow-up, not a completed fix. Reinspect coverage and canonical hosts after deployment.
- **Branch:** `codex/aud-033-search-content-architecture`
- **Area:** SEO strategy, information architecture, content UX
- **Files:** routes, navigation, sitemap, blog content, footer/about/service content
- **Evidence:** The site exposes only home, `/blog`, and one article as indexable routes; service information exists only in homepage fragments. The only article and sitemap `lastmod` are from 2025-04-21. Health/service copy includes strong claims such as “Eficácia Comprovada,” equivalence to in-person therapy, and guaranteed confidentiality without nearby sources or qualification. There is no visible editorial/privacy/crisis-boundary page. A 2026-09-12 search check surfaced a cached homepage but did not surface the site’s article for its exact title; this is an observation, not proof of complete index exclusion. The production outage prevents current crawling.
- **Why this matters:** Search engines have few focused documents with which to classify therapy, career-orientation, audience, and service intent. Health-related content benefits from clear authorship, credentials, citations, editorial/update practices, and accurate service boundaries. Freshness signals must reflect real updates, not artificial date changes.
- **Best fix:** After AUD-001/AUD-002, verify ownership in Google Search Console, submit/test the sitemap, inspect the three canonical URLs, and record indexing/coverage outcomes. With owner-approved content, create genuinely useful non-duplicate pages for core services (for example online therapy and professional/career guidance), each with unique intent, one H1, concise metadata, internal links, canonical, breadcrumb, and correct schema. Add an editorial policy, author/credential explanation, published/modified dates, citation standards, and appropriate privacy/contact/crisis-boundary information after clinical/legal review. Give each route an authoritative material-review date: the archive may use its newest post, while the homepage/service pages need their own reviewed date. Never write the current build date automatically or update `lastmod` without a material page change. Build a sustainable topic plan; do not create thin city/keyword doorway pages, fake reviews, or keyword stuffing.
- **Acceptance:** Search Console verification and URL inspection outcomes are recorded; sitemap contains every canonical indexable page and no fragments/drafts; each route’s `lastmod` reflects a real material update; each new page satisfies a distinct user need and links naturally; content/business claims are owner-approved; structured data validates; a quarterly review process updates content only when materially reviewed.

### AUD-034 — Tailwind scans documentation, so editing the audit changes production CSS

- **Status / priority:** `RESOLVED / P3`
- **Implementation PR:** [#63](https://github.com/Finrood/NatiPsy/pull/63)
- **Branch:** `codex/aud-034-tailwind-source-boundary`
- **Area:** Build determinism, CSS performance
- **Files:** `src/styles.css:1-2`, Tailwind source detection
- **Evidence:** Rebuilding after changing only `PROJECT_IMPROVEMENTS.md` changed the optimized styles bundle from 65.47 kB to 64.87 kB and the initial total by the same amount. Tailwind v4 automatically detects class-like tokens outside application source, so examples in repository Markdown influence shipped CSS.
- **Why this matters:** Documentation-only edits can change production assets, invalidate caches, add unused styles, and make performance diffs noisy. A future prompt or README can accidentally safelist a large set of utilities.
- **Best fix:** Disable broad automatic detection with Tailwind’s `source(none)` import option and explicitly register only real template/component source paths with `@source`, or use narrowly scoped `@source not` exclusions if explicit inclusion is impractical. Include TypeScript files that contain inline Angular templates and any legitimate external component source. Do not include audit, README, generated output, tests, or content Markdown.
- **Acceptance:** Build CSS hash and size are byte-identical before/after adding a unique valid Tailwind class token to a documentation fixture; adding that class to an actual application template changes the CSS; all current runtime styles still render; the source boundary is commented and covered by a small build regression check.

### AUD-035 — Nginx misses valid Angular hashes and can emit duplicate cache directives

- **Status / priority:** `RESOLVED / P2`
- **Implementation PR:** [#64](https://github.com/Finrood/NatiPsy/pull/64)
- **Branch:** `codex/aud-035-nginx-hashed-cache-regex`
- **Area:** Nginx, caching, performance
- **Files:** `nginx.conf:38-70`, compare `src/server.ts:21-22`
- **Evidence:** Nginx recognizes only eight-character alphanumeric hashes with `[A-Za-z0-9]{8}`. Angular/esbuild also emits URL-safe `-` and `_`; the verified build produced `chunk-CkMi-9d3.js`, which received `Cache-Control: no-cache, must-revalidate`, while `main-ZXTILCNF.js` matched the immutable block. The Express implementation already uses `[A-Za-z0-9_-]{8}`. Runtime headers also confirmed that `expires` plus `add_header Cache-Control` emits two Cache-Control fields for matched JavaScript and images.
- **Why this matters:** Some content-addressed bundles revalidate on every visit while others cache for a year, and duplicate cache headers make proxy/browser behavior harder to reason about.
- **Best fix:** Use the same tested hash grammar in both servers, escaping the literal filename separator and allowing `-`/`_` inside exactly eight hash characters. Centralize or test the pattern so implementations cannot drift. Choose one mechanism to emit one authoritative `Cache-Control` value; add `Expires` separately only if it is genuinely required. Keep unhashed media and HTML under their shorter policies.
- **Acceptance:** Automated cases cover alphanumeric, hyphenated, and underscored eight-character bundle hashes plus near misses; a running container returns exactly one `Cache-Control: public, max-age=31536000, immutable` for every valid hashed JS/CSS file; HTML, JSON, XML, and unhashed media retain their intended policies.

### AUD-036 — Blog data is serialized twice in hydration state

- **Status / priority:** `RESOLVED / P2`
- **Implementation PR:** [#65](https://github.com/Finrood/NatiPsy/pull/65)
- **Branch:** `codex/aud-036-single-hydration-cache`
- **Area:** Angular hydration, performance, maintainability
- **Files:** `src/app/app.config.ts:18-23`, `src/app/services/blog.service.ts:8-9,47-79,134-166`, generated prerendered HTML
- **Evidence:** `provideClientHydration()` enables Angular's HTTP response transfer cache by default, and the comment in `app.config.ts` explicitly relies on it. `BlogService` also stores the same index and post in custom `TransferState` keys. In the verified production build, the article's `ng-state` is 26,613 bytes and contains a 10,925-byte automatic HTTP-cache post plus a 10,805-byte custom `blog-post-*` copy. The body is therefore present once in rendered HTML and twice more in JSON. Home and archive state also contain both an approximately 1,068-byte HTTP index entry and a 1,003-byte custom index entry.
- **Why this matters:** Every post body and every future index entry is sent twice in the hydration payload. This increases HTML transfer, parsing, memory, and time to interactivity in direct proportion to content growth. Two caching mechanisms also create unclear ownership: a future fix can update one path and leave the other stale. This is separate from AUD-018, which concerns two simultaneous network requests before a cache is populated; this finding concerns duplicate serialization after SSR/prerender.
- **Best fix:** Use one transfer mechanism. Recommended: remove `POSTS_INDEX_KEY`, `postKey()`, and the manual set/get/remove branches, and rely on Angular's supported default HTTP transfer cache for the two idempotent JSON GETs. Keep the service's in-memory/shared Observable cache for later client navigations. Do not clear already rendered DOM while the transferred response resolves; model the loading state so hydration reuses the server view without a flash. If testing proves a hard requirement for synchronous custom state, the fallback is to set `transferCache: false` on both blog HTTP requests and retain only the custom mechanism—never ship both. Document the selected owner in code and add a build inspection test that parses `#ng-state` rather than matching minified text.
- **Acceptance:** Direct loads of home, archive, and article perform zero duplicate browser GETs during hydration; the article state contains exactly one post payload and each page contains at most one index payload; the distinctive article-body fixture occurs only in rendered markup plus one serialized data copy; direct and first client-side article navigation show no loading flash or hydration error; a fixture with a larger body proves state growth is approximately one copy, not two.

### AUD-037 — Client-side route changes do not move or announce focus

- **Status / priority:** `RESOLVED / P2`
- **Implementation PR:** [#66](https://github.com/Finrood/NatiPsy/pull/66)
- **Branch:** `codex/aud-037-route-focus-announcements`
- **Area:** Accessibility, SPA navigation, UX
- **Files:** `src/app/app.component.ts`, `src/app/app.component.html`, `src/app/app.routes.ts`, route headings and navigation
- **Evidence:** In a browser check, activating the unique “Leia mais” archive link changed the URL and title and rendered the article H1, but `document.activeElement` became `<body>` because the activated link was destroyed with the old view. There is no route-change focus manager or page-change live region. The existing focusable `#main-content` only supports the skip link; Angular routing does not automatically focus it after ordinary navigation.
- **Why this matters:** Sighted users receive an obvious page replacement, while keyboard and screen-reader users can lose their position and receive no reliable indication that navigation completed. They may have to traverse the persistent header again to discover the new H1. Correct route focus also makes errors and deep links easier to understand.
- **Best fix:** Add one application-level route accessibility coordinator. After a successful user-initiated `NavigationEnd` and the new view's render, update a visually hidden `aria-live="polite"` status with the new page title and programmatically focus the destination H1 (preferred) or `#main-content` with `preventScroll` followed by the intended scroll policy. Do not steal focus on initial document load. Preserve native back/forward scroll restoration and homepage fragment navigation; a `/#section` link should focus or scroll to that section, not be overwritten by generic route logic. Give the current top-level navigation entry `aria-current="page"` when applicable. Avoid adding a large dependency solely for an announcer when a small tested service/live region is sufficient.
- **Acceptance:** Keyboard activation from archive to article places focus on the article H1/main landmark and announces the new page once; article-to-article navigation announces and focuses the new title rather than a stale one; initial reload does not unexpectedly steal focus; browser back restores the expected scroll/focus behavior; homepage hash links still reach the requested section; unit and e2e tests cover all cases without timing sleeps.

### AUD-038 — Pagination is button-only, non-prerendered, and unbounded

- **Status / priority:** `RESOLVED / P2`
- **Implementation PR:** [#67](https://github.com/Finrood/NatiPsy/pull/67)
- **Branch:** `codex/aud-038-crawlable-blog-pagination`
- **Area:** SEO, archive UX, scalability
- **Files:** `src/app/components/blog-list/blog-list.component.ts:132-176`, `src/app/components/blog-list/blog-list.component.html:166-194`, `src/app/services/seo.service.ts`, `src/routes.txt`, `src/scripts/generate-blog-index.js`
- **Evidence:** Every pagination control is a `<button>` whose click handler mutates a query parameter; there is no crawlable `href`. Only `/blog` is prerendered, and `BlogListComponent` always declares `${SITE_URL}/blog` as canonical even when `page=2` would show a different set of articles. The `pages` getter returns every page number, so an archive with hundreds of pages would render hundreds of buttons. Google documents that crawlers generally do not click buttons, recommends sequential `<a href>` pagination, and says not to canonicalize every page in a sequence to page one.
- **Why this matters:** Once the seventh post is published, articles beyond the first archive page depend primarily on the sitemap and JavaScript rendering for discovery; the archive provides no normal link graph to them. Collapsing different result pages onto `/blog` gives contradictory canonical signals, while an ever-growing button row becomes unusable on mobile.
- **Best fix:** Define an indexable pagination URL contract before more posts exist. Recommended: `/blog` for page 1 and `/blog/page/2`, `/blog/page/3`, etc. for later pages; generate/prerender every valid page from the post count; use normal previous, next, and windowed page-number anchors; self-canonicalize each distinct archive page; and return a real 404 for out-of-range paths. Keep filter and alternate-sort combinations out of the index unless the owner intentionally creates substantial category landing pages: normalize their query URLs under AUD-005 and use an explicit canonical/noindex policy rather than generating unlimited combinations. Page changes must still work with JavaScript disabled and must not render all page numbers at large counts.
- **Acceptance:** A fixture with at least 14 posts generates page 2 and page 3 routes whose direct HTML contains the correct distinct articles, H1/title, self-canonical, and sequential anchors; page 4 returns 404 for that fixture; every article is reachable from `/blog` through ordinary `href` links; the control shows a bounded window on 390 px and exposes `aria-current="page"`; filtered/sorted URLs follow the documented indexing policy; sitemap and canonical tests cannot contradict the route model.

### AUD-039 — The article layout hides the title and offers no long-form navigation

- **Status / priority:** `PARTIAL / P2`
- **Implementation PR:** [#68](https://github.com/Finrood/NatiPsy/pull/68)
- **Current gap (2026-09-24):** The follow-up restores only the trusted generator's heading IDs after sanitization. The generated HTML now contains a matching target for all nine TOC fragments and the static article contract passes; live verification awaits deployment.
- **Branch:** `codex/aud-039-article-reading-experience`
- **Area:** Design, content UX, accessibility, deep linking
- **Files:** `src/app/components/blog-post/blog-post.component.html`, `src/app/components/blog-post/blog-post.component.css`, `src/scripts/generate-blog-index.js`, blog post model/output
- **Evidence:** At 390×844, the featured image and topic chips precede the article heading, so the H1 begins around y=696 px and is barely reached in the first viewport. The current article is approximately 13,750 px tall and has nine H2/H3 content headings, but every heading has an empty `id`, there are zero in-article fragment links, and there is no table of contents. The breadcrumb shortens the current title for everyone, including assistive technology, rather than only truncating it visually.
- **Why this matters:** A visitor opening an article cannot quickly confirm its title, understand its structure, jump to a relevant section, bookmark a subsection, or share a precise citation. These costs are largest on mobile and for keyboard, screen-magnification, and returning users. Better document structure helps readers and crawlers understand the page, but it must not be presented as a guaranteed ranking increase.
- **Best fix:** Put the article H1, short description/byline, and publication metadata before the featured image on small screens (or consistently at all sizes); keep secondary taxonomy from blocking the title. During Markdown generation, assign deterministic, human-readable, unique IDs to H2/H3 headings with Portuguese-safe slugging and collision suffixes, and emit a typed heading outline alongside the sanitized HTML. Render a semantic `<nav aria-label="Neste artigo">` for articles above a documented heading/length threshold, with nested levels, visible focus styles, and `scroll-margin-top` for the fixed header. Direct fragment loads and clicks must land on and expose the target heading. Keep the complete breadcrumb name in the accessibility tree while applying visual ellipsis with CSS.
- **Acceptance:** At 390×844 the complete H1 starts within the first viewport without overlap; the current long article renders an accurate keyboard-accessible table of contents; every TOC URL works on direct load and client navigation; duplicate/accented headings receive stable unique IDs across builds; short articles do not receive empty UI; heading hierarchy has no skipped levels introduced by the template; screenshots at 320, 390, 768, and 1440 px confirm readable line length and no sticky-header obstruction.

### AUD-040 — Categories and tags are conflated into an unbounded taxonomy

- **Status / priority:** `PARTIAL / P2`
- **Implementation PR:** [#69](https://github.com/Finrood/NatiPsy/pull/69)
- **Current gap (2026-09-24):** The shared card and regression test now use the registered `/blog/category/carreira` route. It passes locally; the old link remains live until deployment. The owner approved the existing category/tag classification.
- **Branch:** `codex/aud-040-blog-taxonomy-model`
- **Area:** Content architecture, UX, search classification, data modeling
- **Files:** blog frontmatter, `src/app/models/blog-post.model.ts`, `src/scripts/generate-blog-index.js`, blog list/post templates and filtering
- **Evidence:** The only article declares ten values in `categories`; all ten become top-level filter options and all ten are printed as equal-weight chips on both cards and the article. At 390 px, the card's chips occupy approximately 184 px and the article's chips occupy 208 px. They are noninteractive spans even though the archive presents the same terms as navigation filters. Broad concepts, audiences, problems, and a specific phenomenon are all modeled identically.
- **Why this matters:** An uncontrolled taxonomy fragments future content, makes filtering noisy, obscures the article's primary subject, lengthens every card, and gives neither users nor search systems a clear topic hierarchy. Fixing presentation alone would allow inconsistent metadata to accumulate again; the content schema needs an explicit contract.
- **Best fix:** With owner/editor approval, define a small controlled primary-category registry with stable slug, Portuguese label, description, and aliases. Require one and allow at most two or three primary categories per post. Model more specific descriptors separately as normalized `tags`; reject duplicates, unknown categories, empty values, and case/whitespace variants in the generator. Filters operate on primary categories. Cards show only the primary categories in at most two rows; article tags appear after the title/summary in a lower-priority region. Make navigable taxonomy items real links to the chosen filtered or category URL policy from AUD-038. Do not create indexable category landing pages until each has enough unique owner-approved content to avoid thin pages.
- **Acceptance:** Schema/fixture tests enforce category limits and normalization; the existing post is migrated using owner-approved classifications rather than silently dropping terms; filter options remain stable when tag vocabulary grows; card topic UI is bounded at 320/390 px; linked categories have valid crawl/index behavior; JSON-LD `article:tag` and visible metadata come from the same normalized source; documentation explains how an editor adds a category versus a tag.

### AUD-041 — Blog failures expose English technical text and provide no retry path

- **Status / priority:** `RESOLVED / P2`
- **Implementation PR:** [#70](https://github.com/Finrood/NatiPsy/pull/70)
- **Branch:** `codex/aud-041-blog-error-recovery`
- **Area:** Reliability, localization, UX, error handling
- **Files:** `src/app/services/blog.service.ts:21-34,80-129,154-190`, blog list/post components and templates
- **Evidence:** `fetchPostsIndex()` maps an HTTP failure to a new generic `Error`, then `getPostsList()` catches and passes that non-HTTP error through `handleError()` again even though it assumes `HttpErrorResponse`; its diagnostic fields become undefined and the final UI message is English. `BlogListComponent` displays `err.message` directly on a Portuguese page. Category-load failure is only logged, so the filter can silently disappear. Neither the archive nor article transient-error state offers an in-place retry.
- **Why this matters:** A temporary network/cache failure leaves users at a dead end, mixes languages, and leaks implementation-oriented text without telling them what action is safe. Double wrapping destroys the original status/cause, makes 404 versus transient failure harder to distinguish, and produces noisy duplicate logs.
- **Best fix:** Translate transport failures once at the service boundary into a small typed error model such as `not-found`, `offline`, `server`, and `invalid-content`, preserving the original cause for diagnostics but never rendering it verbatim. Components map those codes to concise owner-approved Portuguese copy and appropriate actions. Add “Tentar novamente” that re-runs the current request while preserving route/filter state, disables while loading, and announces the result; retain a separate clear 404 state. Combine archive data/category failure into one explicit view model or show partial-data status deliberately. Log once through an environment-aware logger and avoid full response/body logging in production.
- **Acceptance:** Tests cover offline/status 0, 404, 500, invalid JSON, index failure, and category failure; every visible message is Portuguese and contains no stack, URL, status dump, or `undefined`; retry succeeds without a reload and cannot launch duplicate concurrent requests; 404 stays nonretryable and maps to HTTP 404/noindex under the chosen deployment; async announcements integrate with AUD-030 without speaking duplicate messages.

### AUD-042 — Canonical site identity is duplicated across runtime and generated files

- **Status / priority:** `RESOLVED / P2`
- **Implementation PR:** [#71](https://github.com/Finrood/NatiPsy/pull/71)
- **Closure evidence (2026-09-24):** The owner confirmed the displayed name, credential, phone, and public identity. Central configuration and generated/runtime consistency checks pass.
- **Branch:** `codex/aud-042-central-site-config`
- **Area:** Reuse, configuration integrity, SEO, maintainability
- **Files:** `src/app/config/contact.ts`, `src/scripts/generate-blog-index.js`, `src/index.html`, `src/server.ts`, `public/robots.txt`, `public/sitemap.xml`, `public/llms.txt`, structured-data components
- **Evidence:** The canonical origin is separately hardcoded in the browser config, generator, index metadata, SSR host allowlist, robots, sitemap, and `llms.txt`. The professional name and credential appear in templates and several independently built JSON-LD objects; spelling also varies between `Natalia` and `Natália`. Generated files correctly repeat values by design, but there is no single validated source from which all of them are produced.
- **Why this matters:** A domain, contact, brand spelling, credential, locale, or default-image change can leave canonical tags, sitemap, robots, social cards, host validation, and visible copy disagreeing. That is both a reliability problem and an SEO/entity-classification problem. Repetition also makes safe maintenance needlessly difficult.
- **Best fix:** Add one nonsecret, schema-validated site configuration consumed by both the Node generator and Angular build—for example JSON plus a generated typed TypeScript module. It should define the canonical origin without a trailing slash, locale/time zone, owner-approved display/legal/author names, credential text, contact/social URLs, default social image, and allowed production hosts. Generate robots, sitemap, feed/`llms.txt` link data, and static default metadata from it; import the typed values in runtime SEO/structured-data code. Keep page-specific marketing copy and post-author frontmatter where they belong. Do not “correct” accents, credentials, phone numbers, or claims without owner approval, and never put secrets in this public configuration.
- **Acceptance:** Changing the canonical-origin fixture and regenerating updates every canonical absolute URL and trusted hostname with no old-domain occurrence; invalid origins, phone/contact URLs, locale, or missing required identity fail the build; runtime and generated artifacts use one spelling selected by the owner; a CI check runs generation and fails on a dirty diff; tests prove source config contains no secret-shaped fields and client bundles expose only intentionally public data.

### AUD-043 — The blog has no subscribable content feed

- **Status / priority:** `RESOLVED / P3`
- **Implementation PR:** [#44](https://github.com/Finrood/NatiPsy/pull/44); dedicated [#72](https://github.com/Finrood/NatiPsy/pull/72) was closed as superseded
- **Branch:** `codex/aud-043-rss-feed`
- **Area:** Feature, content distribution, retention
- **Files:** `src/scripts/generate-blog-index.js`, `src/index.html`, generated public assets, `nginx.conf`
- **Evidence:** The project generates an HTML archive, per-post JSON, routes, and sitemap, but no RSS or Atom feed exists and the document head has no feed autodiscovery link.
- **Why this matters:** Readers, feed applications, newsletter automations, and some content-discovery tools have no standards-based way to subscribe to new articles. A feed is a distribution and retention improvement, not a guaranteed Google ranking factor; its value is independent of unsupported SEO promises.
- **Best fix:** Extend the tested content generator to create one deterministic RSS 2.0 or Atom feed from the same validated, published-post collection. Include site title/description, canonical absolute item URL, stable permalink GUID/ID, author where appropriate, publication date, and an escaped plain-text summary; exclude drafts and invalid posts. Use the newest real publication/update date instead of the build clock, cap item count with a documented constant, and generate atom/self metadata required by the selected format. Add `<link rel="alternate" type="application/rss+xml" ...>` (or Atom equivalent) to prerendered heads. Configure and test the correct content type and a short revalidating cache policy in both supported servers.
- **Acceptance:** A feed validator accepts the generated file; XML-special characters and Unicode fixtures round-trip safely; posts are newest-first with stable IDs and no draft; two unchanged builds are byte-identical; the autodiscovery URL returns 200 with the correct MIME/cache headers; a new published fixture appears once and an unpublished fixture never appears.

### AUD-044 — Visible controls can lose first-load input before hydration

- **Status / priority:** `PARTIAL / P1`
- **Follow-up:** `codex/finish-audit-20260924`
- **Current gap (2026-09-24):** Filter controls remain disabled in server HTML until client hydration; ordinary article links still navigate without JavaScript. Throttled pre-hydration and no-JavaScript browser tests pass locally. Re-run the production browser suite after deployment before closing.
- **Proposed branch:** `codex/aud-044-prehydration-interactions`
- **Area:** Hydration, UX, accessibility, production browser testing
- **Evidence:** In a live Chromium session, selecting “Carreira” immediately after the prerendered archive appeared left the URL at `/blog`; hydration then reset the visible selection. The same action worked after a short readiness wait. Twelve of 42 production-targeted browser tests failed with this timing pattern, while the local build passed all 42. `withEventReplay()` is already configured, so merely adding it is not a fix.
- **Why this matters:** A person can see an enabled control, interact, and silently lose the action on a slower first load; early article clicks can fall back to full navigation instead of the expected client behavior.
- **Best fix:** Provide a reliable, explicit hydrated-ready state and either keep interactive controls unavailable until ready or implement a progressive fallback that honors input before JavaScript attaches. Preserve useful server-rendered content. Separate tests of post-hydration behavior from an explicit slow-network pre-hydration test.
- **Acceptance:** Under throttled first load, a visible enabled filter choice and article navigation are never silently lost; URL and UI agree after hydration; keyboard and screen-reader behavior remain correct; an explicit browser test covers the early window; the normal post-hydration browser suite passes against production without arbitrary sleeps.

### AUD-045 — Cloudflare email obfuscation breaks the no-JavaScript contact link

- **Status / priority:** `RESOLVED / P2`
- **Closure evidence (2026-09-24):** Cloudflare Email Address Obfuscation was switched off. Live HTML on all six sitemap pages contains the public `mailto:psinataliaferreira@gmail.com` link and no `/cdn-cgi/l/email-protection` link; a no-JavaScript browser therefore retains the native email action.
- **Proposed branch:** `codex/aud-045-email-edge-fallback`
- **Area:** Cloudflare, contact, progressive enhancement
- **Evidence:** The repository emits a public `mailto:` link. Cloudflare rewrites the live link to `/cdn-cgi/l/email-protection#...`; in a browser with JavaScript disabled that destination returns 404 on the home, blog, service, trust, and article pages.
- **Why this matters:** A public contact method should not become a broken internal link for no-JavaScript visitors or crawlers. The address is already intentionally public in source, so edge obfuscation does not justify the broken fallback.
- **Best fix:** Disable Cloudflare Email Address Obfuscation for this site or exempt these deliberate contact links. Retain a real `mailto:` in served HTML; do not replace it with an untested JavaScript-only workaround.
- **Acceptance:** The live response and browser with JavaScript disabled expose the intended `mailto:` link on every public page; no `/cdn-cgi/l/email-protection` link remains; normal browser contact behavior and CSP remain intact.

### AUD-046 — Master quality checks are not enforced by branch protection

- **Status / priority:** `RESOLVED / P2`
- **Closure evidence (2026-09-24):** GitHub's branch API reports `master` protected. The required check is the observed `quality` job from GitHub Actions, strict/up-to-date mode is on, a pull request is required with zero human approvals, conversations must be resolved, linear history is enforced, and force-push/deletion is disabled. Administrators are exempt solely as an intentional recovery path; this follow-up must merge through the normal passing check.
- **Proposed branch:** `codex/aud-046-enforce-quality-gate`
- **Area:** GitHub repository governance, CI
- **Evidence:** The Quality workflow passes on current `master`, but GitHub's branch API reports `protected: false` for `master`. A future direct push or merge can bypass the tests; AUD-015's CI exists but is advisory.
- **Why this matters:** The post-merge regression protection depends on convention rather than enforcement.
- **Best fix:** Configure a repository ruleset or branch protection for `master` requiring the Quality status check and blocking direct pushes, while preserving an intentional recovery/admin process. Use the actual emitted check name rather than an assumed label.
- **Acceptance:** GitHub reports active protection/ruleset coverage for `master`; a deliberately failing PR cannot merge through the normal path; the current green Quality check satisfies the rule; the recovery exception is documented without silently bypassing checks.

## Historical findings and revalidation

The original audit contained 23 findings. They remain here as history so counts are auditable; their old recommendations must not be executed again without checking the current open successor.

| Historical ID | Short description | Revalidated status on `23d203a` | Current successor |
| --- | --- | --- | --- |
| 1.1 | `robots.txt` blocked assets | RESOLVED in source | Live edge drift is AUD-002 |
| 1.2 | WhatsApp number lacked ninth digit | RESOLVED | — |
| 1.3 | Menu forced hard reloads | RESOLVED | — |
| 1.4 | Filter/sort directly triggered duplicate load | RESOLVED | New URL/state issues are AUD-005/AUD-006 |
| 1.5 | Unguarded browser DOM access | RESOLVED | — |
| 1.6 | Unsafe Markdown sanitizer bypass | RESOLVED | — |
| 1.7 | Canonical trailing-slash mismatch | RESOLVED | — |
| 2.1 | Markdown/parser and eager article bloated initial JS | PARTIAL | AUD-019 |
| 2.2 | Animations engine loaded synchronously | RESOLVED | — |
| 2.3 | 1.25 MB legacy raster assets | RESOLVED | — |
| 2.4 | One-year immutable caching for unhashed media | RESOLVED | — |
| 2.5 | Redundant Google font preload | RESOLVED | Third-party font dependency is AUD-023 |
| 3.1 | Footer hover contrast | RESOLVED | — |
| 3.2 | Mobile-menu focus trap | RESOLVED | Remaining interactions are AUD-030 |
| 3.3 | Hidden header retained offscreen focus | RESOLVED | — |
| 3.4 | Skip target was not focusable | RESOLVED | — |
| 4.1 | Flat hero type hierarchy | RESOLVED | Mobile composition is AUD-031 |
| 4.2 | Broken hero gradient | RESOLVED | — |
| 4.3 | Static heading looked interactive | RESOLVED | — |
| 4.4 | Header background outside design system | REOPENED after runtime check | AUD-004 |
| 4.5 | Floating WhatsApp obscured mobile controls | RESOLVED | — |
| 5.1 | Migrate mutable UI state to signals | PARTIAL (top menu only) | AUD-006 |
| 5.2 | Compile Markdown at build time | RESOLVED | Pipeline hardening is AUD-008/AUD-009 |

Historical total: **23 = 20 resolved + 3 carried/reopened**. Current work should use `AUD-*` IDs only.

## External references used for SEO/schema decisions

- [Google title-link best practices](https://developers.google.com/search/docs/appearance/title-link)
- [Google meta-description/snippet guidance](https://developers.google.com/search/docs/appearance/snippet)
- [Google sitemap guidance](https://developers.google.com/search/docs/crawling-indexing/sitemaps/build-sitemap)
- [Google image SEO guidance](https://developers.google.com/search/docs/appearance/google-images)
- [Google structured-data introduction](https://developers.google.com/search/docs/appearance/structured-data/intro-structured-data)
- [Google local-business structured data](https://developers.google.com/search/docs/appearance/structured-data/local-business)
- [Schema.org `hasCredential`](https://schema.org/hasCredential)
- [Schema.org `EducationalOccupationalCredential`](https://schema.org/EducationalOccupationalCredential)

Additional version/build references:

- [Angular version compatibility](https://angular.dev/reference/versions)
- [Angular `provideClientHydration` and default HTTP transfer cache](https://angular.dev/api/platform-browser/provideClientHydration)
- [Google pagination and incremental-loading guidance](https://developers.google.com/search/docs/specialty/ecommerce/pagination-and-incremental-page-loading)
- [Google crawlable-link guidance](https://developers.google.com/search/docs/crawling-indexing/links-crawlable)
- [Nginx official downloads](https://nginx.org/en/download.html)
- [Docker build context and `.dockerignore`](https://docs.docker.com/build/building/context/#dockerignore-files)
- [Tailwind CSS source detection and `@source`](https://tailwindcss.com/docs/detecting-classes-in-source-files)

## Current follow-up workflow

This ledger replaces the completed 2026-09-12 implementation prompt. The original 43 finding branches/PRs have been reconciled above; do not rerun that prompt or recreate those branches. Work only from the six non-`RESOLVED` entries, verify the current code and live environment first, and update each item's status and evidence after its acceptance criteria actually pass. A merged PR alone does not turn a `PARTIAL` item into `RESOLVED`.

For any new gap, assign the next `AUD-` ID here rather than creating a second backlog. Keep external operational evidence, owner-dependent decisions, and release-monitor status explicit.
