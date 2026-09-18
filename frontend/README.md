# Auth Flow

A two-screen login / "how can I help" auth flow, built with React + TypeScript + Tailwind CSS + Vite.

## Getting started

```bash
npm install
npm run dev
```

Then open the URL Vite prints (usually http://localhost:5173).

## Scripts

- `npm run dev` — start the dev server
- `npm run build` — type-check and build for production (output in `dist/`)
- `npm run preview` — preview the production build locally
- `npm run lint` — run ESLint

## Project structure

```
auth-flow/
├── index.html
├── package.json
├── postcss.config.js
├── tailwind.config.js
├── tsconfig.json
├── tsconfig.app.json
├── tsconfig.node.json
├── vite.config.ts
└── src/
    ├── main.tsx          # React DOM entry point
    ├── App.tsx           # Top-level view switcher (login <-> help)
    ├── index.css         # Tailwind directives
    ├── pages/
    │   ├── LoginPage.tsx # "Welcome Back" sign-in screen
    │   └── HelpPage.tsx  # "How can I help?" chooser screen
    └── types/
        └── auth.ts       # Shared types (AuthView, LoginFormValues)
```

## Notes

- The `@/*` import alias points at `src/*` (configured in both `vite.config.ts` and `tsconfig.app.json`).
- `App.tsx` currently just logs form submissions and button clicks to the console — wire `onLogin`, `onSelectRegister`, etc. up to your real API/auth calls and routing (React Router, etc.) as needed.
- Styling uses Tailwind's default dark palette (`zinc-*`, `blue-*`) to match the provided design — no custom theme extension required.
