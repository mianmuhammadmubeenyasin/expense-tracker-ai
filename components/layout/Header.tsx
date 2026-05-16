import Link from 'next/link'
import { LucideIcon } from 'lucide-react'

type Action = {
  label: string
  href?: string
  onClick?: () => void
  icon?: LucideIcon
}

type Props = {
  title: string
  subtitle?: string
  actions?: Action[]
}

function ActionButton({ action }: { action: Action }) {
  const className =
    'flex items-center gap-2 px-4 py-2 bg-amber-500 hover:bg-amber-600 text-white font-semibold text-sm rounded-lg transition-colors'
  return action.href ? (
    <Link href={action.href} className={className}>
      {action.icon && <action.icon size={16} />}
      {action.label}
    </Link>
  ) : (
    <button onClick={action.onClick} className={className}>
      {action.icon && <action.icon size={16} />}
      {action.label}
    </button>
  )
}

export function Header({ title, subtitle, actions }: Props) {
  return (
    <div className="flex items-center justify-between px-6 py-6 border-b border-indigo-100 bg-white">
      <div>
        <h1 className="text-2xl font-bold text-gray-900">{title}</h1>
        {subtitle && <p className="text-sm text-gray-500 mt-0.5">{subtitle}</p>}
      </div>
      {actions && actions.length > 0 && (
        <div className="flex items-center gap-2">
          {actions.map((action) => (
            <ActionButton key={action.label} action={action} />
          ))}
        </div>
      )}
    </div>
  )
}
