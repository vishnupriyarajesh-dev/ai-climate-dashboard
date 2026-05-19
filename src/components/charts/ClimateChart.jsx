// src/components/charts/ClimateChart.jsx
import { BarChart3, CloudRain, CloudSun, Thermometer, TrendingUp } from 'lucide-react'
import {
  Area,
  AreaChart,
  Bar,
  BarChart,
  CartesianGrid,
  ComposedChart,
  Line,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from 'recharts'
import { useClimateNormals, useHistoricalWeather } from '../../hooks/useWeather'
import { convertTemp } from '../../services/weatherApi'

function SkeletonPage() {
  return (
    <div className="space-y-4">
      <div className="card p-4 md:p-6 animate-pulse h-44" />
      <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-4 gap-4">
        {[...Array(4)].map((_, i) => (
          <div key={i} className="card p-4 md:p-5 animate-pulse h-28" />
        ))}
      </div>
      <div className="grid grid-cols-1 xl:grid-cols-2 gap-4">
        <div className="card p-4 md:p-5 animate-pulse h-80" />
        <div className="card p-4 md:p-5 animate-pulse h-80" />
      </div>
    </div>
  )
}

function StatPill({ icon: Icon, label, value, helper, color = 'data-teal' }) {
  return (
    <div className="card card-hover p-4 md:p-5 min-w-0">
      <div className="flex items-start justify-between gap-3">
        <p className="text-[11px] md:text-xs font-semibold text-slate-500 uppercase tracking-wider leading-snug">
          {label}
        </p>
        <Icon size={16} className={`${color} flex-shrink-0`} />
      </div>

      <p className="text-xl md:text-2xl font-mono font-semibold text-slate-900 mt-3 break-words">
        {value}
      </p>

      {helper && <p className="text-xs text-slate-500 mt-1 leading-snug">{helper}</p>}
    </div>
  )
}

function EmptyRainState() {
  return (
    <div className="h-72 md:h-80 rounded-xl bg-slate-50 border border-slate-200/60 flex items-center justify-center text-center px-6">
      <div>
        <div className="w-11 h-11 rounded-xl bg-white border border-slate-200 flex items-center justify-center mx-auto">
          <CloudSun size={20} className="data-amber" />
        </div>
        <p className="text-sm font-semibold text-slate-900 mt-4">No measurable rainfall</p>
        <p className="text-xs text-slate-500 mt-1 leading-relaxed max-w-xs">
          The archive data shows 0 mm rainfall across the recent 30-day window for this location.
        </p>
      </div>
    </div>
  )
}

function buildHistoricalRows(data, unit) {
  return data.time.map((time, index) => {
    const max = data.temperature_2m_max[index]
    const min = data.temperature_2m_min[index]

    return {
      date: new Date(time).toLocaleDateString('en-US', {
        month: 'short',
        day: 'numeric',
      }),
      max: convertTemp(max, unit),
      min: convertTemp(min, unit),
      avg: convertTemp((max + min) / 2, unit),
      rain: data.precipitation_sum[index] ?? 0,
      wind: Math.round(data.wind_speed_10m_max[index] ?? 0),
    }
  })
}

function buildMonthlyClimateRows(data, unit) {
  const buckets = {}

  data.time.forEach((time, index) => {
    const month = new Date(time).toLocaleDateString('en-US', { month: 'short' })

    if (!buckets[month]) {
      buckets[month] = {
        month,
        maxTemps: [],
        minTemps: [],
        rain: 0,
      }
    }

    buckets[month].maxTemps.push(data.temperature_2m_max[index])
    buckets[month].minTemps.push(data.temperature_2m_min[index])
    buckets[month].rain += data.precipitation_sum[index] ?? 0
  })

  return Object.values(buckets).map((bucket) => {
    const avgMax = bucket.maxTemps.reduce((sum, value) => sum + value, 0) / bucket.maxTemps.length
    const avgMin = bucket.minTemps.reduce((sum, value) => sum + value, 0) / bucket.minTemps.length

    return {
      month: bucket.month,
      avgMax: convertTemp(avgMax, unit),
      avgMin: convertTemp(avgMin, unit),
      rain: Number(bucket.rain.toFixed(1)),
    }
  })
}

function CustomTooltip({ active, payload, label, unit }) {
  if (!active || !payload?.length) return null

  return (
    <div className="rounded-xl bg-white border border-slate-200 shadow-lg p-3">
      <p className="text-xs font-semibold text-slate-900">{label}</p>
      <div className="grid grid-cols-2 gap-x-4 gap-y-1 mt-2">
        {payload.map((item) => (
          <div key={item.dataKey} className="contents">
            <p className="text-xs text-slate-500">{item.name}</p>
            <p className="text-xs font-mono text-slate-900 text-right">
              {item.value}
              {item.dataKey?.toLowerCase().includes('rain') ? ' mm' : `°${unit}`}
            </p>
          </div>
        ))}
      </div>
    </div>
  )
}

export default function ClimateChart({ location, unit }) {
  const historical = useHistoricalWeather(location)
  const climate = useClimateNormals(location)

  if (historical.isLoading || climate.isLoading) return <SkeletonPage />

  if (historical.isError || climate.isError || !historical.data || !climate.data) {
    return (
      <div className="card p-4 md:p-6 flex items-center justify-center">
        <p className="text-sm text-aurora-red">Failed to load climate analytics.</p>
      </div>
    )
  }

  const historyRows = buildHistoricalRows(historical.data, unit)
  const climateRows = buildMonthlyClimateRows(climate.data, unit)

  const avgTemp = historyRows.reduce((sum, item) => sum + item.avg, 0) / historyRows.length
  const hottest = historyRows.reduce((max, item) => (item.max > max.max ? item : max), historyRows[0])
  const wettest = historyRows.reduce((max, item) => (item.rain > max.rain ? item : max), historyRows[0])
  const totalRain = historyRows.reduce((sum, item) => sum + item.rain, 0)
  const hasRecentRain = totalRain > 0

  const firstWeekAvg = historyRows.slice(0, 7).reduce((sum, item) => sum + item.avg, 0) / 7
  const lastWeekAvg = historyRows.slice(-7).reduce((sum, item) => sum + item.avg, 0) / 7
  const anomaly = lastWeekAvg - firstWeekAvg
  const anomalyLabel = anomaly >= 0 ? `+${anomaly.toFixed(1)}°${unit}` : `${anomaly.toFixed(1)}°${unit}`
  const anomalyColor = anomaly >= 1.5 ? 'data-red' : anomaly <= -1.5 ? 'data-teal' : 'data-emerald'

  return (
    <div className="space-y-4">
      <div className="card card-hover p-4 md:p-6">
        <div className="flex items-start justify-between gap-4 md:gap-6">
          <div className="min-w-0">
            <p className="text-xs font-semibold text-slate-500 uppercase tracking-wider">
              Climate Analytics
            </p>
            <h2 className="text-lg md:text-xl font-semibold text-slate-900 mt-1 leading-snug">
              {location.name} climate and recent trend intelligence
            </h2>
            <p className="text-sm text-slate-600 mt-2 max-w-3xl leading-relaxed">
              This page compares recent 30-day weather behavior with long-range historical climate
              patterns to show warming, rainfall, and volatility signals.
            </p>
          </div>

          <div className="w-10 h-10 md:w-11 md:h-11 rounded-xl bg-gradient-to-br from-aurora-teal to-aurora-violet flex items-center justify-center flex-shrink-0">
            <BarChart3 size={20} className="text-white" />
          </div>
        </div>

        <div className="mt-5 h-1 w-full rounded-full bg-gradient-to-r from-aurora-teal via-aurora-violet to-aurora-amber opacity-40" />
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-4 gap-4">
        <StatPill
          icon={Thermometer}
          label="30D Avg Temp"
          value={`${avgTemp.toFixed(1)}°${unit}`}
          helper="Recent daily average"
          color="data-amber"
        />
        <StatPill
          icon={TrendingUp}
          label="Temp Shift"
          value={anomalyLabel}
          helper="Last week vs first week"
          color={anomalyColor}
        />
        <StatPill
          icon={CloudRain}
          label="30D Rainfall"
          value={`${totalRain.toFixed(1)} mm`}
          helper={hasRecentRain ? `Wettest: ${wettest.date}` : 'No wet days recorded'}
          color="data-teal"
        />
        <StatPill
          icon={Thermometer}
          label="Hottest Day"
          value={`${hottest.max}°${unit}`}
          helper={hottest.date}
          color="data-red"
        />
      </div>

      <div className="grid grid-cols-1 xl:grid-cols-2 gap-4">
        <div className="card card-hover p-4 md:p-5 min-w-0">
          <div className="flex items-center justify-between gap-3 mb-4">
            <p className="text-xs font-semibold text-slate-500 uppercase tracking-wider leading-snug">
              Recent Temperature Pattern
            </p>
            <Thermometer size={16} className="data-amber flex-shrink-0" />
          </div>

          <div className="h-72 md:h-80 min-w-0">
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart data={historyRows} margin={{ top: 8, right: 8, left: -30, bottom: 0 }}>
                <defs>
                  <linearGradient id="recentClimateTempGradient" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#F59E0B" stopOpacity={0.35} />
                    <stop offset="95%" stopColor="#F59E0B" stopOpacity={0.02} />
                  </linearGradient>
                </defs>
                <CartesianGrid stroke="#E2E8F0" strokeDasharray="3 3" vertical={false} />
                <XAxis dataKey="date" tick={{ fontSize: 10, fill: '#64748B' }} axisLine={false} tickLine={false} interval={6} />
                <YAxis tick={{ fontSize: 10, fill: '#64748B' }} axisLine={false} tickLine={false} width={36} unit={`°${unit}`} />
                <Tooltip content={<CustomTooltip unit={unit} />} />
                <Area
                  type="monotone"
                  dataKey="avg"
                  name="Avg temp"
                  stroke="#F59E0B"
                  strokeWidth={2.5}
                  fill="url(#recentClimateTempGradient)"
                />
              </AreaChart>
            </ResponsiveContainer>
          </div>
        </div>

        <div className="card card-hover p-4 md:p-5 min-w-0">
          <div className="flex items-center justify-between gap-3 mb-4">
            <p className="text-xs font-semibold text-slate-500 uppercase tracking-wider leading-snug">
              Recent Rainfall
            </p>
            <CloudRain size={16} className="data-teal flex-shrink-0" />
          </div>

          {hasRecentRain ? (
            <div className="h-72 md:h-80 min-w-0">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={historyRows} margin={{ top: 8, right: 8, left: -30, bottom: 0 }}>
                  <CartesianGrid stroke="#E2E8F0" strokeDasharray="3 3" vertical={false} />
                  <XAxis dataKey="date" tick={{ fontSize: 10, fill: '#64748B' }} axisLine={false} tickLine={false} interval={6} />
                  <YAxis tick={{ fontSize: 10, fill: '#64748B' }} axisLine={false} tickLine={false} width={36} unit="mm" />
                  <Tooltip cursor={{ fill: 'rgba(13, 148, 136, 0.06)' }} />
                  <Bar dataKey="rain" name="Rain" fill="#0D9488" radius={[6, 6, 0, 0]} />
                </BarChart>
              </ResponsiveContainer>
            </div>
          ) : (
            <EmptyRainState />
          )}
        </div>
      </div>

      <div className="card card-hover p-4 md:p-5 min-w-0">
        <div className="flex items-center justify-between gap-3 mb-4">
          <p className="text-xs font-semibold text-slate-500 uppercase tracking-wider leading-snug">
            Long-Range Monthly Climate Normals
          </p>
          <BarChart3 size={16} className="data-violet flex-shrink-0" />
        </div>

        <div className="h-72 md:h-80 min-w-0">
          <ResponsiveContainer width="100%" height="100%">
            <ComposedChart data={climateRows} margin={{ top: 8, right: 2, left: -30, bottom: 0 }}>
              <CartesianGrid stroke="#E2E8F0" strokeDasharray="3 3" vertical={false} />
              <XAxis dataKey="month" tick={{ fontSize: 10, fill: '#64748B' }} axisLine={false} tickLine={false} />
              <YAxis yAxisId="temp" tick={{ fontSize: 10, fill: '#64748B' }} axisLine={false} tickLine={false} width={36} unit={`°${unit}`} />
              <YAxis yAxisId="rain" orientation="right" tick={{ fontSize: 10, fill: '#64748B' }} axisLine={false} tickLine={false} width={34} unit="mm" />
              <Tooltip content={<CustomTooltip unit={unit} />} />
              <Bar yAxisId="rain" dataKey="rain" name="Rain" fill="#0D9488" radius={[6, 6, 0, 0]} opacity={0.45} />
              <Line yAxisId="temp" type="monotone" dataKey="avgMax" name="Avg max" stroke="#F59E0B" strokeWidth={2.5} dot={{ r: 2 }} />
              <Line yAxisId="temp" type="monotone" dataKey="avgMin" name="Avg min" stroke="#7C3AED" strokeWidth={2.5} dot={{ r: 2 }} />
            </ComposedChart>
          </ResponsiveContainer>
        </div>
      </div>
    </div>
  )
}