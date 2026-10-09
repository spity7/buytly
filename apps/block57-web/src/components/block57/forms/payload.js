import { customInstance } from "@/lib/api/custom-instance";
import { getApiError } from "@/lib/auth/getApiError";
import { FORM_MESSAGES as MSG } from "./messages";
import { normalizePhone } from "./validation";

/** `topic` of POST /contact (server INQUIRY_TOPICS). */
export const CONTACT_TOPICS = Object.freeze({
  inquiry: "inquiry",
  contact: "contact",
  tour: "tour",
});

const trimmed = (value) => String(value ?? "").trim();

/**
 * Body for POST /contact. Every string is trimmed and empty optional fields
 * are left out (the API only requires `email`); `phone` is normalised to one
 * international number (+233 by default, see normalizePhone). The honeypot
 * (`website`) is sent only when a bot filled it in: the server then answers
 * 201 as usual and drops the submission.
 *
 * @param {{ topic: "inquiry"|"contact"|"tour", pagePath: string,
 *   fields: Record<string, string>, website?: string }} options
 *   `fields`: API field → value, e.g. `{ firstName, lastName, email, phone,
 *   message, residenceType, unitId, unitLabel, fullName, preferredDate,
 *   preferredTime }`.
 */
export function buildContactPayload({ topic, pagePath, fields = {}, website }) {
  const data = {};
  for (const [key, raw] of Object.entries(fields)) {
    const value = key === "phone" ? normalizePhone(raw) : trimmed(raw);
    if (value) data[key] = value;
  }
  if (topic) data.topic = topic;
  if (pagePath) data.pagePath = pagePath;
  if (website) data.website = String(website);
  return data;
}

/** POST /contact. Returns the request promise (with `.cancel()`). */
export function submitContact(payload) {
  return customInstance({ url: "/contact", method: "POST", data: payload });
}

function withStop(text) {
  const value = trimmed(text);
  return !value || /[.!?…]$/.test(value) ? value : `${value}.`;
}

/**
 * Server `errors[{ field, message }]` (400 "Validation failed") → messages for
 * the form's own fields, plus the messages that belong to no visible field.
 */
export function mapServerErrors(errors, fieldNames) {
  const fieldErrors = {};
  const otherMessages = [];
  if (!Array.isArray(errors)) return { fieldErrors, otherMessages };

  for (const item of errors) {
    const field = String(item?.field ?? "")
      .split(".")
      .pop();
    const message = trimmed(item?.message);
    if (!message) continue;
    if (fieldNames.includes(field)) {
      fieldErrors[field] ??= withStop(message);
    } else if (!otherMessages.includes(message)) {
      otherMessages.push(message);
    }
  }
  return { fieldErrors, otherMessages };
}

/** Form-level message after a failed POST /contact (CF7 wording first). */
export function describeSubmitError(error, { hasFieldErrors, otherMessages }) {
  if (!error?.response) return MSG.failed;
  if (hasFieldErrors || otherMessages.length) {
    return [MSG.validationError, ...otherMessages].map(withStop).join(" ");
  }
  if (error.response.status >= 500) return MSG.failed;
  return withStop(getApiError(error, MSG.failed));
}
