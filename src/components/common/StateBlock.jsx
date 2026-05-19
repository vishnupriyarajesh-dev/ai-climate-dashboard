// src/components/common/StateBlock.jsx
import { AlertTriangle, CloudOff, Loader2 } from 'lucide-react'

const iconMap = {
  loading: Loader2,
  error: AlertTriangle,
  empty: CloudOff,
}

const colorMap = {
  loading: 'data-teal',
  error: 'text-aurora-red',
  empty: 'text-slate-400',
}

export default function StateBlock({
  type = 'empty',
  title = 'No data available',
  message = 'There is nothing to show right now.',
  className = '',
}) {
  const Icon = iconMap[type] ?? CloudOff
  const color = colorMap[type] ?? 'text-slate-400'

  return (
    <div className={`card p-6 flex items-center justify-center text-center ${className}`}>
      <div>
        <div className="w-11 h-11 rounded-xl bg-slate-50 border border-slate-200 flex items-center justify-center mx-auto">
          <Icon size={20} className={`${color} ${type === 'loading' ? 'animate-spin' : ''}`} />
        </div>

        <p className="text-sm font-semibold text-slate-900 mt-4">{title}</p>
        <p className="text-xs text-slate-500 mt-1 max-w-xs leading-relaxed">{message}</p>
      </div>
    </div>
  )
}