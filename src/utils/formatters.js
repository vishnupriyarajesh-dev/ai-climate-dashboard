// src/utils/formatters.js
export function formatVisibility(value) {
  if (!Number.isFinite(value)) return '--'

  if (value >= 1000) {
    return `${(value / 1000).toFixed(1)} km`
  }

  return `${Math.round(value)} m`
}

export function formatPressure(value) {
  if (!Number.isFinite(value)) return '--'
  return `${Math.round(value)} hPa`
}

export function formatPercent(value) {
  if (!Number.isFinite(value)) return '--'
  return `${Math.round(value)}%`
}

export function formatSpeed(value) {
  if (!Number.isFinite(value)) return '--'
  return `${Math.round(value)} km/h`
}

export function formatTemp(value, unit = 'C') {
  if (!Number.isFinite(value)) return '--'
  return `${Math.round(value)}°${unit}`
}

export function formatRain(value) {
  if (!Number.isFinite(value)) return '--'
  return `${Number(value).toFixed(1)} mm`
}

export function formatHour(value) {
  if (!value) return '--'

  const date = new Date(value)

  if (Number.isNaN(date.getTime())) return '--'

  return date.toLocaleTimeString('en-US', {
    hour: 'numeric',
    hour12: true,
  })
}

export function formatDay(value) {
  if (!value) return '--'

  const date = new Date(value)

  if (Number.isNaN(date.getTime())) return '--'

  return date.toLocaleDateString('en-US', {
    weekday: 'short',
  })
}

export function formatShortDate(value) {
  if (!value) return '--'

  const date = new Date(value)

  if (Number.isNaN(date.getTime())) return '--'

  return date.toLocaleDateString('en-US', {
    month: 'short',
    day: 'numeric',
  })
}