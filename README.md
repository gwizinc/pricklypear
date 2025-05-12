# 🌵 Prickly Pear

A modern, **Bun + React** web application that gives separated parents a safe, structured place to communicate.  
Threads, message re-writes, AI summaries, granular read receipts and fine-grained connection controls are all powered by **Supabase** and **OpenAI**.

---

## Table of contents

- [Project overview](#project-overview)
- [Architecture](#architecture)
- [Installation & local setup](#installation--local-setup)
- [Common workflows](#common-workflows)
- [Project scripts](#project-scripts)
- [Folder guide](#folder-guide)
- [Contributing](#contributing)

---

## Project overview

Prickly Pear is a single-page chat application focused on respectful co-parenting communication:

- **Threads** – conversations grouped by topic (travel, education, health, etc.).
- **Connections** – invite, accept, decline or disable contact with other parents.
- **AI assistance** –
  - _review-message_ Edge Function rewrites text in a friendlier tone.
  - _summarize-thread_ Edge Function produces concise, 2-3-sentence recaps.
- **Read receipts** – per-message read tracking and unread counters.
- **Auth & storage** – handled by Supabase (Postgres + Row Level Security).
- **Hot-reloading dev server** – Bun serves `index.html` and rebuilds on save.

The repo contains *both* the React front-end **and** the Supabase Edge Functions that run in Deno on the server side.

---

## Architecture

```
┌────────────┐   HTTP/WebSocket   ┌─────────────────────────┐     RPC      ┌──────────────────┐
│  Browser   │ ─────────────────▶ │  Bun dev / Vercel Edge  │ ───────────▶ │ Supabase (Postgres│
│  React App │                   │ (serves static bundle)  │              │   & Auth)        │
└────────────┘                    └─────────────────────────┘              └──────────────────┘
        ▲                                   ▲   invoke() / REST
        │                                   │
        │           Edge Functions (Deno) ──┘
        │                review-message
        │                summarize-thread
        ▼
   OpenAI API
```

High-level code layout:

- **src/** – React front-end
  - **components/** – UI and headless primitives (Radix + Tailwind)
  - **pages/** – top-level routes rendered by `react-router`
  - **contexts/** – global providers (`AuthContext` wraps Supabase auth)
  - **hooks/** – custom hooks for threads, connections, toast, etc.
  - **services/** – thin data-access layer that talks to Supabase tables and edge functions
  - **integrations/supabase/** – generated typed client
  - **types/** – shared TypeScript models (`Thread`, `Message`, `Connection` …)
- **supabase/functions/** – Edge Functions written in Deno TypeScript
  - **review-message/** – rewrites text in different tones with OpenAI
  - **summarize-thread/** – fetches messages, calls OpenAI, saves summary
- **build.ts** – Bun script that bundles the SPA with Tailwind CSS
- **src/index.tsx** – tiny Bun server that serves `index.html` for any route

---

## Installation & local setup

Prerequisites:

1. **Bun ≥ 1.2**  (https://bun.sh)
2. A Supabase project – grab the Project URL and anon/public key.
3. An OpenAI API key if you want AI features locally.
4. `git` and a modern browser.

Steps:

```bash
# 1. Clone and install deps
$ git clone https://github.com/gwizinc/pricklypear.git
$ cd pricklypear
$ bun install

# 2. Environment (create .env or export vars)
# Only needed when overriding the hard-coded demo keys
SUPABASE_URL=...           # e.g. https://xyzcompany.supabase.co
SUPABASE_ANON_KEY=...
OPENAI_API_KEY=...

# 3. Start the dev server (hot reload)
$ bun run dev
# → http://localhost:3000 (printed in the console)
```

Deploying Edge Functions locally:

```bash
# Requires the Supabase CLI
$ supabase functions serve review-message
$ supabase functions serve summarize-thread
```

> **Pro tip:** The published `SUPABASE_URL` and public key in `src/integrations/supabase/client.ts` point to a demo backend. Swap them for your own project when you are ready.

---

## Project scripts

| Command               | Purpose                               |
| --------------------- | ------------------------------------- |
| `bun run dev`         | Start hot-reload dev server           |
| `bun run build`       | Build optimized bundle to `dist/`     |
| `bun test`            | Run Vitest test suite                 |
| `bun run lint`        | ESLint (React hooks, TypeScript)      |
| `bun run typecheck`   | Strict type checking (no emit)        |
| `bun run ci`          | Lint + typecheck + build (CI helper)  |

---

## Folder guide

```
├─ src/
│  ├─ components/        # UI building blocks
│  ├─ pages/             # Route-level views
│  ├─ hooks/             # Custom React hooks
│  ├─ contexts/          # Global providers (auth, toast…)
│  ├─ services/          # Supabase data helpers
│  ├─ integrations/      # Third-party SDK wrappers
│  └─ types/             # Shared TS types
├─ supabase/functions/   # Deno Edge Functions
├─ build.ts              # Bun bundler script
└─ index.html            # Single-page app entry
```

---

## Contributing

1. Fork & clone.
2. Create a branch (`git checkout -b feat/my-feature`).
3. **Write code + tests**. Run `bun run lint && bun run typecheck` before committing.
4. Push and open a PR. Describe *why*, link any related issues, and keep commits focused.
5. One of the maintainers will review, request changes if needed, and merge.

Style & tooling:

- Follow existing ESLint rules. No Prettier – keep formatting consistent.
- Keep PRs small; large refactors should be split across multiple PRs.
- Tests live next to the code they cover and use Vitest.

Happy hacking! 🌵
