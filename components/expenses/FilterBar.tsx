'use client'

import { Search, X } from 'lucide-react'
import { CATEGORIES } from '@/lib/expense-schema'
import type { Category } from '@/lib/types'

export type FilterState = {
  search: string
  startDate: string
  endDate: string
  categories: Category[]
}

type Props = {
  filters: FilterState
  onChange: (filters: FilterState) => void
  resultCount: number
}

export function FilterBar({ filters, onChange, resultCount }: Props) {
  const hasFilters =
    filters.search || filters.startDate || filters.endDate || filters.categories.length > 0

  function toggleCategory(cat: Category) {
    const next = filters.categories.includes(cat)
      ? filters.categories.filter((c) => c !== cat)
      : [...filters.categories, cat]
    onChange({ ...filters, categories: next })
  }

  function clearAll() {
    onChange({ search: '', startDate: '', endDate: '', categories: [] })
  }

  return (
    <div className="space-y-3">
      {/* Search + date range */}
      <div className="flex flex-col sm:flex-row gap-3">
        <div className="relative flex-1">
          <Search size={15} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
          <input
            type="text"
            placeholder="Search expenses…"
            value={filters.search}
            onChange={(e) => onChange({ ...filters, search: e.target.value })}
            className="w-full pl-9 pr-4 py-2 text-sm bg-white border border-gray-200 rounded-xl focus:outline-none focus:border-indigo-400 focus:ring-2 focus:ring-indigo-100 transition-colors"
          />
        </div>
        <input
          type="date"
          value={filters.startDate}
          onChange={(e) => onChange({ ...filters, startDate: e.target.value })}
          className="px-3 py-2 text-sm bg-white border border-gray-200 rounded-xl focus:outline-none focus:border-indigo-400 transition-colors text-gray-600"
        />
        <input
          type="date"
          value={filters.endDate}
          onChange={(e) => onChange({ ...filters, endDate: e.target.value })}
          className="px-3 py-2 text-sm bg-white border border-gray-200 rounded-xl focus:outline-none focus:border-indigo-400 transition-colors text-gray-600"
        />
      </div>

      {/* Category pills */}
      <div className="flex items-center gap-2 flex-wrap">
        <span className="text-xs font-medium text-gray-500">Category:</span>
        {CATEGORIES.map((cat) => {
          const active = filters.categories.includes(cat)
          return (
            <button
              key={cat}
              onClick={() => toggleCategory(cat)}
              className={`px-3 py-1 text-xs font-medium rounded-full border transition-colors ${
                active
                  ? 'bg-indigo-700 border-indigo-700 text-white'
                  : 'bg-white border-gray-200 text-gray-600 hover:border-indigo-300'
              }`}
            >
              {cat}
            </button>
          )
        })}
        {hasFilters && (
          <button
            onClick={clearAll}
            className="flex items-center gap-1 px-3 py-1 text-xs font-medium text-red-500 hover:text-red-700 border border-red-200 rounded-full hover:border-red-300 transition-colors ml-auto"
          >
            <X size={11} /> Clear
          </button>
        )}
      </div>

      <p className="text-xs text-gray-400">
        {resultCount} expense{resultCount !== 1 ? 's' : ''} found
      </p>
    </div>
  )
}
