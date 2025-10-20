'use client'

import { ComposableMap, Geographies, Geography, Marker, ZoomableGroup } from 'react-simple-maps'

const geoUrl = "https://cdn.jsdelivr.net/npm/world-atlas@2/countries-110m.json"

interface GeographicData {
  name: string
  value: number
  count: number
  lat: number
  lng: number
}

interface WorldMapProps {
  data: GeographicData[]
}

export default function WorldMap({ data }: WorldMapProps) {
  // Calculate marker size based on count
  const maxCount = Math.max(...data.map(d => d.count), 1)

  return (
    <div className="w-full h-full bg-muted/20 rounded-lg overflow-hidden">
      <ComposableMap
        projection="geoMercator"
        projectionConfig={{
          scale: 140,
          center: [0, 20]
        }}
        className="w-full h-full"
      >
        <ZoomableGroup>
          <Geographies geography={geoUrl}>
            {({ geographies }) =>
              geographies.map((geo) => (
                <Geography
                  key={geo.rsmKey}
                  geography={geo}
                  fill="#E5E7EB"
                  stroke="#9CA3AF"
                  strokeWidth={0.5}
                  style={{
                    default: { outline: 'none' },
                    hover: { 
                      fill: '#D1D5DB',
                      outline: 'none'
                    },
                    pressed: { outline: 'none' },
                  }}
                />
              ))
            }
          </Geographies>

          {/* Plot markers for each region */}
          {data.map((region) => {
            const markerSize = Math.max(5, (region.count / maxCount) * 30)
            return (
              <Marker key={region.name} coordinates={[region.lng, region.lat]}>
                {/* Outer glow */}
                <circle
                  r={markerSize + 3}
                  fill="rgba(239, 68, 68, 0.2)"
                  className="animate-pulse"
                />
                {/* Main marker */}
                <circle
                  r={markerSize}
                  fill="#EF4444"
                  stroke="#FFF"
                  strokeWidth={2}
                  style={{
                    cursor: 'pointer',
                  }}
                />
                {/* Label */}
                <text
                  textAnchor="middle"
                  y={markerSize + 15}
                  style={{
                    fontFamily: 'system-ui',
                    fontSize: '10px',
                    fill: '#374151',
                    fontWeight: 600,
                  }}
                >
                  {region.count > 0 ? region.count.toLocaleString() : ''}
                </text>
                <text
                  textAnchor="middle"
                  y={markerSize + 27}
                  style={{
                    fontFamily: 'system-ui',
                    fontSize: '8px',
                    fill: '#6B7280',
                  }}
                >
                  {region.name}
                </text>
              </Marker>
            )
          })}
        </ZoomableGroup>
      </ComposableMap>

      {/* Legend */}
      <div className="absolute bottom-4 left-4 bg-white dark:bg-gray-800 p-3 rounded-lg shadow-lg">
        <p className="text-xs font-semibold mb-2">Reader Distribution</p>
        <div className="flex items-center gap-2 text-xs text-muted-foreground">
          <div className="flex items-center gap-1">
            <div className="w-2 h-2 rounded-full bg-red-500" />
            <span>Low</span>
          </div>
          <div className="flex items-center gap-1">
            <div className="w-3 h-3 rounded-full bg-red-500" />
            <span>Medium</span>
          </div>
          <div className="flex items-center gap-1">
            <div className="w-4 h-4 rounded-full bg-red-500" />
            <span>High</span>
          </div>
        </div>
      </div>
    </div>
  )
}
