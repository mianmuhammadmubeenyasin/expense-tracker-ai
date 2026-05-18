'use client'

import { useExpenseList } from '@/lib/expense-context'
import { formatCurrency } from '@/lib/format'

type VendorRow = {
  name: string
  total: number
  count: number
  percentage: number
}

function computeRows(expenses: { description: string; amount: number }[]): VendorRow[] {
  const totals: Record<string, { total: number; count: number; display: string }> = {}

  for (const e of expenses) {
    const key = e.description.toLowerCase()
    if (!totals[key]) {
      totals[key] = { total: 0, count: 0, display: e.description }
    }
    totals[key].total += e.amount
    totals[key].count += 1
    totals[key].display = e.description
  }

  const grandTotal = Object.values(totals).reduce((sum, v) => sum + v.total, 0)
  if (grandTotal === 0) return []

  return Object.values(totals)
    .map((v) => ({
      name: v.display,
      total: v.total,
      count: v.count,
      percentage: Math.round((v.total / grandTotal) * 100),
    }))
    .sort((a, b) => b.total - a.total)
}

export default function TopVendorsPage() {
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
      <h1 className="text-2xl font-bold text-indigo-900 mb-1">Top Vendors</h1>
      <p className="text-sm text-indigo-400 mb-6">All-time spending by vendor</p>

      {rows.length === 0 ? (
        <div className="text-center py-16 text-indigo-300 text-sm">No expenses yet.</div>
      ) : (
        <ol className="space-y-3">
          {rows.map((row, i) => (
            <li key={row.name} className="bg-white rounded-xl shadow-sm border border-indigo-50 p-4">
              <div className="flex items-center gap-3 mb-2">
                <span className="text-xs font-bold text-indigo-300 w-5 text-right">{i + 1}</span>
                <span className="flex-1 font-medium text-indigo-900 truncate">{row.name}</span>
                <span className="text-xs text-indigo-400 whitespace-nowrap">
                  {row.count} {row.count === 1 ? 'tx' : 'txs'}
                </span>
                <span className="text-sm text-indigo-400">{row.percentage}%</span>
                <span className="font-semibold text-indigo-900 tabular-nums">
                  {formatCurrency(row.total)}
                </span>
              </div>
              <div className="ml-8 h-2 bg-indigo-50 rounded-full overflow-hidden">
                <div
                  className="h-full rounded-full bg-indigo-500 transition-all"
                  style={{ width: `${row.percentage}%` }}
                />
              </div>
            </li>
          ))}
        </ol>
      )}
    </div>
  )
}
