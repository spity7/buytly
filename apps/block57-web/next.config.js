const path = require("path");
const fs = require("fs");

if (!process.env.NEXT_PUBLIC_API_URL) {
  throw new Error(
    "NEXT_PUBLIC_API_URL is required — set it in apps/block57-web/.env.local (see .env.example)",
  );
}

const appDir = __dirname;

function resolveNextRoot(startDir) {
  let dir = startDir;
  for (;;) {
    if (fs.existsSync(path.join(dir, "node_modules", "next", "package.json"))) {
      return dir;
    }
    const parent = path.dirname(dir);
    if (parent === dir) return startDir;
    dir = parent;
  }
}

const nextRoot = resolveNextRoot(appDir);

function collectSassIncludePaths() {
  const paths = [];
  for (const base of [appDir, nextRoot]) {
    const nodeModules = path.join(base, "node_modules");
    if (!fs.existsSync(nodeModules)) continue;
    paths.push(nodeModules);
    const bootstrapScss = path.join(nodeModules, "bootstrap", "scss");
    if (fs.existsSync(bootstrapScss)) paths.push(bootstrapScss);
  }
  return paths.filter((p, i, arr) => arr.indexOf(p) === i);
}

const sassIncludePaths = collectSassIncludePaths();

/**
 * Old marketplace/template URLs → Block 57 pages. With `trailingSlash: true`
 * Next adds the slash first (308) and then matches sources strictly, so every
 * source must end with "/". Temporary (307) until the URL map is final.
 */
const LEGACY_REDIRECTS = [
  { source: "/listings/", destination: "/apartments/" },
  { source: "/listings/map/", destination: "/apartments/" },
  { source: "/projects/", destination: "/apartments/" },
  { source: "/project/:slug/", destination: "/apartments/" },
  { source: "/single-v1/:id/", destination: "/apartments/?unit=:id" },
  { source: "/agents/", destination: "/inquire/" },
  { source: "/agent-single/:id/", destination: "/inquire/" },
  { source: "/contact/", destination: "/inquire/" },
];

/** @type {import('next').NextConfig} */
const nextConfig = {
  output: "standalone",
  // Matches the WordPress URLs of block-57.com ("/apartments/", "/inquire/").
  trailingSlash: true,
  async redirects() {
    return LEGACY_REDIRECTS.map((redirect) => ({
      ...redirect,
      permanent: false,
    }));
  },
  ...(nextRoot !== appDir ? { outputFileTracingRoot: nextRoot } : {}),
  images: {
    remotePatterns: [
      {
        protocol: "https",
        hostname: "storage.googleapis.com",
        pathname: "/**",
      },
    ],
  },
  turbopack: {
    root: nextRoot,
  },
  sassOptions: {
    includePaths: sassIncludePaths,
    quietDeps: true,
    silenceDeprecations: [
      "legacy-js-api",
      "import",
      "slash-div",
      "global-builtin",
      "color-functions",
      "if-function",
    ],
  },
};

module.exports = nextConfig;
