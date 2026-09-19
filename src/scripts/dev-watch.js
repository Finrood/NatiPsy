const path = require("path");
const { spawn } = require("child_process");

const projectRoot = path.join(__dirname, "../..");
const angularCli = path.join(
  projectRoot,
  "node_modules/@angular/cli/bin/ng.js",
);
const watchScript = path.join(__dirname, "watch-blog-index.js");
const serve = process.argv.includes("--serve");
const children = [
  spawn(process.execPath, [watchScript], { stdio: "inherit" }),
  spawn(
    process.execPath,
    [
      angularCli,
      ...(serve
        ? ["serve"]
        : ["build", "--watch", "--configuration", "development"]),
    ],
    { stdio: "inherit" },
  ),
];

function shutdown(code = 0) {
  for (const child of children) {
    if (!child.killed) child.kill("SIGTERM");
  }
  process.exitCode = code;
}

for (const child of children) {
  child.on("exit", (code, signal) => {
    if (signal !== "SIGTERM" && code !== 0) shutdown(code || 1);
  });
}

process.on("SIGINT", () => shutdown());
process.on("SIGTERM", () => shutdown());
