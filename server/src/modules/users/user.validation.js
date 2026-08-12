import { z } from "zod";
import { PROPERTY_TYPES } from "../../shared/constants.js";
import { PHONE_COUNTRY_CODES } from "../../shared/phone.js";

const optionalUrl = z
  .string()
  .max(500)
  .optional()
  .transform((val) => val ?? "");

const phoneCountryCodeSchema = z
  .string()
  .regex(/^\+[1-9]\d{0,3}$/, "Invalid country code")
  .refine((value) => PHONE_COUNTRY_CODES.includes(value), {
    message: "Unsupported country code",
  });

const phoneNumberSchema = z
  .string()
  .regex(/^\d{4,15}$/, "Phone number must be 4–15 digits")
  .or(z.literal(""));

export const updateProfileSchema = z
  .object({
    firstName: z.string().min(1).max(50).optional(),
    lastName: z.string().min(1).max(50).optional(),
    phoneCountryCode: phoneCountryCodeSchema.optional(),
    phoneNumber: phoneNumberSchema.optional(),
  })
  .superRefine((data, ctx) => {
    if (
      data.phoneNumber &&
      data.phoneNumber.length > 0 &&
      !data.phoneCountryCode
    ) {
      ctx.addIssue({
        code: z.ZodIssueCode.custom,
        message: "Country code is required when phone number is provided",
        path: ["phoneCountryCode"],
      });
    }
  });

export const updateSocialLinksSchema = z.object({
  instagram: optionalUrl,
  linkedin: optionalUrl,
  website: optionalUrl,
});

export const deleteAccountSchema = z.object({
  password: z.string().min(1),
});

export const updatePreferencesSchema = z.object({
  budgetMin: z.number().min(0).optional(),
  budgetMax: z.number().min(0).optional(),
  locations: z.array(z.string()).optional(),
  propertyTypes: z.array(z.enum(PROPERTY_TYPES)).optional(),
});

export const savedSearchSchema = z.object({
  name: z.string().min(1).max(100),
  filters: z.record(z.unknown()).default({}),
});

export const userIdParamSchema = z.object({
  id: z.string().regex(/^[0-9a-fA-F]{24}$/),
});

export const savedSearchIdParamSchema = z.object({
  id: z.string().regex(/^[0-9a-fA-F]{24}$/),
});
