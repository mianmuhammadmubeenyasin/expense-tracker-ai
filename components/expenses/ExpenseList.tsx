'use client'

import { useState, useMemo } from 'react'
import { useExpenses } from '@/lib/expense-context'
import { ExpenseRow } from './ExpenseRow'
import { FilterBar, type FilterState } from './FilterBar'

const INITIAL_FILTERS: FilterState = {
  search: '',
  startDate: '',
  endDate: '',
  categories: [],
}

export function ExpenseList() {
  const { expenses } = useExpenses()
  const [filters, setFilters] = useState<FilterState>(INITIAL_FILTERS)

  const filtered = useMemo(() => {
    return expenses.filter((e) => {
      if (filters.search && !e.description.toLowerCase().includes(filters.search.toLowerCase())) return false
      if (filters.startDate && e.date < filters.startDate) return false
      if (filters.endDate && e.date > filters.endDate) return false
      if (filters.categories.length > 0 && !filters.categories.includes(e.category)) return false
      return true
    })
  }, [expenses, filters])

  return (
    <div className="space-y-4">
      <FilterBar filters={filters} onChange={setFilters} resultCount={filtered.length} />

      {filtered.length === 0 ? (
        <div className="bg-white rounded-2xl border border-indigo-100 py-16 text-center">
          <p className="text-gray-400 text-sm">
            {expenses.length === 0
              ? 'No expenses yet. Add your first one!'
              : 'No expenses match your filters.'}
          </p>
        </div>
      ) : (
        <div className="bg-white rounded-2xl border border-indigo-100 shadow-sm divide-y divide-gray-50 px-2 py-2">
          {filtered.map((expense) => (
            <ExpenseRow key={expense.id} expense={expense} />
          ))}
        </div>
      )}
    </div>
  )
}
