import { Fragment } from "react";
import Eyebrow from "@/components/block57/ui/Eyebrow";
import Reveal from "@/components/block57/ui/Reveal";
import styles from "./LifestyleText.module.scss";

/**
 * Eyebrow (heading-widget variant) + H2 of the Lifestyle sections: left
 * aligned, H2 520px wide, 30px above / 25px below at every width. The eyebrow
 * enters from the left over 1.25s; the heading over .75s from `effect`.
 *
 * @param {{ eyebrow: string, title: string, id: string,
 *   effect?: "left"|"right" }} props
 */
export function LifestyleHeading({ eyebrow, title, id, effect = "right" }) {
  return (
    <>
      <Reveal effect="right" fast={false} className={styles.eyebrowRow}>
        <Eyebrow variant="widget">{eyebrow}</Eyebrow>
      </Reveal>
      <Reveal effect={effect}>
        <h2 id={id} className={styles.title}>
          {title}
        </h2>
      </Reveal>
    </>
  );
}

/** The lines of one live paragraph, separated by its hard line breaks. */
export function Lines({ lines }) {
  return lines.map((line, index) => (
    <Fragment key={line}>
      {index > 0 ? <br /> : null}
      {line}
    </Fragment>
  ));
}
