"use client"

import { useState, useEffect, useCallback } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Alert, AlertDescription } from "@/components/ui/alert"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import {
  Loader2, Wind, Thermometer, Eye, Droplets, Gauge, CloudRain,
  Sun, Cloud, CloudSnow, Zap, RefreshCw, CheckCircle, XCircle,
  AlertTriangle, MapPin, Clock, Sunrise, Sunset, LocateFixed, Search, Plane,
  Radio, FileText,
} from "lucide-react"

// ── locations ─────────────────────────────────────────────────
const RWANDA_DISTRICTS = [
  { name: "Kigali (Nyarugenge)", lat: -1.9441, lon: 30.0619 },
  { name: "Gasabo (Kigali)", lat: -1.8990, lon: 30.1127 },
  { name: "Kicukiro (Kigali)", lat: -1.9706, lon: 30.1044 },
  { name: "Musanze (Volcanoes)", lat: -1.4985, lon: 29.6346 },
  { name: "Rubavu (Gisenyi)", lat: -1.6780, lon: 29.2590 },
  { name: "Rusizi (Cyangugu)", lat: -2.4840, lon: 28.9080 },
  { name: "Huye (Butare)", lat: -2.5960, lon: 29.7390 },
  { name: "Rwamagana", lat: -1.9487, lon: 30.4352 },
  { name: "Kayonza", lat: -1.8828, lon: 30.6433 },
  { name: "Nyagatare", lat: -1.2940, lon: 30.3279 },
  { name: "Muhanga (Gitarama)", lat: -2.0830, lon: 29.7560 },
  { name: "Karongi (Kibuye)", lat: -2.0644, lon: 29.3490 },
  { name: "Nyamasheke", lat: -2.3500, lon: 29.1170 },
  { name: "Gicumbi (Byumba)", lat: -1.5745, lon: 30.0640 },
  { name: "Bugesera", lat: -2.2137, lon: 30.2554 },
]

// Rwanda airports — METAR/TAF reference + proximity zones
const AIRPORTS = [
  { icao: "HRYR", name: "Kigali International Airport", lat: -1.9686, lon: 30.1395, banKm: 5, advisoryKm: 10 },
  { icao: "HRZA", name: "Kamembe Airport (Rusizi)", lat: -2.4620, lon: 28.9077, banKm: 3, advisoryKm: 5 },
  { icao: "HRHU", name: "Huye Airport", lat: -2.6008, lon: 29.7279, banKm: 3, advisoryKm: 5 },
  { icao: "HRMU", name: "Musanze (proposed)", lat: -1.4985, lon: 29.6346, banKm: 2, advisoryKm: 4 },
]

// ── WMO weather code helpers ───────────────────────────────────
const WMO_DESCRIPTIONS: Record<number, string> = {
  0: "Clear sky", 1: "Mainly clear", 2: "Partly cloudy", 3: "Overcast",
  45: "Fog", 48: "Rime fog",
  51: "Light drizzle", 53: "Moderate drizzle", 55: "Dense drizzle",
  56: "Light freezing drizzle", 57: "Heavy freezing drizzle",
  61: "Slight rain", 63: "Moderate rain", 65: "Heavy rain",
  66: "Light freezing rain", 67: "Heavy freezing rain",
  71: "Slight snow", 73: "Moderate snow", 75: "Heavy snow", 77: "Snow grains",
  80: "Slight rain showers", 81: "Moderate rain showers", 82: "Violent rain showers",
  85: "Slight snow showers", 86: "Heavy snow showers",
  95: "Thunderstorm", 96: "Thunderstorm with hail", 99: "Thunderstorm with heavy hail",
}

function wmoDescription(code: number) {
  return WMO_DESCRIPTIONS[code] ?? "Unknown"
}

function wmoToIcon(code: number): string {
  if (code === 0) return "01d"
  if (code <= 2) return "02d"
  if (code === 3) return "04d"
  if (code === 45 || code === 48) return "50d"
  if (code >= 51 && code <= 57) return "09d"
  if (code >= 61 && code <= 67) return "10d"
  if (code >= 71 && code <= 77) return "13d"
  if (code >= 80 && code <= 82) return "09d"
  if (code >= 85 && code <= 86) return "13d"
  if (code >= 95) return "11d"
  return "04d"
}

/** Estimated visibility from WMO code (km) */
function wmoVisibilityKm(code: number): number {
  if (code === 45 || code === 48) return 0.5
  if (code >= 51 && code <= 57) return 3
  if (code === 61 || code === 63) return 5
  if (code === 65 || code === 67) return 2
  if (code >= 71 && code <= 77) return 4
  if (code === 80 || code === 81) return 6
  if (code === 82) return 2
  if (code >= 85 && code <= 86) return 4
  if (code >= 95) return 3
  return 10
}

function isThunderstorm(code: number) { return code >= 95 }
function isHeavyRain(code: number) { return [65, 67, 82].includes(code) }

// ── helpers ────────────────────────────────────────────────────
function haversineKm(lat1: number, lon1: number, lat2: number, lon2: number) {
  const R = 6371
  const dLat = ((lat2 - lat1) * Math.PI) / 180
  const dLon = ((lon2 - lon1) * Math.PI) / 180
  const a =
    Math.sin(dLat / 2) ** 2 +
    Math.cos((lat1 * Math.PI) / 180) * Math.cos((lat2 * Math.PI) / 180) * Math.sin(dLon / 2) ** 2
  return R * 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a))
}

function getNearestAirport(lat: number, lon: number) {
  let nearest = AIRPORTS[0]
  let minDist = haversineKm(lat, lon, AIRPORTS[0].lat, AIRPORTS[0].lon)
  for (const ap of AIRPORTS.slice(1)) {
    const d = haversineKm(lat, lon, ap.lat, ap.lon)
    if (d < minDist) { minDist = d; nearest = ap }
  }
  return { airport: nearest, distKm: minDist }
}

function getWeatherIcon(iconCode: string, size = "h-8 w-8") {
  if (iconCode.includes("01")) return <Sun className={`${size} text-yellow-400`} />
  if (iconCode.includes("02") || iconCode.includes("03") || iconCode.includes("04")) return <Cloud className={`${size} text-muted-foreground`} />
  if (iconCode.includes("09") || iconCode.includes("10")) return <CloudRain className={`${size} text-blue-400`} />
  if (iconCode.includes("11")) return <Zap className={`${size} text-yellow-500`} />
  if (iconCode.includes("13")) return <CloudSnow className={`${size} text-blue-200`} />
  if (iconCode.includes("50")) return <Cloud className={`${size} text-gray-400`} />
  return <Cloud className={`${size} text-muted-foreground`} />
}

function windDirection(deg: number) {
  const dirs = ["N", "NE", "E", "SE", "S", "SW", "W", "NW"]
  return dirs[Math.round(deg / 45) % 8]
}

/** Parse ISO local time string from Open-Meteo: "2026-03-18T06:12" → "06:12" */
function formatTimeISO(isoStr: string) {
  return isoStr?.split("T")[1]?.substring(0, 5) ?? "—"
}

// ── METAR helpers ─────────────────────────────────────────────
/** Aviation Weather API returns visib in statute miles, or "9999" for ≥10km */
function parseVisibilitySM(visib: string | number): number {
  if (!visib) return 10
  const s = String(visib)
  if (s === "9999" || s.startsWith("P")) return 10
  const n = parseFloat(s)
  return isNaN(n) ? 10 : Math.min(n * 1.60934, 10) // SM → km
}

function parseMetarTime(reportTime: string) {
  if (!reportTime) return "—"
  try {
    // Avoid double-appending Z if already present
    const iso = reportTime.endsWith("Z") || reportTime.includes("+") ? reportTime : reportTime + "Z"
    const d = new Date(iso)
    if (isNaN(d.getTime())) return reportTime.length >= 16 ? reportTime.substring(11, 16) : reportTime
    return d.toLocaleTimeString("en-GB", {
      hour: "2-digit", minute: "2-digit", timeZone: "Africa/Kigali",
    }) + " GMT+2"
  } catch {
    return reportTime.length >= 16 ? reportTime.substring(11, 16) : reportTime
  }
}

function cloudCoverLabel(cvg: string): string {
  switch (cvg?.toUpperCase()) {
    case "FEW": return "Few"
    case "SCT": return "Scattered"
    case "BKN": return "Broken ⚠"
    case "OVC": return "Overcast ⚠"
    default: return cvg ?? ""
  }
}

// ── types ──────────────────────────────────────────────────────
interface WeatherData {
  location: string
  lat: number
  lon: number
  temp: number
  feelsLike: number
  humidity: number
  windSpeed: number   // km/h
  windDir: number
  visibilityKm: number
  pressure: number
  weatherCode: number
  cloudCover: number  // 0–100 %
  sunrise: string     // "HH:MM"
  sunset: string      // "HH:MM"
  forecast: ForecastItem[]
}

interface ForecastItem {
  date: string
  temp: { min: number; max: number }
  weatherCode: number
  windSpeed: number   // km/h
  pop: number         // 0–100
}

interface MetarEntry {
  icaoId: string
  name: string
  rawOb: string
  reportTime: string
  temp: number
  dewp: number
  wdir: number | string
  wspd: number        // knots
  wgst?: number
  visib: string
  altim: number
  wxString?: string
  clouds?: Array<{ cover: string; base: number }>
}

interface TafEntry {
  icaoId: string
  rawTAF: string
  issueTime: string
}

interface MetarApiResponse {
  metar: MetarEntry[]
  taf: TafEntry[]
  fetchedAt: string
  cached?: boolean
  stale?: boolean
}

type LocationMode = "district" | "gps" | "custom"

// ── Open-Meteo fetch (via server-side proxy to avoid CSP) ─────
async function fetchOpenMeteo(lat: number, lon: number): Promise<WeatherData & { rawLocation: string }> {
  const params = new URLSearchParams({
    latitude: lat.toString(),
    longitude: lon.toString(),
    current: [
      "temperature_2m", "relative_humidity_2m", "apparent_temperature",
      "weather_code", "pressure_msl", "wind_speed_10m", "wind_direction_10m",
      "cloud_cover", "precipitation",
    ].join(","),
    daily: [
      "weather_code", "temperature_2m_max", "temperature_2m_min",
      "sunrise", "sunset", "precipitation_probability_max", "wind_speed_10m_max",
    ].join(","),
    wind_speed_unit: "kmh",
    timezone: "Africa/Kigali",
    forecast_days: "5",
  })

  const res = await fetch(`/api/weather/forecast?${params.toString()}`)
  if (!res.ok) throw new Error(`Weather API error: ${res.status}`)
  const data = await res.json()

  const c = data.current
  const d = data.daily
  const code: number = c.weather_code

  const forecast: ForecastItem[] = (d.time as string[]).map((date: string, i: number) => ({
    date,
    temp: { min: d.temperature_2m_min[i], max: d.temperature_2m_max[i] },
    weatherCode: d.weather_code[i],
    windSpeed: d.wind_speed_10m_max[i],
    pop: d.precipitation_probability_max[i] ?? 0,
  }))

  return {
    rawLocation: "",
    location: "",
    lat, lon,
    temp: c.temperature_2m,
    feelsLike: c.apparent_temperature,
    humidity: c.relative_humidity_2m,
    windSpeed: c.wind_speed_10m,
    windDir: c.wind_direction_10m,
    visibilityKm: wmoVisibilityKm(code),
    pressure: c.pressure_msl,
    weatherCode: code,
    cloudCover: c.cloud_cover,
    sunrise: formatTimeISO(d.sunrise[0]),
    sunset: formatTimeISO(d.sunset[0]),
    forecast,
  }
}

// ── component ─────────────────────────────────────────────────
export default function WeatherPage() {
  const [mode, setMode] = useState<LocationMode>("district")
  const [selectedDistrict, setSelectedDistrict] = useState(RWANDA_DISTRICTS[0])
  const [districtSearch, setDistrictSearch] = useState("")
  const [customLat, setCustomLat] = useState("")
  const [customLon, setCustomLon] = useState("")
  const [customName, setCustomName] = useState("")
  const [gpsLoading, setGpsLoading] = useState(false)
  const [gpsCoords, setGpsCoords] = useState<{ lat: number; lon: number; label: string } | null>(null)
  const [weather, setWeather] = useState<WeatherData | null>(null)
  const [metarData, setMetarData] = useState<MetarApiResponse | null>(null)
  const [loading, setLoading] = useState(false)
  const [metarLoading, setMetarLoading] = useState(false)
  const [error, setError] = useState("")
  const [lastUpdated, setLastUpdated] = useState<Date | null>(null)

  const filteredDistricts = districtSearch
    ? RWANDA_DISTRICTS.filter(d => d.name.toLowerCase().includes(districtSearch.toLowerCase()))
    : RWANDA_DISTRICTS

  const getCoords = (): { lat: number; lon: number; label: string } | null => {
    if (mode === "district") return { lat: selectedDistrict.lat, lon: selectedDistrict.lon, label: selectedDistrict.name }
    if (mode === "gps") return gpsCoords
    if (mode === "custom") {
      const lat = parseFloat(customLat)
      const lon = parseFloat(customLon)
      if (!isNaN(lat) && !isNaN(lon)) return { lat, lon, label: customName || `${lat.toFixed(4)}, ${lon.toFixed(4)}` }
    }
    return null
  }

  const detectGPS = () => {
    if (!navigator.geolocation) { setError("GPS not supported by your browser"); return }
    setGpsLoading(true)
    setError("")
    navigator.geolocation.getCurrentPosition(
      pos => {
        const { latitude: lat, longitude: lon } = pos.coords
        let nearest = RWANDA_DISTRICTS[0]
        let minDist = haversineKm(lat, lon, nearest.lat, nearest.lon)
        for (const d of RWANDA_DISTRICTS.slice(1)) {
          const dist = haversineKm(lat, lon, d.lat, d.lon)
          if (dist < minDist) { minDist = dist; nearest = d }
        }
        setGpsCoords({ lat, lon, label: `My location (near ${nearest.name})` })
        setGpsLoading(false)
        setMode("gps")
      },
      err => { setError(`GPS error: ${err.message}`); setGpsLoading(false) },
      { timeout: 10000, maximumAge: 60000 }
    )
  }

  // Fetch METAR/TAF once (cached server-side for 30 min)
  const fetchMetar = useCallback(async () => {
    setMetarLoading(true)
    try {
      const res = await fetch("/api/weather/metar")
      if (res.ok) setMetarData(await res.json())
    } catch {
      // Non-fatal: METAR is supplementary
    } finally {
      setMetarLoading(false)
    }
  }, [])

  const fetchWeather = useCallback(async () => {
    const coords = getCoords()
    if (!coords) return
    setLoading(true)
    setError("")
    try {
      const data = await fetchOpenMeteo(coords.lat, coords.lon)
      setWeather({ ...data, location: coords.label })
      setLastUpdated(new Date())
    } catch (err: any) {
      setError(err.message || "Failed to fetch weather data")
    } finally {
      setLoading(false)
    }
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [mode, selectedDistrict, gpsCoords, customLat, customLon, customName])

  useEffect(() => { fetchWeather() }, [fetchWeather])
  useEffect(() => { fetchMetar() }, [fetchMetar])

  const getSafetyChecks = (w: WeatherData) => [
    { label: "Wind speed", pass: w.windSpeed < 40, value: `${w.windSpeed.toFixed(0)} km/h`, limit: "< 40 km/h" },
    { label: "Visibility (est.)", pass: w.visibilityKm >= 5, value: `${w.visibilityKm.toFixed(0)} km`, limit: "≥ 5 km" },
    { label: "No thunderstorm", pass: !isThunderstorm(w.weatherCode), value: wmoDescription(w.weatherCode), limit: "No thunderstorm" },
    { label: "No heavy rain", pass: !isHeavyRain(w.weatherCode), value: wmoDescription(w.weatherCode), limit: "No heavy rain" },
  ]

  // Find METAR entry closest to selected location
  const nearestMetar = metarData?.metar?.length
    ? metarData.metar.reduce<MetarEntry | null>((best, m) => {
        if (!best) return m
        const dBest = haversineKm(weather?.lat ?? 0, weather?.lon ?? 0,
          AIRPORTS.find(a => a.icao === best.icaoId)?.lat ?? 0,
          AIRPORTS.find(a => a.icao === best.icaoId)?.lon ?? 0)
        const dCurr = haversineKm(weather?.lat ?? 0, weather?.lon ?? 0,
          AIRPORTS.find(a => a.icao === m.icaoId)?.lat ?? 0,
          AIRPORTS.find(a => a.icao === m.icaoId)?.lon ?? 0)
        return dCurr < dBest ? m : best
      }, null)
    : null

  return (
    <div className="max-w-4xl mx-auto py-6 px-4 space-y-6">
      {/* Header */}
      <div className="flex items-start justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold">Weather Briefing</h1>
          <p className="text-muted-foreground text-sm">
            Pre-flight weather · <span className="text-xs">Open-Meteo forecast + Aviation Weather METAR/TAF</span>
          </p>
        </div>
        <div className="flex items-center gap-2">
          {lastUpdated && (
            <span className="text-xs text-muted-foreground flex items-center gap-1">
              <Clock className="h-3 w-3" />
              {lastUpdated.toLocaleTimeString("en-GB", { hour: "2-digit", minute: "2-digit" })}
            </span>
          )}
          <Button variant="outline" size="icon" onClick={() => { fetchWeather(); fetchMetar() }} disabled={loading}>
            <RefreshCw className={`h-4 w-4 ${loading ? "animate-spin" : ""}`} />
          </Button>
        </div>
      </div>

      {/* Location selector */}
      <Card>
        <CardContent className="pt-5 space-y-4">
          <div className="flex gap-2 flex-wrap">
            <Button size="sm" variant={mode === "district" ? "default" : "outline"} onClick={() => setMode("district")}>
              <MapPin className="h-3.5 w-3.5 mr-1.5" /> District
            </Button>
            <Button size="sm" variant={mode === "gps" ? "default" : "outline"} onClick={detectGPS} disabled={gpsLoading}>
              {gpsLoading ? <Loader2 className="h-3.5 w-3.5 mr-1.5 animate-spin" /> : <LocateFixed className="h-3.5 w-3.5 mr-1.5" />}
              {gpsLoading ? "Detecting…" : "Use my GPS"}
            </Button>
            <Button size="sm" variant={mode === "custom" ? "default" : "outline"} onClick={() => setMode("custom")}>
              <Search className="h-3.5 w-3.5 mr-1.5" /> Custom Coordinates
            </Button>
          </div>

          {mode === "district" && (
            <div className="space-y-2">
              <div className="relative">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                <Input className="pl-9" placeholder="Search district…" value={districtSearch}
                  onChange={e => setDistrictSearch(e.target.value)} />
              </div>
              <Select value={selectedDistrict.name} onValueChange={v => {
                const d = RWANDA_DISTRICTS.find(d => d.name === v)
                if (d) { setSelectedDistrict(d); setDistrictSearch("") }
              }}>
                <SelectTrigger><SelectValue /></SelectTrigger>
                <SelectContent>
                  {filteredDistricts.map(d => (
                    <SelectItem key={d.name} value={d.name}>{d.name}</SelectItem>
                  ))}
                  {filteredDistricts.length === 0 && (
                    <div className="px-3 py-2 text-sm text-muted-foreground">No districts found</div>
                  )}
                </SelectContent>
              </Select>
            </div>
          )}

          {mode === "gps" && gpsCoords && (
            <div className="flex items-center gap-2 text-sm text-muted-foreground bg-muted/40 rounded-lg px-3 py-2">
              <LocateFixed className="h-4 w-4 text-primary shrink-0" />
              <span>{gpsCoords.label}</span>
              <span className="text-xs ml-auto">{gpsCoords.lat.toFixed(5)}, {gpsCoords.lon.toFixed(5)}</span>
            </div>
          )}

          {mode === "custom" && (
            <div className="grid sm:grid-cols-3 gap-3">
              <div className="space-y-1">
                <Label htmlFor="clat">Latitude</Label>
                <Input id="clat" type="number" step="0.0001" placeholder="-1.9441" value={customLat}
                  onChange={e => setCustomLat(e.target.value)} />
              </div>
              <div className="space-y-1">
                <Label htmlFor="clon">Longitude</Label>
                <Input id="clon" type="number" step="0.0001" placeholder="30.0619" value={customLon}
                  onChange={e => setCustomLon(e.target.value)} />
              </div>
              <div className="space-y-1">
                <Label htmlFor="clabel">Label (optional)</Label>
                <Input id="clabel" placeholder="My flight site" value={customName}
                  onChange={e => setCustomName(e.target.value)} />
              </div>
              <div className="sm:col-span-3">
                <Button size="sm" onClick={fetchWeather} disabled={!customLat || !customLon || loading}>
                  {loading ? <Loader2 className="h-3.5 w-3.5 mr-1.5 animate-spin" /> : <Search className="h-3.5 w-3.5 mr-1.5" />}
                  Get weather for these coordinates
                </Button>
              </div>
            </div>
          )}
        </CardContent>
      </Card>

      {error && <Alert variant="destructive"><AlertDescription>{error}</AlertDescription></Alert>}

      {loading && (
        <div className="flex items-center justify-center py-16">
          <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
        </div>
      )}

      {weather && !loading && (() => {
        const checks = getSafetyChecks(weather)
        const safe = checks.every(c => c.pass)
        const { airport: nearestAirport, distKm } = getNearestAirport(weather.lat, weather.lon)
        const inBan = distKm <= nearestAirport.banKm
        const inAdvisory = distKm <= nearestAirport.advisoryKm && !inBan
        const icon = wmoToIcon(weather.weatherCode)

        return (
          <>
            {/* Nearest airport */}
            <Alert className={inBan ? "border-red-500 bg-red-50 dark:bg-red-950/20" : inAdvisory ? "border-orange-400 bg-orange-50 dark:bg-orange-950/20" : "border-border"}>
              <Plane className={`h-4 w-4 ${inBan ? "text-red-500" : inAdvisory ? "text-orange-500" : "text-muted-foreground"}`} />
              <AlertDescription className={inBan ? "text-red-800 dark:text-red-300" : inAdvisory ? "text-orange-800 dark:text-orange-300" : ""}>
                <span className="font-medium">Nearest airport:</span> {nearestAirport.name} ({nearestAirport.icao}) — <strong>{distKm.toFixed(1)} km away</strong>
                {inBan && (
                  <span className="ml-2">
                    <Badge className="bg-red-100 text-red-800 dark:bg-red-900/30 dark:text-red-400">⛔ Inside {nearestAirport.banKm}km full-ban zone</Badge>
                    <span className="block text-sm mt-1">Flying here requires written CAA authorization.</span>
                  </span>
                )}
                {inAdvisory && (
                  <span className="ml-2">
                    <Badge className="bg-orange-100 text-orange-800 dark:bg-orange-900/30 dark:text-orange-400">⚠ Inside {nearestAirport.advisoryKm}km advisory zone</Badge>
                    <span className="block text-sm mt-1">Prior notification to Rwanda CAA required before flying.</span>
                  </span>
                )}
                {!inBan && !inAdvisory && (
                  <Badge variant="outline" className="ml-2 text-xs">Outside restricted zones ✓</Badge>
                )}
              </AlertDescription>
            </Alert>

            {/* Current conditions */}
            <div className="grid sm:grid-cols-3 gap-4">
              <Card className="sm:col-span-2">
                <CardContent className="pt-6">
                  <div className="flex items-start justify-between">
                    <div>
                      <p className="text-sm text-muted-foreground flex items-center gap-1 mb-1">
                        <MapPin className="h-3.5 w-3.5" /> {weather.location}
                      </p>
                      <div className="flex items-end gap-2">
                        <span className="text-5xl font-bold">{weather.temp.toFixed(0)}°C</span>
                        {getWeatherIcon(icon, "h-10 w-10")}
                      </div>
                      <p className="capitalize text-muted-foreground mt-1">{wmoDescription(weather.weatherCode)}</p>
                      <p className="text-sm text-muted-foreground">Feels like {weather.feelsLike.toFixed(0)}°C · Cloud cover {weather.cloudCover}%</p>
                    </div>
                    <div className="text-right space-y-1 text-sm">
                      <div className="flex items-center justify-end gap-1.5">
                        <Sunrise className="h-4 w-4 text-orange-400" />
                        <span>{weather.sunrise}</span>
                      </div>
                      <div className="flex items-center justify-end gap-1.5">
                        <Sunset className="h-4 w-4 text-orange-600" />
                        <span>{weather.sunset}</span>
                      </div>
                    </div>
                  </div>
                  <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 mt-6 pt-4 border-t">
                    <div className="flex items-center gap-2 text-sm">
                      <Wind className="h-4 w-4 text-blue-400 shrink-0" />
                      <div>
                        <p className="text-muted-foreground text-xs">Wind</p>
                        <p className="font-medium">{weather.windSpeed.toFixed(0)} km/h {windDirection(weather.windDir)}</p>
                      </div>
                    </div>
                    <div className="flex items-center gap-2 text-sm">
                      <Droplets className="h-4 w-4 text-blue-500 shrink-0" />
                      <div>
                        <p className="text-muted-foreground text-xs">Humidity</p>
                        <p className="font-medium">{weather.humidity}%</p>
                      </div>
                    </div>
                    <div className="flex items-center gap-2 text-sm">
                      <Eye className="h-4 w-4 text-green-400 shrink-0" />
                      <div>
                        <p className="text-muted-foreground text-xs">Visibility (est.)</p>
                        <p className="font-medium">
                          {weather.visibilityKm >= 10 ? "≥10 km" : `${weather.visibilityKm.toFixed(0)} km`}
                        </p>
                      </div>
                    </div>
                    <div className="flex items-center gap-2 text-sm">
                      <Gauge className="h-4 w-4 text-purple-400 shrink-0" />
                      <div>
                        <p className="text-muted-foreground text-xs">Pressure</p>
                        <p className="font-medium">{weather.pressure.toFixed(0)} hPa</p>
                      </div>
                    </div>
                  </div>
                </CardContent>
              </Card>

              <Card>
                <CardHeader className="pb-2">
                  <CardTitle className="text-base">Flight Safety</CardTitle>
                </CardHeader>
                <CardContent className="space-y-2">
                  <div className={`rounded-lg p-3 text-center mb-3 ${safe && !inBan ? "bg-green-500/10" : "bg-red-500/10"}`}>
                    {safe && !inBan ? (
                      <>
                        <CheckCircle className="h-6 w-6 text-green-500 mx-auto mb-1" />
                        <p className="font-semibold text-green-600 dark:text-green-400 text-sm">Safe to fly</p>
                      </>
                    ) : (
                      <>
                        <XCircle className="h-6 w-6 text-red-500 mx-auto mb-1" />
                        <p className="font-semibold text-red-600 dark:text-red-400 text-sm">
                          {inBan ? "Airport ban zone" : "Not recommended"}
                        </p>
                      </>
                    )}
                  </div>
                  {checks.map(c => (
                    <div key={c.label} className="flex items-start gap-2 text-xs">
                      {c.pass
                        ? <CheckCircle className="h-4 w-4 text-green-500 shrink-0 mt-0.5" />
                        : <XCircle className="h-4 w-4 text-red-500 shrink-0 mt-0.5" />}
                      <div>
                        <p className="font-medium">{c.label}</p>
                        <p className="text-muted-foreground">{c.value} (limit: {c.limit})</p>
                      </div>
                    </div>
                  ))}
                  {inBan && (
                    <div className="flex items-start gap-2 text-xs">
                      <XCircle className="h-4 w-4 text-red-500 shrink-0 mt-0.5" />
                      <div>
                        <p className="font-medium">Airport restriction</p>
                        <p className="text-muted-foreground">Within {nearestAirport.banKm}km ban zone</p>
                      </div>
                    </div>
                  )}
                </CardContent>
              </Card>
            </div>

            {/* 5-day forecast */}
            <Card>
              <CardHeader><CardTitle className="text-base">5-Day Forecast</CardTitle></CardHeader>
              <CardContent>
                <div className="grid grid-cols-2 sm:grid-cols-5 gap-3">
                  {weather.forecast.map((f, i) => (
                    <div key={f.date} className="text-center p-3 rounded-lg bg-muted/40 space-y-2">
                      <p className="text-xs font-medium text-muted-foreground">
                        {i === 0 ? "Today" : new Date(f.date + "T12:00:00").toLocaleDateString("en-GB", { weekday: "short", day: "numeric" })}
                      </p>
                      <div className="flex justify-center">{getWeatherIcon(wmoToIcon(f.weatherCode))}</div>
                      <div>
                        <p className="font-semibold text-sm">{f.temp.max.toFixed(0)}°</p>
                        <p className="text-xs text-muted-foreground">{f.temp.min.toFixed(0)}°</p>
                      </div>
                      <div className="space-y-1">
                        <div className="flex items-center justify-center gap-1 text-xs text-muted-foreground">
                          <Wind className="h-3 w-3" />{f.windSpeed.toFixed(0)} km/h
                        </div>
                        {f.pop > 20 && (
                          <div className="flex items-center justify-center gap-1 text-xs text-blue-500">
                            <Droplets className="h-3 w-3" />{f.pop}%
                          </div>
                        )}
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>

            {/* METAR / TAF section */}
            <Card>
              <CardHeader>
                <CardTitle className="text-base flex items-center gap-2">
                  <Radio className="h-4 w-4" />
                  Aviation Weather — METAR / TAF
                  {metarData?.cached && (
                    <Badge variant="outline" className="text-xs font-normal">cached</Badge>
                  )}
                  {metarData?.stale && (
                    <Badge variant="outline" className="text-xs font-normal text-orange-500">stale</Badge>
                  )}
                  {metarLoading && <Loader2 className="h-3.5 w-3.5 animate-spin text-muted-foreground" />}
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                {metarData?.metar && metarData.metar.length > 0 ? (
                  <>
                    {/* All airport METARs */}
                    <div className="space-y-3">
                      {metarData.metar
                        .filter(m => m.icaoId && m.rawOb)
                        .map((m, idx) => {
                          const ap = AIRPORTS.find(a => a.icao === m.icaoId)
                          const windKmh = m.wspd ? (m.wspd * 1.852).toFixed(0) : "—"
                          const gustKmh = m.wgst ? ` G${(m.wgst * 1.852).toFixed(0)}` : ""
                          const visKm = parseVisibilitySM(m.visib)
                          const isNearest = nearestMetar?.icaoId === m.icaoId
                          return (
                            <div key={`${m.icaoId}-${idx}`} className={`rounded-lg border p-3 space-y-2 ${isNearest ? "border-primary/40 bg-primary/5" : ""}`}>
                              <div className="flex items-center justify-between flex-wrap gap-2">
                                <div className="flex items-center gap-2">
                                  <Plane className="h-4 w-4 text-muted-foreground" />
                                  <span className="font-semibold">{m.icaoId}</span>
                                  <span className="text-sm text-muted-foreground">{m.name || ap?.name}</span>
                                  {isNearest && <Badge variant="secondary" className="text-xs">Nearest</Badge>}
                                </div>
                                <span className="text-xs text-muted-foreground">{parseMetarTime(m.reportTime)}</span>
                              </div>

                              {/* Raw METAR */}
                              <code className="block text-xs bg-muted/60 rounded px-2 py-1.5 font-mono break-all">
                                {m.rawOb}
                              </code>

                              {/* Parsed summary */}
                              <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 text-xs">
                                <div>
                                  <p className="text-muted-foreground">Wind</p>
                                  <p className="font-medium">
                                    {m.wdir === "VRB" ? "Variable" : `${m.wdir}°`} {windKmh}{gustKmh} km/h
                                  </p>
                                </div>
                                <div>
                                  <p className="text-muted-foreground">Visibility</p>
                                  <p className="font-medium">{visKm >= 10 ? "≥10 km" : `${visKm.toFixed(1)} km`}</p>
                                </div>
                                <div>
                                  <p className="text-muted-foreground">Temp / Dew</p>
                                  <p className="font-medium">{m.temp}° / {m.dewp}°C</p>
                                </div>
                                <div>
                                  <p className="text-muted-foreground">QNH</p>
                                  <p className="font-medium">{m.altim ? `${m.altim.toFixed(0)} hPa` : "—"}</p>
                                </div>
                              </div>

                              {/* Cloud layers */}
                              {m.clouds && m.clouds.length > 0 && (
                                <div className="flex flex-wrap gap-2">
                                  {m.clouds.map((cl, idx) => (
                                    <Badge key={idx} variant="outline" className="text-xs font-mono">
                                      {cloudCoverLabel(cl.cover)} {cl.base ? `${cl.base}ft` : ""}
                                    </Badge>
                                  ))}
                                </div>
                              )}

                              {/* Present weather */}
                              {m.wxString && (
                                <p className="text-xs text-orange-600 dark:text-orange-400">
                                  ⚠ Present weather: {m.wxString}
                                </p>
                              )}
                            </div>
                          )
                        })}
                    </div>

                    {/* TAF */}
                    {metarData.taf && metarData.taf.length > 0 && (
                      <div className="space-y-2">
                        <p className="text-sm font-semibold flex items-center gap-1.5">
                          <FileText className="h-4 w-4" /> TAF — HRYR Kigali
                        </p>
                        {metarData.taf.map(t => (
                          <div key={t.icaoId} className="space-y-1">
                            <code className="block text-xs bg-muted/60 rounded px-2 py-2 font-mono break-all whitespace-pre-wrap leading-relaxed">
                              {t.rawTAF}
                            </code>
                            {t.issueTime && (
                              <p className="text-xs text-muted-foreground">
                                Issued: {parseMetarTime(t.issueTime)}
                              </p>
                            )}
                          </div>
                        ))}
                      </div>
                    )}

                    <p className="text-xs text-muted-foreground border-t pt-2">
                      Source: <a href="https://aviationweather.gov" target="_blank" rel="noopener" className="underline">aviationweather.gov</a>
                      {" · "}Cached for 30 min · Updated {metarData.fetchedAt ? new Date(metarData.fetchedAt).toLocaleTimeString("en-GB", { hour: "2-digit", minute: "2-digit" }) : "—"}
                    </p>
                  </>
                ) : (
                  <div className="text-sm text-muted-foreground">
                    {metarLoading ? "Fetching aviation weather…" : "METAR data unavailable — check aviationweather.gov directly."}
                    <p className="mt-2 text-xs">
                      ICAO codes: HRYR (Kigali), HRZA (Kamembe), HRHU (Huye)
                    </p>
                  </div>
                )}
              </CardContent>
            </Card>

            {/* Rwanda flying tips */}
            <Card>
              <CardHeader><CardTitle className="text-base">Rwanda Flying Tips</CardTitle></CardHeader>
              <CardContent>
                <div className="grid sm:grid-cols-2 gap-4 text-sm text-muted-foreground">
                  <div>
                    <p className="font-semibold text-foreground mb-1">Best flying windows</p>
                    <ul className="space-y-1">
                      <li>• Early morning (6–10am): calmest winds</li>
                      <li>• Long dry season: Jun–Sep (ideal)</li>
                      <li>• Short dry season: Dec–Feb (good)</li>
                    </ul>
                  </div>
                  <div>
                    <p className="font-semibold text-foreground mb-1">Avoid</p>
                    <ul className="space-y-1">
                      <li>• 1–5pm in rainy season (thunderstorms)</li>
                      <li>• Near Volcanoes Park (turbulence, mist)</li>
                      <li>• After heavy rain (visibility, mud)</li>
                    </ul>
                  </div>
                </div>
                <p className="text-xs text-muted-foreground mt-3 border-t pt-3">
                  Forecast: <a href="https://open-meteo.com" target="_blank" rel="noopener" className="underline">Open-Meteo</a> (open-source, no API key required)
                  {" · "}METAR/TAF: <a href="https://aviationweather.gov" target="_blank" rel="noopener" className="underline">US NWS Aviation Weather Center</a>
                </p>
              </CardContent>
            </Card>
          </>
        )
      })()}
    </div>
  )
}
