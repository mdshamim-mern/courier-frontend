export type UserRole = "ADMIN" | "COURIER" | "CUSTOMER";
export type UserStatus = "ACTIVE" | "BLOCKED" | "DELETED";

export interface User {
  id: string;
  name: string;
  email: string;
  role: UserRole;
  status: UserStatus;
  contactNumber?: string | null;
  imageUrl?: string | null;
  createdAt: string;
  updatedAt: string;
}

export interface Customer {
  id: string;
  userId: string;
  contactNumber?: string | null;
  address?: string | null;
  user?: User;
  createdAt: string;
  updatedAt: string;
}