export interface LoginInput {
  userId: string
  password: string
}

export interface LoginResult {
  token: string
  id: string
  userId: string
  userType: 'CUSTOMER' | 'STAFF'
  customerId: string | null
  roles: string[]
  permissions: string[]
  expiresInSeconds: number
}