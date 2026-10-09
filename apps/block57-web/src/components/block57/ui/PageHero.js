import Image from "next/image";
import Link from "next/link";
import { getAsset } from "@/lib/block57/assets";
import styles from "./PageHero.module.scss";

/** Live hero photo per variant when the page does not pass one. */
const DEFAULT_IMAGES = {
  global: "img-011", // Rooftop Lounge (template 727)
  archive: "img-004", // kitchen shelves (apartments archive)
  type: "img-011",
};

/**
 * `sizes` per variant: "global" and "archive" show the photo at its natural
 * size from 768px (cover on phones), "type" covers the band at every width.
 */
function sizesFor(variant, image) {
  if (variant === "type") return "100vw";
  const phone = variant === "archive" ? "145vw" : "115vw";
  return `(max-width: 767px) ${phone}, ${image.width}px`;
}

/**
 * Inner-page hero band (live breadcrumb band): dark photo, centred white H1,
 * and a 68px strip at the bottom with a 1px rgba(255,255,255,.2) rule and the
 * `Home > …` breadcrumb. The transparent header overlays its top.
 *
 * variant (DESIGN_SPEC §3.6):
 * - "global" (Lifestyle, Amenities, Gallery, Inquire, Contact, 404): Rooftop
 *   Lounge at natural size, centred, 70% black; 1440×487 / 390×296
 * - "archive" (Apartments): kitchen photo at natural size from the top-left,
 *   69% black; 1440×489 / 390×226
 * - "type" (apartment types): the type's image as cover, 40% black;
 *   1440×487 / 390×226
 * `image`: an asset from `getAsset()` (src, width, height); defaults per
 *   variant. It is a decorative background (empty alt).
 * `titleId`: id of the H1 (the page's only one).
 * `breadcrumbs`: the trail after "Home" (added automatically); items with an
 *   `href` are links, the last item is the current page. Defaults to
 *   `[{ label: title }]`.
 *
 * @param {{ variant?: "global"|"archive"|"type", title: string,
 *   titleId?: string, image?: import("@/lib/block57/assets").Block57Asset,
 *   breadcrumbs?: { href?: string, label: string }[] }} props
 */
export default function PageHero({
  variant = "global",
  title,
  titleId = "page-title",
  image,
  breadcrumbs,
}) {
  const photo = image?.src ? image : getAsset(DEFAULT_IMAGES[variant]);
  const trail = [
    { href: "/", label: "Home" },
    ...(breadcrumbs?.length ? breadcrumbs : [{ label: title }]),
  ];

  // A <header> inside <main> is the page's own header, not a landmark (a
  // labelled <section> would duplicate the region named by the page's first
  // H2 on Lifestyle and Penthouse).
  return (
    <header
      className={[styles.hero, styles[variant]].filter(Boolean).join(" ")}
      data-b57-tone="dark"
    >
      <div className={styles.media} style={{ backgroundColor: photo.color }}>
        <Image
          src={photo.src}
          alt=""
          width={photo.width}
          height={photo.height}
          sizes={sizesFor(variant, photo)}
          priority
          className={styles.image}
          style={{
            "--_w": `${photo.width}px`,
            "--_h": `${photo.height}px`,
          }}
        />
      </div>

      <div className={styles.titleArea}>
        <h1 id={titleId} className={styles.title}>
          {title}
        </h1>
      </div>

      <nav aria-label="Breadcrumb" className={styles.breadcrumb}>
        <ol>
          {trail.map((crumb, index) => {
            const last = index === trail.length - 1;
            return (
              <li key={`${crumb.label}-${index}`}>
                {crumb.href && !last ? (
                  <Link href={crumb.href} className={styles.crumbLink}>
                    {crumb.label}
                  </Link>
                ) : (
                  <span aria-current={last ? "page" : undefined}>
                    {crumb.label}
                  </span>
                )}
              </li>
            );
          })}
        </ol>
      </nav>
    </header>
  );
}
