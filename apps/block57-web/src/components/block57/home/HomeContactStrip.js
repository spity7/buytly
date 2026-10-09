import Image from "next/image";
import Container from "@/components/block57/ui/Container";
import Reveal from "@/components/block57/ui/Reveal";
import { CallCallingIcon, SmsIcon } from "@/components/block57/ui/icons";
import { HOME_CONTACT_STRIP } from "@/content/block57/home";
import { getAsset } from "@/lib/block57/assets";
import styles from "./HomeContactStrip.module.scss";

function ContactItem({ href, label, icon }) {
  return (
    <a href={href} className={styles.item}>
      <span className={styles.icon} aria-hidden="true">
        {icon}
      </span>
      <span className={styles.label}>{label}</span>
    </a>
  );
}

/**
 * Contact strip on #F6F1EA with the faint line drawings: the H5-style intro,
 * then email (enters from the left) | phone (enters from the right) on either
 * side of a hairline, each behind a green icon circle; stacked and centred,
 * icon above the text, on phones. Plain text on live, mailto:/tel: links here.
 */
export default function HomeContactStrip({ content = HOME_CONTACT_STRIP }) {
  const background = getAsset(content.background);
  return (
    <section className={styles.strip} aria-labelledby="home-contact-title">
      <Image
        src={background.src}
        alt=""
        fill
        sizes="100vw"
        className={styles.background}
      />
      <Container className={styles.inner}>
        <Reveal className={styles.heading}>
          <h2 id="home-contact-title" className={styles.title}>
            {content.title}
          </h2>
        </Reveal>
        <div className={`${styles.column} ${styles.start}`}>
          <Reveal effect="right">
            <ContactItem
              href={content.email.href}
              label={content.email.label}
              icon={<SmsIcon size={24} />}
            />
          </Reveal>
        </div>
        <div className={`${styles.column} ${styles.end}`}>
          <Reveal effect="left">
            <ContactItem
              href={content.phone.href}
              label={content.phone.label}
              icon={<CallCallingIcon size={24} />}
            />
          </Reveal>
        </div>
      </Container>
    </section>
  );
}
