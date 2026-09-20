# Consolid8 frontend — architecture

Written for: engineers (and agents) adding features to this repository.

Consolid8 is a **shell + independent feature modules + shared data contracts +
one design system**. A new feature should be a new folder, not a change spread
across five files.

```
src/
  app/              thin route files — one component each, nothing else
  config/           navigation, brand strings, every colour decision
  types/            the shared data contracts (never redefine these locally)
  lib/
    api/            the only place that calls fetch
    demo/           the only place fixtures live
    formatting/     number, percent, token and timestamp formatting
    tokens/         token estimation and reduction maths
    state/          the entire global store (3 values)
  components/
    ui/             design-system primitives + React Bits ports
    shared/         components genuinely used by 2+ features
    layout/         sidebar, topbar, shell
    charts/         SVG chart primitives
  features/
    <feature>/
      components/   the feature's UI
      hooks/        the feature's state
      types.ts      feature-local types only
      index.ts      public surface — one primary component
```

## Adding a feature

1. `mkdir -p src/features/my-feature/components`
2. Build it. Feature-local state stays in the feature.
3. Export one primary component from `src/features/my-feature/index.ts`.
4. Add a route: `src/app/my-feature/page.tsx`

   ```tsx
   import { MyFeature } from "@/features/my-feature";
   export default function MyFeaturePage() { return <MyFeature />; }
   ```

5. Add one entry to `NAV_SECTIONS` in `src/config/navigation.ts`.

That is the whole integration. You never touch `layout.tsx`, `globals.css`,
another feature, or the store.

## The rules that keep merges clean

| Rule | Why |
|---|---|
| Page files render one component and nothing else | Two people adding routes never collide |
| Features talk through typed props, not imports of each other | `features/a` importing `features/b` couples release cycles |
| A component moves to `components/shared/` only when a **second** feature needs it | Premature sharing is what makes shared files conflict-prone |
| All colour comes from `config/statusStyles.ts` | One diff changes a status colour everywhere |
| All backend calls go through `lib/api/consolid8.ts` | Swapping demo → live is one function |
| All fixtures come from `lib/demo/` | No component invents a number |
| `globals.css` and `config/navigation.ts` are append-only in practice | These are the only genuinely global files |

## Data contracts

`src/types/` is frozen surface area. `ContextUnit`, `CompilationResponse`,
`VerificationResult`, `RecoveryAttempt`, `Conflict`, `StressTestResult` and
`AnalyticsSnapshot` are shared by every feature. Extend them additively;
do not fork them per feature.

## Demo and live modes

`getApi(mode)` returns a `Consolid8Api`. Both implementations satisfy the same
interface, so components cannot tell them apart:

```ts
const result = await getApi(mode).compileContext({ task });
```

Live mode activates when `NEXT_PUBLIC_CONSOLID8_API_URL` is set (see
`.env.example`); until then the LIVE toggle is disabled with an explanatory
tooltip rather than silently failing.

## Fixture integrity

Every figure in the product derives from `lib/demo/demoConversation.ts`.
The 61 context units sum to exactly **72,418** canonical tokens and **18,413**
compiled tokens (**74.6%** reduction). Metrics, charts, the stress test and the
context flow all compute from that one array — change a unit's token count and
every surface updates consistently.

## Global state

Three values, in `lib/state/runtime-store.tsx`: `mode`, `run`, `selectedUnitId`.
Everything else is feature-local or in the URL (see
`useInspectorFilters` — `/inspector?classification=pinned` is a shareable link).

## Design system

Dark only. Tokens live in `src/app/globals.css` under `@theme`; semantics live
in `src/config/statusStyles.ts`. Use `bg-surface`, `text-fg-muted`,
`border-line`, and the `num` / `label-xs` utilities rather than raw values.

Green means *verified*, amber means *recovered*, red means *failed*, and
slate means *dropped*. Status is never carried by colour alone — every badge
also carries a word, and most carry a glyph.

## Animation

Motion is meaningful or absent. The React Bits ports in `components/ui/`
(`CountUp`, `AnimatedContent`, `AnimatedList`, `FadeContent`, `SpotlightCard`,
`BorderGlow`, `GlareHover`, `Stepper`, `Dock`, `DecryptedText`, `ShinyText`,
`DotGrid`) all respect `prefers-reduced-motion`, and the scroll-triggered ones
reveal immediately if they are already on screen, with a failsafe so content
can never stay hidden.

## Checks

```bash
npm run typecheck   # tsc --noEmit
npm run lint        # eslint
npm run build       # production build
npm run check       # typecheck + lint
```
