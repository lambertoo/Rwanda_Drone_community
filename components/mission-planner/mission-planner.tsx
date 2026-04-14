"use client"

import { useEffect, useRef, useState } from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert"
import { Download, MapPin, Trash2, CheckCircle, AlertTriangle, Info } from "lucide-react"
import { STATIC_ZONES } from "@/components/airspace/airspace-map"

type LatLng = { lat: number; lng: number }

const RWANDA_BOUNDS: [[number, number], [number, number]] = [[-3.02, 28.66], [-0.87, 31.08]]
const RWANDA_CENTER: [number, number] = [-1.9403, 29.8739]

function haversineKm(lat1: number, lon1: number, lat2: number, lon2: number) {
  const R = 6371
  const toRad = (d: number) => (d * Math.PI) / 180
  const dLat = toRad(lat2 - lat1)
  const dLon = toRad(lon2 - lon1)
  const a =
    Math.sin(dLat / 2) ** 2 +
    Math.cos(toRad(lat1)) * Math.cos(toRad(lat2)) * Math.sin(dLon / 2) ** 2
  return 2 * R * Math.asin(Math.sqrt(a))
}

function polygonCentroid(points: LatLng[]): LatLng {
  const n = points.length
  if (n === 0) return { lat: 0, lng: 0 }
  const sum = points.reduce(
    (acc, p) => ({ lat: acc.lat + p.lat, lng: acc.lng + p.lng }),
    { lat: 0, lng: 0 },
  )
  return { lat: sum.lat / n, lng: sum.lng / n }
}

function randomKmlId() {
  const bytes = new Uint8Array(10)
  crypto.getRandomValues(bytes)
  return Array.from(bytes, (b) => b.toString(16).padStart(2, "0")).join("").toUpperCase()
}

function buildKml(missionName: string, areaName: string, points: LatLng[]): string {
  const ring = [...points, points[0]]
  const coords = ring.map((p) => `${p.lng},${p.lat},0`).join(" ")
  return `<?xml version="1.0" encoding="UTF-8"?>
<kml xmlns="http://www.opengis.net/kml/2.2" xmlns:gx="http://www.google.com/kml/ext/2.2" xmlns:kml="http://www.opengis.net/kml/2.2" xmlns:atom="http://www.w3.org/2005/Atom">
<Document>
\t<name>${escapeXml(missionName)}</name>
\t<visibility>0</visibility>
\t<Placemark id="${randomKmlId()}">
\t\t<name>${escapeXml(areaName)}</name>
\t\t<Polygon>
\t\t\t<outerBoundaryIs>
\t\t\t\t<LinearRing>
\t\t\t\t\t<coordinates>
\t\t\t\t\t\t${coords}
\t\t\t\t\t</coordinates>
\t\t\t\t</LinearRing>
\t\t\t</outerBoundaryIs>
\t\t</Polygon>
\t</Placemark>
</Document>
</kml>
`
}

function escapeXml(s: string) {
  return s
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;")
    .replace(/'/g, "&apos;")
}

interface OverlapWarning {
  zoneName: string
  zoneType: string
  color: string
  description: string
  severity: "red" | "orange" | "yellow" | "green"
}

function computeOverlaps(points: LatLng[]): OverlapWarning[] {
  if (points.length < 3) return []
  const centroid = polygonCentroid(points)
  const warnings: OverlapWarning[] = []

  for (const zone of STATIC_ZONES) {
    if (!zone.radius) continue
    let intersects = false

    const dCentroid = haversineKm(centroid.lat, centroid.lng, zone.lat, zone.lon)
    if (dCentroid <= zone.radius) intersects = true

    if (!intersects) {
      for (const p of points) {
        const d = haversineKm(p.lat, p.lng, zone.lat, zone.lon)
        if (d <= zone.radius) {
          intersects = true
          break
        }
      }
    }

    if (!intersects) continue

    const severity: OverlapWarning["severity"] =
      zone.color === "#ef4444"
        ? "red"
        : zone.color === "#f97316"
        ? "orange"
        : zone.color === "#eab308"
        ? "yellow"
        : "green"

    warnings.push({
      zoneName: zone.name,
      zoneType: zone.type,
      color: zone.color,
      description: zone.description,
      severity,
    })
  }

  return warnings
}

export default function MissionPlanner() {
  const mapRef = useRef<HTMLDivElement>(null)
  const mapInstanceRef = useRef<any>(null)
  const Lref = useRef<any>(null)
  const drawingLayerRef = useRef<any>(null)
  const polygonLayerRef = useRef<any>(null)
  const vertexMarkersRef = useRef<any[]>([])
  const previewLineRef = useRef<any>(null)

  const [drawing, setDrawing] = useState(false)
  const [points, setPoints] = useState<LatLng[]>([])
  const [finished, setFinished] = useState(false)
  const [missionName, setMissionName] = useState("My Mission")
  const [areaName, setAreaName] = useState("Square Area")
  const [warnings, setWarnings] = useState<OverlapWarning[]>([])

  useEffect(() => {
    if (!mapRef.current || mapInstanceRef.current) return

    import("leaflet").then((L) => {
      if (mapInstanceRef.current) return
      Lref.current = L

      delete (L.Icon.Default.prototype as any)._getIconUrl
      L.Icon.Default.mergeOptions({
        iconRetinaUrl: "https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.9.4/images/marker-icon-2x.png",
        iconUrl: "https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.9.4/images/marker-icon.png",
        shadowUrl: "https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.9.4/images/marker-shadow.png",
      })

      const map = L.map(mapRef.current!, {
        center: RWANDA_CENTER,
        zoom: 8,
        maxZoom: 19,
        maxBounds: RWANDA_BOUNDS,
        maxBoundsViscosity: 1.0,
        doubleClickZoom: false,
      })
      mapInstanceRef.current = map
      map.fitBounds(RWANDA_BOUNDS, { padding: [0, 0], animate: false })
      map.setMinZoom(map.getZoom())

      const osm = L.tileLayer("https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png", {
        attribution: '© <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a>',
        maxZoom: 19,
      })
      const esriImagery = L.tileLayer(
        "https://server.arcgisonline.com/ArcGIS/rest/services/World_Imagery/MapServer/tile/{z}/{y}/{x}",
        {
          attribution: "Tiles © Esri — Source: Esri, Maxar, Earthstar Geographics, and the GIS User Community",
          maxZoom: 19,
        },
      )
      esriImagery.addTo(map)
      L.control.layers({ "Satellite (Esri)": esriImagery, "Streets (OSM)": osm }, {}).addTo(map)

      const zoneLayer = L.layerGroup().addTo(map)
      for (const zone of STATIC_ZONES) {
        if (!zone.radius) continue
        L.circle([zone.lat, zone.lon], {
          radius: zone.radius * 1000,
          color: zone.color,
          fillColor: zone.fillColor,
          fillOpacity: zone.type === "advisory" ? 0.06 : 0.12,
          weight: 1,
          dashArray: zone.type === "advisory" ? "6 4" : undefined,
          interactive: false,
        }).addTo(zoneLayer)
      }

      drawingLayerRef.current = L.layerGroup().addTo(map)
    })

    return () => {
      if (mapInstanceRef.current) {
        mapInstanceRef.current.remove()
        mapInstanceRef.current = null
      }
    }
  }, [])

  useEffect(() => {
    const map = mapInstanceRef.current
    const L = Lref.current
    if (!map || !L) return

    const container = map.getContainer() as HTMLElement
    container.style.cursor = drawing ? "crosshair" : ""

    function handleClick(e: any) {
      if (!drawing) return
      const newPoint: LatLng = { lat: e.latlng.lat, lng: e.latlng.lng }
      setPoints((prev) => [...prev, newPoint])
    }

    function handleMouseMove(e: any) {
      if (!drawing) return
      if (points.length === 0) return
      if (previewLineRef.current) {
        drawingLayerRef.current.removeLayer(previewLineRef.current)
        previewLineRef.current = null
      }
      const last = points[points.length - 1]
      previewLineRef.current = L.polyline(
        [
          [last.lat, last.lng],
          [e.latlng.lat, e.latlng.lng],
        ],
        { color: "#009FDA", weight: 2, dashArray: "5 5" },
      ).addTo(drawingLayerRef.current)
    }

    function handleDblClick() {
      if (!drawing) return
      if (points.length >= 3) finishPolygon()
    }

    map.on("click", handleClick)
    map.on("mousemove", handleMouseMove)
    map.on("dblclick", handleDblClick)

    return () => {
      map.off("click", handleClick)
      map.off("mousemove", handleMouseMove)
      map.off("dblclick", handleDblClick)
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [drawing, points])

  useEffect(() => {
    const L = Lref.current
    const layer = drawingLayerRef.current
    if (!L || !layer) return

    for (const m of vertexMarkersRef.current) layer.removeLayer(m)
    vertexMarkersRef.current = []

    for (const p of points) {
      const marker = L.circleMarker([p.lat, p.lng], {
        radius: 5,
        color: "#003366",
        fillColor: "#FFC72C",
        fillOpacity: 1,
        weight: 2,
      }).addTo(layer)
      vertexMarkersRef.current.push(marker)
    }

    if (polygonLayerRef.current) {
      layer.removeLayer(polygonLayerRef.current)
      polygonLayerRef.current = null
    }

    if (points.length >= 2) {
      const latLngs = points.map((p) => [p.lat, p.lng]) as [number, number][]
      if (finished) {
        polygonLayerRef.current = L.polygon(latLngs, {
          color: "#003366",
          fillColor: "#009FDA",
          fillOpacity: 0.25,
          weight: 2,
        }).addTo(layer)
      } else {
        polygonLayerRef.current = L.polyline(latLngs, {
          color: "#009FDA",
          weight: 2,
        }).addTo(layer)
      }
    }

    if (previewLineRef.current && (!drawing || points.length === 0 || finished)) {
      layer.removeLayer(previewLineRef.current)
      previewLineRef.current = null
    }
  }, [points, finished, drawing])

  useEffect(() => {
    if (finished) setWarnings(computeOverlaps(points))
    else setWarnings([])
  }, [finished, points])

  function startDrawing() {
    clearPolygon()
    setDrawing(true)
  }

  function finishPolygon() {
    if (points.length < 3) return
    setDrawing(false)
    setFinished(true)
    if (previewLineRef.current && drawingLayerRef.current) {
      drawingLayerRef.current.removeLayer(previewLineRef.current)
      previewLineRef.current = null
    }
  }

  function undoLastPoint() {
    setPoints((prev) => prev.slice(0, -1))
  }

  function clearPolygon() {
    setPoints([])
    setFinished(false)
    setDrawing(false)
    setWarnings([])
    const layer = drawingLayerRef.current
    if (layer) layer.clearLayers()
    vertexMarkersRef.current = []
    polygonLayerRef.current = null
    previewLineRef.current = null
  }

  function downloadKml() {
    if (!finished || points.length < 3) return
    const kml = buildKml(missionName.trim() || "My Mission", areaName.trim() || "Square Area", points)
    const blob = new Blob([kml], { type: "application/vnd.google-earth.kml+xml" })
    const url = URL.createObjectURL(blob)
    const a = document.createElement("a")
    a.href = url
    const safeName = (missionName.trim() || "mission").replace(/[^a-z0-9_\-]+/gi, "_")
    a.download = `${safeName}.kml`
    document.body.appendChild(a)
    a.click()
    document.body.removeChild(a)
    URL.revokeObjectURL(url)
  }

  return (
    <div className="space-y-4">
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <MapPin className="w-5 h-5" />
            Mission Planner
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
            <div className="space-y-1.5">
              <Label htmlFor="mission-name">Mission name</Label>
              <Input
                id="mission-name"
                value={missionName}
                onChange={(e) => setMissionName(e.target.value)}
                placeholder="e.g. Masoro Survey"
              />
            </div>
            <div className="space-y-1.5">
              <Label htmlFor="area-name">Area label</Label>
              <Input
                id="area-name"
                value={areaName}
                onChange={(e) => setAreaName(e.target.value)}
                placeholder="e.g. Square Area"
              />
            </div>
          </div>

          <div className="flex flex-wrap gap-2">
            {!drawing && !finished && (
              <Button onClick={startDrawing}>
                <MapPin className="w-4 h-4 mr-2" />
                Draw area
              </Button>
            )}
            {drawing && (
              <>
                <Button onClick={finishPolygon} disabled={points.length < 3} variant="default">
                  <CheckCircle className="w-4 h-4 mr-2" />
                  Finish ({points.length} pts)
                </Button>
                <Button onClick={undoLastPoint} disabled={points.length === 0} variant="outline">
                  Undo
                </Button>
                <Button onClick={clearPolygon} variant="outline">
                  Cancel
                </Button>
              </>
            )}
            {finished && (
              <>
                <Button onClick={downloadKml}>
                  <Download className="w-4 h-4 mr-2" />
                  Download KML
                </Button>
                <Button onClick={clearPolygon} variant="outline">
                  <Trash2 className="w-4 h-4 mr-2" />
                  Clear & redraw
                </Button>
              </>
            )}
          </div>

          {drawing && (
            <Alert>
              <Info className="w-4 h-4" />
              <AlertTitle>Drawing mode</AlertTitle>
              <AlertDescription>
                Click on the map to place corners. Double-click or press Finish when you have at least 3 points.
              </AlertDescription>
            </Alert>
          )}

          <div className="relative rounded-lg overflow-hidden border">
            <link rel="stylesheet" href="https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.9.4/leaflet.min.css" />
            <div ref={mapRef} style={{ height: "520px", width: "100%" }} />
          </div>

          {finished && warnings.length === 0 && (
            <Alert>
              <CheckCircle className="w-4 h-4" />
              <AlertTitle>No airspace conflicts detected</AlertTitle>
              <AlertDescription>
                Your mission area doesn't overlap any known static restricted zones. Always verify current NOTAMs and
                dynamic zones before flight.
              </AlertDescription>
            </Alert>
          )}

          {warnings.length > 0 && (
            <Alert variant="destructive">
              <AlertTriangle className="w-4 h-4" />
              <AlertTitle>Airspace overlap warnings</AlertTitle>
              <AlertDescription>
                <p className="mb-2">Your area intersects the following zones:</p>
                <ul className="space-y-2">
                  {warnings.map((w) => (
                    <li key={w.zoneName} className="flex gap-2">
                      <span
                        className="inline-block w-2.5 h-2.5 rounded-full mt-1.5 shrink-0"
                        style={{ backgroundColor: w.color }}
                      />
                      <span>
                        <strong>{w.zoneName}</strong> — {w.description}
                      </span>
                    </li>
                  ))}
                </ul>
              </AlertDescription>
            </Alert>
          )}
        </CardContent>
      </Card>
    </div>
  )
}
