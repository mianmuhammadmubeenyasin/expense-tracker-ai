import { LucideIcon, TrendingUp, TrendingDown, Minus } from 'lucide-react'

type TrendDirection = 'up' | 'down' | 'neutral'

type Props = {
  title: string
  value: string
  subtitle?: string
  icon: LucideIcon
  iconColor?: string
  trend?: {
    direction: TrendDirection
    label: string
  }
}

export function SummaryCard({ title, value, subtitle, icon: Icon, iconColor = 'text-indigo-600', trend }: Props) {
  const TrendIcon =
    trend?.direction === 'up' ? TrendingUp :
    trend?.direction === 'down' ? TrendingDown :
    Minus

  const trendColor =
    trend?.direction === 'up' ? 'text-red-500' :
    trend?.direction === 'down' ? 'text-emerald-500' :
    'text-gray-400'

  return (
    <div className="bg-white rounded-2xl p-6 border border-indigo-100 shadow-sm">
      <div className="flex items-center justify-between mb-4">
        <span className="text-sm font-medium text-gray-500">{title}</span>
        <div className={`w-10 h-10 rounded-xl bg-indigo-50 flex items-center justify-center ${iconColor}`}>
          <Icon size={20} />
        </div>
      </div>
      <div className="tabular-nums text-2xl font-bold text-gray-900 mb-1">{value}</div>
      {(subtitle || trend) && (
        <div className="flex items-center gap-2 mt-2">
          {trend && (
            <div className={`flex items-center gap-1 text-xs font-medium ${trendColor}`}>
              <TrendIcon size={12} />
              <span>{trend.label}</span>
            </div>
          )}
          {subtitle && <span className="text-xs text-gray-400">{subtitle}</span>}
        </div>
      )}
    </div>
  )
}
