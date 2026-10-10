import { graphqlRequest } from '@/lib/graphqlClient'

export interface CreateCustomerInput {
  firstName: string
  lastName: string
  dateOfBirth: string
  mobileNumber: string
  email?: string
  nidNumber: string
}

export interface CustomerResult {
  id: string
  firstName: string
  lastName: string
  dateOfBirth: string
  mobileNumber: string
  email: string | null
  nidNumber: string
  createdAt: string
}

interface CreateCustomerMutationResult {
  createCustomer: CustomerResult
}

const CREATE_CUSTOMER_MUTATION = /* GraphQL */ `
  mutation CreateCustomer($input: CreateCustomerInput!) {
    createCustomer(input: $input) {
      id
      firstName
      lastName
      dateOfBirth
      mobileNumber
      email
      nidNumber
      createdAt
    }
  }
`

export async function createCustomer(input: CreateCustomerInput): Promise<CustomerResult> {
  const result = await graphqlRequest<CreateCustomerMutationResult>(CREATE_CUSTOMER_MUTATION, {
    input,
  })
  return result.createCustomer
}

export interface CreateAccountInput {
  accountNumber: string
  customerId: string
  accountType: 'SAVINGS' | 'CURRENT' | 'FIXED_DEPOSIT'
  initialDeposit?: number
}

export interface AccountResult {
  id: string
  accountNumber: string
  customerId: string
  accountType: string
  balance: number
  status: string
  createdAt: string
}

interface CreateAccountMutationResult {
  createAccount: AccountResult
}

const CREATE_ACCOUNT_MUTATION = /* GraphQL */ `
  mutation CreateAccount($input: CreateAccountInput!) {
    createAccount(input: $input) {
      id
      accountNumber
      customerId
      accountType
      balance
      status
      createdAt
    }
  }
`

export async function createAccount(input: CreateAccountInput): Promise<AccountResult> {
  const result = await graphqlRequest<CreateAccountMutationResult>(CREATE_ACCOUNT_MUTATION, {
    input,
  })
  return result.createAccount
}
