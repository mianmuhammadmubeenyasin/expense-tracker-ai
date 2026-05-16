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
