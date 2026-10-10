import { z } from "zod";

export const outagePrioritySchema = z.enum(["LOW", "MEDIUM", "HIGH"]);

export const outageStatusSchema = z.enum([
  "REPORTED",
  "ACKNOWLEDGED",
  "ASSIGNED",
  "IN_PROGRESS",
  "RESTORED",
  "CLOSED",
]);

export const createOutageSchema = z.object({
  areaId: z.string().uuid("Please select an area affected by this outage"),
  priority: outagePrioritySchema,
  description: z.string().trim().optional(),
  estimatedRestorationTime: z.string().optional(),
});

export const updateOutageSchema = z.object({
  status: outageStatusSchema.optional(),
  priority: outagePrioritySchema.optional(),
  areaId: z.string().uuid().optional(),
  description: z.string().trim().optional(),
  estimatedRestorationTime: z.string().optional(),
  restoredAt: z.string().optional(),
});
