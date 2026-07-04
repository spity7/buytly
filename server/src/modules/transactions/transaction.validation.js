import { z } from "zod";
import {
  TRANSACTION_TYPES,
  TRANSACTION_STATUSES,
} from "../../shared/constants.js";

export const createTransactionSchema = z.object({
  propertyId: z.string().regex(/^[0-9a-fA-F]{24}$/),
  type: z.enum(TRANSACTION_TYPES),
  amount: z.number().positive(),
  currency: z.string().length(3).optional(),
  notes: z.string().max(2000).optional(),
});

export const updateTransactionStatusSchema = z.object({
  status: z.enum(["approved", "completed", "cancelled"]),
  notes: z.string().max(2000).optional(),
});

export const listTransactionsSchema = z.object({
  page: z.coerce.number().int().positive().optional(),
  limit: z.coerce.number().int().positive().max(100).optional(),
  status: z.enum(TRANSACTION_STATUSES).optional(),
});

export const transactionIdSchema = z.object({
  id: z.string().regex(/^[0-9a-fA-F]{24}$/),
});
