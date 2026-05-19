// src/hooks/useAirQuality.js
import { useQuery } from '@tanstack/react-query'
import { fetchAirQuality } from '../services/weatherApi'

export function useAirQuality(location) {
  return useQuery({
    queryKey: ['air-quality', location.lat, location.lon],
    queryFn:  () => fetchAirQuality(location.lat, location.lon),
    staleTime: 1000 * 60 * 15,
    enabled:   !!location.lat && !!location.lon,
  })
}