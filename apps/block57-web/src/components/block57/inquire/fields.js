"use client";

import { ChevronIcon } from "@/components/block57/ui/icons";
import { PHONE_COUNTRY_CODES } from "@/lib/phone/countryCodes";
import styles from "./fields.module.scss";

/**
 * Inquire form controls: label above, hairline underline, inline error.
 * Each control gets `aria-invalid` and `aria-describedby` (hint + error).
 * PROVISIONAL look until Phase 0 — styles only use the global --b57 tokens.
 */

function describedBy(...ids) {
  const value = ids.filter(Boolean).join(" ");
  return value || undefined;
}

function FieldShell({
  id,
  label,
  required = false,
  hint,
  hintId,
  hintAside,
  error,
  errorId,
  className,
  children,
}) {
  return (
    <div
      className={[styles.field, error ? styles.invalid : null, className]
        .filter(Boolean)
        .join(" ")}
      data-inquire-field=""
    >
      <label htmlFor={id} className={styles.label}>
        {label}
        {required ? (
          <span className={styles.required} aria-hidden="true">
            *
          </span>
        ) : null}
      </label>
      {children}
      {hint || hintAside ? (
        <div className={styles.meta}>
          {hint ? (
            <p id={hintId} className={styles.hint}>
              {hint}
            </p>
          ) : (
            <span />
          )}
          {hintAside ? (
            <span className={styles.hintAside} aria-hidden="true">
              {hintAside}
            </span>
          ) : null}
        </div>
      ) : null}
      {error ? (
        <p id={errorId} className={styles.error}>
          <span className={styles.errorMark} aria-hidden="true">
            !
          </span>
          {error}
        </p>
      ) : null}
    </div>
  );
}

export function TextField({
  id,
  name,
  label,
  value,
  onChange,
  onBlur,
  error,
  required = false,
  hint,
  inputRef,
  className,
  type = "text",
  ...inputProps
}) {
  const hintId = hint ? `${id}-hint` : undefined;
  const errorId = error ? `${id}-error` : undefined;
  return (
    <FieldShell
      id={id}
      label={label}
      required={required}
      hint={hint}
      hintId={hintId}
      error={error}
      errorId={errorId}
      className={className}
    >
      <input
        ref={inputRef}
        id={id}
        name={name}
        type={type}
        value={value}
        onChange={(event) => onChange(name, event.target.value)}
        onBlur={onBlur ? () => onBlur(name) : undefined}
        required={required}
        aria-invalid={error ? true : undefined}
        aria-describedby={describedBy(hintId, errorId)}
        className={styles.control}
        {...inputProps}
      />
    </FieldShell>
  );
}

export function TextareaField({
  id,
  name,
  label,
  value,
  onChange,
  onBlur,
  error,
  required = false,
  hint,
  hintAside,
  inputRef,
  className,
  ...textareaProps
}) {
  const hintId = hint ? `${id}-hint` : undefined;
  const errorId = error ? `${id}-error` : undefined;
  return (
    <FieldShell
      id={id}
      label={label}
      required={required}
      hint={hint}
      hintId={hintId}
      hintAside={hintAside}
      error={error}
      errorId={errorId}
      className={className}
    >
      <textarea
        ref={inputRef}
        id={id}
        name={name}
        value={value}
        onChange={(event) => onChange(name, event.target.value)}
        onBlur={onBlur ? () => onBlur(name) : undefined}
        required={required}
        aria-invalid={error ? true : undefined}
        aria-describedby={describedBy(hintId, errorId)}
        className={[styles.control, styles.textarea].join(" ")}
        {...textareaProps}
      />
    </FieldShell>
  );
}

export function SelectField({
  id,
  name,
  label,
  value,
  onChange,
  onBlur,
  error,
  required = false,
  placeholder,
  options,
  inputRef,
  className,
  ...selectProps
}) {
  const errorId = error ? `${id}-error` : undefined;
  return (
    <FieldShell
      id={id}
      label={label}
      required={required}
      error={error}
      errorId={errorId}
      className={className}
    >
      <div className={styles.selectWrap}>
        <select
          ref={inputRef}
          id={id}
          name={name}
          value={value}
          onChange={(event) => onChange(name, event.target.value)}
          onBlur={onBlur ? () => onBlur(name) : undefined}
          required={required}
          aria-invalid={error ? true : undefined}
          aria-describedby={errorId}
          data-empty={value ? undefined : "true"}
          className={[styles.control, styles.select].join(" ")}
          {...selectProps}
        >
          {placeholder != null ? <option value="">{placeholder}</option> : null}
          {options.map((option) => (
            <option key={option.value} value={option.value}>
              {option.label}
            </option>
          ))}
        </select>
        <ChevronIcon size={16} className={styles.chevron} />
      </div>
    </FieldShell>
  );
}

/**
 * Country calling code (native select, shown as "+233 ▾") + national number.
 * The two values are combined into one international number on submit.
 */
export function PhoneField({
  id,
  label,
  codeLabel,
  countryCode,
  number,
  onChange,
  onBlur,
  error,
  inputRef,
  className,
}) {
  const errorId = error ? `${id}-error` : undefined;
  const codeId = `${id}-code`;
  return (
    <FieldShell
      id={id}
      label={label}
      error={error}
      errorId={errorId}
      className={className}
    >
      <div className={styles.phone}>
        <div className={styles.code}>
          <label htmlFor={codeId} className={styles.srOnly}>
            {codeLabel}
          </label>
          <select
            id={codeId}
            name="phoneCountryCode"
            value={countryCode}
            onChange={(event) =>
              onChange("phoneCountryCode", event.target.value)
            }
            autoComplete="tel-country-code"
            className={styles.codeSelect}
          >
            {PHONE_COUNTRY_CODES.map((entry) => (
              <option key={entry.code} value={entry.code}>
                {entry.label}
              </option>
            ))}
          </select>
          <span className={styles.codeValue} aria-hidden="true">
            {countryCode}
            <ChevronIcon size={14} />
          </span>
        </div>
        <input
          ref={inputRef}
          id={id}
          name="phoneNumber"
          type="tel"
          inputMode="tel"
          autoComplete="tel-national"
          value={number}
          onChange={(event) => onChange("phoneNumber", event.target.value)}
          onBlur={onBlur ? () => onBlur("phone") : undefined}
          aria-invalid={error ? true : undefined}
          aria-describedby={errorId}
          maxLength={40}
          className={[styles.control, styles.phoneNumber].join(" ")}
        />
      </div>
    </FieldShell>
  );
}
