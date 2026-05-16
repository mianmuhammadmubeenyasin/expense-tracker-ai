import { describe, it, expect, beforeEach, vi } from 'vitest'
import { render, screen, act } from '@testing-library/react'
import { ExpenseProvider, useExpenses } from '@/lib/expense-context'

const localStorageMock = (() => {
  let store: Record<string, string> = {}
  return {
    getItem: (key: string) => store[key] ?? null,
    setItem: (key: string, value: string) => { store[key] = value },
    clear: () => { store = {} },
  }
})()

Object.defineProperty(window, 'localStorage', { value: localStorageMock })

function TestConsumer({ action }: { action?: (ctx: ReturnType<typeof useExpenses>) => void }) {
  const ctx = useExpenses()
  return (
    <div>
      <span data-testid="count">{ctx.expenses.length}</span>
      <button onClick={() => action?.(ctx)}>action</button>
    </div>
  )
}

function Wrapper({ children }: { children: React.ReactNode }) {
  return <ExpenseProvider>{children}</ExpenseProvider>
}

beforeEach(() => localStorageMock.clear())

describe('useExpenses', () => {
  it('throws when used outside ExpenseProvider', () => {
    const spy = vi.spyOn(console, 'error').mockImplementation(() => {})
    expect(() => render(<TestConsumer />)).toThrow('useExpenses must be used within ExpenseProvider')
    spy.mockRestore()
  })

  it('starts with empty expenses', () => {
    render(<TestConsumer />, { wrapper: Wrapper })
    expect(screen.getByTestId('count').textContent).toBe('0')
  })

  it('addExpense increases count and persists to localStorage', async () => {
    render(
      <TestConsumer
        action={(ctx) =>
          ctx.addExpense({ date: '2024-01-15', amount: 25.5, category: 'Food', description: 'Lunch' })
        }
      />,
      { wrapper: Wrapper }
    )
    await act(async () => {
      screen.getByRole('button').click()
    })
    expect(screen.getByTestId('count').textContent).toBe('1')
    const stored = JSON.parse(localStorageMock.getItem('expenses') ?? '[]')
    expect(stored).toHaveLength(1)
    expect(stored[0].amount).toBe(2550)
  })

  it('deleteExpense removes the expense', async () => {
    render(
      <TestConsumer
        action={(ctx) => {
          if (ctx.expenses.length === 0) {
            ctx.addExpense({ date: '2024-01-15', amount: 10, category: 'Food', description: 'Test' })
          } else {
            ctx.deleteExpense(ctx.expenses[0].id)
          }
        }}
      />,
      { wrapper: Wrapper }
    )
    await act(async () => { screen.getByRole('button').click() })
    expect(screen.getByTestId('count').textContent).toBe('1')
    await act(async () => { screen.getByRole('button').click() })
    expect(screen.getByTestId('count').textContent).toBe('0')
  })
})
