'use client'

import { useExpenseList } from '@/lib/expense-context'
import { formatCurrency } from '@/lib/format'
import { CATEGORY_COLORS } from '@/lib/chart'
import type { Category } from '@/lib/types'

type CategoryRow = {
  category: Category
  total: number
  percentage: number
}

function computeRows(expenses: { category: Category; amount: number }[]): CategoryRow[] {
  const totals: Partial<Record<Category, number>> = {}
  for (const e of expenses) {
    totals[e.category] = (totals[e.category] ?? 0) + e.amount
  }

  const grandTotal = Object.values(totals).reduce((sum, v) => sum + (v ?? 0), 0)
  if (grandTotal === 0) return []

  return (Object.entries(totals) as [Category, number][])
    .map(([category, total]) => ({
      category,
      total,
      percentage: Math.round((total / grandTotal) * 100),
    }))
    .sort((a, b) => b.total - a.total)
}

export default function TopCategoriesPage() {
  const { expenses, isLoaded } = useExpenseList()

  if (!isLoaded) {
    return (
      <div className="p-6 lg:p-8">
        <div className="animate-pulse space-y-4">
          {[...Array(4)].map((_, i) => (
            <div key={i} className="h-16 bg-indigo-100 rounded-xl" />
          ))}
        </div>
      </div>
    )
  }

  const rows = computeRows(expenses)

  return (
    <div className="p-6 lg:p-8 max-w-2xl">
      <h1 className="text-2xl font-bold text-indigo-900 mb-1">Top Categories</h1>
      <p className="text-sm text-indigo-400 mb-6">All-time spending by category</p>

      {rows.length === 0 ? (
        <div className="text-center py-16 text-indigo-300 text-sm">No expenses yet.</div>
      ) : (
        <ol className="space-y-3">
          {rows.map((row, i) => (
            <li key={row.category} className="bg-white rounded-xl shadow-sm border border-indigo-50 p-4">
              <div className="flex items-center gap-3 mb-2">
                <span className="text-xs font-bold text-indigo-300 w-5 text-right">{i + 1}</span>
                <span
                  className="w-3 h-3 rounded-full flex-shrink-0"
                  style={{ backgroundColor: CATEGORY_COLORS[row.category] }}
                />
                <span className="flex-1 font-medium text-indigo-900">{row.category}</span>
                <span className="text-sm text-indigo-400">{row.percentage}%</span>
                <span className="font-semibold text-indigo-900 tabular-nums">
                  {formatCurrency(row.total)}
                </span>
              </div>
              <div className="ml-8 h-2 bg-indigo-50 rounded-full overflow-hidden">
                <div
                  className="h-full rounded-full transition-all"
                  style={{
                    width: `${row.percentage}%`,
                    backgroundColor: CATEGORY_COLORS[row.category],
                  }}
                />
              </div>
            </li>
          ))}
        </ol>
      )}
    </div>
  )
}
