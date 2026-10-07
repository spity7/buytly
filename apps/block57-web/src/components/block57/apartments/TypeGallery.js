"use client";

import { useMemo } from "react";
import Container from "@/components/block57/ui/Container";
import MediaFrame from "@/components/block57/ui/MediaFrame";
import Section from "@/components/block57/ui/Section";
import SectionHeading from "@/components/block57/ui/SectionHeading";
import { getUnitImages } from "@/lib/block57/units";
import { getUnitType } from "@/content/block57/unitTypes";
import { TYPE_PAGE_SECTIONS } from "@/content/block57/apartments";
import { mediaKey } from "./format";
import { useTypeUnits } from "@/lib/block57/useTypeUnits";
import styles from "./TypeGallery.module.scss";

const MIN_SLOTS = 3; // stable layout: empty slots keep the tonal placeholder
const MAX_LIVE_IMAGES = 9;
const TONES = ["stone", "sand", "stone", "sand"];

/**
 * Gallery for one residence type. Source, in order of preference:
 * 1. static images from unitTypes.js (`images`),
 * 2. the units' image media from the API (signed URLs, client-side only),
 * 3. tonal placeholders (until the real Block 57 imagery exists).
 */
export default function TypeGallery({ typeSlug }) {
  const type = getUnitType(typeSlug);
  const staticImages = useMemo(() => type?.images || [], [type]);
  const { units, isLoading } = useTypeUnits(typeSlug);

  const liveImages = useMemo(() => {
    if (staticImages.length) return [];
    const seen = new Set();
    const list = [];
    for (const unit of units) {
      for (const media of getUnitImages(unit)) {
        const key = mediaKey(media);
        if (seen.has(key)) continue;
        seen.add(key);
        list.push({
          key: media._id || key,
          src: media.url,
          alt: `${type?.label ?? "Residence"}, residence ${unit.title}`,
          caption: `Residence ${unit.title}`,
        });
      }
    }
    return list.slice(0, MAX_LIVE_IMAGES);
  }, [staticImages, units, type]);

  if (!type) return null;

  const images = staticImages.length
    ? staticImages.map((image, index) => ({
        key: image.src || `static-${index}`,
        src: image.src,
        alt: image.alt || type.label,
        caption: image.caption,
      }))
    : liveImages;

  const slotCount = Math.max(MIN_SLOTS, images.length);
  const slots = Array.from({ length: slotCount }, (_, index) => {
    const image = images[index];
    if (image) return image;
    return {
      key: `placeholder-${index}`,
      src: null,
      alt: "",
      caption: index === 0 ? type.label : null,
    };
  });

  return (
    <Section tone="alt" aria-labelledby="type-gallery-title">
      <Container>
        <SectionHeading
          eyebrow={TYPE_PAGE_SECTIONS.gallery.eyebrow}
          title={TYPE_PAGE_SECTIONS.gallery.title}
          id="type-gallery-title"
        />
        <ul
          className={styles.grid}
          aria-busy={!staticImages.length && isLoading ? "true" : undefined}
        >
          {slots.map((slot, index) => (
            <li
              key={slot.key}
              className={[styles.slot, index === 0 ? styles.feature : null]
                .filter(Boolean)
                .join(" ")}
            >
              <MediaFrame
                src={slot.src}
                alt={slot.alt}
                ratio="fill"
                tone={TONES[index % TONES.length]}
                caption={slot.caption}
                sizes={
                  index === 0
                    ? "(min-width: 1024px) 66vw, 100vw"
                    : "(min-width: 1024px) 33vw, 50vw"
                }
              />
            </li>
          ))}
        </ul>
      </Container>
    </Section>
  );
}
