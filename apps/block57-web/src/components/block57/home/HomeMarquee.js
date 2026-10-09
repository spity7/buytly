import { HOME_MARQUEE } from "@/content/block57/home";
import { getAsset } from "@/lib/block57/assets";
import MarqueeTicker from "./MarqueeTicker";

/** Live home image ticker: 13 renders in live order, each opening the lightbox. */
export default function HomeMarquee({ content = HOME_MARQUEE }) {
  const slides = content.slides.map(({ id, alt }) => ({
    ...getAsset(id),
    alt,
  }));
  return <MarqueeTicker label={content.label} slides={slides} />;
}
