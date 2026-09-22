import { z } from "zod";
import { PROJECT_KINDS, PROPERTY_STATUSES } from "../../shared/constants.js";

const locationSchema = z.object({
  coordinates: z
    .tuple([z.number().min(-180).max(180), z.number().min(-90).max(90)])
    .refine(([lng, lat]) => !(lng === 0 && lat === 0), {
      message: "Map coordinates must be a real location (not 0, 0)",
    }),
  address: z.string().optional(),
  city: z.string().optional(),
  country: z.string().optional(),
});

export const createProjectSchema = z.object({
  title: z.string().min(3).max(200),
  description: z.string().min(10),
  kind: z.enum(PROJECT_KINDS),
  location: locationSchema,
  amenities: z.array(z.string()).optional(),
  virtualTourUrl: z.string().url().max(2000).optional().or(z.literal("")),
  status: z.enum(PROPERTY_STATUSES).optional(),
  agentId: z
    .string()
    .regex(/^[0-9a-fA-F]{24}$/)
    .optional(),
});

export const updateProjectSchema = createProjectSchema.partial();

export const listMyProjectsSchema = z.object({
  page: z.coerce.number().int().positive().optional(),
  limit: z.coerce.number().int().positive().max(100).optional(),
  status: z.enum(PROPERTY_STATUSES).optional(),
  kind: z.enum(PROJECT_KINDS).optional(),
  search: z.string().optional(),
  sortBy: z.enum(["createdAt", "viewCount", "title"]).optional(),
  sortOrder: z.enum(["asc", "desc"]).optional(),
  trashed: z.enum(["true", "false"]).optional(),
});

export const listProjectsSchema = z.object({
  page: z.coerce.number().int().positive().optional(),
  limit: z.coerce.number().int().positive().max(100).optional(),
  kind: z.enum(PROJECT_KINDS).optional(),
  status: z.enum(["active", "sold"]).optional(),
  city: z.string().optional(),
  search: z.string().optional(),
  lat: z.coerce.number().optional(),
  lng: z.coerce.number().optional(),
  radiusKm: z.coerce.number().positive().optional(),
  sortBy: z.enum(["createdAt", "viewCount", "title"]).optional(),
  sortOrder: z.enum(["asc", "desc"]).optional(),
});

export const projectIdSchema = z.object({
  id: z.string().regex(/^[0-9a-fA-F]{24}$/),
});

export const projectMediaIdSchema = z.object({
  id: z.string().regex(/^[0-9a-fA-F]{24}$/),
  mediaId: z.string().regex(/^[0-9a-fA-F]{24}$/),
});

export const reorderProjectMediaSchema = z.object({
  imageIds: z
    .array(z.string().regex(/^[0-9a-fA-F]{24}$/))
    .min(1)
    .max(50),
});
