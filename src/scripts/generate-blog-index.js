const fs = require('fs');
const path = require('path');
const matter = require('gray-matter');

const contentDir = path.join(__dirname, '../../public/assets/content/blog');
const outputIndexPath = path.join(contentDir, 'index.json');
const imagesDir = path.join(contentDir, 'images');
const routesPath = path.join(__dirname, '../../src/routes.txt');
const sitemapPath = path.join(__dirname, '../../public/sitemap.xml');

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
    <loc>${escapeXml(pageUrl('/blog/'))}</loc>
    <lastmod>${lastSiteUpdate}</lastmod>
    <changefreq>weekly</changefreq>
    <priority>0.8</priority>
  </url>`
  ];

  for (const post of posts) {
    const postImageUrl = imageUrl(post);
    urls.push(`  <url>
    <loc>${escapeXml(pageUrl(`/blog/${post.slug}/`))}</loc>
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

        } catch (parseError) {
          console.error(`\n[Blog Index Generator] Error parsing front matter for ${file}:`, parseError.message);
        }
      }
    }

    // Sort posts by date descending before writing
    posts.sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime());

    fs.writeFileSync(outputIndexPath, JSON.stringify(posts, null, 2)); // Pretty print JSON
    console.log(`\n[Blog Index Generator] Successfully generated ${outputIndexPath} with ${posts.length} posts.`);

    generateRoutesFile(posts);
    generateSitemap(posts);

  } catch (err) {
    console.error("\n[Blog Index Generator] Error reading content directory or writing index file:", err);
    process.exit(1); // Exit with error code
  }
}

generateIndex();
