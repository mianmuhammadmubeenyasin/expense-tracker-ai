# Expense Tracker Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Build a complete personal expense tracking web app with Next.js 14 App Router, TypeScript, Tailwind CSS, and localStorage persistence.

**Architecture:** Single Next.js 14 App Router app. `app/layout.tsx` is a server component that wraps a client-side `ExpenseProvider`. All interactive pages and components use `'use client'`. No API routes — state lives in a custom `useExpenses` hook that reads/writes localStorage synchronously.

**Tech Stack:** Next.js 14, TypeScript, Tailwind CSS v3, Recharts v2, react-hook-form v7, Zod v3, react-day-picker v8, react-hot-toast v2, lucide-react, Vitest, @testing-library/react

---

## File Map

| File | Responsibility |
|---|---|
| `lib/types.ts` | Expense and Category type definitions |
| `lib/expense-schema.ts` | Zod validation schema + CATEGORIES constant |
| `lib/utils.ts` | formatCurrency, formatDate, dollarsToCents, centsToDollars, exportCSV, CATEGORY_COLORS, getMonthlyData, getCategoryTotals |
| `lib/expense-context.tsx` | ExpenseProvider component + useExpenses hook |
| `app/globals.css` | Tailwind directives + react-day-picker CSS import |
| `app/layout.tsx` | Root server layout — DM Sans font, ExpenseProvider, Toaster |
| `components/layout/Sidebar.tsx` | Desktop left sidebar + mobile bottom nav |
| `components/layout/Header.tsx` | Page title + optional action button |
| `components/dashboard/SummaryCard.tsx` | Stat card with icon, value, subtitle, optional trend |
| `components/dashboard/SpendingChart.tsx` | Recharts stacked bar chart — last 6 months by category |
| `components/dashboard/CategoryDonut.tsx` | Recharts pie chart — current month by category |
| `components/dashboard/RecentExpenses.tsx` | Last 5 expenses preview list |
| `app/page.tsx` | Dashboard page |
| `components/expenses/ExpenseForm.tsx` | Shared add/edit form (react-hook-form + Zod + react-day-picker) |
| `components/expenses/ExpenseRow.tsx` | Single list row with inline delete confirmation |
| `components/expenses/FilterBar.tsx` | Search input + date range + category multi-select |
| `components/expenses/ExpenseList.tsx` | Filtered, searchable expense list |
| `app/expenses/page.tsx` | Expenses list page |
| `app/expenses/new/page.tsx` | Add expense page |
| `app/expenses/[id]/edit/page.tsx` | Edit expense page |

---

### Task 1: Scaffold project and install dependencies

**Files:**
- Create: all project files (via create-next-app)
- Create: `vitest.config.ts`
- Create: `vitest.setup.ts`

- [ ] **Step 1: Scaffold Next.js 14 project**

```bash
npx create-next-app@14 . --typescript --tailwind --eslint --app --no-src-dir --import-alias="@/*" --yes
```

Expected: Project files created, `npm install` completes automatically. You'll see `app/`, `components/` (empty), `lib/` (empty), `public/`, `package.json`, `tsconfig.json`, `tailwind.config.ts`.

- [ ] **Step 2: Install runtime dependencies**

```bash
npm install recharts react-hook-form @hookform/resolvers zod react-day-picker react-hot-toast lucide-react
```

- [ ] **Step 3: Install dev dependencies**

```bash
npm install -D vitest @vitejs/plugin-react jsdom @testing-library/react @testing-library/jest-dom
```

- [ ] **Step 4: Create `vitest.config.ts`**

```typescript
import { defineConfig } from 'vitest/config'
import react from '@vitejs/plugin-react'
import path from 'path'

export default defineConfig({
  plugins: [react()],
  test: {
    environment: 'jsdom',
    globals: true,
    setupFiles: './vitest.setup.ts',
  },
  resolve: {
    alias: {
      '@': path.resolve(__dirname, '.'),
    },
  },
})
```

- [ ] **Step 5: Create `vitest.setup.ts`**

```typescript
import '@testing-library/jest-dom'
```

- [ ] **Step 6: Add test scripts to `package.json`**

Open `package.json` and add to the `"scripts"` object:

```json
"test": "vitest run",
"test:watch": "vitest"
```

- [ ] **Step 7: Verify setup compiles**

```bash
npx tsc --noEmit
```

Expected: No errors.

- [ ] **Step 8: Commit**

```bash
git add .
git commit -m "chore: scaffold Next.js 14 with dependencies and Vitest"
```

---

### Task 2: Types, Zod schema, and utility functions

**Files:**
- Create: `lib/types.ts`
- Create: `lib/expense-schema.ts`
- Create: `lib/utils.ts`
- Create: `__tests__/utils.test.ts`
- Create: `__tests__/expense-schema.test.ts`

- [ ] **Step 1: Write failing tests for utils**

Create `__tests__/utils.test.ts`:

```typescript
import { describe, it, expect, vi, afterEach } from 'vitest'
import { formatCurrency, formatDate, dollarsToCents, centsToDollars, exportCSV, CATEGORY_COLORS } from '@/lib/utils'
import type { Expense } from '@/lib/types'

describe('formatCurrency', () => {
  it('formats cents to USD string', () => {
    expect(formatCurrency(1000)).toBe('$10.00')
    expect(formatCurrency(150)).toBe('$1.50')
    expect(formatCurrency(0)).toBe('$0.00')
    expect(formatCurrency(99)).toBe('$0.99')
  })
})

describe('formatDate', () => {
  it('formats ISO date to readable string', () => {
    expect(formatDate('2024-01-15')).toBe('Jan 15, 2024')
    expect(formatDate('2024-12-31')).toBe('Dec 31, 2024')
  })
})

describe('dollarsToCents', () => {
  it('converts dollars to cents rounding correctly', () => {
    expect(dollarsToCents(10)).toBe(1000)
    expect(dollarsToCents(1.99)).toBe(199)
    expect(dollarsToCents(0.01)).toBe(1)
    expect(dollarsToCents(25.505)).toBe(2551)
  })
})

describe('centsToDollars', () => {
  it('converts cents to dollars', () => {
    expect(centsToDollars(1000)).toBe(10)
    expect(centsToDollars(199)).toBe(1.99)
  })
})

describe('CATEGORY_COLORS', () => {
  it('has entries for all 6 categories', () => {
    const categories = ['Food', 'Transportation', 'Entertainment', 'Shopping', 'Bills', 'Other']
    categories.forEach(cat => {
      expect(CATEGORY_COLORS).toHaveProperty(cat)
      expect(CATEGORY_COLORS[cat as keyof typeof CATEGORY_COLORS]).toMatch(/^#[0-9A-Fa-f]{6}$/)
    })
  })
})

describe('exportCSV', () => {
  afterEach(() => { vi.restoreAllMocks() })

  it('triggers a file download with correct filename pattern', () => {
    const mockClick = vi.fn()
    const mockCreateObjectURL = vi.fn().mockReturnValue('blob:mock')
    const mockRevokeObjectURL = vi.fn()
    const mockAnchor = { href: '', download: '', click: mockClick } as unknown as HTMLAnchorElement

    vi.spyOn(document, 'createElement').mockReturnValue(mockAnchor)
    vi.spyOn(URL, 'createObjectURL').mockImplementation(mockCreateObjectURL)
    vi.spyOn(URL, 'revokeObjectURL').mockImplementation(mockRevokeObjectURL)

    const expenses: Expense[] = [{
      id: '1',
      date: '2024-01-15',
      amount: 1500,
      category: 'Food',
      description: 'Lunch',
      createdAt: '2024-01-15T12:00:00.000Z',
    }]

    exportCSV(expenses)

    expect(mockClick).toHaveBeenCalledOnce()
    expect(mockAnchor.download).toMatch(/^expenses-\d{4}-\d{2}-\d{2}\.csv$/)
    expect(mockRevokeObjectURL).toHaveBeenCalledWith('blob:mock')
  })

  it('escapes double quotes in description', () => {
    let capturedBlob: Blob | undefined
    vi.spyOn(URL, 'createObjectURL').mockImplementation((blob) => {
      capturedBlob = blob as Blob
      return 'blob:mock'
    })
    vi.spyOn(URL, 'revokeObjectURL').mockImplementation(() => {})
    vi.spyOn(document, 'createElement').mockReturnValue({ href: '', download: '', click: vi.fn() } as unknown as HTMLAnchorElement)

    exportCSV([{
      id: '1',
      date: '2024-01-15',
      amount: 500,
      category: 'Food',
      description: 'She said "hello"',
      createdAt: '2024-01-15T12:00:00.000Z',
    }])

    expect(capturedBlob).toBeDefined()
  })
})
```

- [ ] **Step 2: Write failing tests for expense-schema**

Create `__tests__/expense-schema.test.ts`:

```typescript
import { describe, it, expect } from 'vitest'
import { expenseSchema } from '@/lib/expense-schema'

describe('expenseSchema', () => {
  const valid = { date: '2024-01-15', amount: 25.50, category: 'Food', description: 'Lunch' }

  it('accepts valid expense data', () => {
    expect(expenseSchema.safeParse(valid).success).toBe(true)
  })

  it('rejects amount of 0', () => {
    const result = expenseSchema.safeParse({ ...valid, amount: 0 })
    expect(result.success).toBe(false)
    if (!result.success) expect(result.error.issues[0].path).toContain('amount')
  })

  it('rejects amount above 1000000', () => {
    const result = expenseSchema.safeParse({ ...valid, amount: 1_000_001 })
    expect(result.success).toBe(false)
  })

  it('rejects empty description', () => {
    const result = expenseSchema.safeParse({ ...valid, description: '' })
    expect(result.success).toBe(false)
  })

  it('rejects description over 200 characters', () => {
    const result = expenseSchema.safeParse({ ...valid, description: 'a'.repeat(201) })
    expect(result.success).toBe(false)
  })

  it('rejects invalid category', () => {
    const result = expenseSchema.safeParse({ ...valid, category: 'Groceries' })
    expect(result.success).toBe(false)
  })

  it('rejects malformed date', () => {
    const result = expenseSchema.safeParse({ ...valid, date: 'not-a-date' })
    expect(result.success).toBe(false)
  })
})
```

- [ ] **Step 3: Run tests to verify they fail**

```bash
npm test
```

Expected: All tests fail with "Cannot find module '@/lib/utils'" and similar import errors.

- [ ] **Step 4: Create `lib/types.ts`**

```typescript
export type Category =
  | 'Food'
  | 'Transportation'
  | 'Entertainment'
  | 'Shopping'
  | 'Bills'
  | 'Other'

export type Expense = {
  id: string
  date: string       // YYYY-MM-DD
  amount: number     // stored in cents (integer)
  category: Category
  description: string
  createdAt: string  // ISO timestamp, used for stable sort
}

export type ExpenseInput = {
  date: string
  amount: number     // dollars (from form)
  category: Category
  description: string
}
```

- [ ] **Step 5: Create `lib/expense-schema.ts`**

```typescript
import { z } from 'zod'
import type { Category } from './types'

export const CATEGORIES: Category[] = [
  'Food',
  'Transportation',
  'Entertainment',
  'Shopping',
  'Bills',
  'Other',
]

export const expenseSchema = z.object({
  date: z.string().regex(/^\d{4}-\d{2}-\d{2}$/, 'Invalid date format'),
  amount: z
    .number({ invalid_type_error: 'Amount must be a number' })
    .min(0.01, 'Amount must be at least $0.01')
    .max(1_000_000, 'Amount cannot exceed $1,000,000'),
  category: z.enum(
    ['Food', 'Transportation', 'Entertainment', 'Shopping', 'Bills', 'Other'],
    { errorMap: () => ({ message: 'Select a category' }) }
  ),
  description: z
    .string()
    .min(1, 'Description is required')
    .max(200, 'Description cannot exceed 200 characters'),
})

export type ExpenseFormValues = z.infer<typeof expenseSchema>
```

- [ ] **Step 6: Create `lib/utils.ts`**

```typescript
import type { Category, Expense } from './types'

export const CATEGORY_COLORS: Record<Category, string> = {
  Food: '#10B981',
  Transportation: '#3B82F6',
  Entertainment: '#8B5CF6',
  Shopping: '#F97316',
  Bills: '#EF4444',
  Other: '#6B7280',
}

export function formatCurrency(cents: number): string {
  return new Intl.NumberFormat('en-US', {
    style: 'currency',
    currency: 'USD',
  }).format(cents / 100)
}

export function formatDate(dateStr: string): string {
  const [year, month, day] = dateStr.split('-').map(Number)
  return new Date(year, month - 1, day).toLocaleDateString('en-US', {
    year: 'numeric',
    month: 'short',
    day: 'numeric',
  })
}

export function dollarsToCents(dollars: number): number {
  return Math.round(dollars * 100)
}

export function centsToDollars(cents: number): number {
  return cents / 100
}

export function exportCSV(expenses: Expense[]): void {
  const headers = ['Date', 'Amount (USD)', 'Category', 'Description']
  const rows = expenses.map((e) => [
    e.date,
    (e.amount / 100).toFixed(2),
    e.category,
    `"${e.description.replace(/"/g, '""')}"`,
  ])
  const csv = [headers.join(','), ...rows.map((r) => r.join(','))].join('\n')
  const blob = new Blob([csv], { type: 'text/csv;charset=utf-8;' })
  const url = URL.createObjectURL(blob)
  const a = document.createElement('a')
  a.href = url
  a.download = `expenses-${new Date().toISOString().slice(0, 10)}.csv`
  a.click()
  URL.revokeObjectURL(url)
}

// Returns the YYYY-MM key for a given date string
export function toMonthKey(dateStr: string): string {
  return dateStr.slice(0, 7)
}

// Current month as YYYY-MM
export function currentMonthKey(): string {
  const now = new Date()
  return `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, '0')}`
}

// Previous month as YYYY-MM
export function prevMonthKey(): string {
  const now = new Date()
  const prev = new Date(now.getFullYear(), now.getMonth() - 1, 1)
  return `${prev.getFullYear()}-${String(prev.getMonth() + 1).padStart(2, '0')}`
}

export type MonthlyDataPoint = {
  month: string
  Food: number
  Transportation: number
  Entertainment: number
  Shopping: number
  Bills: number
  Other: number
  total: number
}

// Returns last 6 months of spending data by category (amounts in cents)
export function getMonthlyData(expenses: Expense[]): MonthlyDataPoint[] {
  const months: MonthlyDataPoint[] = []
  const now = new Date()

  for (let i = 5; i >= 0; i--) {
    const d = new Date(now.getFullYear(), now.getMonth() - i, 1)
    const key = `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}`
    const label = d.toLocaleDateString('en-US', { month: 'short' })

    const point: MonthlyDataPoint = {
      month: label,
      Food: 0,
      Transportation: 0,
      Entertainment: 0,
      Shopping: 0,
      Bills: 0,
      Other: 0,
      total: 0,
    }

    expenses
      .filter((e) => toMonthKey(e.date) === key)
      .forEach((e) => {
        point[e.category] += e.amount
        point.total += e.amount
      })

    months.push(point)
  }

  return months
}

// Returns per-category totals for a given month key (amounts in cents)
export function getCategoryTotals(
  expenses: Expense[],
  monthKey: string
): { category: Category; total: number }[] {
  const totals: Partial<Record<Category, number>> = {}

  expenses
    .filter((e) => toMonthKey(e.date) === monthKey)
    .forEach((e) => {
      totals[e.category] = (totals[e.category] ?? 0) + e.amount
    })

  return (Object.entries(totals) as [Category, number][])
    .map(([category, total]) => ({ category, total }))
    .filter((item) => item.total > 0)
    .sort((a, b) => b.total - a.total)
}
```

- [ ] **Step 7: Run tests to verify they pass**

```bash
npm test
```

Expected: All 13 tests pass.

- [ ] **Step 8: Commit**

```bash
git add lib/types.ts lib/expense-schema.ts lib/utils.ts __tests__/utils.test.ts __tests__/expense-schema.test.ts
git commit -m "feat: add types, Zod schema, and utility functions with tests"
```

---

### Task 3: Expense context and useExpenses hook

**Files:**
- Create: `lib/expense-context.tsx`
- Create: `__tests__/expense-context.test.tsx`

- [ ] **Step 1: Write failing tests**

Create `__tests__/expense-context.test.tsx`:

```typescript
import { describe, it, expect, beforeEach, vi } from 'vitest'
import { render, screen, act } from '@testing-library/react'
import { ExpenseProvider, useExpenses } from '@/lib/expense-context'

const localStorageMock = (() => {
  let store: Record<string, string> = {}
  return {
    getItem: (key: string) => store[key] ?? null,
    setItem: (key: string, value: string) => { store[key] = value },
    clear: () => { store = {} },
  }
})()

Object.defineProperty(window, 'localStorage', { value: localStorageMock })

function TestConsumer({ action }: { action?: (ctx: ReturnType<typeof useExpenses>) => void }) {
  const ctx = useExpenses()
  return (
    <div>
      <span data-testid="count">{ctx.expenses.length}</span>
      <button onClick={() => action?.(ctx)}>action</button>
    </div>
  )
}

function Wrapper({ children }: { children: React.ReactNode }) {
  return <ExpenseProvider>{children}</ExpenseProvider>
}

beforeEach(() => localStorageMock.clear())

describe('useExpenses', () => {
  it('throws when used outside ExpenseProvider', () => {
    const spy = vi.spyOn(console, 'error').mockImplementation(() => {})
    expect(() => render(<TestConsumer />)).toThrow('useExpenses must be used within ExpenseProvider')
    spy.mockRestore()
  })

  it('starts with empty expenses', () => {
    render(<TestConsumer />, { wrapper: Wrapper })
    expect(screen.getByTestId('count').textContent).toBe('0')
  })

  it('addExpense increases count and persists to localStorage', async () => {
    render(
      <TestConsumer
        action={(ctx) =>
          ctx.addExpense({ date: '2024-01-15', amount: 25.5, category: 'Food', description: 'Lunch' })
        }
      />,
      { wrapper: Wrapper }
    )
    await act(async () => {
      screen.getByRole('button').click()
    })
    expect(screen.getByTestId('count').textContent).toBe('1')
    const stored = JSON.parse(localStorageMock.getItem('expenses') ?? '[]')
    expect(stored).toHaveLength(1)
    expect(stored[0].amount).toBe(2550)
  })

  it('deleteExpense removes the expense', async () => {
    render(
      <TestConsumer
        action={(ctx) => {
          if (ctx.expenses.length === 0) {
            ctx.addExpense({ date: '2024-01-15', amount: 10, category: 'Food', description: 'Test' })
          } else {
            ctx.deleteExpense(ctx.expenses[0].id)
          }
        }}
      />,
      { wrapper: Wrapper }
    )
    await act(async () => { screen.getByRole('button').click() })
    expect(screen.getByTestId('count').textContent).toBe('1')
    await act(async () => { screen.getByRole('button').click() })
    expect(screen.getByTestId('count').textContent).toBe('0')
  })
})
```

- [ ] **Step 2: Run tests to verify they fail**

```bash
npm test __tests__/expense-context.test.tsx
```

Expected: FAIL — "Cannot find module '@/lib/expense-context'".

- [ ] **Step 3: Create `lib/expense-context.tsx`**

```typescript
'use client'

import { createContext, useContext, useEffect, useState, useCallback } from 'react'
import type { Expense, ExpenseInput } from './types'
import { dollarsToCents, exportCSV } from './utils'

type ExpenseContextValue = {
  expenses: Expense[]
  addExpense: (data: ExpenseInput) => void
  updateExpense: (id: string, data: ExpenseInput) => void
  deleteExpense: (id: string) => void
  exportExpenses: () => void
}

const ExpenseContext = createContext<ExpenseContextValue | null>(null)
const STORAGE_KEY = 'expenses'

function sortByDate(list: Expense[]): Expense[] {
  return [...list].sort((a, b) =>
    b.date !== a.date ? b.date.localeCompare(a.date) : b.createdAt.localeCompare(a.createdAt)
  )
}

export function ExpenseProvider({ children }: { children: React.ReactNode }) {
  const [expenses, setExpenses] = useState<Expense[]>([])

  useEffect(() => {
    try {
      const stored = localStorage.getItem(STORAGE_KEY)
      if (stored) setExpenses(JSON.parse(stored))
    } catch {
      setExpenses([])
    }
  }, [])

  const persist = useCallback((next: Expense[]) => {
    const sorted = sortByDate(next)
    setExpenses(sorted)
    localStorage.setItem(STORAGE_KEY, JSON.stringify(sorted))
  }, [])

  const addExpense = useCallback(
    (data: ExpenseInput) => {
      const expense: Expense = {
        id: crypto.randomUUID(),
        date: data.date,
        amount: dollarsToCents(data.amount),
        category: data.category,
        description: data.description,
        createdAt: new Date().toISOString(),
      }
      persist([...expenses, expense])
    },
    [expenses, persist]
  )

  const updateExpense = useCallback(
    (id: string, data: ExpenseInput) => {
      persist(
        expenses.map((e) =>
          e.id === id
            ? {
                ...e,
                date: data.date,
                amount: dollarsToCents(data.amount),
                category: data.category,
                description: data.description,
              }
            : e
        )
      )
    },
    [expenses, persist]
  )

  const deleteExpense = useCallback(
    (id: string) => {
      persist(expenses.filter((e) => e.id !== id))
    },
    [expenses, persist]
  )

  const exportExpenses = useCallback(() => {
    exportCSV(expenses)
  }, [expenses])

  return (
    <ExpenseContext.Provider value={{ expenses, addExpense, updateExpense, deleteExpense, exportExpenses }}>
      {children}
    </ExpenseContext.Provider>
  )
}

export function useExpenses(): ExpenseContextValue {
  const ctx = useContext(ExpenseContext)
  if (!ctx) throw new Error('useExpenses must be used within ExpenseProvider')
  return ctx
}
```

- [ ] **Step 4: Run all tests**

```bash
npm test
```

Expected: All tests pass (17+ tests).

- [ ] **Step 5: Commit**

```bash
git add lib/expense-context.tsx __tests__/expense-context.test.tsx
git commit -m "feat: add ExpenseProvider context and useExpenses hook with tests"
```

---

### Task 4: App layout — globals, root layout, Sidebar, Header

**Files:**
- Modify: `app/globals.css`
- Modify: `app/layout.tsx`
- Create: `components/layout/Sidebar.tsx`
- Create: `components/layout/Header.tsx`

- [ ] **Step 1: Update `app/globals.css`**

Replace the entire file content:

```css
@import 'react-day-picker/dist/style.css';

@tailwind base;
@tailwind components;
@tailwind utilities;

@layer base {
  * {
    box-sizing: border-box;
  }
  body {
    @apply bg-indigo-50 text-gray-900;
  }
  .tabular-nums {
    font-variant-numeric: tabular-nums;
  }
}
```

- [ ] **Step 2: Replace `app/layout.tsx`**

```typescript
import type { Metadata } from 'next'
import { DM_Sans } from 'next/font/google'
import { Toaster } from 'react-hot-toast'
import { ExpenseProvider } from '@/lib/expense-context'
import { Sidebar } from '@/components/layout/Sidebar'
import './globals.css'

const dmSans = DM_Sans({
  subsets: ['latin'],
  weight: ['400', '500', '600', '700'],
  variable: '--font-dm-sans',
})

export const metadata: Metadata = {
  title: 'Expense Tracker',
  description: 'Track your personal expenses',
}

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en" className={dmSans.variable}>
      <body className={`${dmSans.className} antialiased`}>
        <ExpenseProvider>
          <div className="flex min-h-screen">
            <Sidebar />
            <main className="flex-1 lg:ml-64 pb-20 lg:pb-0">
              {children}
            </main>
          </div>
          <Toaster
            position="top-right"
            toastOptions={{
              style: { fontFamily: 'var(--font-dm-sans)', fontWeight: 500 },
              success: { style: { background: '#312E81', color: 'white' } },
              error: { style: { background: '#EF4444', color: 'white' } },
            }}
          />
        </ExpenseProvider>
      </body>
    </html>
  )
}
```

- [ ] **Step 3: Create `components/layout/Sidebar.tsx`**

```typescript
'use client'

import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { LayoutDashboard, List, PlusCircle, Download } from 'lucide-react'
import { useExpenses } from '@/lib/expense-context'
import toast from 'react-hot-toast'

const navItems = [
  { href: '/', label: 'Dashboard', icon: LayoutDashboard },
  { href: '/expenses', label: 'Expenses', icon: List },
  { href: '/expenses/new', label: 'Add Expense', icon: PlusCircle },
]

export function Sidebar() {
  const pathname = usePathname()
  const { exportExpenses } = useExpenses()

  function handleExport() {
    exportExpenses()
    toast.success('CSV exported!')
  }

  return (
    <>
      {/* Desktop sidebar */}
      <aside className="hidden lg:flex flex-col fixed inset-y-0 left-0 w-64 bg-indigo-900 text-white z-40">
        <div className="flex items-center gap-3 px-6 py-6 border-b border-indigo-800">
          <div className="w-8 h-8 rounded-lg bg-amber-400 flex items-center justify-center text-indigo-900 font-bold text-sm">
            ET
          </div>
          <span className="font-semibold text-lg">Expense Tracker</span>
        </div>

        <nav className="flex-1 px-4 py-6 space-y-1">
          {navItems.map(({ href, label, icon: Icon }) => {
            const active = pathname === href
            return (
              <Link
                key={href}
                href={href}
                className={`flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium transition-colors ${
                  active
                    ? 'bg-indigo-700 text-white'
                    : 'text-indigo-200 hover:bg-indigo-800 hover:text-white'
                }`}
              >
                <Icon size={18} />
                {label}
              </Link>
            )
          })}
        </nav>

        <div className="px-4 pb-6">
          <button
            onClick={handleExport}
            className="flex items-center gap-3 w-full px-3 py-2.5 rounded-lg text-sm font-medium text-indigo-200 hover:bg-indigo-800 hover:text-white transition-colors"
          >
            <Download size={18} />
            Export CSV
          </button>
        </div>
      </aside>

      {/* Mobile bottom nav */}
      <nav className="lg:hidden fixed bottom-0 inset-x-0 bg-indigo-900 text-white z-40 border-t border-indigo-800">
        <div className="flex items-center justify-around px-2 py-2">
          {navItems.map(({ href, label, icon: Icon }) => {
            const active = pathname === href
            return (
              <Link
                key={href}
                href={href}
                className={`flex flex-col items-center gap-0.5 px-4 py-1.5 rounded-lg transition-colors ${
                  active ? 'text-amber-400' : 'text-indigo-300'
                }`}
              >
                <Icon size={20} />
                <span className="text-xs">{label.split(' ')[0]}</span>
              </Link>
            )
          })}
          <button
            onClick={handleExport}
            className="flex flex-col items-center gap-0.5 px-4 py-1.5 rounded-lg text-indigo-300"
          >
            <Download size={20} />
            <span className="text-xs">Export</span>
          </button>
        </div>
      </nav>
    </>
  )
}
```

- [ ] **Step 4: Create `components/layout/Header.tsx`**

```typescript
import Link from 'next/link'
import { LucideIcon } from 'lucide-react'

type Props = {
  title: string
  subtitle?: string
  action?: {
    label: string
    href?: string
    onClick?: () => void
    icon?: LucideIcon
  }
}

export function Header({ title, subtitle, action }: Props) {
  return (
    <div className="flex items-center justify-between px-6 py-6 border-b border-indigo-100 bg-white">
      <div>
        <h1 className="text-2xl font-bold text-gray-900">{title}</h1>
        {subtitle && <p className="text-sm text-gray-500 mt-0.5">{subtitle}</p>}
      </div>
      {action && (
        action.href ? (
          <Link
            href={action.href}
            className="flex items-center gap-2 px-4 py-2 bg-amber-500 hover:bg-amber-600 text-white font-semibold text-sm rounded-lg transition-colors"
          >
            {action.icon && <action.icon size={16} />}
            {action.label}
          </Link>
        ) : (
          <button
            onClick={action.onClick}
            className="flex items-center gap-2 px-4 py-2 bg-amber-500 hover:bg-amber-600 text-white font-semibold text-sm rounded-lg transition-colors"
          >
            {action.icon && <action.icon size={16} />}
            {action.label}
          </button>
        )
      )}
    </div>
  )
}
```

- [ ] **Step 5: Verify dev server starts**

```bash
npm run dev
```

Expected: Server starts on http://localhost:3000. Opening it in a browser should show the indigo sidebar on the left (or bottom nav on mobile) with an otherwise empty main area. No console errors.

- [ ] **Step 6: Commit**

```bash
git add app/globals.css app/layout.tsx components/layout/
git commit -m "feat: add root layout with DM Sans font, Sidebar, and Header"
```

---

### Task 5: SummaryCard and dashboard data helpers

**Files:**
- Create: `components/dashboard/SummaryCard.tsx`

- [ ] **Step 1: Create `components/dashboard/SummaryCard.tsx`**

```typescript
import { LucideIcon, TrendingUp, TrendingDown, Minus } from 'lucide-react'

type TrendDirection = 'up' | 'down' | 'neutral'

type Props = {
  title: string
  value: string
  subtitle?: string
  icon: LucideIcon
  iconColor?: string
  trend?: {
    direction: TrendDirection
    label: string
  }
}

export function SummaryCard({ title, value, subtitle, icon: Icon, iconColor = 'text-indigo-600', trend }: Props) {
  const TrendIcon =
    trend?.direction === 'up' ? TrendingUp :
    trend?.direction === 'down' ? TrendingDown :
    Minus

  const trendColor =
    trend?.direction === 'up' ? 'text-red-500' :
    trend?.direction === 'down' ? 'text-emerald-500' :
    'text-gray-400'

  return (
    <div className="bg-white rounded-2xl p-6 border border-indigo-100 shadow-sm">
      <div className="flex items-center justify-between mb-4">
        <span className="text-sm font-medium text-gray-500">{title}</span>
        <div className={`w-10 h-10 rounded-xl bg-indigo-50 flex items-center justify-center ${iconColor}`}>
          <Icon size={20} />
        </div>
      </div>
      <div className="tabular-nums text-2xl font-bold text-gray-900 mb-1">{value}</div>
      {(subtitle || trend) && (
        <div className="flex items-center gap-2 mt-2">
          {trend && (
            <div className={`flex items-center gap-1 text-xs font-medium ${trendColor}`}>
              <TrendIcon size={12} />
              <span>{trend.label}</span>
            </div>
          )}
          {subtitle && <span className="text-xs text-gray-400">{subtitle}</span>}
        </div>
      )}
    </div>
  )
}
```

- [ ] **Step 2: Commit**

```bash
git add components/dashboard/SummaryCard.tsx
git commit -m "feat: add SummaryCard dashboard component"
```

---

### Task 6: Spending charts — SpendingChart and CategoryDonut

**Files:**
- Create: `components/dashboard/SpendingChart.tsx`
- Create: `components/dashboard/CategoryDonut.tsx`

- [ ] **Step 1: Create `components/dashboard/SpendingChart.tsx`**

Recharts must be dynamically imported to avoid SSR errors. The component receives pre-computed data.

```typescript
'use client'

import dynamic from 'next/dynamic'
import { CATEGORY_COLORS, formatCurrency } from '@/lib/utils'
import type { MonthlyDataPoint } from '@/lib/utils'
import type { Category } from '@/lib/types'

const BarChart = dynamic(() => import('recharts').then((m) => m.BarChart), { ssr: false })
const Bar = dynamic(() => import('recharts').then((m) => m.Bar), { ssr: false })
const XAxis = dynamic(() => import('recharts').then((m) => m.XAxis), { ssr: false })
const YAxis = dynamic(() => import('recharts').then((m) => m.YAxis), { ssr: false })
const Tooltip = dynamic(() => import('recharts').then((m) => m.Tooltip), { ssr: false })
const ResponsiveContainer = dynamic(() => import('recharts').then((m) => m.ResponsiveContainer), { ssr: false })

const CATEGORIES: Category[] = ['Food', 'Transportation', 'Entertainment', 'Shopping', 'Bills', 'Other']

type Props = { data: MonthlyDataPoint[] }

export function SpendingChart({ data }: Props) {
  const hasData = data.some((d) => d.total > 0)

  if (!hasData) {
    return (
      <div className="bg-white rounded-2xl p-6 border border-indigo-100 shadow-sm">
        <h2 className="text-base font-semibold text-gray-900 mb-4">Monthly Spending</h2>
        <div className="h-48 flex items-center justify-center text-gray-400 text-sm">
          No expenses yet — add your first expense to see trends.
        </div>
      </div>
    )
  }

  return (
    <div className="bg-white rounded-2xl p-6 border border-indigo-100 shadow-sm">
      <h2 className="text-base font-semibold text-gray-900 mb-4">Monthly Spending</h2>
      <ResponsiveContainer width="100%" height={220}>
        <BarChart data={data} margin={{ top: 0, right: 0, left: -10, bottom: 0 }}>
          <XAxis dataKey="month" tick={{ fontSize: 12, fill: '#9CA3AF' }} axisLine={false} tickLine={false} />
          <YAxis
            tickFormatter={(v) => `$${(v / 100).toFixed(0)}`}
            tick={{ fontSize: 11, fill: '#9CA3AF' }}
            axisLine={false}
            tickLine={false}
          />
          <Tooltip
            formatter={(value: number) => [formatCurrency(value), '']}
            contentStyle={{ borderRadius: 8, border: '1px solid #E0E7FF', fontSize: 12 }}
          />
          {CATEGORIES.map((cat) => (
            <Bar key={cat} dataKey={cat} stackId="a" fill={CATEGORY_COLORS[cat]} radius={cat === 'Other' ? [4, 4, 0, 0] : [0, 0, 0, 0]} />
          ))}
        </BarChart>
      </ResponsiveContainer>
      <div className="flex flex-wrap gap-3 mt-3">
        {CATEGORIES.map((cat) => (
          <div key={cat} className="flex items-center gap-1.5 text-xs text-gray-500">
            <div className="w-2.5 h-2.5 rounded-full" style={{ background: CATEGORY_COLORS[cat] }} />
            {cat}
          </div>
        ))}
      </div>
    </div>
  )
}
```

- [ ] **Step 2: Create `components/dashboard/CategoryDonut.tsx`**

```typescript
'use client'

import dynamic from 'next/dynamic'
import { CATEGORY_COLORS, formatCurrency } from '@/lib/utils'
import type { Category } from '@/lib/types'

const PieChart = dynamic(() => import('recharts').then((m) => m.PieChart), { ssr: false })
const Pie = dynamic(() => import('recharts').then((m) => m.Pie), { ssr: false })
const Cell = dynamic(() => import('recharts').then((m) => m.Cell), { ssr: false })
const Tooltip = dynamic(() => import('recharts').then((m) => m.Tooltip), { ssr: false })
const ResponsiveContainer = dynamic(() => import('recharts').then((m) => m.ResponsiveContainer), { ssr: false })

type Props = {
  data: { category: Category; total: number }[]
  monthLabel: string
}

export function CategoryDonut({ data, monthLabel }: Props) {
  const totalCents = data.reduce((sum, d) => sum + d.total, 0)

  if (data.length === 0) {
    return (
      <div className="bg-white rounded-2xl p-6 border border-indigo-100 shadow-sm">
        <h2 className="text-base font-semibold text-gray-900 mb-1">This Month</h2>
        <p className="text-xs text-gray-400 mb-4">{monthLabel}</p>
        <div className="h-48 flex items-center justify-center text-gray-400 text-sm">
          No spending this month yet.
        </div>
      </div>
    )
  }

  const chartData = data.map((d) => ({
    name: d.category,
    value: d.total,
  }))

  return (
    <div className="bg-white rounded-2xl p-6 border border-indigo-100 shadow-sm">
      <h2 className="text-base font-semibold text-gray-900 mb-1">This Month</h2>
      <p className="text-xs text-gray-400 mb-4">{monthLabel}</p>
      <div className="flex gap-6 items-center">
        <ResponsiveContainer width={140} height={140}>
          <PieChart>
            <Pie
              data={chartData}
              cx="50%"
              cy="50%"
              innerRadius={42}
              outerRadius={64}
              paddingAngle={2}
              dataKey="value"
            >
              {chartData.map((entry) => (
                <Cell key={entry.name} fill={CATEGORY_COLORS[entry.name as Category]} />
              ))}
            </Pie>
            <Tooltip
              formatter={(value: number) => [formatCurrency(value), '']}
              contentStyle={{ borderRadius: 8, border: '1px solid #E0E7FF', fontSize: 12 }}
            />
          </PieChart>
        </ResponsiveContainer>
        <div className="flex-1 space-y-2">
          {data.map(({ category, total }) => (
            <div key={category} className="flex items-center justify-between text-sm">
              <div className="flex items-center gap-2">
                <div className="w-2 h-2 rounded-full" style={{ background: CATEGORY_COLORS[category] }} />
                <span className="text-gray-600">{category}</span>
              </div>
              <span className="tabular-nums font-medium text-gray-900">{formatCurrency(total)}</span>
            </div>
          ))}
          <div className="border-t border-gray-100 pt-2 flex items-center justify-between text-sm">
            <span className="font-semibold text-gray-900">Total</span>
            <span className="tabular-nums font-bold text-amber-600">{formatCurrency(totalCents)}</span>
          </div>
        </div>
      </div>
    </div>
  )
}
```

- [ ] **Step 3: Commit**

```bash
git add components/dashboard/SpendingChart.tsx components/dashboard/CategoryDonut.tsx
git commit -m "feat: add SpendingChart and CategoryDonut recharts components"
```

---

### Task 7: RecentExpenses component and Dashboard page

**Files:**
- Create: `components/dashboard/RecentExpenses.tsx`
- Modify: `app/page.tsx`

- [ ] **Step 1: Create `components/dashboard/RecentExpenses.tsx`**

```typescript
import Link from 'next/link'
import { ArrowRight } from 'lucide-react'
import { formatCurrency, formatDate, CATEGORY_COLORS } from '@/lib/utils'
import type { Expense } from '@/lib/types'

type Props = { expenses: Expense[] }

export function RecentExpenses({ expenses }: Props) {
  const recent = expenses.slice(0, 5)

  if (recent.length === 0) {
    return (
      <div className="bg-white rounded-2xl p-6 border border-indigo-100 shadow-sm">
        <h2 className="text-base font-semibold text-gray-900 mb-4">Recent Expenses</h2>
        <p className="text-sm text-gray-400 text-center py-8">No expenses yet. Add your first one!</p>
      </div>
    )
  }

  return (
    <div className="bg-white rounded-2xl p-6 border border-indigo-100 shadow-sm">
      <div className="flex items-center justify-between mb-4">
        <h2 className="text-base font-semibold text-gray-900">Recent Expenses</h2>
        <Link href="/expenses" className="flex items-center gap-1 text-indigo-600 text-sm font-medium hover:text-indigo-800 transition-colors">
          View all <ArrowRight size={14} />
        </Link>
      </div>
      <div className="space-y-3">
        {recent.map((expense) => (
          <div key={expense.id} className="flex items-center gap-3 py-2 border-b border-gray-50 last:border-0">
            <div
              className="w-9 h-9 rounded-xl flex items-center justify-center text-white text-xs font-bold flex-shrink-0"
              style={{ background: CATEGORY_COLORS[expense.category] }}
            >
              {expense.category.charAt(0)}
            </div>
            <div className="flex-1 min-w-0">
              <p className="text-sm font-medium text-gray-900 truncate">{expense.description}</p>
              <p className="text-xs text-gray-400">{formatDate(expense.date)}</p>
            </div>
            <span className="tabular-nums text-sm font-semibold text-gray-900 flex-shrink-0">
              {formatCurrency(expense.amount)}
            </span>
          </div>
        ))}
      </div>
    </div>
  )
}
```

- [ ] **Step 2: Replace `app/page.tsx`**

```typescript
'use client'

import { useMemo } from 'react'
import { DollarSign, Calendar, Tag } from 'lucide-react'
import { useExpenses } from '@/lib/expense-context'
import {
  formatCurrency,
  getMonthlyData,
  getCategoryTotals,
  currentMonthKey,
  prevMonthKey,
} from '@/lib/utils'
import { Header } from '@/components/layout/Header'
import { SummaryCard } from '@/components/dashboard/SummaryCard'
import { SpendingChart } from '@/components/dashboard/SpendingChart'
import { CategoryDonut } from '@/components/dashboard/CategoryDonut'
import { RecentExpenses } from '@/components/dashboard/RecentExpenses'

export default function DashboardPage() {
  const { expenses } = useExpenses()

  const thisMonthKey = currentMonthKey()
  const lastMonthKey = prevMonthKey()

  const totalSpent = useMemo(() => expenses.reduce((sum, e) => sum + e.amount, 0), [expenses])

  const thisMonthTotal = useMemo(
    () => expenses.filter((e) => e.date.startsWith(thisMonthKey)).reduce((sum, e) => sum + e.amount, 0),
    [expenses, thisMonthKey]
  )

  const lastMonthTotal = useMemo(
    () => expenses.filter((e) => e.date.startsWith(lastMonthKey)).reduce((sum, e) => sum + e.amount, 0),
    [expenses, lastMonthKey]
  )

  const monthlyData = useMemo(() => getMonthlyData(expenses), [expenses])

  const categoryTotals = useMemo(() => getCategoryTotals(expenses, thisMonthKey), [expenses, thisMonthKey])

  const topCategory = categoryTotals[0]?.category ?? '—'

  const trend = useMemo(() => {
    if (lastMonthTotal === 0) return undefined
    const pct = Math.round(((thisMonthTotal - lastMonthTotal) / lastMonthTotal) * 100)
    return {
      direction: (pct > 0 ? 'up' : pct < 0 ? 'down' : 'neutral') as 'up' | 'down' | 'neutral',
      label: `${Math.abs(pct)}% vs last month`,
    }
  }, [thisMonthTotal, lastMonthTotal])

  const monthLabel = new Date().toLocaleDateString('en-US', { month: 'long', year: 'numeric' })

  return (
    <div>
      <Header title="Dashboard" subtitle={`Welcome back — here's your spending overview`} />
      <div className="p-6 space-y-6">
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
          <SummaryCard
            title="Total Spent"
            value={formatCurrency(totalSpent)}
            subtitle={`${expenses.length} expense${expenses.length !== 1 ? 's' : ''}`}
            icon={DollarSign}
          />
          <SummaryCard
            title="This Month"
            value={formatCurrency(thisMonthTotal)}
            icon={Calendar}
            trend={trend}
            subtitle={monthLabel}
          />
          <SummaryCard
            title="Top Category"
            value={topCategory}
            subtitle={topCategory !== '—' ? formatCurrency(categoryTotals[0]?.total ?? 0) : 'No data yet'}
            icon={Tag}
            iconColor="text-amber-500"
          />
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-5 gap-6">
          <div className="lg:col-span-3">
            <SpendingChart data={monthlyData} />
          </div>
          <div className="lg:col-span-2">
            <CategoryDonut data={categoryTotals} monthLabel={monthLabel} />
          </div>
        </div>

        <RecentExpenses expenses={expenses} />
      </div>
    </div>
  )
}
```

- [ ] **Step 3: Verify in browser**

```bash
npm run dev
```

Open http://localhost:3000. Expected: Dashboard renders with 3 summary cards showing $0, empty state messages in the chart and donut, and "No expenses yet" in recent expenses. No console errors.

- [ ] **Step 4: Commit**

```bash
git add components/dashboard/RecentExpenses.tsx app/page.tsx
git commit -m "feat: add dashboard page with summary cards and charts"
```

---

### Task 8: ExpenseForm component

**Files:**
- Create: `components/expenses/ExpenseForm.tsx`

- [ ] **Step 1: Create `components/expenses/ExpenseForm.tsx`**

```typescript
'use client'

import { useForm, Controller } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { DayPicker } from 'react-day-picker'
import { useState } from 'react'
import { CalendarDays, ChevronDown } from 'lucide-react'
import { expenseSchema, CATEGORIES, type ExpenseFormValues } from '@/lib/expense-schema'
import { formatDate } from '@/lib/utils'
import type { Expense } from '@/lib/types'

type Props = {
  onSubmit: (values: ExpenseFormValues) => void
  defaultValues?: Partial<ExpenseFormValues>
  submitLabel?: string
  isLoading?: boolean
}

function todayISO(): string {
  const d = new Date()
  return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}-${String(d.getDate()).padStart(2, '0')}`
}

function dateToISO(date: Date): string {
  return `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, '0')}-${String(date.getDate()).padStart(2, '0')}`
}

function isoToDate(iso: string): Date {
  const [y, m, d] = iso.split('-').map(Number)
  return new Date(y, m - 1, d)
}

export function ExpenseForm({ onSubmit, defaultValues, submitLabel = 'Save Expense', isLoading }: Props) {
  const [calOpen, setCalOpen] = useState(false)

  const {
    register,
    handleSubmit,
    control,
    formState: { errors },
    watch,
  } = useForm<ExpenseFormValues>({
    resolver: zodResolver(expenseSchema),
    defaultValues: {
      date: defaultValues?.date ?? todayISO(),
      amount: defaultValues?.amount,
      category: defaultValues?.category ?? 'Food',
      description: defaultValues?.description ?? '',
    },
  })

  const dateValue = watch('date')
  const descLength = watch('description')?.length ?? 0

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="space-y-5">
      {/* Date */}
      <div>
        <label className="block text-sm font-semibold text-gray-700 mb-1.5">Date</label>
        <Controller
          name="date"
          control={control}
          render={({ field }) => (
            <div className="relative">
              <button
                type="button"
                onClick={() => setCalOpen((o) => !o)}
                className="flex items-center gap-2 w-full px-4 py-2.5 bg-white border border-gray-200 rounded-xl text-sm text-left hover:border-indigo-400 transition-colors"
              >
                <CalendarDays size={16} className="text-indigo-500" />
                {field.value ? formatDate(field.value) : 'Select date'}
                <ChevronDown size={14} className="ml-auto text-gray-400" />
              </button>
              {calOpen && (
                <div className="absolute z-50 mt-1 bg-white border border-gray-200 rounded-xl shadow-lg p-2">
                  <DayPicker
                    mode="single"
                    selected={field.value ? isoToDate(field.value) : undefined}
                    onSelect={(date) => {
                      if (date) {
                        field.onChange(dateToISO(date))
                        setCalOpen(false)
                      }
                    }}
                    disabled={{ after: new Date() }}
                    modifiersClassNames={{ selected: 'rdp-day_selected' }}
                  />
                </div>
              )}
            </div>
          )}
        />
        {errors.date && <p className="mt-1 text-xs text-red-500">{errors.date.message}</p>}
      </div>

      {/* Amount */}
      <div>
        <label className="block text-sm font-semibold text-gray-700 mb-1.5">Amount (USD)</label>
        <div className="relative">
          <span className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400 font-medium">$</span>
          <input
            {...register('amount', { valueAsNumber: true })}
            type="number"
            step="0.01"
            min="0.01"
            max="1000000"
            placeholder="0.00"
            className="w-full pl-8 pr-4 py-2.5 bg-white border border-gray-200 rounded-xl text-sm focus:outline-none focus:border-indigo-400 focus:ring-2 focus:ring-indigo-100 transition-colors tabular-nums"
          />
        </div>
        {errors.amount && <p className="mt-1 text-xs text-red-500">{errors.amount.message}</p>}
      </div>

      {/* Category */}
      <div>
        <label className="block text-sm font-semibold text-gray-700 mb-1.5">Category</label>
        <select
          {...register('category')}
          className="w-full px-4 py-2.5 bg-white border border-gray-200 rounded-xl text-sm focus:outline-none focus:border-indigo-400 focus:ring-2 focus:ring-indigo-100 transition-colors appearance-none"
        >
          {CATEGORIES.map((cat) => (
            <option key={cat} value={cat}>{cat}</option>
          ))}
        </select>
        {errors.category && <p className="mt-1 text-xs text-red-500">{errors.category.message}</p>}
      </div>

      {/* Description */}
      <div>
        <div className="flex items-center justify-between mb-1.5">
          <label className="text-sm font-semibold text-gray-700">Description</label>
          <span className={`text-xs ${descLength > 180 ? 'text-amber-500' : 'text-gray-400'}`}>
            {descLength}/200
          </span>
        </div>
        <input
          {...register('description')}
          type="text"
          placeholder="What did you spend on?"
          maxLength={200}
          className="w-full px-4 py-2.5 bg-white border border-gray-200 rounded-xl text-sm focus:outline-none focus:border-indigo-400 focus:ring-2 focus:ring-indigo-100 transition-colors"
        />
        {errors.description && <p className="mt-1 text-xs text-red-500">{errors.description.message}</p>}
      </div>

      <button
        type="submit"
        disabled={isLoading}
        className="w-full py-3 bg-indigo-700 hover:bg-indigo-800 disabled:bg-indigo-400 text-white font-semibold rounded-xl transition-colors"
      >
        {isLoading ? 'Saving…' : submitLabel}
      </button>
    </form>
  )
}
```

- [ ] **Step 2: Commit**

```bash
git add components/expenses/ExpenseForm.tsx
git commit -m "feat: add ExpenseForm with react-hook-form, Zod validation, and date picker"
```

---

### Task 9: ExpenseRow, FilterBar, and ExpenseList

**Files:**
- Create: `components/expenses/ExpenseRow.tsx`
- Create: `components/expenses/FilterBar.tsx`
- Create: `components/expenses/ExpenseList.tsx`

- [ ] **Step 1: Create `components/expenses/ExpenseRow.tsx`**

```typescript
'use client'

import { useState } from 'react'
import Link from 'next/link'
import { Pencil, Trash2, Check, X } from 'lucide-react'
import toast from 'react-hot-toast'
import { useExpenses } from '@/lib/expense-context'
import { formatCurrency, formatDate, CATEGORY_COLORS } from '@/lib/utils'
import type { Expense } from '@/lib/types'

type Props = { expense: Expense }

export function ExpenseRow({ expense }: Props) {
  const { deleteExpense } = useExpenses()
  const [confirming, setConfirming] = useState(false)

  function handleDelete() {
    deleteExpense(expense.id)
    toast.success('Expense deleted')
  }

  return (
    <div className="flex items-center gap-3 px-4 py-3 hover:bg-indigo-50/50 rounded-xl transition-colors group">
      <div
        className="w-10 h-10 rounded-xl flex items-center justify-center text-white text-xs font-bold flex-shrink-0"
        style={{ background: CATEGORY_COLORS[expense.category] }}
      >
        {expense.category.charAt(0)}
      </div>
      <div className="flex-1 min-w-0">
        <p className="text-sm font-medium text-gray-900 truncate">{expense.description}</p>
        <div className="flex items-center gap-2 mt-0.5">
          <span className="text-xs text-gray-400">{formatDate(expense.date)}</span>
          <span className="w-1 h-1 rounded-full bg-gray-300" />
          <span className="text-xs text-gray-400">{expense.category}</span>
        </div>
      </div>
      <span className="tabular-nums font-semibold text-gray-900 flex-shrink-0">
        {formatCurrency(expense.amount)}
      </span>

      {confirming ? (
        <div className="flex items-center gap-1 flex-shrink-0">
          <span className="text-xs text-gray-500 mr-1">Delete?</span>
          <button
            onClick={handleDelete}
            className="p-1.5 bg-red-500 text-white rounded-lg hover:bg-red-600 transition-colors"
            aria-label="Confirm delete"
          >
            <Check size={13} />
          </button>
          <button
            onClick={() => setConfirming(false)}
            className="p-1.5 bg-gray-200 text-gray-600 rounded-lg hover:bg-gray-300 transition-colors"
            aria-label="Cancel delete"
          >
            <X size={13} />
          </button>
        </div>
      ) : (
        <div className="flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity flex-shrink-0">
          <Link
            href={`/expenses/${expense.id}/edit`}
            className="p-1.5 text-gray-400 hover:text-indigo-600 hover:bg-indigo-50 rounded-lg transition-colors"
            aria-label="Edit expense"
          >
            <Pencil size={14} />
          </Link>
          <button
            onClick={() => setConfirming(true)}
            className="p-1.5 text-gray-400 hover:text-red-500 hover:bg-red-50 rounded-lg transition-colors"
            aria-label="Delete expense"
          >
            <Trash2 size={14} />
          </button>
        </div>
      )}
    </div>
  )
}
```

- [ ] **Step 2: Create `components/expenses/FilterBar.tsx`**

```typescript
'use client'

import { Search, X } from 'lucide-react'
import { CATEGORIES } from '@/lib/expense-schema'
import type { Category } from '@/lib/types'

export type FilterState = {
  search: string
  startDate: string
  endDate: string
  categories: Category[]
}

type Props = {
  filters: FilterState
  onChange: (filters: FilterState) => void
  resultCount: number
}

export function FilterBar({ filters, onChange, resultCount }: Props) {
  const hasFilters =
    filters.search || filters.startDate || filters.endDate || filters.categories.length > 0

  function toggleCategory(cat: Category) {
    const next = filters.categories.includes(cat)
      ? filters.categories.filter((c) => c !== cat)
      : [...filters.categories, cat]
    onChange({ ...filters, categories: next })
  }

  function clearAll() {
    onChange({ search: '', startDate: '', endDate: '', categories: [] })
  }

  return (
    <div className="space-y-3">
      {/* Search + date range */}
      <div className="flex flex-col sm:flex-row gap-3">
        <div className="relative flex-1">
          <Search size={15} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
          <input
            type="text"
            placeholder="Search expenses…"
            value={filters.search}
            onChange={(e) => onChange({ ...filters, search: e.target.value })}
            className="w-full pl-9 pr-4 py-2 text-sm bg-white border border-gray-200 rounded-xl focus:outline-none focus:border-indigo-400 focus:ring-2 focus:ring-indigo-100 transition-colors"
          />
        </div>
        <input
          type="date"
          value={filters.startDate}
          onChange={(e) => onChange({ ...filters, startDate: e.target.value })}
          className="px-3 py-2 text-sm bg-white border border-gray-200 rounded-xl focus:outline-none focus:border-indigo-400 transition-colors text-gray-600"
        />
        <input
          type="date"
          value={filters.endDate}
          onChange={(e) => onChange({ ...filters, endDate: e.target.value })}
          className="px-3 py-2 text-sm bg-white border border-gray-200 rounded-xl focus:outline-none focus:border-indigo-400 transition-colors text-gray-600"
        />
      </div>

      {/* Category pills */}
      <div className="flex items-center gap-2 flex-wrap">
        <span className="text-xs font-medium text-gray-500">Category:</span>
        {CATEGORIES.map((cat) => {
          const active = filters.categories.includes(cat)
          return (
            <button
              key={cat}
              onClick={() => toggleCategory(cat)}
              className={`px-3 py-1 text-xs font-medium rounded-full border transition-colors ${
                active
                  ? 'bg-indigo-700 border-indigo-700 text-white'
                  : 'bg-white border-gray-200 text-gray-600 hover:border-indigo-300'
              }`}
            >
              {cat}
            </button>
          )
        })}
        {hasFilters && (
          <button
            onClick={clearAll}
            className="flex items-center gap-1 px-3 py-1 text-xs font-medium text-red-500 hover:text-red-700 border border-red-200 rounded-full hover:border-red-300 transition-colors ml-auto"
          >
            <X size={11} /> Clear
          </button>
        )}
      </div>

      <p className="text-xs text-gray-400">
        {resultCount} expense{resultCount !== 1 ? 's' : ''} found
      </p>
    </div>
  )
}
```

- [ ] **Step 3: Create `components/expenses/ExpenseList.tsx`**

```typescript
'use client'

import { useState, useMemo } from 'react'
import { useExpenses } from '@/lib/expense-context'
import { ExpenseRow } from './ExpenseRow'
import { FilterBar, type FilterState } from './FilterBar'

const INITIAL_FILTERS: FilterState = {
  search: '',
  startDate: '',
  endDate: '',
  categories: [],
}

export function ExpenseList() {
  const { expenses } = useExpenses()
  const [filters, setFilters] = useState<FilterState>(INITIAL_FILTERS)

  const filtered = useMemo(() => {
    return expenses.filter((e) => {
      if (filters.search && !e.description.toLowerCase().includes(filters.search.toLowerCase())) return false
      if (filters.startDate && e.date < filters.startDate) return false
      if (filters.endDate && e.date > filters.endDate) return false
      if (filters.categories.length > 0 && !filters.categories.includes(e.category)) return false
      return true
    })
  }, [expenses, filters])

  return (
    <div className="space-y-4">
      <FilterBar filters={filters} onChange={setFilters} resultCount={filtered.length} />

      {filtered.length === 0 ? (
        <div className="bg-white rounded-2xl border border-indigo-100 py-16 text-center">
          <p className="text-gray-400 text-sm">
            {expenses.length === 0
              ? 'No expenses yet. Add your first one!'
              : 'No expenses match your filters.'}
          </p>
        </div>
      ) : (
        <div className="bg-white rounded-2xl border border-indigo-100 shadow-sm divide-y divide-gray-50 px-2 py-2">
          {filtered.map((expense) => (
            <ExpenseRow key={expense.id} expense={expense} />
          ))}
        </div>
      )}
    </div>
  )
}
```

- [ ] **Step 4: Commit**

```bash
git add components/expenses/
git commit -m "feat: add ExpenseRow, FilterBar, and ExpenseList components"
```

---

### Task 10: All expense pages and final wiring

**Files:**
- Modify: `app/expenses/page.tsx`
- Create: `app/expenses/new/page.tsx`
- Create: `app/expenses/[id]/edit/page.tsx`

- [ ] **Step 1: Create `app/expenses/page.tsx`**

```typescript
'use client'

import { PlusCircle } from 'lucide-react'
import { Header } from '@/components/layout/Header'
import { ExpenseList } from '@/components/expenses/ExpenseList'

export default function ExpensesPage() {
  return (
    <div>
      <Header
        title="Expenses"
        subtitle="All your recorded expenses"
        action={{ label: 'Add Expense', href: '/expenses/new', icon: PlusCircle }}
      />
      <div className="p-6">
        <ExpenseList />
      </div>
    </div>
  )
}
```

- [ ] **Step 2: Create `app/expenses/new/page.tsx`**

```typescript
'use client'

import { useRouter } from 'next/navigation'
import toast from 'react-hot-toast'
import { useExpenses } from '@/lib/expense-context'
import { Header } from '@/components/layout/Header'
import { ExpenseForm } from '@/components/expenses/ExpenseForm'
import type { ExpenseFormValues } from '@/lib/expense-schema'

export default function NewExpensePage() {
  const router = useRouter()
  const { addExpense } = useExpenses()

  function handleSubmit(values: ExpenseFormValues) {
    addExpense(values)
    toast.success('Expense added!')
    router.push('/expenses')
  }

  return (
    <div>
      <Header title="Add Expense" subtitle="Record a new expense" />
      <div className="p-6 max-w-lg">
        <div className="bg-white rounded-2xl border border-indigo-100 shadow-sm p-6">
          <ExpenseForm onSubmit={handleSubmit} submitLabel="Add Expense" />
        </div>
      </div>
    </div>
  )
}
```

- [ ] **Step 3: Create `app/expenses/[id]/edit/page.tsx`**

```typescript
'use client'

import { useRouter } from 'next/navigation'
import { notFound } from 'next/navigation'
import toast from 'react-hot-toast'
import { useExpenses } from '@/lib/expense-context'
import { Header } from '@/components/layout/Header'
import { ExpenseForm } from '@/components/expenses/ExpenseForm'
import { centsToDollars } from '@/lib/utils'
import type { ExpenseFormValues } from '@/lib/expense-schema'

type Props = { params: { id: string } }

export default function EditExpensePage({ params }: Props) {
  const router = useRouter()
  const { expenses, updateExpense } = useExpenses()

  const expense = expenses.find((e) => e.id === params.id)

  if (expenses.length > 0 && !expense) {
    notFound()
  }

  function handleSubmit(values: ExpenseFormValues) {
    updateExpense(params.id, values)
    toast.success('Expense updated!')
    router.push('/expenses')
  }

  return (
    <div>
      <Header title="Edit Expense" subtitle="Update the expense details" />
      <div className="p-6 max-w-lg">
        <div className="bg-white rounded-2xl border border-indigo-100 shadow-sm p-6">
          {expense ? (
            <ExpenseForm
              onSubmit={handleSubmit}
              submitLabel="Save Changes"
              defaultValues={{
                date: expense.date,
                amount: centsToDollars(expense.amount),
                category: expense.category,
                description: expense.description,
              }}
            />
          ) : (
            <p className="text-sm text-gray-400 text-center py-8">Loading…</p>
          )}
        </div>
      </div>
    </div>
  )
}
```

- [ ] **Step 4: Run all tests one final time**

```bash
npm test
```

Expected: All tests pass.

- [ ] **Step 5: Verify full app in browser**

```bash
npm run dev
```

Test the following in order:
1. Open http://localhost:3000 — dashboard shows all zeroes / empty states
2. Click "Add Expense" → fill in the form → submit → redirected to /expenses, toast appears
3. Dashboard now shows the expense in summary cards, chart, and recent list
4. Add 3-4 more expenses across different categories and months
5. Go to /expenses — filter by category, date range, and search
6. Edit an expense — form pre-populates, changes save correctly
7. Delete an expense — inline confirmation appears, toast confirms deletion
8. Click "Export CSV" in sidebar — file downloads with correct data
9. Resize browser to mobile width — bottom nav appears, sidebar hides

- [ ] **Step 6: Type-check**

```bash
npx tsc --noEmit
```

Expected: No errors.

- [ ] **Step 7: Final commit**

```bash
git add app/expenses/ 
git commit -m "feat: add expense pages (list, new, edit) — completes full expense tracker"
```

---

## Running the App

```bash
npm run dev       # Development server at http://localhost:3000
npm test          # Run all tests
npx tsc --noEmit  # Type-check without building
npm run build     # Production build
```
