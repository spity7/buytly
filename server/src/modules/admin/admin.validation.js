import { z } from "zod";
import {
  ROLES,
  PROPERTY_STATUSES,
  PROPERTY_TYPES,
  LISTING_TYPES,
} from "../../shared/constants.js";

export const listUsersSchema = z.object({
  page: z.coerce.number().int().positive().optional(),
  limit: z.coerce.number().int().positive().max(100).optional(),
  role: z
    .enum([ROLES.BUYER, ROLES.SELLER, ROLES.AGENT, ROLES.ADMIN])
    .optional(),
  isActive: z.enum(["true", "false"]).optional(),
  deleted: z.enum(["true", "false", "all"]).optional(),
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
  type: z.enum(PROPERTY_TYPES).optional(),
  listingType: z.enum(LISTING_TYPES).optional(),
  search: z.string().optional(),
  sortBy: z.enum(["price", "createdAt", "viewCount"]).optional(),
  sortOrder: z.enum(["asc", "desc"]).optional(),
});

export const propertyIdSchema = z.object({
  id: z.string().regex(/^[0-9a-fA-F]{24}$/),
});
