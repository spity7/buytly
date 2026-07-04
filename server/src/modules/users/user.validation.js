import { z } from "zod";
import { PROPERTY_TYPES } from "../../shared/constants.js";

export const updateProfileSchema = z.object({
  firstName: z.string().min(1).max(50).optional(),
  lastName: z.string().min(1).max(50).optional(),
  phone: z.string().max(20).optional(),
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
