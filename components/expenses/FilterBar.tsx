'use client'

import { useEffect, useRef, useState } from 'react'
import { Search, X, ChevronDown } from 'lucide-react'
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

  const [dropdownOpen, setDropdownOpen] = useState(false)
  const dropdownRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    function handleClickOutside(e: MouseEvent) {
      if (dropdownRef.current && !dropdownRef.current.contains(e.target as Node)) {
        setDropdownOpen(false)
      }
    }
    document.addEventListener('mousedown', handleClickOutside)
    return () => document.removeEventListener('mousedown', handleClickOutside)
  }, [])

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

      {/* Category dropdown */}
      <div className="flex items-center gap-2 flex-wrap">
        <span className="text-xs font-medium text-gray-500">Category:</span>
        <div className="relative" ref={dropdownRef}>
          <button
            type="button"
            onClick={() => setDropdownOpen((o) => !o)}
            className="flex items-center gap-2 px-3 py-1.5 text-xs font-medium bg-white border border-gray-200 rounded-xl hover:border-indigo-300 transition-colors"
          >
            {filters.categories.length === 0
              ? 'All Categories'
              : `${filters.categories.length} selected`}
            <ChevronDown size={12} className="text-gray-400" />
          </button>
          {dropdownOpen && (
            <div className="absolute z-50 mt-1 bg-white border border-gray-200 rounded-xl shadow-lg p-2 min-w-[160px]">
              {CATEGORIES.map((cat) => {
                const checked = filters.categories.includes(cat)
                return (
                  <label
                    key={cat}
                    className="flex items-center gap-2 px-2 py-1.5 text-xs text-gray-700 hover:bg-indigo-50 rounded-lg cursor-pointer"
                  >
                    <input
                      type="checkbox"
                      checked={checked}
                      onChange={() => toggleCategory(cat)}
                      className="accent-indigo-700"
                    />
                    {cat}
                  </label>
                )
              })}
            </div>
          )}
        </div>
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
