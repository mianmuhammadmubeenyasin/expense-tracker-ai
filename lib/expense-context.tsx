'use client'

import { createContext, useContext, useEffect, useState, useCallback } from 'react'
import type { Expense, ExpenseInput } from './types'
import { dollarsToCents } from './money'

type ExpenseListValue = {
  expenses: Expense[]
  isLoaded: boolean
}

type ExpenseMutationsValue = {
  addExpense: (data: ExpenseInput) => void
  updateExpense: (id: string, data: ExpenseInput) => void
  deleteExpense: (id: string) => void
}

type ExpenseContextValue = ExpenseListValue & ExpenseMutationsValue

const ExpenseContext = createContext<ExpenseContextValue | null>(null)
const STORAGE_KEY = 'expenses'

function sortByDate(list: Expense[]): Expense[] {
  return [...list].sort((a, b) =>
    b.date !== a.date ? b.date.localeCompare(a.date) : b.createdAt.localeCompare(a.createdAt)
  )
}

export function ExpenseProvider({ children }: { children: React.ReactNode }) {
  const [expenses, setExpenses] = useState<Expense[]>([])
  const [isLoaded, setIsLoaded] = useState(false)

  useEffect(() => {
    try {
      const stored = localStorage.getItem(STORAGE_KEY)
      if (stored) setExpenses(JSON.parse(stored))
    } catch {
      setExpenses([])
    }
    setIsLoaded(true)
  }, [])

  const persist = useCallback((next: Expense[]) => {
    const sorted = sortByDate(next)
    setExpenses(sorted)
    localStorage.setItem(STORAGE_KEY, JSON.stringify(sorted))
  }, [])

  const addExpense = useCallback(
    (data: ExpenseInput) => {
      const expense: Expense = {
        id: crypto.randomUUID(),
        date: data.date,
        amount: dollarsToCents(data.amount),
        category: data.category,
        description: data.description,
        createdAt: new Date().toISOString(),
      }
      persist([...expenses, expense])
    },
    [expenses, persist]
  )

  const updateExpense = useCallback(
    (id: string, data: ExpenseInput) => {
      persist(
        expenses.map((e) =>
          e.id === id
            ? { ...e, date: data.date, amount: dollarsToCents(data.amount), category: data.category, description: data.description }
            : e
        )
      )
    },
    [expenses, persist]
  )

  const deleteExpense = useCallback(
    (id: string) => persist(expenses.filter((e) => e.id !== id)),
    [expenses, persist]
  )

  return (
    <ExpenseContext.Provider value={{ expenses, isLoaded, addExpense, updateExpense, deleteExpense }}>
      {children}
    </ExpenseContext.Provider>
  )
}

function useExpenseContext(): ExpenseContextValue {
  const ctx = useContext(ExpenseContext)
  if (!ctx) throw new Error('Expense hooks must be used within ExpenseProvider')
  return ctx
}

/** Read-only: expenses list and hydration state. */
export function useExpenseList(): ExpenseListValue {
  const { expenses, isLoaded } = useExpenseContext()
  return { expenses, isLoaded }
}

/** Write-only: add, update, delete mutations. */
export function useExpenseMutations(): ExpenseMutationsValue {
  const { addExpense, updateExpense, deleteExpense } = useExpenseContext()
  return { addExpense, updateExpense, deleteExpense }
}

/** Full context — use only when both reading and writing are needed in the same component. */
export function useExpenses(): ExpenseContextValue {
  return useExpenseContext()
}
