import type { User, UserRole, Customer } from "./user.type";

export interface LoginResponse {
  user: User;
  role: UserRole;
  needPasswordChange?: boolean;
}
export interface VerifyEmailResponse extends LoginResponse {
  customer?: Customer;
}
export interface LoginPayload {
  email: string;
  password: string;
}
export interface RegistrationPayload extends LoginPayload {
  name: string;
  contactNumber?: string;
}
export interface VerifyEmailPayload {
  email: string;
  otp: string;
}
