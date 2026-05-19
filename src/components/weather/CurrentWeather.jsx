import {
  Cloud,
  CloudDrizzle,
  CloudFog,
  CloudLightning,
  CloudRain,
  CloudSnow,
  CloudSun,
  Droplets,
  Eye,
  Gauge,
  MapPin,
  Sun,
  Thermometer,
  Wind,
} from 'lucide-react'
import { useCurrentWeather } from '../../hooks/useWeather'
import {
  convertTemp,
  getWeatherDescription,
  getWindDirection,
} from '../../services/weatherApi'
import { formatPressure, formatVisibility } from '../../utils/formatters'

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

function StatRow({ icon: Icon, label, value, valueColor = 'text-slate-900' }) {
  return (
    <div className="flex items-center justify-between gap-3 py-2.5 border-b border-slate-100 last:border-0">
      <div className="flex items-center gap-2 min-w-0">
        <Icon size={14} className="text-slate-500 flex-shrink-0" />
        <span className="text-sm text-slate-600 truncate">{label}</span>
      </div>
      <span className={`text-sm font-semibold font-mono text-right ${valueColor}`}>
        {value}
      </span>
    </div>
  )
}

function SkeletonCard() {
  return (
    <div className="card p-6 h-full animate-pulse">
      <div className="h-4 w-32 bg-slate-200 rounded mb-6" />
      <div className="h-16 w-40 bg-slate-200 rounded mb-4" />
      <div className="h-4 w-24 bg-slate-200 rounded mb-8" />
      <div className="space-y-3">
        {[...Array(5)].map((_, index) => (
          <div key={index} className="h-3 bg-slate-200 rounded" />
        ))}
      </div>
    </div>
  )
}

function safeValue(value, fallback = '--') {
  return value === null || value === undefined || Number.isNaN(value) ? fallback : value
}

export default function CurrentWeather({ location, unit }) {
  const { data, isLoading, isError } = useCurrentWeather(location)

  if (isLoading) return <SkeletonCard />

  if (isError || !data) {
    return (
      <div className="card p-6 h-full flex items-center justify-center">
        <p className="text-sm text-aurora-red">Failed to load weather data.</p>
      </div>
    )
  }

  const temp = convertTemp(data.temperature_2m ?? 0, unit)
  const feelsLike = convertTemp(data.apparent_temperature ?? data.temperature_2m ?? 0, unit)
  const desc = getWeatherDescription(data.weather_code)
  const windDir = getWindDirection(data.wind_direction_10m ?? 0)
  const WeatherIcon = getWeatherIcon(data.weather_code)
  const weatherIconColor = getWeatherIconColor(data.weather_code)

  const humidity = safeValue(data.relative_humidity_2m)
  const windSpeed = safeValue(data.wind_speed_10m, 0)
  const cloudCover = safeValue(data.cloud_cover)
  const precipitation = safeValue(data.precipitation, 0)

  return (
    <div className="card card-hover p-6 h-full flex flex-col gap-5">
      <div className="flex items-center gap-2">
        <MapPin size={14} className="data-teal flex-shrink-0" />
        <span className="text-sm font-semibold text-slate-900 truncate">{location.name}</span>
        <span className="text-xs text-slate-500 ml-auto whitespace-nowrap">
          {new Date().toLocaleDateString('en-US', {
            weekday: 'long',
            month: 'short',
            day: 'numeric',
          })}
        </span>
      </div>

      <div className="flex flex-col sm:flex-row sm:items-start gap-6">
        <div className="min-w-0">
          <div className="flex items-end gap-1">
            <span className="text-6xl 2xl:text-7xl font-light text-gradient-primary leading-none">
              {temp}
            </span>
            <span className="text-2xl text-slate-400 mb-2">°{unit}</span>
          </div>

          <p className="text-sm text-slate-700 mt-2 font-medium">{desc}</p>
          <p className="text-xs text-slate-500 mt-0.5">
            Feels like {feelsLike}°{unit}
          </p>
        </div>

        <div className="sm:ml-auto flex sm:flex-col items-center gap-3">
          <div className="w-20 h-20 rounded-2xl bg-slate-50 border border-slate-200/70 flex items-center justify-center shadow-sm">
            <WeatherIcon size={38} strokeWidth={1.7} className={weatherIconColor} />
          </div>

          <div className="text-center bg-slate-50 border border-slate-200/60 px-3 py-2 rounded-xl card-hover">
            <p className="text-xs text-slate-500">Cloud cover</p>
            <p className="text-lg font-semibold data-violet font-mono">
              {cloudCover === '--' ? '--' : `${cloudCover}%`}
            </p>
          </div>
        </div>
      </div>

      <div className="h-px bg-slate-200/60" />

      <div className="flex-1">
        <StatRow
          icon={Droplets}
          label="Humidity"
          value={humidity === '--' ? '--' : `${humidity}%`}
          valueColor="data-violet"
        />
        <StatRow
          icon={Wind}
          label="Wind"
          value={`${Math.round(windSpeed)} km/h ${windDir}`}
          valueColor="data-teal"
        />
        <StatRow
          icon={Eye}
          label="Visibility"
          value={formatVisibility(data.visibility)}
          valueColor="text-slate-900"
        />
        <StatRow
          icon={Gauge}
          label="Pressure"
          value={formatPressure(data.surface_pressure)}
          valueColor="text-slate-900"
        />
        <StatRow
          icon={Thermometer}
          label="Precipitation"
          value={`${precipitation} mm`}
          valueColor="data-teal"
        />
      </div>

      <div className="h-1 w-full rounded-full bg-gradient-to-r from-aurora-teal via-aurora-violet to-aurora-amber opacity-40" />
    </div>
  )
}