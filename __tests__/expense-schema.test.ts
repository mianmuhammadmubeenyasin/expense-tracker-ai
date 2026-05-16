import { describe, it, expect } from 'vitest'
import { expenseSchema } from '@/lib/expense-schema'

describe('expenseSchema', () => {
  const valid = { date: '2024-01-15', amount: 25.50, category: 'Food', description: 'Lunch' }

  it('accepts valid expense data', () => {
    expect(expenseSchema.safeParse(valid).success).toBe(true)
  })

  it('rejects amount of 0', () => {
    const result = expenseSchema.safeParse({ ...valid, amount: 0 })
    expect(result.success).toBe(false)
    if (!result.success) expect(result.error.issues[0].path).toContain('amount')
  })

  it('rejects amount above 1000000', () => {
    const result = expenseSchema.safeParse({ ...valid, amount: 1_000_001 })
    expect(result.success).toBe(false)
  })

  it('rejects empty description', () => {
    const result = expenseSchema.safeParse({ ...valid, description: '' })
    expect(result.success).toBe(false)
  })

  it('rejects description over 200 characters', () => {
    const result = expenseSchema.safeParse({ ...valid, description: 'a'.repeat(201) })
    expect(result.success).toBe(false)
  })

  it('rejects invalid category', () => {
    const result = expenseSchema.safeParse({ ...valid, category: 'Groceries' })
    expect(result.success).toBe(false)
  })

  it('rejects malformed date', () => {
    const result = expenseSchema.safeParse({ ...valid, date: 'not-a-date' })
    expect(result.success).toBe(false)
  })
})
