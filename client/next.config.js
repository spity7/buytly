const path = require('path');

/** @type {import('next').NextConfig} */
const nextConfig = {
  experimental: {
    turbopack: {
      root: __dirname,
    },
  },
  sassOptions: {
    includePaths: [path.join(__dirname, 'node_modules')],
    quietDeps: true, // This will silence deprecation warnings
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
