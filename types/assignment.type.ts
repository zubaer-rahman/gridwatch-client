import type { Outage } from "./outage.type";
import type { User } from "./user.type";

export interface Assignment {
  id: string;
  operatorId: string;
  operator?: User | null;
  outageId: string;
  outage?: Outage | null;
  notes?: string | null;
  createdAt: string;
  updatedAt: string;
}

export interface CreateAssignmentPayload {
  outageId: string;
  operatorId: string;
  notes?: string;
}
