export interface LoginResponse {
  accessToken: string;
  refreshToken: string;
  needPasswordChange: boolean;
  role: string;
}

export interface VerifyEmailResponse {
  accessToken: string;
  refreshToken: string;
}