import { graphqlRequest } from '@/lib/graphqlClient'

export interface Me {
  id: string
  username: string
  email: string
  userType: string
  customerId: string | null
  userId: string | null
  roles: string[]
  permissions: string[]
}

interface MeResult {
  me: Me | null
}

const ME_QUERY = /* GraphQL */ `
  query Me {
    me {
      id
      username
      email
      userType
      customerId
      userId
      roles
      permissions
    }
  }
`

export async function fetchMe(): Promise<Me | null> {
  const result = await graphqlRequest<MeResult>(ME_QUERY, {})
  return result.me
}
