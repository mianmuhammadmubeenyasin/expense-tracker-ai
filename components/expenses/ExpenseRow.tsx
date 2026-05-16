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
          <span className="text-xs text-gray-500 mr-1">Are you sure?</span>
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
