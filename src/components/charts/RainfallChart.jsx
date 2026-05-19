// src/components/charts/RainfallChart.jsx
import { CloudRain, Droplets, Umbrella } from 'lucide-react'
import {
  Bar,
  BarChart,
  CartesianGrid,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from 'recharts'
import { useHourlyForecast } from '../../hooks/useWeather'

function SkeletonCard() {
  return (
    <div className="card p-5 animate-pulse">
      <div className="h-4 w-36 bg-slate-200 rounded mb-5" />
      <div className="h-64 bg-slate-200 rounded-xl" />
    </div>
  )
}

function buildRows(data) {
  return data.time.map((time, index) => ({
    time: new Date(time).toLocaleTimeString('en-US', {
      hour: 'numeric',
      hour12: true,
    }),
    rain: data.precipitation_probability[index],
    humidity: data.relative_humidity_2m[index],
  }))
}

function CustomTooltip({ active, payload, label }) {
  if (!active || !payload?.length) return null

  const row = payload[0].payload

  return (
    <div className="rounded-xl bg-white border border-slate-200 shadow-lg p-3">
      <p className="text-xs font-semibold text-slate-900">{label}</p>
      <div className="grid grid-cols-2 gap-x-4 gap-y-1 mt-2">
        <p className="text-xs text-slate-500">Rain chance</p>
        <p className="text-xs font-mono text-slate-900 text-right">{row.rain}%</p>
        <p className="text-xs text-slate-500">Humidity</p>
        <p className="text-xs font-mono text-slate-900 text-right">{row.humidity}%</p>
      </div>
    </div>
  )
}

export default function RainfallChart({ location }) {
  const { data, isLoading, isError } = useHourlyForecast(location)

  if (isLoading) return <SkeletonCard />

  if (isError) {
    return (
      <div className="card p-5 flex items-center justify-center">
        <p className="text-sm text-aurora-red">Failed to load rainfall chart.</p>
      </div>
    )
  }

  const rows = buildRows(data)
  const next12 = rows.slice(0, 12)
  const peakRain = Math.max(...next12.map((item) => item.rain))
  const wetHours = next12.filter((item) => item.rain >= 50).length
  const avgHumidity = Math.round(
    next12.reduce((sum, item) => sum + item.humidity, 0) / next12.length
  )

  const risk = peakRain >= 75 ? 'High' : peakRain >= 45 ? 'Moderate' : 'Low'
  const riskColor = risk === 'High' ? 'data-red' : risk === 'Moderate' ? 'data-amber' : 'data-emerald'

  return (
    <div className="card card-hover p-5">
      <div className="flex items-start justify-between gap-4 mb-5">
        <div>
          <p className="text-xs font-semibold text-slate-500 uppercase tracking-wider">
            Rainfall Outlook
          </p>
          <h2 className="text-lg font-semibold text-slate-900 mt-1">
            Precipitation probability
          </h2>
        </div>

        <div className="w-9 h-9 rounded-xl bg-slate-50 border border-slate-200 flex items-center justify-center">
          <CloudRain size={16} className="data-teal" />
        </div>
      </div>

      <div className="grid grid-cols-3 gap-3 mb-5">
        <div className="rounded-xl bg-slate-50 border border-slate-200/60 px-3 py-2">
          <div className="flex items-center gap-1.5">
            <Umbrella size={12} className="data-teal" />
            <p className="text-[10px] text-slate-500 uppercase tracking-wider">Peak</p>
          </div>
          <p className="text-sm font-mono font-semibold text-slate-900 mt-1">{peakRain}%</p>
        </div>
        <div className="rounded-xl bg-slate-50 border border-slate-200/60 px-3 py-2">
          <p className="text-[10px] text-slate-500 uppercase tracking-wider">Wet Hours</p>
          <p className="text-sm font-mono font-semibold text-slate-900 mt-1">{wetHours}</p>
        </div>
        <div className="rounded-xl bg-slate-50 border border-slate-200/60 px-3 py-2">
          <div className="flex items-center gap-1.5">
            <Droplets size={12} className="data-violet" />
            <p className="text-[10px] text-slate-500 uppercase tracking-wider">Risk</p>
          </div>
          <p className={`text-sm font-mono font-semibold mt-1 ${riskColor}`}>{risk}</p>
        </div>
      </div>

      <div className="h-64">
        <ResponsiveContainer width="100%" height="100%">
          <BarChart data={rows} margin={{ top: 8, right: 10, left: -24, bottom: 0 }}>
            <CartesianGrid stroke="#E2E8F0" strokeDasharray="3 3" vertical={false} />
            <XAxis
              dataKey="time"
              tick={{ fontSize: 11, fill: '#64748B' }}
              axisLine={false}
              tickLine={false}
              interval={2}
            />
            <YAxis
              tick={{ fontSize: 11, fill: '#64748B' }}
              axisLine={false}
              tickLine={false}
              width={42}
              unit="%"
            />
            <Tooltip content={<CustomTooltip />} cursor={{ fill: 'rgba(13, 148, 136, 0.06)' }} />
            <Bar dataKey="rain" fill="#0D9488" radius={[6, 6, 0, 0]} />
          </BarChart>
        </ResponsiveContainer>
      </div>

      <p className="text-xs text-slate-500 mt-4">
        Average humidity over the next 12 hours is{' '}
        <span className="font-mono font-semibold text-slate-900">{avgHumidity}%</span>.
      </p>

      <div className="h-1 w-full rounded-full bg-aurora-teal opacity-40 mt-4" />
    </div>
  )
}