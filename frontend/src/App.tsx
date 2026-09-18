import { useState } from "react";
import LoginPage from "@/pages/LoginPage";
import HelpPage from "@/pages/HelpPage";
import VerifyIdentityPage from "@/pages/VerifyIdentityPage";
import type { AuthView, LoginFormValues } from "@/types/auth";

export default function App() {
  const [view, setView] = useState<AuthView>("login");

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
          onVerified={(customerId) => {
            console.log("Identity verified, customerId:", customerId);
            // TODO next: show OTP screen, then final register form
          }}
        />
      )}
    </div>
  );
}