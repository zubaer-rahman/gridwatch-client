export interface CreateReportPayload {
  areaId: string;
  description?: string;
  isPriority?: boolean;
}

export interface ReportQuery {
  areaId?: string;
  outageId?: string;
  isPriority?: "true" | "false";
}
