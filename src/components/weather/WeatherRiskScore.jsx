// src/components/weather/WeatherRiskScore.jsx
import { AlertTriangle, ShieldCheck } from 'lucide-react'
import { useAirQuality } from '../../hooks/useAirQuality'
import { useCurrentWeather, useHourlyForecast, useWeeklyForecast } from '../../hooks/useWeather'
import { calculateWeatherRisk } from '../../utils/riskScores'

function SkeletonCard() {
  return <div className="card p-5 animate-pulse h-40" />
}

export default function WeatherRiskScore({ location }) {
  const currentQuery = useCurrentWeather(location)
  const hourlyQuery = useHourlyForecast(location)
  const weeklyQuery = useWeeklyForecast(location)
  const airQuery = useAirQuality(location)

  if (
    currentQuery.isLoading ||
    hourlyQuery.isLoading ||
    weeklyQuery.isLoading ||
    airQuery.isLoading
  ) {
    return <SkeletonCard />
  }

  if (
    currentQuery.isError ||
    hourlyQuery.isError ||
    weeklyQuery.isError ||
    airQuery.isError
  ) {
    return (
      <div className="card p-5 flex items-center justify-center">
        <p className="text-sm text-aurora-red">Failed to calculate weather risk.</p>
      </div>
    )
  }

  const current = currentQuery.data
  const hourly = hourlyQuery.data
  const weekly = weeklyQuery.data
  const air = airQuery.data

  const rainChance = Math.max(...hourly.precipitation_probability.slice(0, 12))
  const uv = weekly.uv_index_max?.[0] ?? current.uv_index ?? 0

  const risk = calculateWeatherRisk({
    weatherCode: current.weather_code,
    temperature: current.temperature_2m,
    humidity: current.relative_humidity_2m,
    windSpeed: current.wind_speed_10m,
    rainChance,
    aqi: air.us_aqi,
    uv,
  })

  const Icon = risk.score >= 40 ? AlertTriangle : ShieldCheck
  const topFactors = risk.factors.slice(0, 3)

  return (
    <div className="card card-hover aurora-border p-5">
      <div className="flex items-start justify-between gap-4">
        <div>
          <p className="text-xs font-semibold text-slate-500 uppercase tracking-wider">
            Weather Risk Score
          </p>
          <h3 className="text-lg font-semibold text-slate-900 mt-1">
            Environmental risk is <span className={risk.color}>{risk.label.toLowerCase()}</span>
          </h3>
        </div>

        <div className="w-10 h-10 rounded-xl bg-slate-50 border border-slate-200 flex items-center justify-center">
          <Icon size={18} className={risk.color} />
        </div>
      </div>

      <div className="flex items-end gap-4 mt-5">
        <div>
          <p className={`text-5xl font-light leading-none ${risk.color}`}>{risk.score}</p>
          <p className="text-xs text-slate-500 mt-1">out of 100</p>
        </div>

        <div className="flex-1 mb-2">
          <div className="h-2.5 w-full bg-slate-200 rounded-full overflow-hidden">
            <div
              className={`h-full rounded-full ${risk.bg} transition-all duration-700`}
              style={{ width: `${risk.score}%` }}
            />
          </div>
          <div className="flex justify-between mt-1.5">
            <span className="text-[10px] text-slate-400">Low</span>
            <span className="text-[10px] text-slate-400">High</span>
          </div>
        </div>
      </div>

      <div className="mt-4 flex flex-wrap gap-2">
        {topFactors.length > 0 ? (
          topFactors.map((factor) => (
            <span
              key={factor}
              className="px-2.5 py-1 rounded-lg bg-slate-50 border border-slate-200 text-xs text-slate-600"
            >
              {factor}
            </span>
          ))
        ) : (
          <span className="px-2.5 py-1 rounded-lg bg-emerald-50 border border-emerald-200 text-xs text-emerald-700">
            Stable conditions
          </span>
        )}
      </div>
    </div>
  )
}