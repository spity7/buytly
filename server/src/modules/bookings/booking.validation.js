import { z } from "zod";
import { BOOKING_STATUSES } from "../../shared/constants.js";

export const createBookingSchema = z.object({
  propertyId: z.string().regex(/^[0-9a-fA-F]{24}$/),
  scheduledAt: z.coerce
    .date()
    .refine((d) => d > new Date(), "Scheduled date must be in the future"),
  message: z.string().max(1000).optional(),
});

export const updateBookingStatusSchema = z.object({
  status: z.enum(["approved", "rejected", "completed"]),
  agentNotes: z.string().max(1000).optional(),
});

export const listBookingsSchema = z.object({
  page: z.coerce.number().int().positive().optional(),
  limit: z.coerce.number().int().positive().max(100).optional(),
  status: z.enum(BOOKING_STATUSES).optional(),
});

export const bookingIdSchema = z.object({
  id: z.string().regex(/^[0-9a-fA-F]{24}$/),
});
