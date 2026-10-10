import { graphqlRequest } from '@/lib/graphqlClient'
import type { Alkp, AlkpInput } from '@/types/alkp'

const ALKP_FIELDS = /* GraphQL */ `
  id
  label
  type
  parentId
  code
  route
  icon
  menuOrder
`

interface AllAlkpsResult {
  allAlkps: Alkp[]
}

const ALL_ALKPS_QUERY = /* GraphQL */ `
  query AllAlkps {
    allAlkps {
      ${ALKP_FIELDS}
    }
  }
`

export async function fetchAllAlkps(): Promise<Alkp[]> {
  const result = await graphqlRequest<AllAlkpsResult>(ALL_ALKPS_QUERY, {})
  return result.allAlkps
}

interface AlkpsByTypeResult {
  alkpsByType: Alkp[]
}

const ALKPS_BY_TYPE_QUERY = /* GraphQL */ `
  query AlkpsByType($type: String!) {
    alkpsByType(type: $type) {
      ${ALKP_FIELDS}
    }
  }
`

export async function fetchAlkpsByType(type: string): Promise<Alkp[]> {
  const result = await graphqlRequest<AlkpsByTypeResult>(ALKPS_BY_TYPE_QUERY, { type })
  return result.alkpsByType
}

// Convenience wrapper — this is what the dashboards call to build the sidebar.
export async function fetchMenuAlkps(): Promise<Alkp[]> {
  return fetchAlkpsByType('MENU')
}

interface SearchAlkpResult {
  searchAlkp: Alkp[]
}

const SEARCH_ALKP_QUERY = /* GraphQL */ `
  query SearchAlkp($type: String, $label: String) {
    searchAlkp(type: $type, label: $label) {
      ${ALKP_FIELDS}
    }
  }
`

export async function searchAlkps(type: string, label: string): Promise<Alkp[]> {
  const result = await graphqlRequest<SearchAlkpResult>(SEARCH_ALKP_QUERY, {
    type: type || null,
    label: label || null,
  })
  return result.searchAlkp
}

interface CreateAlkpResult {
  createAlkp: Alkp
}

const CREATE_ALKP_MUTATION = /* GraphQL */ `
  mutation CreateAlkp($input: AlkpInput!) {
    createAlkp(input: $input) {
      ${ALKP_FIELDS}
    }
  }
`

export async function createAlkp(input: AlkpInput): Promise<Alkp> {
  const result = await graphqlRequest<CreateAlkpResult>(CREATE_ALKP_MUTATION, { input })
  return result.createAlkp
}

interface DeleteAlkpResult {
  deleteAlkp: boolean
}

const DELETE_ALKP_MUTATION = /* GraphQL */ `
  mutation DeleteAlkp($id: ID!) {
    deleteAlkp(id: $id)
  }
`

export async function deleteAlkp(id: string): Promise<boolean> {
  const result = await graphqlRequest<DeleteAlkpResult>(DELETE_ALKP_MUTATION, { id })
  return result.deleteAlkp
}
