import { DEFAULT_PHONE_COUNTRY_CODE } from "@/lib/phone/countryCodes";
import { buildFullPhone, normalizePhoneNumber } from "@/lib/phone/parsePhone";
import { FORM_MESSAGES as MSG } from "./messages";

/**
 * Client-side rules for the Block 57 forms. Messages are the live Contact
 * Form 7 wording (./messages.js); limits mirror POST /contact
 * (server/src/modules/contact/contact.validation.js), so a form that passes
 * here is accepted by the API.
 *
 * A form describes its fields as `{ [name]: rule }`, in on-screen order (the
 * first invalid field gets focus):
 *   { required?: boolean, type?: "text" | "email" | "tel" | "date",
 *     max?: number, options?: string[] }
 *
 *   const RULES = { phone: { required: true, type: "tel" }, message: { max: 5000 } };
 *   validateValues(RULES, values) // → { phone: "Please fill out this field." }
 */

/** POST /contact field limits (characters, after trimming). */
export const CONTACT_LIMITS = {
  firstName: 80,
  lastName: 80,
  fullName: 160,
  email: 254,
  phone: 40,
  message: 5000,
  residenceType: 80,
  unitLabel: 80,
  preferredTime: 40,
};

/** Same pattern as zod v3 `z.string().email()` used by the server. */
export const EMAIL_PATTERN =
  /^(?!\.)(?!.*\.\.)([A-Z0-9_'+\-.]*)[A-Z0-9_+-]@([A-Z0-9][A-Z0-9-]*\.)+[A-Z]{2,}$/i;

const PHONE_CHARACTERS = /^[\d\s().+\-/]*$/;
const MIN_PHONE_DIGITS = 6;
const CALENDAR_DATE = /^(\d{4})-(\d{2})-(\d{2})$/;

const trimmed = (value) => String(value ?? "").trim();

/**
 * One international number from what the visitor typed, Ghana (+233) by
 * default: "0244 777 772" → "+233244777772" (one national trunk "0" dropped),
 * "+44 20 7946 0000" / "0044 20…" → "+442079460000". "" when empty.
 */
export function normalizePhone(raw, countryCode = DEFAULT_PHONE_COUNTRY_CODE) {
  const value = trimmed(raw);
  if (!value) return "";
  let digits = normalizePhoneNumber(value);
  if (!digits) return "";
  if (value.startsWith("+")) return `+${digits}`;
  if (value.startsWith("00") && digits.length > 2) {
    return `+${digits.slice(2)}`;
  }
  if (digits.length > 1 && digits.startsWith("0")) digits = digits.slice(1);
  return buildFullPhone(countryCode, digits);
}

/** Today's local calendar date as YYYY-MM-DD (e.g. a date input's `min`). */
export function todayIsoDate(now = new Date()) {
  const pad = (number) => String(number).padStart(2, "0");
  return `${now.getFullYear()}-${pad(now.getMonth() + 1)}-${pad(now.getDate())}`;
}

function isCalendarDate(value) {
  const match = CALENDAR_DATE.exec(value);
  if (!match) return false;
  const [year, month, day] = match.slice(1).map(Number);
  const date = new Date(Date.UTC(year, month - 1, day));
  return (
    date.getUTCFullYear() === year &&
    date.getUTCMonth() === month - 1 &&
    date.getUTCDate() === day
  );
}

/** Message for one value against its rule, or null when valid. */
export function validateValue(rule = {}, rawValue) {
  const value = trimmed(rawValue);
  if (!value) return rule.required ? MSG.required : null;

  switch (rule.type) {
    case "email":
      if (rule.max && value.length > rule.max) return MSG.tooLong;
      return EMAIL_PATTERN.test(value) ? null : MSG.email;
    case "tel": {
      if (
        !PHONE_CHARACTERS.test(value) ||
        normalizePhoneNumber(value).length < MIN_PHONE_DIGITS
      ) {
        return MSG.tel;
      }
      const max = rule.max ?? CONTACT_LIMITS.phone;
      return normalizePhone(value).length > max ? MSG.tooLong : null;
    }
    case "date":
      if (!isCalendarDate(value)) return MSG.date;
      return value < todayIsoDate() ? MSG.dateTooEarly : null;
    default:
      break;
  }

  if (rule.options && !rule.options.includes(value)) return MSG.invalidOption;
  if (rule.max && value.length > rule.max) return MSG.tooLong;
  return null;
}

/** `{ [name]: message }` for every invalid field (empty object when valid). */
export function validateValues(rules, values) {
  const errors = {};
  for (const [name, rule] of Object.entries(rules)) {
    const message = validateValue(rule, values?.[name]);
    if (message) errors[name] = message;
  }
  return errors;
}

/** First field (in rule order) that has an error, or null. */
export function firstInvalidField(rules, errors) {
  return Object.keys(rules).find((name) => errors?.[name]) ?? null;
}
