import type { Area } from "./grid.type";
import type { User } from "./user.type";

export type OutageStatus =
  | "REPORTED"
  | "ACKNOWLEDGED"
  | "ASSIGNED"
  | "IN_PROGRESS"
  | "RESTORED"
  | "CLOSED";

export type Priority = "LOW" | "MEDIUM" | "HIGH";

export interface OutageAssignment {
  id: string;
  operatorId: string;
  operator?: User | null;
  outageId: string;
  createdAt: string;
  updatedAt: string;
}

export interface OutageReport {
  id: string;
  customerId: string;
  customer?: User | null;
  areaId: string;
  area?: Area | null;
  outageId?: string | null;
  outage?: {
    id: string;
    status: OutageStatus;
    priority: Priority;
    estimatedRestorationTime?: string | null;
    assignments?: {
      operator?: {
        id: string;
        name: string;
        contactNumber?: string | null;
      } | null;
    }[];
  } | null;
  payment?: {
    id: string;
    amount: number;
    status: string;
    transactionId?: string | null;
  } | null;
  description?: string | null;
  isPriority: boolean;
  createdAt: string;
  updatedAt: string;
}

export interface Outage {
  id: string;
  areaId: string;
  area?: Area | null;
  status: OutageStatus;
  priority: Priority;
  description?: string | null;
  estimatedRestorationTime?: string | null;
  restoredAt?: string | null;
  reports?: OutageReport[];
  assignments?: OutageAssignment[];
  createdAt: string;
  updatedAt: string;
  _count?: {
    reports: number;
    assignments: number;
  };
}

export interface CreateOutagePayload {
  areaId: string;
  priority: Priority;
  description?: string;
  estimatedRestorationTime?: string;
}

export interface UpdateOutagePayload {
  status?: OutageStatus;
  priority?: Priority;
  areaId?: string;
  description?: string;
  estimatedRestorationTime?: string;
  restoredAt?: string;
}

export interface OutageFilters {
  status?: OutageStatus;
  priority?: Priority;
  areaId?: string;
  searchTerm?: string;
}
