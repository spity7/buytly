import { z } from "zod";
import { ROLES } from "../../shared/constants.js";
import {
  DEFAULT_PHONE_COUNTRY_CODE,
  PHONE_COUNTRY_CODES,
  applyPhoneFields,
  normalizePhoneNumber,
} from "../../shared/phone.js";

const passwordSchema = z.string().min(8).max(128);

const phoneCountryCodeSchema = z
  .string()
  .regex(/^\+[1-9]\d{0,3}$/)
  .refine((value) => PHONE_COUNTRY_CODES.includes(value), {
    message: "Unsupported country code",
  });

const phoneNumberSchema = z
  .string()
  .regex(/^\d{4,15}$/)
  .or(z.literal(""));

export const registerSchema = z
  .object({
    email: z.string().email(),
    password: passwordSchema,
    confirmPassword: z.string().min(1),
    firstName: z.string().min(1).max(50).optional(),
    lastName: z.string().min(1).max(50).optional(),
    phoneCountryCode: phoneCountryCodeSchema.optional(),
    phoneNumber: phoneNumberSchema.optional(),
    role: z.enum([ROLES.BUYER, ROLES.SELLER, ROLES.AGENT]).default(ROLES.BUYER),
  })
  .refine((data) => data.password === data.confirmPassword, {
    message: "Passwords do not match",
    path: ["confirmPassword"],
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
  })
  .transform(({ confirmPassword: _confirmPassword, ...data }) => {
    const phoneCountryCode =
      data.phoneCountryCode || DEFAULT_PHONE_COUNTRY_CODE;
    const phoneNumber = normalizePhoneNumber(data.phoneNumber);

    return {
      ...data,
      phoneCountryCode: phoneNumber ? phoneCountryCode : undefined,
      phoneNumber: phoneNumber || undefined,
    };
  });

export const loginSchema = z.object({
  email: z.string().email(),
  password: z.string().min(1),
});

export const refreshSchema = z.object({
  refreshToken: z.string().min(1),
});

export const logoutSchema = z.object({
  refreshToken: z.string().min(1),
});

export const forgotPasswordSchema = z.object({
  email: z.string().email(),
});

export const resetPasswordSchema = z.object({
  token: z.string().min(1),
  password: passwordSchema,
});

export const verifyEmailSchema = z.object({
  token: z.string().min(1),
});

export const resendVerificationSchema = z.object({
  email: z.string().email(),
});

export const googleAuthSchema = z.object({
  idToken: z.string().min(1),
  role: z.enum([ROLES.BUYER, ROLES.SELLER, ROLES.AGENT]).optional(),
});

export const changePasswordSchema = z
  .object({
    currentPassword: z.string().min(1),
    newPassword: passwordSchema,
    confirmNewPassword: z.string().min(1),
  })
  .refine((data) => data.newPassword === data.confirmNewPassword, {
    message: "Passwords do not match",
    path: ["confirmNewPassword"],
  })
  .transform(({ confirmNewPassword: _confirmNewPassword, ...data }) => data);
