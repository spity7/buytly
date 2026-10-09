import { z } from "zod";
import { INQUIRY_TOPICS } from "../../shared/constants.js";

/** Blank strings from untouched optional form fields count as "not provided". */
const blankToUndefined = (value) =>
  typeof value === "string" && value.trim() === "" ? undefined : value;

const optionalField = (schema) =>
  z.preprocess(blankToUndefined, schema.optional());

const CALENDAR_DATE = /^(\d{4})-(\d{2})-(\d{2})$/;

const isCalendarDate = (value) => {
  const match = CALENDAR_DATE.exec(value);
  if (!match) return false;
  const [year, month, day] = match.slice(1).map(Number);
  const date = new Date(Date.UTC(year, month - 1, day));
  return (
    date.getUTCFullYear() === year &&
    date.getUTCMonth() === month - 1 &&
    date.getUTCDate() === day
  );
};

/** The server's current calendar date as YYYY-MM-DD (read on every request). */
const serverToday = () => {
  const now = new Date();
  const pad = (number) => String(number).padStart(2, "0");
  return `${now.getFullYear()}-${pad(now.getMonth() + 1)}-${pad(now.getDate())}`;
};

// YYYY-MM-DD strings compare correctly as plain strings.
const preferredDateSchema = z
  .string()
  .trim()
  .superRefine((value, ctx) => {
    if (!isCalendarDate(value)) {
      ctx.addIssue({
        code: z.ZodIssueCode.custom,
        message: "preferredDate must be a valid date in YYYY-MM-DD format",
      });
    } else if (value < serverToday()) {
      ctx.addIssue({
        code: z.ZodIssueCode.custom,
        message: "preferredDate cannot be in the past",
      });
    }
  });

export const submitContactSchema = z.object({
  // Names are optional: the Block 57 contact form has none, and single-name
  // forms (schedule a tour) send `fullName`, split by the contact service.
  firstName: optionalField(z.string().trim().max(80)),
  lastName: optionalField(z.string().trim().max(80)),
  fullName: optionalField(z.string().trim().max(160)),
  email: z.string().trim().email().max(254),
  message: optionalField(z.string().trim().max(5000)),
  phone: optionalField(z.string().trim().max(40)),
  residenceType: optionalField(z.string().trim().max(80)),
  unitId: optionalField(z.string().regex(/^[0-9a-fA-F]{24}$/)),
  unitLabel: optionalField(z.string().trim().max(80)),
  topic: z.preprocess(
    blankToUndefined,
    z.enum(INQUIRY_TOPICS).default("inquiry"),
  ),
  preferredDate: optionalField(preferredDateSchema),
  preferredTime: optionalField(z.string().trim().max(40)),
  // Site-relative path only (no protocol-relative "//host" values).
  pagePath: optionalField(
    z
      .string()
      .trim()
      .max(300)
      .regex(/^\/(?!\/)\S*$/, "pagePath must be a path starting with /"),
  ),
  // Honeypot — hidden from real visitors. Any value other than "" or null
  // (whitespace, a long URL, a number) marks the request as a bot. It is never
  // rejected here, so a bot always gets the normal 201 and no hint about the
  // field; parsed to a boolean so the value itself is not kept.
  website: z
    .unknown()
    .transform(
      (value) => value !== undefined && value !== null && value !== "",
    ),
});
