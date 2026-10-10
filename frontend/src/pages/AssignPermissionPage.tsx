import { FormEvent, useEffect, useMemo, useState } from 'react'
import { assignPermissionToRole } from '@/services/roleService'
import { fetchAlkpsByType } from '@/services/alkpService'
import type { Alkp } from '@/types/alkp'
import type { MenuComponentProps } from '@/types/menu'

export default function AssignPermissionPage({}: MenuComponentProps) {
  const [roleCode, setRoleCode] = useState('')
  const [permissionCode, setPermissionCode] = useState('')
  const [submitting, setSubmitting] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [success, setSuccess] = useState<string | null>(null)

  const [roles, setRoles] = useState<Alkp[]>([])
  const [permissions, setPermissions] = useState<Alkp[]>([])
  const [loading, setLoading] = useState(true)
  const [loadError, setLoadError] = useState<string | null>(null)

  useEffect(() => {
    let cancelled = false
    setLoading(true)
    setLoadError(null)
    Promise.all([fetchAlkpsByType('ROLE'), fetchAlkpsByType('PERMISSION')])
      .then(([r, p]) => {
        if (cancelled) return
        setRoles(r)
        setPermissions(p)
      })
      .catch((err) => {
        if (cancelled) return
        setLoadError(err instanceof Error ? err.message : 'Failed to load roles and permissions.')
      })
      .finally(() => {
        if (!cancelled) setLoading(false)
      })
    return () => {
      cancelled = true
    }
  }, [])

  const roleOptions = useMemo(
    () => [...roles].sort((a, b) => a.label.localeCompare(b.label)),
    [roles]
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
      await assignPermissionToRole(roleCode, permissionCode)
      setSuccess(
        `${permissionCode} granted to ${roleCode}. It applies to every user with this role on their next login.`
      )
      setPermissionCode('')
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to assign permission.')
    } finally {
      setSubmitting(false)
    }
  }

  const selectClass =
    'w-full rounded-lg border border-zinc-700 bg-zinc-900 px-4 py-2.5 text-sm text-white outline-none focus:border-blue-500 disabled:opacity-60'

  return (
    <div className="w-full max-w-md">
      <h1 className="text-2xl font-bold text-white">Assign permission to role</h1>
      <p className="mt-1 text-sm text-zinc-400">
        Granting a permission here takes effect for every subject holding this role on their next
        login — no redeploy needed.
      </p>

      {loadError && (
        <p className="mt-4 rounded-lg border border-red-900 bg-red-950/50 px-4 py-2.5 text-sm text-red-400">
          {loadError}
        </p>
      )}

      <form onSubmit={handleSubmit} className="mt-6 space-y-4">
        <div>
          <label className="mb-1 block text-sm font-semibold text-zinc-200">Role</label>
          <select
            value={roleCode}
            onChange={(e) => {
              setRoleCode(e.target.value)
              setSuccess(null)
            }}
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
              No roles found. Add one under Lookup Values (type ROLE).
            </p>
          )}
        </div>

        <div>
          <label className="mb-1 block text-sm font-semibold text-zinc-200">Permission</label>
          <select
            value={permissionCode}
            onChange={(e) => {
              setPermissionCode(e.target.value)
              setSuccess(null)
            }}
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
          {!loading && !loadError && permissionOptions.length === 0 && (
            <p className="mt-1 text-xs text-zinc-500">
              No permissions found. Add one under Lookup Values (type PERMISSION).
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
            {success}
          </p>
        )}

        <button
          type="submit"
          disabled={submitting || loading}
          className="w-full rounded-lg bg-blue-600 py-2.5 text-sm font-bold text-white hover:bg-blue-500 disabled:cursor-not-allowed disabled:opacity-60"
        >
          {submitting ? 'Granting…' : 'Grant permission'}
        </button>
      </form>
    </div>
  )
}
