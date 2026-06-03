# Web application architecture

## Folder layout

| Layer | Path | Responsibility |
|-------|------|----------------|
| Routes | `src/app/` | Next.js routing only: thin Server Component pages, layouts, `loading.tsx`, `error.tsx`, metadata |
| Features | `src/features/` | Domain UI, hooks, types, feature-specific components |
| Shared UI | `src/components/` | Reusable presentation: `ui/`, `shared/`, `data/`, `forms/`, `tables/`, `layout/` |
| Infrastructure | `src/lib/` | API client, format, constants, routes, validations, shared hooks |
| State | `src/store/` | Redux store and RTK Query APIs |

Pages import from `@/features/...`, never from `@/app/...`.

## Component tiers

1. **`components/ui/`** — shadcn primitives; no business logic.
2. **`components/shared/`**, **`data/`**, **`forms/`**, **`tables/`** — app-wide building blocks (PageHeader, SmartTable, usePagination consumers). No RTK Query.
3. **`features/*/components/`** — domain screens and wrappers (FlatStatusBadge, flats-client).
4. **`app/**/page.tsx`** — server entry: `dynamic()` import of feature clients, `decodeSocietyId`, metadata.

## Hooks

- **`lib/hooks/`** — cross-cutting: `usePagination`, `useDebouncedValue`, `useQueryRefetch`, auth session.
- **`features/*/hooks/`** — domain data: RTK Query + toasts + derived state (`useFlatsList`, `useFlatDetail`, etc.).

Client components should compose shared UI + feature hook return values; avoid large inline query/mutation blocks.

## Routing and auth

- **`lib/routes/paths.ts`** — typed path helpers (prefer over string templates).
- **`middleware.ts`** — coarse check: access-token cookie on protected prefixes.
- **`RouteGuard`** (layouts) — fine-grained role and society membership.

## Code splitting

- Route-level: `dynamic()` in server `page.tsx` with `AppLoader`.
- Dialog-level: `dynamic()` inside feature clients for heavy modals (flat edit, claim review, subscription activate).

## Conventions

- `"use client"` only on leaf components that need hooks or browser APIs.
- Formatting via `@/lib/format` only (no local `Intl.NumberFormat` in features).
- Destructive actions: `ConfirmDialog` when a simple confirm is enough.
- After structural changes: `pnpm lint` and `pnpm build` from `web/`.
