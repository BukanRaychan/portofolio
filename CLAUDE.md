# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

@AGENTS.md

## Critical: Next.js version

This project uses **Next.js 16.2.4** (with React 19.2.4 and Tailwind CSS v4). These are newer than most training data and have breaking changes. Per AGENTS.md, read the relevant guide in `node_modules/next/dist/docs/` (e.g. `01-app/`) before writing or changing any Next.js code, and heed deprecation notices.

## Commands

```bash
npm run dev      # start dev server at http://localhost:3000
npm run build    # production build
npm run start    # serve the production build
npm run lint     # eslint
```

There is no test setup yet.

## Architecture

App Router project. Source lives in `app/`:
- `app/layout.tsx` — root layout; loads Geist fonts and `globals.css`.
- `app/page.tsx` — home route (currently the create-next-app starter).
- `app/globals.css` — Tailwind v4 entry and global styles.

Import alias: `@/*` maps to the repo root (see `tsconfig.json`).

Tailwind v4 is configured via `@tailwindcss/postcss` in `postcss.config.mjs` — there is no `tailwind.config` file.
