# Centralized Technical Audit & Improvement Report — NatiPsy

This document consolidates all identified improvement opportunities across the project, categorized into **Bugs & Functional Issues**, **Performance & PageSpeed Analysis (Desktop & Mobile)**, **Accessibility (a11y)**, **Design & UI/UX**, and **Architecture & Angular Code Quality**. Each item details the underlying problem, its impact, technical rationale, and recommended solution.

---

## 1. Bugs & Functional Issues

### 1.1 `robots.txt` blocking the `/assets` directory (Critical SEO Impact)
- **File:** [`public/robots.txt`](file:///home/finrod/Documents/Programming/Web/NatiPsy/public/robots.txt#L4)
- **Problem:** The directive `Disallow: /assets` explicitly forbids search engine crawlers (Googlebot, Bingbot) from accessing any file inside `/assets`.
- **Why improve:** Key visual assets (`NatiHero.webp`), psychologist portrait photos, logos, and blog images all live inside `/assets/`. Official Google Search Central guidelines explicitly warn that blocking CSS, JS, or image resources prevents Googlebot from rendering and indexing mobile pages properly, invalidates image indexing on Google Images, and strips rich image snippets from search engine result pages (SERPs). Furthermore, `sitemap.xml` submits image URLs located in `/assets/` that `robots.txt` actively rejects.
- **How to fix:** Remove `Disallow: /assets` from `public/robots.txt`.

### 1.2 WhatsApp phone number format risk
- **File:** [`src/app/config/contact.ts`](file:///home/finrod/Documents/Programming/Web/NatiPsy/src/app/config/contact.ts#L3)
- **Problem:** The constant defines `WHATSAPP_NUMBER = '+554884323764'`, which totals only 8 digits after the area code (DDD 48: `8432-3764`).
- **Why improve:** In Brazil, mobile phone numbers across all area codes have 9 digits (prefixing '9' before the number, e.g., `98432-3764` with E.164 international format `+5548984323764`). An 8-digit number can be treated by WhatsApp as a landline or incomplete number, failing to open the direct conversation with the therapist.
- **How to fix:** Verify and update the number to the standard 9-digit mobile phone format (`+5548984323764`).

### 1.3 Top navigation breaks SPA routing and triggers full-page reloads
- **Files:** [`src/app/components/top-menu/top-menu.component.html`](file:///home/finrod/Documents/Programming/Web/NatiPsy/src/app/components/top-menu/top-menu.component.html#L42-L46) and [`src/app/components/top-menu/top-menu.component.ts`](file:///home/finrod/Documents/Programming/Web/NatiPsy/src/app/components/top-menu/top-menu.component.ts)
- **Problem:** Menu links use plain `<a>` tags with `[href]="'/' + '#' + item"` instead of Angular Router directives (`[routerLink]="['/']" [fragment]="item"`).
- **Why improve:** When a user is reading a blog post (`/blog/:slug`) or browsing the blog archive (`/blog`) and clicks any top menu item ("About Me", "Services"), the browser initiates a hard refresh (unloads the app, wipes client state, and re-downloads all assets), destroying the instant SPA experience.
- **How to fix:** Use `[routerLink]="['/']" [fragment]="item"` in combination with the already-configured router options `anchorScrolling: 'enabled'` and `scrollPositionRestoration: 'enabled'` in `app.config.ts`.

### 1.4 Duplicate fetch trigger on blog filtering and sorting
- **File:** [`src/app/components/blog-list/blog-list.component.ts`](file:///home/finrod/Documents/Programming/Web/NatiPsy/src/app/components/blog-list/blog-list.component.ts#L148-L158)
- **Problem:** Inside `onFilterChange()` and `onSortChange()`, the method calls `this.updateQueryParams()` (which triggers `this.route.queryParams` subscription, executing `loadInitialData()`), and then immediately calls `this.loadInitialData()` directly on the exact same tick.
- **Why improve:** Every user interaction with the category filter or sort dropdown triggers two back-to-back data processing cycles and view updates, causing redundant CPU work and potential view flashes.
- **How to fix:** Keep `route.queryParams` as the single source of truth and eliminate the manual call to `this.loadInitialData()` inside `onFilterChange()` and `onSortChange()`.

### 1.5 Direct DOM access (`document.getElementById`) without platform guard
- **File:** [`src/app/components/blog-list/blog-list.component.ts`](file:///home/finrod/Documents/Programming/Web/NatiPsy/src/app/components/blog-list/blog-list.component.ts#L142-L145)
- **Problem:** Direct imperative invocation of `document.getElementById('blog-list-start')` without an `isPlatformBrowser` guard.
- **Why improve:** Direct DOM access can throw runtime exceptions or warnings during Server-Side Rendering (SSR) or Static Site Generation (SSG).
- **How to fix:** Guard with `if (isPlatformBrowser(this.platformId))` or inject `DOCUMENT` and use Angular's `Renderer2` / `ViewChild`.

### 1.6 Insecure HTML sanitizer bypass in Markdown viewer
- **File:** [`src/app/components/blog-post/blog-post.component.ts`](file:///home/finrod/Documents/Programming/Web/NatiPsy/src/app/components/blog-post/blog-post.component.ts#L91)
- **Problem:** The component uses `this.sanitizer.bypassSecurityTrustHtml(post.content as string)`. The `marked` library does not sanitize raw HTML by default.
- **Why improve:** Disabling Angular's built-in XSS sanitizer without a dedicated HTML sanitizer (such as `DOMPurify`) introduces an XSS attack vector. If articles are ever sourced from a CMS, external markdown files, or contributor inputs, arbitrary scripts could execute.
- **How to fix:** Sanitize the output using `DOMPurify` before binding, or pre-sanitize the HTML during the build pipeline.

### 1.7 Canonical URL and trailing slash discrepancies
- **Files:** [`public/sitemap.xml`](file:///home/finrod/Documents/Programming/Web/NatiPsy/public/sitemap.xml#L16), [`src/app/services/seo.service.ts`](file:///home/finrod/Documents/Programming/Web/NatiPsy/src/app/services/seo.service.ts#L32), [`src/app/components/home/home.component.ts`](file:///home/finrod/Documents/Programming/Web/NatiPsy/src/app/components/home/home.component.ts#L44)
- **Problem:** The homepage URL alternates between `https://psicologanataliaferreira.com/` (with trailing slash) in sitemap and index.html, and `https://psicologanataliaferreira.com` (without trailing slash) in `home.component.ts`. The sitemap includes `/blog/` and `/blog/slug/` with trailing slashes, while internal Angular routes and `routes.txt` use no trailing slash.
- **Why improve:** Inconsistent trailing slashes can split SEO link equity (PageRank) and lead search engines to register duplicate canonical entries.
- **How to fix:** Standardize all canonical URLs and sitemap routes to a uniform convention (consistently without trailing slashes on sub-routes, and with a slash only on the naked root domain).

---

## 2. Performance & PageSpeed Analysis (Mobile & Desktop)

### 2.1 Bloated initial client bundle (543 kB raw JS) from client-side Markdown & Buffer
- **Files:** [`src/app/app.routes.ts`](file:///home/finrod/Documents/Programming/Web/NatiPsy/src/app/app.routes.ts#L2-L28), [`src/app/services/blog.service.ts`](file:///home/finrod/Documents/Programming/Web/NatiPsy/src/app/services/blog.service.ts#L7-L9), [`package.json`](file:///home/finrod/Documents/Programming/Web/NatiPsy/package.json#L26-L29)
- **Problem:** `BlogPostComponent` is eagerly imported in `app.routes.ts`. This component imports `BlogService`, which pulls in `marked`, `gray-matter`, and the Node.js `buffer` polyfill directly into the initial entry bundle.
- **PageSpeed Diagnostics:**
  - Initial `main.js` weighs **543.27 kB** raw (~147.55 kB gzipped).
  - Triggers a build warning: `[EVAL] Use of direct eval function is strongly discouraged` originating from YAML parsers inside `gray-matter`.
  - Every single visitor to the homepage (over 90% of traffic) is forced to download, parse, and evaluate a full Markdown engine, YAML parser, and Node.js polyfills.
  - On **Mobile (Lighthouse / throttled CPU simulation)**, this adds ~400ms–700ms of Total Blocking Time (TBT) and severely degrades Interaction to Next Paint (INP).
- **How to fix:**
  1. The build script `src/scripts/generate-blog-index.js` already runs prior to `ng build`. Pre-compile the markdown into static HTML (or save per-post JSON files with `{ ...meta, htmlContent }`) at build time.
  2. Remove `marked`, `gray-matter`, and `buffer` completely from the browser bundle.
  3. Change `BlogPostComponent` to a lazy-loaded route (`loadComponent: () => import(...)`).
  - **Estimated gain:** ~180 kB reduction in initial JavaScript and complete elimination of the `eval` security/bundling warning.

### 2.2 Unnecessary inclusion of `@angular/animations` in initial bundle
- **Files:** [`src/app/app.config.ts`](file:///home/finrod/Documents/Programming/Web/NatiPsy/src/app/app.config.ts#L7-L24), [`src/app/components/top-menu/top-menu.component.ts`](file:///home/finrod/Documents/Programming/Web/NatiPsy/src/app/components/top-menu/top-menu.component.ts#L22-L32)
- **Problem:** `provideAnimations()` includes the entire `@angular/animations` engine and runtime dependencies in the initial synchronous chunk solely for a simple 300ms fade transition on the mobile menu overlay.
- **Why improve:** Adds unneeded parsing overhead and bundle weight.
- **How to fix:** Replace it with pure Tailwind CSS transitions (`transition-opacity duration-300`) or, if keeping Angular animations, switch to `provideAnimationsAsync()`.

### 2.3 Duplicate and unused legacy assets totaling 1.25 MB in `public/assets`
- **Directory:** [`public/assets/`](file:///home/finrod/Documents/Programming/Web/NatiPsy/public/assets/)
- **Problem:** The assets folder contains heavy, unreferenced legacy files:
  - `NatiHero.png` (629 kB) — while the app uses `NatiHero.webp` (20 kB).
  - `NatiAboutMe.png` (319 kB) — while the app uses `NatiAboutMe.webp` (15 kB).
  - `abordagem1.jpg` (152 kB) — while the app uses `abordagem1.webp` (54 kB).
  - `abordagem2.jpg` (163 kB) — while the app uses `abordagem2.webp` (56 kB).
- **Why improve:** Over 1.25 MB of dead weight is copied into `dist/nati-psy/browser`, bloating the Docker image, slowing down deployments, and wasting server disk/bandwidth.
- **How to fix:** Delete the obsolete `.png` and `.jpg` files that already have modern `.webp` counterparts.

### 2.4 Overly aggressive caching policy for unhashed assets in Nginx
- **File:** [`nginx.conf`](file:///home/finrod/Documents/Programming/Web/NatiPsy/nginx.conf#L41-L51)
- **Problem:** The cache block applies `Cache-Control: public, max-age=31536000, immutable` across all extensions matching `.(ico|png|webp|svg)`.
- **Why improve:** Bundled JS and CSS files contain unique build hashes (`main-HREU2ORI.js`), but static images and icons (`logo.png`, `NatiHero.webp`, `favicon.ico`) **do not contain hashes**. If the psychologist updates her hero photo, logo, or icon, returning visitors will continue to see the old cached assets for up to one full year unless they manually clear their browser cache.
- **How to fix:** Split the Nginx location blocks:
  - Hashed build artifacts (`*-[A-Za-z0-9_-]{8}\.(js|css)`): 1 year + `immutable`.
  - Unhashed images, icons, and static media: `max-age=604800` (7 days) with ETag revalidation.

### 2.5 Conflicting font preloads in `index.html`
- **File:** [`src/index.html`](file:///home/finrod/Documents/Programming/Web/NatiPsy/src/index.html#L38-L42)
- **Problem:** `index.html` contains `<link rel="preload" as="style" href="https://fonts.googleapis.com/css2?...">`, yet the Angular CLI build engine (via Beasties) already inlines the `@font-face` definitions directly into the document `<head>`.
- **Why improve:** The browser preloads an external CSS file that is never actually applied as a stylesheet, triggering Chrome console warnings: *"The resource https://fonts.googleapis.com/... was preloaded using link preload but not used within a few seconds"*.
- **How to fix:** Rely on Angular's automated font inlining and remove the redundant preload link, or preload the critical `.woff2` font file directly with `<link rel="preload" as="font" type="font/woff2" crossorigin>`.

---

## 3. Accessibility (a11y — WCAG 2.1 AA)

### 3.1 Insufficient color contrast on footer hover states (Fails WCAG 1.4.3 & 1.4.11)
- **File:** [`src/app/components/footer/footer.component.html`](file:///home/finrod/Documents/Programming/Web/NatiPsy/src/app/components/footer/footer.component.html#L10-L30)
- **Problem:** The footer has a dark background `bg-primary-blue` (dark navy, `#1c2833`). On hover/focus, the white links and social icons switch to `hover:text-primary-pink-dark` (dark rose/plum, `#8C2D4F`).
- **Why improve:** The contrast ratio between dark plum and dark navy is approximately **2.1:1**, which fails the WCAG AA minimum threshold (4.5:1 for text, 3.0:1 for graphical UI components). When a user focuses or hovers over a link, the icon darkens and virtually disappears into the navy background.
- **How to fix:** Change the hover color to a high-contrast tint on navy, such as `hover:text-primary-pink` (light blush) or bright white with an underline/focus ring.

### 3.2 Missing focus trap in mobile navigation modal
- **Files:** [`src/app/components/top-menu/top-menu.component.ts`](file:///home/finrod/Documents/Programming/Web/NatiPsy/src/app/components/top-menu/top-menu.component.ts#L116-L125) and [`top-menu.component.html`](file:///home/finrod/Documents/Programming/Web/NatiPsy/src/app/components/top-menu/top-menu.component.html#L78-L80)
- **Problem:** The mobile menu declares `role="dialog"` and `aria-modal="true"`, but pressing the `Tab` key allows keyboard focus to escape the dialog and navigate through hidden elements in the background page.
- **Why improve:** Keyboard users and screen reader users become disoriented when focus wanders into background content. Per WAI-ARIA Modal Dialog practices, focus must loop strictly within the dialog while active.
- **How to fix:** Intercept `Tab` / `Shift+Tab` cycles on the first and last focusable items within the menu, or apply the HTML `inert` attribute to background page containers while the modal is open.

### 3.3 Auto-hiding header breaks keyboard navigation (Focus Loss)
- **File:** [`src/app/components/top-menu/top-menu.component.html`](file:///home/finrod/Documents/Programming/Web/NatiPsy/src/app/components/top-menu/top-menu.component.html#L6)
- **Problem:** When scrolling down, the header receives the class `-translate-y-full` (translating it completely offscreen).
- **Why improve:** If a keyboard user tabs backward through the page, focus enters header elements while they are positioned off-screen, with zero visible focus indicator.
- **How to fix:** Add `:focus-within` support so that if any element inside the header receives focus, the header immediately transitions back into view (`translate-y-0`).

### 3.4 Skip link target missing `tabindex="-1"`
- **File:** [`src/app/app.component.html`](file:///home/finrod/Documents/Programming/Web/NatiPsy/src/app/app.component.html#L1-L9)
- **Problem:** The skip link targets `<main id="main-content">`, but the `<main>` element lacks `tabindex="-1"`.
- **Why improve:** In several browsers and screen readers, activating a skip link to a non-focusable container shifts the visual scroll position but leaves DOM keyboard focus on the skip link itself, forcing subsequent `Tab` presses to restart from the top.
- **How to fix:** Add `tabindex="-1"` and `class="outline-none"` to `<main id="main-content" tabindex="-1">`.

---

## 4. Design, Layout & UI/UX

### 4.1 Poor typographic hierarchy in the Hero section
- **File:** [`src/app/components/hero/hero.component.html`](file:///home/finrod/Documents/Programming/Web/NatiPsy/src/app/components/hero/hero.component.html#L26-L34)
- **Problem:** Three consecutive paragraphs use `text-2xl` (24px) in the presentation column:
  ```html
  <p class="text-2xl mb-8 ...">Com um olhar sistêmico...</p>
  <p class="text-2xl mb-8 ...">Invista em seu autocuidado...</p>
  <p class="text-2xl font-semibold mb-8 ...">Agende sua consulta...</p>
  ```
- **Why improve:** Stacking three 24px paragraphs with multiple bold highlights creates visual clutter and reading fatigue, particularly on mobile viewports. It flattens the hierarchy between the introductory statement, value proposition, and call-to-action.
- **How to fix:** Format the lead paragraph at `text-lg sm:text-xl`, the secondary paragraph at `text-base sm:text-lg text-gray-700`, and reserve `text-lg sm:text-xl font-semibold text-primary-blue` for the closing CTA lead.

### 4.2 Broken gradient background in Hero visual decoration
- **File:** [`src/app/components/hero/hero.component.html`](file:///home/finrod/Documents/Programming/Web/NatiPsy/src/app/components/hero/hero.component.html#L4)
- **Problem:** `bg-gradient-to-l from-primary-pink to-primary-pink`.
- **Why improve:** Setting both the start and end gradient stops to the exact same color eliminates any gradient transition, rendering as a flat solid color.
- **How to fix:** Create a subtle transition (e.g., `from-primary-pink to-rose-100/50` or `from-primary-pink to-transparent`).

### 4.3 Interactive hover effect on a static heading (`<h2>`)
- **File:** [`src/app/components/advantages/advantages.component.html`](file:///home/finrod/Documents/Programming/Web/NatiPsy/src/app/components/advantages/advantages.component.html#L3)
- **Problem:** The section heading `<h2>` contains `hover:scale-105 transition-transform`.
- **Why improve:** Static section headings are not interactive. Adding hover zoom effects to plain text headings confuses users by mimicking clickable buttons.
- **How to fix:** Remove `hover:scale-105` from the `<h2>`.

### 4.4 Header background color diverges from design system
- **File:** [`src/app/components/top-menu/top-menu.component.html`](file:///home/finrod/Documents/Programming/Web/NatiPsy/src/app/components/top-menu/top-menu.component.html#L3-L4)
- **Problem:** The header uses Tailwind's default `bg-red-50/100` and `bg-red-50 shadow-lg`.
- **Why improve:** The palette in `styles.css` defines specific OKLCH tones for blush pink and navy blue. Default `red-50` introduces an unrelated reddish tint that breaks aesthetic harmony with the rest of the site.
- **How to fix:** Use `bg-white/95 backdrop-blur-md` or `bg-primary-pink/90 backdrop-blur-md`.

### 4.5 Floating WhatsApp button obstructs mobile UI elements
- **File:** [`src/app/app.component.html`](file:///home/finrod/Documents/Programming/Web/NatiPsy/src/app/app.component.html#L21)
- **Problem:** The floating WhatsApp button is anchored at `bottom-8 right-8` with a large footprint (~72px diameter).
- **Why improve:** On narrow viewports (e.g., 360px Android devices or iPhone SE), the button frequently covers pagination controls, "Read more" buttons, or footer links. It also lacks support for `env(safe-area-inset-bottom)`.
- **How to fix:** On mobile screens (`<sm`), reduce padding and positioning to `bottom-4 right-4 p-3` with `calc(1rem + env(safe-area-inset-bottom))`.

---

## 5. Architecture, Maintainability & Angular Modernization

### 5.1 Adopt Angular Signals for reactive state
- **Files:** [`src/app/components/blog-list/blog-list.component.ts`](file:///home/finrod/Documents/Programming/Web/NatiPsy/src/app/components/blog-list/blog-list.component.ts), [`top-menu.component.ts`](file:///home/finrod/Documents/Programming/Web/NatiPsy/src/app/components/top-menu/top-menu.component.ts)
- **Opportunity:** The application runs modern Angular with Zone.js and relies heavily on manual `cdr.detectChanges()` and `cdr.markForCheck()`.
- **Why improve:** Converting reactive properties (`isMenuOpen`, `isScrolled`, `currentPage`, `selectedCategory`) to `signal()` and `computed()` removes boilerplate, streamlines change detection, eliminates race conditions, and paves the way toward future zoneless operation (`provideExperimentalZonelessChangeDetection`).

### 5.2 Build-time Markdown compilation (Clean Static Site Generation)
- **File:** [`src/scripts/generate-blog-index.js`](file:///home/finrod/Documents/Programming/Web/NatiPsy/src/scripts/generate-blog-index.js)
- **Opportunity:** The build script currently only extracts frontmatter for `index.json`, leaving raw Markdown to be parsed at client runtime via `marked.parse()`.
- **Why improve:** Parsing Markdown into HTML during the pre-build step and outputting per-post JSON files (`public/assets/content/blog/posts/[slug].json`) with `{ ...meta, htmlContent }` yields major benefits:
  1. The client simply fetches the pre-rendered JSON and renders the HTML directly.
  2. Heavy dependencies (`marked`, `gray-matter`, `buffer`, `js-yaml`) are removed from client-side bundles.
  3. Mobile PageSpeed scores for blog pages reach top-tier performance immediately.

---

## 6. Recommended Action Plan (Priority Matrix)

| Priority | Action | Effort | Impact |
| :--- | :--- | :--- | :--- |
| **P0 - Critical** | Remove `Disallow: /assets` from [`public/robots.txt`](file:///home/finrod/Documents/Programming/Web/NatiPsy/public/robots.txt) | 5 min | High (SEO & Google Indexing) |
| **P0 - Critical** | Validate and fix WhatsApp phone number in [`contact.ts`](file:///home/finrod/Documents/Programming/Web/NatiPsy/src/app/config/contact.ts) (9th digit) | 5 min | High (Lead Conversion) |
| **P1 - High** | Fix color contrast on footer hover in [`footer.component.html`](file:///home/finrod/Documents/Programming/Web/NatiPsy/src/app/components/footer/footer.component.html) | 10 min | High (WCAG 2.1 AA Compliance) |
| **P1 - High** | Use `[routerLink]` with `[fragment]` in top menu to prevent full-page reload | 20 min | High (SPA User Experience) |
| **P1 - High** | Eliminate duplicate request trigger in [`blog-list.component.ts`](file:///home/finrod/Documents/Programming/Web/NatiPsy/src/app/components/blog-list/blog-list.component.ts) | 15 min | Medium (CPU & Render Efficiency) |
| **P1 - High** | Delete 1.25 MB of obsolete/duplicate images in `public/assets/` | 5 min | High (Bundle Size, Docker & Deploy) |
| **P2 - Medium** | Pre-compile Markdown at build time & remove `marked`/`buffer` from client | 45 min | High (Mobile PageSpeed: -180 kB JS) |
| **P2 - Medium** | Fix typographic hierarchy (24px text) in Hero section | 15 min | High (UI/UX Mobile & Desktop) |
| **P2 - Medium** | Implement Focus Trap and `:focus-within` in mobile menu/header | 30 min | Medium (Keyboard Accessibility) |
| **P2 - Medium** | Refine caching policy for unhashed assets in [`nginx.conf`](file:///home/finrod/Documents/Programming/Web/NatiPsy/nginx.conf) | 15 min | Medium (Cache Invalidation Safety) |
| **P3 - Low** | Modernize components to Angular Signals and pure CSS transitions | 1 hour | Medium (Codebase Architecture) |
