import type { Area } from "./grid.type";

export type ScheduleStatus = "UPCOMING" | "ACTIVE" | "COMPLETED" | "CANCELLED";

export interface Schedule {
  id: string;
  areaId: string;
  area?: Area;
  startsAt: string;
  endsAt: string;
  status: ScheduleStatus;
  reason?: string | null;
  createdAt: string;
  updatedAt: string;
  deletedAt?: string | null;
}

export interface CreateSchedulePayload {
  areaId: string;
  startsAt: string;
  endsAt: string;
  reason?: string;
}

export interface UpdateSchedulePayload {
  areaId?: string;
  startsAt?: string;
  endsAt?: string;
  status?: ScheduleStatus;
  reason?: string;
}

export interface ScheduleQuery {
  areaId?: string;
  status?: ScheduleStatus;
  startDate?: string;
  endDate?: string;
  sortBy?: string;
  sortOrder?: "asc" | "desc";
  page?: number;
  limit?: number;
}
