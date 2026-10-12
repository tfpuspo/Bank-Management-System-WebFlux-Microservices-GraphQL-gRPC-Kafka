import type { ComponentType } from 'react'

export interface MenuComponentProps {
  permissions: string[]
}


export interface MenuAlkpRow {
  id: string
  label: string
  parentId: string | null
  code: string | null 
  route: string | null 
  icon: string | null
  menuOrder: number | null
}


export interface MenuNode {
  key: string
  label: string
  icon: string | null
  permission: string | null
  component: ComponentType<MenuComponentProps> | null 
  children: MenuNode[]
}
