import type { Category, Expense } from './types'

export const CATEGORY_COLORS: Record<Category, string> = {
  Food: '#10B981',
  Transportation: '#3B82F6',
  Entertainment: '#8B5CF6',
  Shopping: '#F97316',
  Bills: '#EF4444',
  Other: '#6B7280',
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

export function toMonthKey(dateStr: string): string {
  return dateStr.slice(0, 7)
}

export function currentMonthKey(): string {
  const now = new Date()
  return `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, '0')}`
}

export function prevMonthKey(): string {
  const now = new Date()
  const prev = new Date(now.getFullYear(), now.getMonth() - 1, 1)
  return `${prev.getFullYear()}-${String(prev.getMonth() + 1).padStart(2, '0')}`
}

export function getMonthlyData(expenses: Expense[]): MonthlyDataPoint[] {
  const months: MonthlyDataPoint[] = []
  const now = new Date()

  for (let i = 5; i >= 0; i--) {
    const d = new Date(now.getFullYear(), now.getMonth() - i, 1)
    const key = `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}`
    const label = d.toLocaleDateString('en-US', { month: 'short' })

    const point: MonthlyDataPoint = {
      month: label, Food: 0, Transportation: 0, Entertainment: 0,
      Shopping: 0, Bills: 0, Other: 0, total: 0,
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
