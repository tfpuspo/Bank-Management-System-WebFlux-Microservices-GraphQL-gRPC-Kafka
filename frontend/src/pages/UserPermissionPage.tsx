import { FormEvent, useCallback, useEffect, useMemo, useState } from 'react'
import { fetchAllUsers, type StaffUserResult } from '@/services/staffService'
import { fetchAlkpsByType } from '@/services/alkpService'
import {
  fetchUserPermissionOverrides,
  removeUserPermission,
  setUserPermission,
  type PermissionEffect,
  type UserPermissionOverride,
} from '@/services/userPermissionService'
import type { Alkp } from '@/types/alkp'
import type { MenuComponentProps } from '@/types/menu'

export default function UserPermissionPage({}: MenuComponentProps) {
  const [subjectType, setSubjectType] = useState<'CUSTOMER' | 'STAFF'>('STAFF')
  // STAFF -> user's id; CUSTOMER -> user's customerId
  const [subjectId, setSubjectId] = useState('')
  const [permissionCode, setPermissionCode] = useState('')
  const [effect, setEffect] = useState<PermissionEffect>('GRANT')

  const [users, setUsers] = useState<StaffUserResult[]>([])
  const [permissions, setPermissions] = useState<Alkp[]>([])
  const [overrides, setOverrides] = useState<UserPermissionOverride[]>([])

  const [loading, setLoading] = useState(true)
  const [submitting, setSubmitting] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [success, setSuccess] = useState<string | null>(null)

  useEffect(() => {
    let cancelled = false
    Promise.all([fetchAllUsers(), fetchAlkpsByType('PERMISSION')])
      .then(([u, p]) => {
        if (cancelled) return
        setUsers(u)
        setPermissions(p)
      })
      .catch((err) => {
        if (!cancelled) setError(err instanceof Error ? err.message : 'Failed to load data.')
      })
      .finally(() => {
        if (!cancelled) setLoading(false)
      })
    return () => {
      cancelled = true
    }
  }, [])

  const loadOverrides = useCallback(async () => {
    if (!subjectId) {
      setOverrides([])
      return
    }
    try {
      const list = await fetchUserPermissionOverrides(subjectId, subjectType)
      setOverrides([...list].sort((a, b) => a.permission.localeCompare(b.permission)))
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to load overrides.')
    }
  }, [subjectId, subjectType])

  useEffect(() => {
    loadOverrides()
  }, [loadOverrides])

  const userOptions = useMemo(
    () =>
      users
        .filter((u) => u.userType === subjectType)
        .map((u) => ({
          key: u.id,
          value: subjectType === 'CUSTOMER' ? (u.customerId ?? '') : u.id,
          label: `${u.username} (${u.email}) — ${u.userId ?? 'no user ID'}`,
        }))
        .filter((o) => o.value !== ''),
    [users, subjectType]
  )

  const permissionOptions = useMemo(
    () => [...permissions].sort((a, b) => a.label.localeCompare(b.label)),
    [permissions]
  )

  const handleSubmit = async (e: FormEvent<HTMLFormElement>) => {
    e.preventDefault()
    setError(null)
    setSuccess(null)
    setSubmitting(true)
    try {
      await setUserPermission(subjectId, subjectType, permissionCode, effect)
      setSuccess(
        `${effect === 'GRANT' ? 'Granted' : 'Denied'} ${permissionCode}. Takes effect on this user's next login.`
      )
      setPermissionCode('')
      await loadOverrides()
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to save.')
    } finally {
      setSubmitting(false)
    }
  }

  const handleRemove = async (permission: string) => {
    setError(null)
    setSuccess(null)
    try {
      await removeUserPermission(subjectId, subjectType, permission)
      setSuccess(`Removed override for ${permission}.`)
      await loadOverrides()
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to remove.')
    }
  }

  const selectClass =
    'w-full rounded-lg border border-zinc-700 bg-zinc-900 px-4 py-2.5 text-sm text-white outline-none focus:border-blue-500 disabled:opacity-60'

  return (
    <div className="w-full max-w-lg">
      <h1 className="text-2xl font-bold text-white">User permissions</h1>
      <p className="mt-1 text-sm text-zinc-400">
        Give one user a permission their role does not have (Grant), or take away one their role
        gives (Deny). Other users with the same role are not affected.
      </p>

      <form onSubmit={handleSubmit} className="mt-6 space-y-4">
        <div>
          <label className="mb-1 block text-sm font-semibold text-zinc-200">User type</label>
          <select
            value={subjectType}
            onChange={(e) => {
              setSubjectType(e.target.value as 'CUSTOMER' | 'STAFF')
              setSubjectId('')
              setPermissionCode('')
              setSuccess(null)
            }}
            className={selectClass}
          >
            <option value="STAFF">STAFF</option>
            <option value="CUSTOMER">CUSTOMER</option>
          </select>
        </div>

        <div>
          <label className="mb-1 block text-sm font-semibold text-zinc-200">User</label>
          <select
            value={subjectId}
            onChange={(e) => {
              setSubjectId(e.target.value)
              setSuccess(null)
            }}
            required
            disabled={loading}
            className={selectClass}
          >
            <option value="">{loading ? 'Loading…' : 'Select user…'}</option>
            {userOptions.map((o) => (
              <option key={o.key} value={o.value}>
                {o.label}
              </option>
            ))}
          </select>
        </div>

        <div>
          <label className="mb-1 block text-sm font-semibold text-zinc-200">Permission</label>
          <select
            value={permissionCode}
            onChange={(e) => setPermissionCode(e.target.value)}
            required
            disabled={loading}
            className={selectClass}
          >
            <option value="">{loading ? 'Loading…' : 'Select permission…'}</option>
            {permissionOptions.map((p) => (
              <option key={p.id} value={p.label}>
                {p.label}
              </option>
            ))}
          </select>
        </div>

        <div>
          <label className="mb-1 block text-sm font-semibold text-zinc-200">Effect</label>
          <select
            value={effect}
            onChange={(e) => setEffect(e.target.value as PermissionEffect)}
            className={selectClass}
          >
            <option value="GRANT">Grant (add to this user)</option>
            <option value="DENY">Deny (remove from this user)</option>
          </select>
        </div>

        {error && (
          <p className="rounded-lg border border-red-900 bg-red-950/50 px-4 py-2.5 text-sm text-red-400">
            {error}
          </p>
        )}
        {success && (
          <p className="rounded-lg border border-emerald-900 bg-emerald-950/50 px-4 py-2.5 text-sm text-emerald-400">
            {success}
          </p>
        )}

        <button
          type="submit"
          disabled={submitting || loading}
          className="w-full rounded-lg bg-blue-600 py-2.5 text-sm font-bold text-white hover:bg-blue-500 disabled:cursor-not-allowed disabled:opacity-60"
        >
          {submitting ? 'Saving…' : 'Save'}
        </button>
      </form>

      {subjectId && (
        <div className="mt-8">
          <h2 className="text-sm font-semibold text-zinc-200">Overrides for the selected user</h2>
          {overrides.length === 0 ? (
            <p className="mt-2 text-sm text-zinc-500">
              None. This user has only their role's permissions.
            </p>
          ) : (
            <ul className="mt-2 divide-y divide-zinc-800 rounded-lg border border-zinc-800">
              {overrides.map((o) => (
                <li
                  key={o.permission}
                  className="flex items-center justify-between px-4 py-2.5 text-sm"
                >
                  <span className="text-white">
                    {o.permission}{' '}
                    <span
                      className={
                        o.effect === 'GRANT'
                          ? 'ml-2 rounded bg-emerald-950 px-2 py-0.5 text-xs text-emerald-400'
                          : 'ml-2 rounded bg-red-950 px-2 py-0.5 text-xs text-red-400'
                      }
                    >
                      {o.effect}
                    </span>
                  </span>
                  <button
                    type="button"
                    onClick={() => handleRemove(o.permission)}
                    className="text-xs font-medium text-zinc-400 hover:text-red-400"
                  >
                    Remove
                  </button>
                </li>
              ))}
            </ul>
          )}
        </div>
      )}
    </div>
  )
}
