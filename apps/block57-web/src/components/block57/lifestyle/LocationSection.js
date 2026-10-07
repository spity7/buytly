import Container from "@/components/block57/ui/Container";
import Eyebrow from "@/components/block57/ui/Eyebrow";
import Reveal from "@/components/block57/ui/Reveal";
import Section from "@/components/block57/ui/Section";
import { PinIcon } from "@/components/block57/ui/icons";
import { LIFESTYLE_LOCATION } from "@/content/block57/lifestyle";
import LocationMap, { MapLink } from "./LocationMap";
import styles from "./LocationSection.module.scss";

/** Address, "Open in Google Maps" and the lazy keyless map embed. */
export default function LocationSection({ content = LIFESTYLE_LOCATION }) {
  const titleId = `${content.id}-title`;

  return (
    <Section id={content.id} aria-labelledby={titleId}>
      <Container>
        <div className={styles.grid}>
          <Reveal className={styles.details}>
            <Eyebrow rule>{content.eyebrow}</Eyebrow>
            <h2 id={titleId} className={styles.title}>
              {content.title}
            </h2>

            <div className={styles.address}>
              <span className={styles.icon}>
                <PinIcon size={18} />
              </span>
              <p className={styles.label}>{content.addressLabel}</p>
              <address className={styles.lines}>
                {content.addressLines.map((line, index) => (
                  <span key={line}>
                    {line}
                    {index < content.addressLines.length - 1 ? <br /> : null}
                  </span>
                ))}
              </address>
            </div>

            <MapLink className={styles.mapLink} />
          </Reveal>

          <Reveal className={styles.map} delay={120}>
            <LocationMap />
          </Reveal>
        </div>
      </Container>
    </Section>
  );
}
