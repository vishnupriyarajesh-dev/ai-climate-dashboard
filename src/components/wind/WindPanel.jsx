// src/components/wind/WindPanel.jsx
import { Gauge, Navigation, Wind } from 'lucide-react'
import { useCurrentWeather, useHourlyForecast } from '../../hooks/useWeather'
import { getWindDirection } from '../../services/weatherApi'

function SkeletonCard() {
  return (
    <div className="card p-5 animate-pulse space-y-4">
      <div className="h-4 w-24 bg-slate-200 rounded" />
      <div className="h-28 w-28 bg-slate-200 rounded-full mx-auto" />
      <div className="space-y-3">
        {[...Array(3)].map((_, i) => (
          <div key={i} className="h-3 bg-slate-200 rounded" />
        ))}
      </div>
    </div>
  )
}

function StatItem({ icon: Icon, label, value, color = 'text-slate-900' }) {
  return (
    <div className="flex items-center justify-between py-2.5 border-b border-slate-200/60 last:border-0">
      <div className="flex items-center gap-2">
        <Icon size={14} className="text-slate-400" />
        <span className="text-xs text-slate-500">{label}</span>
      </div>
      <span className={`text-xs font-mono font-semibold ${color}`}>{value}</span>
    </div>
  )
}

function getBeaufort(speed) {
  if (speed < 1) return { num: 0, label: 'Calm', color: 'data-emerald' }
  if (speed < 6) return { num: 1, label: 'Light Air', color: 'data-emerald' }
  if (speed < 12) return { num: 2, label: 'Light Breeze', color: 'data-emerald' }
  if (speed < 20) return { num: 3, label: 'Gentle Breeze', color: 'data-teal' }
  if (speed < 29) return { num: 4, label: 'Moderate', color: 'data-teal' }
  if (speed < 39) return { num: 5, label: 'Fresh Breeze', color: 'data-amber' }
  if (speed < 50) return { num: 6, label: 'Strong Breeze', color: 'data-amber' }
  if (speed < 62) return { num: 7, label: 'Near Gale', color: 'data-red' }
  if (speed < 75) return { num: 8, label: 'Gale', color: 'data-red' }
  return { num: 9, label: 'Severe Gale', color: 'data-red' }
}

function WindCompass({ degrees = 0, speed = 0 }) {
  const size = 110
  const center = size / 2
  const radius = 42
  const safeDegrees = Number.isFinite(degrees) ? degrees : 0
  const safeSpeed = Number.isFinite(speed) ? speed : 0

  const rad = ((safeDegrees - 90) * Math.PI) / 180
  const arrowX = center + radius * 0.62 * Math.cos(rad)
  const arrowY = center + radius * 0.62 * Math.sin(rad)

  const cardinals = [
    { label: 'N', angle: -90 },
    { label: 'E', angle: 0 },
    { label: 'S', angle: 90 },
    { label: 'W', angle: 180 },
  ]

  return (
    <svg width={size} height={size} viewBox={`0 0 ${size} ${size}`} className="mx-auto">
      <defs>
        <linearGradient id="windCompassGradient" x1="0" x2="1" y1="0" y2="1">
          <stop offset="0%" stopColor="#0D9488" />
          <stop offset="100%" stopColor="#7C3AED" />
        </linearGradient>
      </defs>

      <circle
        cx={center}
        cy={center}
        r={radius}
        fill="none"
        stroke="#E2E8F0"
        strokeWidth="1.5"
      />

      {[...Array(8)].map((_, i) => {
        const angle = (i * 45 * Math.PI) / 180
        const x1 = center + (radius - 5) * Math.cos(angle)
        const y1 = center + (radius - 5) * Math.sin(angle)
        const x2 = center + radius * Math.cos(angle)
        const y2 = center + radius * Math.sin(angle)

        return (
          <line
            key={i}
            x1={x1}
            y1={y1}
            x2={x2}
            y2={y2}
            stroke="#CBD5E1"
            strokeWidth="1.5"
          />
        )
      })}

      {cardinals.map(({ label, angle }) => {
        const a = (angle * Math.PI) / 180
        const x = center + (radius + 10) * Math.cos(a)
        const y = center + (radius + 10) * Math.sin(a)

        return (
          <text
            key={label}
            x={x}
            y={y}
            textAnchor="middle"
            dominantBaseline="central"
            fontSize="9"
            fontWeight="700"
            fill={label === 'N' ? '#0D9488' : '#64748B'}
          >
            {label}
          </text>
        )
      })}

      <circle
        cx={center}
        cy={center}
        r="26"
        fill="#F8FAFC"
        stroke="#E2E8F0"
        strokeWidth="1"
      />

      <line
        x1={center}
        y1={center}
        x2={arrowX}
        y2={arrowY}
        stroke="url(#windCompassGradient)"
        strokeWidth="2.5"
        strokeLinecap="round"
      />
      <circle cx={arrowX} cy={arrowY} r="3.5" fill="#0D9488" />
      <circle cx={center} cy={center} r="3.5" fill="#0F172A" />

      <text
        x={center}
        y={center - 7}
        textAnchor="middle"
        fontSize="11"
        fontWeight="700"
        fill="#0F172A"
      >
        {Math.round(safeSpeed)}
      </text>
      <text x={center} y={center + 7} textAnchor="middle" fontSize="8" fill="#64748B">
        km/h
      </text>
    </svg>
  )
}

export default function WindPanel({ location }) {
  const currentQuery = useCurrentWeather(location)
  const hourlyQuery = useHourlyForecast(location)

  if (currentQuery.isLoading) return <SkeletonCard />

  if (currentQuery.isError) {
    return (
      <div className="card p-5 flex items-center justify-center">
        <p className="text-sm text-aurora-red">Failed to load wind data.</p>
      </div>
    )
  }

  const current = currentQuery.data
  const speed = current.wind_speed_10m ?? 0
  const degrees = current.wind_direction_10m ?? 0
  const direction = getWindDirection(degrees)
  const beaufort = getBeaufort(speed)

  const windBars = hourlyQuery.data?.wind_speed_10m?.slice(0, 8) ?? []
  const maxWind = hourlyQuery.data?.wind_speed_10m
    ? Math.max(...hourlyQuery.data.wind_speed_10m.slice(0, 12))
    : speed
  const barMax = Math.max(...windBars, 1)

  return (
    <div className="card card-hover p-5 flex flex-col gap-5">
      <div className="flex items-center justify-between">
        <p className="text-xs font-semibold text-slate-500 uppercase tracking-wider">
          Wind
        </p>
        <Wind size={16} className="text-slate-400" />
      </div>

      <WindCompass degrees={degrees} speed={speed} />

      <div className="flex items-center justify-center gap-2">
        <Navigation size={14} className="data-teal" />
        <span className="text-sm font-semibold text-slate-900">{direction}</span>
        <span className="text-xs text-slate-500">{Math.round(degrees)}°</span>
      </div>

      <div className="h-px bg-slate-200/60" />

      <div>
        <StatItem icon={Wind} label="Current speed" value={`${Math.round(speed)} km/h`} />
        <StatItem
          icon={Gauge}
          label="Max next 12h"
          value={`${Math.round(maxWind)} km/h`}
          color={maxWind >= 40 ? 'data-amber' : 'text-slate-900'}
        />
        <StatItem
          icon={Wind}
          label="Beaufort"
          value={`${beaufort.num} - ${beaufort.label}`}
          color={beaufort.color}
        />
      </div>

      {windBars.length > 0 && (
        <div>
          <p className="text-[10px] text-slate-400 mb-2.5 uppercase tracking-wider">
            Next 8 hours
          </p>

          <div className="flex items-end gap-1.5 h-12">
            {windBars.map((windSpeed, index) => (
              <div key={`${windSpeed}-${index}`} className="flex-1 flex flex-col items-center">
                <div
                  className={`w-full rounded-sm transition-all duration-500 ${
                    windSpeed > 50
                      ? 'bg-aurora-red'
                      : windSpeed > 30
                        ? 'bg-aurora-amber'
                        : 'bg-aurora-teal'
                  } opacity-80`}
                  style={{
                    height: `${Math.max((windSpeed / barMax) * 40, 4)}px`,
                  }}
                  title={`${Math.round(windSpeed)} km/h`}
                />
              </div>
            ))}
          </div>
        </div>
      )}

      <div className="h-1 w-full rounded-full bg-aurora-teal opacity-40" />
    </div>
  )
}