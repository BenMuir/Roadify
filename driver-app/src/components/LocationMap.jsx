import { useEffect, useRef } from 'react'
import maplibregl from 'maplibre-gl'
import 'maplibre-gl/dist/maplibre-gl.css'

export default function LocationMap({ lat, lng, address }) {
  const mapContainer = useRef(null)
  const mapRef = useRef(null)

  useEffect(() => {
    if (!mapContainer.current || mapRef.current) return

    const map = new maplibregl.Map({
      container: mapContainer.current,
      style: {
        version: 8,
        sources: {
          carto: {
            type: 'raster',
            tiles: ['https://basemaps.cartocdn.com/rastertiles/voyager/{z}/{x}/{y}@2x.png'],
            tileSize: 256,
            attribution: '&copy; CARTO',
          },
        },
        layers: [
          {
            id: 'carto',
            type: 'raster',
            source: 'carto',
          },
        ],
      },
      center: [lng, lat],
      zoom: 15,
      attributionControl: false,
      interactive: false,
    })

    map.on('load', () => {
      const pulseEl = document.createElement('div')
      pulseEl.className = 'live-dot'

      new maplibregl.Marker({ element: pulseEl })
        .setLngLat([lng, lat])
        .addTo(map)
    })

    mapRef.current = map

    return () => {
      map.remove()
      mapRef.current = null
    }
  }, [lat, lng])

  return (
    <div className="relative h-full flex flex-col">
      <div ref={mapContainer} className="w-full flex-1 rounded-t-2xl" />
      <div className="bg-navy/80 backdrop-blur-sm px-4 py-2.5 rounded-b-2xl flex items-center gap-2.5 shrink-0">
        <svg className="w-4 h-4 text-brand-light shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
          <path strokeLinecap="round" strokeLinejoin="round" d="M15 10.5a3 3 0 11-6 0 3 3 0 016 0z" />
          <path strokeLinecap="round" strokeLinejoin="round" d="M19.5 10.5c0 7.142-7.5 11.25-7.5 11.25S4.5 17.642 4.5 10.5a7.5 7.5 0 1115 0z" />
        </svg>
        <div className="min-w-0">
          <p className="text-white text-xs font-medium truncate">{address || 'Location found'}</p>
          <p className="text-white/40 text-[10px]">{lat.toFixed(5)}, {lng.toFixed(5)}</p>
        </div>
      </div>
    </div>
  )
}
