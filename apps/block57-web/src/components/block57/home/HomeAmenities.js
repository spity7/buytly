import Container from "@/components/block57/ui/Container";
import Section from "@/components/block57/ui/Section";
import MediaFrame from "@/components/block57/ui/MediaFrame";
import Reveal from "@/components/block57/ui/Reveal";
import { HOME_AMENITIES } from "@/content/block57/home";
import { AMENITIES_PAGE, getAmenity } from "@/content/block57/amenities";
import { indexLabel, leadingSentences } from "@/lib/block57/format";
import HeadingRow from "./HeadingRow";
import styles from "./HomeAmenities.module.scss";

/** Four amenity highlights (verified copy, opening sentences) + link to /amenities/. */
export default function HomeAmenities({ content = HOME_AMENITIES }) {
  const highlights = content.highlights.map(getAmenity).filter(Boolean);

  return (
    <Section tone="alt" aria-labelledby="home-amenities-title">
      <Container>
        <Reveal>
          <HeadingRow
            eyebrow={content.eyebrow}
            title={content.title}
            lead={AMENITIES_PAGE.intro?.[0]}
            id="home-amenities-title"
            link={content.cta}
          />
        </Reveal>

        <ul className={styles.grid}>
          {highlights.map((amenity, index) => (
            <Reveal
              as="li"
              key={amenity.slug}
              delay={index * 90}
              className={styles.item}
            >
              <div className={styles.media}>
                <MediaFrame
                  ratio="fill"
                  tone={index % 2 ? "sand" : "stone"}
                  src={amenity.image?.src}
                  alt={amenity.image?.alt}
                  caption={<span aria-hidden="true">{indexLabel(index)}</span>}
                  sizes="(min-width: 1024px) 300px, (min-width: 576px) 50vw, 100vw"
                />
              </div>
              <h3 className={styles.title}>{amenity.title}</h3>
              <p className={styles.copy}>{leadingSentences(amenity.copy)}</p>
            </Reveal>
          ))}
        </ul>
      </Container>
    </Section>
  );
}
