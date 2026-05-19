// src/components/air/UVIndex.jsx
import { Sun, Shield, Clock } from 'lucide-react'
import { useCurrentWeather, useWeeklyForecast } from '../../hooks/useWeather'
import { getUVLabel } from '../../services/weatherApi'

function SkeletonCard() {
  return (
    <div className="card p-5 animate-pulse space-y-4">
      <div className="h-4 w-24 bg-slate-200 rounded" />
      <div className="h-12 w-20 bg-slate-200 rounded" />
      <div className="h-3 bg-slate-200 rounded" />
      <div className="h-3 bg-slate-200 rounded w-4/5" />
    </div>
  )
}

function getUVAdvice(uv) {
  if (uv <= 2) return 'Low risk. Normal outdoor activity is fine.'
  if (uv <= 5) return 'Use sunscreen if outside for long periods.'
  if (uv <= 7) return 'Wear sunscreen, sunglasses, and avoid long midday exposure.'
  if (uv <= 10) return 'Limit outdoor exposure during midday hours.'
  return 'Avoid direct sun exposure. UV protection is essential.'
}

function getBurnTime(uv) {
  if (uv <= 2) return '60+ min'
  if (uv <= 5) return '35-45 min'
  if (uv <= 7) return '20-30 min'
  if (uv <= 10) return '10-20 min'
  return '<10 min'
}

export default function UVIndex({ location }) {
  const current = useCurrentWeather(location)
  const weekly = useWeeklyForecast(location)

  if (current.isLoading || weekly.isLoading) return <SkeletonCard />

  if (current.isError || weekly.isError) {
    return (
      <div className="card p-5 flex items-center justify-center">
        <p className="text-sm text-aurora-red">Failed to load UV index.</p>
      </div>
    )
  }

  const uv = current.data.uv_index ?? weekly.data.uv_index_max?.[0] ?? 0
  const peakUv = weekly.data.uv_index_max?.[0] ?? uv
  const uvInfo = getUVLabel(uv)
  const pct = Math.min((uv / 11) * 100, 100)

  return (
    <div className="card card-hover p-5 flex flex-col gap-5">
      <div className="flex items-center justify-between">
        <p className="text-xs font-semibold text-slate-500 uppercase tracking-wider">
          UV Index
        </p>
        <Sun size={16} className="text-aurora-amber" />
      </div>

      <div className="flex items-end justify-between gap-4">
        <div>
          <p className={`text-5xl font-light leading-none ${uvInfo.color}`}>
            {Math.round(uv)}
          </p>
          <p className={`text-sm font-semibold mt-1 ${uvInfo.color}`}>{uvInfo.label}</p>
        </div>

        <div className="text-right">
          <p className="text-xs text-slate-500">Peak today</p>
          <p className="text-xl font-mono font-semibold text-slate-900">
            {Math.round(peakUv)}
          </p>
        </div>
      </div>

      <div>
        <div className="h-2.5 w-full bg-slate-200 rounded-full overflow-hidden">
          <div
            className={`h-full rounded-full transition-all duration-700 ${uvInfo.bg}`}
            style={{ width: `${pct}%` }}
          />
        </div>
        <div className="flex justify-between mt-1.5">
          <span className="text-[10px] text-slate-400">0</span>
          <span className="text-[10px] text-slate-400">11+</span>
        </div>
      </div>

      <div className="grid grid-cols-2 gap-3">
        <div className="rounded-xl bg-slate-50 border border-slate-200/60 p-3">
          <div className="flex items-center gap-2">
            <Shield size={14} className="data-teal" />
            <p className="text-xs font-semibold text-slate-500 uppercase tracking-wider">
              Protection
            </p>
          </div>
          <p className="text-sm text-slate-700 mt-2 leading-relaxed">{getUVAdvice(uv)}</p>
        </div>

        <div className="rounded-xl bg-slate-50 border border-slate-200/60 p-3">
          <div className="flex items-center gap-2">
            <Clock size={14} className="data-violet" />
            <p className="text-xs font-semibold text-slate-500 uppercase tracking-wider">
              Burn Time
            </p>
          </div>
          <p className="text-lg font-mono font-semibold text-slate-900 mt-2">
            {getBurnTime(uv)}
          </p>
        </div>
      </div>

      <div className={`h-1 w-full rounded-full ${uvInfo.bg} opacity-40`} />
    </div>
  )
}