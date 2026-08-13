import { z } from "zod";
import {
  PROPERTY_TYPES,
  LISTING_TYPES,
  PROPERTY_STATUSES,
} from "../../shared/constants.js";

const locationSchema = z.object({
  coordinates: z.tuple([z.number(), z.number()]),
  address: z.string().optional(),
  city: z.string().optional(),
  country: z.string().optional(),
});

export const createPropertySchema = z.object({
  title: z.string().min(3).max(200),
  description: z.string().min(10),
  type: z.enum(PROPERTY_TYPES),
  listingType: z.enum(LISTING_TYPES),
  price: z.number().positive(),
  currency: z.string().length(3).optional(),
  location: locationSchema,
  bedrooms: z.number().int().min(0).optional(),
  bathrooms: z.number().min(0).optional(),
  area: z.number().positive().optional(),
  areaUnit: z.string().optional(),
  amenities: z.array(z.string()).optional(),
  status: z.enum(PROPERTY_STATUSES).optional(),
  agentId: z
    .string()
    .regex(/^[0-9a-fA-F]{24}$/)
    .optional(),
});

export const updatePropertySchema = createPropertySchema.partial();

export const listMyPropertiesSchema = z.object({
  page: z.coerce.number().int().positive().optional(),
  limit: z.coerce.number().int().positive().max(100).optional(),
  status: z.enum(PROPERTY_STATUSES).optional(),
  sortBy: z.enum(["price", "createdAt", "viewCount"]).optional(),
  sortOrder: z.enum(["asc", "desc"]).optional(),
});

export const listPropertiesSchema = z.object({
  page: z.coerce.number().int().positive().optional(),
  limit: z.coerce.number().int().positive().max(100).optional(),
  minPrice: z.coerce.number().optional(),
  maxPrice: z.coerce.number().optional(),
  type: z.enum(PROPERTY_TYPES).optional(),
  listingType: z.enum(LISTING_TYPES).optional(),
  status: z.enum(PROPERTY_STATUSES).optional(),
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
