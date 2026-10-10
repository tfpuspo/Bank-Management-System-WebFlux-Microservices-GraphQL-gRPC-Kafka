import { FormEvent, useEffect, useMemo, useState } from 'react'
import { assignRole } from '@/services/roleService'
import { fetchAllUsers, type StaffUserResult } from '@/services/staffService'
import { fetchAlkpsByType } from '@/services/alkpService'
import type { Alkp } from '@/types/alkp'
import type { MenuComponentProps } from '@/types/menu'

export default function AssignRolePage({}: MenuComponentProps) {
  const [subjectType, setSubjectType] = useState<'CUSTOMER' | 'STAFF'>('STAFF')
  // For STAFF this is the user's id; for CUSTOMER it is the user's customerId.
  const [subjectId, setSubjectId] = useState('')
  // The role's label, e.g. "BRANCH_MANAGER" — this is what assignRole expects.
  const [roleCode, setRoleCode] = useState('')
  const [submitting, setSubmitting] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [success, setSuccess] = useState(false)

  const [users, setUsers] = useState<StaffUserResult[]>([])
  const [roles, setRoles] = useState<Alkp[]>([])
  const [subjectTypes, setSubjectTypes] = useState<Alkp[]>([])
  const [loading, setLoading] = useState(true)
  const [loadError, setLoadError] = useState<string | null>(null)

  useEffect(() => {
    let cancelled = false
    setLoading(true)
    setLoadError(null)
    Promise.all([fetchAllUsers(), fetchAlkpsByType('ROLE'), fetchAlkpsByType('SUBJECT_TYPE')])
      .then(([u, r, s]) => {
        if (cancelled) return
        setUsers(u)
        setRoles(r)
        setSubjectTypes(s)
      })
      .catch((err) => {
        if (cancelled) return
        setLoadError(err instanceof Error ? err.message : 'Failed to load data.')
      })
      .finally(() => {
        if (!cancelled) setLoading(false)
      })
    return () => {
      cancelled = true
    }
  }, [])

  // Only show users of the selected type. Customers can only be listed once they
  // have registered (that is when their user record, and customerId, exist).
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

  // A role can be assigned if it is not restricted to a subject type (no parent),
  // or if its parent is the selected subject type — same rule the server enforces.
  const roleOptions = useMemo(() => {
    const subjectTypeAlkp = subjectTypes.find(
      (s) => s.label.toUpperCase() === subjectType.toUpperCase()
    )
    return roles
      .filter((r) => !r.parentId || r.parentId === subjectTypeAlkp?.id)
      .sort((a, b) => a.label.localeCompare(b.label))
  }, [roles, subjectTypes, subjectType])

  const handleSubmit = async (e: FormEvent<HTMLFormElement>) => {
    e.preventDefault()
    setError(null)
    setSuccess(false)
    setSubmitting(true)
    try {
      await assignRole(subjectId, subjectType, roleCode)
      setSuccess(true)
      setRoleCode('')
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to assign role.')
    } finally {
      setSubmitting(false)
    }
  }

  const selectClass =
    'w-full rounded-lg border border-zinc-700 bg-zinc-900 px-4 py-2.5 text-sm text-white outline-none focus:border-blue-500 disabled:opacity-60'

  return (
    <div className="w-full max-w-md">
      <h1 className="text-2xl font-bold text-white">Assign role</h1>

      {loadError && (
        <p className="mt-4 rounded-lg border border-red-900 bg-red-950/50 px-4 py-2.5 text-sm text-red-400">
          {loadError}
        </p>
      )}

      <form onSubmit={handleSubmit} className="mt-6 space-y-4">
        <div>
          <label className="mb-1 block text-sm font-semibold text-zinc-200">User type</label>
          <select
            value={subjectType}
            onChange={(e) => {
              setSubjectType(e.target.value as 'CUSTOMER' | 'STAFF')
              setSubjectId('')
              setRoleCode('')
              setSuccess(false)
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
            onChange={(e) => setSubjectId(e.target.value)}
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
          {!loading && !loadError && userOptions.length === 0 && (
            <p className="mt-1 text-xs text-zinc-500">
              No {subjectType.toLowerCase()} users found.
            </p>
          )}
        </div>

        <div>
          <label className="mb-1 block text-sm font-semibold text-zinc-200">Role</label>
          <select
            value={roleCode}
            onChange={(e) => setRoleCode(e.target.value)}
            required
            disabled={loading}
            className={selectClass}
          >
            <option value="">{loading ? 'Loading…' : 'Select role…'}</option>
            {roleOptions.map((r) => (
              <option key={r.id} value={r.label}>
                {r.label}
              </option>
            ))}
          </select>
          {!loading && !loadError && roleOptions.length === 0 && (
            <p className="mt-1 text-xs text-zinc-500">
              No roles available for {subjectType.toLowerCase()} users. Add one under Lookup Values
              (type ROLE).
            </p>
          )}
        </div>

        {error && (
          <p className="rounded-lg border border-red-900 bg-red-950/50 px-4 py-2.5 text-sm text-red-400">
            {error}
          </p>
        )}
        {success && (
          <p className="rounded-lg border border-emerald-900 bg-emerald-950/50 px-4 py-2.5 text-sm text-emerald-400">
            Role assigned. It takes effect the next time this user logs in.
          </p>
        )}

        <button
          type="submit"
          disabled={submitting || loading}
          className="w-full rounded-lg bg-blue-600 py-2.5 text-sm font-bold text-white hover:bg-blue-500 disabled:cursor-not-allowed disabled:opacity-60"
        >
          {submitting ? 'Assigning…' : 'Assign role'}
        </button>
      </form>
    </div>
  )
}
