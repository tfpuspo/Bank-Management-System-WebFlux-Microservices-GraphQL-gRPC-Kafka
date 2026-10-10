export const GATEWAY_URL = 'http://localhost:4000/graphql'

interface GraphQLError {
  message: string
}

interface GraphQLResponse<T> {
  data?: T
  errors?: GraphQLError[]
}

let currentToken: string | null = null

export function setAuthToken(token: string | null) {
  currentToken = token
}

export async function graphqlRequest<T>(
  query: string,
  variables: Record<string, unknown>,
  endpoint: string = GATEWAY_URL
): Promise<T> {
  const headers: Record<string, string> = { 'Content-Type': 'application/json' }
  if (currentToken) {
    headers['Authorization'] = `Bearer ${currentToken}`
  }

  const res = await fetch(endpoint, {
    method: 'POST',
    headers,
    body: JSON.stringify({ query, variables }),
  })

  if (!res.ok) {
    throw new Error(`Network error: ${res.status} ${res.statusText}`)
  }

  const json: GraphQLResponse<T> = await res.json()

  if (json.errors && json.errors.length > 0) {
    throw new Error(json.errors[0].message)
  }

  if (!json.data) {
    throw new Error('No data returned from server')
  }

  return json.data
}
