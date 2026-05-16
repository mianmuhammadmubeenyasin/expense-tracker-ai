'use client'

import { Download } from 'lucide-react'
import toast from 'react-hot-toast'
import { useExpenseList } from '@/lib/expense-context'
import { exportCSV } from '@/lib/export'

type Props = { variant?: 'sidebar' | 'mobile' }

export function ExportAction({ variant = 'sidebar' }: Props) {
  const { expenses } = useExpenseList()

  function handleExport() {
    if (expenses.length === 0) {
      toast.error('No expenses to export')
      return
    }
    exportCSV(expenses)
    toast.success('CSV exported!')
  }

  if (variant === 'mobile') {
    return (
      <button
        onClick={handleExport}
        className="flex flex-col items-center gap-0.5 px-4 py-1.5 rounded-lg text-indigo-300"
      >
        <Download size={20} />
        <span className="text-xs">Export</span>
      </button>
    )
  }

  return (
    <button
      onClick={handleExport}
      className="flex items-center gap-3 w-full px-3 py-2.5 rounded-lg text-sm font-medium text-indigo-200 hover:bg-indigo-800 hover:text-white transition-colors"
    >
      <Download size={18} />
      Export CSV
    </button>
  )
}
