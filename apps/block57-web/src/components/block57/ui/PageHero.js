import Link from "next/link";
import HeaderOverlay from "@/components/block57/layout/HeaderOverlay";
import Container from "./Container";
import Eyebrow from "./Eyebrow";
import MediaFrame from "./MediaFrame";
import styles from "./PageHero.module.scss";

/**
 * Dark full-bleed opening hero for the inner pages (Apartments, residence
 * types, Lifestyle, Inquire). Renders <HeaderOverlay />, so the header sits
 * transparently on top, and reserves the header height. PROVISIONAL look until
 * Phase 0; `image` null renders the tonal MediaFrame placeholder.
 *
 * @param {{ titleId: string, title: React.ReactNode, eyebrow?: React.ReactNode,
 *   lead?: React.ReactNode, leadStyle?: "sans"|"serif",
 *   image?: string|null, imageAlt?: string,
 *   breadcrumbs?: { href?: string, label: string }[],
 *   facts?: React.ReactNode, actions?: React.ReactNode, notice?: React.ReactNode,
 *   sectionNav?: { href: string, label: string }[],
 *   size?: "default"|"compact"|"short" }} props
 *   size: "default" ≈ 88% of the viewport, "compact" ≈ 74%, "short" (forms) ≈ 52%.
 *   leadStyle "serif" sets the lead as an italic serif statement.
 */
export default function PageHero({
  titleId,
  title,
  eyebrow,
  lead,
  leadStyle = "sans",
  image = null,
  imageAlt = "",
  breadcrumbs,
  facts,
  actions,
  notice,
  sectionNav,
  size = "default",
}) {
  return (
    <section
      className={[styles.hero, styles[`size-${size}`]].join(" ")}
      data-b57-tone="dark"
      aria-labelledby={titleId}
    >
      <HeaderOverlay />
      <div className={styles.media}>
        <MediaFrame
          ratio="fill"
          tone="dark"
          src={image}
          alt={image ? imageAlt : ""}
          priority
        />
      </div>

      <Container className={styles.inner}>
        {notice ? <div className={styles.notice}>{notice}</div> : null}

        {breadcrumbs?.length ? (
          <nav aria-label="Breadcrumb" className={styles.breadcrumbs}>
            <ol>
              {breadcrumbs.map((crumb, index) => {
                const last = index === breadcrumbs.length - 1;
                return (
                  <li key={crumb.label}>
                    {crumb.href && !last ? (
                      <Link href={crumb.href}>{crumb.label}</Link>
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
        ) : null}

        {eyebrow ? (
          <Eyebrow rule className={styles.eyebrow}>
            {eyebrow}
          </Eyebrow>
        ) : null}
        <h1 id={titleId} className={styles.title}>
          {title}
        </h1>
        {lead ? (
          <p
            className={[
              styles.lead,
              leadStyle === "serif" ? styles.leadSerif : null,
            ]
              .filter(Boolean)
              .join(" ")}
          >
            {lead}
          </p>
        ) : null}
        {facts ? <div className={styles.facts}>{facts}</div> : null}
        {actions ? <div className={styles.actions}>{actions}</div> : null}

        {sectionNav?.length ? (
          <nav aria-label="On this page" className={styles.sectionNav}>
            <ul>
              {sectionNav.map((item) => (
                <li key={item.href}>
                  <a href={item.href}>{item.label}</a>
                </li>
              ))}
            </ul>
          </nav>
        ) : null}
      </Container>
    </section>
  );
}
