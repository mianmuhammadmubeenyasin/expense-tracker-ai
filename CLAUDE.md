# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Commands

```bash
npm run dev          # Start dev server at http://localhost:3000
npm run build        # Production build (runs tsc + next build)
npm run lint         # ESLint via next lint
npm test             # Run all tests once (vitest run)
npm run test:watch   # Vitest in watch mode
npx tsc --noEmit     # Type-check without building
```

**Run a single test file:**
```bash
npx vitest run __tests__/utils.test.ts
npx vitest run __tests__/expense-context.test.tsx
```

## Architecture

**No backend.** All data lives in `localStorage`. No API routes, no database, no auth.

**Data flow:**
1. `app/layout.tsx` (server component) wraps everything in `<ExpenseProvider>` from `lib/expense-context.tsx`
2. All pages are client components that call `useExpenses()` to read/mutate data
3. Every mutation writes the full sorted array back to `localStorage` synchronously

**Amount invariant:** Amounts are always stored as integer cents in `Expense.amount`. The boundary conversions are:
- Form input (dollars) → `dollarsToCents()` on save
- Display → `formatCurrency(cents)` from `lib/utils.ts`
- Form pre-population on edit → `centsToDollars(expense.amount)` as `defaultValues`

Never store or pass dollar floats through the context layer.

**`isLoaded` pattern:** `ExpenseContext` starts with an empty array and hydrates from `localStorage` in a `useEffect`. Pages that need a specific expense (e.g., `app/expenses/[id]/edit/page.tsx`) must wait for `isLoaded` before calling `notFound()` — otherwise the guard fires before data arrives.

## Key Files

- `lib/types.ts` — `Expense`, `ExpenseInput`, `Category` type definitions
- `lib/expense-schema.ts` — Zod schema + `CATEGORIES` array (single source of truth for the category list)
- `lib/expense-context.tsx` — `ExpenseProvider` + `useExpenses()` hook; only place that touches `localStorage`
- `lib/utils.ts` — `formatCurrency`, `formatDate`, `dollarsToCents`, `centsToDollars`, `exportCSV`, chart data helpers

## Testing

Tests live in `__tests__/` and use **Vitest + @testing-library/react** with jsdom. The config is `vitest.config.mts` (`.mts` extension required for ESM compatibility — do not rename it).

- `utils.test.ts` — pure function tests; DOM APIs (Blob, URL, createElement) are spied on with `vi.spyOn`
- `expense-schema.test.ts` — Zod validation edge cases
- `expense-context.test.tsx` — tests the hook inside a minimal provider wrapper

Tests do not cover UI components — only `lib/` logic.

## Component Conventions

- `'use client'` is required on any component that uses hooks, browser APIs, or event handlers. Server components are the exception (e.g., `Header.tsx`, `SummaryCard.tsx`, `RecentExpenses.tsx`).
- Recharts components (`BarChart`, `PieChart`) must be loaded with `next/dynamic` + `ssr: false` to avoid SSR hydration errors. Cast dynamic imports to `any` when TypeScript complains about next/dynamic generic constraints.
- `react-day-picker` is pinned to **v8** (`react-day-picker@8`). The v9/v10 API is incompatible.

## Design System

Colors: indigo-900 (`#312E81`) sidebar, indigo-700 (`#4338CA`) primary actions, amber-500 (`#F59E0B`) accent/CTAs. Page background is indigo-50.

Category colors are defined in `CATEGORY_COLORS` in `lib/utils.ts` — always import from there, never redefine locally.

Font: DM Sans, loaded via `next/font/google` in `app/layout.tsx`.
