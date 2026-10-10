import { FormEvent, useEffect, useState } from 'react'
import { generateOtp, verifyOtp } from '@/services/registrationService'

interface OtpVerificationPageProps {
  customerId: string
  mobileNumber: string
  onBack: () => void
  onVerified: () => void
}

export default function OtpVerificationPage({
  customerId,
  mobileNumber,
  onBack,
  onVerified,
}: OtpVerificationPageProps) {
  const [otp, setOtp] = useState('')
  const [error, setError] = useState<string | null>(null)
  const [info, setInfo] = useState<string | null>(null)
  const [submitting, setSubmitting] = useState(false)
  const [sending, setSending] = useState(false)
  const [secondsLeft, setSecondsLeft] = useState(0)

  const requestOtp = async () => {
    setSending(true)
    setError(null)
    try {
      const result = await generateOtp({ customerId, mobileNumber })
      if (result.success) {
        setSecondsLeft(result.expiresInSeconds)
        setInfo(`Code sent to ${mobileNumber}`)
      } else {
        setError(result.message ?? 'Could not send OTP, please try again')
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Something went wrong. Please try again.')
    } finally {
      setSending(false)
    }
  }

  useEffect(() => {
    requestOtp()
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [])

  useEffect(() => {
    if (secondsLeft <= 0) return
    const timer = setInterval(() => setSecondsLeft((s) => Math.max(0, s - 1)), 1000)
    return () => clearInterval(timer)
  }, [secondsLeft])

  const handleSubmit = async (e: FormEvent<HTMLFormElement>) => {
    e.preventDefault()
    setError(null)
    setSubmitting(true)
    try {
      const result = await verifyOtp({ customerId, otp })
      if (result.verified) {
        onVerified()
      } else {
        setError(result.message ?? 'OTP verification failed')
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Something went wrong. Please try again.')
    } finally {
      setSubmitting(false)
    }
  }

  return (
    <div className="w-full max-w-md rounded-2xl border border-zinc-800 bg-zinc-950 p-8">
      <button
        type="button"
        onClick={onBack}
        className="mb-6 text-sm font-medium text-zinc-400 hover:text-zinc-200"
      >
        ‹ Back
      </button>

      <h1 className="text-2xl font-bold text-white">Enter verification code</h1>
      <p className="mt-1 text-sm text-zinc-400">We sent a one-time code to {mobileNumber}.</p>

      <form onSubmit={handleSubmit} className="mt-8 space-y-5">
        <div>
          <label htmlFor="otp" className="mb-2 block text-sm font-semibold text-zinc-200">
            One-time code
          </label>
          <input
            id="otp"
            type="text"
            inputMode="numeric"
            maxLength={4}
            value={otp}
            onChange={(e) => setOtp(e.target.value.replace(/\D/g, ''))}
            placeholder="1234"
            required
            className="w-full rounded-lg border border-zinc-700 bg-zinc-900 px-4 py-3 text-center text-lg tracking-[0.5em] text-white placeholder-zinc-500 outline-none transition-colors focus:border-blue-500"
          />
        </div>

        {info && !error && (
          <p className="text-xs text-zinc-500">
            {info}
            {secondsLeft > 0 && ` · expires in ${secondsLeft}s`}
          </p>
        )}

        {error && (
          <p className="rounded-lg border border-red-900 bg-red-950/50 px-4 py-2.5 text-sm text-red-400">
            {error}
          </p>
        )}

        <button
          type="submit"
          disabled={submitting || otp.length < 4}
          className="w-full rounded-lg bg-blue-600 py-3 text-sm font-bold text-white transition-colors hover:bg-blue-500 disabled:cursor-not-allowed disabled:opacity-60"
        >
          {submitting ? 'Verifying…' : 'Continue'}
        </button>

        <button
          type="button"
          onClick={requestOtp}
          disabled={sending || secondsLeft > 0}
          className="w-full text-sm font-medium text-zinc-400 hover:text-zinc-200 disabled:cursor-not-allowed disabled:opacity-50"
        >
          {sending ? 'Sending…' : secondsLeft > 0 ? `Resend in ${secondsLeft}s` : 'Resend code'}
        </button>
      </form>
    </div>
  )
}
