// src/components/charts/TemperatureChart.jsx
import { Activity, Thermometer } from 'lucide-react'
import {
  Area,
  AreaChart,
  CartesianGrid,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from 'recharts'
import { useHourlyForecast } from '../../hooks/useWeather'
import { convertTemp } from '../../services/weatherApi'

function SkeletonCard() {
  return (
    <div className="card p-5 animate-pulse">
      <div className="h-4 w-36 bg-slate-200 rounded mb-5" />
      <div className="h-64 bg-slate-200 rounded-xl" />
    </div>
  )
}

function buildRows(data, unit) {
  return data.time.map((time, index) => ({
    time: new Date(time).toLocaleTimeString('en-US', {
      hour: 'numeric',
      hour12: true,
    }),
    temp: convertTemp(data.temperature_2m[index], unit),
    feels: convertTemp(data.temperature_2m[index] + 1.5, unit),
    humidity: data.relative_humidity_2m[index],
  }))
}

function CustomTooltip({ active, payload, label, unit }) {
  if (!active || !payload?.length) return null

  const row = payload[0].payload

  return (
    <div className="rounded-xl bg-white border border-slate-200 shadow-lg p-3">
      <p className="text-xs font-semibold text-slate-900">{label}</p>
      <div className="grid grid-cols-2 gap-x-4 gap-y-1 mt-2">
        <p className="text-xs text-slate-500">Temperature</p>
        <p className="text-xs font-mono text-slate-900 text-right">
          {row.temp}°{unit}
        </p>
        <p className="text-xs text-slate-500">Feels trend</p>
        <p className="text-xs font-mono text-slate-900 text-right">
          {row.feels}°{unit}
        </p>
        <p className="text-xs text-slate-500">Humidity</p>
        <p className="text-xs font-mono text-slate-900 text-right">{row.humidity}%</p>
      </div>
    </div>
  )
}

export default function TemperatureChart({ location, unit }) {
  const { data, isLoading, isError } = useHourlyForecast(location)

  if (isLoading) return <SkeletonCard />

  if (isError) {
    return (
      <div className="card p-5 flex items-center justify-center">
        <p className="text-sm text-aurora-red">Failed to load temperature chart.</p>
      </div>
    )
  }

  const rows = buildRows(data, unit)
  const next12 = rows.slice(0, 12)
  const high = Math.max(...next12.map((item) => item.temp))
  const low = Math.min(...next12.map((item) => item.temp))
  const trend = next12[next12.length - 1].temp >= next12[0].temp ? 'Warming' : 'Cooling'

  return (
    <div className="card card-hover p-5">
      <div className="flex items-start justify-between gap-4 mb-5">
        <div>
          <p className="text-xs font-semibold text-slate-500 uppercase tracking-wider">
            Temperature Trend
          </p>
          <h2 className="text-lg font-semibold text-slate-900 mt-1">
            24-hour thermal pattern
          </h2>
        </div>

        <div className="w-9 h-9 rounded-xl bg-slate-50 border border-slate-200 flex items-center justify-center">
          <Thermometer size={16} className="data-amber" />
        </div>
      </div>

      <div className="grid grid-cols-3 gap-3 mb-5">
        <div className="rounded-xl bg-slate-50 border border-slate-200/60 px-3 py-2">
          <p className="text-[10px] text-slate-500 uppercase tracking-wider">High</p>
          <p className="text-sm font-mono font-semibold text-slate-900 mt-1">
            {high}°{unit}
          </p>
        </div>
        <div className="rounded-xl bg-slate-50 border border-slate-200/60 px-3 py-2">
          <p className="text-[10px] text-slate-500 uppercase tracking-wider">Low</p>
          <p className="text-sm font-mono font-semibold text-slate-900 mt-1">
            {low}°{unit}
          </p>
        </div>
        <div className="rounded-xl bg-slate-50 border border-slate-200/60 px-3 py-2">
          <div className="flex items-center gap-1.5">
            <Activity size={12} className="data-violet" />
            <p className="text-[10px] text-slate-500 uppercase tracking-wider">Trend</p>
          </div>
          <p className="text-sm font-mono font-semibold text-slate-900 mt-1">{trend}</p>
        </div>
      </div>

      <div className="h-64">
        <ResponsiveContainer width="100%" height="100%">
          <AreaChart data={rows} margin={{ top: 8, right: 10, left: -24, bottom: 0 }}>
            <defs>
              <linearGradient id="temperatureAreaGradient" x1="0" y1="0" x2="0" y2="1">
                <stop offset="5%" stopColor="#F59E0B" stopOpacity={0.35} />
                <stop offset="95%" stopColor="#F59E0B" stopOpacity={0.02} />
              </linearGradient>
            </defs>

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
              unit={`°${unit}`}
            />
            <Tooltip content={<CustomTooltip unit={unit} />} />
            <Area
              type="monotone"
              dataKey="temp"
              stroke="#F59E0B"
              strokeWidth={2.5}
              fill="url(#temperatureAreaGradient)"
              activeDot={{ r: 4, fill: '#7C3AED', stroke: '#fff', strokeWidth: 2 }}
            />
          </AreaChart>
        </ResponsiveContainer>
      </div>

      <div className="h-1 w-full rounded-full bg-aurora-amber opacity-40 mt-4" />
    </div>
  )
}