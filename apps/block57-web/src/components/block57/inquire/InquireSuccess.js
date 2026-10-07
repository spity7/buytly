"use client";

import { Button, ButtonLink } from "@/components/block57/ui/Button";
import Eyebrow from "@/components/block57/ui/Eyebrow";
import { INQUIRE_FORM, INQUIRE_PAGE } from "@/content/block57/inquire";
import formStyles from "./InquireForm.module.scss";
import styles from "./InquireSuccess.module.scss";

/**
 * Replaces the form after a successful POST /contact: the verified thank-you
 * text (focused, so screen readers announce it), a link home and a way to
 * send another inquiry.
 */
export default function InquireSuccess({ headingRef, onReset }) {
  return (
    <div className={[formStyles.panel, styles.success].join(" ")}>
      <span className={styles.mark} aria-hidden="true" />
      <Eyebrow className={styles.eyebrow}>
        {INQUIRE_FORM.success.eyebrow}
      </Eyebrow>
      <h2 ref={headingRef} tabIndex={-1} className={styles.title}>
        {INQUIRE_PAGE.successMessage}
      </h2>
      <div className={styles.actions}>
        <ButtonLink href="/" arrow>
          {INQUIRE_FORM.success.home}
        </ButtonLink>
        <Button variant="text" onClick={onReset}>
          {INQUIRE_FORM.success.again}
        </Button>
      </div>
    </div>
  );
}
