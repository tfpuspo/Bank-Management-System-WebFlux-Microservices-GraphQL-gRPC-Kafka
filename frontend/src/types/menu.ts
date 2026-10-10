import type { ComponentType } from 'react'

export interface MenuComponentProps {
  permissions: string[]
}

// Raw shape of a type === 'MENU' row from authZ's alkp table, as returned by
// alkpsByType('MENU'). parentId is how submenus nest — a row whose parentId
// points at another MENU row's id renders as that row's child.
export interface MenuAlkpRow {
  id: string
  label: string
  parentId: string | null
  code: string | null // gating permission label; null/blank = always visible
  route: string | null // lookup key into PAGE_COMPONENTS; null = pure group node
  icon: string | null
  menuOrder: number | null
}

// A MenuAlkpRow after permission-filtering and tree assembly — what the
// sidebar actually renders.
export interface MenuNode {
  key: string
  label: string
  icon: string | null
  permission: string | null
  component: ComponentType<MenuComponentProps> | null // null for a pure group node
  children: MenuNode[]
}
