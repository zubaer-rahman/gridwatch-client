import { z } from "zod";

export const createZoneSchema = z.object({
  name: z.string().trim().min(2, "Zone name must be at least 2 characters"),
  description: z.string().trim().optional(),
});

export const updateZoneSchema = createZoneSchema.partial();

export const createSubstationSchema = z.object({
  name: z
    .string()
    .trim()
    .min(2, "Substation name must be at least 2 characters"),
  zoneId: z.string().uuid("Please select a valid Distribution Zone"),
});

export const updateSubstationSchema = createSubstationSchema.partial();

export const createFeederSchema = z.object({
  name: z.string().trim().min(2, "Feeder name must be at least 2 characters"),
  substationId: z.string().uuid("Please select a valid Substation"),
});

export const updateFeederSchema = createFeederSchema.partial();

export const createAreaSchema = z.object({
  name: z.string().trim().min(2, "Area name must be at least 2 characters"),
  feederId: z.string().uuid("Please select a valid Feeder line"),
});

export const updateAreaSchema = createAreaSchema.partial();
