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

export const STATIC_ZONES: MapZone[] = [
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
  { name: "Kigali Intl Airport Bugesera (HRKI)", lat: -2.1597, lon: 30.1198, radius: 5, color: "#ef4444", fillColor: "#ef4444", description: "5km full ban. New Kigali International Airport — Bugesera. CAA authorization required.", type: "airport", source: "static" },
  { name: "Bugesera Airport 10km advisory", lat: -2.1597, lon: 30.1198, radius: 10, color: "#f97316", fillColor: "#f97316", description: "10km advisory zone around new Kigali International Airport Bugesera. Prior notification required.", type: "advisory", source: "static" },
]

// Rwanda airport runways — approximate from aeronautical charts
// Endpoints computed from center + heading + length
const RUNWAYS = [
  {
    icao: "HRYR",
    name: "Kigali International",
    designation: "10/28",
    // heading ~096°/276°, ~3700m, width 45m
    // center: -1.9686, 30.1395
    endpoints: [[-1.9703, 30.1560], [-1.9669, 30.1230]] as [number, number][],
    widthM: 45,
    elev: "1489m / 4885ft",
  },
  {
    icao: "HRZA",
    name: "Kamembe",
    designation: "05/23",
    // heading ~046°/226°, ~1800m, width 30m
    // center: -2.4620, 28.9077
    endpoints: [[-2.4564, 28.9135], [-2.4676, 28.9019]] as [number, number][],
    widthM: 30,
    elev: "1590m / 5217ft",
  },
  {
    icao: "HRHU",
    name: "Huye",
    designation: "10/28",
    // heading ~097°/277°, ~800m, width 18m
    // center: -2.6008, 29.7279
    endpoints: [[-2.6012, 29.7315], [-2.6004, 29.7243]] as [number, number][],
    widthM: 18,
    elev: "1768m / 5800ft",
  },
  {
    icao: "HRKI",
    name: "Kigali Intl Airport Bugesera",
    designation: "09/27",
    // heading ~090°/270°, ~3800m, width 60m
    // center: -2.1597, 30.1198
    endpoints: [[-2.1597, 30.1027], [-2.1597, 30.1369]] as [number, number][],
    widthM: 60,
    elev: "1374m / 4508ft",
  },
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

// Rwanda actual extent + ~20 km buffer (≈ 0.18°)
// Country: S -2.84, N -1.05, W 28.84, E 30.90
const RWANDA_BOUNDS: [[number, number], [number, number]] = [[-3.02, 28.66], [-0.87, 31.08]]
const RWANDA_CENTER: [number, number] = [-1.9403, 29.8739]

export default function AirspaceMap() {
  const mapRef         = useRef<HTMLDivElement>(null)
  const mapInstanceRef = useRef<any>(null)
  const dynLayerRef    = useRef<any>(null)   // LayerGroup for dynamic zones
  const [dynamicZones, setDynamicZones] = useState<DynamicZone[]>([])

  useEffect(() => {
    fetch('/api/airspace/zones')
      .then(r => r.json())
      .then(data => { if (Array.isArray(data)) setDynamicZones(data) })
      .catch(() => {})
  }, [])

  // ── Map initialisation — runs once ────────────────────────────────
  useEffect(() => {
    if (!mapRef.current || mapInstanceRef.current) return

    import("leaflet").then(L => {
      // Guard against React strict-mode double-invoke
      if (mapInstanceRef.current) return

      delete (L.Icon.Default.prototype as any)._getIconUrl
      L.Icon.Default.mergeOptions({
        iconRetinaUrl: "https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.9.4/images/marker-icon-2x.png",
        iconUrl: "https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.9.4/images/marker-icon.png",
        shadowUrl: "https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.9.4/images/marker-shadow.png",
      })

      const map = L.map(mapRef.current!, {
        center: RWANDA_CENTER,
        zoom: 8,
        maxZoom: 17,
        maxBounds: RWANDA_BOUNDS,
        maxBoundsViscosity: 1.0,
        zoomControl: true,
      })
      mapInstanceRef.current = map

      // Fit to Rwanda bounds then lock minZoom so user can never zoom out beyond Rwanda + 20km
      map.fitBounds(RWANDA_BOUNDS, { padding: [0, 0], animate: false })
      map.setMinZoom(map.getZoom())
      dynLayerRef.current = L.layerGroup().addTo(map)

      L.tileLayer("https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png", {
        attribution: '© <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a>',
        maxZoom: 19,
      }).addTo(map)

      // ── Static airspace zones ─────────────────────────────────
      for (const zone of STATIC_ZONES) {
        if (!zone.radius) continue
        const opacity = zone.type === "advisory" ? 0.08 : 0.18
        const weight  = zone.type === "advisory" ? 1 : 2
        const dashArray = zone.type === "advisory" ? "6 4" : undefined
        L.circle([zone.lat, zone.lon], {
          radius: zone.radius * 1000,
          color: zone.color, fillColor: zone.fillColor, fillOpacity: opacity, weight, dashArray,
        })
          .bindPopup(
            `<div style="min-width:180px">
              <strong style="font-size:13px">${zone.name}</strong>
              <p style="margin:4px 0 0;font-size:12px;color:#666">${zone.description}</p>
            </div>`
          )
          .addTo(map)
      }

      // ── Runway visualization (visible at zoom ≥ 12) ──────────
      const runwayLayers: any[] = []

      for (const rwy of RUNWAYS) {
        // Runway centerline
        const centerline = L.polyline(rwy.endpoints, {
          color: "#94a3b8",
          weight: 5,
          opacity: 0,
          lineCap: "square",
        })
          .bindPopup(
            `<div style="min-width:160px">
              <strong style="font-size:13px">✈ ${rwy.icao} — ${rwy.name}</strong>
              <p style="margin:4px 0 0;font-size:12px;color:#555">Runway ${rwy.designation}</p>
              <p style="margin:2px 0 0;font-size:11px;color:#888">Width: ${rwy.widthM}m · Elev: ${rwy.elev}</p>
            </div>`
          )
          .addTo(map)

        // Runway threshold tick marks
        const tickA = L.polyline([rwy.endpoints[0]], {
          color: "#64748b", weight: 2, opacity: 0,
        }).addTo(map)

        const tickB = L.polyline([rwy.endpoints[1]], {
          color: "#64748b", weight: 2, opacity: 0,
        }).addTo(map)

        // Threshold markers (small circles)
        const markerA = L.circleMarker(rwy.endpoints[0] as L.LatLngExpression, {
          radius: 5, color: "#64748b", fillColor: "#ffffff", fillOpacity: 0.8, weight: 2, opacity: 0,
        })
          .bindTooltip(`RWY ${rwy.designation.split("/")[1]}`, { permanent: false, direction: "top" })
          .addTo(map)

        const markerB = L.circleMarker(rwy.endpoints[1] as L.LatLngExpression, {
          radius: 5, color: "#64748b", fillColor: "#ffffff", fillOpacity: 0.8, weight: 2, opacity: 0,
        })
          .bindTooltip(`RWY ${rwy.designation.split("/")[0]}`, { permanent: false, direction: "top" })
          .addTo(map)

        runwayLayers.push(centerline, markerA, markerB)
      }

      // Airport center markers (always visible)
      const airportIcon = L.divIcon({
        className: "",
        html: `<div style="
          background:#1e40af;color:white;border-radius:50%;
          width:20px;height:20px;display:flex;align-items:center;
          justify-content:center;font-size:11px;border:2px solid white;
          box-shadow:0 1px 3px rgba(0,0,0,0.4)">✈</div>`,
        iconSize: [20, 20],
        iconAnchor: [10, 10],
      })

      for (const rwy of RUNWAYS) {
        const center: L.LatLngExpression = [
          (rwy.endpoints[0][0] + rwy.endpoints[1][0]) / 2,
          (rwy.endpoints[0][1] + rwy.endpoints[1][1]) / 2,
        ]
        L.marker(center, { icon: airportIcon })
          .bindPopup(
            `<div style="min-width:160px">
              <strong style="font-size:13px">✈ ${rwy.icao} — ${rwy.name}</strong>
              <p style="margin:4px 0 0;font-size:12px;color:#555">RWY ${rwy.designation} · ${rwy.widthM}m wide</p>
              <p style="margin:2px 0 0;font-size:11px;color:#888">Elev: ${rwy.elev}</p>
              <p style="margin:4px 0 0;font-size:11px;color:#1e40af">Zoom in (≥12) to see runway</p>
            </div>`
          )
          .addTo(map)
      }

      // Show/hide runway layers based on zoom
      function updateRunwayVisibility() {
        const zoom = map.getZoom()
        const visible = zoom >= 12
        for (const layer of runwayLayers) {
          if (layer.setStyle) {
            layer.setStyle({ opacity: visible ? 1 : 0, fillOpacity: visible ? 0.8 : 0 })
          }
        }
      }

      map.on("zoomend", updateRunwayVisibility)
      updateRunwayVisibility()
    })

    return () => {
      if (mapInstanceRef.current) {
        mapInstanceRef.current.remove()
        mapInstanceRef.current = null
        dynLayerRef.current = null
      }
    }
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [])

  // ── Dynamic zones — update layer when data arrives ─────────────
  useEffect(() => {
    if (!dynLayerRef.current || dynamicZones.length === 0) return
    import("leaflet").then(L => {
      dynLayerRef.current.clearLayers()
      for (const zone of dynamicZones) {
        const color   = SEVERITY_COLOR[zone.severity] || "#6b7280"
        const isTemp  = !!zone.endDate
        const dateNote = isTemp
          ? `<p style="margin:4px 0 0;font-size:11px;color:#888">
              ${formatDate(zone.startDate) ? `From: ${formatDate(zone.startDate)} ` : ''}
              ${formatDate(zone.endDate) ? `Until: ${formatDate(zone.endDate)}` : ''}
            </p>`
          : ''
        L.circle([zone.lat, zone.lon], {
          radius: zone.radius * 1000,
          color, fillColor: color,
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
          .addTo(dynLayerRef.current)
      }
    })
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
        <div className="flex items-center gap-2 pt-1 border-t mt-1">
          <div className="w-3 h-0.5 bg-slate-400 rounded" />
          <span>Runway (zoom ≥ 12)</span>
        </div>
        <p className="text-muted-foreground text-[10px] border-t mt-1 pt-1">
          {dynamicZones.length > 0
            ? `${dynamicZones.length} zone${dynamicZones.length !== 1 ? 's' : ''} from database`
            : 'Using built-in zones'}
        </p>
      </div>
    </div>
  )
}
