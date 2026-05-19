// src/components/alerts/WeatherAlerts.jsx
import { useMemo, useState } from 'react'
import { AlertTriangle, Droplets, Eye, Thermometer, Wind, X } from 'lucide-react'
import { useAirQuality } from '../../hooks/useAirQuality'
import {
  useCurrentWeather,
  useHourlyForecast,
  useWeeklyForecast,
} from '../../hooks/useWeather'

function generateAlerts(current, hourly, weekly, aqi) {
  const alerts = []

  if (current) {
    if (current.weather_code >= 95) {
      alerts.push({
        id: 'storm-current',
        type: 'danger',
        icon: AlertTriangle,
        title: 'Thunderstorm Risk',
        desc: 'Thunderstorm conditions detected. Avoid exposed outdoor areas and monitor local updates.',
      })
    }

    if (current.temperature_2m >= 40) {
      alerts.push({
        id: 'heat-extreme',
        type: 'danger',
        icon: Thermometer,
        title: 'Extreme Heat Warning',
        desc: `Temperature is ${Math.round(current.temperature_2m)}°C. Stay indoors, hydrate, and avoid peak afternoon travel.`,
      })
    } else if (current.temperature_2m >= 35) {
      alerts.push({
        id: 'heat-high',
        type: 'warn',
        icon: Thermometer,
        title: 'Heat Advisory',
        desc: `Temperature is ${Math.round(current.temperature_2m)}°C. Limit outdoor activity and watch for heat stress.`,
      })
    }

    if (current.wind_speed_10m >= 60) {
      alerts.push({
        id: 'wind-strong',
        type: 'danger',
        icon: Wind,
        title: 'Strong Wind Warning',
        desc: `Wind speed is ${Math.round(current.wind_speed_10m)} km/h. Secure loose outdoor objects and avoid exposed routes.`,
      })
    } else if (current.wind_speed_10m >= 40) {
      alerts.push({
        id: 'wind-moderate',
        type: 'warn',
        icon: Wind,
        title: 'Wind Advisory',
        desc: `Wind speed is ${Math.round(current.wind_speed_10m)} km/h. Two-wheeler and highway travel may be uncomfortable.`,
      })
    }

    if (current.relative_humidity_2m >= 90 && current.temperature_2m >= 30) {
      alerts.push({
        id: 'humidity-heat',
        type: 'warn',
        icon: Droplets,
        title: 'High Humidity Stress',
        desc: `Humidity is ${current.relative_humidity_2m}%. Conditions may feel hotter than the measured temperature.`,
      })
    }

    if (current.visibility < 1000) {
      alerts.push({
        id: 'visibility-low',
        type: 'danger',
        icon: Eye,
        title: 'Low Visibility Warning',
        desc: 'Visibility is below 1 km. Drive slowly, use headlights, and avoid sudden lane changes.',
      })
    } else if (current.visibility < 3000) {
      alerts.push({
        id: 'visibility-reduced',
        type: 'warn',
        icon: Eye,
        title: 'Reduced Visibility',
        desc: 'Visibility is reduced. Allow extra time for road travel.',
      })
    }
  }

  if (hourly) {
    const next12Rain = Math.max(...hourly.precipitation_probability.slice(0, 12))
    const next12Wind = Math.max(...hourly.wind_speed_10m.slice(0, 12))

    if (next12Rain >= 80) {
      alerts.push({
        id: 'rain-heavy-next12',
        type: 'danger',
        icon: Droplets,
        title: 'Heavy Rain Likely',
        desc: `${next12Rain}% rain probability in the next 12 hours. Expect delays and possible waterlogging.`,
      })
    } else if (next12Rain >= 60) {
      alerts.push({
        id: 'rain-moderate-next12',
        type: 'warn',
        icon: Droplets,
        title: 'Rain Watch',
        desc: `${next12Rain}% rain probability in the next 12 hours. Carry rain protection before heading out.`,
      })
    }

    if (next12Wind >= 55) {
      alerts.push({
        id: 'wind-peak-next12',
        type: 'warn',
        icon: Wind,
        title: 'Peak Wind Ahead',
        desc: `Forecast wind may reach ${Math.round(next12Wind)} km/h within 12 hours.`,
      })
    }
  }

  if (weekly) {
    const todayRain = weekly.precipitation_probability_max?.[0]
    const todayUv = weekly.uv_index_max?.[0]

    if (todayRain >= 80) {
      alerts.push({
        id: 'rain-daily-heavy',
        type: 'warn',
        icon: Droplets,
        title: 'Wet Day Ahead',
        desc: `${todayRain}% maximum rain probability today. Outdoor plans may need adjustment.`,
      })
    }

    if (todayUv >= 9) {
      alerts.push({
        id: 'uv-extreme',
        type: 'danger',
        icon: Thermometer,
        title: 'Very High UV Index',
        desc: `UV index may reach ${Math.round(todayUv)} today. Use sunscreen and avoid long midday exposure.`,
      })
    } else if (todayUv >= 7) {
      alerts.push({
        id: 'uv-high',
        type: 'warn',
        icon: Thermometer,
        title: 'High UV Index',
        desc: `UV index may reach ${Math.round(todayUv)} today. Use sun protection outdoors.`,
      })
    }
  }

  if (aqi) {
    if (aqi.us_aqi >= 200) {
      alerts.push({
        id: 'aqi-danger',
        type: 'danger',
        icon: Wind,
        title: 'Hazardous Air Quality',
        desc: `AQI is ${aqi.us_aqi}. Avoid outdoor activity and consider a mask if travel is necessary.`,
      })
    } else if (aqi.us_aqi >= 150) {
      alerts.push({
        id: 'aqi-unhealthy',
        type: 'warn',
        icon: Wind,
        title: 'Unhealthy Air Quality',
        desc: `AQI is ${aqi.us_aqi}. Sensitive groups should reduce outdoor exposure.`,
      })
    } else if (aqi.us_aqi >= 100) {
      alerts.push({
        id: 'aqi-sensitive',
        type: 'warn',
        icon: Wind,
        title: 'Air Quality Watch',
        desc: `AQI is ${aqi.us_aqi}. Sensitive groups may notice discomfort outdoors.`,
      })
    }
  }

  return alerts.slice(0, 4)
}

const typeStyles = {
  danger: {
    bg: 'bg-red-50',
    border: 'border-aurora-red/20',
    icon: 'text-aurora-red',
    title: 'text-aurora-red',
    desc: 'text-red-700',
    dot: 'bg-aurora-red',
  },
  warn: {
    bg: 'bg-amber-50',
    border: 'border-aurora-amber/20',
    icon: 'text-aurora-amber',
    title: 'text-aurora-amber',
    desc: 'text-amber-700',
    dot: 'bg-aurora-amber',
  },
}

export default function WeatherAlerts({ location }) {
  const [dismissed, setDismissed] = useState([])

  const { data: current } = useCurrentWeather(location)
  const { data: hourly } = useHourlyForecast(location)
  const { data: weekly } = useWeeklyForecast(location)
  const { data: aqi } = useAirQuality(location)

  const visible = useMemo(() => {
    const allAlerts = generateAlerts(current, hourly, weekly, aqi)
    return allAlerts.filter((alert) => !dismissed.includes(alert.id))
  }, [current, hourly, weekly, aqi, dismissed])

  if (visible.length === 0) return null

  return (
    <div className="flex flex-col gap-2">
      {visible.map((alert) => {
        const styles = typeStyles[alert.type]
        const Icon = alert.icon

        return (
          <div
            key={alert.id}
            className={`flex items-start gap-3 px-4 py-3 rounded-xl border ${styles.bg} ${styles.border}`}
          >
            <div className="flex-shrink-0 mt-1">
              <span className="relative flex h-2 w-2">
                <span
                  className={`animate-ping absolute inline-flex h-full w-full rounded-full opacity-75 ${styles.dot}`}
                />
                <span className={`relative inline-flex rounded-full h-2 w-2 ${styles.dot}`} />
              </span>
            </div>

            <Icon size={15} className={`flex-shrink-0 mt-0.5 ${styles.icon}`} />

            <div className="flex-1 min-w-0">
              <p className={`text-xs font-semibold ${styles.title}`}>{alert.title}</p>
              <p className={`text-xs mt-0.5 leading-relaxed ${styles.desc}`}>{alert.desc}</p>
            </div>

            <button
              type="button"
              onClick={() => setDismissed((items) => [...items, alert.id])}
              className="flex-shrink-0 p-1 rounded-lg hover:bg-black/5 transition-colors"
              aria-label={`Dismiss ${alert.title}`}
            >
              <X size={13} className="text-slate-400" />
            </button>
          </div>
        )
      })}
    </div>
  )
}