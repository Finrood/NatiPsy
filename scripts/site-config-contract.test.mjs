import assert from 'node:assert/strict';
import { createRequire } from 'node:module';
import { copyFile, mkdir, mkdtemp, readFile, rm, writeFile } from 'node:fs/promises';
import { join } from 'node:path';
import { JSDOM } from 'jsdom';

const root = process.cwd();
const config = JSON.parse(await readFile(new URL('../src/app/config/site-config.json', import.meta.url), 'utf8'));
const contact = await readFile(new URL('../src/app/config/contact.ts', import.meta.url), 'utf8');
const typedConfig = await readFile(new URL('../src/app/config/site-config.ts', import.meta.url), 'utf8');
const generator = await readFile(new URL('../src/scripts/generate-blog-index.js', import.meta.url), 'utf8');
const server = await readFile(new URL('../src/server.ts', import.meta.url), 'utf8');
const index = await readFile(new URL('../src/index.html', import.meta.url), 'utf8');
const robots = await readFile(new URL('../public/robots.txt', import.meta.url), 'utf8');
const sitemap = await readFile(new URL('../public/sitemap.xml', import.meta.url), 'utf8');
const llms = await readFile(new URL('../public/llms.txt', import.meta.url), 'utf8');
const require = createRequire(import.meta.url);
const validatorPath = join(root, 'src/app/config/site-config-validator.cjs');
const { REQUIRED_KEYS, deriveAllowedHosts, validateSiteConfig } = require(validatorPath);

assert.match(config.canonicalOrigin, /^https:\/\/[^/]+$/);
assert.equal(config.locale, 'pt-BR');
assert.equal(config.allowedHosts, undefined, 'allowed hosts must be derived, not duplicated in JSON');
assert.equal(config.whatsappUrl, undefined, 'contact URLs must be derived from validated primitives');
assert.match(typedConfig, /site-config-validator\.cjs/);
assert.match(typedConfig, /SITE_CONFIG_ALLOWED_HOSTS/);
assert.doesNotMatch(JSON.stringify(config), /password|secret|token|privateKey/i);
assert.match(contact, /from ['"]\.\/site-config['"]/);
assert.match(generator, /SITE_CONFIG_PATH/);
assert.match(generator, /synchronizeStaticMetadata\(\)/);
assert.match(generator, /generateRobots\(\)/);
assert.match(generator, /generateLlms\(\)/);
assert.match(server, /SITE_CONFIG_ALLOWED_HOSTS/);
assert.match(generator, /site-config-validator\.cjs/);
const escapedOrigin = config.canonicalOrigin.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
assert.match(index, new RegExp(escapedOrigin));
assert.match(robots, new RegExp(`${escapedOrigin}/sitemap\\.xml`));
assert.match(sitemap, new RegExp(escapedOrigin));
assert.match(llms, new RegExp(escapedOrigin));

const validated = validateSiteConfig(config);
assert.equal(validated.whatsappUrl, `https://wa.me/${config.whatsappNumber.slice(1)}`);

for (const field of REQUIRED_KEYS) {
  const missing = { ...config };
  delete missing[field];
  assert.throws(() => validateSiteConfig(missing), new RegExp(`Missing site configuration field: ${field}`));
  assert.throws(
    () => validateSiteConfig({ ...config, [field]: 42 }),
    new RegExp(`Invalid site configuration field: ${field}`),
  );
}

const invalidShapes = [
  ['canonicalOrigin credentials/path', { canonicalOrigin: 'https://user:pass@example.test/path' }, /canonicalOrigin/],
  ['malformed canonicalOrigin', { canonicalOrigin: 'not a URL' }, /canonicalOrigin/],
  ['locale', { locale: 'not_a_locale' }, /locale/],
  ['time zone', { timeZone: 'Mars/Olympus' }, /timeZone/],
  ['short phone', { whatsappNumber: '+55123' }, /E\.164/],
  ['formatted phone', { whatsappNumber: '+55 (48) 98432-3764' }, /E\.164/],
  ['unrelated Instagram host', { instagramUrl: 'https://example.test/person' }, /instagram\.com/],
  ['Instagram credentials', { instagramUrl: 'https://user:pass@instagram.com/person/' }, /credential-free/],
  ['malformed Instagram URL', { instagramUrl: 'not a URL' }, /instagram\.com/],
  ['invalid email', { email: 'not-an-email' }, /valid email/],
  ['absolute image', { defaultImage: 'https://example.test/image.webp' }, /root-relative/],
  ['traversing image', { defaultImage: '/assets/../secret.webp' }, /root-relative/],
  ['encoded traversing image', { defaultImage: '/assets/%2e%2e/secret.webp' }, /root-relative/],
  ['attribute injection image', { defaultImage: '/assets/hero" onerror="alert(1).webp' }, /root-relative/],
  ['markup image', { defaultImage: '/assets/<script>.webp' }, /root-relative/],
  ['encoded backslash image', { defaultImage: '/assets/%5C..%5Cprivate.webp' }, /root-relative/],
  ['literal backslash image', { defaultImage: '/assets/\\..\\private.webp' }, /root-relative/],
  ['whitespace image', { defaultImage: '/assets/hero image.webp' }, /root-relative/],
  ['double-encoded traversal image', { defaultImage: '/assets/%252e%252e/private.webp' }, /root-relative/],
  ['unknown key', { extraPublicValue: 'x' }, /Unknown site configuration field/],
  ['secret key', { apiToken: 'never-commit-this' }, /Secret-shaped site configuration key/],
];
for (const [label, changes, expected] of invalidShapes) {
  assert.throws(() => validateSiteConfig({ ...config, ...changes }), expected, label);
}

const generatorPath = join(root, 'src/scripts/generate-blog-index.js');
const fixtureRoot = await mkdtemp(join(root, 'dist', '.site-config-fixture-'));
const fixtureConfigPath = join(fixtureRoot, 'site-config.json');
const fixtureContentDir = join(fixtureRoot, 'content');
const fixturePostsDir = join(fixtureRoot, 'posts');
const fixtureIndexPath = join(fixtureRoot, 'index.html');
const fixtureRoutesPath = join(fixtureRoot, 'routes.txt');
const fixtureSitemapPath = join(fixtureRoot, 'sitemap.xml');
const fixtureFeedPath = join(fixtureRoot, 'feed.xml');
const fixtureRobotsPath = join(fixtureRoot, 'robots.txt');
const fixtureLlmsPath = join(fixtureRoot, 'llms.txt');

const runGenerator = () => {
  Object.assign(process.env, {
    SITE_CONFIG_PATH: fixtureConfigPath,
    BLOG_CONTENT_DIR: fixtureContentDir,
    BLOG_POSTS_DIR: fixturePostsDir,
    BLOG_PUBLIC_CONTENT_DIR: join(fixtureRoot, 'public'),
    SITE_INDEX_PATH: fixtureIndexPath,
    BLOG_ROUTES_PATH: fixtureRoutesPath,
    BLOG_SITEMAP_PATH: fixtureSitemapPath,
    BLOG_FEED_PATH: fixtureFeedPath,
    SITE_ROBOTS_PATH: fixtureRobotsPath,
    SITE_LLMS_PATH: fixtureLlmsPath,
  });
  delete require.cache[require.resolve(fixtureConfigPath)];
  delete require.cache[require.resolve(generatorPath)];
  require(generatorPath).generateIndex();
};

try {
  await mkdir(fixtureContentDir, { recursive: true });
  await copyFile(join(root, 'src/index.html'), fixtureIndexPath);
  const replacementConfig = {
    ...config,
    canonicalOrigin: 'https://example.test',
    brandName: 'Example Brand',
    professionalName: 'Example Brand Psychology',
    siteDescription: 'Example public site description.',
    specialization: 'Example specialization.',
    whatsappNumber: '+5511999999999',
    email: 'hello@example.test',
    instagramUrl: 'https://www.instagram.com/example/',
  };
  await writeFile(fixtureConfigPath, JSON.stringify(replacementConfig, null, 2));
  await writeFile(join(fixtureContentDir, 'example.md'), `---\ntitle: Example\ndate: 2026-01-01\ndescription: Example\ncategories:\n  - Example\n---\n\nContent\n`);

  runGenerator();
  const generatedFiles = await Promise.all([
    readFile(fixtureIndexPath, 'utf8'),
    readFile(fixtureRobotsPath, 'utf8'),
    readFile(fixtureSitemapPath, 'utf8'),
    readFile(fixtureFeedPath, 'utf8'),
    readFile(fixtureLlmsPath, 'utf8'),
  ]);
  const generated = generatedFiles.join('\n');
  assert.match(generated, /https:\/\/example\.test/);
  assert.match(generated, /Example Brand/);
  assert.match(generated, /wa\.me\/5511999999999/);
  assert.doesNotMatch(generated, new RegExp(escapedOrigin));
  assert.doesNotMatch(generated, /Natalia Ferreira/);
  assert.doesNotMatch(generated, /5548984323764/);
  assert.deepEqual(
    deriveAllowedHosts(replacementConfig.canonicalOrigin),
    ['localhost', '127.0.0.1', '::1', 'example.test', 'www.example.test'],
    'SSR hosts must derive from changed identity configuration',
  );

  const structuredDataConsumers = await Promise.all([
    readFile(join(root, 'src/app/components/blog-list/blog-list.component.ts'), 'utf8'),
    readFile(join(root, 'src/app/components/blog-post/blog-post.component.ts'), 'utf8'),
    readFile(join(root, 'src/app/components/about-me/about-me.component.ts'), 'utf8'),
  ]);
  assert.doesNotMatch(
    structuredDataConsumers.join('\n'),
    /['"]Natalia Ferreira(?: Psicóloga)?['"]/,
    'JSON-LD identity must flow through shared configuration instead of stale literals',
  );

  const injectionProbe = {
    ...replacementConfig,
    brandName: 'Example" onerror="alert(1)',
    siteDescription: '<script id="config-injection">bad</script>',
  };
  await writeFile(fixtureConfigPath, JSON.stringify(injectionProbe, null, 2));
  runGenerator();
  const escapedIndex = await readFile(fixtureIndexPath, 'utf8');
  const document = new JSDOM(escapedIndex).window.document;
  assert.equal(document.querySelectorAll('[onerror], #config-injection').length, 0);
  assert.equal(document.querySelector('meta[name="author"]')?.getAttribute('content'), injectionProbe.brandName);
  assert.match(escapedIndex, /&quot; onerror=&quot;/);
  assert.match(escapedIndex, /&lt;script/);

  for (const defaultImage of [
    '/assets/hero" onerror="alert(1).webp',
    '/assets/<script>.webp',
    '/assets/%5C..%5Cprivate.webp',
  ]) {
    await writeFile(fixtureConfigPath, JSON.stringify({ ...replacementConfig, defaultImage }, null, 2));
    assert.throws(runGenerator, /defaultImage must be a safe root-relative path/);
    assert.equal(await readFile(fixtureIndexPath, 'utf8'), escapedIndex, 'rejected config must not mutate HTML');
  }

  const invalidConfig = { ...replacementConfig, canonicalOrigin: 'https://user:pass@example.test/path' };
  await writeFile(fixtureConfigPath, JSON.stringify(invalidConfig, null, 2));
  assert.throws(runGenerator, /canonicalOrigin must be an exact http\(s\) origin/);
} finally {
  await rm(fixtureRoot, { recursive: true, force: true });
}

console.log('Central site configuration contract passed.');
