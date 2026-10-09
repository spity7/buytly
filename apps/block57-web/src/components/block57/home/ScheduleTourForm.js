"use client";

import {
  FormAlert,
  FormSuccess,
  Honeypot,
  SelectField,
  SubmitButton,
  TextAreaField,
  TextField,
} from "@/components/block57/forms/fields";
import {
  CONTACT_TOPICS,
  buildContactPayload,
} from "@/components/block57/forms/payload";
import useContactForm from "@/components/block57/forms/useContactForm";
import {
  CONTACT_LIMITS,
  todayIsoDate,
} from "@/components/block57/forms/validation";
import { SCHEDULE_TOUR } from "@/content/block57/home";
import styles from "./ScheduleTourPopup.module.scss";

const COPY = SCHEDULE_TOUR;
const SLOTS = COPY.timeSlots;
const SLOT_OPTIONS = SLOTS.map((slot) => ({ value: slot, label: slot }));

/** Live CF7 form 3240: every field required except the message. */
const RULES = {
  fullName: { required: true, max: CONTACT_LIMITS.fullName },
  email: { required: true, type: "email", max: CONTACT_LIMITS.email },
  phone: { required: true, type: "tel" },
  preferredDate: { required: true, type: "date" },
  preferredTime: { required: true, options: SLOTS },
  message: { max: COPY.messageMaxLength },
};

// The time select shows its first slot by default, as on live.
const INITIAL_VALUES = {
  fullName: "",
  email: "",
  phone: "",
  preferredDate: "",
  preferredTime: SLOTS[0],
  message: "",
};

function buildPayload(values) {
  return buildContactPayload({
    topic: CONTACT_TOPICS.tour,
    pagePath: "/",
    website: values.website,
    fields: {
      fullName: values.fullName,
      email: values.email,
      phone: values.phone,
      preferredDate: values.preferredDate,
      preferredTime: values.preferredTime,
      message: values.message,
    },
  });
}

/**
 * "Schedule a tour" form (inside the popup): Name, Email, Phone, preferred
 * date, time slot and Message, posted to POST /contact with `topic: "tour"`
 * (empty optional fields left out). The CF7 thank-you text replaces the
 * fields on success.
 *
 * @param {{ titleId: string }} props  id of the popup title (form name)
 */
export default function ScheduleTourForm({ titleId }) {
  const form = useContactForm({
    rules: RULES,
    initialValues: INITIAL_VALUES,
    buildPayload,
  });
  const { fields } = COPY;

  if (form.status === "success") {
    return (
      <FormSuccess
        as="p"
        headingRef={form.successRef}
        actionLabel={COPY.successAction}
        onReset={form.reset}
        className={styles.success}
      />
    );
  }

  return (
    <form {...form.formProps} aria-labelledby={titleId} className={styles.form}>
      <TextField
        id="tour-name"
        label={fields.fullName.label}
        placeholder={fields.fullName.placeholder}
        required
        autoComplete="name"
        maxLength={CONTACT_LIMITS.fullName}
        {...form.fieldProps("fullName")}
      />
      <TextField
        id="tour-email"
        type="email"
        label={fields.email.label}
        placeholder={fields.email.placeholder}
        required
        inputMode="email"
        autoComplete="email"
        autoCapitalize="none"
        spellCheck={false}
        maxLength={CONTACT_LIMITS.email}
        {...form.fieldProps("email")}
      />
      <TextField
        id="tour-phone"
        type="tel"
        label={fields.phone.label}
        placeholder={fields.phone.placeholder}
        required
        inputMode="tel"
        autoComplete="tel"
        maxLength={CONTACT_LIMITS.phone}
        {...form.fieldProps("phone")}
      />
      <TextField
        id="tour-date"
        type="date"
        label={fields.preferredDate.label}
        required
        min={todayIsoDate()}
        className={styles.date}
        {...form.fieldProps("preferredDate")}
      />
      <SelectField
        id="tour-time"
        label={fields.preferredTime.label}
        options={SLOT_OPTIONS}
        required
        className={styles.time}
        {...form.fieldProps("preferredTime")}
      />
      <TextAreaField
        id="tour-message"
        label={fields.message.label}
        placeholder={fields.message.placeholder}
        rows={3}
        maxLength={COPY.messageMaxLength}
        {...form.fieldProps("message")}
      />

      <Honeypot id="tour-website" {...form.honeypotProps} />
      <FormAlert ref={form.alertRef} message={form.formError} />

      <div className={styles.actions}>
        <SubmitButton pending={form.pending}>{COPY.submit}</SubmitButton>
      </div>
    </form>
  );
}
