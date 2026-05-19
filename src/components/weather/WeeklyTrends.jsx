// src/components/weather/WeeklyTrends.jsx
import {
  CalendarDays,
  Cloud,
  CloudDrizzle,
  CloudFog,
  CloudLightning,
  CloudRain,
  CloudSnow,
  CloudSun,
  CloudRain as CloudRainIcon,
  Droplets,
  Sun,
  Thermometer,
  Wind,
} from 'lucide-react'
import {
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
import { useWeeklyForecast } from '../../hooks/useWeather'
import { convertTemp, getWeatherDescription } from '../../services/weatherApi'

function getWeatherIcon(code) {
  if (code === 0) return Sun
  if (code <= 2) return CloudSun
  if (code === 3) return Cloud
  if (code <= 48) return CloudFog
  if (code <= 55) return CloudDrizzle
  if (code <= 65) return CloudRain
  if (code <= 75) return CloudSnow
  if (code <= 82) return CloudRain
  if (code <= 99) return CloudLightning
  return Thermometer
}

function getWeatherIconColor(code) {
  if (code === 0) return 'data-amber'
  if (code <= 3) return 'data-teal'
  if (code <= 48) return 'text-slate-500'
  if (code <= 65) return 'data-teal'
  if (code <= 75) return 'data-violet'
  if (code <= 82) return 'data-teal'
  if (code <= 99) return 'data-red'
  return 'data-amber'
}

function SkeletonCard() {
  return (
    <div className="card p-6 animate-pulse">
      <div className="h-5 w-40 bg-slate-200 rounded mb-5" />
      <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-7 gap-3 mb-5">
        {[...Array(7)].map((_, i) => (
          <div key={i} className="h-36 bg-slate-200 rounded-xl" />
        ))}
      </div>
      <div className="h-72 bg-slate-200 rounded-xl" />
    </div>
  )
}

function buildRows(data, unit) {
  return data.time.map((time, index) => {
    const date = new Date(time)
    const day = date.toLocaleDateString('en-US', { weekday: 'short' })
    const label = date.toLocaleDateString('en-US', { month: 'short', day: 'numeric' })
    const max = convertTemp(data.temperature_2m_max[index], unit)
    const min = convertTemp(data.temperature_2m_min[index], unit)
    const code = data.weather_code[index]

    return {
      day,
      label,
      max,
      min,
      rain: data.precipitation_probability_max[index] ?? 0,
      rainAmount: data.precipitation_sum[index] ?? 0,
      wind: Math.round(data.wind_speed_10m_max[index] ?? 0),
      uv: Math.round(data.uv_index_max[index] ?? 0),
      code,
      desc: getWeatherDescription(code),
    }
  })
}

function DayCard({ item, active }) {
  const WeatherIcon = getWeatherIcon(item.code)
  const rainColor = item.rain >= 70 ? 'data-red' : item.rain >= 40 ? 'data-amber' : 'data-teal'

  return (
    <div
      className={`rounded-xl border p-3 transition-all ${
        active
          ? 'bg-gradient-to-br from-aurora-teal to-aurora-violet text-white border-transparent shadow-lg shadow-aurora-teal/20'
          : 'bg-slate-50 border-slate-200/60 hover:bg-white'
      }`}
    >
      <div className="flex items-center justify-between">
        <p className={`text-xs font-semibold ${active ? 'text-white' : 'text-slate-900'}`}>
          {item.day}
        </p>
        <p className={`text-[10px] ${active ? 'text-white/70' : 'text-slate-400'}`}>
          {item.label}
        </p>
      </div>

      <div
        className={`w-10 h-10 rounded-xl mt-3 flex items-center justify-center ${
          active ? 'bg-white/15 border border-white/20' : 'bg-white border border-slate-200'
        }`}
      >
        <WeatherIcon
          size={20}
          strokeWidth={1.8}
          className={active ? 'text-white' : getWeatherIconColor(item.code)}
        />
      </div>

      <div className="mt-3">
        <p className={`text-xl font-mono font-semibold ${active ? 'text-white' : 'text-slate-900'}`}>
          {item.max}°
        </p>
        <p className={`text-xs ${active ? 'text-white/70' : 'text-slate-500'}`}>
          low {item.min}°
        </p>
      </div>

      <div className="flex items-center gap-1.5 mt-3">
        <CloudRainIcon size={12} className={active ? 'text-white/80' : rainColor} />
        <span className={`text-xs font-mono ${active ? 'text-white/80' : 'text-slate-500'}`}>
          {item.rain}%
        </span>
      </div>
    </div>
  )
}

function StatPill({ icon: Icon, label, value, color }) {
  return (
    <div className="rounded-xl bg-slate-50 border border-slate-200/60 px-4 py-3">
      <div className="flex items-center gap-2">
        <Icon size={14} className={color} />
        <p className="text-xs font-semibold text-slate-500 uppercase tracking-wider">{label}</p>
      </div>
      <p className="text-lg font-mono font-semibold text-slate-900 mt-2">{value}</p>
    </div>
  )
}

function CustomTooltip({ active, payload, label, unit }) {
  if (!active || !payload?.length) return null

  const row = payload[0].payload

  return (
    <div className="rounded-xl bg-white border border-slate-200 shadow-lg p-3">
      <p className="text-xs font-semibold text-slate-900">{label}</p>
      <p className="text-xs text-slate-500 mt-0.5">{row.desc}</p>
      <div className="grid grid-cols-2 gap-x-4 gap-y-1 mt-2">
        <p className="text-xs text-slate-500">High</p>
        <p className="text-xs font-mono text-slate-900 text-right">
          {row.max}°{unit}
        </p>
        <p className="text-xs text-slate-500">Low</p>
        <p className="text-xs font-mono text-slate-900 text-right">
          {row.min}°{unit}
        </p>
        <p className="text-xs text-slate-500">Rain</p>
        <p className="text-xs font-mono text-slate-900 text-right">{row.rain}%</p>
      </div>
    </div>
  )
}

export default function WeeklyTrends({ location, unit }) {
  const { data, isLoading, isError } = useWeeklyForecast(location)

  if (isLoading) return <SkeletonCard />

  if (isError || !data) {
    return (
      <div className="card p-6 flex items-center justify-center">
        <p className="text-sm text-aurora-red">Failed to load weekly forecast.</p>
      </div>
    )
  }

  const rows = buildRows(data, unit)
  const hottest = rows.reduce((max, item) => (item.max > max.max ? item : max), rows[0])
  const wettest = rows.reduce((max, item) => (item.rain > max.rain ? item : max), rows[0])
  const totalRain = rows.reduce((sum, item) => sum + item.rainAmount, 0)
  const peakWind = Math.max(...rows.map((item) => item.wind))

  return (
    <div className="space-y-4">
      <div className="card card-hover p-6">
        <div className="flex items-start justify-between gap-4 mb-5">
          <div>
            <p className="text-xs font-semibold text-slate-500 uppercase tracking-wider">
              Weekly Trends
            </p>
            <h2 className="text-xl font-semibold text-slate-900 mt-1">
              7-day forecast intelligence
            </h2>
          </div>

          <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-aurora-teal to-aurora-violet flex items-center justify-center">
            <CalendarDays size={18} className="text-white" />
          </div>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-7 gap-3">
          {rows.map((item, index) => (
            <DayCard key={item.label} item={item} active={index === 0} />
          ))}
        </div>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-4 gap-4">
        <StatPill icon={Sun} label="Hottest Day" value={`${hottest.day} · ${hottest.max}°`} color="data-amber" />
        <StatPill icon={CloudRainIcon} label="Wettest Day" value={`${wettest.day} · ${wettest.rain}%`} color="data-teal" />
        <StatPill icon={Droplets} label="Rain Total" value={`${totalRain.toFixed(1)} mm`} color="data-violet" />
        <StatPill icon={Wind} label="Peak Wind" value={`${peakWind} km/h`} color="data-amber" />
      </div>

      <div className="grid grid-cols-1 xl:grid-cols-2 gap-4">
        <div className="card card-hover p-5">
          <div className="flex items-center justify-between mb-4">
            <p className="text-xs font-semibold text-slate-500 uppercase tracking-wider">
              Temperature Range
            </p>
            <Sun size={16} className="data-amber" />
          </div>

          <div className="h-72">
            <ResponsiveContainer width="100%" height="100%">
              <ComposedChart data={rows} margin={{ top: 8, right: 10, left: -24, bottom: 0 }}>
                <CartesianGrid stroke="#E2E8F0" strokeDasharray="3 3" vertical={false} />
                <XAxis dataKey="day" tick={{ fontSize: 11, fill: '#64748B' }} axisLine={false} tickLine={false} />
                <YAxis tick={{ fontSize: 11, fill: '#64748B' }} axisLine={false} tickLine={false} width={42} unit={`°${unit}`} />
                <Tooltip content={<CustomTooltip unit={unit} />} />
                <Line type="monotone" dataKey="max" stroke="#F59E0B" strokeWidth={2.5} dot={{ r: 3 }} />
                <Line type="monotone" dataKey="min" stroke="#0D9488" strokeWidth={2.5} dot={{ r: 3 }} />
              </ComposedChart>
            </ResponsiveContainer>
          </div>
        </div>

        <div className="card card-hover p-5">
          <div className="flex items-center justify-between mb-4">
            <p className="text-xs font-semibold text-slate-500 uppercase tracking-wider">
              Rain Probability
            </p>
            <CloudRainIcon size={16} className="data-teal" />
          </div>

          <div className="h-72">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={rows} margin={{ top: 8, right: 10, left: -24, bottom: 0 }}>
                <CartesianGrid stroke="#E2E8F0" strokeDasharray="3 3" vertical={false} />
                <XAxis dataKey="day" tick={{ fontSize: 11, fill: '#64748B' }} axisLine={false} tickLine={false} />
                <YAxis tick={{ fontSize: 11, fill: '#64748B' }} axisLine={false} tickLine={false} width={42} unit="%" />
                <Tooltip cursor={{ fill: 'rgba(13, 148, 136, 0.06)' }} />
                <Bar dataKey="rain" fill="#0D9488" radius={[6, 6, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>
      </div>
    </div>
  )
}