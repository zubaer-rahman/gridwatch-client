export type Role = "ADMIN" | "OPERATOR" | "CUSTOMER";

export interface User {
  id: string;
  name: string;
  email: string;
  role: Role;
  provider: "LOCAL" | "GOOGLE";
  contactNumber?: string | null;
  avatar?: string | null;
  isActive: boolean;
  zoneId?: string | null;
  areaId?: string | null;
  zone?: {
    id: string;
    name: string;
  } | null;
  area?: {
    id: string;
    name: string;
  } | null;
  createdAt: string;
  updatedAt: string;
}

export interface DecodedToken {
  userId: string;
  email: string;
  role: Role;
  exp?: number;
  iat?: number;
}
