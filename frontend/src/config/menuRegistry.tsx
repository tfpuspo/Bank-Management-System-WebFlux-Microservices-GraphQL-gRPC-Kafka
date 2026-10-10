import type { ComponentType } from 'react'
import AlkpAdminPage from '@/pages/AlkpAdminPage'
import UserManagementPage from '@/pages/UserManagementPage'
import AccountManagementPage from '@/pages/AccountManagementPage'
import type { Alkp } from '@/types/alkp'
import type { MenuAlkpRow, MenuComponentProps, MenuNode } from '@/types/menu'

// Maps a MENU alkp row's `route` field to the component that renders it.
// Adding a genuinely new screen always needs a deploy (code). Deciding where
// it sits in the sidebar, reordering it, or re-gating it to a different
// permission never does — that's all just alkp data a SUPER_ADMIN edits from
// the Lookup Values / Settings screen.
//
// Create Staff User / Assign Role / Assign Permission / Open New Account are
// NOT listed here anymore — they're not destinations, they're actions
// rendered inside UserManagementPage / AccountManagementPage.
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

/**
 * Turns the flat list of MENU alkp rows into a permission-filtered tree.
 *
 * Visibility, computed bottom-up:
 *  - Leaf (no children): visible iff its `route` resolves to a real component
 *    in PAGE_COMPONENTS AND (it has no gating permission OR the subject's
 *    permissions include it). An unimplemented route never renders, even if
 *    the permission is granted.
 *  - Group that is also its own landing page (has a reachable route): shown
 *    as an expandable node with its visible children underneath.
 *  - Pure grouping row (no page of its own, e.g. "Access Control"): NOT shown.
 *    Its visible children are lifted up and shown directly in its place, so the
 *    sidebar has no folder label. A group with no visible children disappears.
 *
 * Same tree, same algorithm, for staff and customers alike.
 */
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
        // Pure grouping folder: skip the folder itself, show its children directly.
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
