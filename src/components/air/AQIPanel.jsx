// src/components/air/AQIPanel.jsx
import { useAirQuality } from '../../hooks/useAirQuality'
import { getAQILabel } from '../../services/weatherApi'
import { Wind } from 'lucide-react'

function PollutantBar({ label, value, max, unit, gradient }) {
  const pct = Math.min((value / max) * 100, 100)
  return (
    <div className="space-y-1.5">
      <div className="flex items-center justify-between">
        <span className="text-xs text-slate-500">{label}</span>
        <span className="text-xs font-mono font-semibold text-slate-900">
          {value?.toFixed(1)} <span className="text-slate-400 font-normal">{unit}</span>
        </span>
      </div>
      <div className="h-2 w-full bg-slate-200 rounded-full overflow-hidden">
        <div
          className={`h-full rounded-full transition-all duration-700 ${gradient}`}
          style={{ width: `${pct}%` }}
        />
      </div>
    </div>
  )
}

function SkeletonCard() {
  return (
    <div className="card p-5 animate-pulse space-y-4">
      <div className="h-4 w-24 bg-slate-200 rounded" />
      <div className="h-12 w-20 bg-slate-200 rounded" />
      <div className="space-y-3">
        {[...Array(4)].map((_, i) => <div key={i} className="h-3 bg-slate-200 rounded" />)}
      </div>
    </div>
  )
}

export default function AQIPanel({ location }) {
  const { data, isLoading, isError } = useAirQuality(location)

  if (isLoading) return <SkeletonCard />
  if (isError) return (
    <div className="card p-5 flex items-center justify-center">
      <p className="text-sm text-aurora-red">Failed to load AQI data.</p>
    </div>
  )

  const aqi = data.us_aqi
  const { label } = getAQILabel(aqi)

  // AQI gauge percentage 0-300 scale
  const pct = Math.min((aqi / 300) * 100, 100)

  // Semantic colors for AQI ranges
  const aqiColor = 
    aqi <= 50? 'data-emerald' :
    aqi <= 100? 'data-amber' :
    aqi <= 150? 'data-amber' :
    aqi <= 200? 'data-red' :
    'data-violet'

  const aqiGradient = 
    aqi <= 50? 'bg-aurora-emerald' :
    aqi <= 100? 'bg-aurora-amber' :
    aqi <= 150? 'bg-aurora-amber' :
    aqi <= 200? 'bg-aurora-red' :
    'bg-aurora-violet'

  return (
    <div className="card card-hover p-5 flex flex-col gap-5">

      {/* Header */}
      <div className="flex items-center justify-between">
        <p className="text-xs font-semibold text-slate-500 uppercase tracking-wider">
          Air Quality
        </p>
        <Wind size={16} className="text-slate-400" />
      </div>

      {/* AQI number + status */}
      <div className="flex items-end gap-4">
        <div>
          <p className={`text-5xl font-light leading-none ${aqiColor}`}>{aqi}</p>
          <p className={`text-sm font-semibold mt-1 ${aqiColor}`}>{label}</p>
        </div>

        {/* Mini gauge arc */}
        <div className="flex-1 mb-2">
          <div className="h-2.5 w-full bg-slate-200 rounded-full overflow-hidden">
            <div
              className={`h-full rounded-full transition-all duration-700 ${aqiGradient}`}
              style={{ width: `${pct}%` }}
            />
          </div>
          <div className="flex justify-between mt-1.5">
            <span className="text- text-slate-400">0</span>
            <span className="text- text-slate-400">300+</span>
          </div>
        </div>
      </div>

      {/* Divider */}
      <div className="h-px bg-slate-200/60" />

      {/* Pollutants */}
      <div className="space-y-3">
        <PollutantBar
          label="PM2.5"
          value={data.pm2_5}
          max={75}
          unit="μg/m³"
          gradient="bg-gradient-to-r from-aurora-teal to-aurora-violet"
        />
        <PollutantBar
          label="PM10"
          value={data.pm10}
          max={150}
          unit="μg/m³"
          gradient="bg-aurora-violet"
        />
        <PollutantBar
          label="NO₂"
          value={data.nitrogen_dioxide}
          max={100}
          unit="μg/m³"
          gradient="bg-aurora-amber"
        />
        <PollutantBar
          label="O₃ Ozone"
          value={data.ozone}
          max={180}
          unit="μg/m³"
          gradient="bg-aurora-emerald"
        />
      </div>

      {/* Bottom glow bar */}
      <div
        className={`h-1 w-full rounded-full ${aqiGradient} opacity-40`}
      />

    </div>
  )
}