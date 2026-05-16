'use client'

import { useForm, Controller } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { DayPicker } from 'react-day-picker'
import { useState } from 'react'
import { CalendarDays, ChevronDown } from 'lucide-react'
import { expenseSchema, CATEGORIES, type ExpenseFormValues } from '@/lib/expense-schema'
import { formatDate } from '@/lib/utils'

type Props = {
  onSubmit: (values: ExpenseFormValues) => void
  defaultValues?: Partial<ExpenseFormValues>
  submitLabel?: string
  isLoading?: boolean
}

function todayISO(): string {
  const d = new Date()
  return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}-${String(d.getDate()).padStart(2, '0')}`
}

function dateToISO(date: Date): string {
  return `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, '0')}-${String(date.getDate()).padStart(2, '0')}`
}

function isoToDate(iso: string): Date {
  const [y, m, d] = iso.split('-').map(Number)
  return new Date(y, m - 1, d)
}

export function ExpenseForm({ onSubmit, defaultValues, submitLabel = 'Save Expense', isLoading }: Props) {
  const [calOpen, setCalOpen] = useState(false)

  const {
    register,
    handleSubmit,
    control,
    formState: { errors, isValid },
    watch,
  } = useForm<ExpenseFormValues>({
    resolver: zodResolver(expenseSchema),
    mode: 'onChange',
    defaultValues: {
      date: defaultValues?.date ?? todayISO(),
      amount: defaultValues?.amount,
      category: defaultValues?.category ?? 'Food',
      description: defaultValues?.description ?? '',
    },
  })

  const dateValue = watch('date')
  const descLength = watch('description')?.length ?? 0

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="space-y-5">
      {/* Date */}
      <div>
        <label className="block text-sm font-semibold text-gray-700 mb-1.5">Date</label>
        <Controller
          name="date"
          control={control}
          render={({ field }) => (
            <div className="relative">
              <button
                type="button"
                onClick={() => setCalOpen((o) => !o)}
                className="flex items-center gap-2 w-full px-4 py-2.5 bg-white border border-gray-200 rounded-xl text-sm text-left hover:border-indigo-400 transition-colors"
              >
                <CalendarDays size={16} className="text-indigo-500" />
                {field.value ? formatDate(field.value) : 'Select date'}
                <ChevronDown size={14} className="ml-auto text-gray-400" />
              </button>
              {calOpen && (
                <div className="absolute z-50 mt-1 bg-white border border-gray-200 rounded-xl shadow-lg p-2">
                  <DayPicker
                    mode="single"
                    selected={field.value ? isoToDate(field.value) : undefined}
                    onSelect={(date) => {
                      if (date) {
                        field.onChange(dateToISO(date))
                        setCalOpen(false)
                      }
                    }}
                    disabled={{ after: new Date() }}
                    modifiersClassNames={{ selected: 'rdp-day_selected' }}
                  />
                </div>
              )}
            </div>
          )}
        />
        {errors.date && <p className="mt-1 text-xs text-red-500">{errors.date.message}</p>}
      </div>

      {/* Amount */}
      <div>
        <label className="block text-sm font-semibold text-gray-700 mb-1.5">Amount (USD)</label>
        <div className="relative">
          <span className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400 font-medium">$</span>
          <input
            {...register('amount', { valueAsNumber: true })}
            type="number"
            step="0.01"
            min="0.01"
            max="1000000"
            placeholder="0.00"
            className="w-full pl-8 pr-4 py-2.5 bg-white border border-gray-200 rounded-xl text-sm focus:outline-none focus:border-indigo-400 focus:ring-2 focus:ring-indigo-100 transition-colors tabular-nums"
          />
        </div>
        {errors.amount && <p className="mt-1 text-xs text-red-500">{errors.amount.message}</p>}
      </div>

      {/* Category */}
      <div>
        <label className="block text-sm font-semibold text-gray-700 mb-1.5">Category</label>
        <select
          {...register('category')}
          className="w-full px-4 py-2.5 bg-white border border-gray-200 rounded-xl text-sm focus:outline-none focus:border-indigo-400 focus:ring-2 focus:ring-indigo-100 transition-colors appearance-none"
        >
          {CATEGORIES.map((cat) => (
            <option key={cat} value={cat}>{cat}</option>
          ))}
        </select>
        {errors.category && <p className="mt-1 text-xs text-red-500">{errors.category.message}</p>}
      </div>

      {/* Description */}
      <div>
        <div className="flex items-center justify-between mb-1.5">
          <label className="text-sm font-semibold text-gray-700">Description</label>
          <span className={`text-xs ${descLength > 180 ? 'text-amber-500' : 'text-gray-400'}`}>
            {descLength}/200
          </span>
        </div>
        <input
          {...register('description')}
          type="text"
          placeholder="What did you spend on?"
          maxLength={200}
          className="w-full px-4 py-2.5 bg-white border border-gray-200 rounded-xl text-sm focus:outline-none focus:border-indigo-400 focus:ring-2 focus:ring-indigo-100 transition-colors"
        />
        {errors.description && <p className="mt-1 text-xs text-red-500">{errors.description.message}</p>}
      </div>

      <button
        type="submit"
        disabled={isLoading || !isValid}
        className="w-full py-3 bg-indigo-700 hover:bg-indigo-800 disabled:bg-indigo-400 text-white font-semibold rounded-xl transition-colors"
      >
        {isLoading ? 'Saving…' : submitLabel}
      </button>
    </form>
  )
}
