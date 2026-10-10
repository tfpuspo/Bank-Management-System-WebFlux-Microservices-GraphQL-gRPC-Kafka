import MenuTree from '@/components/MenuTree'
import { useMenuTree } from '@/hooks/useMenuTree'

interface StaffDashboardProps {
  username: string
  userId: string | null
  roles: string[]
  permissions: string[]
  onLogout: () => void
}

export default function StaffDashboard({
  username,
  userId,
  roles,
  permissions,
  onLogout,
}: StaffDashboardProps) {
  const { tree, loading, error, activeKey, setActiveKey, active } = useMenuTree(permissions)

  return (
    <div className="flex min-h-screen w-full bg-black text-white">
      <aside className="w-64 flex-shrink-0 border-r border-zinc-800 p-4">
        <div className="mb-6">
          <p className="text-sm text-zinc-400">Signed in as</p>
          <p className="font-semibold">{userId ?? username}</p>
          <p className="mt-1 text-xs text-zinc-500">{roles.join(', ') || 'No role assigned yet'}</p>
        </div>

        {loading && <p className="px-3 py-2 text-sm text-zinc-500">Loading menu…</p>}
        {error && <p className="px-3 py-2 text-sm text-red-400">{error}</p>}
        {!loading && !error && (
          <MenuTree
            nodes={tree}
            activeKey={activeKey}
            onSelect={(node) => setActiveKey(node.key)}
          />
        )}

        <button
          type="button"
          onClick={onLogout}
          className="mt-8 w-full rounded-lg px-3 py-2 text-left text-sm text-red-400 hover:bg-zinc-900"
        >
          Log out
        </button>
      </aside>

      <main className="flex-1 overflow-y-auto p-8">
        {active?.component ? (
          <active.component permissions={permissions} />
        ) : (
          !loading && !error && <p className="text-zinc-500">Nothing to show yet.</p>
        )}
      </main>
    </div>
  )
}
