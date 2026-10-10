import { useEffect, useState } from 'react'
import { buildMenuTree } from '@/config/menuRegistry'
import { fetchMenuAlkps } from '@/services/alkpService'
import type { MenuNode } from '@/types/menu'

function findFirstReachable(nodes: MenuNode[]): MenuNode | null {
  for (const node of nodes) {
    if (node.component) return node
    const child = findFirstReachable(node.children)
    if (child) return child
  }
  return null
}

function findByKey(nodes: MenuNode[], key: string | null): MenuNode | null {
  if (!key) return null
  for (const node of nodes) {
    if (node.key === key) return node
    const found = findByKey(node.children, key)
    if (found) return found
  }
  return null
}

interface UseMenuTreeResult {
  tree: MenuNode[]
  loading: boolean
  error: string | null
  activeKey: string | null
  setActiveKey: (key: string) => void
  active: MenuNode | null
}

// Shared by both StaffDashboard and CustomerDashboard so their menu-resolution
// logic can never drift apart — only the surrounding shell (header, branding)
// differs between the two. Same tree, same algorithm, for every user type.
export function useMenuTree(permissions: string[]): UseMenuTreeResult {
  const [tree, setTree] = useState<MenuNode[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [activeKey, setActiveKey] = useState<string | null>(null)

  useEffect(() => {
    let cancelled = false
    setLoading(true)
    setError(null)
    fetchMenuAlkps()
      .then((rows) => {
        if (cancelled) return
        const builtTree = buildMenuTree(rows, permissions)
        setTree(builtTree)
        setActiveKey(findFirstReachable(builtTree)?.key ?? null)
      })
      .catch((err) => {
        if (cancelled) return
        setError(err instanceof Error ? err.message : 'Failed to load menu.')
      })
      .finally(() => {
        if (!cancelled) setLoading(false)
      })
    return () => {
      cancelled = true
    }
    // permissions are resolved once at login and don't change for the life of
    // this session, so this only needs to run once per mount.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [])

  return { tree, loading, error, activeKey, setActiveKey, active: findByKey(tree, activeKey) }
}
