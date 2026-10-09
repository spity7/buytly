"use client";

import { useEffect, useMemo, useRef, useState } from "react";
import { useBlock57Project } from "@/lib/block57/useBlock57Project";
import { findUnitById } from "@/lib/block57/units";
import VisuallyHidden from "@/components/block57/ui/VisuallyHidden";
import {
  FormAlert,
  FormSuccess,
  Honeypot,
  RadioGroupField,
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
import {
  DEFAULT_RESIDENCE,
  INQUIRE_FORM,
  INQUIRE_INTRO,
  INQUIRE_PAGE_PATH,
  RESIDENCE_OPTIONS,
  getResidenceLabel,
} from "@/content/block57/inquire";
import UnitChip from "./UnitChip";
import { buildUnitMessage, unitPayloadFields } from "./unit";
import styles from "./InquireForm.module.scss";

const COPY = INQUIRE_FORM;
const TITLE_ID = "inquire-form-title";

/** Live CF7 form 2055, in on-screen order (POST /contact limits). */
const RULES = {
  firstName: { required: true, max: CONTACT_LIMITS.firstName },
  lastName: { required: true, max: CONTACT_LIMITS.lastName },
  phone: { required: true, type: "tel" },
  email: { required: true, type: "email", max: CONTACT_LIMITS.email },
  residenceType: {
    required: true,
    options: RESIDENCE_OPTIONS.map((option) => option.label),
  },
  message: { max: CONTACT_LIMITS.message },
};

const RADIO_OPTIONS = RESIDENCE_OPTIONS.map((option) => ({
  value: option.label,
  label: option.label,
}));

/**
 * The live inquiry form (DESIGN_SPEC §4.7.2): intro H5, First/Last Name side
 * by side, Phone *, Email *, "Type of residence" radios (1 Bedroom checked by
 * default), optional Message, "Field with * required" + SUBMIT. Posts
 * `topic: "inquiry"` to POST /contact with `pagePath` and the honeypot; the
 * CF7 thank-you text replaces the intro and form on success.
 *
 * @param {{ initialType?: string, unitId?: string }} props
 *   `initialType`: `?type=` (page slug "1-bedroom", catalog value
 *   "one-bedroom", "studio" or a label) → pre-selects the radio.
 *   `unitId`: `?unit=` → once the project has loaded, shows the "Regarding"
 *   chip, sends `unitId` + `unitLabel`, selects the unit's type (unless
 *   `?type=` or the visitor chose one) and pre-fills an empty message.
 */
export default function InquireForm({ initialType = "", unitId = "" }) {
  const unitParam = String(unitId ?? "").trim();
  const typeFromLink = getResidenceLabel(initialType);

  const [unitDismissed, setUnitDismissed] = useState(false);
  const [autoMessage, setAutoMessage] = useState("");
  const [announcement, setAnnouncement] = useState("");
  const typeChosen = useRef(Boolean(typeFromLink));
  const prefilledFor = useRef(null);

  // ?unit=: only fetched when the link names a unit (React Query shares the
  // request with the rest of the site). Public units only.
  const { project, units, isError } = useBlock57Project({
    enabled: Boolean(unitParam),
  });
  const unit = useMemo(
    () => (unitParam && project ? findUnitById(units, unitParam) : null),
    [unitParam, project, units],
  );
  const activeUnit = unit && !unitDismissed ? unit : null;

  let unitState = "none";
  if (unitParam && !unitDismissed) {
    if (unit) unitState = "found";
    else if (project) unitState = "missing";
    else if (isError) unitState = "error";
    else unitState = "loading";
  }

  const form = useContactForm({
    rules: RULES,
    initialValues: {
      firstName: "",
      lastName: "",
      phone: "",
      email: "",
      residenceType: typeFromLink || DEFAULT_RESIDENCE,
      message: "",
    },
    buildPayload: (values) =>
      buildContactPayload({
        topic: CONTACT_TOPICS.inquiry,
        pagePath: INQUIRE_PAGE_PATH,
        website: values.website,
        fields: {
          firstName: values.firstName,
          lastName: values.lastName,
          email: values.email,
          phone: values.phone,
          residenceType: values.residenceType,
          message: values.message,
          ...unitPayloadFields(activeUnit),
        },
      }),
    onSuccess: () => {
      setUnitDismissed(true);
      setAutoMessage("");
    },
  });
  const { updateValues } = form;

  useEffect(() => {
    if (!unit || prefilledFor.current === unitParam) return;
    prefilledFor.current = unitParam;
    const message = buildUnitMessage(unit);
    const residenceType = getResidenceLabel(unit.type);
    updateValues((prev) => ({
      ...prev,
      residenceType:
        residenceType && !typeChosen.current
          ? residenceType
          : prev.residenceType,
      message: prev.message.trim() ? prev.message : message,
    }));
    setAutoMessage(message);
  }, [unit, unitParam, updateValues]);

  const removeUnit = () => {
    setUnitDismissed(true);
    updateValues((prev) =>
      autoMessage && prev.message === autoMessage
        ? { ...prev, message: "" }
        : prev,
    );
    setAnnouncement(COPY.unit.removed);
    form.focusField("firstName");
  };

  if (form.status === "success") {
    return (
      <FormSuccess
        headingRef={form.successRef}
        actionLabel={COPY.again}
        onReset={form.reset}
      />
    );
  }

  const residenceProps = form.fieldProps("residenceType");

  return (
    <>
      <h2 id={TITLE_ID} className={styles.intro}>
        {INQUIRE_INTRO}
      </h2>

      <form {...form.formProps} aria-labelledby={TITLE_ID}>
        <UnitChip state={unitState} unit={activeUnit} onRemove={removeUnit} />

        <div className={styles.names}>
          <TextField
            id="inquire-first-name"
            label={COPY.labels.firstName}
            placeholder={COPY.placeholders.firstName}
            required
            autoComplete="given-name"
            maxLength={CONTACT_LIMITS.firstName}
            {...form.fieldProps("firstName")}
          />
          <TextField
            id="inquire-last-name"
            label={COPY.labels.lastName}
            placeholder={COPY.placeholders.lastName}
            required
            autoComplete="family-name"
            maxLength={CONTACT_LIMITS.lastName}
            {...form.fieldProps("lastName")}
          />
        </div>
        <TextField
          id="inquire-phone"
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
          id="inquire-email"
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
        <RadioGroupField
          id="inquire-residence-type"
          legend={COPY.residenceLegend}
          options={RADIO_OPTIONS}
          {...residenceProps}
          onChange={(event) => {
            typeChosen.current = true;
            residenceProps.onChange(event);
          }}
        />
        <TextAreaField
          id="inquire-message"
          label={COPY.labels.message}
          placeholder={COPY.placeholders.message}
          maxLength={CONTACT_LIMITS.message}
          {...form.fieldProps("message")}
        />

        <Honeypot id="inquire-website" {...form.honeypotProps} />
        <FormAlert ref={form.alertRef} message={form.formError} />

        <div className={styles.actions}>
          <p className={styles.note}>
            {COPY.requiredNote[0]}
            <span className={styles.noteStrong}>{COPY.requiredNote[1]}</span>
          </p>
          <SubmitButton pending={form.pending}>{COPY.submit}</SubmitButton>
        </div>
      </form>

      <VisuallyHidden as="p" aria-live="polite">
        {announcement}
      </VisuallyHidden>
    </>
  );
}
