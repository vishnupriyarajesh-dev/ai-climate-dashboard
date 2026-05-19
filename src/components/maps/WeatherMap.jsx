import { Layers, MapPin, Navigation, Radar, Thermometer, Wind } from 'lucide-react'
import { useMemo, useState } from 'react'
import { useAirQuality } from '../../hooks/useAirQuality'
import { useCurrentWeather, useHourlyForecast } from '../../hooks/useWeather'
import { getAQILabel, getWeatherDescription } from '../../services/weatherApi'

const MAP_MODES = [
  { id: 'temperature', label: 'Temp', icon: Thermometer },
  { id: 'rain', label: 'Rain', icon: Radar },
  { id: 'wind', label: 'Wind', icon: Wind },
  { id: 'aqi', label: 'AQI', icon: Layers },
]

function getModeColor(mode, current, hourly, aqi) {
  if (mode === 'temperature') {
    const temp = current?.temperature_2m ?? 25
    if (temp >= 38) return 'rgba(239, 68, 68, 0.55)'
    if (temp >= 30) return 'rgba(245, 158, 11, 0.5)'
    return 'rgba(13, 148, 136, 0.45)'
  }

  if (mode === 'rain') {
    const rain = hourly?.precipitation_probability
      ? Math.max(...hourly.precipitation_probability.slice(0, 12))
      : 0
    if (rain >= 75) return 'rgba(13, 148, 136, 0.65)'
    if (rain >= 45) return 'rgba(20, 184, 166, 0.45)'
    return 'rgba(124, 58, 237, 0.24)'
  }

  if (mode === 'wind') {
    const wind = current?.wind_speed_10m ?? 0
    if (wind >= 45) return 'rgba(239, 68, 68, 0.5)'
    if (wind >= 28) return 'rgba(245, 158, 11, 0.45)'
    return 'rgba(124, 58, 237, 0.38)'
  }

  const score = aqi?.us_aqi ?? 50
  if (score >= 150) return 'rgba(239, 68, 68, 0.5)'
  if (score >= 100) return 'rgba(245, 158, 11, 0.45)'
  return 'rgba(16, 185, 129, 0.42)'
}

function getModeLabel(mode, current, hourly, aqi) {
  if (mode === 'temperature') return `${Math.round(current?.temperature_2m ?? 0)}°C`

  if (mode === 'rain') {
    const rain = hourly?.precipitation_probability
      ? Math.max(...hourly.precipitation_probability.slice(0, 12))
      : 0
    return `${rain}% rain`
  }

  if (mode === 'wind') return `${Math.round(current?.wind_speed_10m ?? 0)} km/h`

  return `AQI ${aqi?.us_aqi ?? '--'}`
}

function generateHeatPoints(lat, lon) {
  return [
    { x: 50, y: 48, size: 210, opacity: 0.42 },
    { x: 36, y: 38, size: 150, opacity: 0.28 },
    { x: 64, y: 35, size: 135, opacity: 0.24 },
    { x: 41, y: 66, size: 120, opacity: 0.22 },
    { x: 68, y: 62, size: 145, opacity: 0.26 },
  ].map((point, index) => ({
    ...point,
    id: `${lat}-${lon}-${index}`,
  }))
}

function MetricChip({ icon: Icon, label, value, color = 'data-teal' }) {
  return (
    <div className="rounded-xl bg-white/85 backdrop-blur border border-slate-200/70 px-3 py-2 shadow-sm min-w-0">
      <div className="flex items-center gap-1.5">
        <Icon size={12} className={`${color} flex-shrink-0`} />
        <p className="text-[10px] text-slate-500 uppercase tracking-wider truncate">{label}</p>
      </div>
      <p className="text-sm font-mono font-semibold text-slate-900 mt-1 truncate">{value}</p>
    </div>
  )
}

export default function WeatherMap({ location }) {
  const [mode, setMode] = useState('temperature')

  const currentQuery = useCurrentWeather(location)
  const hourlyQuery = useHourlyForecast(location)
  const airQuery = useAirQuality(location)

  const current = currentQuery.data
  const hourly = hourlyQuery.data
  const aqi = airQuery.data

  const modeColor = getModeColor(mode, current, hourly, aqi)
  const modeLabel = getModeLabel(mode, current, hourly, aqi)
  const points = useMemo(() => generateHeatPoints(location.lat, location.lon), [location])
  const aqiInfo = getAQILabel(aqi?.us_aqi ?? 50)
  const weatherDesc = current ? getWeatherDescription(current.weather_code) : 'Loading'

  const rainPeak = hourly?.precipitation_probability
    ? Math.max(...hourly.precipitation_probability.slice(0, 12))
    : 0

  return (
    <div className="card card-hover p-4 md:p-6">
      <div className="flex flex-col xl:flex-row xl:items-start justify-between gap-4 mb-5">
        <div className="min-w-0">
          <p className="text-xs font-semibold text-slate-500 uppercase tracking-wider">
            Live Weather Map
          </p>
          <h2 className="text-lg md:text-xl font-semibold text-slate-900 mt-1">
            {location.name} environmental layers
          </h2>
          <p className="text-sm text-slate-600 mt-2 max-w-2xl">
            Interactive-style weather intelligence for temperature, rainfall, wind, and air quality.
          </p>
        </div>

        <div className="grid grid-cols-4 gap-1 bg-slate-100 border border-slate-200 rounded-xl p-1 w-full xl:w-auto">
          {MAP_MODES.map(({ id, label, icon: Icon }) => (
            <button
              key={id}
              type="button"
              onClick={() => setMode(id)}
              className={`flex items-center justify-center gap-1 px-2 md:px-3 py-1.5 rounded-lg text-xs md:text-sm font-medium transition-all ${
                mode === id
                  ? 'bg-white shadow-sm text-aurora-teal border border-teal-200'
                  : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              <Icon size={13} />
              <span>{label}</span>
            </button>
          ))}
        </div>
      </div>

      <div className="relative h-[520px] md:h-[560px] overflow-hidden rounded-xl md:rounded-2xl border border-slate-200 bg-slate-100">
        <div className="absolute inset-0 bg-[linear-gradient(#cbd5e1_1px,transparent_1px),linear-gradient(90deg,#cbd5e1_1px,transparent_1px)] bg-[size:44px_44px] opacity-40" />
        <div className="absolute inset-0 bg-gradient-to-br from-slate-50 via-teal-50/50 to-violet-50/50" />

        {points.map((point) => (
          <div
            key={point.id}
            className="absolute rounded-full blur-2xl transition-all duration-500"
            style={{
              left: `${point.x}%`,
              top: `${point.y}%`,
              width: point.size,
              height: point.size,
              transform: 'translate(-50%, -50%)',
              background: modeColor,
              opacity: point.opacity,
            }}
          />
        ))}

        <div className="absolute left-1/2 top-[42%] md:top-1/2 -translate-x-1/2 -translate-y-1/2 flex flex-col items-center">
          <div className="relative">
            <span className="absolute inset-0 rounded-full bg-aurora-teal animate-ping opacity-25" />
            <div className="relative w-14 h-14 rounded-2xl bg-white shadow-xl border border-slate-200 flex items-center justify-center">
              <MapPin size={24} className="data-teal" />
            </div>
          </div>

          <div className="mt-3 rounded-xl bg-white/90 backdrop-blur border border-slate-200 px-4 py-2 shadow-lg text-center">
            <p className="text-sm font-semibold text-slate-900">{location.name}</p>
            <p className="text-xs text-slate-500 mt-0.5">{modeLabel}</p>
          </div>
        </div>

        <div className="absolute left-3 right-3 top-3 grid grid-cols-2 md:grid-cols-4 gap-2">
          <MetricChip
            icon={Thermometer}
            label="Temp"
            value={current ? `${Math.round(current.temperature_2m)}°C` : '--'}
            color="data-amber"
          />
          <MetricChip icon={Radar} label="Rain" value={`${rainPeak}%`} color="data-teal" />
          <MetricChip
            icon={Wind}
            label="Wind"
            value={current ? `${Math.round(current.wind_speed_10m)} km/h` : '--'}
            color="data-violet"
          />
          <MetricChip icon={Layers} label="AQI" value={aqi?.us_aqi ?? '--'} color={aqiInfo.color} />
        </div>

        <div className="absolute left-3 right-3 bottom-3 md:left-auto md:right-5 md:bottom-5 md:w-72 rounded-2xl bg-white/90 backdrop-blur border border-slate-200 p-4 shadow-lg">
          <div className="flex items-center gap-2">
            <Navigation size={15} className="data-teal flex-shrink-0" />
            <p className="text-xs font-semibold text-slate-500 uppercase tracking-wider">
              Layer Intelligence
            </p>
          </div>
          <p className="text-sm font-semibold text-slate-900 mt-3">{weatherDesc}</p>
          <p className="text-xs text-slate-600 mt-1 leading-relaxed">
            Current layer: <span className="font-semibold">{mode}</span>. Intensity visualizes
            relative risk near the selected location.
          </p>

          <div className="mt-3 rounded-xl bg-slate-50 border border-slate-200 px-3 py-2">
            <p className="text-[10px] text-slate-500 uppercase tracking-wider">Coordinates</p>
            <p className="text-xs font-mono text-slate-900 mt-1">
              {location.lat.toFixed(3)}, {location.lon.toFixed(3)}
            </p>
          </div>
        </div>
      </div>
    </div>
  )
}