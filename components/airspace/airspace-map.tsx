"use client"

import { useEffect, useRef, useState } from "react"

export interface MapZone {
  id?: string
  name: string
  lat: number
  lon: number
  radius?: number // km
  color: string
  fillColor: string
  description: string
  type: string
  source?: "static" | "dynamic"
}

const SEVERITY_COLOR: Record<string, string> = {
  red: "#ef4444",
  orange: "#f97316",
  yellow: "#eab308",
  green: "#22c55e",
  blue: "#3b82f6",
}

const STATIC_ZONES: MapZone[] = [
  { name: "Kigali Intl Airport (HRYR)", lat: -1.9686, lon: 30.1395, radius: 5, color: "#ef4444", fillColor: "#ef4444", description: "5km full ban. CAA authorization required.", type: "airport", source: "static" },
  { name: "Kigali Airport 10km advisory", lat: -1.9686, lon: 30.1395, radius: 10, color: "#f97316", fillColor: "#f97316", description: "10km advisory zone. Prior notification required.", type: "advisory", source: "static" },
  { name: "Kamembe Airport (HRZA)", lat: -2.4620, lon: 28.9077, radius: 3, color: "#ef4444", fillColor: "#ef4444", description: "3km full ban.", type: "airport", source: "static" },
  { name: "Kamembe Advisory", lat: -2.4620, lon: 28.9077, radius: 5, color: "#f97316", fillColor: "#f97316", description: "5km advisory zone.", type: "advisory", source: "static" },
  { name: "Huye Airport", lat: -2.6008, lon: 29.7279, radius: 3, color: "#ef4444", fillColor: "#ef4444", description: "3km full ban.", type: "airport", source: "static" },
  { name: "Volcanoes National Park", lat: -1.4680, lon: 29.5080, radius: 18, color: "#f97316", fillColor: "#f97316", description: "No-fly. Wildlife protection zone.", type: "protected", source: "static" },
  { name: "Nyungwe Forest NP", lat: -2.5200, lon: 29.1800, radius: 25, color: "#f97316", fillColor: "#f97316", description: "No-fly. Wildlife protection zone.", type: "protected", source: "static" },
  { name: "Akagera National Park", lat: -1.8900, lon: 30.6200, radius: 22, color: "#eab308", fillColor: "#eab308", description: "No-fly without RDB permit.", type: "protected", source: "static" },
  { name: "Musanze Drone Corridor", lat: -1.4985, lon: 29.6346, radius: 8, color: "#22c55e", fillColor: "#22c55e", description: "Approved drone testing corridor. Cat B & C permitted.", type: "permitted", source: "static" },
  { name: "Bugesera Industrial Zone", lat: -2.2137, lon: 30.2554, radius: 5, color: "#22c55e", fillColor: "#22c55e", description: "Drone operations permitted with prior notification.", type: "permitted", source: "static" },
  { name: "Kigali CBD", lat: -1.9441, lon: 30.0619, radius: 2, color: "#eab308", fillColor: "#eab308", description: "Cat A only, below 120m AMSL.", type: "restricted", source: "static" },
  { name: "Presidential Palace area", lat: -1.9528, lon: 30.0616, radius: 1.5, color: "#ef4444", fillColor: "#ef4444", description: "Full restriction – no exceptions.", type: "restricted", source: "static" },
]

interface DynamicZone {
  id: string
  name: string
  description: string
  type: string
  lat: number
  lon: number
  radius: number
  severity: string
  startDate?: string | null
  endDate?: string | null
  createdBy: { fullName: string; username: string }
}

function formatDate(d?: string | null) {
  if (!d) return null
  return new Date(d).toLocaleDateString()
}

export default function AirspaceMap() {
  const mapRef = useRef<HTMLDivElement>(null)
  const mapInstanceRef = useRef<any>(null)
  const [dynamicZones, setDynamicZones] = useState<DynamicZone[]>([])

  // Fetch dynamic zones from DB
  useEffect(() => {
    fetch('/api/airspace/zones')
      .then(r => r.json())
      .then(data => {
        if (Array.isArray(data)) setDynamicZones(data)
      })
      .catch(() => {})
  }, [])

  useEffect(() => {
    if (!mapRef.current || mapInstanceRef.current) return

    import("leaflet").then(L => {
      delete (L.Icon.Default.prototype as any)._getIconUrl
      L.Icon.Default.mergeOptions({
        iconRetinaUrl: "https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.9.4/images/marker-icon-2x.png",
        iconUrl: "https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.9.4/images/marker-icon.png",
        shadowUrl: "https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.9.4/images/marker-shadow.png",
      })

      const map = L.map(mapRef.current!, {
        center: [-1.9403, 29.8739],
        zoom: 8,
        zoomControl: true,
      })
      mapInstanceRef.current = map

      L.tileLayer("https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png", {
        attribution: '© <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a>',
        maxZoom: 18,
      }).addTo(map)

      // Draw static zones
      for (const zone of STATIC_ZONES) {
        if (!zone.radius) continue
        const opacity = zone.type === "advisory" ? 0.08 : 0.18
        const weight = zone.type === "advisory" ? 1 : 2
        const dashArray = zone.type === "advisory" ? "6 4" : undefined
        L.circle([zone.lat, zone.lon], {
          radius: zone.radius * 1000,
          color: zone.color,
          fillColor: zone.fillColor,
          fillOpacity: opacity,
          weight,
          dashArray,
        })
          .bindPopup(
            `<div style="min-width:180px">
              <strong style="font-size:13px">${zone.name}</strong>
              <span style="margin-left:6px;padding:1px 6px;background:#e5e7eb;border-radius:3px;font-size:10px;vertical-align:middle">Static</span>
              <p style="margin:4px 0 0;font-size:12px;color:#666">${zone.description}</p>
            </div>`
          )
          .addTo(map)
      }

      // Draw dynamic zones fetched from DB
      for (const zone of dynamicZones) {
        const color = SEVERITY_COLOR[zone.severity] || "#6b7280"
        const isTemp = !!zone.endDate
        const dateNote = isTemp
          ? `<p style="margin:4px 0 0;font-size:11px;color:#888">
              ${formatDate(zone.startDate) ? `From: ${formatDate(zone.startDate)} ` : ''}
              ${formatDate(zone.endDate) ? `Until: ${formatDate(zone.endDate)}` : ''}
            </p>`
          : ''
        L.circle([zone.lat, zone.lon], {
          radius: zone.radius * 1000,
          color,
          fillColor: color,
          fillOpacity: isTemp ? 0.12 : 0.20,
          weight: isTemp ? 2 : 3,
          dashArray: isTemp ? "8 4" : undefined,
        })
          .bindPopup(
            `<div style="min-width:200px">
              <strong style="font-size:13px">${zone.name}</strong>
              <span style="margin-left:6px;padding:1px 6px;background:#dbeafe;color:#1e40af;border-radius:3px;font-size:10px;vertical-align:middle">${isTemp ? 'Temporary' : zone.type}</span>
              <p style="margin:4px 0 0;font-size:12px;color:#666">${zone.description}</p>
              ${dateNote}
              <p style="margin:4px 0 0;font-size:11px;color:#888">Added by: ${zone.createdBy?.fullName || 'Authority'}</p>
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
  }, [dynamicZones])

  return (
    <div className="relative rounded-lg overflow-hidden border">
      <link rel="stylesheet" href="https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.9.4/leaflet.min.css" />
      <div ref={mapRef} style={{ height: "480px", width: "100%" }} />
      {/* Legend */}
      <div className="absolute bottom-4 right-4 bg-background/90 backdrop-blur-sm rounded-lg border p-3 text-xs space-y-1.5 z-[1000]">
        <p className="font-semibold text-sm mb-2">Legend</p>
        {[
          { color: "#ef4444", label: "Full ban / Airport" },
          { color: "#f97316", label: "Advisory / Protected" },
          { color: "#eab308", label: "Restricted (permit)" },
          { color: "#22c55e", label: "Permitted zone" },
          { color: "#3b82f6", label: "Custom zone (authority)" },
        ].map(l => (
          <div key={l.label} className="flex items-center gap-2">
            <div className="w-3 h-3 rounded-full border-2" style={{ borderColor: l.color, backgroundColor: l.color + "44" }} />
            <span>{l.label}</span>
          </div>
        ))}
        {dynamicZones.length > 0 && (
          <p className="pt-1 text-muted-foreground border-t mt-1">+{dynamicZones.length} authority zone{dynamicZones.length !== 1 ? 's' : ''}</p>
        )}
      </div>
    </div>
  )
}
