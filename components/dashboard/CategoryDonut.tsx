'use client'

import dynamic from 'next/dynamic'
import { CATEGORY_COLORS, formatCurrency } from '@/lib/utils'
import type { Category } from '@/lib/types'

const PieChart = dynamic(() => import('recharts').then((m) => m.PieChart), { ssr: false }) as any
// eslint-disable-next-line @typescript-eslint/no-explicit-any
const Pie = dynamic(() => import('recharts').then((m) => m.Pie as any), { ssr: false }) as any
const Cell = dynamic(() => import('recharts').then((m) => m.Cell), { ssr: false }) as any
// eslint-disable-next-line @typescript-eslint/no-explicit-any
const Tooltip = dynamic(() => import('recharts').then((m) => m.Tooltip as any), { ssr: false }) as any
const ResponsiveContainer = dynamic(() => import('recharts').then((m) => m.ResponsiveContainer), { ssr: false }) as any

type Props = {
  data: { category: Category; total: number }[]
  monthLabel: string
}

export function CategoryDonut({ data, monthLabel }: Props) {
  const totalCents = data.reduce((sum, d) => sum + d.total, 0)

  if (data.length === 0) {
    return (
      <div className="bg-white rounded-2xl p-6 border border-indigo-100 shadow-sm">
        <h2 className="text-base font-semibold text-gray-900 mb-1">This Month</h2>
        <p className="text-xs text-gray-400 mb-4">{monthLabel}</p>
        <div className="h-48 flex items-center justify-center text-gray-400 text-sm">
          No spending this month yet.
        </div>
      </div>
    )
  }

  const chartData = data.map((d) => ({
    name: d.category,
    value: d.total,
  }))

  return (
    <div className="bg-white rounded-2xl p-6 border border-indigo-100 shadow-sm">
      <h2 className="text-base font-semibold text-gray-900 mb-1">This Month</h2>
      <p className="text-xs text-gray-400 mb-4">{monthLabel}</p>
      <div className="flex gap-6 items-center">
        <ResponsiveContainer width={140} height={140}>
          <PieChart>
            <Pie
              data={chartData}
              cx="50%"
              cy="50%"
              innerRadius={42}
              outerRadius={64}
              paddingAngle={2}
              dataKey="value"
            >
              {chartData.map((entry) => (
                <Cell key={entry.name} fill={CATEGORY_COLORS[entry.name as Category]} />
              ))}
            </Pie>
            <Tooltip
              formatter={(value: number) => [formatCurrency(value), '']}
              contentStyle={{ borderRadius: 8, border: '1px solid #E0E7FF', fontSize: 12 }}
            />
          </PieChart>
        </ResponsiveContainer>
        <div className="flex-1 space-y-2">
          {data.map(({ category, total }) => (
            <div key={category} className="flex items-center justify-between text-sm">
              <div className="flex items-center gap-2">
                <div className="w-2 h-2 rounded-full" style={{ background: CATEGORY_COLORS[category] }} />
                <span className="text-gray-600">{category}</span>
              </div>
              <span className="tabular-nums font-medium text-gray-900">{formatCurrency(total)}</span>
            </div>
          ))}
          <div className="border-t border-gray-100 pt-2 flex items-center justify-between text-sm">
            <span className="font-semibold text-gray-900">Total</span>
            <span className="tabular-nums font-bold text-amber-600">{formatCurrency(totalCents)}</span>
          </div>
        </div>
      </div>
    </div>
  )
}
