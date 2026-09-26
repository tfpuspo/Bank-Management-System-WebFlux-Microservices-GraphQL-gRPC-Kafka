import { ReactNode } from "react";

interface HelpOption {
  id: string;
  title: string;
  description: string;
  icon: ReactNode;
}

interface HelpPageProps {
  onBack: () => void;
  onSelectRegister: () => void;
  onSelectOpenAccount: () => void;
}

function OptionCard({
  option,
  onClick,
}: {
  option: HelpOption;
  onClick: () => void;
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      className="flex w-full items-start gap-4 rounded-xl border border-zinc-800 bg-zinc-950 p-5 text-left transition-colors hover:border-zinc-700 hover:bg-zinc-900"
    >
      <span className="flex h-11 w-11 shrink-0 items-center justify-center rounded-lg bg-zinc-800 text-zinc-300">
        {option.icon}
      </span>
      <span>
        <span className="block font-bold text-white">{option.title}</span>
        <span className="mt-1 block text-sm text-zinc-400">
          {option.description}
        </span>
      </span>
    </button>
  );
}

const RegisterIcon = () => (
  <svg
    xmlns="http://www.w3.org/2000/svg"
    viewBox="0 0 24 24"
    fill="none"
    stroke="currentColor"
    strokeWidth={2}
    strokeLinecap="round"
    strokeLinejoin="round"
    className="h-5 w-5"
  >
    <path d="M16 21v-2a4 4 0 0 0-4-4H6a4 4 0 0 0-4 4v2" />
    <circle cx="9" cy="7" r="4" />
    <path d="M19 8v6M22 11h-6" />
  </svg>
);

const OpenAccountIcon = () => (
  <svg
    xmlns="http://www.w3.org/2000/svg"
    viewBox="0 0 24 24"
    fill="none"
    stroke="currentColor"
    strokeWidth={2}
    strokeLinecap="round"
    strokeLinejoin="round"
    className="h-5 w-5"
  >
    <path d="M3 21h18" />
    <path d="M5 21V9l7-5 7 5v12" />
    <path d="M9 21v-6h6v6" />
  </svg>
);

export default function HelpPage({
  onBack,
  onSelectRegister,
  onSelectOpenAccount,
}: HelpPageProps) {
  const options: HelpOption[] = [
    {
      id: "register",
      title: "I want to register",
      description: "You already have an account and want online access",
      icon: <RegisterIcon />,
    },
    {
      id: "open-account",
      title: "I want to open a new bank account",
      description: "You're new here and need an account first",
      icon: <OpenAccountIcon />,
    },
  ];

  return (
    <div className="w-full max-w-xl">
      <button
        type="button"
        onClick={onBack}
        className="mb-10 text-sm font-medium text-zinc-400 hover:text-zinc-200"
      >
        ‹ Back to login
      </button>

      <h1 className="text-3xl font-bold text-white">How can I help?</h1>
      <p className="mt-2 text-zinc-400">
        You can register for online banking or open a new bank account.
      </p>

      <div className="mt-8 space-y-4">
        <OptionCard
          option={options[0]}
          onClick={onSelectRegister}
        />
        <OptionCard
          option={options[1]}
          onClick={onSelectOpenAccount}
        />
      </div>
    </div>
  );
}
