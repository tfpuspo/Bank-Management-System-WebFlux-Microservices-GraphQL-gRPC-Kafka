import { useEffect, useState } from 'react'
import { fetchAlkpsByType } from '@/services/alkpService'
import { openAccount, type OpenAccountResult } from '@/services/openAccountService'

interface OpenAccountPageProps {
  permissions?: string[]
  onDone?: () => void
}

interface RoleOption {
  id: string
  label: string
}

const ACCOUNT_TYPES = ['SAVINGS', 'CURRENT', 'FIXED_DEPOSIT']

const inputCls =
  'w-full rounded-md border border-gray-600 bg-gray-900 px-3 py-2 text-sm text-gray-100 ' +
  'placeholder-gray-500 [color-scheme:dark] focus:outline-none focus:ring-2 focus:ring-blue-500'
const labelCls = 'mb-1 block text-sm font-medium text-gray-300'
const optionCls = 'bg-gray-900 text-gray-100'

export default function OpenAccountPage({ onDone }: OpenAccountPageProps) {
  const today = new Date().toISOString().slice(0, 10)

  const [firstName, setFirstName] = useState('')
  const [lastName, setLastName] = useState('')
  const [dateOfBirth, setDateOfBirth] = useState('')
  const [mobileNumber, setMobileNumber] = useState('')
  const [email, setEmail] = useState('')
  const [nidNumber, setNidNumber] = useState('')
  const [accountType, setAccountType] = useState('SAVINGS')
  const [initialDeposit, setInitialDeposit] = useState('')
  const [roleCode, setRoleCode] = useState('')
  const [roles, setRoles] = useState<RoleOption[]>([])

  const [submitting, setSubmitting] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [result, setResult] = useState<OpenAccountResult | null>(null)

  useEffect(() => {
    async function loadRoles() {
      try {
        const [subjectTypes, allRoles] = await Promise.all([
          fetchAlkpsByType('SUBJECT_TYPE'),
          fetchAlkpsByType('ROLE'),
        ])
        const customerType = subjectTypes.find((s) => s.label.toUpperCase() === 'CUSTOMER')
        setRoles(
          customerType
            ? allRoles
                .filter((r) => r.parentId === customerType.id)
                .map((r) => ({ id: r.id, label: r.label }))
            : []
        )
      } catch {
        setRoles([])
      }
    }
    loadRoles()
  }, [])

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    setError(null)
    setSubmitting(true)
    try {
      const res = await openAccount({
        firstName: firstName.trim(),
        lastName: lastName.trim(),
        dateOfBirth,
        mobileNumber: mobileNumber.trim(),
        email: email.trim() || undefined,
        nidNumber: nidNumber.trim() || undefined,
        accountType,
        initialDeposit: initialDeposit ? Number(initialDeposit) : undefined,
        roleCode: roleCode || undefined,
      })
      setResult(res)
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to open account')
    } finally {
      setSubmitting(false)
    }
  }

  if (result) {
    return (
      <div className="space-y-4">
        <div className="rounded-md border border-green-700 bg-green-900/30 p-4 text-sm text-green-300">
          <p className="font-semibold">Account opened successfully.</p>
          <p className="mt-2">
            Account number: <span className="font-mono">{result.accountNumber}</span>
          </p>
          <p>
            Customer ID: <span className="font-mono">{result.customerId}</span>
          </p>
          {result.roleCode && <p>Role: {result.roleCode}</p>}
        </div>
        <button
          type="button"
          onClick={() => onDone?.()}
          className="rounded-md bg-blue-600 px-4 py-2 text-sm font-medium text-white hover:bg-blue-700"
        >
          Done
        </button>
      </div>
    )
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <h3 className="text-sm font-semibold text-gray-200">Customer details</h3>

      <div className="grid grid-cols-2 gap-3">
        <div>
          <label className={labelCls}>First name</label>
          <input
            className={inputCls}
            value={firstName}
            onChange={(e) => setFirstName(e.target.value)}
            required
          />
        </div>
        <div>
          <label className={labelCls}>Last name</label>
          <input
            className={inputCls}
            value={lastName}
            onChange={(e) => setLastName(e.target.value)}
            required
          />
        </div>
      </div>

      <div>
        <label className={labelCls}>Date of birth</label>
        <input
          type="date"
          className={inputCls}
          value={dateOfBirth}
          max={today}
          onChange={(e) => setDateOfBirth(e.target.value)}
          required
        />
      </div>

      <div>
        <label className={labelCls}>Mobile number</label>
        <input
          className={inputCls}
          value={mobileNumber}
          onChange={(e) => setMobileNumber(e.target.value)}
          required
        />
      </div>

      <div>
        <label className={labelCls}>Email</label>
        <input
          type="email"
          className={inputCls}
          value={email}
          onChange={(e) => setEmail(e.target.value)}
        />
      </div>

      <div>
        <label className={labelCls}>NID number</label>
        <input
          className={inputCls}
          value={nidNumber}
          onChange={(e) => setNidNumber(e.target.value)}
        />
      </div>

      <h3 className="pt-2 text-sm font-semibold text-gray-200">Account</h3>

      <div className="grid grid-cols-2 gap-3">
        <div>
          <label className={labelCls}>Account type</label>
          <select
            className={inputCls}
            value={accountType}
            onChange={(e) => setAccountType(e.target.value)}
          >
            {ACCOUNT_TYPES.map((t) => (
              <option key={t} value={t} className={optionCls}>
                {t}
              </option>
            ))}
          </select>
        </div>
        <div>
          <label className={labelCls}>Initial deposit</label>
          <input
            type="number"
            min="0"
            step="0.01"
            className={inputCls}
            value={initialDeposit}
            onChange={(e) => setInitialDeposit(e.target.value)}
          />
        </div>
      </div>

      <div>
        <label className={labelCls}>Customer role</label>
        <select className={inputCls} value={roleCode} onChange={(e) => setRoleCode(e.target.value)}>
          <option value="" className={optionCls}>
            No role now
          </option>
          {roles.map((r) => (
            <option key={r.id} value={r.label} className={optionCls}>
              {r.label}
            </option>
          ))}
        </select>
      </div>

      {error && (
        <div className="rounded-md border border-red-700 bg-red-900/30 p-3 text-sm text-red-300">
          {error}
          <p className="mt-1 text-xs">
            Nothing was saved. You can correct the details and try again.
          </p>
        </div>
      )}

      <button
        type="submit"
        disabled={submitting}
        className="w-full rounded-md bg-blue-600 px-4 py-2 text-sm font-medium text-white hover:bg-blue-700 disabled:opacity-60"
      >
        {submitting ? 'Opening…' : 'Open account'}
      </button>
    </form>
  )
}
