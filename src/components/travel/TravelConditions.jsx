// src/components/travel/TravelConditions.jsx
import {
  AlertTriangle,
  Car,
  Clock,
  CloudRain,
  Compass,
  Navigation,
  ShieldCheck,
  Sun,
  Wind,
} from 'lucide-react'
import { useAirQuality } from '../../hooks/useAirQuality'
import { useCurrentWeather, useHourlyForecast, useWeeklyForecast } from '../../hooks/useWeather'

function getScore({ weatherCode, rainChance, windSpeed, aqi, uv }) {
  let score = 100

  if (weatherCode >= 95) score -= 35
  else if (weatherCode >= 61) score -= 20
  else if (weatherCode >= 51) score -= 10

  if (rainChance > 80) score -= 25
  else if (rainChance > 50) score -= 15
  else if (rainChance > 30) score -= 8

  if (windSpeed > 50) score -= 20
  else if (windSpeed > 35) score -= 12
  else if (windSpeed > 25) score -= 6

  if (aqi > 200) score -= 25
  else if (aqi > 150) score -= 18
  else if (aqi > 100) score -= 10

  if (uv > 10) score -= 12
  else if (uv > 7) score -= 8

  return Math.max(score, 0)
}

function getLevel(score) {
  if (score >= 80) return { label: 'Good', color: 'data-emerald', bg: 'bg-aurora-emerald' }
  if (score >= 60) return { label: 'Fair', color: 'data-amber', bg: 'bg-aurora-amber' }
  if (score >= 40) return { label: 'Poor', color: 'data-red', bg: 'bg-aurora-red' }
  return { label: 'Unsafe', color: 'data-red', bg: 'bg-aurora-red' }
}

function getPrimaryConcern({ rainChance, windSpeed, aqi, uv, weatherCode }) {
  if (weatherCode >= 95) return 'Thunderstorm risk is the main travel concern.'
  if (rainChance >= 70) return 'Heavy rain may cause delays or waterlogging.'
  if (windSpeed >= 45) return 'Strong winds may affect exposed roads and two-wheelers.'
  if (aqi >= 150) return 'Air quality is unhealthy for outdoor travel.'
  if (uv >= 8) return 'High UV exposure is the main outdoor risk.'
  return 'No major travel disruption signal is currently active.'
}

function SkeletonPage() {
  return (
    <div className="space-y-4">
      <div className="card p-6 animate-pulse h-44" />
      <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-4 gap-4">
        {[...Array(4)].map((_, i) => (
          <div key={i} className="card p-5 animate-pulse h-28" />
        ))}
      </div>
      <div className="card p-6 animate-pulse h-72" />
    </div>
  )
}

function TravelMetric({ icon: Icon, label, value, color = 'data-teal' }) {
  return (
    <div className="card card-hover p-4">
      <div className="flex items-center justify-between">
        <p className="text-xs font-semibold text-slate-500 uppercase tracking-wider">{label}</p>
        <Icon size={15} className={color} />
      </div>
      <p className="text-2xl font-light text-slate-900 mt-3 font-mono">{value}</p>
    </div>
  )
}

function TimelineRow({ item }) {
  const riskColor =
    item.rain >= 70 || item.wind >= 45
      ? 'bg-aurora-red'
      : item.rain >= 40 || item.wind >= 30
        ? 'bg-aurora-amber'
        : 'bg-aurora-teal'

  return (
    <div className="flex items-center gap-3">
      <div className={`w-2 h-2 rounded-full ${riskColor}`} />
      <p className="w-14 text-xs font-semibold text-slate-900">{item.time}</p>
      <div className="flex-1 h-2 bg-slate-200 rounded-full overflow-hidden">
        <div
          className={`h-full rounded-full ${riskColor}`}
          style={{ width: `${Math.min(item.score, 100)}%` }}
        />
      </div>
      <p className="w-16 text-right text-xs font-mono text-slate-500">{item.score}/100</p>
    </div>
  )
}

export default function TravelConditions({ location }) {
  const weather = useCurrentWeather(location)
  const hourly = useHourlyForecast(location)
  const weekly = useWeeklyForecast(location)
  const air = useAirQuality(location)

  if (weather.isLoading || hourly.isLoading || weekly.isLoading || air.isLoading) {
    return <SkeletonPage />
  }

  if (weather.isError || hourly.isError || weekly.isError || air.isError) {
    return (
      <div className="card p-6">
        <p className="text-sm text-aurora-red">Failed to load travel conditions.</p>
      </div>
    )
  }

  const current = weather.data
  const forecast = hourly.data
  const weeklyData = weekly.data
  const aqi = air.data.us_aqi
  const uv = weeklyData.uv_index_max?.[0] ?? current.uv_index ?? 0

  const next12Rain = Math.max(...forecast.precipitation_probability.slice(0, 12))
  const next12Wind = Math.max(...forecast.wind_speed_10m.slice(0, 12))

  const score = getScore({
    weatherCode: current.weather_code,
    rainChance: next12Rain,
    windSpeed: next12Wind,
    aqi,
    uv,
  })

  const level = getLevel(score)

  const timeline = forecast.time.slice(0, 8).map((time, index) => {
    const rain = forecast.precipitation_probability[index]
    const wind = forecast.wind_speed_10m[index]
    const hourScore = getScore({
      weatherCode: forecast.weather_code[index],
      rainChance: rain,
      windSpeed: wind,
      aqi,
      uv,
    })

    return {
      time: new Date(time).toLocaleTimeString('en-US', {
        hour: 'numeric',
        hour12: true,
      }),
      rain,
      wind: Math.round(wind),
      score: hourScore,
    }
  })

  const best = timeline.reduce((bestItem, item) =>
    item.score > bestItem.score ? item : bestItem
  )

  const concern = getPrimaryConcern({
    rainChance: next12Rain,
    windSpeed: next12Wind,
    aqi,
    uv,
    weatherCode: current.weather_code,
  })

  return (
    <div className="space-y-4">
      <div className="card card-hover p-6">
        <div className="flex flex-col lg:flex-row lg:items-start justify-between gap-6">
          <div>
            <p className="text-xs font-semibold text-slate-500 uppercase tracking-wider">
              Travel Conditions
            </p>
            <h2 className="text-xl font-semibold text-slate-900 mt-1">
              {location.name} travel safety intelligence
            </h2>
            <p className="text-sm text-slate-600 mt-2 max-w-3xl">
              Travel score combines rainfall, wind, air quality, UV exposure, and current weather
              severity into one route-readiness signal.
            </p>
          </div>

          <div className="lg:text-right">
            <p className={`text-6xl font-light leading-none ${level.color}`}>{score}</p>
            <p className={`text-sm font-semibold mt-1 ${level.color}`}>{level.label}</p>
          </div>
        </div>

        <div className="mt-6 h-3 w-full bg-slate-200 rounded-full overflow-hidden">
          <div
            className={`h-full rounded-full ${level.bg} transition-all duration-700`}
            style={{ width: `${score}%` }}
          />
        </div>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-4 gap-4">
        <TravelMetric icon={CloudRain} label="Rain Risk" value={`${next12Rain}%`} color="data-teal" />
        <TravelMetric icon={Wind} label="Peak Wind" value={`${Math.round(next12Wind)} km/h`} color="data-violet" />
        <TravelMetric icon={Clock} label="Best Time" value={best.time} color="data-emerald" />
        <TravelMetric icon={Sun} label="UV Index" value={Math.round(uv)} color={uv >= 8 ? 'data-red' : 'data-amber'} />
      </div>

      <div className="grid grid-cols-1 xl:grid-cols-12 gap-4">
        <div className="xl:col-span-7 card card-hover p-6">
          <div className="flex items-center justify-between mb-5">
            <div>
              <p className="text-xs font-semibold text-slate-500 uppercase tracking-wider">
                Route Readiness
              </p>
              <h3 className="text-lg font-semibold text-slate-900 mt-1">
                Next 8-hour travel window
              </h3>
            </div>
            <Compass size={18} className="data-teal" />
          </div>

          <div className="space-y-4">
            {timeline.map((item) => (
              <TimelineRow key={item.time} item={item} />
            ))}
          </div>
        </div>

        <div className="xl:col-span-5 card card-hover p-6">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-slate-50 border border-slate-200 flex items-center justify-center">
              {score >= 70 ? (
                <ShieldCheck size={18} className="data-emerald" />
              ) : score >= 40 ? (
                <Car size={18} className="data-amber" />
              ) : (
                <AlertTriangle size={18} className="data-red" />
              )}
            </div>

            <div>
              <p className="text-sm font-semibold text-slate-900">Recommendation</p>
              <p className="text-xs text-slate-500">Generated from current environmental risk</p>
            </div>
          </div>

          <p className="text-sm text-slate-700 mt-5 leading-relaxed">{concern}</p>

          <div className="rounded-xl bg-slate-50 border border-slate-200/60 p-4 mt-5">
            <div className="flex items-center gap-2">
              <Navigation size={14} className="data-teal" />
              <p className="text-xs font-semibold text-slate-500 uppercase tracking-wider">
                Action
              </p>
            </div>
            <p className="text-sm text-slate-700 mt-2 leading-relaxed">
              {score >= 80
                ? 'Conditions are favorable for travel. Normal caution is enough.'
                : score >= 60
                  ? 'Travel is manageable, but check rain and wind before leaving.'
                  : score >= 40
                    ? 'Travel may be uncomfortable. Avoid long outdoor exposure if possible.'
                    : 'Avoid non-essential travel until conditions improve.'}
            </p>
          </div>
        </div>
      </div>
    </div>
  )
}