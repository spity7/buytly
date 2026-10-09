import PageHero from "@/components/block57/ui/PageHero";
import { ButtonLink } from "@/components/block57/ui/Button";
import { pageMetadata } from "@/lib/siteMetadata";
import { NOT_FOUND_TITLE } from "@/content/block57/site";
import styles from "./not-found.module.scss";

export const metadata = pageMetadata(NOT_FOUND_TITLE);

// Rendered inside the (site) layout's <main>. The global hero band keeps the
// transparent white header readable, as on every other page.
export default function SiteNotFound() {
  return (
    <>
      <PageHero variant="global" title={NOT_FOUND_TITLE} />
      <section className={styles.body} aria-label="What next">
        <p className={styles.text}>
          The page you are looking for doesn&rsquo;t exist or has moved.
        </p>
        <ButtonLink href="/">Back to home</ButtonLink>
      </section>
    </>
  );
}
