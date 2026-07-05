const path = require("path");

if (!process.env.NEXT_PUBLIC_API_URL) {
  throw new Error(
    "NEXT_PUBLIC_API_URL is required — set it in client/.env.local (see .env.example)",
  );
}

/** @type {import('next').NextConfig} */
const nextConfig = {
  turbopack: {
    root: __dirname,
  },
  sassOptions: {
    includePaths: [path.join(__dirname, "node_modules")],
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
