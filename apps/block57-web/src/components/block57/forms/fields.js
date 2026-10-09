import { Button } from "@/components/block57/ui/Button";
import { ChevronIcon } from "@/components/block57/ui/icons";
import VisuallyHidden from "@/components/block57/ui/VisuallyHidden";
import { FORM_MESSAGES } from "./messages";
import styles from "./fields.module.scss";

/**
 * Block 57 form controls, styled like the live Contact Form 7 forms
 * (DESIGN_SPEC §2.6): transparent inputs with only a 1px #346054 underline,
 * Sentient 16/25.14, the placeholder as the visible label (a real <label> is
 * kept for assistive tech, visually hidden), CF7 red tips under the field.
 *
 * Every field takes the props returned by `useContactForm().fieldProps(name)`
 * ({ name, value, error, onChange(event), onBlur, inputRef }) plus `id`,
 * `label` and native attributes (placeholder, type, autoComplete, maxLength…).
 * Each field sets `aria-invalid` and links its error with `aria-describedby`.
 *
 * Colours can be tuned per form on any ancestor (see fields.module.scss):
 * --b57-form-text, --b57-form-placeholder, --b57-form-line,
 * --b57-form-line-focus, --b57-form-gap.
 */

const cx = (...classes) => classes.filter(Boolean).join(" ");

function FieldError({ id, message }) {
  if (!message) return null;
  return (
    <p id={id} className={styles.tip}>
      {message}
    </p>
  );
}

function errorProps(id, error) {
  return {
    "aria-invalid": error ? true : undefined,
    "aria-describedby": error ? `${id}-error` : undefined,
  };
}

/** Text, email, tel or date input. */
export function TextField({
  id,
  label,
  error,
  inputRef,
  className,
  type = "text",
  ...inputProps
}) {
  return (
    <div
      className={cx(styles.field, styles.input, className)}
      data-form-field=""
    >
      <VisuallyHidden as="label" htmlFor={id}>
        {label}
      </VisuallyHidden>
      <input
        ref={inputRef}
        id={id}
        type={type}
        className={styles.control}
        {...errorProps(id, error)}
        {...inputProps}
      />
      <FieldError id={`${id}-error`} message={error} />
    </div>
  );
}

/** Textarea, 2 rows by default (inquire/contact; the tour popup uses 3). */
export function TextAreaField({
  id,
  label,
  error,
  inputRef,
  className,
  rows = 2,
  ...textareaProps
}) {
  return (
    <div className={cx(styles.field, className)} data-form-field="">
      <VisuallyHidden as="label" htmlFor={id}>
        {label}
      </VisuallyHidden>
      <textarea
        ref={inputRef}
        id={id}
        rows={rows}
        className={cx(styles.control, styles.textarea)}
        style={{ "--_rows": rows }}
        {...errorProps(id, error)}
        {...textareaProps}
      />
      <FieldError id={`${id}-error`} message={error} />
    </div>
  );
}

/**
 * Native select on a white field with a chevron (tour popup time slots).
 * `options`: [{ value, label }]; `placeholder` adds an empty first option.
 */
export function SelectField({
  id,
  label,
  options,
  placeholder,
  error,
  inputRef,
  className,
  ...selectProps
}) {
  return (
    <div className={cx(styles.field, className)} data-form-field="">
      <VisuallyHidden as="label" htmlFor={id}>
        {label}
      </VisuallyHidden>
      <div className={styles.selectWrap}>
        <select
          ref={inputRef}
          id={id}
          className={cx(styles.control, styles.select)}
          {...errorProps(id, error)}
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
      <FieldError id={`${id}-error`} message={error} />
    </div>
  );
}

/**
 * Radio group (inquire "Type of residence"): a fieldset whose legend is the
 * live static label, options in two 200px columns, CF7 radio circles drawn
 * with box-shadows (the native input stays focusable, visually hidden).
 * `inputRef` goes to the checked option (or the first one) for error focus.
 * `options`: [{ value, label }].
 */
export function RadioGroupField({
  id,
  legend,
  name,
  options,
  value,
  onChange,
  onBlur,
  error,
  inputRef,
  className,
}) {
  const focusIndex = Math.max(
    0,
    options.findIndex((option) => option.value === value),
  );
  return (
    <fieldset
      className={cx(styles.field, styles.fieldset, className)}
      data-form-field=""
      aria-describedby={error ? `${id}-error` : undefined}
    >
      <legend className={styles.legend}>{legend}</legend>
      <div className={styles.radios}>
        {options.map((option, index) => (
          <label key={option.value} className={styles.radio}>
            <input
              ref={index === focusIndex ? inputRef : undefined}
              id={index === 0 ? id : undefined}
              type="radio"
              name={name}
              value={option.value}
              checked={option.value === value}
              onChange={onChange}
              onBlur={onBlur}
              className={styles.radioInput}
            />
            <span className={styles.radioLabel}>{option.label}</span>
          </label>
        ))}
      </div>
      <FieldError id={`${id}-error`} message={error} />
    </fieldset>
  );
}

/**
 * Honeypot: off-screen (not display:none, which some bots skip) and hidden
 * from assistive tech; real visitors never fill it in.
 */
export function Honeypot({
  id,
  label = "Leave this field empty",
  value,
  onChange,
}) {
  return (
    <div className={styles.honeypot} aria-hidden="true">
      <label htmlFor={id}>{label}</label>
      <input
        id={id}
        name="website"
        type="text"
        tabIndex={-1}
        autoComplete="off"
        value={value}
        onChange={onChange}
      />
    </div>
  );
}

/**
 * Form-level error (network/API failure) in the CF7 tip style, above the
 * submit row. Always rendered (empty) so `ref` (useContactForm's
 * `alertRef`) can receive focus.
 */
export function FormAlert({ ref, message, className }) {
  return (
    <div
      ref={ref}
      role="alert"
      tabIndex={-1}
      className={cx(styles.alert, className)}
    >
      {message ? <p className={styles.alertText}>{message}</p> : null}
    </div>
  );
}

/**
 * Green SUBMIT pill with the conveyor arrow. While `pending` it is dimmed
 * (CF7 loading look) and a screen-reader status says "Sending…".
 */
export function SubmitButton({ pending = false, className, children }) {
  return (
    <>
      <Button
        type="submit"
        aria-disabled={pending || undefined}
        className={cx(styles.submit, className)}
      >
        {children}
      </Button>
      <VisuallyHidden role="status">
        {pending ? FORM_MESSAGES.sending : ""}
      </VisuallyHidden>
    </>
  );
}

/**
 * Thank-you state that replaces a form in place: H5-style heading (focused by
 * `useContactForm` through `headingRef`) + a text-link button back to the form.
 */
export function FormSuccess({
  headingRef,
  as: Heading = "h2",
  title = FORM_MESSAGES.sent,
  actionLabel,
  onReset,
  className,
}) {
  return (
    <div className={cx(styles.success, className)}>
      <Heading ref={headingRef} tabIndex={-1} className={styles.successTitle}>
        {title}
      </Heading>
      {actionLabel ? (
        <Button variant="textLink" onClick={onReset}>
          {actionLabel}
        </Button>
      ) : null}
    </div>
  );
}
