import { useState } from "react";
import LoginPage from "@/pages/LoginPage";
import HelpPage from "@/pages/HelpPage";
import VerifyIdentityPage from "@/pages/VerifyIdentityPage";
import OtpVerificationPage from "@/pages/OtpVerificationPage";
import SetCredentialsPage from "@/pages/SetCredentialsPage";
import type { AuthView, LoginFormValues } from "@/types/auth";

export default function App() {
  const [view, setView] = useState<AuthView>("login");
  const [customerId, setCustomerId] = useState<string | null>(null);
  const [mobileNumber, setMobileNumber] = useState<string | null>(null);

  const handleLogin = (values: LoginFormValues) => {
    console.log("Login submitted:", values);
  };

  return (
    <div className="flex min-h-screen items-center justify-center bg-black px-4 py-12">
      {view === "login" && (
        <LoginPage
          onLogin={handleLogin}
          onForgotUserId={() => console.log("Forgot User ID clicked")}
          onForgotPassword={() => console.log("Forgot Password clicked")}
          onRegisterNow={() => setView("help")}
        />
      )}

      {view === "help" && (
        <HelpPage
          onBack={() => setView("login")}
          onSelectRegister={() => setView("verify-identity")}
          onSelectOpenAccount={() => console.log("Selected: open account")}
        />
      )}

      {view === "verify-identity" && (
        <VerifyIdentityPage
          onBack={() => setView("help")}
          onVerified={(id, mobile) => {
            setCustomerId(id);
            setMobileNumber(mobile);
            setView("otp");
          }}
        />
      )}

      {view === "otp" && customerId && mobileNumber && (
        <OtpVerificationPage
          customerId={customerId}
          mobileNumber={mobileNumber}
          onBack={() => setView("verify-identity")}
          onVerified={() => setView("set-credentials")}
        />
      )}

      {view === "set-credentials" && customerId && (
        <SetCredentialsPage
          customerId={customerId}
          onBack={() => setView("otp")}
          onRegistered={() => setView("done")}
        />
      )}

      {view === "done" && (
        <div className="w-full max-w-md rounded-2xl border border-zinc-800 bg-zinc-950 p-8 text-center">
          <h1 className="text-2xl font-bold text-white">You're all set</h1>
          <p className="mt-2 text-sm text-zinc-400">Your account has been created. You can now log in.</p>
          <button
            type="button"
            onClick={() => setView("login")}
            className="mt-6 w-full rounded-lg bg-blue-600 py-3 text-sm font-bold text-white hover:bg-blue-500"
          >
            Go to login
          </button>
        </div>
      )}
    </div>
  );
}