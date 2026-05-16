'use client'

import dynamic from 'next/dynamic'
import { CATEGORY_COLORS, formatCurrency } from '@/lib/utils'
import type { MonthlyDataPoint } from '@/lib/utils'
import { CATEGORIES } from '@/lib/expense-schema'
import type { Category } from '@/lib/types'

const BarChart = dynamic(() => import('recharts').then((m) => m.BarChart), { ssr: false }) as any
// eslint-disable-next-line @typescript-eslint/no-explicit-any
const Bar = dynamic(() => import('recharts').then((m) => m.Bar as any), { ssr: false }) as any
// eslint-disable-next-line @typescript-eslint/no-explicit-any
const XAxis = dynamic(() => import('recharts').then((m) => m.XAxis as any), { ssr: false }) as any
// eslint-disable-next-line @typescript-eslint/no-explicit-any
const YAxis = dynamic(() => import('recharts').then((m) => m.YAxis as any), { ssr: false }) as any
// eslint-disable-next-line @typescript-eslint/no-explicit-any
const Tooltip = dynamic(() => import('recharts').then((m) => m.Tooltip as any), { ssr: false }) as any
const ResponsiveContainer = dynamic(() => import('recharts').then((m) => m.ResponsiveContainer), { ssr: false }) as any

type Props = { data: MonthlyDataPoint[] }

export function SpendingChart({ data }: Props) {
  const hasData = data.some((d) => d.total > 0)

  if (!hasData) {
    return (
      <div className="bg-white rounded-2xl p-6 border border-indigo-100 shadow-sm">
        <h2 className="text-base font-semibold text-gray-900 mb-4">Monthly Spending</h2>
        <div className="h-48 flex items-center justify-center text-gray-400 text-sm">
          No expenses yet — add your first expense to see trends.
        </div>
      </div>
    )
  }

  return (
    <div className="bg-white rounded-2xl p-6 border border-indigo-100 shadow-sm">
      <h2 className="text-base font-semibold text-gray-900 mb-4">Monthly Spending</h2>
      <ResponsiveContainer width="100%" height={220}>
        <BarChart data={data} margin={{ top: 0, right: 0, left: -10, bottom: 0 }}>
          <XAxis dataKey="month" tick={{ fontSize: 12, fill: '#9CA3AF' }} axisLine={false} tickLine={false} />
          <YAxis
            tickFormatter={(v: any) => `$${(v / 100).toFixed(0)}`}
            tick={{ fontSize: 11, fill: '#9CA3AF' }}
            axisLine={false}
            tickLine={false}
          />
          <Tooltip
            formatter={(value: number) => [formatCurrency(value), '']}
            contentStyle={{ borderRadius: 8, border: '1px solid #E0E7FF', fontSize: 12 }}
          />
          {CATEGORIES.map((cat) => (
            <Bar key={cat} dataKey={cat} stackId="a" fill={CATEGORY_COLORS[cat]} radius={[4, 4, 0, 0]} />
          ))}
        </BarChart>
      </ResponsiveContainer>
      <div className="flex flex-wrap gap-3 mt-3">
        {CATEGORIES.map((cat) => (
          <div key={cat} className="flex items-center gap-1.5 text-xs text-gray-500">
            <div className="w-2.5 h-2.5 rounded-full" style={{ background: CATEGORY_COLORS[cat] }} />
            {cat}
          </div>
        ))}
      </div>
    </div>
  )
}
