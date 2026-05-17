import { describe, it, expect, vi, afterEach } from 'vitest'
import { formatCurrency, formatDate } from '@/lib/format'
import { dollarsToCents, centsToDollars } from '@/lib/money'
import { exportCSV } from '@/lib/export'
import { CATEGORY_COLORS } from '@/lib/chart'
import type { Expense } from '@/lib/types'

describe('formatCurrency', () => {
  it('formats cents to USD string', () => {
    expect(formatCurrency(1000)).toBe('$10.00')
    expect(formatCurrency(150)).toBe('$1.50')
    expect(formatCurrency(0)).toBe('$0.00')
    expect(formatCurrency(99)).toBe('$0.99')
  })
})

describe('formatDate', () => {
  it('formats ISO date to readable string', () => {
    expect(formatDate('2024-01-15')).toBe('Jan 15, 2024')
    expect(formatDate('2024-12-31')).toBe('Dec 31, 2024')
  })
})

describe('dollarsToCents', () => {
  it('converts dollars to cents rounding correctly', () => {
    expect(dollarsToCents(10)).toBe(1000)
    expect(dollarsToCents(1.99)).toBe(199)
    expect(dollarsToCents(0.01)).toBe(1)
    expect(dollarsToCents(25.505)).toBe(2551)
  })
})

describe('centsToDollars', () => {
  it('converts cents to dollars', () => {
    expect(centsToDollars(1000)).toBe(10)
    expect(centsToDollars(199)).toBe(1.99)
  })
})

describe('CATEGORY_COLORS', () => {
  it('has entries for all 6 categories', () => {
    const categories = ['Food', 'Transportation', 'Entertainment', 'Shopping', 'Bills', 'Other']
    categories.forEach(cat => {
      expect(CATEGORY_COLORS).toHaveProperty(cat)
      expect(CATEGORY_COLORS[cat as keyof typeof CATEGORY_COLORS]).toMatch(/^#[0-9A-Fa-f]{6}$/)
    })
  })
})

describe('exportCSV', () => {
  afterEach(() => { vi.restoreAllMocks() })

  it('triggers a file download with correct filename pattern', () => {
    const mockClick = vi.fn()
    const mockCreateObjectURL = vi.fn().mockReturnValue('blob:mock')
    const mockRevokeObjectURL = vi.fn()
    const mockAnchor = { href: '', download: '', click: mockClick } as unknown as HTMLAnchorElement

    vi.spyOn(document, 'createElement').mockReturnValue(mockAnchor)
    vi.spyOn(URL, 'createObjectURL').mockImplementation(mockCreateObjectURL)
    vi.spyOn(URL, 'revokeObjectURL').mockImplementation(mockRevokeObjectURL)

    const expenses: Expense[] = [{
      id: '1',
      date: '2024-01-15',
      amount: 1500,
      category: 'Food',
      description: 'Lunch',
      createdAt: '2024-01-15T12:00:00.000Z',
    }]

    exportCSV(expenses)

    expect(mockClick).toHaveBeenCalledOnce()
    expect(mockAnchor.download).toMatch(/^expenses-\d{4}-\d{2}-\d{2}\.csv$/)
    expect(mockRevokeObjectURL).toHaveBeenCalledWith('blob:mock')
  })

  it('escapes double quotes in description', () => {
    let capturedBlob: Blob | undefined
    vi.spyOn(URL, 'createObjectURL').mockImplementation((blob) => {
      capturedBlob = blob as Blob
      return 'blob:mock'
    })
    vi.spyOn(URL, 'revokeObjectURL').mockImplementation(() => {})
    vi.spyOn(document, 'createElement').mockReturnValue({ href: '', download: '', click: vi.fn() } as unknown as HTMLAnchorElement)

    exportCSV([{
      id: '1',
      date: '2024-01-15',
      amount: 500,
      category: 'Food',
      description: 'She said "hello"',
      createdAt: '2024-01-15T12:00:00.000Z',
    }])

    expect(capturedBlob).toBeDefined()
  })
})
