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
  { name: "Kamembe Airport (HRZA)", lat: -2.462252, lon: 28.907982, radius: 3, color: "#ef4444", fillColor: "#ef4444", description: "3km full ban.", type: "airport", source: "static" },
  { name: "Kamembe Advisory", lat: -2.462252, lon: 28.907982, radius: 5, color: "#f97316", fillColor: "#f97316", description: "5km advisory zone.", type: "advisory", source: "static" },
  { name: "Huye Airport", lat: -2.595325, lon: 29.735554, radius: 3, color: "#ef4444", fillColor: "#ef4444", description: "3km full ban.", type: "airport", source: "static" },
  { name: "Volcanoes National Park", lat: -1.4680, lon: 29.5080, radius: 18, color: "#f97316", fillColor: "#f97316", description: "No-fly. Wildlife protection zone.", type: "protected", source: "static" },
  { name: "Nyungwe Forest NP", lat: -2.5200, lon: 29.1800, radius: 25, color: "#f97316", fillColor: "#f97316", description: "No-fly. Wildlife protection zone.", type: "protected", source: "static" },
  { name: "Akagera National Park", lat: -1.8900, lon: 30.6200, radius: 22, color: "#eab308", fillColor: "#eab308", description: "No-fly without RDB permit.", type: "protected", source: "static" },
  { name: "Musanze Drone Corridor", lat: -1.4985, lon: 29.6346, radius: 8, color: "#22c55e", fillColor: "#22c55e", description: "Approved drone testing corridor. Cat B & C permitted.", type: "permitted", source: "static" },
  { name: "Bugesera Industrial Zone", lat: -2.2137, lon: 30.2554, radius: 5, color: "#22c55e", fillColor: "#22c55e", description: "Drone operations permitted with prior notification.", type: "permitted", source: "static" },
  { name: "Kigali CBD", lat: -1.9441, lon: 30.0619, radius: 2, color: "#eab308", fillColor: "#eab308", description: "Cat A only, below 120m AMSL.", type: "restricted", source: "static" },
  { name: "Presidential Palace area", lat: -1.9528, lon: 30.0616, radius: 1.5, color: "#ef4444", fillColor: "#ef4444", description: "Full restriction – no exceptions.", type: "restricted", source: "static" },
  { name: "Kigali Intl Airport Bugesera (HRKI)", lat: -2.142956, lon: 30.180916, radius: 5, color: "#ef4444", fillColor: "#ef4444", description: "5km full ban. New Kigali International Airport — Bugesera (parallel runways 14L/32R & 14R/32L). CAA authorization required.", type: "airport", source: "static" },
  { name: "Bugesera Airport 10km advisory", lat: -2.142956, lon: 30.180916, radius: 10, color: "#f97316", fillColor: "#f97316", description: "10km advisory zone around new Kigali International Airport Bugesera. Prior notification required.", type: "advisory", source: "static" },
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
    designation: "02/20",
    // heading ~017°/197° (NNE/SSW), ~1485m, width 30m
    endpoints: [[-2.455845, 28.909912], [-2.468659, 28.906051]] as [number, number][],
    widthM: 30,
    elev: "1590m / 5217ft",
  },
  {
    icao: "HRHU",
    name: "Huye",
    designation: "09/27",
    // heading ~085°/265° (E threshold → W threshold), ~890m, width 18m
    endpoints: [[-2.594962, 29.739545], [-2.595688, 29.731563]] as [number, number][],
    widthM: 18,
    elev: "1768m / 5800ft",
  },
  {
    icao: "HRKI",
    name: "Kigali Intl Airport Bugesera",
    designation: "14L/32R",
    // heading ~136°/316° (NW threshold → SE threshold), ~4500m, width 60m
    // Northeast of the parallel pair.
    endpoints: [[-2.127983, 30.167369], [-2.156856, 30.195524]] as [number, number][],
    widthM: 60,
    elev: "1374m / 4508ft",
  },
  {
    icao: "HRKI",
    name: "Kigali Intl Airport Bugesera",
    designation: "14R/32L",
    // Parallel runway — southwest of the pair.
    endpoints: [[-2.129023, 30.166181], [-2.157960, 30.194591]] as [number, number][],
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

// Trapezoidal approach/departure corridor extending from a runway threshold,
// pointing AWAY from the other runway end. Returns 4 lat/lng corners.
function approachCorridor(
  threshold: [number, number],
  otherEnd: [number, number],
  lengthKm: number,
  innerWidthKm: number,
  outerWidthKm: number,
): [number, number][] {
  const lat0 = threshold[0]
  const cosLat = Math.cos((lat0 * Math.PI) / 180)
  const dLat = threshold[0] - otherEnd[0]
  const dLon = threshold[1] - otherEnd[1]
  const dLatKm = dLat * 111
  const dLonKm = dLon * 111 * cosLat
  const len = Math.sqrt(dLatKm * dLatKm + dLonKm * dLonKm) || 1
  const ux = dLatKm / len
  const uy = dLonKm / len
  // Perpendicular unit vector (rotate 90°)
  const px = -uy
  const py = ux
  const farLat = threshold[0] + (ux * lengthKm) / 111
  const farLon = threshold[1] + (uy * lengthKm) / (111 * cosLat)
  const innerOffLat = (px * (innerWidthKm / 2)) / 111
  const innerOffLon = (py * (innerWidthKm / 2)) / (111 * cosLat)
  const outerOffLat = (px * (outerWidthKm / 2)) / 111
  const outerOffLon = (py * (outerWidthKm / 2)) / (111 * cosLat)
  return [
    [threshold[0] + innerOffLat, threshold[1] + innerOffLon],
    [farLat + outerOffLat, farLon + outerOffLon],
    [farLat - outerOffLat, farLon - outerOffLon],
    [threshold[0] - innerOffLat, threshold[1] - innerOffLon],
  ]
}

// Rwanda actual extent + ~20 km buffer (≈ 0.18°)
// Country: S -2.84, N -1.05, W 28.84, E 30.90
const RWANDA_BOUNDS: [[number, number], [number, number]] = [[-3.02, 28.66], [-0.87, 31.08]]
const RWANDA_CENTER: [number, number] = [-1.9403, 29.8739]

export default function AirspaceMap() {
  const mapRef         = useRef<HTMLDivElement>(null)
  const mapInstanceRef = useRef<any>(null)
  const dynLayerRef    = useRef<any>(null)   // LayerGroup for dynamic zones
  const staticLayerRef = useRef<any>(null)   // LayerGroup for built-in fallback zones
  const [dynamicZones, setDynamicZones] = useState<DynamicZone[] | null>(null)

  useEffect(() => {
    fetch('/api/airspace/zones')
      .then(r => r.json())
      .then(data => setDynamicZones(Array.isArray(data) ? data : []))
      .catch(() => setDynamicZones([]))
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

      const osm = L.tileLayer("https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png", {
        attribution: '© <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a>',
        maxZoom: 19,
      })
      const esriImagery = L.tileLayer(
        "https://server.arcgisonline.com/ArcGIS/rest/services/World_Imagery/MapServer/tile/{z}/{y}/{x}",
        {
          attribution: "Tiles © Esri — Source: Esri, Maxar, Earthstar Geographics, GIS User Community",
          maxZoom: 19,
        },
      )
      esriImagery.addTo(map)
      L.control.layers({ "Satellite (Esri)": esriImagery, "Streets (OSM)": osm }, {}).addTo(map)

      // ── Static airspace zones (rendered into a layer that we hide once DB has zones) ─
      staticLayerRef.current = L.layerGroup().addTo(map)
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
              <p style="margin:4px 0 0;font-size:10px;color:#999">Built-in fallback (not in database)</p>
            </div>`
          )
          .addTo(staticLayerRef.current)
      }

      // ── Runway visualization (visible at zoom ≥ 12) ──────────
      const runwayLayers: any[] = []
      // Corridors visible at lower zoom (≥ 10) so pilots see them while planning
      const corridorLayers: any[] = []

      for (const rwy of RUNWAYS) {
        // ── Approach / departure corridors ─────────────────────
        // Two trapezoids per runway: one extending from each threshold along the
        // runway bearing, AWAY from the opposite end. 5km long, 0.3 → 1.5km wide.
        const cornersA = approachCorridor(rwy.endpoints[0], rwy.endpoints[1], 5, 0.3, 1.5)
        const cornersB = approachCorridor(rwy.endpoints[1], rwy.endpoints[0], 5, 0.3, 1.5)
        const desigA = rwy.designation.split("/")[0]
        const desigB = rwy.designation.split("/")[1]

        for (const [corners, end] of [
          [cornersA, desigB] as const, // corridor off threshold A is approach for runway end-B
          [cornersB, desigA] as const,
        ]) {
          const corridor = L.polygon(corners as L.LatLngExpression[], {
            color: "#dc2626",
            fillColor: "#f97316",
            fillOpacity: 0.18,
            weight: 1.5,
            dashArray: "4 4",
            opacity: 0,
          })
            .bindPopup(
              `<div style="min-width:180px">
                <strong style="font-size:13px">⚠ ${rwy.icao} approach corridor — RWY ${end}</strong>
                <p style="margin:4px 0 0;font-size:12px;color:#555">Approach &amp; departure path. Drone operations restricted.</p>
                <p style="margin:2px 0 0;font-size:11px;color:#888">~5 km from threshold along runway bearing.</p>
              </div>`,
            )
            .addTo(map)
          corridorLayers.push(corridor)
        }

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

      // One ✈ icon per ICAO. For airports with multiple runways, average all thresholds.
      const seenIcao = new Set<string>()
      for (const rwy of RUNWAYS) {
        if (seenIcao.has(rwy.icao)) continue
        seenIcao.add(rwy.icao)
        const allRunways = RUNWAYS.filter((r) => r.icao === rwy.icao)
        const points = allRunways.flatMap((r) => r.endpoints)
        const center: L.LatLngExpression = [
          points.reduce((s, p) => s + p[0], 0) / points.length,
          points.reduce((s, p) => s + p[1], 0) / points.length,
        ]
        const designations = allRunways.map((r) => r.designation).join(" · ")
        L.marker(center, { icon: airportIcon })
          .bindPopup(
            `<div style="min-width:160px">
              <strong style="font-size:13px">✈ ${rwy.icao} — ${rwy.name}</strong>
              <p style="margin:4px 0 0;font-size:12px;color:#555">RWY ${designations}${allRunways.length > 1 ? "" : ` · ${rwy.widthM}m wide`}</p>
              <p style="margin:2px 0 0;font-size:11px;color:#888">Elev: ${rwy.elev}</p>
              <p style="margin:4px 0 0;font-size:11px;color:#1e40af">Zoom in (≥12) to see runway${allRunways.length > 1 ? "s" : ""}</p>
            </div>`
          )
          .addTo(map)
      }

      // Show/hide runway layers based on zoom
      function updateRunwayVisibility() {
        const zoom = map.getZoom()
        const runwayVisible = zoom >= 12
        const corridorVisible = zoom >= 10
        for (const layer of runwayLayers) {
          if (layer.setStyle) {
            layer.setStyle({ opacity: runwayVisible ? 1 : 0, fillOpacity: runwayVisible ? 0.8 : 0 })
          }
        }
        for (const layer of corridorLayers) {
          if (layer.setStyle) {
            layer.setStyle({ opacity: corridorVisible ? 1 : 0, fillOpacity: corridorVisible ? 0.18 : 0 })
          }
        }
      }

      map.on("zoomend", updateRunwayVisibility)
      updateRunwayVisibility()

      // ── Click-to-show-coords helper ──────────────────────────
      // Useful for verifying that pinned features (like HRKI) sit on the
      // actual airport when comparing to satellite imagery.
      map.on("click", (e: any) => {
        const lat = e.latlng.lat.toFixed(6)
        const lng = e.latlng.lng.toFixed(6)
        L.popup({ closeButton: true, autoClose: true })
          .setLatLng(e.latlng)
          .setContent(
            `<div style="font-family:monospace;font-size:12px;line-height:1.5">
              <strong style="font-family:system-ui;font-size:11px;color:#666;display:block;margin-bottom:4px">Map coordinates</strong>
              Lat: ${lat}<br/>
              Lon: ${lng}<br/>
              <button onclick="navigator.clipboard.writeText('${lat}, ${lng}').then(()=>{this.textContent='✓ Copied'})" style="margin-top:6px;padding:2px 8px;font-size:11px;background:#003366;color:white;border:none;border-radius:3px;cursor:pointer">Copy</button>
            </div>`,
          )
          .openOn(map)
      })
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
  // Also hide the static fallback layer when DB has zones, so admin edits aren't shadowed.
  useEffect(() => {
    if (!dynLayerRef.current || dynamicZones === null) return
    if (staticLayerRef.current && mapInstanceRef.current) {
      const map = mapInstanceRef.current
      if (dynamicZones.length > 0) {
        if (map.hasLayer(staticLayerRef.current)) map.removeLayer(staticLayerRef.current)
      } else {
        if (!map.hasLayer(staticLayerRef.current)) staticLayerRef.current.addTo(map)
      }
    }
    if (dynamicZones.length === 0) {
      dynLayerRef.current.clearLayers()
      return
    }
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
        <div className="flex items-center gap-2">
          <div className="w-3 h-2 border border-red-600 bg-orange-400/30" style={{ borderStyle: "dashed" }} />
          <span>Approach corridor (zoom ≥ 10)</span>
        </div>
        <p className="text-muted-foreground text-[10px] border-t mt-1 pt-1">
          Tip: click anywhere to copy lat/lon.
        </p>
        <p className="text-muted-foreground text-[10px]">
          {dynamicZones && dynamicZones.length > 0
            ? `${dynamicZones.length} zone${dynamicZones.length !== 1 ? 's' : ''} from database`
            : 'Using built-in fallback zones'}
        </p>
      </div>
    </div>
  )
}
