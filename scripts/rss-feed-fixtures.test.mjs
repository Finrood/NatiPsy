import assert from "node:assert/strict";
import { mkdir, mkdtemp, readFile, rm, writeFile } from "node:fs/promises";
import { createRequire } from "node:module";
import { join } from "node:path";
import { JSDOM } from "jsdom";

const root = process.cwd();
const fixtureRoot = await mkdtemp(join(root, "dist", ".rss-fixtures-"));
const contentDir = join(fixtureRoot, "content");
const publicContentDir = join(fixtureRoot, "public");
const postsDir = join(publicContentDir, "posts");
const outputIndex = join(publicContentDir, "index.json");
const routesPath = join(fixtureRoot, "routes.txt");
const sitemapPath = join(fixtureRoot, "sitemap.xml");
const feedPath = join(fixtureRoot, "feed.xml");
const require = createRequire(import.meta.url);
const generatorPath = join(root, "src/scripts/generate-blog-index.js");

const runGenerator = () => {
  Object.assign(process.env, {
    BLOG_CONTENT_DIR: contentDir,
    BLOG_POSTS_DIR: postsDir,
    BLOG_INDEX_PATH: outputIndex,
    BLOG_ROUTES_PATH: routesPath,
    BLOG_SITEMAP_PATH: sitemapPath,
    BLOG_FEED_PATH: feedPath,
    BLOG_PUBLIC_CONTENT_DIR: publicContentDir,
  });
  delete require.cache[require.resolve(generatorPath)];
  require(generatorPath).generateIndex();
};

const parseFeed = (xml) => {
  const document = new JSDOM(xml, { contentType: "text/xml" }).window.document;
  assert.equal(document.documentElement.nodeName, "rss");
  return [...document.querySelectorAll("item")].map((item) => ({
    title: item.querySelector("title")?.textContent,
    description: item.querySelector("description")?.textContent,
    guid: item.querySelector("guid")?.textContent,
    isPermaLink: item.querySelector("guid")?.getAttribute("isPermaLink"),
  }));
};

const post = (slug, date, extra = "") => {
  const published = extra.includes("published: false") ? "false" : "true";
  const additionalFrontMatter = extra.replace(/^published: false\n/m, "");
  return `---
title: ${slug}
date: ${date}
description: "Descrição com <tag> & acento — ${slug}"
categories:
  - testes
published: ${published}
${additionalFrontMatter}---

Conteúdo de ${slug}.
`;
};

try {
  await mkdir(contentDir, { recursive: true });
  await writeFile(join(contentDir, "newest.md"), post("newest", "2026-01-03"));
  await writeFile(join(contentDir, "older.md"), post("older", "2026-01-02"));
  await writeFile(
    join(contentDir, "draft.md"),
    post("draft", "2026-01-04", "draft: true\n"),
  );
  await writeFile(
    join(contentDir, "unpublished.md"),
    post("unpublished", "2026-01-05", "published: false\n"),
  );
  await writeFile(
    join(contentDir, "invalid.md"),
    "---\ndraft: true\ndescription: missing title\n---\nignored\n",
  );
  for (let index = 0; index < 21; index += 1) {
    await writeFile(
      join(contentDir, `post-${index}.md`),
      post(`post-${index}`, `2025-02-${String(index + 1).padStart(2, "0")}`),
    );
  }

  runGenerator();
  const firstFeed = await readFile(feedPath, "utf8");
  const firstItems = parseFeed(firstFeed);
  const firstIndex = JSON.parse(await readFile(outputIndex, "utf8"));
  assert.equal(
    firstIndex.some(
      (item) => item.slug === "draft" || item.slug === "unpublished",
    ),
    false,
  );
  assert.equal(
    firstIndex.some((item) => item.slug === "invalid"),
    false,
  );
  assert.equal(firstItems.length, 20);
  assert.equal(firstItems[0].title, "newest");
  assert.equal(
    firstItems[0].description,
    "Descrição com <tag> & acento — newest",
  );
  assert.equal(firstItems[0].isPermaLink, "true");
  assert.match(firstItems[0].guid, /\/blog\/newest$/);
  assert.equal(firstItems.at(-1).title, "post-3");
  assert.equal(
    firstItems.some((item) => item.title === "post-0"),
    false,
  );

  runGenerator();
  assert.equal(
    await readFile(feedPath, "utf8"),
    firstFeed,
    "feed generation must be deterministic",
  );
  assert.deepEqual(parseFeed(await readFile(feedPath, "utf8")), firstItems);

  await rm(join(contentDir, "newest.md"));
  runGenerator();
  const changedFeed = await readFile(feedPath, "utf8");
  assert.doesNotMatch(
    changedFeed,
    /<title>newest<\/title>/,
    "removing a post must remove it from the feed",
  );
} finally {
  await rm(fixtureRoot, { recursive: true, force: true });
}

console.log("RSS fixture contract passed.");
