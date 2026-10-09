"use client";

import {
  FormAlert,
  FormSuccess,
  Honeypot,
  SubmitButton,
  TextAreaField,
  TextField,
} from "@/components/block57/forms/fields";
import {
  CONTACT_TOPICS,
  buildContactPayload,
} from "@/components/block57/forms/payload";
import useContactForm from "@/components/block57/forms/useContactForm";
import { CONTACT_LIMITS } from "@/components/block57/forms/validation";
import { CONTACT_FORM, CONTACT_PAGE_PATH } from "@/content/block57/contact";
import styles from "./ContactForm.module.scss";

const COPY = CONTACT_FORM;
const TITLE_ID = "contact-form-title";

/** Live CF7 form 10: no name field (the API accepts nameless messages). */
const RULES = {
  phone: { required: true, type: "tel" },
  email: { required: true, type: "email", max: CONTACT_LIMITS.email },
  message: { max: CONTACT_LIMITS.message },
};

const INITIAL_VALUES = { phone: "", email: "", message: "" };

function buildPayload(values) {
  return buildContactPayload({
    topic: CONTACT_TOPICS.contact,
    pagePath: CONTACT_PAGE_PATH,
    website: values.website,
    fields: {
      phone: values.phone,
      email: values.email,
      message: values.message,
    },
  });
}

/**
 * "Drop us a line" (DESIGN_SPEC §4.8.2): H3-sized heading, the live
 * boilerplate line, Phone*, Email*, Message and SUBMIT (left; centred on
 * phones). Posts `topic: "contact"` to POST /contact; the CF7 thank-you text
 * replaces the line and the form on success.
 */
export default function ContactForm() {
  const form = useContactForm({
    rules: RULES,
    initialValues: INITIAL_VALUES,
    buildPayload,
  });

  return (
    <div className={styles.root}>
      <h2 id={TITLE_ID} className={styles.title}>
        {COPY.title}
      </h2>

      {form.status === "success" ? (
        <FormSuccess
          as="p"
          headingRef={form.successRef}
          actionLabel={COPY.again}
          onReset={form.reset}
        />
      ) : (
        <>
          <p className={styles.note}>{COPY.note}</p>
          <form {...form.formProps} aria-labelledby={TITLE_ID}>
            <TextField
              id="contact-phone"
              type="tel"
              label={COPY.labels.phone}
              placeholder={COPY.placeholders.phone}
              required
              inputMode="tel"
              autoComplete="tel"
              maxLength={CONTACT_LIMITS.phone}
              {...form.fieldProps("phone")}
            />
            <TextField
              id="contact-email"
              type="email"
              label={COPY.labels.email}
              placeholder={COPY.placeholders.email}
              required
              inputMode="email"
              autoComplete="email"
              autoCapitalize="none"
              spellCheck={false}
              maxLength={CONTACT_LIMITS.email}
              {...form.fieldProps("email")}
            />
            <TextAreaField
              id="contact-message"
              label={COPY.labels.message}
              placeholder={COPY.placeholders.message}
              maxLength={CONTACT_LIMITS.message}
              {...form.fieldProps("message")}
            />

            <Honeypot id="contact-website" {...form.honeypotProps} />
            <FormAlert ref={form.alertRef} message={form.formError} />

            <div className={styles.actions}>
              <SubmitButton pending={form.pending}>{COPY.submit}</SubmitButton>
            </div>
          </form>
        </>
      )}
    </div>
  );
}
