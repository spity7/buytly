import Container from "@/components/block57/ui/Container";
import Section from "@/components/block57/ui/Section";
import SectionHeading from "@/components/block57/ui/SectionHeading";
import Reveal from "@/components/block57/ui/Reveal";
import { ButtonLink } from "@/components/block57/ui/Button";
import { MailIcon, PhoneIcon, PinIcon } from "@/components/block57/ui/icons";
import { HOME_INQUIRE } from "@/content/block57/home";
import { ADDRESS, CONTACT } from "@/content/block57/site";
import styles from "./HomeInquire.module.scss";

/** Closing call to action: Inquire button plus the sales contact details. */
export default function HomeInquire({ content = HOME_INQUIRE }) {
  const rows = [
    {
      key: "phone",
      label: content.labels.phone,
      icon: <PhoneIcon size={18} />,
      value: CONTACT.phoneDisplay,
      href: CONTACT.phoneHref,
    },
    {
      key: "email",
      label: content.labels.email,
      icon: <MailIcon size={18} />,
      value: CONTACT.email,
      href: CONTACT.emailHref,
    },
    {
      key: "visit",
      label: content.labels.visit,
      icon: <PinIcon size={18} />,
      value: (
        <>
          {ADDRESS.street}
          <br />
          {ADDRESS.locality}
        </>
      ),
    },
  ];

  return (
    <Section tone="alt" aria-labelledby="home-inquire-title">
      <Container>
        <div className={styles.grid}>
          <Reveal className={styles.intro}>
            <SectionHeading
              eyebrow={content.eyebrow}
              title={content.title}
              lead={content.lead}
              id="home-inquire-title"
              size="large"
              className={styles.heading}
            />
            <ButtonLink href={content.cta.href} arrow>
              {content.cta.label}
            </ButtonLink>
          </Reveal>

          <Reveal delay={120}>
            <address className={styles.contact}>
              <ul className={styles.list}>
                {rows.map((row) => (
                  <li key={row.key} className={styles.row}>
                    <span className={styles.icon}>{row.icon}</span>
                    <span className={styles.label}>{row.label}</span>
                    {row.href ? (
                      <a href={row.href} className={styles.value}>
                        {row.value}
                      </a>
                    ) : (
                      <span className={styles.value}>{row.value}</span>
                    )}
                  </li>
                ))}
              </ul>
            </address>
          </Reveal>
        </div>
      </Container>
    </Section>
  );
}
