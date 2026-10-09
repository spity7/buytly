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
 * Brochure file (Google Drive, OQ-03). Same value as BROCHURE_URL in
 * src/content/block57/site.js (the config cannot import app modules).
 */
const BROCHURE_URL =
  "https://drive.google.com/file/d/11R7LkmgJ7GNH0fyAm3Fb5UPl4mU_Jtw0/view";

/**
 * Old block-57.com (WordPress) URLs → rebuild pages, from
 * phase0/spec/redirects.json. With `trailingSlash: true` Next first 308s
 * "/about" to "/about/" and then matches sources strictly, so page sources end
 * with "/" (files such as /wp-sitemap.xml keep their form). Permanent (308).
 * The 410 rules (demo posts, archives, feeds, builder templates, WordPress
 * endpoints) are answered by src/proxy.js.
 */
const WORDPRESS_REDIRECTS = [
  // Residence category archives → the type pages (live WordPress slugs).
  {
    source: "/category-apartment/studio/",
    destination: "/apartments/executive-studio/",
  },
  {
    source: "/category-apartment/one-bedroom/",
    destination: "/apartments/1-bedroom/",
  },
  {
    source: "/category-apartment/two-bedroom/",
    destination: "/apartments/2-bedroom/",
  },
  {
    source: "/category-apartment/urban-villa/",
    destination: "/apartments/urban-villa/",
  },
  {
    source: "/category-apartment/townhouse/",
    destination: "/apartments/townhouse/",
  },
  {
    source: "/category-apartment/penthouse/",
    destination: "/apartments/penthouse/",
  },
  // Provisional app slugs (the API catalog values) and the WP category term.
  { source: "/apartments/one-bedroom/", destination: "/apartments/1-bedroom/" },
  { source: "/apartments/two-bedroom/", destination: "/apartments/2-bedroom/" },
  {
    source: "/apartments/studio/",
    destination: "/apartments/executive-studio/",
  },
  // WordPress home page slug, superseded home and theme-demo pages.
  { source: "/home-3/", destination: "/" },
  { source: "/home-1/", destination: "/" },
  { source: "/about/", destination: "/" },
  { source: "/blog/", destination: "/" },
  { source: "/availability/", destination: "/apartments/" },
  { source: "/availability-2/", destination: "/apartments/" },
  { source: "/residences/", destination: "/apartments/" },
  { source: "/neighborhood/", destination: "/life-style/" },
  // WordPress sitemaps (index + sub-sitemaps, listed in the live robots.txt).
  { source: "/wp-sitemap.xml", destination: "/sitemap.xml" },
  { source: "/:file(wp-sitemap-.+\\.xml)", destination: "/sitemap.xml" },
].map((redirect) => ({ ...redirect, permanent: true }));

/**
 * Old marketplace/template URLs → Block 57 pages. Temporary (307) until the
 * URL map is signed off.
 */
const LEGACY_REDIRECTS = [
  { source: "/listings/", destination: "/apartments/" },
  { source: "/listings/map/", destination: "/apartments/" },
  { source: "/projects/", destination: "/apartments/" },
  { source: "/project/:slug/", destination: "/apartments/" },
  { source: "/single-v1/:id/", destination: "/apartments/?unit=:id" },
  { source: "/agents/", destination: "/inquire/" },
  { source: "/agent-single/:id/", destination: "/inquire/" },
].map((redirect) => ({ ...redirect, permanent: false }));

/** @type {import('next').NextConfig} */
const nextConfig = {
  output: "standalone",
  // Matches the WordPress URLs of block-57.com ("/apartments/", "/inquire/").
  trailingSlash: true,
  async redirects() {
    return [
      ...WORDPRESS_REDIRECTS,
      // The live /brochure/ page is empty: send visitors to the file. 302
      // because the target is external and will change (self-hosted PDF).
      { source: "/brochure/", destination: BROCHURE_URL, statusCode: 302 },
      ...LEGACY_REDIRECTS,
    ];
  },
  // Block 57 media in public/: cached for a year (immutable), so give a
  // replaced file a new name.
  async headers() {
    return ["/images/block57/:path*", "/videos/:path*"].map((source) => ({
      source,
      headers: [
        {
          key: "Cache-Control",
          value: "public, max-age=31536000, immutable",
        },
      ],
    }));
  },
  ...(nextRoot !== appDir ? { outputFileTracingRoot: nextRoot } : {}),
  images: {
    formats: ["image/avif", "image/webp"],
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
