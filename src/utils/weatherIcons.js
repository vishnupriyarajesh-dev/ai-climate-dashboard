// src/utils/weatherIcons.jsx
import {
  Cloud,
  CloudDrizzle,
  CloudFog,
  CloudLightning,
  CloudRain,
  CloudSnow,
  CloudSun,
  Sun,
  Thermometer,
} from 'lucide-react'

export function getWeatherIcon(code) {
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

export function getWeatherIconColor(code) {
  if (code === 0) return 'data-amber'
  if (code <= 3) return 'data-teal'
  if (code <= 48) return 'text-slate-500'
  if (code <= 65) return 'data-teal'
  if (code <= 75) return 'data-violet'
  if (code <= 82) return 'data-teal'
  if (code <= 99) return 'data-red'
  return 'data-amber'
}