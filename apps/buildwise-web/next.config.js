const path = require("path");
const fs = require("fs");

if (!process.env.NEXT_PUBLIC_API_URL) {
  throw new Error(
    "NEXT_PUBLIC_API_URL is required — set it in client/.env.local (see .env.example)",
  );
}

const demoHomeRedirects = [
  "home-v2",
  "home-v3",
  "home-v4",
  "home-v5",
  "home-v6",
  "home-v7",
  "home-v8",
  "home-v9",
  "home-v10",
].map((segment) => ({
  source: `/${segment}`,
  destination: "/",
  permanent: false,
}));

const listingDemoRedirects = [
  "grid-full-1-col-v1",
  "grid-full-1-col-v2",
  "grid-full-2-col",
  "grid-full-3-col",
  "grid-full-4-col",
  "banner-search-v1",
  "banner-search-v2",
  "map-v1",
  "map-v2",
  "map-v3",
  "map-v4",
  "header-map-style",
  "list-v1",
  "list-all-style",
  "compare",
  "blog-list-v1",
  "blog-list-v2",
  "blog-list-v3",
].map((segment) => ({
  source: `/${segment}`,
  destination: "/listings",
  permanent: false,
}));

const singleStyleRedirects = [2, 3, 4, 5, 6, 7, 8, 9, 10].map((version) => ({
  source: `/single-v${version}/:id`,
  destination: "/single-v1/:id",
  permanent: false,
}));

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

/** @type {import('next').NextConfig} */
const nextConfig = {
  output: "standalone",
  ...(nextRoot !== appDir ? { outputFileTracingRoot: nextRoot } : {}),
  async redirects() {
    return [
      {
        source: "/grid-default",
        destination: "/listings",
        permanent: false,
      },
      ...demoHomeRedirects,
      ...listingDemoRedirects,
      ...singleStyleRedirects,
      {
        source: "/blogs/:id",
        destination: "/listings",
        permanent: false,
      },
      {
        source: "/agency",
        destination: "/agents",
        permanent: false,
      },
      {
        source: "/agency-single/:id",
        destination: "/agents",
        permanent: false,
      },
    ];
  },
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
