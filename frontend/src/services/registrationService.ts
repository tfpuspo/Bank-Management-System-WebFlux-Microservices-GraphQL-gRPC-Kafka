import { graphqlRequest } from "@/lib/graphqlClient";
import type {
  GenerateOtpRequest,
  GenerateOtpResponse,
  IdentityVerificationInput,
  IdentityVerificationResult,
  RegisterInput,
  RegisterResult,
  VerifyOtpRequest,
  VerifyOtpResponse,
} from "@/types/auth";

interface VerifyIdentityResult {
  verifyIdentity: IdentityVerificationResult;
}

const VERIFY_IDENTITY_MUTATION = /* GraphQL */ `
  mutation VerifyIdentity($input: IdentityVerificationInput!) {
    verifyIdentity(input: $input) {
      verified
      customerId
      message
    }
  }
`;

export async function verifyIdentity(
  input: IdentityVerificationInput
): Promise<IdentityVerificationResult> {
  const result = await graphqlRequest<VerifyIdentityResult>(VERIFY_IDENTITY_MUTATION, {
    input,
  });
  return result.verifyIdentity;
}

interface GenerateOtpMutationResult {
  generateOtp: GenerateOtpResponse;
}

const GENERATE_OTP_MUTATION = /* GraphQL */ `
  mutation GenerateOtp($input: GenerateOtpRequest!) {
    generateOtp(input: $input) {
      success
      message
      expiresInSeconds
    }
  }
`;

export async function generateOtp(input: GenerateOtpRequest): Promise<GenerateOtpResponse> {
  const result = await graphqlRequest<GenerateOtpMutationResult>(GENERATE_OTP_MUTATION, { input });
  return result.generateOtp;
}

interface VerifyOtpMutationResult {
  verifyOtp: VerifyOtpResponse;
}

const VERIFY_OTP_MUTATION = /* GraphQL */ `
  mutation VerifyOtp($input: VerifyOtpRequest!) {
    verifyOtp(input: $input) {
      verified
      message
    }
  }
`;

export async function verifyOtp(input: VerifyOtpRequest): Promise<VerifyOtpResponse> {
  const result = await graphqlRequest<VerifyOtpMutationResult>(VERIFY_OTP_MUTATION, { input });
  return result.verifyOtp;
}

interface RegisterMutationResult {
  register: RegisterResult;
}

const REGISTER_MUTATION = /* GraphQL */ `
  mutation Register($input: RegisterInput!) {
    register(input: $input) {
      id
      username
      email
      createdAt
    }
  }
`;

export async function registerUser(input: RegisterInput): Promise<RegisterResult> {
  const result = await graphqlRequest<RegisterMutationResult>(REGISTER_MUTATION, { input });
  return result.register;
}