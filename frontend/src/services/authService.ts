import { graphqlRequest } from '@/lib/graphqlClient'
import type { LoginInput, LoginResult } from '@/types/session'

interface LoginMutationResult {
  login: LoginResult
}

const LOGIN_MUTATION = /* GraphQL */ `
  mutation Login($input: LoginInput!) {
    login(input: $input) {
      token
      id
      userId
      userType
      customerId
      roles
      permissions
      expiresInSeconds
    }
  }
`

export async function login(input: LoginInput): Promise<LoginResult> {
  const result = await graphqlRequest<LoginMutationResult>(LOGIN_MUTATION, { input })
  return result.login
}
