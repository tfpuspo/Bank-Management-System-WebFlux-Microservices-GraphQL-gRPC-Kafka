export interface Alkp {
  id: string
  label: string
  type: string
  parentId: string | null
  code: string | null
  route: string | null
  icon: string | null
  menuOrder: number | null
}

export interface AlkpInput {
  label: string
  type: string
  parentId?: string | null
  code?: string | null
  route?: string | null
  icon?: string | null
  menuOrder?: number | null
}
