export type AuthView = "login" | "help" | "verify-identity";

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