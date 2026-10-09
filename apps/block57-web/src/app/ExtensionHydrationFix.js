import Script from "next/script";

const EXTENSION_ATTRS = ["fdprocessedid", "cz-shortcut-listen"];

const stripExtensionAttributes = `
(function () {
  var attrs = ${JSON.stringify(EXTENSION_ATTRS)};

  function strip() {
    attrs.forEach(function (attr) {
      document.querySelectorAll("[" + attr + "]").forEach(function (el) {
        el.removeAttribute(attr);
      });
    });
  }

  strip();

  if (document.readyState === "loading") {
    document.addEventListener("DOMContentLoaded", function () {
      strip();
      requestAnimationFrame(strip);
    });
  } else {
    requestAnimationFrame(strip);
  }

  var observer = new MutationObserver(function () {
    strip();
  });

  observer.observe(document.documentElement, {
    attributes: true,
    subtree: true,
    attributeFilter: attrs,
  });

  window.setTimeout(function () {
    observer.disconnect();
  }, 5000);
})();
`;

export default function ExtensionHydrationFix() {
  return (
    <Script id="extension-hydration-fix" strategy="beforeInteractive">
      {stripExtensionAttributes}
    </Script>
  );
}
