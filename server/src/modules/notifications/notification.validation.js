import { z } from "zod";
import { NOTIFICATION_TYPES } from "../../shared/constants.js";

export const listNotificationsSchema = z.object({
  page: z.coerce.number().int().positive().optional(),
  limit: z.coerce.number().int().positive().max(100).optional(),
  unread: z.enum(["true", "false"]).optional(),
  type: z
    .enum([
      NOTIFICATION_TYPES.BOOKING,
      NOTIFICATION_TYPES.TRANSACTION,
      NOTIFICATION_TYPES.PROPERTY,
      NOTIFICATION_TYPES.SYSTEM,
      NOTIFICATION_TYPES.AUTH,
    ])
    .optional(),
});

export const notificationIdSchema = z.object({
  id: z.string().regex(/^[0-9a-fA-F]{24}$/),
});
