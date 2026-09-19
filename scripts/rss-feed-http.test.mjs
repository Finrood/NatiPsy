import assert from "node:assert/strict";
import { access } from "node:fs/promises";
import { join, resolve } from "node:path";

const root = process.cwd();
const browserRoot = resolve(root, "dist/nati-psy/browser");
const serverEntry = resolve(root, "dist/nati-psy/server/server.mjs");
const port = 4317;

const exists = async (path) => {
  try {
    await access(path);
    return true;
  } catch {
    return false;
  }
};

const waitForFeed = async (url, timeoutMs = 15000) => {
  const deadline = Date.now() + timeoutMs;
  while (Date.now() < deadline) {
    try {
      const response = await fetch(url);
      if (response.status === 200) return response;
    } catch {
      // The child server may still be compiling/starting.
    }
    await new Promise((resolvePromise) => setTimeout(resolvePromise, 100));
  }
  throw new Error(`Timed out waiting for ${url}`);
};

const assertFeedResponse = async (response, label) => {
  assert.equal(response.status, 200, `${label} feed should return HTTP 200`);
  assert.match(
    response.headers.get("content-type") ?? "",
    /^application\/rss\+xml/i,
  );
  assert.equal(
    response.headers.get("cache-control"),
    "public, max-age=300, must-revalidate",
    `${label} feed must use the short revalidating cache policy`,
  );
  assert.match(
    await response.text(),
    /^<\?xml version="1\.0" encoding="UTF-8"\?>/,
  );
};

assert.equal(
  await exists(serverEntry),
  true,
  "build the SSR server before the HTTP contract",
);
const { default: expressApp } = await import(serverEntry);
const expressServer = expressApp.listen(port, "127.0.0.1");
try {
  await assertFeedResponse(
    await waitForFeed(`http://127.0.0.1:${port}/feed.xml`),
    "Express",
  );
} finally {
  await new Promise((resolvePromise, reject) =>
    expressServer.close((error) => (error ? reject(error) : resolvePromise())),
  );
}

if (process.env.RUN_NGINX_HTTP_TESTS === "1") {
  const nginxPort = 4318;
  const nginx = (await import("node:child_process")).spawn(
    "docker", [
      "run",
      "--rm",
      "-p",
      `${nginxPort}:80`,
      "-v",
      `${join(browserRoot)}:/usr/share/nginx/html:ro`,
      "-v",
      `${resolve(root, "nginx.conf")}:/etc/nginx/conf.d/default.conf:ro`,
      "-v",
      `${resolve(root, "nginx-security-headers.conf")}:/etc/nginx/security-headers.conf:ro`,
      "nginx:alpine",
    ],
    { cwd: root, stdio: "ignore" },
  );
  try {
    await assertFeedResponse(
      await waitForFeed(`http://127.0.0.1:${nginxPort}/feed.xml`),
      "Nginx",
    );
  } finally {
    nginx.kill("SIGTERM");
    await new Promise((resolvePromise) => setTimeout(resolvePromise, 100));
  }
} else {
  console.log(
    "Nginx live HTTP contract skipped; set RUN_NGINX_HTTP_TESTS=1 in CI.",
  );
}

console.log("RSS HTTP contract passed.");
