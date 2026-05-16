import Link from 'next/link'
import { ArrowRight } from 'lucide-react'
import { formatCurrency, formatDate } from '@/lib/format'
import { CATEGORY_COLORS } from '@/lib/chart'
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
