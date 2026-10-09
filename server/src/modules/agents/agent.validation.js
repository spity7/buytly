import { z } from "zod";

export const updateAgentProfileSchema = z.object({
  licenseNumber: z.string().max(50).optional(),
  agency: z.string().max(100).optional(),
  bio: z.string().max(2000).optional(),
  specialties: z.array(z.string()).optional(),
  city: z.string().max(100).optional(),
});

export const listAgentsSchema = z.object({
  page: z.coerce.number().int().positive().optional(),
  limit: z.coerce.number().int().positive().max(100).optional(),
  city: z.string().optional(),
  specialty: z.string().optional(),
});

export const agentIdSchema = z.object({
  id: z.string().regex(/^[0-9a-fA-F]{24}$/),
});
