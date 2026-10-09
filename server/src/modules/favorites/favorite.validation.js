import { z } from "zod";

export const addFavoriteSchema = z.object({
  propertyId: z.string().regex(/^[0-9a-fA-F]{24}$/),
});

export const listFavoritesSchema = z.object({
  page: z.coerce.number().int().positive().optional(),
  limit: z.coerce.number().int().positive().max(100).optional(),
});

export const propertyIdParamSchema = z.object({
  propertyId: z.string().regex(/^[0-9a-fA-F]{24}$/),
});
