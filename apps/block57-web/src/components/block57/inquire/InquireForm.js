"use client";

import { useEffect, useMemo, useRef, useState } from "react";
import { customInstance } from "@/lib/api/custom-instance";
import { getApiError } from "@/lib/auth/getApiError";
import { useBlock57Project } from "@/lib/block57/useBlock57Project";
import { findUnitById } from "@/lib/block57/units";
import { Button } from "@/components/block57/ui/Button";
import {
  INQUIRE_ERRORS,
  INQUIRE_FIELD_LIMITS,
  INQUIRE_FORM,
  RESIDENCE_OPTIONS,
  getResidenceLabel,
} from "@/content/block57/inquire";
import { PhoneField, SelectField, TextField, TextareaField } from "./fields";
import InquireSuccess from "./InquireSuccess";
import UnitChip from "./UnitChip";
import {
  EMPTY_VALUES,
  FIELD_ORDER,
  buildInquiryPayload,
  buildUnitMessage,
  firstInvalidField,
  mapServerErrors,
  validateField,
  validateInquiry,
} from "./validation";
import styles from "./InquireForm.module.scss";

const LABELS = INQUIRE_FORM.labels;
const TITLE_ID = "inquire-form-title";

/** The select submits the option label (e.g. "Urban Villa") as `residenceType`. */
const RESIDENCE_SELECT_OPTIONS = RESIDENCE_OPTIONS.map((option) => ({
  value: option.label,
  label: option.label,
}));

const MESSAGE_MAX = INQUIRE_FIELD_LIMITS.message.max;
const numberFormat = new Intl.NumberFormat("en-GB");

function withStop(text) {
  const value = String(text ?? "").trim();
  return !value || /[.!?…]$/.test(value) ? value : `${value}.`;
}

/** Text for the form-level alert after a failed POST /contact. */
function describeSubmitError(error, hasFieldErrors, otherMessages) {
  if (!error?.response) return INQUIRE_ERRORS.network;
  return [
    getApiError(error, INQUIRE_ERRORS.fallback),
    hasFieldErrors ? INQUIRE_ERRORS.checkFields : null,
    ...otherMessages,
  ]
    .filter(Boolean)
    .map(withStop)
    .join(" ");
}

/**
 * Inquire form (POST /contact). Client-side checks mirror the server schema
 * (see ./validation.js); errors are shown inline and the first invalid field
 * gets focus. Server field errors (400 `errors[]`) are mapped back onto the
 * fields. On success the form is reset and replaced by the verified thank-you
 * text. Every rejection is caught: nothing escapes as an unhandled promise.
 *
 * @param {{ initialType?: string, unitId?: string }} props
 *   `initialType`: `?type=` (unit-type slug, e.g. "urban-villa") → pre-selects
 *   the residence type. `unitId`: `?unit=` → once the project has loaded, shows
 *   a "Regarding residence …" chip, sends `unitId` + `unitLabel` and pre-fills
 *   a polite message (only when the message is still empty).
 */
export default function InquireForm({ initialType = "", unitId = "" }) {
  const unitParam = String(unitId ?? "").trim();

  const [values, setValues] = useState(() => ({
    ...EMPTY_VALUES,
    residenceType: getResidenceLabel(initialType),
  }));
  const [errors, setErrors] = useState({});
  const [status, setStatus] = useState("idle"); // idle | submitting | success
  const [formError, setFormError] = useState("");
  const [unitDismissed, setUnitDismissed] = useState(false);
  const [autoMessage, setAutoMessage] = useState("");
  const [announcement, setAnnouncement] = useState("");
  // { target: field name | "alert" | "success" } — focused after the next render.
  const [focusRequest, setFocusRequest] = useState(null);

  const fieldRefs = useRef({});
  const alertRef = useRef(null);
  const successRef = useRef(null);
  const submittingRef = useRef(false);
  const mountedRef = useRef(false);
  const requestRef = useRef(null);
  const prefilledFor = useRef(null);

  const refCallbacks = useMemo(
    () =>
      Object.fromEntries(
        FIELD_ORDER.map((name) => [
          name,
          (node) => {
            fieldRefs.current[name] = node;
          },
        ]),
      ),
    [],
  );

  useEffect(() => {
    mountedRef.current = true;
    return () => {
      mountedRef.current = false;
      requestRef.current?.cancel?.();
    };
  }, []);

  // ---- ?unit= -------------------------------------------------------------
  // Only fetched when the link names a unit (React Query shares the request
  // with the rest of the site). Public units only: draft/pending never match.
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

  useEffect(() => {
    if (!unit || prefilledFor.current === unitParam) return;
    prefilledFor.current = unitParam;
    const message = buildUnitMessage(unit);
    const residenceType = getResidenceLabel(unit.type);
    setValues((prev) => ({
      ...prev,
      residenceType: prev.residenceType || residenceType,
      message: prev.message.trim() ? prev.message : message,
    }));
    setAutoMessage(message);
  }, [unit, unitParam]);

  // ---- focus management ---------------------------------------------------
  // The whole field (label, control, error) is scrolled to the middle of the
  // viewport, so the sticky header never covers it, then focused without a
  // second scroll. Smooth unless the visitor prefers reduced motion.
  useEffect(() => {
    if (!focusRequest) return;
    const { target } = focusRequest;
    const node =
      target === "alert"
        ? alertRef.current
        : target === "success"
          ? successRef.current
          : fieldRefs.current[target];
    if (!node) return;
    const reduceMotion = window.matchMedia?.(
      "(prefers-reduced-motion: reduce)",
    )?.matches;
    const container = node.closest?.("[data-inquire-field]") ?? node;
    container.scrollIntoView?.({
      block: "center",
      behavior: reduceMotion ? "auto" : "smooth",
    });
    node.focus?.({ preventScroll: true });
  }, [focusRequest]);

  // ---- handlers -------------------------------------------------------------
  const errorKeyFor = (name) =>
    name === "phoneNumber" || name === "phoneCountryCode" ? "phone" : name;

  const updateError = (key, nextValues) => {
    const message = validateField(key, nextValues);
    setErrors((prev) => {
      if ((prev[key] ?? null) === message) return prev;
      const next = { ...prev };
      if (message) next[key] = message;
      else delete next[key];
      return next;
    });
  };

  const handleChange = (name, value) => {
    const nextValues = { ...values, [name]: value };
    setValues(nextValues);
    const key = errorKeyFor(name);
    // Live re-check only for a field that already shows an error.
    if (errors[key]) updateError(key, nextValues);
  };

  const handleBlur = (key) => {
    const raw = key === "phone" ? values.phoneNumber : values[key];
    // Leaving an untouched empty field is not an error yet (no nagging while
    // tabbing through); the submit check catches it.
    if (!String(raw ?? "").trim() && !errors[key]) return;
    updateError(key, values);
  };

  const removeUnit = () => {
    setUnitDismissed(true);
    setValues((prev) =>
      autoMessage && prev.message === autoMessage
        ? { ...prev, message: "" }
        : prev,
    );
    setAnnouncement(INQUIRE_FORM.unit.removed);
    setFocusRequest({ target: "firstName" });
  };

  const handleSubmit = async (event) => {
    event.preventDefault();
    if (submittingRef.current) return;

    const clientErrors = validateInquiry(values);
    const firstClientError = firstInvalidField(clientErrors);
    if (firstClientError) {
      setErrors(clientErrors);
      setFormError("");
      setFocusRequest({ target: firstClientError });
      return;
    }

    submittingRef.current = true;
    setErrors({});
    setFormError("");
    setAnnouncement("");
    setStatus("submitting");

    try {
      const request = customInstance({
        url: "/contact",
        method: "POST",
        data: buildInquiryPayload(values, activeUnit),
      });
      requestRef.current = request;
      await request;
      if (!mountedRef.current) return;
      setValues({ ...EMPTY_VALUES });
      setUnitDismissed(true);
      setAutoMessage("");
      setStatus("success");
      setFocusRequest({ target: "success" });
    } catch (error) {
      if (!mountedRef.current) return;
      const { fieldErrors, otherMessages } = mapServerErrors(
        error?.response?.data?.errors,
      );
      const firstServerError = firstInvalidField(fieldErrors);
      setErrors(fieldErrors);
      setFormError(
        describeSubmitError(error, Boolean(firstServerError), otherMessages),
      );
      setStatus("idle");
      setFocusRequest({ target: firstServerError ?? "alert" });
    } finally {
      submittingRef.current = false;
      requestRef.current = null;
    }
  };

  const startOver = () => {
    setStatus("idle");
    setErrors({});
    setFormError("");
    setAnnouncement("");
    setFocusRequest({ target: "firstName" });
  };

  // ---- render -----------------------------------------------------------------
  if (status === "success") {
    return <InquireSuccess headingRef={successRef} onReset={startOver} />;
  }

  const pending = status === "submitting";
  const fieldProps = (name) => ({
    name,
    value: values[name],
    onChange: handleChange,
    onBlur: handleBlur,
    error: errors[name],
    inputRef: refCallbacks[name],
  });

  return (
    <div className={styles.panel}>
      <header className={styles.header}>
        <h2 id={TITLE_ID} className={styles.title}>
          {INQUIRE_FORM.title}
        </h2>
        <p className={styles.note}>{INQUIRE_FORM.requiredNote}</p>
      </header>

      <form
        method="post"
        noValidate
        onSubmit={handleSubmit}
        aria-labelledby={TITLE_ID}
        aria-busy={pending || undefined}
        className={styles.form}
      >
        <UnitChip state={unitState} unit={activeUnit} onRemove={removeUnit} />

        <div className={styles.grid}>
          <TextField
            id="inquire-first-name"
            label={LABELS.firstName}
            required
            autoComplete="given-name"
            maxLength={INQUIRE_FIELD_LIMITS.firstName.max}
            {...fieldProps("firstName")}
          />
          <TextField
            id="inquire-last-name"
            label={LABELS.lastName}
            required
            autoComplete="family-name"
            maxLength={INQUIRE_FIELD_LIMITS.lastName.max}
            {...fieldProps("lastName")}
          />
          <TextField
            id="inquire-email"
            type="email"
            label={LABELS.email}
            required
            inputMode="email"
            autoComplete="email"
            autoCapitalize="none"
            spellCheck={false}
            maxLength={INQUIRE_FIELD_LIMITS.email.max}
            {...fieldProps("email")}
          />
          <PhoneField
            id="inquire-phone"
            label={LABELS.phone}
            codeLabel={LABELS.phoneCountryCode}
            countryCode={values.phoneCountryCode}
            number={values.phoneNumber}
            onChange={handleChange}
            onBlur={handleBlur}
            error={errors.phone}
            inputRef={refCallbacks.phone}
          />
          <SelectField
            id="inquire-residence-type"
            label={LABELS.residenceType}
            placeholder={INQUIRE_FORM.residencePlaceholder}
            options={RESIDENCE_SELECT_OPTIONS}
            className={styles.full}
            {...fieldProps("residenceType")}
          />
          <TextareaField
            id="inquire-message"
            label={LABELS.message}
            required
            rows={6}
            maxLength={MESSAGE_MAX}
            hint={INQUIRE_FORM.hints.message}
            hintAside={`${numberFormat.format(values.message.length)} / ${numberFormat.format(MESSAGE_MAX)}`}
            className={styles.full}
            {...fieldProps("message")}
          />
        </div>

        {/* Honeypot: hidden from people and assistive tech; bots fill it in. */}
        <div className={styles.honeypot} aria-hidden="true">
          <label htmlFor="inquire-website">{LABELS.website}</label>
          <input
            id="inquire-website"
            name="website"
            type="text"
            tabIndex={-1}
            autoComplete="off"
            aria-hidden="true"
            value={values.website}
            onChange={(event) => handleChange("website", event.target.value)}
          />
        </div>

        <div ref={alertRef} role="alert" tabIndex={-1} className={styles.alert}>
          {formError ? <p className={styles.alertText}>{formError}</p> : null}
        </div>

        <div className={styles.actions}>
          <Button
            type="submit"
            aria-disabled={pending || undefined}
            arrow={!pending}
            icon={
              pending ? (
                <span className={styles.spinner} aria-hidden="true" />
              ) : undefined
            }
            className={styles.submit}
          >
            {pending ? INQUIRE_FORM.submitting : INQUIRE_FORM.submit}
          </Button>
        </div>
      </form>

      <p className={styles.srOnly} aria-live="polite">
        {announcement}
      </p>
    </div>
  );
}
