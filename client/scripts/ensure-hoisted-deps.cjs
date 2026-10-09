const fs = require("fs");
const path = require("path");

/** Packages Sass/webpack must resolve from the app directory (Docker) or via symlink (hoisted monorepo). */
const HOISTED_PACKAGES = ["bootstrap"];

function ensureHoistedDeps(appDir) {
  const localNm = path.join(appDir, "node_modules");

  for (const pkg of HOISTED_PACKAGES) {
    const target = path.join(localNm, pkg);
    if (fs.existsSync(target)) continue;

    let dir = appDir;
    let source = null;
    for (;;) {
      const parent = path.dirname(dir);
      if (parent === dir) break;
      const candidate = path.join(parent, "node_modules", pkg);
      if (fs.existsSync(candidate)) {
        source = candidate;
        break;
      }
      dir = parent;
    }
    if (!source) continue;

    fs.mkdirSync(localNm, { recursive: true });
    const linkType = process.platform === "win32" ? "junction" : "dir";
    fs.symlinkSync(source, target, linkType);
  }
}

if (require.main === module) {
  const appDir = path.join(__dirname, "..");
  ensureHoistedDeps(appDir);
}

module.exports = { ensureHoistedDeps };
