const fs = require("fs");
const path = require("path");
const matter = require("gray-matter");
const { marked } = require("marked");
const { validateContentDirectory } = require("./validate-blog-content");

const projectRoot =
  process.env.BLOG_PROJECT_ROOT || path.join(__dirname, "../..");
const configuredPath = (name, fallback) =>
  process.env[name] ? path.resolve(process.env[name]) : fallback;
const contentDir = configuredPath("BLOG_CONTENT_DIR", path.join(projectRoot, "content/blog"));
const sourceImagesDir = configuredPath("BLOG_IMAGES_DIR", path.join(contentDir, "images"));
const publicContentDir = configuredPath(
  "BLOG_PUBLIC_CONTENT_DIR",
  path.join(projectRoot, "public/assets/content/blog"),
);
const publicAssetsDir = path.join(projectRoot, "public/assets");
const routesPath = configuredPath("BLOG_ROUTES_PATH", path.join(projectRoot, "src/routes.txt"));
const sitemapPath = configuredPath("BLOG_SITEMAP_PATH", path.join(projectRoot, "public/sitemap.xml"));
const feedPath = configuredPath("BLOG_FEED_PATH", path.join(projectRoot, "public/feed.xml"));

const SITE_URL = "https://psicologanataliaferreira.com";
const POSTS_PER_PAGE = 6;

const STATIC_PAGES = [
  { path: '/', lastmod: '2026-09-12', changefreq: 'weekly', priority: '1.0', image: { loc: '/assets/NatiHero.webp', title: 'Natalia Ferreira - Psicóloga Clínica', caption: 'Psicóloga especializada em Terapia Relacional Sistêmica' } },
  { path: '/blog', lastmod: '2025-04-21', changefreq: 'weekly', priority: '0.8' },
  { path: '/terapia-online', lastmod: '2026-09-12', changefreq: 'monthly', priority: '0.8' },
  { path: '/orientacao-profissional', lastmod: '2026-09-12', changefreq: 'monthly', priority: '0.8' },
];

function calculateReadingTime(content) {
  if (!content) return 0;
  const wordsPerMinute = 200;
  const textOnly = content
    .replace(/<[^>]*>/g, " ")
    .replace(/\s+/g, " ")
    .trim();
  const words = textOnly ? textOnly.split(" ").length : 0;
  return Math.ceil(words / wordsPerMinute);
}

function escapeXml(value) {
  return String(value).replace(
    /[<>&'"]/g,
    (char) =>
      ({
        "<": "&lt;",
        ">": "&gt;",
        "&": "&amp;",
        "'": "&apos;",
        '"': "&quot;",
      })[char],
  );
}

function pageUrl(route) {
  return `${SITE_URL}${route}`;
}

function generateRoutesFile(posts) {
  const pageCount = Math.ceil(posts.length / POSTS_PER_PAGE);
  const pageRoutes = Array.from(
    { length: Math.max(0, pageCount - 1) },
    (_, index) => `/blog/page/${index + 2}`,
  );
  return [
    ...STATIC_PAGES.map(page => page.path),
    ...pageRoutes,
    ...posts.map(post => `/blog/${post.slug}`),
  ].join('\n') + '\n';
}

function imageUrl(post) {
  return post.image
    ? `${SITE_URL}/assets/content/blog/images/${post.image}`
    : null;
}

function generateFeed(posts) {
  const items = posts.slice(0, 20).map((post) => {
    const postUrl = pageUrl(`/blog/${post.slug}`);
    const author = post.author?.name
      ? `\n      <dc:creator>${escapeXml(post.author.name)}</dc:creator>`
      : "";
    return `    <item>
      <title>${escapeXml(post.title)}</title>
      <link>${escapeXml(postUrl)}</link>
      <guid isPermaLink="true">${escapeXml(postUrl)}</guid>${author}
      <pubDate>${new Date(post.date).toUTCString()}</pubDate>
      <description>${escapeXml(post.description)}</description>
    </item>`;
  }).join("\n");
  const latestDate = posts[0]?.date
    ? new Date(posts[0].date).toUTCString()
    : new Date(0).toUTCString();
  return `<?xml version="1.0" encoding="UTF-8"?>
<rss version="2.0" xmlns:atom="http://www.w3.org/2005/Atom" xmlns:dc="http://purl.org/dc/elements/1.1/">
  <channel>
    <title>Natalia Ferreira | Psicóloga Clínica</title>
    <link>${escapeXml(SITE_URL)}/</link>
    <description>Artigos sobre saúde mental, relacionamentos, carreira e desenvolvimento pessoal.</description>
    <language>pt-BR</language>
    <lastBuildDate>${latestDate}</lastBuildDate>
    <atom:link href="${escapeXml(pageUrl("/feed.xml"))}" rel="self" type="application/rss+xml" />
${items}
  </channel>
</rss>
`;
}

function generateSitemap(posts) {
  const urls = STATIC_PAGES.map((page) => `  <url>
    <loc>${escapeXml(pageUrl(page.path))}</loc>
    <lastmod>${page.lastmod}</lastmod>
    <changefreq>${page.changefreq}</changefreq>
    <priority>${page.priority}</priority>${page.image ? `
    <image:image>
      <image:loc>${escapeXml(pageUrl(page.image.loc))}</image:loc>
      <image:title>${escapeXml(page.image.title)}</image:title>
      <image:caption>${escapeXml(page.image.caption)}</image:caption>
    </image:image>` : ''}
  </url>`);

  const pageCount = Math.ceil(posts.length / POSTS_PER_PAGE);
  const paginationLastmod = posts[0]?.date.slice(0, 10) ?? '2025-04-21';
  for (let page = 2; page <= pageCount; page++) {
    urls.push(`  <url>
    <loc>${escapeXml(pageUrl(`/blog/page/${page}`))}</loc>
    <lastmod>${paginationLastmod}</lastmod>
    <changefreq>weekly</changefreq>
    <priority>0.6</priority>
  </url>`);
  }

  for (const post of posts) {
    const postImageUrl = imageUrl(post);
    urls.push(`  <url>
    <loc>${escapeXml(pageUrl(`/blog/${post.slug}`))}</loc>
    <lastmod>${post.date.slice(0, 10)}</lastmod>
    <changefreq>monthly</changefreq>
    <priority>0.7</priority>${
      postImageUrl
        ? `
    <image:image>
      <image:loc>${escapeXml(postImageUrl)}</image:loc>
      <image:title>${escapeXml(post.title)}</image:title>
      <image:caption>${escapeXml(post.description)}</image:caption>
    </image:image>`
        : ""
    }
  </url>`);
  }

  return `<?xml version="1.0" encoding="UTF-8"?>
<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9"
        xmlns:image="http://www.google.com/schemas/sitemap-image/1.1">
${urls.join("\n")}
</urlset>
`;
}

function safeSourcePath(reference) {
  if (typeof reference !== "string" || reference.trim() === "") return null;
  const normalized = path.normalize(reference);
  const source = path.resolve(sourceImagesDir, normalized);
  const sourceRoot = `${path.resolve(sourceImagesDir)}${path.sep}`;
  return source.startsWith(sourceRoot) ? { normalized, source } : null;
}

function copyReferencedImage(reference, stagingImages, context) {
  const safePath = safeSourcePath(reference);
  if (
    !safePath ||
    !fs.existsSync(safePath.source) ||
    !fs.statSync(safePath.source).isFile()
  ) {
    console.warn(
      `[Blog Index Generator] Warning for ${context}: image '${reference}' is not available in authored content.`,
    );
    return null;
  }

  const destination = path.join(stagingImages, safePath.normalized);
  fs.mkdirSync(path.dirname(destination), { recursive: true });
  fs.copyFileSync(safePath.source, destination);
  return safePath.normalized;
}

function resolveAuthorAvatar(reference, stagingImages, context) {
  if (typeof reference === "string" && reference.startsWith("/assets/")) {
    // Shared site assets are authored against the public asset root and must
    // remain absolute; they are not content-local blog images to be copied.
    return reference;
  }
  return copyReferencedImage(reference, stagingImages, context);
}

function replaceDirectory(stagedPath, destinationPath) {
  const backupPath = `${destinationPath}.backup-${process.pid}`;
  fs.rmSync(backupPath, { recursive: true, force: true });
  if (fs.existsSync(destinationPath)) {
    try {
      fs.renameSync(destinationPath, backupPath);
    } catch (error) {
      if (error.code !== "EXDEV") throw error;
      fs.cpSync(destinationPath, backupPath, { recursive: true });
      fs.rmSync(destinationPath, { recursive: true, force: true });
    }
  }
  try {
    try {
      fs.renameSync(stagedPath, destinationPath);
    } catch (error) {
      if (error.code !== "EXDEV") throw error;
      fs.cpSync(stagedPath, destinationPath, { recursive: true });
      fs.rmSync(stagedPath, { recursive: true, force: true });
    }
    fs.rmSync(backupPath, { recursive: true, force: true });
  } catch (error) {
    if (!fs.existsSync(destinationPath) && fs.existsSync(backupPath)) {
      try {
        fs.renameSync(backupPath, destinationPath);
      } catch (restoreError) {
        if (restoreError.code !== "EXDEV") throw restoreError;
        fs.cpSync(backupPath, destinationPath, { recursive: true });
        fs.rmSync(backupPath, { recursive: true, force: true });
      }
    }
    throw error;
  }
}

function replaceFile(stagedPath, destinationPath) {
  const backupPath = `${destinationPath}.backup-${process.pid}`;
  fs.rmSync(backupPath, { force: true });
  if (fs.existsSync(destinationPath))
    fs.renameSync(destinationPath, backupPath);
  try {
    fs.renameSync(stagedPath, destinationPath);
    fs.rmSync(backupPath, { force: true });
  } catch (error) {
    if (!fs.existsSync(destinationPath) && fs.existsSync(backupPath))
      fs.renameSync(backupPath, destinationPath);
    throw error;
  }
}

function generateIndex() {
  const validation = validateContentDirectory(
    contentDir,
    sourceImagesDir,
    publicAssetsDir,
  );
  if (validation.errors.length > 0) {
    throw new Error(
      `[Blog Content Validator] ${validation.errors.length} error(s):\n- ${validation.errors.join("\n- ")}`,
    );
  }

  const posts = [];
  const stagingRoot = fs.mkdtempSync(path.join(projectRoot, ".blog-staging-"));
  const stagingBlogDir = path.join(stagingRoot, "blog");
  const stagingPostsDir = path.join(stagingBlogDir, "posts");
  const stagingImagesDir = path.join(stagingBlogDir, "images");
  const stagingRoutesPath = path.join(stagingRoot, "routes.txt");
  const stagingSitemapPath = path.join(stagingRoot, "sitemap.xml");
  const stagingFeedPath = path.join(stagingRoot, "feed.xml");

  try {
    fs.mkdirSync(stagingPostsDir, { recursive: true });
    fs.mkdirSync(stagingImagesDir, { recursive: true });
    const files = fs.readdirSync(contentDir, { withFileTypes: true });

    for (const entry of files) {
      if (!entry.isFile() || path.extname(entry.name).toLowerCase() !== ".md")
        continue;

      const slug = path.basename(entry.name, ".md");
      const filePath = path.join(contentDir, entry.name);
      try {
        const { data, content } = matter(fs.readFileSync(filePath, "utf-8"));
        if (data.draft === true || data.published === false) {
          console.log(
            `[Blog Index Generator] Excluding unpublished post ${entry.name}`,
          );
          continue;
        }
        if (!data.title || !data.date || !data.description) {
          console.warn(
            `[Blog Index Generator] Skipping ${entry.name}: missing required front matter.`,
          );
          continue;
        }

        const categories = Array.isArray(data.categories)
          ? data.categories
          : typeof data.categories === "string"
            ? data.categories
                .split(",")
                .map((category) => category.trim())
                .filter(Boolean)
            : [];
        const sourceAuthor = data.author;
        let author = null;
        if (sourceAuthor) {
          if (typeof sourceAuthor === "string") {
            author = { name: sourceAuthor };
          } else if (typeof sourceAuthor === "object" && sourceAuthor.name) {
            const avatar = sourceAuthor.avatar
              ? resolveAuthorAvatar(
                  sourceAuthor.avatar,
                  stagingImagesDir,
                  entry.name,
                )
              : undefined;
            author = {
              name: sourceAuthor.name,
              bio: sourceAuthor.bio || undefined,
              avatar: avatar || undefined,
            };
          }
        }

        const image = data.image
          ? copyReferencedImage(data.image, stagingImagesDir, entry.name)
          : null;
        const postData = {
          slug,
          title: data.title,
          dateOnly: new Date(data.date).toISOString().slice(0, 10),
          date: new Date(data.date).toISOString(),
          description: data.description,
          image,
          imageWidth: data.imageWidth,
          imageHeight: data.imageHeight,
          categories,
          author,
          readTime: calculateReadingTime(content),
        };
        posts.push(postData);
        fs.writeFileSync(
          path.join(stagingPostsDir, `${slug}.json`),
          JSON.stringify(
            { ...postData, content: marked.parse(content) },
            null,
            2,
          ),
        );
      } catch (error) {
        console.error(
          `[Blog Index Generator] Skipping ${entry.name}: ${error.message}`,
        );
      }
    }

    posts.sort(
      (a, b) => new Date(b.date).getTime() - new Date(a.date).getTime(),
    );
    fs.writeFileSync(
      path.join(stagingBlogDir, "index.json"),
      JSON.stringify(posts, null, 2),
    );
    fs.writeFileSync(
      stagingRoutesPath,
      generateRoutesFile(posts),
    );
    fs.writeFileSync(stagingSitemapPath, generateSitemap(posts));
    fs.writeFileSync(stagingFeedPath, generateFeed(posts));

    fs.mkdirSync(path.dirname(publicContentDir), { recursive: true });
    fs.mkdirSync(path.dirname(routesPath), { recursive: true });
    fs.mkdirSync(path.dirname(sitemapPath), { recursive: true });
    fs.mkdirSync(path.dirname(feedPath), { recursive: true });
    replaceDirectory(stagingBlogDir, publicContentDir);
    replaceFile(stagingRoutesPath, routesPath);
    replaceFile(stagingSitemapPath, sitemapPath);
    replaceFile(stagingFeedPath, feedPath);
    console.log(
      `[Blog Index Generator] Generated ${posts.length} publishable posts atomically.`,
    );
  } finally {
    fs.rmSync(stagingRoot, { recursive: true, force: true });
  }
}

if (require.main === module) {
  try {
    generateIndex();
  } catch (error) {
    console.error(`[Blog Index Generator] Failed: ${error.message}`);
    process.exitCode = 1;
  }
}

module.exports = { calculateReadingTime, generateFeed, generateIndex, generateSitemap };
