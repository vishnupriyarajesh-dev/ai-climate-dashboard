// src/components/weather/HourlyForecast.jsx
import {
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
  Area,
  AreaChart,
  CartesianGrid,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from 'recharts'
import { useHourlyForecast } from '../../hooks/useWeather'
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
    <div className="card p-5 animate-pulse">
      <div className="flex items-center justify-between mb-5">
        <div className="h-4 w-32 bg-slate-200 rounded" />
        <div className="h-4 w-20 bg-slate-200 rounded" />
      </div>
      <div className="h-56 bg-slate-200 rounded-xl" />
    </div>
  )
}

function buildRows(data, unit) {
  return data.time.map((time, index) => {
    const date = new Date(time)
    const hour = date.toLocaleTimeString('en-US', {
      hour: 'numeric',
      hour12: true,
    })
    const code = data.weather_code[index]

    return {
      time: hour,
      temp: convertTemp(data.temperature_2m[index], unit),
      rawTemp: data.temperature_2m[index],
      rain: data.precipitation_probability[index],
      wind: Math.round(data.wind_speed_10m[index]),
      humidity: data.relative_humidity_2m[index],
      code,
      desc: getWeatherDescription(code),
    }
  })
}

function MiniHourCard({ item }) {
  const WeatherIcon = getWeatherIcon(item.code)

  return (
    <div className="min-w-[92px] rounded-xl bg-slate-50 border border-slate-200/60 p-3 text-center">
      <p className="text-[11px] text-slate-500 font-medium">{item.time}</p>

      <div className="w-9 h-9 rounded-xl bg-white border border-slate-200 mx-auto mt-2 flex items-center justify-center">
        <WeatherIcon size={18} strokeWidth={1.8} className={getWeatherIconColor(item.code)} />
      </div>

      <p className="text-lg font-mono font-semibold text-slate-900 mt-2">{item.temp}°</p>

      <div className="flex items-center justify-center gap-1 mt-2">
        <CloudRainIcon size={11} className="data-teal" />
        <span className="text-[11px] text-slate-500">{item.rain}%</span>
      </div>
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
        <p className="text-xs text-slate-500">Temp</p>
        <p className="text-xs font-mono text-slate-900 text-right">
          {row.temp}°{unit}
        </p>
        <p className="text-xs text-slate-500">Rain</p>
        <p className="text-xs font-mono text-slate-900 text-right">{row.rain}%</p>
        <p className="text-xs text-slate-500">Wind</p>
        <p className="text-xs font-mono text-slate-900 text-right">{row.wind} km/h</p>
      </div>
    </div>
  )
}

export default function HourlyForecast({ location, unit }) {
  const { data, isLoading, isError } = useHourlyForecast(location)

  if (isLoading) return <SkeletonCard />

  if (isError || !data) {
    return (
      <div className="card p-5 flex items-center justify-center">
        <p className="text-sm text-aurora-red">Failed to load hourly forecast.</p>
      </div>
    )
  }

  const rows = buildRows(data, unit)
  const nextSix = rows.slice(0, 6)
  const next12 = rows.slice(0, 12)
  const next12Rain = Math.max(...next12.map((item) => item.rain))
  const avgHumidity = Math.round(
    next12.reduce((sum, item) => sum + item.humidity, 0) / next12.length
  )
  const peakWind = Math.max(...next12.map((item) => item.wind))

  return (
    <div className="card card-hover p-5">
      <div className="flex items-start justify-between gap-4 mb-5">
        <div>
          <p className="text-xs font-semibold text-slate-500 uppercase tracking-wider">
            Hourly Forecast
          </p>
          <h2 className="text-lg font-semibold text-slate-900 mt-1">
            Next 24 hours
          </h2>
        </div>

        <div className="grid grid-cols-3 gap-2">
          <div className="rounded-xl bg-slate-50 border border-slate-200/60 px-3 py-2">
            <div className="flex items-center gap-1.5">
              <CloudRainIcon size={12} className="data-teal" />
              <p className="text-[10px] text-slate-500 uppercase tracking-wider">Rain</p>
            </div>
            <p className="text-sm font-mono font-semibold text-slate-900 mt-1">{next12Rain}%</p>
          </div>

          <div className="rounded-xl bg-slate-50 border border-slate-200/60 px-3 py-2">
            <div className="flex items-center gap-1.5">
              <Droplets size={12} className="data-violet" />
              <p className="text-[10px] text-slate-500 uppercase tracking-wider">Humid</p>
            </div>
            <p className="text-sm font-mono font-semibold text-slate-900 mt-1">
              {avgHumidity}%
            </p>
          </div>

          <div className="rounded-xl bg-slate-50 border border-slate-200/60 px-3 py-2">
            <div className="flex items-center gap-1.5">
              <Wind size={12} className="data-amber" />
              <p className="text-[10px] text-slate-500 uppercase tracking-wider">Wind</p>
            </div>
            <p className="text-sm font-mono font-semibold text-slate-900 mt-1">
              {peakWind} km/h
            </p>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-2 sm:grid-cols-3 xl:grid-cols-6 gap-3 mb-5">
        {nextSix.map((item) => (
          <MiniHourCard key={item.time} item={item} />
        ))}
      </div>

      <div className="h-64">
        <ResponsiveContainer width="100%" height="100%">
          <AreaChart data={rows} margin={{ top: 10, right: 12, left: -24, bottom: 0 }}>
            <defs>
              <linearGradient id="hourlyTempGradient" x1="0" y1="0" x2="0" y2="1">
                <stop offset="5%" stopColor="#0D9488" stopOpacity={0.35} />
                <stop offset="95%" stopColor="#0D9488" stopOpacity={0.02} />
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
              stroke="#0D9488"
              strokeWidth={2.5}
              fill="url(#hourlyTempGradient)"
              activeDot={{ r: 4, fill: '#7C3AED', stroke: '#fff', strokeWidth: 2 }}
            />
          </AreaChart>
        </ResponsiveContainer>
      </div>

      <div className="h-1 w-full rounded-full bg-gradient-to-r from-aurora-teal via-aurora-violet to-aurora-amber opacity-40 mt-4" />
    </div>
  )
}