import type { ComponentType } from 'react'
import AlkpAdminPage from '@/pages/AlkpAdminPage'
import UserManagementPage from '@/pages/UserManagementPage'
import AccountManagementPage from '@/pages/AccountManagementPage'
import type { Alkp } from '@/types/alkp'
import type { MenuAlkpRow, MenuComponentProps, MenuNode } from '@/types/menu'

export const PAGE_COMPONENTS: Record<string, ComponentType<MenuComponentProps>> = {
  'alkp-admin': AlkpAdminPage,
  'user-management': UserManagementPage,
  'account-management': AccountManagementPage,
}

function toMenuRow(alkp: Alkp): MenuAlkpRow {
  return {
    id: alkp.id,
    label: alkp.label,
    parentId: alkp.parentId,
    code: alkp.code,
    route: alkp.route,
    icon: alkp.icon,
    menuOrder: alkp.menuOrder,
  }
}

function hasGatingPermission(code: string | null, permissions: string[]): boolean {
  return !code || code.trim() === '' || permissions.includes(code)
}

export function buildMenuTree(rawRows: Alkp[], permissions: string[]): MenuNode[] {
  const rows = rawRows.map(toMenuRow)

  const childrenOf = new Map<string | null, MenuAlkpRow[]>()
  for (const row of rows) {
    const list = childrenOf.get(row.parentId) ?? []
    list.push(row)
    childrenOf.set(row.parentId, list)
  }
  for (const list of childrenOf.values()) {
    list.sort((a, b) => (a.menuOrder ?? 0) - (b.menuOrder ?? 0))
  }

  function build(parentId: string | null): MenuNode[] {
    const rowsHere = childrenOf.get(parentId) ?? []
    const nodes: MenuNode[] = []

    for (const row of rowsHere) {
      const children = build(row.id)
      const component = row.route ? (PAGE_COMPONENTS[row.route] ?? null) : null
      const reachable = component !== null && hasGatingPermission(row.code, permissions)

      if (children.length === 0) {
        if (reachable) {
          nodes.push({
            key: row.id,
            label: row.label,
            icon: row.icon,
            permission: row.code,
            component,
            children: [],
          })
        }
        continue
      }

      if (!reachable) {
        nodes.push(...children)
        continue
      }

      nodes.push({
        key: row.id,
        label: row.label,
        icon: row.icon,
        permission: row.code,
        component,
        children,
      })
    }

    return nodes
  }

  return build(null)
}
