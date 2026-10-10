import { graphqlRequest } from '@/lib/graphqlClient'

export interface OpenAccountInput {
  firstName: string
  lastName: string
  dateOfBirth: string
  mobileNumber: string
  email?: string
  nidNumber?: string
  accountType: string
  initialDeposit?: number
  roleCode?: string
}

export interface OpenAccountResult {
  customerId: string
  accountId: string
  accountNumber: string
  roleCode: string | null
}

const OPEN_ACCOUNT_MUTATION = `
  mutation OpenAccount($input: OpenAccountInput!) {
    openAccount(input: $input) {
      customerId
      accountId
      accountNumber
      roleCode
    }
  }
`

export async function openAccount(input: OpenAccountInput): Promise<OpenAccountResult> {
  const result = await graphqlRequest<{ openAccount: OpenAccountResult }>(OPEN_ACCOUNT_MUTATION, {
    input,
  })
  return result.openAccount
}
