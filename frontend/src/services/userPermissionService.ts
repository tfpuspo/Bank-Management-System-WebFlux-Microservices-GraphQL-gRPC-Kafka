import { graphqlRequest } from '@/lib/graphqlClient'

export type PermissionEffect = 'GRANT' | 'DENY'

export interface UserPermissionOverride {
  permission: string
  effect: PermissionEffect
}

interface OverridesResult {
  userPermissionOverrides: UserPermissionOverride[]
}

const OVERRIDES_QUERY = /* GraphQL */ `
  query UserPermissionOverrides($subjectId: ID!, $subjectType: String!) {
    userPermissionOverrides(subjectId: $subjectId, subjectType: $subjectType) {
      permission
      effect
    }
  }
`

export async function fetchUserPermissionOverrides(
  subjectId: string,
  subjectType: 'CUSTOMER' | 'STAFF'
): Promise<UserPermissionOverride[]> {
  const result = await graphqlRequest<OverridesResult>(OVERRIDES_QUERY, { subjectId, subjectType })
  return result.userPermissionOverrides
}

interface SetResult {
  setUserPermission: boolean
}

const SET_MUTATION = /* GraphQL */ `
  mutation SetUserPermission(
    $subjectId: ID!
    $subjectType: String!
    $permissionCode: String!
    $effect: String!
  ) {
    setUserPermission(
      subjectId: $subjectId
      subjectType: $subjectType
      permissionCode: $permissionCode
      effect: $effect
    )
  }
`

export async function setUserPermission(
  subjectId: string,
  subjectType: 'CUSTOMER' | 'STAFF',
  permissionCode: string,
  effect: PermissionEffect
): Promise<boolean> {
  const result = await graphqlRequest<SetResult>(SET_MUTATION, {
    subjectId,
    subjectType,
    permissionCode,
    effect,
  })
  return result.setUserPermission
}

interface RemoveResult {
  removeUserPermission: boolean
}

const REMOVE_MUTATION = /* GraphQL */ `
  mutation RemoveUserPermission($subjectId: ID!, $subjectType: String!, $permissionCode: String!) {
    removeUserPermission(
      subjectId: $subjectId
      subjectType: $subjectType
      permissionCode: $permissionCode
    )
  }
`

export async function removeUserPermission(
  subjectId: string,
  subjectType: 'CUSTOMER' | 'STAFF',
  permissionCode: string
): Promise<boolean> {
  const result = await graphqlRequest<RemoveResult>(REMOVE_MUTATION, {
    subjectId,
    subjectType,
    permissionCode,
  })
  return result.removeUserPermission
}
