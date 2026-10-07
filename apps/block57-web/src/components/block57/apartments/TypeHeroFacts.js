import { formatTypeBlocks } from "@/content/block57/unitTypes";
import LiveAvailability from "@/components/block57/ui/LiveAvailability";
import styles from "./TypeHeroFacts.module.scss";

/** Key facts under the type hero: where it is, and live availability. */
export default function TypeHeroFacts({ type }) {
  return (
    <dl className={styles.facts}>
      <div className={styles.fact}>
        <dt>Location</dt>
        <dd>{formatTypeBlocks(type.blocks)}</dd>
      </div>
      <div className={styles.fact}>
        <dt>Availability</dt>
        <dd>
          <LiveAvailability type={type.slug} size="base" />
        </dd>
      </div>
    </dl>
  );
}
