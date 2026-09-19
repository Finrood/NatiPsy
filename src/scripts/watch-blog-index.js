const fs = require("fs");
const path = require("path");
const { spawnSync } = require("child_process");
const { defaultContentDir } = require("./validate-blog-content");

const contentDir = defaultContentDir();
const generator = path.join(__dirname, "generate-blog-index.js");

function createDebouncedGenerator(generate, delay = 100) {
  let pending;
  return {
    trigger() {
      clearTimeout(pending);
      pending = setTimeout(() => {
        pending = undefined;
        generate();
      }, delay);
    },
    close() {
      clearTimeout(pending);
    },
  };
}

function generate() {
  const result = spawnSync(process.execPath, [generator], { stdio: "inherit" });
  if (result.status !== 0)
    console.error(
      "[Blog Watch] Validation or generation failed; waiting for the next source change.",
    );
}

function startWatcher() {
  generate();
  const debouncedGenerate = createDebouncedGenerator(generate);
  const watcher = fs.watch(
    contentDir,
    { recursive: true },
    (_event, filename) => {
      if (
        !filename ||
        ![".md", ".avif", ".gif", ".jpeg", ".jpg", ".png", ".webp"].includes(
          path.extname(filename).toLowerCase(),
        )
      )
        return;
      debouncedGenerate.trigger();
    },
  );

  const stop = () => {
    watcher.close();
    debouncedGenerate.close();
    process.exit(0);
  };
  process.once("SIGINT", stop);
  process.once("SIGTERM", stop);
}

if (require.main === module) startWatcher();

module.exports = { createDebouncedGenerator };
