# Graph Report - .  (2026-07-01)

## Corpus Check
- Corpus is ~12,665 words - fits in a single context window. You may not need a graph.

## Summary
- 218 nodes · 434 edges · 12 communities (8 shown, 4 thin omitted)
- Extraction: 98% EXTRACTED · 2% INFERRED · 0% AMBIGUOUS · INFERRED: 10 edges (avg confidence: 0.87)
- Token cost: 0 input · 0 output

## Community Hubs (Navigation)
- [[_COMMUNITY_Public Site Sections|Public Site Sections]]
- [[_COMMUNITY_Dependencies & Stack Docs|Dependencies & Stack Docs]]
- [[_COMMUNITY_Dashboard UI Components|Dashboard UI Components]]
- [[_COMMUNITY_Server Actions (CRUD)|Server Actions (CRUD)]]
- [[_COMMUNITY_Dashboard Shell & Nav|Dashboard Shell & Nav]]
- [[_COMMUNITY_TypeScript Config|TypeScript Config]]
- [[_COMMUNITY_Root Layout & Fonts|Root Layout & Fonts]]
- [[_COMMUNITY_Auth & Supabase Wiring|Auth & Supabase Wiring]]
- [[_COMMUNITY_ESLint Config|ESLint Config]]
- [[_COMMUNITY_MCP Config|MCP Config]]
- [[_COMMUNITY_Next.js Config|Next.js Config]]
- [[_COMMUNITY_PostCSS  Tailwind Config|PostCSS / Tailwind Config]]

## God Nodes (most connected - your core abstractions)
1. `createClient()` - 20 edges
2. `compilerOptions` - 16 edges
3. `run()` - 15 edges
4. `requireAdmin()` - 9 edges
5. `ActionForm()` - 7 edges
6. `FileInput()` - 7 edges
7. `Field()` - 7 edges
8. `Input()` - 7 edges
9. `SaveButton()` - 7 edges
10. `Card()` - 7 edges

## Surprising Connections (you probably didn't know these)
- `npm dev/build/start/lint commands` --realized_by--> `scripts`  [INFERRED]
  CLAUDE.md → package.json
- `Geist font (next/font)` --realized_by--> `geistSans`  [INFERRED]
  README.md → app/layout.tsx
- `Geist font (next/font)` --realized_by--> `geistMono`  [INFERRED]
  README.md → app/layout.tsx
- `Next.js 16.2.4` --realized_by--> `next`  [INFERRED]
  CLAUDE.md → package.json
- `React 19.2.4` --realized_by--> `react`  [INFERRED]
  CLAUDE.md → package.json

## Import Cycles
- None detected.

## Communities (12 total, 4 thin omitted)

### Community 0 - "Public Site Sections"
Cohesion: 0.08
Nodes (25): Home(), About(), COLORS, Contact(), Deck(), SLIDES, Hero(), Works() (+17 more)

### Community 1 - "Dependencies & Stack Docs"
Cohesion: 0.06
Nodes (36): Next.js breaking-changes warning, npm dev/build/start/lint commands, @/* import alias, Next.js 16.2.4, node_modules/next/dist/docs, React 19.2.4, @tailwindcss/postcss config, Tailwind CSS v4 (+28 more)

### Community 2 - "Dashboard UI Components"
Cohesion: 0.19
Nodes (14): Accordion(), AccordionGroup(), Ctx, ActionForm(), INITIAL, FileInput(), SortableItem(), SortableList() (+6 more)

### Community 3 - "Server Actions (CRUD)"
Cohesion: 0.11
Nodes (23): ActionResult, addWorkImage(), Client, deleteAboutEntry(), deleteEducation(), deleteSocial(), deleteTech(), deleteWork() (+15 more)

### Community 4 - "Dashboard Shell & Nav"
Cohesion: 0.12
Nodes (15): GET(), signOut(), DashboardNav(), NAV, EducationManager(), DashboardLayout(), SettingsPage(), SocialManager() (+7 more)

### Community 5 - "TypeScript Config"
Cohesion: 0.10
Nodes (19): compilerOptions, allowJs, esModuleInterop, incremental, isolatedModules, jsx, lib, module (+11 more)

### Community 6 - "Root Layout & Fonts"
Cohesion: 0.22
Nodes (7): geistMono, geistSans, metadata, App Router architecture, create-next-app bootstrap, Geist font (next/font), Deploy on Vercel

### Community 7 - "Auth & Supabase Wiring"
Cohesion: 0.27
Nodes (5): Database, config, proxy(), createClient(), updateSession()

## Knowledge Gaps
- **58 isolated node(s):** `supabase`, `COLORS`, `SLIDES`, `Ctx`, `INITIAL` (+53 more)
  These have ≤1 connection - possible missing edges or undocumented components.
- **4 thin communities (<3 nodes) omitted from report** — run `graphify query` to explore isolated nodes.

## Suggested Questions
_Questions this graph is uniquely positioned to answer:_

- **Why does `App Router architecture` connect `Root Layout & Fonts` to `Public Site Sections`, `Dependencies & Stack Docs`?**
  _High betweenness centrality (0.304) - this node is a cross-community bridge._
- **Why does `createClient()` connect `Dashboard Shell & Nav` to `Public Site Sections`, `Dashboard UI Components`, `Server Actions (CRUD)`?**
  _High betweenness centrality (0.129) - this node is a cross-community bridge._
- **What connects `supabase`, `COLORS`, `SLIDES` to the rest of the system?**
  _58 weakly-connected nodes found - possible documentation gaps or missing edges._
- **Should `Public Site Sections` be split into smaller, more focused modules?**
  _Cohesion score 0.08170731707317073 - nodes in this community are weakly interconnected._
- **Should `Dependencies & Stack Docs` be split into smaller, more focused modules?**
  _Cohesion score 0.058029689608636977 - nodes in this community are weakly interconnected._
- **Should `Server Actions (CRUD)` be split into smaller, more focused modules?**
  _Cohesion score 0.11264367816091954 - nodes in this community are weakly interconnected._
- **Should `Dashboard Shell & Nav` be split into smaller, more focused modules?**
  _Cohesion score 0.12318840579710146 - nodes in this community are weakly interconnected._