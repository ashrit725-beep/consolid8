# Consolid8

**Verified context optimization for AI agents.**

Consolid8 determines the minimum context a specific task needs — and then
verifies that nothing critical was lost. If a required constraint went missing,
it restores the context automatically and verifies again.

```
FULL CONTEXT → ANALYZE → SELECT → CONSOLIDATE → VERIFY → RECOVER IF NEEDED → FINAL CONTEXT
```

This repository is the **frontend**. It runs entirely on bundled fixtures until
a runtime URL is configured.

## Run it

```bash
npm install
npm run dev     # http://localhost:3000
```

## The demo, in ten seconds

| Page | What it shows |
|---|---|
| **Overview** | The last run: 72,418 → 18,413 tokens, 74.6% smaller, 12/12 constraints, verified |
| **Compiler** | Press Compile and watch the pipeline fail verification at 11/12, auto-recover, and pass at 12/12 |
| **Inspector** | Every decision with its reason — EU-WEST pinned, US-EAST stale, an untrusted document's injected instruction omitted |
| **Verification** | 30 requirements, their evidence, and the recovery timeline |
| **Stress Test** | Naive optimization: 14,922 tokens, **9/12, FAIL**. Consolid8: 18,413 tokens, **12/12, PASS** |
| **Analytics** | Fleet reduction, pass rate, recovery rate, and an input-cost estimator |
| **Developer** | SDK quickstart, REST surface and the response contracts this UI is built on |

## Why this isn't summarization

A summarizer produces a smaller context and hopes. Consolid8 extracts the
constraints first, checks the compiled context against them, and repairs what
is missing. The Stress Test page is that difference made concrete: the naive
run is 3,491 tokens *cheaper* and drops the rule that production database
access is read-only.

## Connecting a backend

```bash
cp .env.example .env.local
# NEXT_PUBLIC_CONSOLID8_API_URL=http://localhost:8080
```

Every call goes through `src/lib/api/consolid8.ts`. The endpoints it expects
are listed on the Developer page.

## Contributing

See [ARCHITECTURE.md](ARCHITECTURE.md) — features are independent modules and
plug in without touching each other.
