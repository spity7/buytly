import { z } from "zod";

const slugValueSchema = z
  .string()
  .min(1)
  .max(50)
  .regex(/^[a-z0-9]+(?:-[a-z0-9]+)*$/, {
    message: "Value must be lowercase letters, numbers, and hyphens",
  });

export const catalogItemIdSchema = z.object({
  id: z.string().regex(/^[0-9a-fA-F]{24}$/),
});

export const createPropertyTypeSchema = z.object({
  value: slugValueSchema,
  label: z.string().min(1).max(80),
  sortOrder: z.number().int().min(0).optional(),
  isActive: z.boolean().optional(),
});

export const updatePropertyTypeSchema = createPropertyTypeSchema
  .partial()
  .refine((data) => Object.keys(data).length > 0, {
    message: "At least one field is required",
  });

export const createAmenitySchema = z.object({
  value: z.string().min(1).max(80),
  label: z.string().min(1).max(80),
  sortOrder: z.number().int().min(0).optional(),
  isActive: z.boolean().optional(),
});

export const updateAmenitySchema = createAmenitySchema
  .partial()
  .refine((data) => Object.keys(data).length > 0, {
    message: "At least one field is required",
  });

export const nearbyPreviewSchema = z.object({
  lat: z.coerce.number().min(-90).max(90),
  lng: z.coerce.number().min(-180).max(180),
});
