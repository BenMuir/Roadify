import { useState, useEffect } from 'react'

export default function useGeolocation() {
  const [location, setLocation] = useState({
    lat: null,
    lng: null,
    address: null,
    status: 'loading',
  })

  useEffect(() => {
    if (!navigator.geolocation) {
      setLocation((prev) => ({ ...prev, status: 'unsupported' }))
      return
    }

    navigator.geolocation.getCurrentPosition(
      async (position) => {
        const { latitude, longitude } = position.coords
        let address = null

        try {
          const res = await fetch(
            `https://nominatim.openstreetmap.org/reverse?lat=${latitude}&lon=${longitude}&format=json&addressdetails=1`,
            { headers: { 'Accept-Language': 'en' } }
          )
          const data = await res.json()
          const a = data.address || {}
          const parts = [
            a.road,
            a.suburb || a.neighbourhood,
            a.city || a.town || a.village,
            a.state,
          ].filter(Boolean)
          address = parts.join(', ')
        } catch {
          // Reverse geocode failed, just use coordinates
        }

        setLocation({ lat: latitude, lng: longitude, address, status: 'success' })
      },
      () => {
        setLocation((prev) => ({ ...prev, status: 'denied' }))
      },
      { enableHighAccuracy: true, timeout: 10000 }
    )
  }, [])

  return location
}
