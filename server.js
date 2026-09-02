// server.js — Production entry point for cPanel / LiteSpeed / Phusion Passenger
const path = require("path");
const fs = require("fs");

// 1. Force directory context to application root
process.chdir(__dirname);
process.env.PWD = __dirname;
process.env.NODE_ENV = "production";

// 2. Load environment variables (.env.local, .env)
try {
  const dotenv = require("dotenv");
  dotenv.config({ path: path.join(__dirname, ".env.local") });
  dotenv.config({ path: path.join(__dirname, ".env") });
} catch (_) {}

process.env.NEXT_PUBLIC_META_PIXEL_ID =
  process.env.NEXT_PUBLIC_META_PIXEL_ID || "3244071132470552";

// 3. Add local node_modules to module search paths
const appNodeModules = path.join(__dirname, "node_modules");
module.paths.unshift(appNodeModules);
process.env.NODE_PATH = [appNodeModules, process.env.NODE_PATH || ""].filter(Boolean).join(":");
require("module").Module._initPaths();


// 3. Auto-heal all directory and file permissions recursively
function fixPermissions(targetDir) {
  try {
    fs.chmodSync(targetDir, 0o777);
  } catch (_) {}
  try {
    const entries = fs.readdirSync(targetDir, { withFileTypes: true });
    for (const entry of entries) {
      const fullPath = path.join(targetDir, entry.name);
      try {
        fs.chmodSync(fullPath, entry.isDirectory() ? 0o777 : 0o666);
      } catch (_) {}
      if (entry.isDirectory() && entry.name !== "node_modules") {
        fixPermissions(fullPath);
      }
    }
  } catch (_) {}
}

try {
  fixPermissions(__dirname);
} catch (_) {}

// 4. Require Next.js and start server
const { createServer } = require("http");
const { parse } = require("url");
const next = require("next");

const dev = false;
const dir = path.resolve(__dirname);
const hostname = "0.0.0.0";
const port = process.env.PORT || 3000;

const app = next({ dev, dir, hostname, port });
const handle = app.getRequestHandler();

app
  .prepare()
  .then(() => {
    createServer((req, res) => {
      const parsedUrl = parse(req.url, true);
      handle(req, res, parsedUrl);
    }).listen(port, (err) => {
      if (err) throw err;
      console.log(`> Talal Wooden Lamps live on port ${port}`);
    });
  })
  .catch((err) => {
    console.error("Failed to start server:", err);
    process.exit(1);
  });






