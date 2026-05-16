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
