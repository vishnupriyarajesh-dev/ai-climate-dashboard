// src/components/storm/StormTracker.jsx
import { Activity, CloudLightning, CloudRain, Navigation, Radar, Wind } from 'lucide-react'
import { useMemo } from 'react'
import { useCurrentWeather, useHourlyForecast, useWeeklyForecast } from '../../hooks/useWeather'
import { getWeatherDescription } from '../../services/weatherApi'

function SkeletonPage() {
  return (
    <div className="space-y-4">
      <div className="card p-4 md:p-6 animate-pulse h-44" />
      <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-4 gap-4">
        {[...Array(4)].map((_, i) => (
          <div key={i} className="card p-4 md:p-5 animate-pulse h-28" />
        ))}
      </div>
      <div className="card p-4 md:p-6 animate-pulse h-[360px] md:h-[520px]" />
    </div>
  )
}

function getStormRisk(current, hourly, weekly) {
  const weatherCode = current?.weather_code ?? 0
  const currentWind = current?.wind_speed_10m ?? 0
  const next12Rain = hourly?.precipitation_probability
    ? Math.max(...hourly.precipitation_probability.slice(0, 12))
    : 0
  const next12Wind = hourly?.wind_speed_10m
    ? Math.max(...hourly.wind_speed_10m.slice(0, 12))
    : currentWind
  const todayRain = weekly?.precipitation_probability_max?.[0] ?? next12Rain

  let score = 0

  if (weatherCode >= 95) score += 40
  else if (weatherCode >= 80) score += 25
  else if (weatherCode >= 61) score += 18

  if (next12Rain >= 85) score += 28
  else if (next12Rain >= 65) score += 20
  else if (next12Rain >= 45) score += 12

  if (next12Wind >= 60) score += 25
  else if (next12Wind >= 45) score += 18
  else if (next12Wind >= 30) score += 10

  if (todayRain >= 80) score += 12

  const riskScore = Math.min(score, 100)

  if (riskScore >= 70) {
    return {
      score: riskScore,
      label: 'High',
      color: 'data-red',
      bg: 'bg-aurora-red',
      message: 'Storm conditions may disrupt travel or outdoor plans. Monitor local warnings.',
    }
  }

  if (riskScore >= 40) {
    return {
      score: riskScore,
      label: 'Moderate',
      color: 'data-amber',
      bg: 'bg-aurora-amber',
      message: 'Some storm ingredients are present. Watch rainfall and wind changes closely.',
    }
  }

  return {
    score: riskScore,
    label: 'Low',
    color: 'data-emerald',
    bg: 'bg-aurora-emerald',
    message: 'No major storm signal detected from the current forecast.',
  }
}

function buildStormCells(location, riskScore) {
  const intensity = Math.max(riskScore, 18)

  return [
    { id: 'cell-a', x: 22, y: 28, size: 88 + intensity, delay: '0s' },
    { id: 'cell-b', x: 68, y: 36, size: 74 + intensity * 0.8, delay: '0.4s' },
    { id: 'cell-c', x: 45, y: 68, size: 92 + intensity * 0.9, delay: '0.8s' },
  ].map((cell) => ({
    ...cell,
    key: `${location.lat}-${location.lon}-${cell.id}`,
  }))
}

function StatCard({ icon: Icon, label, value, helper, color = 'data-teal' }) {
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

function TimelineItem({ time, rain, wind, severe }) {
  const color = severe ? 'bg-aurora-red' : rain >= 60 ? 'bg-aurora-amber' : 'bg-aurora-teal'

  return (
    <div className="flex items-center gap-3 min-w-0">
      <div className={`w-2 h-2 rounded-full ${color} flex-shrink-0`} />

      <div className="flex-1 min-w-0">
        <div className="flex items-center justify-between gap-2">
          <p className="text-xs font-semibold text-slate-900 whitespace-nowrap">{time}</p>
          <p className="text-xs font-mono text-slate-500 whitespace-nowrap">{rain}% rain</p>
        </div>
        <div className="h-1.5 bg-slate-200 rounded-full overflow-hidden mt-1.5">
          <div
            className={`h-full rounded-full ${color}`}
            style={{ width: `${Math.min(rain, 100)}%` }}
          />
        </div>
      </div>

      <p className="w-14 md:w-16 text-right text-xs font-mono text-slate-500 flex-shrink-0">
        {wind} km/h
      </p>
    </div>
  )
}

export default function StormTracker({ location }) {
  const currentQuery = useCurrentWeather(location)
  const hourlyQuery = useHourlyForecast(location)
  const weeklyQuery = useWeeklyForecast(location)

  if (currentQuery.isLoading || hourlyQuery.isLoading || weeklyQuery.isLoading) {
    return <SkeletonPage />
  }

  if (
    currentQuery.isError ||
    hourlyQuery.isError ||
    weeklyQuery.isError ||
    !currentQuery.data ||
    !hourlyQuery.data ||
    !weeklyQuery.data
  ) {
    return (
      <div className="card p-4 md:p-6 flex items-center justify-center">
        <p className="text-sm text-aurora-red">Failed to load storm tracking data.</p>
      </div>
    )
  }

  const current = currentQuery.data
  const hourly = hourlyQuery.data
  const weekly = weeklyQuery.data
  const risk = getStormRisk(current, hourly, weekly)

  const next12Rain = Math.max(...hourly.precipitation_probability.slice(0, 12))
  const next12Wind = Math.max(...hourly.wind_speed_10m.slice(0, 12))
  const condition = getWeatherDescription(current.weather_code)
  const cells = useMemo(() => buildStormCells(location, risk.score), [location, risk.score])

  const timeline = hourly.time.slice(0, 8).map((time, index) => ({
    time: new Date(time).toLocaleTimeString('en-US', {
      hour: 'numeric',
      hour12: true,
    }),
    rain: hourly.precipitation_probability[index],
    wind: Math.round(hourly.wind_speed_10m[index]),
    severe: hourly.weather_code[index] >= 95,
  }))

  return (
    <div className="space-y-4">
      <div className="card card-hover p-4 md:p-6">
        <div className="flex flex-col md:flex-row md:items-start justify-between gap-4 md:gap-6">
          <div className="min-w-0">
            <p className="text-xs font-semibold text-slate-500 uppercase tracking-wider">
              Storm Tracker
            </p>
            <h2 className="text-lg md:text-xl font-semibold text-slate-900 mt-1 leading-snug">
              {location.name} storm risk intelligence
            </h2>
            <p className="text-sm text-slate-600 mt-2 max-w-3xl leading-relaxed">
              Tracks thunderstorm signals, rainfall probability, peak wind, and short-term storm
              movement indicators from the forecast.
            </p>
          </div>

          <div className="md:text-right flex-shrink-0">
            <p className={`text-5xl md:text-6xl font-light leading-none ${risk.color}`}>
              {risk.score}
            </p>
            <p className={`text-sm font-semibold mt-1 ${risk.color}`}>{risk.label} Risk</p>
          </div>
        </div>

        <div className="mt-5 h-3 w-full bg-slate-200 rounded-full overflow-hidden">
          <div
            className={`h-full rounded-full ${risk.bg} transition-all duration-700`}
            style={{ width: `${risk.score}%` }}
          />
        </div>

        <p className="text-sm text-slate-600 mt-4 leading-relaxed">{risk.message}</p>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-4 gap-4">
        <StatCard
          icon={CloudLightning}
          label="Current"
          value={condition}
          helper="Observed weather code"
          color={risk.color}
        />
        <StatCard
          icon={CloudRain}
          label="Rain Peak"
          value={`${next12Rain}%`}
          helper="Next 12 hours"
          color={next12Rain >= 70 ? 'data-red' : 'data-teal'}
        />
        <StatCard
          icon={Wind}
          label="Wind Peak"
          value={`${Math.round(next12Wind)} km/h`}
          helper="Next 12 hours"
          color={next12Wind >= 45 ? 'data-amber' : 'data-violet'}
        />
        <StatCard
          icon={Activity}
          label="Signal"
          value={current.weather_code >= 95 ? 'Convective' : 'Stable'}
          helper="Storm ingredient status"
          color={current.weather_code >= 95 ? 'data-red' : 'data-emerald'}
        />
      </div>

      <div className="grid grid-cols-1 xl:grid-cols-12 gap-4">
        <div className="xl:col-span-8 card card-hover p-4 md:p-6 min-w-0">
          <div className="flex items-center justify-between gap-3 mb-5">
            <div className="min-w-0">
              <p className="text-xs font-semibold text-slate-500 uppercase tracking-wider">
                Radar Simulation
              </p>
              <h3 className="text-base md:text-lg font-semibold text-slate-900 mt-1 leading-snug">
                Storm cells around selected location
              </h3>
            </div>
            <Radar size={18} className="data-teal flex-shrink-0" />
          </div>

          <div className="relative h-[340px] md:h-[480px] overflow-hidden rounded-xl md:rounded-2xl border border-slate-200 bg-slate-100">
            <div className="absolute inset-0 bg-[radial-gradient(circle_at_center,#e2e8f0_1px,transparent_1px)] bg-[size:22px_22px] opacity-70" />
            <div className="absolute inset-0 bg-gradient-to-br from-slate-50 via-teal-50/40 to-violet-50/40" />

            <div className="absolute left-1/2 top-1/2 h-[380px] w-[380px] md:h-[620px] md:w-[620px] -translate-x-1/2 -translate-y-1/2 rounded-full border border-slate-300/60" />
            <div className="absolute left-1/2 top-1/2 h-[260px] w-[260px] md:h-[420px] md:w-[420px] -translate-x-1/2 -translate-y-1/2 rounded-full border border-slate-300/70" />
            <div className="absolute left-1/2 top-1/2 h-[140px] w-[140px] md:h-[220px] md:w-[220px] -translate-x-1/2 -translate-y-1/2 rounded-full border border-slate-300/80" />

            {cells.map((cell) => (
              <div
                key={cell.key}
                className="absolute rounded-full blur-xl"
                style={{
                  left: `${cell.x}%`,
                  top: `${cell.y}%`,
                  width: cell.size,
                  height: cell.size,
                  transform: 'translate(-50%, -50%)',
                  background:
                    risk.score >= 70
                      ? 'rgba(239, 68, 68, 0.42)'
                      : risk.score >= 40
                        ? 'rgba(245, 158, 11, 0.38)'
                        : 'rgba(13, 148, 136, 0.28)',
                  animation: 'pulse 2.4s ease-in-out infinite',
                  animationDelay: cell.delay,
                }}
              />
            ))}

            <div className="absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 text-center">
              <div className="relative mx-auto w-12 h-12 md:w-14 md:h-14 rounded-2xl bg-white shadow-xl border border-slate-200 flex items-center justify-center">
                <Navigation size={22} className="data-teal" />
              </div>
              <div className="mt-3 rounded-xl bg-white/90 backdrop-blur border border-slate-200 px-3 md:px-4 py-2 shadow-lg">
                <p className="text-sm font-semibold text-slate-900">{location.name}</p>
                <p className={`text-xs mt-0.5 ${risk.color}`}>{risk.label} storm risk</p>
              </div>
            </div>

            <div className="absolute left-3 right-3 bottom-3 md:left-5 md:right-auto rounded-xl bg-white/85 backdrop-blur border border-slate-200 px-3 py-2 shadow-sm">
              <p className="text-[10px] text-slate-500 uppercase tracking-wider">Coordinates</p>
              <p className="text-xs font-mono text-slate-900 mt-1">
                {location.lat.toFixed(3)}, {location.lon.toFixed(3)}
              </p>
            </div>
          </div>
        </div>

        <div className="xl:col-span-4 card card-hover p-4 md:p-6 min-w-0">
          <div className="flex items-center justify-between gap-3 mb-5">
            <div className="min-w-0">
              <p className="text-xs font-semibold text-slate-500 uppercase tracking-wider">
                Next 8 Hours
              </p>
              <h3 className="text-base md:text-lg font-semibold text-slate-900 mt-1">
                Storm timeline
              </h3>
            </div>
            <CloudRain size={18} className="data-teal flex-shrink-0" />
          </div>

          <div className="space-y-4">
            {timeline.map((item) => (
              <TimelineItem
                key={item.time}
                time={item.time}
                rain={item.rain}
                wind={item.wind}
                severe={item.severe}
              />
            ))}
          </div>

          <div className="mt-6 rounded-xl bg-slate-50 border border-slate-200/60 p-4">
            <p className="text-xs font-semibold text-slate-500 uppercase tracking-wider">
              Recommendation
            </p>
            <p className="text-sm text-slate-700 mt-2 leading-relaxed">
              {risk.score >= 70
                ? 'Avoid exposed outdoor travel and keep checking official local warnings.'
                : risk.score >= 40
                  ? 'Keep rain protection ready and avoid travel during peak rainfall windows.'
                  : 'Storm risk is low. Normal travel planning is reasonable for now.'}
            </p>
          </div>
        </div>
      </div>
    </div>
  )
}