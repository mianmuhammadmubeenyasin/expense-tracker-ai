import Link from 'next/link'
import { LucideIcon } from 'lucide-react'

type Props = {
  title: string
  subtitle?: string
  action?: {
    label: string
    href?: string
    onClick?: () => void
    icon?: LucideIcon
  }
}

export function Header({ title, subtitle, action }: Props) {
  return (
    <div className="flex items-center justify-between px-6 py-6 border-b border-indigo-100 bg-white">
      <div>
        <h1 className="text-2xl font-bold text-gray-900">{title}</h1>
        {subtitle && <p className="text-sm text-gray-500 mt-0.5">{subtitle}</p>}
      </div>
      {action && (
        action.href ? (
          <Link
            href={action.href}
            className="flex items-center gap-2 px-4 py-2 bg-amber-500 hover:bg-amber-600 text-white font-semibold text-sm rounded-lg transition-colors"
          >
            {action.icon && <action.icon size={16} />}
            {action.label}
          </Link>
        ) : (
          <button
            onClick={action.onClick}
            className="flex items-center gap-2 px-4 py-2 bg-amber-500 hover:bg-amber-600 text-white font-semibold text-sm rounded-lg transition-colors"
          >
            {action.icon && <action.icon size={16} />}
            {action.label}
          </button>
        )
      )}
    </div>
  )
}
