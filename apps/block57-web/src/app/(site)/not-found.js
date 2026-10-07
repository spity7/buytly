import Container from "@/components/block57/ui/Container";
import { ButtonLink } from "@/components/block57/ui/Button";
import { pageMetadata } from "@/lib/siteMetadata";
import styles from "./not-found.module.scss";

export const metadata = pageMetadata("Page Not Found");

// Rendered inside the (site) layout's <main>, so the wrapper is a <div>.
export default function SiteNotFound() {
  return (
    <Container className={styles.page}>
      <p className={styles.code} aria-hidden="true">
        404
      </p>
      <h1 className={styles.title}>Page not found</h1>
      <p className={styles.lead}>
        The page you&apos;re looking for doesn&apos;t exist or has moved.
      </p>
      <div className={styles.actions}>
        <ButtonLink href="/">Back to home</ButtonLink>
        <ButtonLink href="/apartments/" variant="text">
          View the residences
        </ButtonLink>
      </div>
    </Container>
  );
}
