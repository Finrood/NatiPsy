const fs = require('fs');
const path = require('path');
const matter = require('gray-matter');
const { marked } = require('marked');

const configuredPath = (name, fallback) => process.env[name] ? path.resolve(process.env[name]) : fallback;
const contentDir = configuredPath('BLOG_CONTENT_DIR', path.join(__dirname, '../../public/assets/content/blog'));
const outputIndexPath = configuredPath('BLOG_INDEX_PATH', path.join(contentDir, 'index.json'));
const postsDir = configuredPath('BLOG_POSTS_DIR', path.join(contentDir, 'posts'));
const imagesDir = configuredPath('BLOG_IMAGES_DIR', path.join(contentDir, 'images'));
const routesPath = configuredPath('BLOG_ROUTES_PATH', path.join(__dirname, '../../src/routes.txt'));
const sitemapPath = configuredPath('BLOG_SITEMAP_PATH', path.join(__dirname, '../../public/sitemap.xml'));
const feedPath = configuredPath('BLOG_FEED_PATH', path.join(__dirname, '../../public/feed.xml'));

const SITE_URL = 'https://psicologanataliaferreira.com';

// Simple function to estimate reading time from text content
function calculateReadingTime(content) {
  if (!content) return 0;
  const wordsPerMinute = 200;
  // Basic word count (doesn't need full markdown parsing for estimate)
  const textOnly = content.replace(/<[^>]*>/g, ' ').replace(/\s+/g, ' ').trim();
  const words = textOnly.split(' ').length;
  return Math.ceil(words / wordsPerMinute);
}

function escapeXml(value) {
  return String(value).replace(/[<>&'"]/g, (char) => ({
    '<': '&lt;',
    '>': '&gt;',
    '&': '&amp;',
    "'": '&apos;',
    '"': '&quot;'
  }[char]));
}

function pageUrl(path) {
  return `${SITE_URL}${path}`;
}

function generateRoutesFile(posts) {
  const lines = ['/', '/blog', ...posts.map((post) => `/blog/${post.slug}`)];
  fs.writeFileSync(routesPath, lines.join('\n') + '\n');
  console.log(`[Blog Index Generator] Wrote ${lines.length} routes to ${routesPath}`);
}

function imageUrl(post) {
  return post.image ? `${SITE_URL}/assets/content/blog/images/${post.image}` : null;
}

function generateFeed(posts) {
  const feedItems = posts.slice(0, 20).map(post => {
    const postUrl = pageUrl(`/blog/${post.slug}`);
    const author = post.author?.name ? `\n      <dc:creator>${escapeXml(post.author.name)}</dc:creator>` : '';
    return `    <item>
      <title>${escapeXml(post.title)}</title>
      <link>${escapeXml(postUrl)}</link>
      <guid isPermaLink="true">${escapeXml(postUrl)}</guid>${author}
      <pubDate>${new Date(post.date).toUTCString()}</pubDate>
      <description>${escapeXml(post.description)}</description>
    </item>`;
  }).join('\n');
  const latestDate = posts[0]?.date ? new Date(posts[0].date).toUTCString() : new Date(0).toUTCString();
  const xml = `<?xml version="1.0" encoding="UTF-8"?>
<rss version="2.0" xmlns:atom="http://www.w3.org/2005/Atom" xmlns:dc="http://purl.org/dc/elements/1.1/">
  <channel>
    <title>Natalia Ferreira | Psicóloga Clínica</title>
    <link>${escapeXml(SITE_URL)}/</link>
    <description>Artigos sobre saúde mental, relacionamentos, carreira e desenvolvimento pessoal.</description>
    <language>pt-BR</language>
    <lastBuildDate>${latestDate}</lastBuildDate>
    <atom:link href="${escapeXml(pageUrl('/feed.xml'))}" rel="self" type="application/rss+xml" />
${feedItems}
  </channel>
</rss>
`;
  fs.writeFileSync(feedPath, xml);
}

function generateSitemap(posts) {
  // posts are sorted by date descending; the newest post date is the site's last modification
  const lastSiteUpdate = posts.length ? posts[0].date.slice(0, 10) : new Date().toISOString().slice(0, 10);

  const urls = [
    `  <url>
    <loc>${escapeXml(pageUrl('/'))}</loc>
    <lastmod>${lastSiteUpdate}</lastmod>
    <changefreq>weekly</changefreq>
    <priority>1.0</priority>
    <image:image>
      <image:loc>${escapeXml(pageUrl('/assets/NatiHero.webp'))}</image:loc>
      <image:title>Natalia Ferreira - Psicóloga Clínica</image:title>
      <image:caption>Psicóloga especializada em Terapia Relacional Sistêmica</image:caption>
    </image:image>
  </url>`,
    `  <url>
    <loc>${escapeXml(pageUrl('/blog'))}</loc>
    <lastmod>${lastSiteUpdate}</lastmod>
    <changefreq>weekly</changefreq>
    <priority>0.8</priority>
  </url>`
  ];

  for (const post of posts) {
    const postImageUrl = imageUrl(post);
    urls.push(`  <url>
    <loc>${escapeXml(pageUrl(`/blog/${post.slug}`))}</loc>
    <lastmod>${post.date.slice(0, 10)}</lastmod>
    <changefreq>monthly</changefreq>
    <priority>0.7</priority>${postImageUrl ? `
    <image:image>
      <image:loc>${escapeXml(postImageUrl)}</image:loc>
      <image:title>${escapeXml(post.title)}</image:title>
      <image:caption>${escapeXml(post.description)}</image:caption>
    </image:image>` : ''}
  </url>`);
  }

  const xml = `<?xml version="1.0" encoding="UTF-8"?>
<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9"
        xmlns:image="http://www.google.com/schemas/sitemap-image/1.1">
${urls.join('\n')}
</urlset>
`;
  fs.writeFileSync(sitemapPath, xml);
  console.log(`[Blog Index Generator] Wrote sitemap with ${urls.length} URLs to ${sitemapPath}`);
}

function generateIndex() {
  const posts = [];
  try {
    const files = fs.readdirSync(contentDir);
    fs.mkdirSync(postsDir, { recursive: true });

    for (const file of files) {
      if (path.extname(file) === '.md') {
        const slug = path.basename(file, '.md');
        const filePath = path.join(contentDir, file);
        const fileContent = fs.readFileSync(filePath, 'utf-8');

        try {
          const { data, content } = matter(fileContent);

          if (data.draft === true || data.published === false) {
            continue;
          }

          if (!data.title || !data.date || !data.description) {
            console.warn(`\n[Blog Index Generator] Skipping ${file}: Missing required front matter (title, date, description).`);
            continue;
          }

          // Process categories safely
          let categories = [];
          if (Array.isArray(data.categories)) {
            categories = data.categories;
          } else if (typeof data.categories === 'string' && data.categories.trim() !== '') {
            categories = data.categories.split(',').map(c => c.trim()).filter(c => c);
          } else {
            console.warn(`\n[Blog Index Generator] Warning for ${file}: 'categories' field is missing or invalid. Defaulting to empty.`);
          }

          // Process author safely
          let author = null;
          if (data.author) {
            if (typeof data.author === 'string') {
              author = { name: data.author };
            } else if (typeof data.author === 'object' && data.author.name) {
              author = {
                name: data.author.name,
                bio: data.author.bio || undefined,
                avatar: data.author.avatar || undefined
              };
            } else {
              console.warn(`\n[Blog Index Generator] Warning for ${file}: 'author' field is invalid. Ignoring.`);
            }
          }

          // Validate image path if provided
          let image = data.image || null;
          if (image && typeof image === 'string') {
            const imagePath = path.join(imagesDir, image);
            if (!fs.existsSync(imagePath)) {
              console.warn(`\n[Blog Index Generator] Warning for ${file}: Image file not found at 'assets/content/blog/images/${image}'. Setting image to null.`);
              image = null;
            }
          } else if (image) {
            console.warn(`\n[Blog Index Generator] Warning for ${file}: 'image' field is not a string. Setting image to null.`);
            image = null;
          }


          const postData = {
            slug: slug,
            title: data.title,
            date: new Date(data.date).toISOString(), // Store as ISO string
            description: data.description,
            image: image,
            categories: categories,
            author: author, // Include author info
            readTime: calculateReadingTime(content) // Calculate read time
            // DO NOT include full 'content' in the index file
          };
          posts.push(postData);

          // Pre-render Markdown to HTML at build time so the browser never
          // ships a Markdown engine: per-post JSON with ready-to-bind HTML.
          const htmlContent = marked.parse(content);
          const postJson = { ...postData, content: htmlContent };
          fs.writeFileSync(path.join(postsDir, `${slug}.json`), JSON.stringify(postJson, null, 2));

        } catch (parseError) {
          console.error(`\n[Blog Index Generator] Error parsing front matter for ${file}:`, parseError.message);
        }
      }
    }

    // Sort posts by date descending before writing
    posts.sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime());

    fs.writeFileSync(outputIndexPath, JSON.stringify(posts, null, 2)); // Pretty print JSON
    console.log(`\n[Blog Index Generator] Successfully generated ${outputIndexPath} with ${posts.length} posts.`);

    // Prune JSON files for posts that no longer exist.
    for (const file of fs.readdirSync(postsDir)) {
      if (path.extname(file) === '.json' && !posts.some((post) => `${post.slug}.json` === file)) {
        fs.unlinkSync(path.join(postsDir, file));
        console.log(`[Blog Index Generator] Removed stale ${path.join(postsDir, file)}`);
      }
    }

    generateRoutesFile(posts);
    generateSitemap(posts);
    generateFeed(posts);

  } catch (err) {
    console.error("\n[Blog Index Generator] Error reading content directory or writing index file:", err);
    process.exit(1); // Exit with error code
  }
}

generateIndex();
