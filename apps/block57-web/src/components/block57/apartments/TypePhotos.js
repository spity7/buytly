import Container from "@/components/block57/ui/Container";
import ImageTile from "@/components/block57/ui/ImageTile";
import LightboxGallery from "@/components/block57/ui/LightboxGallery";
import Section from "@/components/block57/ui/Section";
import SectionHeading from "@/components/block57/ui/SectionHeading";
import { getAsset } from "@/lib/block57/assets";
import { TYPE_PAGE_COPY } from "@/content/block57/apartments";
import styles from "./TypePhotos.module.scss";

const GAP = 8;

/** Image sizes for an N-column grid in the 1320px container (8px gaps). */
function photoSizes(columns) {
  const gaps = (columns - 1) * GAP;
  return [
    `(max-width: 767px) calc((100vw - ${30 + gaps}px) / ${columns})`,
    `(max-width: 1380px) calc((100vw - ${60 + gaps}px) / ${columns})`,
    `${Math.round((1320 - gaps) / columns)}px`,
  ].join(", ");
}

/**
 * "Apartment photos": the type's live photo grid (2 or 3 columns at every
 * width, 8px gaps). Each photo keeps its own ratio, so a row is as tall as
 * its tallest photo and landscape shots leave white space under them (the
 * live, ragged look). One lightbox slideshow, in grid order.
 * The heading is an <h2> with the live H3 styling.
 */
export default function TypePhotos({ type }) {
  const titleId = "type-photos-title";
  const count = type.photos.length;
  const sizes = photoSizes(type.photoColumns);

  return (
    <Section spacing="none" className={styles.photos} aria-labelledby={titleId}>
      <Container>
        <SectionHeading
          as="h2"
          size="subsection"
          title={TYPE_PAGE_COPY.photos.title}
          id={titleId}
          className={styles.heading}
        />
        <LightboxGallery>
          <ul
            className={styles.grid}
            style={{ "--_columns": type.photoColumns }}
          >
            {type.photos.map((id, index) => {
              const asset = getAsset(id);
              return (
                <li key={`${id}-${index}`}>
                  <ImageTile
                    image={{
                      ...asset,
                      alt: `${asset.alt} (${index + 1} of ${count})`,
                    }}
                    sizes={sizes}
                  />
                </li>
              );
            })}
          </ul>
        </LightboxGallery>
      </Container>
    </Section>
  );
}
