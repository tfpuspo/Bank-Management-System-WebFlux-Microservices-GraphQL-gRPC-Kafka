export type AuthView = "login" | "help" | "verify-identity" | "otp" | "set-credentials" | "done";

export interface LoginFormValues {
  userId: string;
  password: string;
}

export interface IdentityVerificationInput {
  accountNumber: string;
  dateOfBirth: string;
  mobileNumber: string;
}

export interface IdentityVerificationResult {
  verified: boolean;
  customerId: string | null;
  message: string;
}

export interface GenerateOtpRequest {
  customerId: string;
  mobileNumber: string;
}

export interface GenerateOtpResponse {
  success: boolean;
  message: string | null;
  expiresInSeconds: number;
}

export interface VerifyOtpRequest {
  customerId: string;
  otp: string;
}

export interface VerifyOtpResponse {
  verified: boolean;
  message: string | null;
}

export interface RegisterInput {
  customerId: string;
  username: string;
  email: string;
  password: string;
}

export interface RegisterResult {
  id: string;
  username: string;
  email: string;
  createdAt: string;
}