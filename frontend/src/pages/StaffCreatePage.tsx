import { FormEvent, useState } from 'react'
import { createStaffUser } from '@/services/staffService'
import type { MenuComponentProps } from '@/types/menu'

export default function StaffCreatePage({}: MenuComponentProps) {
  const [username, setUsername] = useState('')
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [submitting, setSubmitting] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [created, setCreated] = useState<{ username: string; userId: string | null } | null>(null)

  const handleSubmit = async (e: FormEvent<HTMLFormElement>) => {
    e.preventDefault()
    setError(null)
    setSubmitting(true)
    try {
      const result = await createStaffUser({ username, email, password })
      setCreated({ username: result.username, userId: result.userId })
      setUsername('')
      setEmail('')
      setPassword('')
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to create staff user.')
    } finally {
      setSubmitting(false)
    }
  }

  return (
    <div className="w-full max-w-md">
      <h1 className="text-2xl font-bold text-white">Create staff user</h1>
      <p className="mt-1 text-sm text-zinc-400">
        A User ID is generated automatically. Use "Assign Role" afterwards to give this user their
        role.
      </p>

      <form onSubmit={handleSubmit} className="mt-6 space-y-4">
        <div>
          <label className="mb-1 block text-sm font-semibold text-zinc-200">Username</label>
          <input
            type="text"
            value={username}
            onChange={(e) => setUsername(e.target.value)}
            required
            className="w-full rounded-lg border border-zinc-700 bg-zinc-900 px-4 py-2.5 text-sm text-white outline-none focus:border-blue-500"
          />
        </div>
        <div>
          <label className="mb-1 block text-sm font-semibold text-zinc-200">Email</label>
          <input
            type="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            required
            className="w-full rounded-lg border border-zinc-700 bg-zinc-900 px-4 py-2.5 text-sm text-white outline-none focus:border-blue-500"
          />
        </div>
        <div>
          <label className="mb-1 block text-sm font-semibold text-zinc-200">Password</label>
          <input
            type="password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            required
            minLength={8}
            className="w-full rounded-lg border border-zinc-700 bg-zinc-900 px-4 py-2.5 text-sm text-white outline-none focus:border-blue-500"
          />
        </div>

        {error && (
          <p className="rounded-lg border border-red-900 bg-red-950/50 px-4 py-2.5 text-sm text-red-400">
            {error}
          </p>
        )}

        <button
          type="submit"
          disabled={submitting}
          className="w-full rounded-lg bg-blue-600 py-2.5 text-sm font-bold text-white hover:bg-blue-500 disabled:cursor-not-allowed disabled:opacity-60"
        >
          {submitting ? 'Creating…' : 'Create staff user'}
        </button>
      </form>

      {created && (
        <div className="mt-6 rounded-lg border border-emerald-900 bg-emerald-950/50 p-4 text-sm text-emerald-300">
          <p className="font-semibold">Staff user "{created.username}" created.</p>
          <p className="mt-1 text-zinc-400">
            Login User ID: <code className="text-emerald-300">{created.userId}</code>
          </p>
          <p className="mt-1 text-zinc-400">
            Share this ID with the staff member. They can log in with it and their password.
          </p>
        </div>
      )}
    </div>
  )
}
