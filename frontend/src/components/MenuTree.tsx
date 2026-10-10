import { useState } from 'react'
import type { MenuNode } from '@/types/menu'

interface MenuTreeProps {
  nodes: MenuNode[]
  activeKey: string | null
  onSelect: (node: MenuNode) => void
}

function subtreeContainsKey(node: MenuNode, key: string | null): boolean {
  if (!key) return false
  if (node.key === key) return true
  return node.children.some((child) => subtreeContainsKey(child, key))
}

function MenuIcon({ name }: { name: string | null }) {
  const common = {
    width: 16,
    height: 16,
    viewBox: '0 0 24 24',
    fill: 'none',
    stroke: 'currentColor',
    strokeWidth: 2,
    strokeLinecap: 'round' as const,
    strokeLinejoin: 'round' as const,
  }
  switch (name) {
    case 'folder':
      return (
        <svg {...common}>
          <path d="M3 7a2 2 0 0 1 2-2h4l2 2h8a2 2 0 0 1 2 2v8a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V7Z" />
        </svg>
      )
    case 'users':
      return (
        <svg {...common}>
          <path d="M17 21v-2a4 4 0 0 0-4-4H7a4 4 0 0 0-4 4v2" />
          <circle cx="10" cy="7" r="4" />
          <path d="M22 21v-2a4 4 0 0 0-3-3.87" />
          <path d="M16 3.13a4 4 0 0 1 0 7.75" />
        </svg>
      )
    case 'shield':
      return (
        <svg {...common}>
          <path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10Z" />
        </svg>
      )
    case 'bank':
      return (
        <svg {...common}>
          <path d="M3 10 12 4l9 6" />
          <path d="M5 10v9M9 10v9M15 10v9M19 10v9" />
          <path d="M3 21h18" />
        </svg>
      )
    case 'key':
      return (
        <svg {...common}>
          <circle cx="8" cy="15" r="4" />
          <path d="m10.5 12.5 7-7M15 8l2 2M18 5l2 2" />
        </svg>
      )
    case 'list':
      return (
        <svg {...common}>
          <path d="M8 6h13M8 12h13M8 18h13" />
          <path d="M3 6h.01M3 12h.01M3 18h.01" />
        </svg>
      )
    default:
      return (
        <svg {...common}>
          <circle cx="12" cy="12" r="3" />
        </svg>
      )
  }
}

function Chevron({ open }: { open: boolean }) {
  return (
    <svg
      width="14"
      height="14"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth={2}
      strokeLinecap="round"
      strokeLinejoin="round"
      className={`transition-transform ${open ? 'rotate-90' : ''}`}
    >
      <path d="m9 18 6-6-6-6" />
    </svg>
  )
}

function MenuTreeNode({
  node,
  activeKey,
  onSelect,
  depth,
}: {
  node: MenuNode
  activeKey: string | null
  onSelect: (node: MenuNode) => void
  depth: number
}) {
  const hasChildren = node.children.length > 0
  const [open, setOpen] = useState(() => subtreeContainsKey(node, activeKey))
  const isActive = node.key === activeKey
  const paddingLeft = 12 + depth * 16

  if (!hasChildren) {
    return (
      <button
        type="button"
        onClick={() => onSelect(node)}
        style={{ paddingLeft }}
        className={`flex w-full items-center gap-2 rounded-lg py-2 pr-3 text-left text-sm transition-colors ${
          isActive ? 'bg-blue-600 text-white' : 'text-zinc-300 hover:bg-zinc-900'
        }`}
      >
        <MenuIcon name={node.icon} />
        <span className="truncate">{node.label}</span>
      </button>
    )
  }

  return (
    <div>
      <button
        type="button"
        onClick={() => {
          if (node.component) {
            onSelect(node)
          }
          setOpen((prev) => !prev)
        }}
        style={{ paddingLeft }}
        className={`flex w-full items-center gap-2 rounded-lg py-2 pr-3 text-left text-sm transition-colors ${
          isActive ? 'bg-blue-600 text-white' : 'text-zinc-300 hover:bg-zinc-900'
        }`}
      >
        <MenuIcon name={node.icon} />
        <span className="flex-1 truncate">{node.label}</span>
        <Chevron open={open} />
      </button>
      {open && (
        <div className="mt-0.5 space-y-0.5">
          {node.children.map((child) => (
            <MenuTreeNode
              key={child.key}
              node={child}
              activeKey={activeKey}
              onSelect={onSelect}
              depth={depth + 1}
            />
          ))}
        </div>
      )}
    </div>
  )
}

export default function MenuTree({ nodes, activeKey, onSelect }: MenuTreeProps) {
  if (nodes.length === 0) {
    return <p className="px-3 py-2 text-sm text-zinc-500">No permissions granted yet.</p>
  }

  return (
    <nav className="space-y-0.5">
      {nodes.map((node) => (
        <MenuTreeNode
          key={node.key}
          node={node}
          activeKey={activeKey}
          onSelect={onSelect}
          depth={0}
        />
      ))}
    </nav>
  )
}
