import { useState } from 'react'
import type { MenuComponentProps } from '@/types/menu'
import StaffCreatePage from '@/pages/StaffCreatePage'
import AssignRolePage from '@/pages/AssignRolePage'
import AssignPermissionPage from '@/pages/AssignPermissionPage'
import UserPermissionPage from '@/pages/UserPermissionPage'

interface Tab {
  key: string
  label: string
  permission: string
  Component: (props: MenuComponentProps) => JSX.Element
}

const TABS: Tab[] = [
  {
    key: 'create-staff',
    label: 'Create Staff User',
    permission: 'STAFF_USER_CREATE',
    Component: StaffCreatePage,
  },
  {
    key: 'assign-role',
    label: 'Assign Role',
    permission: 'STAFF_ROLE_ASSIGN',
    Component: AssignRolePage,
  },
  {
    key: 'assign-permission',
    label: 'Assign Permission',
    permission: 'PERMISSION_ASSIGN',
    Component: AssignPermissionPage,
  },
  {
    key: 'user-permission',
    label: 'User Permissions',
    permission: 'PERMISSION_ASSIGN',
    Component: UserPermissionPage,
  },
]

export default function UserManagementPage({ permissions }: MenuComponentProps) {
  const visibleTabs = TABS.filter((tab) => permissions.includes(tab.permission))
  const [activeKey, setActiveKey] = useState(visibleTabs[0]?.key ?? '')

  const active = visibleTabs.find((tab) => tab.key === activeKey) ?? visibleTabs[0]

  return (
    <div className="w-full">
      <h1 className="text-2xl font-bold text-white">User Management</h1>

      {visibleTabs.length === 0 && (
        <p className="mt-4 text-sm text-zinc-500">
          You don't hold any permissions for this screen yet.
        </p>
      )}

      {visibleTabs.length > 0 && (
        <>
          <div className="mt-6 flex gap-1 border-b border-zinc-800">
            {visibleTabs.map((tab) => (
              <button
                key={tab.key}
                type="button"
                onClick={() => setActiveKey(tab.key)}
                className={
                  tab.key === active?.key
                    ? 'border-b-2 border-blue-500 px-4 py-2.5 text-sm font-semibold text-white'
                    : 'border-b-2 border-transparent px-4 py-2.5 text-sm font-medium text-zinc-400 hover:text-zinc-200'
                }
              >
                {tab.label}
              </button>
            ))}
          </div>

          <div className="mt-6">{active && <active.Component permissions={permissions} />}</div>
        </>
      )}
    </div>
  )
}
