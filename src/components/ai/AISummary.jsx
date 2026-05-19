import { Brain, CloudRain, ShieldAlert, Sparkles, TrendingUp } from 'lucide-react'
import { useAirQuality } from '../../hooks/useAirQuality'
import { useCurrentWeather, useHourlyForecast } from '../../hooks/useWeather'
import { getAQILabel, getWeatherDescription } from '../../services/weatherApi'

function SummarySkeleton() {
  return <div className="card p-5 md:p-6 h-64 animate-pulse" />
}

function InsightRow({ icon: Icon, label, value, color = 'data-teal' }) {
  return (
    <div className="flex items-start gap-3 p-3 rounded-xl bg-slate-50 border border-slate-200/60 min-w-0">
      <div className="w-8 h-8 rounded-lg bg-white border border-slate-200 flex items-center justify-center flex-shrink-0">
        <Icon size={15} className={color} />
      </div>
      <div className="min-w-0">
        <p className="text-[11px] font-semibold text-slate-500 uppercase tracking-wider">
          {label}
        </p>
        <p className="text-sm text-slate-800 mt-0.5 leading-relaxed break-words">
          {value}
        </p>
      </div>
    </div>
  )
}

export default function AISummary({ location }) {
  const weather = useCurrentWeather(location)
  const hourly = useHourlyForecast(location)
  const air = useAirQuality(location)

  if (weather.isLoading || hourly.isLoading || air.isLoading) return <SummarySkeleton />

  if (weather.isError || hourly.isError || air.isError || !weather.data || !hourly.data || !air.data) {
    return (
      <div className="card p-5 md:p-6 h-full flex items-center justify-center">
        <p className="text-sm text-aurora-red">Unable to generate climate summary.</p>
      </div>
    )
  }

  const current = weather.data
  const forecast = hourly.data
  const aqi = air.data.us_aqi
  const desc = getWeatherDescription(current.weather_code)
  const aqiInfo = getAQILabel(aqi)

  const rainMax = Math.max(...forecast.precipitation_probability.slice(0, 12))
  const avgWind = forecast.wind_speed_10m.slice(0, 12).reduce((sum, n) => sum + n, 0) / 12

  const tempTrend =
    forecast.temperature_2m[6] > forecast.temperature_2m[0]
      ? 'warming through the next few hours'
      : 'cooling gradually through the next few hours'

  const riskLevel =
    current.weather_code >= 95 || rainMax > 75 || aqi > 150
      ? 'High'
      : rainMax > 45 || aqi > 100 || avgWind > 35
        ? 'Moderate'
        : 'Low'

  const riskColor =
    riskLevel === 'High' ? 'data-red' : riskLevel === 'Moderate' ? 'data-amber' : 'data-emerald'

  return (
    <div className="card card-hover aurora-border aurora-surface p-5 md:p-6 flex flex-col gap-4 md:gap-5">
      <div className="flex items-start justify-between gap-4">
        <div className="min-w-0">
          <p className="text-xs font-semibold text-slate-500 uppercase tracking-wider">
            AI Weather Brief
          </p>
          <h2 className="text-base md:text-lg font-semibold text-slate-900 mt-1 truncate">
            {location.name} intelligence summary
          </h2>
        </div>

        <div className="w-9 h-9 md:w-10 md:h-10 rounded-xl bg-gradient-to-br from-aurora-teal to-aurora-violet flex items-center justify-center flex-shrink-0">
          <Brain size={18} className="text-white" />
        </div>
      </div>

      <p className="text-sm text-slate-700 leading-relaxed">
        Current conditions are <span className="font-semibold text-slate-900">{desc}</span> with
        a <span className={`font-semibold ${riskColor}`}>{riskLevel.toLowerCase()}</span> risk
        level. Air quality is <span className={`font-semibold ${aqiInfo.color}`}>{aqiInfo.label}</span>,
        and the short-term forecast is {tempTrend}.
      </p>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
        <InsightRow
          icon={CloudRain}
          label="Rain Outlook"
          value={`Peak rain probability in the next 12 hours is ${rainMax}%.`}
          color={rainMax > 60 ? 'data-amber' : 'data-teal'}
        />
        <InsightRow
          icon={TrendingUp}
          label="Temperature"
          value={`Feels like ${Math.round(current.apparent_temperature)}°C with humidity at ${current.relative_humidity_2m}%.`}
          color="data-violet"
        />
        <InsightRow
          icon={ShieldAlert}
          label="Risk Signal"
          value={`Overall environmental risk is ${riskLevel.toLowerCase()} based on weather, AQI, rain, and wind.`}
          color={riskColor}
        />
        <InsightRow
          icon={Sparkles}
          label="Recommendation"
          value={
            riskLevel === 'High'
              ? 'Avoid unnecessary outdoor travel and monitor alerts.'
              : riskLevel === 'Moderate'
                ? 'Carry rain protection and check conditions before travel.'
                : 'Conditions look stable for normal outdoor activity.'
          }
          color="data-emerald"
        />
      </div>

      <div className="h-1 w-full rounded-full bg-gradient-to-r from-aurora-teal via-aurora-violet to-aurora-amber opacity-40" />
    </div>
  )
}