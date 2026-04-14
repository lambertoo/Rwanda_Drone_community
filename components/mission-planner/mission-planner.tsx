"use client"

import { useEffect, useMemo, useRef, useState } from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert"
import {
  Tabs,
  TabsContent,
  TabsList,
  TabsTrigger,
} from "@/components/ui/tabs"
import {
  Download,
  MapPin,
  Trash2,
  CheckCircle,
  AlertTriangle,
  Info,
  Mountain,
  Sun,
  Route,
  Square,
  RefreshCw,
} from "lucide-react"
import { STATIC_ZONES } from "@/components/airspace/airspace-map"

type LatLng = { lat: number; lng: number }
type Waypoint = LatLng & { alt: number }
type Mode = "area" | "route"

const RWANDA_BOUNDS: [[number, number], [number, number]] = [[-3.02, 28.66], [-0.87, 31.08]]
const RWANDA_CENTER: [number, number] = [-1.9403, 29.8739]
const DEFAULT_ALT_M = 50

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

function escapeXml(s: string) {
  return s
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;")
    .replace(/'/g, "&apos;")
}

function buildAreaKml(missionName: string, areaName: string, points: LatLng[]): string {
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

function buildRouteKml(missionName: string, routeName: string, waypoints: Waypoint[]): string {
  const lineCoords = waypoints.map((w) => `${w.lng},${w.lat},${w.alt}`).join(" ")
  const wpPlacemarks = waypoints
    .map(
      (w, i) => `\t<Placemark id="${randomKmlId()}">
\t\t<name>WP${i + 1}</name>
\t\t<Point>
\t\t\t<altitudeMode>relativeToGround</altitudeMode>
\t\t\t<coordinates>${w.lng},${w.lat},${w.alt}</coordinates>
\t\t</Point>
\t</Placemark>`,
    )
    .join("\n")

  return `<?xml version="1.0" encoding="UTF-8"?>
<kml xmlns="http://www.opengis.net/kml/2.2" xmlns:gx="http://www.google.com/kml/ext/2.2" xmlns:kml="http://www.opengis.net/kml/2.2" xmlns:atom="http://www.w3.org/2005/Atom">
<Document>
\t<name>${escapeXml(missionName)}</name>
\t<visibility>0</visibility>
\t<Placemark id="${randomKmlId()}">
\t\t<name>${escapeXml(routeName)}</name>
\t\t<LineString>
\t\t\t<altitudeMode>relativeToGround</altitudeMode>
\t\t\t<extrude>1</extrude>
\t\t\t<tessellate>1</tessellate>
\t\t\t<coordinates>
\t\t\t\t${lineCoords}
\t\t\t</coordinates>
\t\t</LineString>
\t</Placemark>
${wpPlacemarks}
</Document>
</kml>
`
}

interface OverlapWarning {
  zoneName: string
  zoneType: string
  color: string
  description: string
  severity: "red" | "orange" | "yellow" | "green"
}

function computeOverlaps(points: LatLng[]): OverlapWarning[] {
  if (points.length === 0) return []
  const centroid = polygonCentroid(points)
  const warnings: OverlapWarning[] = []

  for (const zone of STATIC_ZONES) {
    if (!zone.radius) continue
    let intersects = false

    if (points.length >= 3) {
      const dCentroid = haversineKm(centroid.lat, centroid.lng, zone.lat, zone.lon)
      if (dCentroid <= zone.radius) intersects = true
    }

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

interface ElevationStats {
  min: number
  max: number
  avg: number
  range: number
  samples: number
  values: number[]
}

interface DaylightInfo {
  date: string
  sunrise: string
  sunset: string
  civilTwilightBegin: string
  civilTwilightEnd: string
  dayLengthMin: number
}

function fmtTime(iso: string) {
  if (!iso) return "—"
  return new Date(iso).toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" })
}

export default function MissionPlanner() {
  const mapRef = useRef<HTMLDivElement>(null)
  const mapInstanceRef = useRef<any>(null)
  const Lref = useRef<any>(null)
  const drawingLayerRef = useRef<any>(null)
  const polygonLayerRef = useRef<any>(null)
  const vertexMarkersRef = useRef<any[]>([])
  const previewLineRef = useRef<any>(null)

  const [mode, setMode] = useState<Mode>("area")
  const [drawing, setDrawing] = useState(false)
  const [points, setPoints] = useState<LatLng[]>([])
  const [waypointAlts, setWaypointAlts] = useState<Record<number, number>>({})
  const [finished, setFinished] = useState(false)
  const [missionName, setMissionName] = useState("My Mission")
  const [areaName, setAreaName] = useState("Square Area")
  const [warnings, setWarnings] = useState<OverlapWarning[]>([])
  const [elevation, setElevation] = useState<ElevationStats | null>(null)
  const [elevLoading, setElevLoading] = useState(false)
  const [elevError, setElevError] = useState<string | null>(null)
  const [daylightDate, setDaylightDate] = useState<string>(() =>
    new Date().toISOString().slice(0, 10),
  )
  const [daylight, setDaylight] = useState<DaylightInfo | null>(null)
  const [daylightLoading, setDaylightLoading] = useState(false)

  const waypoints: Waypoint[] = useMemo(
    () => points.map((p, i) => ({ ...p, alt: waypointAlts[i] ?? DEFAULT_ALT_M })),
    [points, waypointAlts],
  )

  const totalRouteKm = useMemo(() => {
    if (mode !== "route" || waypoints.length < 2) return 0
    let d = 0
    for (let i = 1; i < waypoints.length; i++) {
      d += haversineKm(
        waypoints[i - 1].lat,
        waypoints[i - 1].lng,
        waypoints[i].lat,
        waypoints[i].lng,
      )
    }
    return d
  }, [mode, waypoints])

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
          attribution: "Tiles © Esri — Source: Esri, Maxar, Earthstar Geographics, GIS User Community",
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
      setPoints((prev) => [...prev, { lat: e.latlng.lat, lng: e.latlng.lng }])
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
      const min = mode === "area" ? 3 : 2
      if (points.length >= min) finishShape()
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
  }, [drawing, points, mode])

  useEffect(() => {
    const L = Lref.current
    const layer = drawingLayerRef.current
    if (!L || !layer) return

    for (const m of vertexMarkersRef.current) layer.removeLayer(m)
    vertexMarkersRef.current = []

    points.forEach((p, i) => {
      const isRoute = mode === "route"
      const marker = L.circleMarker([p.lat, p.lng], {
        radius: isRoute ? 7 : 5,
        color: "#003366",
        fillColor: isRoute ? "#009FDA" : "#FFC72C",
        fillOpacity: 1,
        weight: 2,
      }).addTo(layer)
      if (isRoute) {
        marker.bindTooltip(`WP${i + 1}`, { permanent: true, direction: "top", offset: [0, -8] })
      }
      vertexMarkersRef.current.push(marker)
    })

    if (polygonLayerRef.current) {
      layer.removeLayer(polygonLayerRef.current)
      polygonLayerRef.current = null
    }

    if (points.length >= 2) {
      const latLngs = points.map((p) => [p.lat, p.lng]) as [number, number][]
      if (mode === "area") {
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
      } else {
        polygonLayerRef.current = L.polyline(latLngs, {
          color: "#009FDA",
          weight: 3,
        }).addTo(layer)
      }
    }

    if (previewLineRef.current && (!drawing || points.length === 0 || finished)) {
      layer.removeLayer(previewLineRef.current)
      previewLineRef.current = null
    }
  }, [points, finished, drawing, mode])

  useEffect(() => {
    if (!finished || points.length === 0) {
      setWarnings([])
      setElevation(null)
      setDaylight(null)
      return
    }
    setWarnings(computeOverlaps(points))
    fetchElevation()
    fetchDaylight()
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [finished, points])

  useEffect(() => {
    if (finished) fetchDaylight()
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [daylightDate])

  async function fetchElevation() {
    if (points.length === 0) return
    setElevError(null)
    setElevLoading(true)
    try {
      const samples: LatLng[] = [...points]
      if (mode === "area" && points.length >= 3) {
        samples.push(polygonCentroid(points))
      }
      const res = await fetch("/api/elevation", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          points: samples.map((p) => ({ latitude: p.lat, longitude: p.lng })),
        }),
      })
      if (!res.ok) throw new Error("elevation failed")
      const data = await res.json()
      const values = (data.elevations || [])
        .map((e: any) => e.elevation)
        .filter((v: any) => typeof v === "number")
      if (values.length === 0) throw new Error("no elevation data")
      const min = Math.min(...values)
      const max = Math.max(...values)
      const avg = values.reduce((a: number, b: number) => a + b, 0) / values.length
      setElevation({ min, max, avg, range: max - min, samples: values.length, values })
    } catch (err: any) {
      setElevError(err?.message || "Elevation lookup failed")
      setElevation(null)
    } finally {
      setElevLoading(false)
    }
  }

  async function fetchDaylight() {
    if (points.length === 0) return
    setDaylightLoading(true)
    try {
      const c = polygonCentroid(points)
      const url = `https://api.sunrise-sunset.org/json?lat=${c.lat}&lng=${c.lng}&date=${daylightDate}&formatted=0`
      const res = await fetch(url)
      const data = await res.json()
      if (data?.status !== "OK") throw new Error("daylight api error")
      const r = data.results
      const sunrise = new Date(r.sunrise).getTime()
      const sunset = new Date(r.sunset).getTime()
      setDaylight({
        date: daylightDate,
        sunrise: r.sunrise,
        sunset: r.sunset,
        civilTwilightBegin: r.civil_twilight_begin,
        civilTwilightEnd: r.civil_twilight_end,
        dayLengthMin: Math.round((sunset - sunrise) / 60000),
      })
    } catch {
      setDaylight(null)
    } finally {
      setDaylightLoading(false)
    }
  }

  function startDrawing() {
    clearShape()
    setDrawing(true)
  }

  function finishShape() {
    const min = mode === "area" ? 3 : 2
    if (points.length < min) return
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

  function clearShape() {
    setPoints([])
    setWaypointAlts({})
    setFinished(false)
    setDrawing(false)
    setWarnings([])
    setElevation(null)
    setElevError(null)
    setDaylight(null)
    const layer = drawingLayerRef.current
    if (layer) layer.clearLayers()
    vertexMarkersRef.current = []
    polygonLayerRef.current = null
    previewLineRef.current = null
  }

  function changeMode(m: Mode) {
    if (m === mode) return
    clearShape()
    setMode(m)
  }

  function downloadKml() {
    if (!finished) return
    const minPts = mode === "area" ? 3 : 2
    if (points.length < minPts) return
    const kml =
      mode === "area"
        ? buildAreaKml(missionName.trim() || "My Mission", areaName.trim() || "Square Area", points)
        : buildRouteKml(missionName.trim() || "My Mission", areaName.trim() || "Route", waypoints)
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
          <Tabs value={mode} onValueChange={(v) => changeMode(v as Mode)}>
            <TabsList className="grid grid-cols-2 w-full md:w-72">
              <TabsTrigger value="area" className="flex items-center gap-2">
                <Square className="w-4 h-4" /> Area
              </TabsTrigger>
              <TabsTrigger value="route" className="flex items-center gap-2">
                <Route className="w-4 h-4" /> Route
              </TabsTrigger>
            </TabsList>
            <TabsContent value="area" className="text-xs text-muted-foreground pt-2">
              Survey/coverage areas — exports as KML <code>Polygon</code>.
            </TabsContent>
            <TabsContent value="route" className="text-xs text-muted-foreground pt-2">
              Waypoint missions with per-point altitude — exports as KML <code>LineString</code> + waypoint <code>Point</code> placemarks (relative to ground).
            </TabsContent>
          </Tabs>

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
              <Label htmlFor="area-name">{mode === "area" ? "Area label" : "Route label"}</Label>
              <Input
                id="area-name"
                value={areaName}
                onChange={(e) => setAreaName(e.target.value)}
                placeholder={mode === "area" ? "e.g. Square Area" : "e.g. Survey Route"}
              />
            </div>
          </div>

          <div className="flex flex-wrap gap-2">
            {!drawing && !finished && (
              <Button onClick={startDrawing}>
                <MapPin className="w-4 h-4 mr-2" />
                {mode === "area" ? "Draw area" : "Place waypoints"}
              </Button>
            )}
            {drawing && (
              <>
                <Button
                  onClick={finishShape}
                  disabled={points.length < (mode === "area" ? 3 : 2)}
                  variant="default"
                >
                  <CheckCircle className="w-4 h-4 mr-2" />
                  Finish ({points.length} {mode === "area" ? "pts" : "wp"})
                </Button>
                <Button onClick={undoLastPoint} disabled={points.length === 0} variant="outline">
                  Undo
                </Button>
                <Button onClick={clearShape} variant="outline">
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
                <Button onClick={clearShape} variant="outline">
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
                {mode === "area"
                  ? "Click the map to place corners. Double-click or press Finish when you have at least 3 points."
                  : "Click the map to drop waypoints in flight order. Double-click or press Finish when you have at least 2."}
              </AlertDescription>
            </Alert>
          )}

          <div className="relative rounded-lg overflow-hidden border">
            <link rel="stylesheet" href="https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.9.4/leaflet.min.css" />
            <div ref={mapRef} style={{ height: "520px", width: "100%" }} />
          </div>

          {mode === "route" && finished && waypoints.length > 0 && (
            <Card>
              <CardHeader className="pb-3">
                <CardTitle className="text-base flex items-center justify-between">
                  <span>Waypoints ({waypoints.length})</span>
                  <span className="text-xs font-normal text-muted-foreground">
                    Total length: {totalRouteKm.toFixed(2)} km
                  </span>
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="overflow-x-auto">
                  <table className="w-full text-sm">
                    <thead>
                      <tr className="border-b text-muted-foreground text-left">
                        <th className="pb-2 pr-3">#</th>
                        <th className="pb-2 pr-3">Lat</th>
                        <th className="pb-2 pr-3">Lon</th>
                        <th className="pb-2 pr-3">Alt (m AGL)</th>
                        <th className="pb-2">Leg (km)</th>
                      </tr>
                    </thead>
                    <tbody>
                      {waypoints.map((w, i) => {
                        const leg =
                          i === 0
                            ? 0
                            : haversineKm(
                                waypoints[i - 1].lat,
                                waypoints[i - 1].lng,
                                w.lat,
                                w.lng,
                              )
                        return (
                          <tr key={i} className="border-b last:border-0">
                            <td className="py-1.5 pr-3 font-mono">WP{i + 1}</td>
                            <td className="py-1.5 pr-3 font-mono text-xs">{w.lat.toFixed(6)}</td>
                            <td className="py-1.5 pr-3 font-mono text-xs">{w.lng.toFixed(6)}</td>
                            <td className="py-1.5 pr-3">
                              <Input
                                type="number"
                                min={0}
                                max={500}
                                value={w.alt}
                                onChange={(e) =>
                                  setWaypointAlts((prev) => ({
                                    ...prev,
                                    [i]: Math.max(0, Math.min(500, Number(e.target.value) || 0)),
                                  }))
                                }
                                className="h-7 w-20"
                              />
                            </td>
                            <td className="py-1.5 font-mono text-xs">{leg.toFixed(3)}</td>
                          </tr>
                        )
                      })}
                    </tbody>
                  </table>
                </div>
                <p className="text-xs text-muted-foreground mt-2">
                  Altitudes are <strong>above ground</strong> (AGL). Rwanda CAA Cat A limit is 120 m AGL — values above are flagged.
                </p>
                {waypoints.some((w) => w.alt > 120) && (
                  <p className="text-xs text-orange-600 mt-1">
                    ⚠ One or more waypoints exceed 120 m AGL.
                  </p>
                )}
              </CardContent>
            </Card>
          )}

          {finished && (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <Card>
                <CardHeader className="pb-3">
                  <CardTitle className="text-base flex items-center justify-between">
                    <span className="flex items-center gap-2">
                      <Mountain className="w-4 h-4" /> Terrain elevation
                    </span>
                    <Button
                      size="sm"
                      variant="ghost"
                      onClick={fetchElevation}
                      disabled={elevLoading}
                      className="h-7"
                    >
                      <RefreshCw className={`w-3.5 h-3.5 ${elevLoading ? "animate-spin" : ""}`} />
                    </Button>
                  </CardTitle>
                </CardHeader>
                <CardContent className="text-sm">
                  {elevLoading && <p className="text-muted-foreground">Sampling SRTM30…</p>}
                  {elevError && (
                    <p className="text-destructive text-xs">
                      {elevError}. Open-Elevation/SRTM may be rate-limited; retry shortly.
                    </p>
                  )}
                  {elevation && (
                    <div className="space-y-2">
                      <div className="grid grid-cols-3 gap-2 text-center">
                        <div>
                          <p className="text-xs text-muted-foreground">Min</p>
                          <p className="font-mono">{Math.round(elevation.min)} m</p>
                        </div>
                        <div>
                          <p className="text-xs text-muted-foreground">Avg</p>
                          <p className="font-mono">{Math.round(elevation.avg)} m</p>
                        </div>
                        <div>
                          <p className="text-xs text-muted-foreground">Max</p>
                          <p className="font-mono">{Math.round(elevation.max)} m</p>
                        </div>
                      </div>
                      <p className="text-xs text-muted-foreground">
                        Terrain range: <strong>{Math.round(elevation.range)} m</strong> across{" "}
                        {elevation.samples} sample{elevation.samples !== 1 ? "s" : ""}.
                      </p>
                      {elevation.range > 50 && (
                        <p className="text-xs text-orange-600">
                          ⚠ Significant terrain variation — set AGL altitudes per waypoint, not absolute.
                        </p>
                      )}
                      <div className="flex items-end gap-0.5 h-12 bg-muted/30 rounded p-1">
                        {elevation.values.map((v, i) => {
                          const h = ((v - elevation.min) / Math.max(1, elevation.range)) * 100
                          return (
                            <div
                              key={i}
                              className="flex-1 bg-primary/70 rounded-sm"
                              style={{ height: `${Math.max(6, h)}%` }}
                              title={`${Math.round(v)} m`}
                            />
                          )
                        })}
                      </div>
                    </div>
                  )}
                  {!elevLoading && !elevation && !elevError && (
                    <p className="text-muted-foreground">No data.</p>
                  )}
                </CardContent>
              </Card>

              <Card>
                <CardHeader className="pb-3">
                  <CardTitle className="text-base flex items-center justify-between">
                    <span className="flex items-center gap-2">
                      <Sun className="w-4 h-4" /> Daylight window
                    </span>
                    <Input
                      type="date"
                      value={daylightDate}
                      onChange={(e) => setDaylightDate(e.target.value)}
                      className="h-7 w-36 text-xs"
                    />
                  </CardTitle>
                </CardHeader>
                <CardContent className="text-sm">
                  {daylightLoading && <p className="text-muted-foreground">Computing…</p>}
                  {daylight && (
                    <div className="space-y-2">
                      <div className="grid grid-cols-2 gap-2">
                        <div>
                          <p className="text-xs text-muted-foreground">Sunrise</p>
                          <p className="font-mono">{fmtTime(daylight.sunrise)}</p>
                        </div>
                        <div>
                          <p className="text-xs text-muted-foreground">Sunset</p>
                          <p className="font-mono">{fmtTime(daylight.sunset)}</p>
                        </div>
                        <div>
                          <p className="text-xs text-muted-foreground">Civil twilight (start)</p>
                          <p className="font-mono">{fmtTime(daylight.civilTwilightBegin)}</p>
                        </div>
                        <div>
                          <p className="text-xs text-muted-foreground">Civil twilight (end)</p>
                          <p className="font-mono">{fmtTime(daylight.civilTwilightEnd)}</p>
                        </div>
                      </div>
                      <p className="text-xs text-muted-foreground border-t pt-2">
                        Day length:{" "}
                        <strong>
                          {Math.floor(daylight.dayLengthMin / 60)}h {daylight.dayLengthMin % 60}m
                        </strong>
                        . Rwanda CAA daylight rule: VLOS only between sunrise and sunset.
                      </p>
                    </div>
                  )}
                  {!daylightLoading && !daylight && (
                    <p className="text-muted-foreground text-xs">No daylight data.</p>
                  )}
                </CardContent>
              </Card>
            </div>
          )}

          {finished && warnings.length === 0 && (
            <Alert>
              <CheckCircle className="w-4 h-4" />
              <AlertTitle>No airspace conflicts detected</AlertTitle>
              <AlertDescription>
                Your mission doesn't overlap any known static restricted zones. Always verify current NOTAMs before flight.
              </AlertDescription>
            </Alert>
          )}

          {warnings.length > 0 && (
            <Alert variant="destructive">
              <AlertTriangle className="w-4 h-4" />
              <AlertTitle>Airspace overlap warnings</AlertTitle>
              <AlertDescription>
                <p className="mb-2">Your mission intersects the following zones:</p>
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
