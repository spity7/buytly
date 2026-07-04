import { z } from "zod";
import { ROLES } from "../../shared/constants.js";
import { PROPERTY_STATUSES } from "../../shared/constants.js";

export const listUsersSchema = z.object({
  page: z.coerce.number().int().positive().optional(),
  limit: z.coerce.number().int().positive().max(100).optional(),
  role: z
    .enum([ROLES.BUYER, ROLES.SELLER, ROLES.AGENT, ROLES.ADMIN])
    .optional(),
  isActive: z.enum(["true", "false"]).optional(),
});

export const userIdSchema = z.object({
  id: z.string().regex(/^[0-9a-fA-F]{24}$/),
});

export const updateUserStatusSchema = z.object({
  isActive: z.boolean(),
});

export const updateUserRoleSchema = z.object({
  role: z.enum([ROLES.BUYER, ROLES.SELLER, ROLES.AGENT, ROLES.ADMIN]),
});

export const moderatePropertySchema = z.object({
  status: z.enum(PROPERTY_STATUSES),
});

export const listAdminPropertiesSchema = z.object({
  page: z.coerce.number().int().positive().optional(),
  limit: z.coerce.number().int().positive().max(100).optional(),
  status: z.enum(PROPERTY_STATUSES).optional(),
});

export const propertyIdSchema = z.object({
  id: z.string().regex(/^[0-9a-fA-F]{24}$/),
});
