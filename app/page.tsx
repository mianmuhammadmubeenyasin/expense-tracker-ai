'use client'

import { useMemo } from 'react'
import { DollarSign, Calendar, Tag } from 'lucide-react'
import { useExpenseList } from '@/lib/expense-context'
import { formatCurrency } from '@/lib/format'
import { getMonthlyData, getCategoryTotals, currentMonthKey, prevMonthKey } from '@/lib/chart'
import { Header } from '@/components/layout/Header'
import { SummaryCard } from '@/components/dashboard/SummaryCard'
import { SpendingChart } from '@/components/dashboard/SpendingChart'
import { CategoryDonut } from '@/components/dashboard/CategoryDonut'
import { RecentExpenses } from '@/components/dashboard/RecentExpenses'

export default function DashboardPage() {
  const { expenses } = useExpenseList()

  const thisMonthKey = currentMonthKey()
  const lastMonthKey = prevMonthKey()

  const totalSpent = useMemo(() => expenses.reduce((sum, e) => sum + e.amount, 0), [expenses])

  const thisMonthTotal = useMemo(
    () => expenses.filter((e) => e.date.startsWith(thisMonthKey)).reduce((sum, e) => sum + e.amount, 0),
    [expenses, thisMonthKey]
  )

  const lastMonthTotal = useMemo(
    () => expenses.filter((e) => e.date.startsWith(lastMonthKey)).reduce((sum, e) => sum + e.amount, 0),
    [expenses, lastMonthKey]
  )

  const monthlyData = useMemo(() => getMonthlyData(expenses), [expenses])

  const categoryTotals = useMemo(() => getCategoryTotals(expenses, thisMonthKey), [expenses, thisMonthKey])

  const topCategory: string = categoryTotals[0]?.category ?? '—'

  const trend = useMemo(() => {
    if (lastMonthTotal === 0) return undefined
    const pct = Math.round(((thisMonthTotal - lastMonthTotal) / lastMonthTotal) * 100)
    return {
      direction: (pct > 0 ? 'up' : pct < 0 ? 'down' : 'neutral') as 'up' | 'down' | 'neutral',
      label: `${Math.abs(pct)}% vs last month`,
    }
  }, [thisMonthTotal, lastMonthTotal])

  const monthLabel = new Date().toLocaleDateString('en-US', { month: 'long', year: 'numeric' })

  return (
    <div>
      <Header title="Dashboard" subtitle={`Welcome back — here's your spending overview`} />
      <div className="p-6 space-y-6">
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
          <SummaryCard
            title="Total Spent"
            value={formatCurrency(totalSpent)}
            subtitle={`${expenses.length} expense${expenses.length !== 1 ? 's' : ''}`}
            icon={DollarSign}
          />
          <SummaryCard
            title="This Month"
            value={formatCurrency(thisMonthTotal)}
            icon={Calendar}
            trend={trend}
            subtitle={monthLabel}
          />
          <SummaryCard
            title="Top Category"
            value={topCategory}
            subtitle={topCategory !== '—' ? formatCurrency(categoryTotals[0]?.total ?? 0) : 'No data yet'}
            icon={Tag}
            iconColor="text-amber-500"
          />
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-5 gap-6">
          <div className="lg:col-span-3">
            <SpendingChart data={monthlyData} />
          </div>
          <div className="lg:col-span-2">
            <CategoryDonut data={categoryTotals} monthLabel={monthLabel} />
          </div>
        </div>

        <RecentExpenses expenses={expenses} />
      </div>
    </div>
  )
}
