'use client'

import { useRouter } from 'next/navigation'
import { notFound } from 'next/navigation'
import toast from 'react-hot-toast'
import { useExpenseList, useExpenseMutations } from '@/lib/expense-context'
import { Header } from '@/components/layout/Header'
import { ExpenseForm } from '@/components/expenses/ExpenseForm'
import { centsToDollars } from '@/lib/money'
import type { ExpenseFormValues } from '@/lib/expense-schema'

type Props = { params: { id: string } }

export default function EditExpensePage({ params }: Props) {
  const router = useRouter()
  const { expenses, isLoaded } = useExpenseList()
  const { updateExpense } = useExpenseMutations()

  if (!isLoaded) {
    return <div className="flex items-center justify-center h-64 text-gray-500">Loading...</div>
  }

  const expense = expenses.find((e) => e.id === params.id)
  if (!expense) {
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
          <ExpenseForm
            onSubmit={handleSubmit}
            submitLabel="Save Changes"
            defaultValues={{
              date: expense!.date,
              amount: centsToDollars(expense!.amount),
              category: expense!.category,
              description: expense!.description,
            }}
          />
        </div>
      </div>
    </div>
  )
}
