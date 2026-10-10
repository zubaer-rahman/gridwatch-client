import type { Role } from "./user.type";

export interface AdminStatistics {
  users: {
    total: number;
    active: number;
  };
  outages: {
    total: number;
    active: number;
  };
  reports: {
    total: number;
    priority: number;
    standard: number;
  };
  revenue: {
    total: number;
  };
}

export interface AdminUserQuery {
  search?: string;
  status?: "ACTIVE" | "INACTIVE";
  role?: Role;
  page?: number;
  limit?: number;
}

export interface AdminUser {
  id: string;
  name: string;
  email: string;
  role: Role;
  isActive: boolean;
  createdAt: string;
  contactNumber?: string | null;
  zoneId?: string | null;
  zone?: {
    id: string;
    name: string;
  } | null;
}

export interface CreateUserInput {
  name: string;
  email: string;
  password: string;
  contactNumber?: string;
  role?: Role;
  zoneId?: string;
}

export interface UpdateUserInput {
  role?: Role;
  zoneId?: string;
  isActive?: boolean;
}
