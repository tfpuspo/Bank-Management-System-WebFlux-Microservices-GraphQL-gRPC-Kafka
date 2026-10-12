import { graphqlRequest } from '@/lib/graphqlClient'

export interface CreateStaffUserInput {
  username: string
  email: string
  password: string
}

export interface StaffUserResult {
  id: string
  username: string
  email: string
  userId: string | null
  userType: 'CUSTOMER' | 'STAFF'
  customerId: string | null
  createdAt: string
}

interface CreateStaffUserMutationResult {
  createStaffUser: StaffUserResult
}

const CREATE_STAFF_USER_MUTATION = /* GraphQL */ `
  mutation CreateStaffUser($input: CreateStaffUserInput!) {
    createStaffUser(input: $input) {
      id
      username
      email
      userId
      userType
      customerId
      createdAt
    }
  }
`

export async function createStaffUser(input: CreateStaffUserInput): Promise<StaffUserResult> {
  const result = await graphqlRequest<CreateStaffUserMutationResult>(CREATE_STAFF_USER_MUTATION, {
    input,
  })
  return result.createStaffUser
}

interface AllUsersQueryResult {
  allUsers: StaffUserResult[]
}

const ALL_USERS_QUERY = /* GraphQL */ `
  query AllUsers {
    allUsers {
      id
      username
      email
      userId
      userType
      customerId
      createdAt
    }
  }
`

export async function fetchAllUsers(): Promise<StaffUserResult[]> {
  const result = await graphqlRequest<AllUsersQueryResult>(ALL_USERS_QUERY, {})
  return result.allUsers
}
