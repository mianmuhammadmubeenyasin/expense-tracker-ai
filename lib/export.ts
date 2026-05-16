import type { Expense } from './types'

export function downloadBlob(blob: Blob, filename: string): void {
  const url = URL.createObjectURL(blob)
  const a = document.createElement('a')
  a.href = url
  a.download = filename
  a.click()
  URL.revokeObjectURL(url)
}

export function exportCSV(expenses: Expense[]): void {
  const headers = ['Date', 'Amount (USD)', 'Category', 'Description']
  const rows = expenses.map((e) => [
    e.date,
    (e.amount / 100).toFixed(2),
    e.category,
    `"${e.description.replace(/"/g, '""')}"`,
  ])
  const csv = [headers.join(','), ...rows.map((r) => r.join(','))].join('\n')
  downloadBlob(
    new Blob([csv], { type: 'text/csv;charset=utf-8;' }),
    `expenses-${new Date().toISOString().slice(0, 10)}.csv`
  )
}
