'use client'

import { createContext, useContext, useEffect, useState, useCallback } from 'react'
import type { Expense, ExpenseInput } from './types'
import { dollarsToCents, exportCSV } from './utils'

type ExpenseContextValue = {
  expenses: Expense[]
  isLoaded: boolean
  addExpense: (data: ExpenseInput) => void
  updateExpense: (id: string, data: ExpenseInput) => void
  deleteExpense: (id: string) => void
  exportExpenses: () => void
}

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
            ? {
                ...e,
                date: data.date,
                amount: dollarsToCents(data.amount),
                category: data.category,
                description: data.description,
              }
            : e
        )
      )
    },
    [expenses, persist]
  )

  const deleteExpense = useCallback(
    (id: string) => {
      persist(expenses.filter((e) => e.id !== id))
    },
    [expenses, persist]
  )

  const exportExpenses = useCallback(() => {
    exportCSV(expenses)
  }, [expenses])

  return (
    <ExpenseContext.Provider value={{ expenses, isLoaded, addExpense, updateExpense, deleteExpense, exportExpenses }}>
      {children}
    </ExpenseContext.Provider>
  )
}

export function useExpenses(): ExpenseContextValue {
  const ctx = useContext(ExpenseContext)
  if (!ctx) throw new Error('useExpenses must be used within ExpenseProvider')
  return ctx
}
