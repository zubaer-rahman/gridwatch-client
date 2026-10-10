import { apiClient } from "@/lib/apiClient";
import type {
  ApiResponse,
  Area,
  CreateAreaPayload,
  CreateFeederPayload,
  CreateSubstationPayload,
  CreateZonePayload,
  DistributionZone,
  Feeder,
  Substation,
  UpdateAreaPayload,
  UpdateFeederPayload,
  UpdateSubstationPayload,
  UpdateZonePayload,
} from "@/types";

/* Zones */
export function getZones(): Promise<ApiResponse<DistributionZone[]>> {
  return apiClient<ApiResponse<DistributionZone[]>>("/zones");
}

export function getZoneById(
  id: string,
): Promise<ApiResponse<DistributionZone>> {
  return apiClient<ApiResponse<DistributionZone>>(`/zones/${id}`);
}

export function createZone(
  payload: CreateZonePayload,
): Promise<ApiResponse<DistributionZone>> {
  return apiClient<ApiResponse<DistributionZone>>("/zones", {
    method: "POST",
    body: payload,
  });
}

export function updateZone(
  id: string,
  payload: UpdateZonePayload,
): Promise<ApiResponse<DistributionZone>> {
  return apiClient<ApiResponse<DistributionZone>>(`/zones/${id}`, {
    method: "PATCH",
    body: payload,
  });
}

export function deleteZone(id: string): Promise<ApiResponse<null>> {
  return apiClient<ApiResponse<null>>(`/zones/${id}`, {
    method: "DELETE",
  });
}

/* Substations */
export function getSubstations(params?: {
  zoneId?: string;
}): Promise<ApiResponse<Substation[]>> {
  return apiClient<ApiResponse<Substation[]>>("/substations", {
    query: params,
  });
}

export function getSubstationById(
  id: string,
): Promise<ApiResponse<Substation>> {
  return apiClient<ApiResponse<Substation>>(`/substations/${id}`);
}

export function createSubstation(
  payload: CreateSubstationPayload,
): Promise<ApiResponse<Substation>> {
  return apiClient<ApiResponse<Substation>>("/substations", {
    method: "POST",
    body: payload,
  });
}

export function updateSubstation(
  id: string,
  payload: UpdateSubstationPayload,
): Promise<ApiResponse<Substation>> {
  return apiClient<ApiResponse<Substation>>(`/substations/${id}`, {
    method: "PATCH",
    body: payload,
  });
}

export function deleteSubstation(id: string): Promise<ApiResponse<null>> {
  return apiClient<ApiResponse<null>>(`/substations/${id}`, {
    method: "DELETE",
  });
}

/* Feeders */
export function getFeeders(params?: {
  substationId?: string;
}): Promise<ApiResponse<Feeder[]>> {
  return apiClient<ApiResponse<Feeder[]>>("/feeders", {
    query: params,
  });
}

export function getFeederById(id: string): Promise<ApiResponse<Feeder>> {
  return apiClient<ApiResponse<Feeder>>(`/feeders/${id}`);
}

export function createFeeder(
  payload: CreateFeederPayload,
): Promise<ApiResponse<Feeder>> {
  return apiClient<ApiResponse<Feeder>>("/feeders", {
    method: "POST",
    body: payload,
  });
}

export function updateFeeder(
  id: string,
  payload: UpdateFeederPayload,
): Promise<ApiResponse<Feeder>> {
  return apiClient<ApiResponse<Feeder>>(`/feeders/${id}`, {
    method: "PATCH",
    body: payload,
  });
}

export function deleteFeeder(id: string): Promise<ApiResponse<null>> {
  return apiClient<ApiResponse<null>>(`/feeders/${id}`, {
    method: "DELETE",
  });
}

/* Areas */
export function getAreas(params?: {
  feederId?: string;
}): Promise<ApiResponse<Area[]>> {
  return apiClient<ApiResponse<Area[]>>("/areas", {
    query: params,
  });
}

export function getAreaById(id: string): Promise<ApiResponse<Area>> {
  return apiClient<ApiResponse<Area>>(`/areas/${id}`);
}

export function createArea(
  payload: CreateAreaPayload,
): Promise<ApiResponse<Area>> {
  return apiClient<ApiResponse<Area>>("/areas", {
    method: "POST",
    body: payload,
  });
}

export function updateArea(
  id: string,
  payload: UpdateAreaPayload,
): Promise<ApiResponse<Area>> {
  return apiClient<ApiResponse<Area>>(`/areas/${id}`, {
    method: "PATCH",
    body: payload,
  });
}

export function deleteArea(id: string): Promise<ApiResponse<null>> {
  return apiClient<ApiResponse<null>>(`/areas/${id}`, {
    method: "DELETE",
  });
}
