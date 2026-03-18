"use client"

import { useEffect, useRef } from "react"

export interface MapZone {
  name: string
  lat: number
  lon: number
  radius?: number // km
  color: string
  fillColor: string
  description: string
  type: string
}

const ZONES: MapZone[] = [
  // Airports — full ban radius
  { name: "Kigali Intl Airport (HRYR)", lat: -1.9686, lon: 30.1395, radius: 5, color: "#ef4444", fillColor: "#ef4444", description: "5km full ban. CAA authorization required.", type: "airport" },
  { name: "Kigali Airport 10km advisory", lat: -1.9686, lon: 30.1395, radius: 10, color: "#f97316", fillColor: "#f97316", description: "10km advisory zone. Prior notification required.", type: "advisory" },
  { name: "Kamembe Airport (HRZA)", lat: -2.4620, lon: 28.9077, radius: 3, color: "#ef4444", fillColor: "#ef4444", description: "3km full ban.", type: "airport" },
  { name: "Kamembe Advisory", lat: -2.4620, lon: 28.9077, radius: 5, color: "#f97316", fillColor: "#f97316", description: "5km advisory zone.", type: "advisory" },
  { name: "Huye Airport", lat: -2.6008, lon: 29.7279, radius: 3, color: "#ef4444", fillColor: "#ef4444", description: "3km full ban.", type: "airport" },
  // Protected areas (approximate centres)
  { name: "Volcanoes National Park", lat: -1.4680, lon: 29.5080, radius: 18, color: "#f97316", fillColor: "#f97316", description: "No-fly. Wildlife protection zone.", type: "protected" },
  { name: "Nyungwe Forest NP", lat: -2.5200, lon: 29.1800, radius: 25, color: "#f97316", fillColor: "#f97316", description: "No-fly. Wildlife protection zone.", type: "protected" },
  { name: "Akagera National Park", lat: -1.8900, lon: 30.6200, radius: 22, color: "#eab308", fillColor: "#eab308", description: "No-fly without RDB permit.", type: "protected" },
  // Permitted zones
  { name: "Musanze Drone Corridor", lat: -1.4985, lon: 29.6346, radius: 8, color: "#22c55e", fillColor: "#22c55e", description: "Approved drone testing corridor. Cat B & C permitted.", type: "permitted" },
  { name: "Bugesera Industrial Zone", lat: -2.2137, lon: 30.2554, radius: 5, color: "#22c55e", fillColor: "#22c55e", description: "Drone operations permitted with prior notification.", type: "permitted" },
  // Security zones
  { name: "Kigali CBD", lat: -1.9441, lon: 30.0619, radius: 2, color: "#eab308", fillColor: "#eab308", description: "Cat A only, below 120m AMSL.", type: "restricted" },
  { name: "Presidential Palace area", lat: -1.9528, lon: 30.0616, radius: 1.5, color: "#ef4444", fillColor: "#ef4444", description: "Full restriction – no exceptions.", type: "restricted" },
]

export default function AirspaceMap() {
  const mapRef = useRef<HTMLDivElement>(null)
  const mapInstanceRef = useRef<any>(null)

  useEffect(() => {
    if (!mapRef.current || mapInstanceRef.current) return

    // Dynamic import to avoid SSR issues
    import("leaflet").then(L => {
      // Fix default icon paths
      delete (L.Icon.Default.prototype as any)._getIconUrl
      L.Icon.Default.mergeOptions({
        iconRetinaUrl: "https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.9.4/images/marker-icon-2x.png",
        iconUrl: "https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.9.4/images/marker-icon.png",
        shadowUrl: "https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.9.4/images/marker-shadow.png",
      })

      const map = L.map(mapRef.current!, {
        center: [-1.9403, 29.8739], // Rwanda centre
        zoom: 8,
        zoomControl: true,
      })

      mapInstanceRef.current = map

      // OpenStreetMap tiles
      L.tileLayer("https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png", {
        attribution: '© <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a>',
        maxZoom: 18,
      }).addTo(map)

      // Draw zones
      for (const zone of ZONES) {
        if (!zone.radius) continue

        const opacity = zone.type === "advisory" ? 0.08 : 0.18
        const weight = zone.type === "advisory" ? 1 : 2
        const dashArray = zone.type === "advisory" ? "6 4" : undefined

        L.circle([zone.lat, zone.lon], {
          radius: zone.radius * 1000, // km to m
          color: zone.color,
          fillColor: zone.fillColor,
          fillOpacity: opacity,
          weight,
          dashArray,
        })
          .bindPopup(
            `<div style="min-width:180px">
              <strong style="font-size:13px">${zone.name}</strong>
              <p style="margin:4px 0 0;font-size:12px;color:#666">${zone.description}</p>
            </div>`
          )
          .addTo(map)
      }
    })

    return () => {
      if (mapInstanceRef.current) {
        mapInstanceRef.current.remove()
        mapInstanceRef.current = null
      }
    }
  }, [])

  return (
    <div className="relative rounded-lg overflow-hidden border">
      <link
        rel="stylesheet"
        href="https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.9.4/leaflet.min.css"
      />
      <div ref={mapRef} style={{ height: "480px", width: "100%" }} />
      {/* Legend */}
      <div className="absolute bottom-4 right-4 bg-background/90 backdrop-blur-sm rounded-lg border p-3 text-xs space-y-1.5 z-[1000]">
        <p className="font-semibold text-sm mb-2">Legend</p>
        {[
          { color: "#ef4444", label: "Full ban / Airport" },
          { color: "#f97316", label: "Advisory / Protected" },
          { color: "#eab308", label: "Restricted (permit)" },
          { color: "#22c55e", label: "Permitted zone" },
        ].map(l => (
          <div key={l.label} className="flex items-center gap-2">
            <div className="w-3 h-3 rounded-full border-2" style={{ borderColor: l.color, backgroundColor: l.color + "44" }} />
            <span>{l.label}</span>
          </div>
        ))}
      </div>
    </div>
  )
}
