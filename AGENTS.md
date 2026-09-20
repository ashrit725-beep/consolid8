<!-- BEGIN:nextjs-agent-rules -->

# This is NOT the Next.js you know

This version has breaking changes — APIs, conventions, and file structure may all differ from your training data. Read the relevant guide in `node_modules/next/dist/docs/` (resolved from this file's directory; in monorepos the `next` package may not be visible from the repo root) before writing any code. Heed deprecation notices.

This block is written and re-added by `next dev` — verify at `node_modules/next/dist/server/lib/generate-agent-files.js`. Removing it from a diff only re-creates the uncommitted change; committing it with your work keeps the tree clean.

<!-- END:nextjs-agent-rules -->

# Consolid8 — working in this repo

Read **ARCHITECTURE.md** before adding anything. Short version:

- Features are self-contained modules under `src/features/<feature>/` with one
  public component exported from `index.ts`. Add a feature by creating that
  folder, a thin `src/app/<feature>/page.tsx`, and one entry in
  `src/config/navigation.ts`. Nothing else.
- Never hard-code a colour: use `src/config/statusStyles.ts`.
- Never hard-code a number: fixtures live in `src/lib/demo/` and every figure
  in the product derives from `demoConversation.ts` (72,418 → 18,413 tokens).
- Never call `fetch` directly: go through `src/lib/api/consolid8.ts`.
- Shared types live in `src/types/`. Extend additively; do not fork them.
- Move a component into `components/shared/` only when a second feature uses it.

Verify with `npm run check` (typecheck + lint) and `npm run build`.
