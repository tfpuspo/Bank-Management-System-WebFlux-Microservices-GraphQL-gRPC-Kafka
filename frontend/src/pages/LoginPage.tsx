import { FormEvent, useState } from "react";
import type { LoginFormValues } from "@/types/auth";

interface LoginPageProps {
  onLogin: (values: LoginFormValues) => void;
  onForgotUserId: () => void;
  onForgotPassword: () => void;
  onRegisterNow: () => void;
}

export default function LoginPage({
  onLogin,
  onForgotUserId,
  onForgotPassword,
  onRegisterNow,
}: LoginPageProps) {
  const [userId, setUserId] = useState("");
  const [password, setPassword] = useState("");

  const handleSubmit = (e: FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    onLogin({ userId, password });
  };

  return (
    <div className="w-full max-w-md rounded-2xl border border-zinc-800 bg-zinc-950 p-8">
      <h1 className="text-2xl font-bold text-white">Welcome Back</h1>
      <p className="mt-1 text-sm text-zinc-400">Sign in to your account</p>

      <form onSubmit={handleSubmit} className="mt-8 space-y-5">
        <div>
          <label
            htmlFor="userId"
            className="mb-2 block text-sm font-semibold text-zinc-200"
          >
            User ID
          </label>
          <input
            id="userId"
            type="text"
            value={userId}
            onChange={(e) => setUserId(e.target.value)}
            placeholder="Enter your user ID"
            className="w-full rounded-lg border border-zinc-700 bg-zinc-900 px-4 py-3 text-sm text-white placeholder-zinc-500 outline-none transition-colors focus:border-blue-500"
          />
        </div>

        <div>
          <label
            htmlFor="password"
            className="mb-2 block text-sm font-semibold text-zinc-200"
          >
            Password
          </label>
          <input
            id="password"
            type="password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            placeholder="Enter your password"
            className="w-full rounded-lg border border-zinc-700 bg-zinc-900 px-4 py-3 text-sm text-white placeholder-zinc-500 outline-none transition-colors focus:border-blue-500"
          />
        </div>

        <div className="flex items-center justify-between text-sm">
          <button
            type="button"
            onClick={onForgotUserId}
            className="text-blue-500 hover:text-blue-400"
          >
            Forgot User ID?
          </button>
          <button
            type="button"
            onClick={onForgotPassword}
            className="text-blue-500 hover:text-blue-400"
          >
            Forgot Password?
          </button>
        </div>

        <button
          type="submit"
          className="w-full rounded-lg bg-blue-600 py-3 text-sm font-bold text-white transition-colors hover:bg-blue-500"
        >
          Login
        </button>

        <p className="text-center text-sm text-zinc-400">
          New user?{" "}
          <button
            type="button"
            onClick={onRegisterNow}
            className="font-medium text-blue-500 hover:text-blue-400"
          >
            Register Now
          </button>
        </p>
      </form>
    </div>
  );
}
