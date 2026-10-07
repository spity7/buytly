/**
 * Put `<HeaderOverlay />` anywhere in a page whose first section is a dark,
 * full-bleed hero: the header then sits transparently over the hero (white
 * logo and links) and turns solid once the visitor scrolls.
 *
 * It is a server-rendered marker read by CSS (`html:has([data-b57-header-overlay])`
 * in Header.module.scss), so the right header is in the first paint, with no
 * flash and no layout shift. Pages without it get the default solid header.
 * The hero should reserve the header height at its top: `var(--b57-header-h)`.
 */
export default function HeaderOverlay() {
  return <span data-b57-header-overlay="" hidden />;
}
