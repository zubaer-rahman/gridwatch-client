export interface AuditLog {
  id: string;
  actorId: string;
  action: string;
  entity: string;
  entityId: string;
  previousData?: Record<string, unknown> | null;
  newData?: Record<string, unknown> | null;
  createdAt: string;
}

export interface AuditLogQuery {
  entity?: string;
  action?: string;
  page?: number;
  limit?: number;
}
