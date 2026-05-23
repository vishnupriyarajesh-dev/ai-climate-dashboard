// src/hooks/useWeather.js
import { useQuery } from '@tanstack/react-query'
import {
  fetchCurrentWeather,
  fetchHourlyForecast,
  fetchWeeklyForecast,
  fetchHistoricalWeather,
  fetchClimateNormals,
} from '../services/weatherApi'

export function useCurrentWeather(location) {
  return useQuery({
    queryKey: ['current-weather', location.lat, location.lon],
    queryFn:  () => fetchCurrentWeather(location.lat, location.lon),
    staleTime: 1000 * 60 * 10,
    enabled:   !!location.lat && !!location.lon,
  })
}

export function useHourlyForecast(location) {
  return useQuery({
    queryKey: ['hourly-forecast', location.lat, location.lon],
    queryFn:  () => fetchHourlyForecast(location.lat, location.lon),
    staleTime: 1000 * 60 * 10,
    enabled:   !!location.lat && !!location.lon,
  })
}

export function useWeeklyForecast(location) {
  return useQuery({
    queryKey: ['weekly-forecast', location.lat, location.lon],
    queryFn:  () => fetchWeeklyForecast(location.lat, location.lon),
    staleTime: 1000 * 60 * 30,
    enabled:   !!location.lat && !!location.lon,
  })
}

export function useHistoricalWeather(location) {
  return useQuery({
    queryKey: ['historical-weather', location.lat, location.lon],
    queryFn:  () => fetchHistoricalWeather(location.lat, location.lon),
    staleTime: 1000 * 60 * 60,
    enabled:   !!location.lat && !!location.lon,
  })
}

export function useClimateNormals(location) {
  return useQuery({
    queryKey: ['climate-normals', location.lat, location.lon],
    queryFn:  () => fetchClimateNormals(location.lat, location.lon),
    staleTime: 1000 * 60 * 60 * 24,
    enabled:   !!location.lat && !!location.lon,
  })
}
