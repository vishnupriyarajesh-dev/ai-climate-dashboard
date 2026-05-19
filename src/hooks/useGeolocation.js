// src/hooks/useGeolocation.js
import { useState, useEffect } from 'react'

export function useGeolocation() {
  const [state, setState] = useState({
    loading: false,
    error:   null,
    coords:  null,
  })

  function locate() {
    if (!navigator.geolocation) {
      setState(s => ({ ...s, error: 'Geolocation not supported' }))
      return
    }
    setState(s => ({ ...s, loading: true, error: null }))
    navigator.geolocation.getCurrentPosition(
      (pos) => {
        setState({
          loading: false,
          error:   null,
          coords:  {
            lat: pos.coords.latitude,
            lon: pos.coords.longitude,
          },
        })
      },
      (err) => {
        setState({
          loading: false,
          error:   err.message,
          coords:  null,
        })
      },
      { timeout: 10000, maximumAge: 60000 }
    )
  }

  // Auto-locate on first load
  useEffect(() => { locate() }, [])

  return { ...state, locate }
}