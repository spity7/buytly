import Container from "./Container";
import Eyebrow from "./Eyebrow";
import Reveal from "./Reveal";
import Section from "./Section";
import { ButtonLink } from "./Button";
import { MailIcon, PhoneIcon } from "./icons";
import { CONTACT } from "@/content/block57/site";
import styles from "./CtaBand.module.scss";

/**
 * Closing call-to-action band used at the foot of the inner pages: eyebrow,
 * heading, a line of text, the Inquire button, an optional secondary text
 * link and the sales phone / email. Defaults to tone "alt" so it never merges
 * with the dark footer below it.
 *
 * @param {{ id: string, eyebrow?: string, title: React.ReactNode,
 *   text?: React.ReactNode, primary: { href: string, label: string },
 *   secondary?: { href: string, label: string },
 *   tone?: "default"|"alt"|"surface", showContact?: boolean }} props
 */
export default function CtaBand({
  id,
  eyebrow,
  title,
  text,
  primary,
  secondary,
  tone = "alt",
  showContact = true,
}) {
  const titleId = `${id}-title`;

  return (
    <Section tone={tone} id={id} aria-labelledby={titleId}>
      <Container>
        <Reveal className={styles.grid}>
          <div>
            {eyebrow ? <Eyebrow rule>{eyebrow}</Eyebrow> : null}
            <h2 id={titleId} className={styles.title}>
              {title}
            </h2>
            {text ? <p className={styles.text}>{text}</p> : null}
          </div>

          <div className={styles.side}>
            <div className={styles.actions}>
              <ButtonLink href={primary.href} arrow>
                {primary.label}
              </ButtonLink>
              {secondary ? (
                <ButtonLink href={secondary.href} variant="text">
                  {secondary.label}
                </ButtonLink>
              ) : null}
            </div>

            {showContact ? (
              <ul className={styles.contact}>
                <li>
                  <a href={CONTACT.phoneHref}>
                    <PhoneIcon size={18} />
                    <span>{CONTACT.phoneDisplay}</span>
                  </a>
                </li>
                <li>
                  <a href={CONTACT.emailHref}>
                    <MailIcon size={18} />
                    <span>{CONTACT.email}</span>
                  </a>
                </li>
              </ul>
            ) : null}
          </div>
        </Reveal>
      </Container>
    </Section>
  );
}
