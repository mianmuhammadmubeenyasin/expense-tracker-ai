import { z } from 'zod'
import type { Category } from './types'

export const CATEGORIES: Category[] = [
  'Food',
  'Transportation',
  'Entertainment',
  'Shopping',
  'Bills',
  'Other',
]

export const expenseSchema = z.object({
  date: z.string().regex(/^\d{4}-\d{2}-\d{2}$/, 'Invalid date format'),
  amount: z
    .number({ invalid_type_error: 'Amount must be a number' })
    .min(0.01, 'Amount must be at least $0.01')
    .max(1_000_000, 'Amount cannot exceed $1,000,000'),
  category: z.enum(
    ['Food', 'Transportation', 'Entertainment', 'Shopping', 'Bills', 'Other'],
    { errorMap: () => ({ message: 'Select a category' }) }
  ),
  description: z
    .string()
    .min(1, 'Description is required')
    .max(200, 'Description cannot exceed 200 characters'),
})

export type ExpenseFormValues = z.infer<typeof expenseSchema>
