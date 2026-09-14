const fs = require('fs');
const path = require('path');
const matter = require('gray-matter');
const { marked } = require('marked');

const contentDir = path.join(__dirname, '../../public/assets/content/blog');
const outputIndexPath = path.join(contentDir, 'index.json');
const postsDir = path.join(contentDir, 'posts');
const imagesDir = path.join(contentDir, 'images');
const routesPath = path.join(__dirname, '../../src/routes.txt');
const sitemapPath = path.join(__dirname, '../../public/sitemap.xml');

const SITE_URL = 'https://psicologanataliaferreira.com';

// Categories are the small, navigable primary taxonomy. More specific
// descriptors belong in the open-ended `tags` field below.
const CATEGORY_REGISTRY = new Map([
  ['carreira', {
    slug: 'carreira',
    label: 'Carreira',
    description: 'Reflexões e ferramentas para escolhas, transições e desenvolvimento profissional.',
    aliases: ['carreira', 'desenvolvimento profissional'],
  }],
  ['psicologia', {
    slug: 'psicologia',
    label: 'Psicologia',
    description: 'Conteúdos sobre saúde mental, relações e desenvolvimento pessoal.',
    aliases: ['psicologia', 'saúde mental'],
  }],
  ['orientacao profissional', {
    slug: 'orientacao-profissional',
    label: 'Orientação Profissional',
    description: 'Apoio para construir percursos profissionais alinhados a valores e possibilidades.',
    aliases: ['orientação profissional', 'orientacao profissional'],
  }],
]);

const normalizeKey = (value) => String(value)
  .normalize('NFD')
  .replace(/[\u0300-\u036f]/g, '')
  .trim()
  .replace(/\s+/g, ' ')
  .toLowerCase();

const CATEGORY_ALIASES = new Map(
  [...CATEGORY_REGISTRY.values()].flatMap(category => category.aliases.map(alias => [normalizeKey(alias), category])),
);

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

function normalizeLabels(value, fieldName) {
  const values = Array.isArray(value)
    ? value
    : typeof value === 'string'
      ? value.split(',')
      : [];
  const labels = values.map(label => String(label).trim()).filter(Boolean);
  const seen = new Set();
  return labels.map(label => {
    const key = normalizeKey(label);
    if (seen.has(key)) {
      throw new Error(`Duplicate ${fieldName}: ${label}`);
    }
    seen.add(key);
    return label;
  });
}

function normalizeCategories(value) {
  const labels = normalizeLabels(value, 'category');
  if (labels.length < 1 || labels.length > 3) {
    throw new Error('Each post must have between one and three primary categories.');
  }
  const seenCategories = new Set();
  return labels.map(label => {
    const category = CATEGORY_ALIASES.get(normalizeKey(label));
    if (!category) {
      throw new Error(`Unknown primary category: ${label}`);
    }
    if (seenCategories.has(category.slug)) {
      throw new Error(`Duplicate category: ${label}`);
    }
    seenCategories.add(category.slug);
    return category.label;
  });
}

function normalizeTags(value, categories) {
  const tags = normalizeLabels(value, 'tag');
  const categoryKeys = new Set(categories.map(category => normalizeKey(category)));
  if (tags.some(tag => categoryKeys.has(normalizeKey(tag)))) {
    throw new Error('A label cannot be both a primary category and a tag.');
  }
  return tags;
}

function categoryDetails(categories) {
  return categories.map(label => {
    const category = CATEGORY_ALIASES.get(normalizeKey(label));
    return {
      slug: category.slug,
      label: category.label,
      description: category.description,
    };
  });
}

function pageUrl(path) {
  return `${SITE_URL}${path}`;
}

function generateRoutesFile(posts) {
  const categoryRoutes = [...new Set(posts.flatMap(post => post.categoryDetails.map(category => `/blog/category/${category.slug}`)))];
  const lines = ['/', '/blog', ...categoryRoutes, ...posts.map((post) => `/blog/${post.slug}`)];
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

  const categories = [...new Map(posts.flatMap(post => post.categoryDetails.map(category => [category.slug, category]))).values()];
  for (const category of categories) {
    urls.push(`  <url>
    <loc>${escapeXml(pageUrl(`/blog/category/${category.slug}`))}</loc>
    <lastmod>${lastSiteUpdate}</lastmod>
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

          const categories = normalizeCategories(data.categories);
          const tags = normalizeTags(data.tags, categories);

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
            dateOnly: data.date instanceof Date
              ? data.date.toISOString().slice(0, 10)
              : String(data.date).slice(0, 10),
            date: new Date(data.date).toISOString(), // Store as ISO string
            description: data.description,
            image: image,
            imageWidth: data.imageWidth,
            imageHeight: data.imageHeight,
            categories: categories,
            tags: tags,
            categoryDetails: categoryDetails(categories),
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

  } catch (err) {
    console.error("\n[Blog Index Generator] Error reading content directory or writing index file:", err);
    process.exit(1); // Exit with error code
  }
}

generateIndex();
