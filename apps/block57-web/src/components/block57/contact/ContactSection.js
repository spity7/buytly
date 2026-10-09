import Container from "@/components/block57/ui/Container";
import Section from "@/components/block57/ui/Section";
import ContactDetails from "./ContactDetails";
import ContactForm from "./ContactForm";
import styles from "./ContactSection.module.scss";

/**
 * `contact.form` (DESIGN_SPEC §4.8.2): white band (150 → 100 → 80 → 60),
 * boxed 1320. Form column 66.67% (padding-right 140) + details column 29.5%;
 * 55/45 at 881–1024, 50/50 at 768–880; stacked on phones (form first).
 */
export default function ContactSection() {
  return (
    <Section as="div">
      <Container className={styles.inner}>
        <div className={styles.formColumn}>
          <ContactForm />
        </div>
        <ContactDetails className={styles.detailsColumn} />
      </Container>
    </Section>
  );
}
