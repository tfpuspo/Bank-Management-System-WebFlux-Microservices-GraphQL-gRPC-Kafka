import { useState } from 'react'
import LoginPage from '@/pages/LoginPage'
import HelpPage from '@/pages/HelpPage'
import VerifyIdentityPage from '@/pages/VerifyIdentityPage'
import OtpVerificationPage from '@/pages/OtpVerificationPage'
import SetCredentialsPage from '@/pages/SetCredentialsPage'
import StaffDashboard from '@/components/StaffDashboard'
import CustomerDashboard from '@/components/CustomerDashboard'
import { login } from '@/services/authService'
import { fetchMe, type Me } from '@/services/meService'
import { setAuthToken } from '@/lib/graphqlClient'
import type { AuthView, LoginFormValues } from '@/types/auth'

export default function App() {
  const [view, setView] = useState<AuthView>('login')
  const [customerId, setCustomerId] = useState<string | null>(null)
  const [mobileNumber, setMobileNumber] = useState<string | null>(null)
  const [registeredUserId, setRegisteredUserId] = useState<string | null>(null)
  const [me, setMe] = useState<Me | null>(null)
  const [loginError, setLoginError] = useState<string | null>(null)

  const handleLogin = async (values: LoginFormValues) => {
    setLoginError(null)
    try {
      const result = await login({ userId: values.userId, password: values.password })
      setAuthToken(result.token)

      const meResult = await fetchMe()
      setMe(meResult)
      setView('dashboard')
    } catch (err) {
      setLoginError(err instanceof Error ? err.message : 'Login failed')
    }
  }

  const handleLogout = () => {
    setAuthToken(null)
    setMe(null)
    setView('login')
  }

  if (view === 'dashboard' && me) {
    return me.userType === 'CUSTOMER' ? (
      <CustomerDashboard
        username={me.username}
        userId={me.userId}
        permissions={me.permissions}
        onLogout={handleLogout}
      />
    ) : (
      <StaffDashboard
        username={me.username}
        userId={me.userId}
        roles={me.roles}
        permissions={me.permissions}
        onLogout={handleLogout}
      />
    )
  }

  return (
    <div className="flex min-h-screen items-center justify-center bg-black px-4 py-12">
      {view === 'login' && (
        <div className="w-full max-w-md">
          <LoginPage
            onLogin={handleLogin}
            onForgotUserId={() => console.log('Forgot User ID clicked')}
            onForgotPassword={() => console.log('Forgot Password clicked')}
            onRegisterNow={() => setView('help')}
          />
          {loginError && (
            <p className="mt-4 rounded-lg border border-red-900 bg-red-950/50 px-4 py-2.5 text-sm text-red-400">
              {loginError}
            </p>
          )}
        </div>
      )}

      {view === 'help' && (
        <HelpPage
          onBack={() => setView('login')}
          onSelectRegister={() => setView('verify-identity')}
          onSelectOpenAccount={() => console.log('Selected: open account')}
        />
      )}

      {view === 'verify-identity' && (
        <VerifyIdentityPage
          onBack={() => setView('help')}
          onVerified={(id, mobile) => {
            setCustomerId(id)
            setMobileNumber(mobile)
            setView('otp')
          }}
        />
      )}

      {view === 'otp' && customerId && mobileNumber && (
        <OtpVerificationPage
          customerId={customerId}
          mobileNumber={mobileNumber}
          onBack={() => setView('verify-identity')}
          onVerified={() => setView('set-credentials')}
        />
      )}

      {view === 'set-credentials' && customerId && (
        <SetCredentialsPage
          customerId={customerId}
          onBack={() => setView('otp')}
          onRegistered={(userId) => {
            setRegisteredUserId(userId)
            setView('done')
          }}
        />
      )}

      {view === 'done' && (
        <div className="w-full max-w-md rounded-2xl border border-zinc-800 bg-zinc-950 p-8 text-center">
          <h1 className="text-2xl font-bold text-white">You're all set</h1>
          <p className="mt-2 text-sm text-zinc-400">
            Your account has been created. Use this User ID to log in:
          </p>
          <p className="mt-4 rounded-lg border border-emerald-900 bg-emerald-950/50 px-4 py-3 text-xl font-bold tracking-wider text-emerald-300">
            {registeredUserId}
          </p>
          <p className="mt-2 text-xs text-zinc-500">
            Please note it down — you'll need it every time you sign in.
          </p>
          <button
            type="button"
            onClick={() => {
              setRegisteredUserId(null)
              setView('login')
            }}
            className="mt-6 w-full rounded-lg bg-blue-600 py-3 text-sm font-bold text-white hover:bg-blue-500"
          >
            Go to login
          </button>
        </div>
      )}
    </div>
  )
}
