import assert from 'node:assert/strict';
import { createRequire } from 'node:module';
import { copyFile, mkdir, mkdtemp, readFile, rm, writeFile } from 'node:fs/promises';
import { join } from 'node:path';

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

assert.match(config.canonicalOrigin, /^https:\/\/[^/]+$/);
assert.equal(config.locale, 'pt-BR');
assert.equal(config.allowedHosts, undefined, 'allowed hosts must be derived, not duplicated in JSON');
assert.equal(config.whatsappUrl, undefined, 'contact URLs must be derived from validated primitives');
assert.match(typedConfig, /canonicalOrigin must be an exact http\(s\) origin/);
assert.match(typedConfig, /SITE_CONFIG_ALLOWED_HOSTS/);
assert.doesNotMatch(JSON.stringify(config), /password|secret|token|privateKey/i);
assert.match(contact, /from ['"]\.\/site-config['"]/);
assert.match(generator, /SITE_CONFIG_PATH/);
assert.match(generator, /synchronizeStaticMetadata\(\)/);
assert.match(generator, /generateRobots\(\)/);
assert.match(generator, /generateLlms\(\)/);
assert.match(server, /SITE_CONFIG_ALLOWED_HOSTS/);
const escapedOrigin = config.canonicalOrigin.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
assert.match(index, new RegExp(escapedOrigin));
assert.match(robots, new RegExp(`${escapedOrigin}/sitemap\\.xml`));
assert.match(sitemap, new RegExp(escapedOrigin));
assert.match(llms, new RegExp(escapedOrigin));

const require = createRequire(import.meta.url);
const generatorPath = join(root, 'src/scripts/generate-blog-index.js');
const fixtureRoot = await mkdtemp(join(root, 'dist', '.site-config-fixture-'));
const fixtureConfigPath = join(fixtureRoot, 'site-config.json');
const fixtureContentDir = join(fixtureRoot, 'content');
const fixturePostsDir = join(fixtureRoot, 'posts');
const fixtureIndexPath = join(fixtureRoot, 'index.html');
const fixtureRoutesPath = join(fixtureRoot, 'routes.txt');
const fixtureSitemapPath = join(fixtureRoot, 'sitemap.xml');
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
    readFile(fixtureLlmsPath, 'utf8'),
  ]);
  const generated = generatedFiles.join('\n');
  assert.match(generated, /https:\/\/example\.test/);
  assert.match(generated, /Example Brand/);
  assert.match(generated, /wa\.me\/5511999999999/);
  assert.doesNotMatch(generated, new RegExp(escapedOrigin));
  assert.doesNotMatch(generated, /Natalia Ferreira/);
  assert.doesNotMatch(generated, /5548984323764/);

  const invalidConfig = { ...replacementConfig, canonicalOrigin: 'https://user:pass@example.test/path' };
  await writeFile(fixtureConfigPath, JSON.stringify(invalidConfig, null, 2));
  assert.throws(runGenerator, /canonicalOrigin must be an exact http\(s\) origin/);
} finally {
  await rm(fixtureRoot, { recursive: true, force: true });
}

console.log('Central site configuration contract passed.');
