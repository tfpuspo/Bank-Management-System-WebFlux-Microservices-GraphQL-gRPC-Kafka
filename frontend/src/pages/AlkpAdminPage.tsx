import { FormEvent, useEffect, useMemo, useState } from 'react'
import { createAlkp, deleteAlkp, fetchAllAlkps, searchAlkps } from '@/services/alkpService'
import type { Alkp } from '@/types/alkp'
import type { MenuComponentProps } from '@/types/menu'

const EMPTY_FORM = {
  label: '',
  type: '',
  code: '',
  route: '',
  icon: '',
  menuOrder: '',
}

export default function AlkpAdminPage({ permissions }: MenuComponentProps) {
  const canManage = permissions.includes('ALKP_MANAGE')

  const [items, setItems] = useState<Alkp[]>([])
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const [searchType, setSearchType] = useState('')
  const [searchLabel, setSearchLabel] = useState('')

  const [panelOpen, setPanelOpen] = useState(false)
  const [form, setForm] = useState(EMPTY_FORM)
  const [parentType, setParentType] = useState('')
  const [parentId, setParentId] = useState('')
  const [creating, setCreating] = useState(false)

  const loadAll = async () => {
    setLoading(true)
    setError(null)
    try {
      const data = await fetchAllAlkps()
      setItems(data)
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to load lookup values.')
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    loadAll()
  }, [])

  const types = useMemo(() => Array.from(new Set(items.map((item) => item.type))).sort(), [items])

  const parentOptions = useMemo(
    () => items.filter((item) => item.type === parentType),
    [items, parentType]
  )

  const handleSearch = async (e: FormEvent<HTMLFormElement>) => {
    e.preventDefault()
    setLoading(true)
    setError(null)
    try {
      const data = await searchAlkps(searchType.trim(), searchLabel.trim())
      setItems(data)
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Search failed.')
    } finally {
      setLoading(false)
    }
  }

  const resetForm = () => {
    setForm(EMPTY_FORM)
    setParentType('')
    setParentId('')
  }

  const openPanel = () => {
    resetForm()
    setPanelOpen(true)
  }

  const closePanel = () => {
    setPanelOpen(false)
    resetForm()
  }

  const handleCreate = async (e: FormEvent<HTMLFormElement>) => {
    e.preventDefault()
    setCreating(true)
    setError(null)
    try {
      await createAlkp({
        label: form.label.trim(),
        type: form.type.trim(),
        parentId: parentId || null,
        code: form.code.trim() || null,
        route: form.route.trim() || null,
        icon: form.icon.trim() || null,
        menuOrder: form.menuOrder.trim() ? Number(form.menuOrder.trim()) : null,
      })
      closePanel()
      await loadAll()
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to create lookup value.')
    } finally {
      setCreating(false)
    }
  }

  const handleDelete = async (id: string) => {
    setError(null)
    try {
      await deleteAlkp(id)
      setItems((prev) => prev.filter((item) => item.id !== id))
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to delete lookup value.')
    }
  }

  return (
    <div className="w-full">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-bold text-white">Lookup values (ALKP)</h1>
        {canManage && (
          <button
            type="button"
            onClick={openPanel}
            className="rounded-lg bg-blue-600 px-4 py-2 text-sm font-bold text-white hover:bg-blue-500"
          >
            Create
          </button>
        )}
      </div>

      <form onSubmit={handleSearch} className="mt-6 flex flex-wrap gap-3">
        <input
          type="text"
          value={searchType}
          onChange={(e) => setSearchType(e.target.value)}
          placeholder="Type"
          className="flex-1 min-w-[160px] rounded-lg border border-zinc-700 bg-zinc-900 px-3 py-2 text-sm text-white placeholder-zinc-500 outline-none focus:border-blue-500"
        />
        <input
          type="text"
          value={searchLabel}
          onChange={(e) => setSearchLabel(e.target.value)}
          placeholder="Label"
          className="flex-1 min-w-[160px] rounded-lg border border-zinc-700 bg-zinc-900 px-3 py-2 text-sm text-white placeholder-zinc-500 outline-none focus:border-blue-500"
        />
        <button
          type="submit"
          className="rounded-lg bg-zinc-800 px-4 py-2 text-sm font-semibold text-white hover:bg-zinc-700"
        >
          Search
        </button>
        <button
          type="button"
          onClick={() => {
            setSearchType('')
            setSearchLabel('')
            loadAll()
          }}
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
              <th className="py-2 pr-4 font-semibold">Label</th>
              <th className="py-2 pr-4 font-semibold">Type</th>
              <th className="py-2 pr-4 font-semibold">Code</th>
              <th className="py-2 pr-4 font-semibold">Route</th>
              <th className="py-2 pr-4 font-semibold">Icon</th>
              <th className="py-2 pr-4 font-semibold">Order</th>
              <th className="py-2 pr-4 font-semibold">Parent</th>
              <th className="py-2 pr-4 font-semibold"></th>
            </tr>
          </thead>
          <tbody>
            {loading && (
              <tr>
                <td colSpan={8} className="py-4 text-zinc-500">
                  Loading…
                </td>
              </tr>
            )}
            {!loading && items.length === 0 && (
              <tr>
                <td colSpan={8} className="py-4 text-zinc-500">
                  No lookup values found.
                </td>
              </tr>
            )}
            {!loading &&
              items.map((item) => (
                <tr key={item.id} className="border-b border-zinc-900 text-zinc-200">
                  <td className="py-2 pr-4">{item.label}</td>
                  <td className="py-2 pr-4 text-zinc-400">{item.type}</td>
                  <td className="py-2 pr-4 text-zinc-400">{item.code ?? '—'}</td>
                  <td className="py-2 pr-4 text-zinc-400">{item.route ?? '—'}</td>
                  <td className="py-2 pr-4 text-zinc-400">{item.icon ?? '—'}</td>
                  <td className="py-2 pr-4 text-zinc-400">{item.menuOrder ?? '—'}</td>
                  <td className="py-2 pr-4 text-xs text-zinc-500">
                    {items.find((p) => p.id === item.parentId)?.label ?? '—'}
                  </td>
                  <td className="py-2 pr-4 text-right">
                    {canManage && (
                      <button
                        type="button"
                        onClick={() => handleDelete(item.id)}
                        className="text-xs font-medium text-red-400 hover:text-red-300"
                      >
                        Delete
                      </button>
                    )}
                  </td>
                </tr>
              ))}
          </tbody>
        </table>
      </div>

      {panelOpen && (
        <div className="fixed inset-0 z-50 flex justify-end">
          <div className="absolute inset-0 bg-black/60" onClick={closePanel} />

          <div className="relative flex h-full w-full max-w-md flex-col border-l border-zinc-800 bg-zinc-950 shadow-xl">
            <div className="flex items-center justify-between border-b border-zinc-800 px-5 py-4">
              <h2 className="text-lg font-semibold text-white">Create lookup value</h2>
              <button
                type="button"
                onClick={closePanel}
                className="text-zinc-400 hover:text-zinc-200"
              >
                ✕
              </button>
            </div>

            <form
              id="create-alkp-form"
              onSubmit={handleCreate}
              className="flex-1 overflow-y-auto px-5 py-4"
            >
              <div className="space-y-4">
                <div>
                  <label className="mb-1 block text-xs font-semibold text-zinc-400">Label</label>
                  <input
                    type="text"
                    value={form.label}
                    onChange={(e) => setForm((f) => ({ ...f, label: e.target.value }))}
                    placeholder="SUPER_ADMIN"
                    required
                    className="w-full rounded-lg border border-zinc-700 bg-zinc-900 px-3 py-2 text-sm text-white placeholder-zinc-500 outline-none focus:border-blue-500"
                  />
                </div>

                <div>
                  <label className="mb-1 block text-xs font-semibold text-zinc-400">
                    Type (ROLE / PERMISSION / MENU / SUBJECT_TYPE)
                  </label>
                  <input
                    type="text"
                    value={form.type}
                    onChange={(e) => setForm((f) => ({ ...f, type: e.target.value }))}
                    placeholder="ROLE"
                    required
                    className="w-full rounded-lg border border-zinc-700 bg-zinc-900 px-3 py-2 text-sm text-white placeholder-zinc-500 outline-none focus:border-blue-500"
                  />
                </div>

                <div>
                  <label className="mb-1 block text-xs font-semibold text-zinc-400">
                    Code (ROLE prefix / MENU permission)
                  </label>
                  <input
                    type="text"
                    value={form.code}
                    onChange={(e) => setForm((f) => ({ ...f, code: e.target.value.toUpperCase() }))}
                    placeholder="SA"
                    maxLength={40}
                    className="w-full rounded-lg border border-zinc-700 bg-zinc-900 px-3 py-2 text-sm text-white placeholder-zinc-500 outline-none focus:border-blue-500"
                  />
                </div>

                <div>
                  <label className="mb-1 block text-xs font-semibold text-zinc-400">
                    Route (MENU only)
                  </label>
                  <input
                    type="text"
                    value={form.route}
                    onChange={(e) => setForm((f) => ({ ...f, route: e.target.value }))}
                    placeholder="user-management"
                    className="w-full rounded-lg border border-zinc-700 bg-zinc-900 px-3 py-2 text-sm text-white placeholder-zinc-500 outline-none focus:border-blue-500"
                  />
                </div>

                <div className="flex gap-3">
                  <div className="flex-1">
                    <label className="mb-1 block text-xs font-semibold text-zinc-400">
                      Icon (MENU only)
                    </label>
                    <input
                      type="text"
                      value={form.icon}
                      onChange={(e) => setForm((f) => ({ ...f, icon: e.target.value }))}
                      placeholder="users"
                      className="w-full rounded-lg border border-zinc-700 bg-zinc-900 px-3 py-2 text-sm text-white placeholder-zinc-500 outline-none focus:border-blue-500"
                    />
                  </div>
                  <div className="w-24">
                    <label className="mb-1 block text-xs font-semibold text-zinc-400">
                      Order (MENU only)
                    </label>
                    <input
                      type="number"
                      value={form.menuOrder}
                      onChange={(e) => setForm((f) => ({ ...f, menuOrder: e.target.value }))}
                      placeholder="1"
                      className="w-full rounded-lg border border-zinc-700 bg-zinc-900 px-3 py-2 text-sm text-white placeholder-zinc-500 outline-none focus:border-blue-500"
                    />
                  </div>
                </div>

                <div className="border-t border-zinc-800 pt-4">
                  <label className="mb-1 block text-xs font-semibold text-zinc-400">
                    Parent type (optional)
                  </label>
                  <select
                    value={parentType}
                    onChange={(e) => {
                      setParentType(e.target.value)
                      setParentId('')
                    }}
                    className="w-full rounded-lg border border-zinc-700 bg-zinc-900 px-3 py-2 text-sm text-white outline-none focus:border-blue-500"
                  >
                    <option value="">None</option>
                    {types.map((t) => (
                      <option key={t} value={t}>
                        {t}
                      </option>
                    ))}
                  </select>
                </div>

                {parentType && (
                  <div>
                    <label className="mb-1 block text-xs font-semibold text-zinc-400">Parent</label>
                    <select
                      value={parentId}
                      onChange={(e) => setParentId(e.target.value)}
                      className="w-full rounded-lg border border-zinc-700 bg-zinc-900 px-3 py-2 text-sm text-white outline-none focus:border-blue-500"
                    >
                      <option value="">Select…</option>
                      {parentOptions.map((opt) => (
                        <option key={opt.id} value={opt.id}>
                          {opt.label}
                        </option>
                      ))}
                    </select>
                  </div>
                )}
              </div>
            </form>

            <div className="flex items-center justify-end gap-3 border-t border-zinc-800 px-5 py-4">
              <button
                type="button"
                onClick={closePanel}
                className="rounded-lg px-4 py-2 text-sm font-medium text-zinc-400 hover:text-zinc-200"
              >
                Cancel
              </button>
              <button
                type="submit"
                form="create-alkp-form"
                disabled={creating}
                className="rounded-lg bg-blue-600 px-4 py-2 text-sm font-bold text-white hover:bg-blue-500 disabled:cursor-not-allowed disabled:opacity-60"
              >
                {creating ? 'Creating…' : 'Create'}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
