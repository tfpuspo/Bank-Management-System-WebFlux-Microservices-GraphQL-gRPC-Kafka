import { graphqlRequest } from '@/lib/graphqlClient'

interface AssignRoleMutationResult {
  assignRole: boolean
}

const ASSIGN_ROLE_MUTATION = /* GraphQL */ `
  mutation AssignRole($subjectId: ID!, $subjectType: String!, $roleCode: String!) {
    assignRole(subjectId: $subjectId, subjectType: $subjectType, roleCode: $roleCode)
  }
`

export async function assignRole(
  subjectId: string,
  subjectType: 'CUSTOMER' | 'STAFF',
  roleCode: string
): Promise<boolean> {
  const result = await graphqlRequest<AssignRoleMutationResult>(ASSIGN_ROLE_MUTATION, {
    subjectId,
    subjectType,
    roleCode,
  })
  return result.assignRole
}

interface AssignPermissionMutationResult {
  assignPermissionToRole: boolean
}

const ASSIGN_PERMISSION_MUTATION = /* GraphQL */ `
  mutation AssignPermissionToRole($roleCode: String!, $permissionCode: String!) {
    assignPermissionToRole(roleCode: $roleCode, permissionCode: $permissionCode)
  }
`

export async function assignPermissionToRole(
  roleCode: string,
  permissionCode: string
): Promise<boolean> {
  const result = await graphqlRequest<AssignPermissionMutationResult>(ASSIGN_PERMISSION_MUTATION, {
    roleCode,
    permissionCode,
  })
  return result.assignPermissionToRole
}
