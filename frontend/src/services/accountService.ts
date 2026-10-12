import { graphqlRequest } from '@/lib/graphqlClient'
import type { AccountResult } from '@/services/accountOpeningService'

interface AccountsQueryResult {
  accounts: AccountResult[]
}

const ACCOUNTS_QUERY = /* GraphQL */ `
  query Accounts($accountNumber: String) {
    accounts(accountNumber: $accountNumber) {
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


export async function fetchAccounts(accountNumber?: string): Promise<AccountResult[]> {
  const term = accountNumber?.trim()
  const result = await graphqlRequest<AccountsQueryResult>(ACCOUNTS_QUERY, {
    accountNumber: term ? term : null,
  })
  return result.accounts
}
