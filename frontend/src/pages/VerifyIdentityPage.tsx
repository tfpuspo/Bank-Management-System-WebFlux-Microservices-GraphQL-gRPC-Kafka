import { FormEvent, useState } from "react";
import type { IdentityVerificationInput } from "@/types/auth";
import { verifyIdentity } from "@/services/registrationService";

interface VerifyIdentityPageProps {
  onBack: () => void;
  onVerified: (customerId: string) => void;
}

export default function VerifyIdentityPage({ onBack, onVerified }: VerifyIdentityPageProps) {
  const [values, setValues] = useState<IdentityVerificationInput>({
    accountNumber: "",
    dateOfBirth: "",
    mobileNumber: "",
  });
  const [error, setError] = useState<string | null>(null);
  const [submitting, setSubmitting] = useState(false);

  const update =
    (field: keyof IdentityVerificationInput) =>
    (e: React.ChangeEvent<HTMLInputElement>) =>
      setValues((prev) => ({ ...prev, [field]: e.target.value }));

  const handleSubmit = async (e: FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setError(null);
    setSubmitting(true);

    try {
      const result = await verifyIdentity(values);

      if (result.verified && result.customerId) {
        onVerified(result.customerId);
      } else {
        setError(result.message);
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : "Something went wrong. Please try again.");
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="w-full max-w-md rounded-2xl border border-zinc-800 bg-zinc-950 p-8">
      <button type="button" onClick={onBack} className="mb-6 text-sm font-medium text-zinc-400 hover:text-zinc-200">
        ‹ Back
      </button>

      <h1 className="text-2xl font-bold text-white">Verify your identity</h1>
      <p className="mt-1 text-sm text-zinc-400">
        Enter your existing account details to continue.
      </p>

      <form onSubmit={handleSubmit} className="mt-8 space-y-5">
        <div>
          <label htmlFor="accountNumber" className="mb-2 block text-sm font-semibold text-zinc-200">
            Account number
          </label>
          <input
            id="accountNumber"
            type="text"
            value={values.accountNumber}
            onChange={update("accountNumber")}
            placeholder="1000001234"
            required
            className="w-full rounded-lg border border-zinc-700 bg-zinc-900 px-4 py-3 text-sm text-white placeholder-zinc-500 outline-none transition-colors focus:border-blue-500"
          />
        </div>

        <div>
          <label htmlFor="dateOfBirth" className="mb-2 block text-sm font-semibold text-zinc-200">
            Date of birth
          </label>
          <input
            id="dateOfBirth"
            type="date"
            value={values.dateOfBirth}
            onChange={update("dateOfBirth")}
            required
            className="w-full rounded-lg border border-zinc-700 bg-zinc-900 px-4 py-3 text-sm text-white outline-none transition-colors focus:border-blue-500"
          />
        </div>

        <div>
          <label htmlFor="mobileNumber" className="mb-2 block text-sm font-semibold text-zinc-200">
            Registered mobile number
          </label>
          <input
            id="mobileNumber"
            type="tel"
            value={values.mobileNumber}
            onChange={update("mobileNumber")}
            placeholder="+8801712345678"
            required
            className="w-full rounded-lg border border-zinc-700 bg-zinc-900 px-4 py-3 text-sm text-white placeholder-zinc-500 outline-none transition-colors focus:border-blue-500"
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
          className="w-full rounded-lg bg-blue-600 py-3 text-sm font-bold text-white transition-colors hover:bg-blue-500 disabled:cursor-not-allowed disabled:opacity-60"
        >
          {submitting ? "Verifying…" : "Continue"}
        </button>
      </form>
    </div>
  );
}