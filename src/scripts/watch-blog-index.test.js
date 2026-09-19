const test = require("node:test");
const assert = require("node:assert/strict");
const { createDebouncedGenerator } = require("./watch-blog-index");

test("coalesces one edit burst into exactly one generation", async () => {
  let runs = 0;
  const watcher = createDebouncedGenerator(() => {
    runs += 1;
  }, 10);
  watcher.trigger();
  watcher.trigger();
  watcher.trigger();
  await new Promise((resolve) => setTimeout(resolve, 25));
  assert.equal(runs, 1);
  watcher.trigger();
  await new Promise((resolve) => setTimeout(resolve, 25));
  assert.equal(runs, 2);
  watcher.close();
});
