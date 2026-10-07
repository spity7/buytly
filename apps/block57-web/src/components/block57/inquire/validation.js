import { DEFAULT_PHONE_COUNTRY_CODE } from "@/lib/phone/countryCodes";
import { buildFullPhone, normalizePhoneNumber } from "@/lib/phone/parsePhone";
import { getUnitTypeLabel } from "@/content/block57/unitTypes";
import {
  INQUIRE_ERRORS as ERR,
  INQUIRE_FIELD_LIMITS as LIMITS,
  INQUIRE_FORM,
  INQUIRE_PAGE_PATH,
} from "@/content/block57/inquire";

/**
 * Client-side rules for the Inquire form. They mirror the server schema
 * (server/src/modules/contact/contact.validation.js) exactly:
 *   firstName/lastName trim 1–80 · email trim, valid, ≤254 · message trim 10–5000
 *   phone ≤40 · residenceType ≤80 · unitId 24-hex · unitLabel ≤80 · pagePath "/…" ≤300
 * The phone number additionally gets a light format check (digits and the usual
 * separators, at least 6 digits) — the server only limits its length.
 */

/** Same pattern as zod v3 `z.string().email()` used by the server. */
export const EMAIL_PATTERN =
  /^(?!\.)(?!.*\.\.)([A-Z0-9_'+\-.]*)[A-Z0-9_+-]@([A-Z0-9][A-Z0-9-]*\.)+[A-Z]{2,}$/i;

const OBJECT_ID_PATTERN = /^[0-9a-fA-F]{24}$/;
const PHONE_CHARACTERS = /^[\d\s().+\-/]*$/;
const MIN_PHONE_DIGITS = 6;

/** Fields in on-screen order (used to focus the first invalid one). */
export const FIELD_ORDER = [
  "firstName",
  "lastName",
  "email",
  "phone",
  "residenceType",
  "message",
];

export const EMPTY_VALUES = Object.freeze({
  firstName: "",
  lastName: "",
  email: "",
  phoneCountryCode: DEFAULT_PHONE_COUNTRY_CODE,
  phoneNumber: "",
  residenceType: "",
  message: "",
  website: "", // honeypot
});

const trimmed = (value) => String(value ?? "").trim();

export function isObjectId(value) {
  return OBJECT_ID_PATTERN.test(String(value ?? ""));
}

/**
 * One international number from the country-code select and the number input
 * (buildFullPhone → "+233244777772"). A number typed with its own "+" or "00"
 * prefix wins over the select; one national trunk "0" is dropped
 * ("0244 777 772" with +233 → "+233244777772"), except for Italy where the
 * leading 0 is part of the international number.
 */
export function combinePhone(countryCode, rawNumber) {
  const raw = trimmed(rawNumber);
  if (!raw) return "";
  if (raw.startsWith("+")) {
    const digits = normalizePhoneNumber(raw);
    return digits ? `+${digits}` : "";
  }
  let digits = normalizePhoneNumber(raw);
  if (raw.startsWith("00") && digits.length > 2) {
    return `+${digits.slice(2)}`;
  }
  const code = countryCode || DEFAULT_PHONE_COUNTRY_CODE;
  if (code !== "+39" && digits.length > 1 && digits.startsWith("0")) {
    digits = digits.slice(1);
  }
  return buildFullPhone(code, digits);
}

function validateName(value, required, tooLong, limits) {
  const text = trimmed(value);
  if (text.length < limits.min) return required;
  if (text.length > limits.max) return tooLong;
  return null;
}

/** Error message for one field, or null. `name` is a FIELD_ORDER entry. */
export function validateField(name, values) {
  switch (name) {
    case "firstName":
      return validateName(
        values.firstName,
        ERR.firstNameRequired,
        ERR.firstNameTooLong,
        LIMITS.firstName,
      );
    case "lastName":
      return validateName(
        values.lastName,
        ERR.lastNameRequired,
        ERR.lastNameTooLong,
        LIMITS.lastName,
      );
    case "email": {
      const email = trimmed(values.email);
      if (!email) return ERR.emailRequired;
      if (email.length > LIMITS.email.max) return ERR.emailTooLong;
      if (!EMAIL_PATTERN.test(email)) return ERR.emailInvalid;
      return null;
    }
    case "phone": {
      const raw = trimmed(values.phoneNumber);
      if (!raw) return null; // optional
      if (
        !PHONE_CHARACTERS.test(raw) ||
        normalizePhoneNumber(raw).length < MIN_PHONE_DIGITS
      ) {
        return ERR.phoneInvalid;
      }
      const full = combinePhone(values.phoneCountryCode, raw);
      if (full.length > LIMITS.phone.max) return ERR.phoneTooLong;
      return null;
    }
    case "residenceType":
      return trimmed(values.residenceType).length > LIMITS.residenceType.max
        ? ERR.residenceTypeTooLong
        : null;
    case "message": {
      const message = trimmed(values.message);
      if (!message) return ERR.messageRequired;
      if (message.length < LIMITS.message.min) return ERR.messageTooShort;
      if (message.length > LIMITS.message.max) return ERR.messageTooLong;
      return null;
    }
    default:
      return null;
  }
}

/** `{ [field]: message }` for every invalid field (empty object when valid). */
export function validateInquiry(values) {
  const errors = {};
  for (const name of FIELD_ORDER) {
    const message = validateField(name, values);
    if (message) errors[name] = message;
  }
  return errors;
}

export function firstInvalidField(errors) {
  return FIELD_ORDER.find((name) => errors?.[name]) ?? null;
}

function formatBlock(building) {
  const value = trimmed(building);
  return value ? `Block ${value}` : "";
}

function truncate(text, max) {
  return text.length > max ? `${text.slice(0, max - 1).trimEnd()}…` : text;
}

/** "B-204 · Urban Villa · Block B" (sent as `unitLabel`, ≤ 80 characters). */
export function buildUnitLabel(unit) {
  if (!unit) return "";
  const parts = [
    trimmed(unit.title),
    getUnitTypeLabel(unit.type),
    formatBlock(unit.building),
  ].filter(Boolean);
  return truncate(parts.join(" · "), LIMITS.unitLabel.max);
}

/** "B-204 (Block B)" for the chip. */
export function describeUnitShort(unit) {
  const title = trimmed(unit?.title) || "—";
  const block = formatBlock(unit?.building);
  return block ? `${title} (${block})` : title;
}

/** Polite default message: "… residence B-204 (Urban Villa, Block B). …" */
export function buildUnitMessage(unit) {
  const title = trimmed(unit?.title);
  if (!title) return "";
  const details = [getUnitTypeLabel(unit.type), formatBlock(unit.building)]
    .filter(Boolean)
    .join(", ");
  return INQUIRE_FORM.unit.message(details ? `${title} (${details})` : title);
}

/**
 * POST /contact body. Optional fields are left out when empty; `unitId` and
 * `unitLabel` are only sent for a public unit with a valid id.
 */
export function buildInquiryPayload(values, unit = null) {
  const data = {
    firstName: trimmed(values.firstName),
    lastName: trimmed(values.lastName),
    email: trimmed(values.email),
    message: trimmed(values.message),
    pagePath: INQUIRE_PAGE_PATH,
  };

  const phone = combinePhone(values.phoneCountryCode, values.phoneNumber);
  if (phone) data.phone = phone;

  const residenceType = trimmed(values.residenceType);
  if (residenceType) data.residenceType = residenceType;

  const unitId = unit?._id ?? unit?.id;
  if (unit && isObjectId(unitId)) {
    data.unitId = String(unitId);
    const unitLabel = buildUnitLabel(unit);
    if (unitLabel) data.unitLabel = unitLabel;
  }

  // Honeypot: real visitors never see it. Sent as-is so the server can
  // silently drop bot submissions (it answers 201 either way).
  const website = String(values.website ?? "");
  if (website) data.website = website;

  return data;
}

/**
 * Server `errors[{ field, message }]` (400 "Validation failed") → messages for
 * the visible fields, plus any messages that belong to no visible field.
 */
export function mapServerErrors(errors) {
  const fieldErrors = {};
  const otherMessages = [];
  if (!Array.isArray(errors)) return { fieldErrors, otherMessages };

  for (const item of errors) {
    const field = String(item?.field ?? "")
      .split(".")
      .pop();
    const message = trimmed(item?.message);
    if (!message) continue;
    if (FIELD_ORDER.includes(field)) {
      if (!fieldErrors[field]) fieldErrors[field] = message;
    } else if (field === "unitLabel" || field === "unitId") {
      if (!otherMessages.includes(ERR.unitLabelTooLong)) {
        otherMessages.push(ERR.unitLabelTooLong);
      }
    } else if (!otherMessages.includes(message)) {
      otherMessages.push(message);
    }
  }
  return { fieldErrors, otherMessages };
}
