---
type: "query"
date: "2026-07-02T03:54:36.583102+00:00"
question: "How can i set the uploaded file limitation in dashboard? because i was uploading an >1MB image and the app errors"
contributor: "graphify"
source_nodes: ["uploadIfPresent", "addWorkImage", "FileInput.tsx"]
---

# Q: How can i set the uploaded file limitation in dashboard? because i was uploading an >1MB image and the app errors

## Answer

Expanded from original query via vocab: [upload, file, image, dashboard, storage, supabase, form, action, works, tables, database, input]. Then traversed BFS from FileInput(), ActionForm(), uploadIfPresent(), addWorkImage(). The dashboard's own upload code (app/dashboard/actions.ts uploadIfPresent(), addWorkImage()) has no size check - it uploads any File straight to Supabase storage. The 1MB error is Next.js's default Server Actions body size limit (experimental.serverActions.bodySizeLimit, default 1MB, per node_modules/next/dist/docs/01-app/03-api-reference/05-config/01-next-config-js/serverActions.md). next.config.ts currently sets no override. Fix: add experimental.serverActions.bodySizeLimit: '5mb' (or desired size) to next.config.ts.

## Source Nodes

- uploadIfPresent
- addWorkImage
- FileInput.tsx