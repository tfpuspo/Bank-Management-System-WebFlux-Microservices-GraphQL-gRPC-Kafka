import { FormEvent, useCallback, useEffect, useState } from 'react'
import OpenAccountPage from '@/pages/OpenAccountPage'
import { fetchAccounts } from '@/services/accountService'
import type { AccountResult } from '@/services/accountOpeningService'
import type { MenuComponentProps } from '@/types/menu'

function formatBalance(value: number): string {
  return Number(value).toLocaleString(undefined, {
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  })
}

function formatDate(value: string): string {
  const d = new Date(value)
  return Number.isNaN(d.getTime()) ? value : d.toLocaleString()
}

function statusClass(status: string): string {
  switch (status) {
    case 'ACTIVE':
      return 'bg-emerald-950 text-emerald-400'
    case 'PENDING':
      return 'bg-amber-950 text-amber-400'
    default:
      return 'bg-zinc-800 text-zinc-400'
  }
}

export default function AccountManagementPage({ permissions }: MenuComponentProps) {
  const canOpen = permissions.includes('ACCOUNT_OPEN')
  const canView = canOpen || permissions.includes('ACCOUNT_VIEW')

  const [panelOpen, setPanelOpen] = useState(false)

  const [accounts, setAccounts] = useState<AccountResult[]>([])
  const [search, setSearch] = useState('')
  const [appliedSearch, setAppliedSearch] = useState('')
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const loadAccounts = useCallback(async (term: string) => {
    setLoading(true)
    setError(null)
    try {
      setAccounts(await fetchAccounts(term))
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to load accounts.')
    } finally {
      setLoading(false)
    }
  }, [])

  useEffect(() => {
    if (canView) loadAccounts('')
  }, [canView, loadAccounts])

  const handleSearch = (e: FormEvent<HTMLFormElement>) => {
    e.preventDefault()
    setAppliedSearch(search.trim())
    loadAccounts(search)
  }

  const handleClear = () => {
    setSearch('')
    setAppliedSearch('')
    loadAccounts('')
  }

  // Closing the panel refreshes the list so a newly opened account shows up.
  const closePanel = () => {
    setPanelOpen(false)
    if (canView) loadAccounts(appliedSearch)
  }

  return (
    <div className="w-full">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-bold text-white">Account Management</h1>
        {canOpen && (
          <button
            type="button"
            onClick={() => setPanelOpen(true)}
            className="rounded-lg bg-blue-600 px-4 py-2 text-sm font-bold text-white hover:bg-blue-500"
          >
            Open Account
          </button>
        )}
      </div>

      {!canView && (
        <p className="mt-6 text-sm text-zinc-500">
          You don't hold a permission to view accounts yet.
        </p>
      )}

      {canView && (
        <>
          <form onSubmit={handleSearch} className="mt-6 flex flex-wrap gap-3">
            <input
              type="text"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="Search by account number"
              className="flex-1 min-w-[200px] rounded-lg border border-zinc-700 bg-zinc-900 px-3 py-2 text-sm text-white placeholder-zinc-500 outline-none focus:border-blue-500"
            />
            <button
              type="submit"
              className="rounded-lg bg-zinc-800 px-4 py-2 text-sm font-semibold text-white hover:bg-zinc-700"
            >
              Search
            </button>
            <button
              type="button"
              onClick={handleClear}
              className="rounded-lg px-4 py-2 text-sm font-medium text-zinc-400 hover:text-zinc-200"
            >
              Clear
            </button>
          </form>

          {error && (
            <p className="mt-4 rounded-lg border border-red-900 bg-red-950/50 px-4 py-2.5 text-sm text-red-400">
              {error}
            </p>
          )}

          <div className="mt-6 overflow-x-auto">
            <table className="w-full text-left text-sm">
              <thead>
                <tr className="border-b border-zinc-800 text-zinc-400">
                  <th className="py-2 pr-4 font-semibold">Account number</th>
                  <th className="py-2 pr-4 font-semibold">Customer ID</th>
                  <th className="py-2 pr-4 font-semibold">Type</th>
                  <th className="py-2 pr-4 text-right font-semibold">Balance</th>
                  <th className="py-2 pr-4 font-semibold">Status</th>
                  <th className="py-2 pr-4 font-semibold">Opened</th>
                </tr>
              </thead>
              <tbody>
                {loading && (
                  <tr>
                    <td colSpan={6} className="py-4 text-zinc-500">
                      Loading…
                    </td>
                  </tr>
                )}
                {!loading && accounts.length === 0 && (
                  <tr>
                    <td colSpan={6} className="py-4 text-zinc-500">
                      {appliedSearch
                        ? `No accounts match "${appliedSearch}".`
                        : 'No accounts found.'}
                    </td>
                  </tr>
                )}
                {!loading &&
                  accounts.map((a) => (
                    <tr key={a.id} className="border-b border-zinc-900 text-zinc-200">
                      <td className="py-2 pr-4 font-mono">{a.accountNumber}</td>
                      <td className="py-2 pr-4 font-mono text-xs text-zinc-500">{a.customerId}</td>
                      <td className="py-2 pr-4 text-zinc-400">{a.accountType}</td>
                      <td className="py-2 pr-4 text-right tabular-nums">
                        {formatBalance(a.balance)}
                      </td>
                      <td className="py-2 pr-4">
                        <span
                          className={`rounded px-2 py-0.5 text-xs font-medium ${statusClass(a.status)}`}
                        >
                          {a.status}
                        </span>
                      </td>
                      <td className="py-2 pr-4 text-xs text-zinc-500">{formatDate(a.createdAt)}</td>
                    </tr>
                  ))}
              </tbody>
            </table>
          </div>

          {!loading && accounts.length > 0 && (
            <p className="mt-3 text-xs text-zinc-500">
              {accounts.length} account{accounts.length === 1 ? '' : 's'}
            </p>
          )}
        </>
      )}

      {panelOpen && (
        <div className="fixed inset-0 z-50 flex justify-end">
          <div className="absolute inset-0 bg-black/60" onClick={closePanel} />

          <div className="relative flex h-full w-full max-w-xl flex-col border-l border-zinc-800 bg-zinc-950 shadow-xl">
            <div className="flex items-center justify-between border-b border-zinc-800 px-5 py-4">
              <h2 className="text-lg font-semibold text-white">Open New Account</h2>
              <button
                type="button"
                onClick={closePanel}
                className="text-zinc-400 hover:text-zinc-200"
              >
                ✕
              </button>
            </div>

            <div className="flex-1 overflow-y-auto px-5 py-4">
              <OpenAccountPage permissions={permissions} />
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
