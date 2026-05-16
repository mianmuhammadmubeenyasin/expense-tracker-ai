export type Category =
  | 'Food'
  | 'Transportation'
  | 'Entertainment'
  | 'Shopping'
  | 'Bills'
  | 'Other'

export type Expense = {
  id: string
  date: string       // YYYY-MM-DD
  amount: number     // stored in cents (integer)
  category: Category
  description: string
  createdAt: string  // ISO timestamp, used for stable sort
}

export type ExpenseInput = {
  date: string
  amount: number     // dollars (from form)
  category: Category
  description: string
}
