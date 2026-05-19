import axios from 'axios'

const BASE_URL = 'https://api.open-meteo.com/v1'
const AQI_URL = 'https://air-quality-api.open-meteo.com/v1'
const ARCHIVE_URL = 'https://archive-api.open-meteo.com/v1/archive'

export function convertTemp(celsius, unit) {
  if (unit === 'F') return Math.round((celsius * 9) / 5 + 32)
  return Math.round(celsius)
}

export function getWeatherDescription(code) {
  const codes = {
    0: 'Clear Sky',
    1: 'Mainly Clear',
    2: 'Partly Cloudy',
    3: 'Overcast',
    45: 'Foggy',
    48: 'Icy Fog',
    51: 'Light Drizzle',
    53: 'Drizzle',
    55: 'Heavy Drizzle',
    61: 'Light Rain',
    63: 'Rain',
    65: 'Heavy Rain',
    71: 'Light Snow',
    73: 'Snow',
    75: 'Heavy Snow',
    80: 'Light Showers',
    81: 'Showers',
    82: 'Heavy Showers',
    95: 'Thunderstorm',
    96: 'Thunderstorm',
    99: 'Heavy Thunderstorm',
  }

  return codes[code] ?? 'Unknown'
}

export function getWeatherEmoji(code) {
  if (code === 0) return '☀️'
  if (code <= 2) return '🌤️'
  if (code === 3) return '☁️'
  if (code <= 48) return '🌫️'
  if (code <= 55) return '🌦️'
  if (code <= 65) return '🌧️'
  if (code <= 75) return '❄️'
  if (code <= 82) return '🌨️'
  if (code <= 99) return '⛈️'
  return '🌡️'
}

export function getAQILabel(aqi) {
  if (aqi <= 50) {
    return { label: 'Good', color: 'data-emerald', bg: 'bg-aurora-emerald' }
  }

  if (aqi <= 100) {
    return { label: 'Moderate', color: 'data-amber', bg: 'bg-aurora-amber' }
  }

  if (aqi <= 150) {
    return { label: 'Unhealthy Sensitive', color: 'data-amber', bg: 'bg-aurora-amber' }
  }

  if (aqi <= 200) {
    return { label: 'Unhealthy', color: 'data-red', bg: 'bg-aurora-red' }
  }

  if (aqi <= 300) {
    return { label: 'Very Unhealthy', color: 'data-violet', bg: 'bg-aurora-violet' }
  }

  return { label: 'Hazardous', color: 'text-red-700', bg: 'bg-red-700' }
}

export function getUVLabel(uv) {
  if (uv <= 2) {
    return { label: 'Low', color: 'data-emerald', bg: 'bg-aurora-emerald' }
  }

  if (uv <= 5) {
    return { label: 'Moderate', color: 'data-amber', bg: 'bg-aurora-amber' }
  }

  if (uv <= 7) {
    return { label: 'High', color: 'data-amber', bg: 'bg-aurora-amber' }
  }

  if (uv <= 10) {
    return { label: 'Very High', color: 'data-red', bg: 'bg-aurora-red' }
  }

  return { label: 'Extreme', color: 'data-violet', bg: 'bg-aurora-violet' }
}

export function getWindDirection(degrees) {
  const dirs = ['N', 'NE', 'E', 'SE', 'S', 'SW', 'W', 'NW']
  return dirs[Math.round(degrees / 45) % 8]
}

export function getTravelCondition(weatherCode, windSpeed) {
  if (weatherCode >= 95) {
    return { label: 'Dangerous', color: 'data-red', dot: 'bg-aurora-red' }
  }

  if (weatherCode >= 61 || windSpeed > 50) {
    return { label: 'Poor', color: 'data-amber', dot: 'bg-aurora-amber' }
  }

  if (weatherCode >= 51 || windSpeed > 30) {
    return { label: 'Fair', color: 'data-amber', dot: 'bg-aurora-amber' }
  }

  return { label: 'Good', color: 'data-emerald', dot: 'bg-aurora-emerald' }
}

export async function fetchCurrentWeather(lat, lon) {
  const { data } = await axios.get(`${BASE_URL}/forecast`, {
    params: {
      latitude: lat,
      longitude: lon,
      current: [
        'temperature_2m',
        'relative_humidity_2m',
        'apparent_temperature',
        'weather_code',
        'wind_speed_10m',
        'wind_direction_10m',
        'surface_pressure',
        'uv_index',
        'precipitation',
        'visibility',
        'cloud_cover',
      ].join(','),
      timezone: 'auto',
    },
  })

  return data.current
}

export async function fetchHourlyForecast(lat, lon) {
  const { data } = await axios.get(`${BASE_URL}/forecast`, {
    params: {
      latitude: lat,
      longitude: lon,
      hourly: [
        'temperature_2m',
        'weather_code',
        'precipitation_probability',
        'wind_speed_10m',
        'relative_humidity_2m',
        'uv_index',
      ].join(','),
      forecast_days: 2,
      timezone: 'auto',
    },
  })

  const hours = data.hourly
  const now = new Date()
  const startIndex = hours.time.findIndex((time) => new Date(time) >= now)
  const start = Math.max(startIndex, 0)
  const end = start + 24

  return {
    time: hours.time.slice(start, end),
    temperature_2m: hours.temperature_2m.slice(start, end),
    weather_code: hours.weather_code.slice(start, end),
    precipitation_probability: hours.precipitation_probability.slice(start, end),
    wind_speed_10m: hours.wind_speed_10m.slice(start, end),
    relative_humidity_2m: hours.relative_humidity_2m.slice(start, end),
    uv_index: hours.uv_index.slice(start, end),
  }
}

export async function fetchWeeklyForecast(lat, lon) {
  const { data } = await axios.get(`${BASE_URL}/forecast`, {
    params: {
      latitude: lat,
      longitude: lon,
      daily: [
        'temperature_2m_max',
        'temperature_2m_min',
        'weather_code',
        'precipitation_sum',
        'precipitation_probability_max',
        'wind_speed_10m_max',
        'uv_index_max',
        'sunrise',
        'sunset',
      ].join(','),
      forecast_days: 7,
      timezone: 'auto',
    },
  })

  return data.daily
}

export async function fetchAirQuality(lat, lon) {
  const { data } = await axios.get(`${AQI_URL}/air-quality`, {
    params: {
      latitude: lat,
      longitude: lon,
      current: [
        'us_aqi',
        'pm10',
        'pm2_5',
        'carbon_monoxide',
        'nitrogen_dioxide',
        'ozone',
        'dust',
      ].join(','),
      timezone: 'auto',
    },
  })

  return data.current
}

export async function fetchHistoricalWeather(lat, lon) {
  const end = new Date()
  const start = new Date()

  start.setDate(end.getDate() - 30)

  const fmt = (date) => date.toISOString().split('T')[0]

  const { data } = await axios.get(ARCHIVE_URL, {
    params: {
      latitude: lat,
      longitude: lon,
      daily: [
        'temperature_2m_max',
        'temperature_2m_min',
        'precipitation_sum',
        'wind_speed_10m_max',
      ].join(','),
      start_date: fmt(start),
      end_date: fmt(end),
      timezone: 'auto',
    },
  })

  return data.daily
}

export async function fetchClimateNormals(lat, lon) {
  const end = new Date()
  const start = new Date()

  start.setFullYear(end.getFullYear() - 10)

  const fmt = (date) => date.toISOString().split('T')[0]

  const { data } = await axios.get(ARCHIVE_URL, {
    params: {
      latitude: lat,
      longitude: lon,
      daily: [
        'temperature_2m_max',
        'temperature_2m_min',
        'precipitation_sum',
      ].join(','),
      start_date: fmt(start),
      end_date: fmt(end),
      timezone: 'auto',
    },
  })

  return data.daily
}