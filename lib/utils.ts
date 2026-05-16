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

// Returns today's date as YYYY-MM-DD
export function todayISO(): string {
  const d = new Date()
  return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}-${String(d.getDate()).padStart(2, '0')}`
}

// Formats a Date as YYYY-MM-DD
export function dateToISO(date: Date): string {
  return `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, '0')}-${String(date.getDate()).padStart(2, '0')}`
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
