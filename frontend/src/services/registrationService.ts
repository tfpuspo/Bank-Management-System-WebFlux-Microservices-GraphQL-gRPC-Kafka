import { graphqlRequest } from "@/lib/graphqlClient";
import type { IdentityVerificationInput, IdentityVerificationResult } from "@/types/auth";

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