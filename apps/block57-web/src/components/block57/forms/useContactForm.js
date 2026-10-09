"use client";

import { useEffect, useRef, useState } from "react";
import { describeSubmitError, mapServerErrors, submitContact } from "./payload";
import { firstInvalidField, validateValue, validateValues } from "./validation";

function withFieldError(errors, name, message) {
  if ((errors[name] ?? null) === message) return errors;
  const next = { ...errors };
  if (message) next[name] = message;
  else delete next[name];
  return next;
}

/**
 * State and submit flow of a Block 57 form posting to POST /contact (inquire,
 * contact, schedule a tour).
 *
 * - Checks run on submit, on blur of a filled field, and live while a field
 *   shows an error (no nagging while tabbing through empty fields).
 * - On submit the first invalid field gets focus (scrolled to the middle of
 *   the viewport); server field errors (400 `errors[]`) are mapped back onto
 *   the fields; other failures go to the form alert (CF7 wording).
 * - On success the values are reset, `status` becomes "success" and focus
 *   moves to the element given `successRef` (render the thank-you text there).
 * - Every rejection is caught; a request still running at unmount is
 *   cancelled.
 *
 * @param {{
 *   rules: Record<string, { required?: boolean, type?: string, max?: number, options?: string[] }>,
 *   initialValues?: Record<string, string>,
 *   buildPayload: (values: Record<string, string>) => object,
 *   onSuccess?: () => void,
 * }} options
 *   `rules`: one entry per visible field, in on-screen order (focus order for
 *   errors). `initialValues` is read once. `buildPayload` returns the POST
 *   body (use buildContactPayload; the honeypot value is `values.website`).
 */
export default function useContactForm({
  rules,
  initialValues,
  buildPayload,
  onSuccess,
}) {
  const initialRef = useRef(null);
  if (!initialRef.current) {
    initialRef.current = { website: "", ...initialValues };
  }

  const [values, setValues] = useState(() => initialRef.current);
  const [errors, setErrors] = useState({});
  const [status, setStatus] = useState("idle"); // idle | submitting | success
  const [formError, setFormError] = useState("");
  // { name: field name | "alert" | "success" }: focused after the next render.
  const [focusRequest, setFocusRequest] = useState(null);

  const optionsRef = useRef({ rules, buildPayload, onSuccess });
  optionsRef.current = { rules, buildPayload, onSuccess };

  const fieldRefs = useRef({});
  const refCallbacks = useRef({});
  const alertRef = useRef(null);
  const successRef = useRef(null);
  const submittingRef = useRef(false);
  // Pointer pressed on the submit button: the blur that follows must not add
  // a tip (it would push the button down before the click lands).
  const submitIntentRef = useRef(false);
  const mountedRef = useRef(false);
  const requestRef = useRef(null);

  useEffect(() => {
    mountedRef.current = true;
    return () => {
      mountedRef.current = false;
      requestRef.current?.cancel?.();
    };
  }, []);

  useEffect(() => {
    if (!focusRequest) return;
    const { name } = focusRequest;
    const node =
      name === "alert"
        ? alertRef.current
        : name === "success"
          ? successRef.current
          : fieldRefs.current[name];
    if (!node) return;
    const reduceMotion = window.matchMedia?.(
      "(prefers-reduced-motion: reduce)",
    )?.matches;
    (node.closest?.("[data-form-field]") ?? node).scrollIntoView?.({
      block: "center",
      behavior: reduceMotion ? "auto" : "smooth",
    });
    node.focus?.({ preventScroll: true });
  }, [focusRequest]);

  const register = (name) => {
    refCallbacks.current[name] ??= (node) => {
      fieldRefs.current[name] = node;
    };
    return refCallbacks.current[name];
  };

  /** Sets one value; re-checks it live while it shows an error. */
  const setValue = (name, value) => {
    setValues((prev) => ({ ...prev, [name]: value }));
    if (errors[name]) {
      setErrors((prev) =>
        withFieldError(
          prev,
          name,
          validateValue(optionsRef.current.rules[name], value),
        ),
      );
    }
  };

  const handleBlur = (name, event) => {
    if (submitIntentRef.current || event?.relatedTarget?.type === "submit") {
      return; // the submit check runs right after
    }
    const value = values[name];
    if (!String(value ?? "").trim() && !errors[name]) return;
    setErrors((prev) =>
      withFieldError(
        prev,
        name,
        validateValue(optionsRef.current.rules[name], value),
      ),
    );
  };

  /** Props for one field component of ./fields.js. */
  const fieldProps = (name) => ({
    name,
    value: values[name] ?? "",
    error: errors[name],
    onChange: (event) => setValue(name, event.target.value),
    onBlur: (event) => handleBlur(name, event),
    inputRef: register(name),
  });

  /** Props for <Honeypot />. */
  const honeypotProps = {
    value: values.website,
    onChange: (event) => {
      const { value } = event.target;
      setValues((prev) => ({ ...prev, website: value }));
    },
  };

  const handleSubmit = async (event) => {
    event.preventDefault();
    submitIntentRef.current = false;
    if (submittingRef.current) return;
    const { rules: currentRules, buildPayload: build } = optionsRef.current;

    const clientErrors = validateValues(currentRules, values);
    const firstClientError = firstInvalidField(currentRules, clientErrors);
    if (firstClientError) {
      setErrors(clientErrors);
      setFormError("");
      setFocusRequest({ name: firstClientError });
      return;
    }

    submittingRef.current = true;
    setErrors({});
    setFormError("");
    setStatus("submitting");

    try {
      const request = submitContact(build(values));
      requestRef.current = request;
      await request;
      if (!mountedRef.current) return;
      setValues(initialRef.current);
      setStatus("success");
      setFocusRequest({ name: "success" });
      optionsRef.current.onSuccess?.();
    } catch (error) {
      if (!mountedRef.current) return;
      const { fieldErrors, otherMessages } = mapServerErrors(
        error?.response?.data?.errors,
        Object.keys(currentRules),
      );
      const firstServerError = firstInvalidField(currentRules, fieldErrors);
      setErrors(fieldErrors);
      setFormError(
        describeSubmitError(error, {
          hasFieldErrors: Boolean(firstServerError),
          otherMessages,
        }),
      );
      setStatus("idle");
      setFocusRequest({ name: firstServerError ?? "alert" });
    } finally {
      submittingRef.current = false;
      requestRef.current = null;
    }
  };

  const handlePointerDown = (event) => {
    submitIntentRef.current = Boolean(
      event.target.closest?.('[type="submit"]'),
    );
  };

  /** Props for the <form> element (spread them, add aria-labelledby). */
  const formProps = {
    method: "post",
    noValidate: true,
    onSubmit: handleSubmit,
    onPointerDown: handlePointerDown,
    "aria-busy": status === "submitting" || undefined,
  };

  /** Moves focus to a field (e.g. after removing a chip above it). */
  const focusField = (name) => setFocusRequest({ name });

  /** Back to an empty form after the thank-you state; focuses the first field. */
  const reset = () => {
    setValues(initialRef.current);
    setStatus("idle");
    setErrors({});
    setFormError("");
    setFocusRequest({ name: Object.keys(optionsRef.current.rules)[0] });
  };

  return {
    values,
    errors,
    status,
    pending: status === "submitting",
    formError,
    setValue,
    updateValues: setValues,
    fieldProps,
    honeypotProps,
    formProps,
    focusField,
    reset,
    alertRef,
    successRef,
  };
}
