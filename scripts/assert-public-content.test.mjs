import assert from "node:assert/strict";
import { execFileSync } from "node:child_process";
import { access, mkdir, mkdtemp, readFile, writeFile } from "node:fs/promises";
import { tmpdir } from "node:os";
import { join } from "node:path";
import test from "node:test";
import { findPrivateContent } from "./assert-public-content.mjs";

const generator = new URL(
  "../src/scripts/generate-blog-index.js",
  import.meta.url,
);

async function exists(path) {
  try {
    await access(path);
    return true;
  } catch {
    return false;
  }
}

async function createFixture() {
  const root = await mkdtemp(join(tmpdir(), "natipsy-public-content-"));
  await mkdir(join(root, "content/blog/images"), { recursive: true });
  await mkdir(join(root, "public/assets/content/blog/posts"), {
    recursive: true,
  });
  await mkdir(join(root, "public/assets/content/blog/images"), {
    recursive: true,
  });
  await mkdir(join(root, "src"), { recursive: true });
  await writeFile(join(root, "src/routes.txt"), "/stale\n");
  await writeFile(join(root, "public/sitemap.xml"), "<stale/>");
  await writeFile(
    join(root, "public/assets/content/blog/posts/deleted.json"),
    "{}",
  );
  await writeFile(
    join(root, "public/assets/content/blog/images/deleted.webp"),
    "deleted",
  );
  await writeFile(join(root, "content/blog/images/keep.webp"), "keep");
  await writeFile(join(root, "content/blog/images/draft.webp"), "draft");
  await writeFile(
    join(root, "content/blog/images/unpublished.webp"),
    "unpublished",
  );
  await writeFile(join(root, "content/blog/images/invalid.webp"), "invalid");
  await writeFile(
    join(root, "content/blog/keep.md"),
    "---\ntitle: Keep this post\ndate: 2026-01-01\ndescription: A published fixture\nimage: keep.webp\ncategories:\n  - Test\n---\nPublished content.\n",
  );
  await writeFile(
    join(root, "content/blog/draft.md"),
    "---\ntitle: Draft post\ndate: 2026-01-02\ndescription: A draft fixture\ndraft: true\nimage: draft.webp\n---\nDraft content.\n",
  );
  await writeFile(
    join(root, "content/blog/unpublished.md"),
    "---\ntitle: Unpublished post\ndate: 2026-01-03\ndescription: An unpublished fixture\npublished: false\nimage: unpublished.webp\n---\nUnpublished content.\n",
  );
  await writeFile(
    join(root, "content/blog/invalid.md"),
    "---\ndate: 2026-01-04\ndescription: Missing title\nimage: invalid.webp\n---\nInvalid content.\n",
  );
  return root;
}

function runGenerator(root) {
  execFileSync(process.execPath, [generator.pathname], {
    env: { ...process.env, BLOG_PROJECT_ROOT: root },
    stdio: "inherit",
  });
}

test("publishes only validated content and cleans stale generated artifacts", async () => {
  const root = await createFixture();
  const publicBlog = join(root, "public/assets/content/blog");

  runGenerator(root);

  const index = JSON.parse(
    await readFile(join(publicBlog, "index.json"), "utf8"),
  );
  assert.deepEqual(
    index.map((post) => post.slug),
    ["keep"],
  );
  assert.equal(await exists(join(publicBlog, "posts/keep.json")), true);
  assert.equal(await exists(join(publicBlog, "images/keep.webp")), true);
  assert.equal(await exists(join(publicBlog, "posts/deleted.json")), false);
  assert.equal(await exists(join(publicBlog, "images/deleted.webp")), false);
  assert.equal(await exists(join(publicBlog, "images/draft.webp")), false);
  assert.equal(
    await exists(join(publicBlog, "images/unpublished.webp")),
    false,
  );
  assert.equal(await exists(join(publicBlog, "images/invalid.webp")), false);
  assert.equal(
    (await readFile(join(root, "src/routes.txt"), "utf8")).includes(
      "/blog/keep",
    ),
    true,
  );
  assert.equal(
    (await readFile(join(root, "src/routes.txt"), "utf8")).includes("draft"),
    false,
  );
  assert.deepEqual(await findPrivateContent(publicBlog), []);

  await writeFile(
    join(root, "content/blog/keep.md"),
    "---\ntitle: Keep this post\ndate: 2026-01-01\ndescription: Now unpublished\npublished: false\nimage: keep.webp\n---\nNo longer public.\n",
  );
  runGenerator(root);
  assert.deepEqual(
    JSON.parse(await readFile(join(publicBlog, "index.json"), "utf8")),
    [],
  );
  assert.equal(await exists(join(publicBlog, "posts/keep.json")), false);
  assert.equal(await exists(join(publicBlog, "images/keep.webp")), false);
});
