'use client'

import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { LayoutDashboard, List, PlusCircle, Download } from 'lucide-react'
import { useExpenses } from '@/lib/expense-context'
import toast from 'react-hot-toast'

const navItems = [
  { href: '/', label: 'Dashboard', icon: LayoutDashboard },
  { href: '/expenses', label: 'Expenses', icon: List },
  { href: '/expenses/new', label: 'Add Expense', icon: PlusCircle },
]

export function Sidebar() {
  const pathname = usePathname()
  const { expenses, exportExpenses } = useExpenses()

  function handleExport() {
    if (expenses.length === 0) {
      toast.error('No expenses to export')
      return
    }
    exportExpenses()
    toast.success('CSV exported!')
  }

  return (
    <>
      {/* Desktop sidebar */}
      <aside className="hidden lg:flex flex-col fixed inset-y-0 left-0 w-64 bg-indigo-900 text-white z-40">
        <div className="flex items-center gap-3 px-6 py-6 border-b border-indigo-800">
          <div className="w-8 h-8 rounded-lg bg-amber-400 flex items-center justify-center text-indigo-900 font-bold text-sm">
            ET
          </div>
          <span className="font-semibold text-lg">Expense Tracker</span>
        </div>

        <nav className="flex-1 px-4 py-6 space-y-1">
          {navItems.map(({ href, label, icon: Icon }) => {
            const active = pathname === href
            return (
              <Link
                key={href}
                href={href}
                className={`flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium transition-colors ${
                  active
                    ? 'bg-indigo-700 text-white'
                    : 'text-indigo-200 hover:bg-indigo-800 hover:text-white'
                }`}
              >
                <Icon size={18} />
                {label}
              </Link>
            )
          })}
        </nav>

        <div className="px-4 pb-6">
          <button
            onClick={handleExport}
            className="flex items-center gap-3 w-full px-3 py-2.5 rounded-lg text-sm font-medium text-indigo-200 hover:bg-indigo-800 hover:text-white transition-colors"
          >
            <Download size={18} />
            Export CSV
          </button>
        </div>
      </aside>

      {/* Mobile bottom nav */}
      <nav className="lg:hidden fixed bottom-0 inset-x-0 bg-indigo-900 text-white z-40 border-t border-indigo-800">
        <div className="flex items-center justify-around px-2 py-2">
          {navItems.map(({ href, label, icon: Icon }) => {
            const active = pathname === href
            return (
              <Link
                key={href}
                href={href}
                className={`flex flex-col items-center gap-0.5 px-4 py-1.5 rounded-lg transition-colors ${
                  active ? 'text-amber-400' : 'text-indigo-300'
                }`}
              >
                <Icon size={20} />
                <span className="text-xs">{label.split(' ')[0]}</span>
              </Link>
            )
          })}
          <button
            onClick={handleExport}
            className="flex flex-col items-center gap-0.5 px-4 py-1.5 rounded-lg text-indigo-300"
          >
            <Download size={20} />
            <span className="text-xs">Export</span>
          </button>
        </div>
      </nav>
    </>
  )
}
