/**
 * 410 Gone for the old block-57.com (WordPress) URLs that have no equivalent
 * in the rebuild (phase0/spec/redirects.json → status 410): theme-demo blog
 * posts, post category/tag/author archives, feeds, Elementor/Easto builder
 * templates and the WordPress endpoints. A 410 drops them from search indexes
 * faster than a 404. Redirects (301/302) live in next.config.js and run
 * before this file.
 *
 * Only the paths in `config.matcher` reach the proxy (Next 16 "proxy" file
 * convention, formerly middleware), so every request it sees gets the 410.
 * Page paths end with "/" (trailingSlash: true redirects "/feed" to "/feed/"
 * first); the .php endpoints keep their form.
 */

const GONE_PAGE = `<!doctype html>
<html lang="en">
<head>
<meta charset="utf-8">
<meta name="viewport" content="width=device-width, initial-scale=1">
<meta name="robots" content="noindex">
<title>Page removed – Block 57</title>
</head>
<body style="margin:0;min-height:100vh;display:grid;place-items:center;background:#f6f1ea;color:#96796e;font:300 18px/1.5556 'Helvetica Neue',Helvetica,Arial,sans-serif;text-align:center">
<main style="padding:30px 15px">
<h1 style="margin:0 0 12px;color:#346054;font:600 36px/1.067 'Helvetica Neue',Helvetica,Arial,sans-serif">Page removed</h1>
<p style="margin:0 0 30px">This page is no longer available.</p>
<p style="margin:0"><a href="/" style="color:#346054">Go to the Block 57 home page</a></p>
</main>
</body>
</html>
`;

export function proxy() {
  return new Response(GONE_PAGE, {
    status: 410,
    headers: {
      "Content-Type": "text/html; charset=utf-8",
      "Cache-Control": "public, max-age=3600",
      "X-Robots-Tag": "noindex",
    },
  });
}

export const config = {
  matcher: [
    // Theme-demo blog posts.
    "/tips-for-maintaining-and-increasing-the-value-of-a-single-property/",
    "/common-mistakes-to-avoid-when-investing-in-a-single-property/",
    "/financial-strategies-for-investing-in-single-properties/",
    "/single-property-vs-multi-property-a-comparative-analysis/",
    "/factors-to-consider-when-choosing-a-single-property/",
    "/how-to-maximize-profit-from-a-single-property/",
    "/first-time-guide-to-buying-a-single-property/",
    "/the-benefits-of-owning-a-single-property/",
    "/why-you-should-invest-in-a-single-property/",
    "/interior-insights-kate-marker-interiors/",
    // Post archives (any category / tag / author).
    "/category/:slug/",
    "/tag/:slug/",
    "/author/:slug/",
    // Builder template post types.
    "/elementor-hf/:slug/",
    "/easto-breadcrumb/:slug/",
    // Feeds: /feed/, /comments/feed/, /blog/feed/ and per-post feeds.
    "/feed/",
    "/:slug/feed/",
    // WordPress endpoints.
    "/wp-json/:path*",
    "/wp-login.php",
    "/xmlrpc.php",
  ],
};
