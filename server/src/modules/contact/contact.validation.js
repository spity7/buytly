import { z } from "zod";

/** Blank strings from untouched optional form fields count as "not provided". */
const optionalField = (schema) =>
  z.preprocess(
    (value) =>
      typeof value === "string" && value.trim() === "" ? undefined : value,
    schema.optional(),
  );

export const submitContactSchema = z.object({
  firstName: z.string().trim().min(1).max(80),
  lastName: z.string().trim().min(1).max(80),
  email: z.string().trim().email().max(254),
  message: z.string().trim().min(10).max(5000),
  phone: optionalField(z.string().trim().max(40)),
  residenceType: optionalField(z.string().trim().max(80)),
  unitId: optionalField(z.string().regex(/^[0-9a-fA-F]{24}$/)),
  unitLabel: optionalField(z.string().trim().max(80)),
  // Site-relative path only (no protocol-relative "//host" values).
  pagePath: optionalField(
    z
      .string()
      .trim()
      .max(300)
      .regex(/^\/(?!\/)\S*$/, "pagePath must be a path starting with /"),
  ),
  // Honeypot — hidden from real visitors; any value marks the request as a bot.
  website: z.string().trim().max(200).optional(),
});
