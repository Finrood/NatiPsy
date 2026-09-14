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
const robotsPath = configuredPath('SITE_ROBOTS_PATH', path.join(__dirname, '../../public/robots.txt'));
const llmsPath = configuredPath('SITE_LLMS_PATH', path.join(__dirname, '../../public/llms.txt'));
const indexPath = configuredPath('SITE_INDEX_PATH', path.join(__dirname, '../../src/index.html'));

const siteConfigPath = process.env.SITE_CONFIG_PATH
  ? path.resolve(process.env.SITE_CONFIG_PATH)
  : path.join(__dirname, '../app/config/site-config.json');
const SITE_CONFIG = require(siteConfigPath);
const publicOrigin = new URL(SITE_CONFIG.canonicalOrigin);
if (
  !['http:', 'https:'].includes(publicOrigin.protocol)
  || publicOrigin.username
  || publicOrigin.password
  || publicOrigin.pathname !== '/'
  || publicOrigin.search
  || publicOrigin.hash
) {
  throw new Error('canonicalOrigin must be an exact http(s) origin.');
}
for (const field of ['locale', 'timeZone', 'brandName', 'professionalName', 'credential', 'siteDescription', 'specialization', 'defaultImage', 'email', 'whatsappNumber', 'instagramUrl']) {
  if (typeof SITE_CONFIG[field] !== 'string' || SITE_CONFIG[field].trim() === '') {
    throw new Error(`Invalid site configuration field: ${field}`);
  }
}
if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(SITE_CONFIG.email) || new URL(SITE_CONFIG.instagramUrl).protocol !== 'https:') {
  throw new Error('email and instagramUrl must be valid public contact values.');
}
const whatsappDigits = SITE_CONFIG.whatsappNumber.replace(/\D/g, '');
if (whatsappDigits.length < 10) {
  throw new Error('whatsappNumber must contain a complete international number.');
}
const SITE_URL = publicOrigin.origin;
const WHATSAPP_URL = `https://wa.me/${whatsappDigits}`;

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

function escapeHtml(value) {
  return String(value).replace(/[&<>"']/g, (char) => ({
    '&': '&amp;',
    '<': '&lt;',
    '>': '&gt;',
    '"': '&quot;',
    "'": '&#39;'
  }[char]));
}

function replaceOnce(html, pattern, replacement) {
  if (!pattern.test(html)) {
    throw new Error(`Static metadata marker not found: ${pattern}`);
  }
  return html.replace(pattern, replacement);
}

function synchronizeStaticMetadata() {
  let html = fs.readFileSync(indexPath, 'utf8');
  const title = `${SITE_CONFIG.brandName} | Psicóloga Clínica - Terapia Online`;
  const description = `${SITE_CONFIG.siteDescription} ${SITE_CONFIG.credential}`;
  const image = pageUrl(SITE_CONFIG.defaultImage);
  html = replaceOnce(html, /<title>.*?<\/title>/, `<title>${escapeHtml(title)}</title>`);
  html = replaceOnce(html, /<meta name="description" content="[^"]*">/, `<meta name="description" content="${escapeHtml(description)}">`);
  html = replaceOnce(html, /<meta name="author" content="[^"]*">/, `<meta name="author" content="${escapeHtml(SITE_CONFIG.brandName)}">`);
  html = replaceOnce(html, /<meta property="og:url" content="[^"]*">/, `<meta property="og:url" content="${SITE_URL}/">`);
  html = replaceOnce(html, /<meta property="og:title" content="[^"]*">/, `<meta property="og:title" content="${escapeHtml(title)}">`);
  html = replaceOnce(html, /<meta property="og:description" content="[^"]*">/, `<meta property="og:description" content="${escapeHtml(description)}">`);
  html = replaceOnce(html, /<meta property="og:image" content="[^"]*">/, `<meta property="og:image" content="${image}">`);
  html = replaceOnce(html, /<meta name="twitter:url" content="[^"]*">/, `<meta name="twitter:url" content="${SITE_URL}/">`);
  html = replaceOnce(html, /<meta name="twitter:title" content="[^"]*">/, `<meta name="twitter:title" content="${escapeHtml(title)}">`);
  html = replaceOnce(html, /<meta name="twitter:description" content="[^"]*">/, `<meta name="twitter:description" content="${escapeHtml(description)}">`);
  html = replaceOnce(html, /<meta name="twitter:image" content="[^"]*">/, `<meta name="twitter:image" content="${image}">`);
  html = replaceOnce(html, /<meta name="twitter:image:alt" content="[^"]*">/, `<meta name="twitter:image:alt" content="${escapeHtml(SITE_CONFIG.professionalName)}">`);
  html = replaceOnce(html, /<link rel="canonical" href="[^"]*">/, `<link rel="canonical" href="${SITE_URL}/">`);
  fs.writeFileSync(indexPath, html);
}

function generateRobots() {
  fs.writeFileSync(robotsPath, `User-agent: *\nAllow: /\nDisallow: /404\n\nSitemap: ${pageUrl('/sitemap.xml')}\n`);
}

function generateLlms() {
  fs.writeFileSync(llmsPath, `# ${SITE_CONFIG.brandName} - Psicóloga Clínica\n\n> ${SITE_CONFIG.siteDescription}\n\n## Páginas Principais\n- [Início](${pageUrl('/')}): Página principal com informações sobre atendimento, serviços e agendamento.\n- [Sobre Mim](${pageUrl('/#sobre-mim')}): Informações profissionais sobre ${SITE_CONFIG.brandName} (${SITE_CONFIG.credential}).\n- [Meus Serviços](${pageUrl('/#meus-servicos')}): Terapia individual, desenvolvimento pessoal, ansiedade e orientação de carreira.\n- [Minha Abordagem](${pageUrl('/#abordagem')}): ${SITE_CONFIG.specialization}.\n- [Vantagens](${pageUrl('/#vantagens')}): Benefícios da terapia online.\n- [Blog](${pageUrl('/blog')}): Artigos sobre psicologia, saúde mental e relacionamentos.\n\n## Contato\n- [WhatsApp](${WHATSAPP_URL}): Agendamento de consultas via WhatsApp.\n`);
}

function generateRoutesFile(posts) {
  const lines = ['/', '/blog', ...posts.map((post) => `/blog/${post.slug}`)];
  fs.writeFileSync(routesPath, lines.join('\n') + '\n');
  console.log(`[Blog Index Generator] Wrote ${lines.length} routes to ${routesPath}`);
}

function imageUrl(post) {
  return post.image ? `${SITE_URL}/assets/content/blog/images/${post.image}` : null;
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
    <image:title>${escapeXml(SITE_CONFIG.professionalName)}</image:title>
    <image:caption>${escapeXml(SITE_CONFIG.specialization)}</image:caption>
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
    synchronizeStaticMetadata();
    generateRobots();
    generateLlms();

  } catch (err) {
    console.error("\n[Blog Index Generator] Error reading content directory or writing index file:", err);
    process.exit(1); // Exit with error code
  }
}

generateIndex();
