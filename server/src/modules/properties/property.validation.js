import { z } from "zod";
import {
  DEFAULT_CURRENCY,
  PROPERTY_STATUSES,
} from "../../shared/constants.js";

const floorPlanSchema = z.object({
  title: z.string().min(1).max(100),
  area: z
    .number()
    .positive()
    .refine((value) => Math.abs(value * 100 - Math.round(value * 100)) < 1e-8, {
      message: "Area must have at most 2 decimal places",
    })
    .optional(),
  areaUnit: z.string().optional(),
  bedrooms: z.number().int().min(0).optional(),
  bathrooms: z.number().int().min(0).optional(),
  price: z.number().int().min(0).optional(),
  gcsKey: z.string().optional(),
});

const areaSqmSchema = z
  .number()
  .positive()
  .refine((value) => Math.abs(value * 100 - Math.round(value * 100)) < 1e-8, {
    message: "Area must have at most 2 decimal places",
  });

export const createPropertySchema = z.object({
  projectId: z.string().regex(/^[0-9a-fA-F]{24}$/),
  title: z.string().min(3).max(200),
  description: z.string().min(10),
  type: z
    .string()
    .min(1)
    .max(50)
    .regex(/^[a-z0-9]+(?:-[a-z0-9]+)*$/),
  price: z.number().int().positive(),
  currency: z.literal(DEFAULT_CURRENCY).optional(),
  unitLabel: z.string().max(100).optional(),
  sortOrder: z.number().int().min(0).optional(),
  bedrooms: z.number().int().min(0).optional(),
  bathrooms: z.number().int().min(0).optional(),
  area: areaSqmSchema.optional(),
  areaUnit: z.string().optional(),
  amenities: z.array(z.string()).optional(),
  floorPlans: z.array(floorPlanSchema).optional(),
  virtualTourUrl: z.string().url().max(2000).optional().or(z.literal("")),
  status: z.enum(PROPERTY_STATUSES).optional(),
  agentId: z
    .string()
    .regex(/^[0-9a-fA-F]{24}$/)
    .optional(),
});

export const updatePropertySchema = createPropertySchema
  .omit({ projectId: true })
  .partial();

export const listMyPropertiesSchema = z.object({
  page: z.coerce.number().int().positive().optional(),
  limit: z.coerce.number().int().positive().max(100).optional(),
  status: z.enum(PROPERTY_STATUSES).optional(),
  type: z.string().min(1).max(50).optional(),
  projectId: z.string().regex(/^[0-9a-fA-F]{24}$/).optional(),
  search: z.string().optional(),
  sortBy: z.enum(["price", "createdAt", "viewCount"]).optional(),
  sortOrder: z.enum(["asc", "desc"]).optional(),
  trashed: z.enum(["true", "false"]).optional(),
});

export const listPropertiesSchema = z.object({
  page: z.coerce.number().int().positive().optional(),
  limit: z.coerce.number().int().positive().max(100).optional(),
  minPrice: z.coerce.number().optional(),
  maxPrice: z.coerce.number().optional(),
  type: z.string().min(1).max(50).optional(),
  projectId: z.string().regex(/^[0-9a-fA-F]{24}$/).optional(),
  status: z.enum(["active", "sold"]).optional(),
  city: z.string().optional(),
  bedrooms: z.coerce.number().int().optional(),
  search: z.string().optional(),
  lat: z.coerce.number().optional(),
  lng: z.coerce.number().optional(),
  radiusKm: z.coerce.number().positive().optional(),
  sortBy: z.enum(["price", "createdAt", "viewCount"]).optional(),
  sortOrder: z.enum(["asc", "desc"]).optional(),
});

export const propertyIdSchema = z.object({
  id: z.string().regex(/^[0-9a-fA-F]{24}$/),
});

export const mediaIdSchema = z.object({
  id: z.string().regex(/^[0-9a-fA-F]{24}$/),
  mediaId: z.string().regex(/^[0-9a-fA-F]{24}$/),
});

export const reorderPropertyMediaSchema = z.object({
  imageIds: z
    .array(z.string().regex(/^[0-9a-fA-F]{24}$/))
    .min(1)
    .max(50),
});
