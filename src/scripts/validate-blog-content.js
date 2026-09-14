const fs = require("fs");
const path = require("path");
const matter = require("gray-matter");

const projectRoot = path.join(__dirname, "../..");

function defaultContentDir(root = projectRoot) {
  const privateDir = path.join(root, "content/blog");
  return fs.existsSync(privateDir)
    ? privateDir
    : path.join(root, "public/assets/content/blog");
}

function isContained(baseDir, candidate) {
  const relative = path.relative(
    path.resolve(baseDir),
    path.resolve(candidate),
  );
  return (
    relative !== "" &&
    relative !== ".." &&
    !relative.startsWith(`..${path.sep}`) &&
    !path.isAbsolute(relative)
  );
}

function validateRelativeAsset(value, baseDir, label, errors, file) {
  if (
    typeof value !== "string" ||
    value.trim() === "" ||
    path.isAbsolute(value)
  ) {
    errors.push(`${file}: ${label} must be a relative path`);
    return;
  }
  const candidate = path.resolve(baseDir, value);
  if (!isContained(baseDir, candidate)) {
    errors.push(`${file}: ${label} escapes its asset directory`);
    return;
  }
  if (!fs.existsSync(candidate) || !fs.statSync(candidate).isFile()) {
    errors.push(`${file}: ${label} does not exist (${value})`);
  }
}

function validDateOnly(value) {
  const dateOnly =
    value instanceof Date ? value.toISOString().slice(0, 10) : value;
  if (typeof dateOnly !== "string" || !/^\d{4}-\d{2}-\d{2}$/.test(dateOnly))
    return false;
  const date = new Date(`${dateOnly}T00:00:00.000Z`);
  return date.toISOString().slice(0, 10) === dateOnly;
}

function validateContentDirectory(
  contentDir = defaultContentDir(),
  imagesDir = path.join(contentDir, "images"),
) {
  const errors = [];
  const slugs = new Set();
  const posts = [];

  for (const file of fs
    .readdirSync(contentDir)
    .filter((entry) => path.extname(entry).toLowerCase() === ".md")
    .sort()) {
    const filePath = path.join(contentDir, file);
    let data;
    let source;
    try {
      source = fs.readFileSync(filePath, "utf8");
      ({ data } = matter(source));
    } catch (error) {
      errors.push(`${file}: invalid frontmatter (${error.message})`);
      continue;
    }

    if (data.draft === true || data.published === false) continue;

    const slug = path.basename(file, path.extname(file));
    if (!/^[a-z0-9]+(?:-[a-z0-9]+)*$/.test(slug))
      errors.push(`${file}: slug must be URL-safe lowercase kebab-case`);
    if (slugs.has(slug)) errors.push(`${file}: duplicate slug ${slug}`);
    slugs.add(slug);

    if (typeof data.title !== "string" || data.title.trim() === "")
      errors.push(`${file}: title is required and must be a nonempty string`);
    if (typeof data.description !== "string" || data.description.trim() === "")
      errors.push(
        `${file}: description is required and must be a nonempty string`,
      );
    const dateLiteral =
      source.match(/^date:\s*["']?(\d{4}-\d{2}-\d{2})/m)?.[1] ?? data.date;
    if (!validDateOnly(dateLiteral))
      errors.push(`${file}: date must be a valid YYYY-MM-DD date`);
    if (
      !Array.isArray(data.categories) ||
      data.categories.length === 0 ||
      data.categories.some(
        (category) => typeof category !== "string" || category.trim() === "",
      )
    ) {
      errors.push(`${file}: categories must be a nonempty array of strings`);
    }

    if (data.image !== undefined && data.image !== null) {
      validateRelativeAsset(data.image, imagesDir, "image", errors, file);
      if (
        typeof data.image === "string" &&
        !/\.(?:avif|gif|jpe?g|png|webp)$/i.test(data.image)
      ) {
        errors.push(`${file}: image must use a supported raster extension`);
      }
    }

    if (
      data.author !== undefined &&
      (typeof data.author !== "object" ||
        data.author === null ||
        Array.isArray(data.author) ||
        typeof data.author.name !== "string" ||
        data.author.name.trim() === "")
    ) {
      errors.push(`${file}: author must be an object with a nonempty name`);
    } else if (data.author?.avatar) {
      validateRelativeAsset(
        data.author.avatar,
        imagesDir,
        "author.avatar",
        errors,
        file,
      );
    }

    for (const field of [
      "seoTitle",
      "seoDescription",
      "socialTitle",
      "socialDescription",
    ]) {
      if (
        data[field] !== undefined &&
        (typeof data[field] !== "string" || data[field].trim() === "")
      ) {
        errors.push(
          `${file}: ${field} must be a nonempty string when provided`,
        );
      }
    }

    posts.push({
      slug,
      date: typeof dateLiteral === "string" ? dateLiteral : String(dateLiteral),
    });
  }

  return { errors, posts };
}

function comparePosts(a, b) {
  return b.date.localeCompare(a.date) || a.slug.localeCompare(b.slug);
}

if (require.main === module) {
  const result = validateContentDirectory();
  if (result.errors.length > 0) {
    console.error(
      `[Blog Content Validator] ${result.errors.length} error(s):\n- ${result.errors.join("\n- ")}`,
    );
    process.exitCode = 1;
  } else {
    console.log(
      `[Blog Content Validator] Validated ${result.posts.length} publishable post(s).`,
    );
  }
}

module.exports = {
  comparePosts,
  defaultContentDir,
  isContained,
  validateContentDirectory,
};
