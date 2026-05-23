// src/components/layout/TopBar.jsx
import { useState } from 'react'
import { useQueryClient } from '@tanstack/react-query'
import { Bell, LocateFixed, MapPin, RefreshCw, Search } from 'lucide-react'

const SAMPLE_LOCATIONS = [
  { name: 'Mumbai', lat: 19.076, lon: 72.877 },
  { name: 'Delhi', lat: 28.613, lon: 77.209 },
  { name: 'Bengaluru', lat: 12.971, lon: 77.594 },
  { name: 'Chennai', lat: 13.083, lon: 80.271 },
  { name: 'Kolkata', lat: 22.572, lon: 88.364 },
  { name: 'Hyderabad', lat: 17.385, lon: 78.486 },
  { name: 'Pune', lat: 18.52, lon: 73.856 },
  { name: 'Ahmedabad', lat: 23.022, lon: 72.571 },
  { name: 'Jaipur', lat: 26.912, lon: 75.787 },
  { name: 'London', lat: 51.505, lon: -0.118 },
  { name: 'New York', lat: 40.712, lon: -74.006 },
  { name: 'Tokyo', lat: 35.689, lon: 139.692 },
  { name: 'Dubai', lat: 25.204, lon: 55.27 },
  { name: 'Paris', lat: 48.856, lon: 2.352 },
  { name: 'Sydney', lat: -33.868, lon: 151.209 },
]

function formatPlaceName(place) {
  if (place.name && place.country) {
    return `${place.name}, ${place.country}`
  }

  return place.name || place.display_name || 'Selected Location'
}

function normalizeOpenMeteoResult(place) {
  return {
    name: formatPlaceName(place),
    lat: place.latitude,
    lon: place.longitude,
  }
}

function normalizeNominatimResult(place) {
  const address = place.address || {}

  const name =
    address.city ||
    address.town ||
    address.village ||
    address.municipality ||
    address.county ||
    place.name ||
    place.display_name?.split(',')[0] ||
    'Selected Location'

  const region = address.state || address.country

  return {
    name: region ? `${name}, ${region}` : name,
    lat: Number(place.lat),
    lon: Number(place.lon),
  }
}

export default function TopBar({ location, setLocation, unit, setUnit }) {
  const queryClient = useQueryClient()

  const [query, setQuery] = useState('')
  const [results, setResults] = useState([])
  const [searching, setSearching] = useState(false)
  const [message, setMessage] = useState('')
  const [refreshing, setRefreshing] = useState(false)
  const [geoLoading, setGeoLoading] = useState(false)

  function handleSearchInput(event) {
    const value = event.target.value
    setQuery(value)
    setMessage('')

    if (value.trim().length < 2) {
      setResults([])
      return
    }

    const filtered = SAMPLE_LOCATIONS.filter((item) =>
      item.name.toLowerCase().includes(value.toLowerCase())
    )

    setResults(filtered)
  }

  function selectLocation(nextLocation) {
    setLocation(nextLocation)
    setQuery('')
    setResults([])
    setMessage('')
  }

  async function searchCity(cityName) {
    const searchTerm = cityName.trim()
    if (!searchTerm) return

    setSearching(true)
    setMessage('')

    try {
      const openMeteoResponse = await fetch(
        `https://geocoding-api.open-meteo.com/v1/search?name=${encodeURIComponent(
          searchTerm
        )}&count=5&language=en&format=json`
      )

      const openMeteoData = await openMeteoResponse.json()
      const openMeteoResults = openMeteoData.results?.map(normalizeOpenMeteoResult) || []

      if (openMeteoResults.length > 0) {
        setResults(openMeteoResults)
        return
      }

      const nominatimResponse = await fetch(
        `https://nominatim.openstreetmap.org/search?q=${encodeURIComponent(
          searchTerm
        )}&format=json&addressdetails=1&limit=5`
      )

      const nominatimData = await nominatimResponse.json()
      const nominatimResults = nominatimData.map(normalizeNominatimResult)

      if (nominatimResults.length > 0) {
        setResults(nominatimResults)
        return
      }

      setMessage('No location found')
      setResults([])
    } catch {
      setMessage('Search failed')
    } finally {
      setSearching(false)
    }
  }

  function handleKeyDown(event) {
    if (event.key === 'Enter') {
      event.preventDefault()
      searchCity(query)
    }
  }

  function handleRefresh() {
    setRefreshing(true)
    queryClient.invalidateQueries()
    window.setTimeout(() => setRefreshing(false), 900)
  }

  function handleGeolocate() {
    if (!navigator.geolocation || geoLoading) return

    setGeoLoading(true)

    navigator.geolocation.getCurrentPosition(
      async (position) => {
        const { latitude: lat, longitude: lon } = position.coords

        try {
          const response = await fetch(
            `https://nominatim.openstreetmap.org/reverse?lat=${lat}&lon=${lon}&format=json&addressdetails=1`
          )

          const data = await response.json()
          const locationName =
            data.address?.city ||
            data.address?.town ||
            data.address?.village ||
            data.address?.municipality ||
            data.address?.state ||
            'My Location'

          setLocation({ name: locationName, lat, lon })
        } catch {
          setLocation({ name: 'My Location', lat, lon })
        } finally {
          setGeoLoading(false)
        }
      },
      () => {
        setMessage('Location blocked')
        setGeoLoading(false)
      }
    )
  }

  return (
    <header className="sticky top-0 z-20 bg-white/80 backdrop-blur-xl border-b border-slate-200/60 px-3 py-3 md:px-6">
      <div className="flex items-center gap-2 md:gap-4">
        <div className="relative flex-1 min-w-0">
          <div className="flex items-center gap-2 px-3 py-2 rounded-xl border bg-slate-50 border-slate-200 focus-within:bg-white focus-within:border-aurora-teal/40 transition-all">
            <Search size={14} className="text-slate-500 flex-shrink-0" />
            <input
              type="text"
              placeholder="Search any city..."
              value={query}
              onChange={handleSearchInput}
              onKeyDown={handleKeyDown}
              className="min-w-0 w-full bg-transparent text-sm text-slate-900 placeholder-slate-500 outline-none"
            />
          </div>

          {(results.length > 0 || message || searching || query.trim().length >= 2) && (
            <div className="absolute top-full mt-2 left-0 right-0 card overflow-hidden shadow-lg z-50">
              {searching && (
                <div className="px-3 py-2.5 text-sm text-slate-500">Searching...</div>
              )}

              {!searching &&
                results.map((item) => (
                  <button
                    key={`${item.name}-${item.lat}-${item.lon}`}
                    type="button"
                    onMouseDown={() => selectLocation(item)}
                    className="w-full flex items-center gap-2 px-3 py-2.5 hover:bg-slate-50 transition-colors text-left"
                  >
                    <MapPin size={13} className="data-teal flex-shrink-0" />
                    <span className="text-sm text-slate-900 truncate">{item.name}</span>
                  </button>
                ))}

              {!searching && results.length === 0 && query.trim().length >= 2 && !message && (
                <button
                  type="button"
                  onMouseDown={() => searchCity(query)}
                  className="w-full flex items-center gap-2 px-3 py-2.5 hover:bg-slate-50 transition-colors text-left"
                >
                  <Search size={13} className="data-teal flex-shrink-0" />
                  <span className="text-sm text-slate-900 truncate">
                    Search “{query}”
                  </span>
                </button>
              )}

              {!searching && message && (
                <div className="px-3 py-2.5 text-sm text-slate-500">{message}</div>
              )}
            </div>
          )}
        </div>

        <button
          type="button"
          onClick={handleGeolocate}
          className="min-w-0 flex items-center gap-2 px-3 py-2 rounded-xl bg-slate-50 border border-slate-200 hover:border-aurora-teal/40 transition-all"
        >
          <LocateFixed
            size={14}
            className={`text-slate-500 flex-shrink-0 ${geoLoading ? 'animate-pulse' : ''}`}
          />
          <span className="hidden sm:inline text-sm text-slate-700 truncate max-w-[92px] md:max-w-[150px]">
            {location.name}
          </span>
        </button>

        <div className="flex items-center gap-1 bg-slate-100 border border-slate-200 rounded-xl p-1 flex-shrink-0">
          {['C', 'F'].map((item) => (
            <button
              key={item}
              type="button"
              onClick={() => setUnit(item)}
              className={`px-2.5 md:px-3 py-1.5 rounded-lg text-sm font-medium transition-all ${
                unit === item
                  ? 'bg-white shadow-sm text-aurora-teal border border-teal-200'
                  : 'text-slate-600'
              }`}
            >
              °{item}
            </button>
          ))}
        </div>

        <button
          type="button"
          onClick={handleRefresh}
          className="hidden sm:flex p-2 rounded-xl bg-slate-50 border border-slate-200 hover:border-aurora-violet/40 transition-all"
        >
          <RefreshCw
            size={15}
            className={refreshing ? 'animate-spin data-violet' : 'text-slate-600'}
          />
        </button>

        <button
          type="button"
          className="hidden sm:flex relative p-2 rounded-xl bg-slate-50 border border-slate-200 hover:border-aurora-amber/40 transition-all"
        >
          <Bell size={15} className="text-slate-600" />
          <span className="absolute top-1.5 right-1.5 w-1.5 h-1.5 rounded-full bg-aurora-amber" />
        </button>
      </div>
    </header>
  )
}