import { z } from "zod";

export const createPropertyReviewSchema = z.object({
  rating: z.number().int().min(1).max(5),
  title: z.string().min(1).max(200),
  text: z.string().min(1).max(2000),
});

export const listPropertyReviewsSchema = z.object({
  page: z.coerce.number().int().positive().optional(),
  limit: z.coerce.number().int().positive().max(100).optional(),
});

export const propertyReviewParamsSchema = z.object({
  id: z.string().regex(/^[0-9a-fA-F]{24}$/),
});

export const propertyReviewIdParamsSchema = z.object({
  id: z.string().regex(/^[0-9a-fA-F]{24}$/),
  reviewId: z.string().regex(/^[0-9a-fA-F]{24}$/),
});
