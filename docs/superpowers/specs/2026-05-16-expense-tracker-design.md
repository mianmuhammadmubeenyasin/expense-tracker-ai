# Expense Tracker AI — Design Spec

**Date:** 2026-05-16  
**Stack:** Next.js 14 App Router · TypeScript · Tailwind CSS · localStorage  
**Color scheme:** Midnight Indigo + Amber Glow  
**Font:** DM Sans (Google Fonts)

---

## Overview

A complete personal expense tracking web app. Users can add, edit, delete, filter, and visualize their spending. Data persists in `localStorage` — no backend, no auth. The app runs entirely in the browser.

---

## Architecture

### Approach: App Router + Client Components + localStorage

The root layout (`app/layout.tsx`) is a server component. It loads DM Sans via `next/font/google` and renders a client-side `ExpenseProvider` that wraps all pages. All pages are client components.

No API routes. The data layer is a React context + custom hook that owns all state.

**Routing:**

| Route | Page |
|---|---|
| `/` | Dashboard — summary cards + charts |
| `/expenses` | Expense list — search, filter, delete |
| `/expenses/new` | Add expense form |
| `/expenses/[id]/edit` | Edit expense form |

---

## Data Model

```ts
type Category =
  | 'Food'
  | 'Transportation'
  | 'Entertainment'
  | 'Shopping'
  | 'Bills'
  | 'Other'

type Expense = {
  id: string         // crypto.randomUUID()
  date: string       // ISO date string (YYYY-MM-DD)
  amount: number     // stored in cents (integer) to avoid float precision bugs
  category: Category
  description: string
  createdAt: string  // ISO timestamp, used for stable sort order
}
```

Amounts are stored as integers (cents). All display formatting uses `Intl.NumberFormat('en-US', { style: 'currency', currency: 'USD' })`.

---

## Data Layer

### `ExpenseContext` + `useExpenses` hook

Lives in `lib/expense-context.tsx`. Provides:

- `expenses: Expense[]` — full list, sorted by date descending
- `addExpense(data: ExpenseInput): void`
- `updateExpense(id: string, data: ExpenseInput): void`
- `deleteExpense(id: string): void`
- `exportCSV(): void` — triggers browser download

On mount, the context reads from `localStorage` key `"expenses"`. Every mutation writes the full array back. No async; localStorage is synchronous.

`ExpenseInput` is the Zod-validated form shape (amounts as number in dollars, converted to cents on save).

---

## File Structure

```
app/
  layout.tsx              # Server component — font, metadata, ExpenseProvider wrapper
  page.tsx                # Dashboard (client)
  expenses/
    page.tsx              # Expense list (client)
    new/
      page.tsx            # Add form (client)
    [id]/
      edit/
        page.tsx          # Edit form (client)
components/
  layout/
    Sidebar.tsx           # Nav sidebar, collapses to bottom bar on mobile
    Header.tsx            # Page header with title + action button
  dashboard/
    SummaryCard.tsx       # Stat card (total, monthly, top category)
    SpendingChart.tsx     # Recharts bar chart — monthly spend
    CategoryDonut.tsx     # Recharts pie chart — category breakdown
    RecentExpenses.tsx    # Last 5 expenses list on dashboard
  expenses/
    ExpenseForm.tsx       # Shared form for new + edit (react-hook-form + Zod)
    ExpenseList.tsx       # Filterable, searchable list
    ExpenseRow.tsx        # Single row with edit/delete
    FilterBar.tsx         # Date range + category filter controls
lib/
  expense-context.tsx     # Context provider + useExpenses hook
  expense-schema.ts       # Zod schema for form validation
  utils.ts                # formatCurrency, formatDate, categoryColors, exportCSV
```

---

## Components

### `SummaryCard`
Props: `title`, `value`, `subtitle`, `icon`, `trend?`. Renders a card with the stat and an optional trend indicator (up/down arrow + percentage vs last month).

### `SpendingChart`
Dynamic import (no SSR). Recharts `BarChart` showing total spend per month for the last 6 months, broken down by category (stacked bars). Uses `categoryColors` map for consistent coloring.

### `CategoryDonut`
Dynamic import. Recharts `PieChart` showing current month's spend by category. Shows total in center via custom label.

### `ExpenseForm`
Used by both `/expenses/new` and `/expenses/[id]/edit`. Fields:
- `date` — react-day-picker, defaults to today
- `amount` — number input, min 0.01, max 1,000,000
- `category` — select from 6 categories
- `description` — text input, max 200 chars

Validation via Zod. On submit, calls `addExpense` or `updateExpense` then redirects to `/expenses`.

### `ExpenseList`
Client component. Reads `expenses` from context and applies local filter state:
- **Search** — matches description (case-insensitive)
- **Date range** — start + end date inputs
- **Category** — multi-select checkboxes

Displays filtered count and "no results" empty state.

### `FilterBar`
Controlled by `ExpenseList`. Date range uses two `<input type="date">` fields. Category filter is a dropdown with checkboxes. "Clear filters" resets all.

---

## Design System

### Color Palette

| Token | Value | Usage |
|---|---|---|
| Primary | `#4338CA` (indigo-700) | Nav active, primary buttons |
| Primary dark | `#312E81` (indigo-900) | Sidebar background |
| Accent | `#F59E0B` (amber-500) | Highlights, CTAs, amounts |
| Accent light | `#FEF3C7` (amber-100) | Card backgrounds |
| Surface | `#EEF2FF` (indigo-50) | Page background |
| Text primary | `#111827` | Body text |
| Text secondary | `#6B7280` | Labels, subtitles |

### Category Colors

| Category | Color |
|---|---|
| Food | `#10B981` (emerald) |
| Transportation | `#3B82F6` (blue) |
| Entertainment | `#8B5CF6` (violet) |
| Shopping | `#F97316` (orange) |
| Bills | `#EF4444` (red) |
| Other | `#6B7280` (gray) |

### Typography

- Font: DM Sans (loaded via `next/font/google`, weights 400, 500, 600, 700)
- Headings: 600–700 weight
- Body: 400–500 weight
- Numbers/amounts: 700 weight, tabular nums (`font-variant-numeric: tabular-nums`)

---

## Features

### Export CSV
`exportCSV()` in `lib/utils.ts` builds a CSV string from the `expenses` array (columns: Date, Amount, Category, Description), creates a Blob, triggers `<a download="expenses.csv">`. No library needed.

### Form Validation
Zod schema in `lib/expense-schema.ts`. Errors displayed inline below each field. Submit button disabled while invalid. On successful submit, toast notification confirms the action.

### Toast Notifications
Using `react-hot-toast` (small, zero-config). Shown on: add success, edit success, delete success, export triggered.

### Responsive Layout
- Desktop (≥1024px): sidebar on left, content on right
- Mobile (<1024px): sidebar collapses to a bottom navigation bar (4 icon tabs: Dashboard, Expenses, Add, Export)

### Delete Confirmation
Clicking delete on an expense row opens an inline confirmation ("Are you sure?") with Confirm/Cancel — no modal, just the row state changes.

---

## Dependencies

```json
{
  "recharts": "^2.x",
  "react-hook-form": "^7.x",
  "zod": "^3.x",
  "react-day-picker": "^8.x",
  "react-hot-toast": "^2.x"
}
```

---

## What's Out of Scope

- Authentication / user accounts
- Backend / database
- Multi-currency support
- Recurring expenses
- Budget limits / alerts
- PDF export
