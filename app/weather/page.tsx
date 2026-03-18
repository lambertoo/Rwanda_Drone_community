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

// Rwanda airports — used for proximity reference
const AIRPORTS = [
  { icao: "HRYR", name: "Kigali International Airport", lat: -1.9686, lon: 30.1395, banKm: 5, advisoryKm: 10 },
  { icao: "HRZA", name: "Kamembe Airport (Rusizi)", lat: -2.4620, lon: 28.9077, banKm: 3, advisoryKm: 5 },
  { icao: "HRHU", name: "Huye Airport", lat: -2.6008, lon: 29.7279, banKm: 3, advisoryKm: 5 },
  { icao: "HRMU", name: "Musanze (proposed)", lat: -1.4985, lon: 29.6346, banKm: 2, advisoryKm: 4 },
]

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

function getWeatherIcon(icon: string, size = "h-8 w-8") {
  if (icon.includes("01")) return <Sun className={`${size} text-yellow-400`} />
  if (icon.includes("02") || icon.includes("03") || icon.includes("04")) return <Cloud className={`${size} text-muted-foreground`} />
  if (icon.includes("09") || icon.includes("10")) return <CloudRain className={`${size} text-blue-400`} />
  if (icon.includes("11")) return <Zap className={`${size} text-yellow-500`} />
  if (icon.includes("13")) return <CloudSnow className={`${size} text-blue-200`} />
  return <Cloud className={`${size} text-muted-foreground`} />
}

function windDirection(deg: number) {
  const dirs = ["N", "NE", "E", "SE", "S", "SW", "W", "NW"]
  return dirs[Math.round(deg / 45) % 8]
}

function formatTime(unix: number) {
  return new Date(unix * 1000).toLocaleTimeString("en-GB", { hour: "2-digit", minute: "2-digit" })
}

// ── types ──────────────────────────────────────────────────────
interface WeatherData {
  location: string
  lat: number
  lon: number
  temp: number
  feelsLike: number
  humidity: number
  windSpeed: number
  windDir: number
  visibility: number
  pressure: number
  description: string
  icon: string
  sunrise: number
  sunset: number
  forecast: ForecastItem[]
}

interface ForecastItem {
  dt: number
  temp: { min: number; max: number }
  description: string
  icon: string
  windSpeed: number
  pop: number
}

interface SafetyCheck {
  label: string
  pass: boolean
  value: string
  limit: string
}

type LocationMode = "district" | "gps" | "custom"

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
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState("")
  const [lastUpdated, setLastUpdated] = useState<Date | null>(null)

  const apiKey = process.env.NEXT_PUBLIC_OPENWEATHER_API_KEY

  const filteredDistricts = districtSearch
    ? RWANDA_DISTRICTS.filter(d => d.name.toLowerCase().includes(districtSearch.toLowerCase()))
    : RWANDA_DISTRICTS

  // Get current fetch coordinates
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

  // GPS detection
  const detectGPS = () => {
    if (!navigator.geolocation) {
      setError("GPS not supported by your browser")
      return
    }
    setGpsLoading(true)
    setError("")
    navigator.geolocation.getCurrentPosition(
      pos => {
        const { latitude: lat, longitude: lon } = pos.coords
        // Find nearest district name for labelling
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
      err => {
        setError(`GPS error: ${err.message}`)
        setGpsLoading(false)
      },
      { timeout: 10000, maximumAge: 60000 }
    )
  }

  const fetchWeather = useCallback(async () => {
    if (!apiKey) return
    const coords = getCoords()
    if (!coords) return
    setLoading(true)
    setError("")

    try {
      const [current, forecast] = await Promise.all([
        fetch(
          `https://api.openweathermap.org/data/2.5/weather?lat=${coords.lat}&lon=${coords.lon}&appid=${apiKey}&units=metric`
        ).then(r => r.json()),
        fetch(
          `https://api.openweathermap.org/data/2.5/forecast?lat=${coords.lat}&lon=${coords.lon}&appid=${apiKey}&units=metric&cnt=32`
        ).then(r => r.json()),
      ])

      if (current.cod !== 200) throw new Error(current.message || "Failed to fetch weather")

      const dailyMap: Record<string, any> = {}
      for (const item of forecast.list || []) {
        const date = new Date(item.dt * 1000).toDateString()
        if (!dailyMap[date]) {
          dailyMap[date] = { dt: item.dt, temps: [], descriptions: [], icons: [], winds: [], pops: [] }
        }
        dailyMap[date].temps.push(item.main.temp)
        dailyMap[date].descriptions.push(item.weather[0].description)
        dailyMap[date].icons.push(item.weather[0].icon)
        dailyMap[date].winds.push(item.wind.speed)
        dailyMap[date].pops.push(item.pop || 0)
      }

      const forecastItems: ForecastItem[] = Object.values(dailyMap).slice(0, 5).map((d: any) => ({
        dt: d.dt,
        temp: { min: Math.min(...d.temps), max: Math.max(...d.temps) },
        description: d.descriptions[Math.floor(d.descriptions.length / 2)],
        icon: d.icons[Math.floor(d.icons.length / 2)],
        windSpeed: Math.max(...d.winds),
        pop: Math.max(...d.pops),
      }))

      setWeather({
        location: coords.label,
        lat: coords.lat,
        lon: coords.lon,
        temp: current.main.temp,
        feelsLike: current.main.feels_like,
        humidity: current.main.humidity,
        windSpeed: current.wind.speed * 3.6,
        windDir: current.wind.deg || 0,
        visibility: current.visibility / 1000,
        pressure: current.main.pressure,
        description: current.weather[0].description,
        icon: current.weather[0].icon,
        sunrise: current.sys.sunrise,
        sunset: current.sys.sunset,
        forecast: forecastItems,
      })
      setLastUpdated(new Date())
    } catch (err: any) {
      setError(err.message || "Failed to fetch weather data")
    } finally {
      setLoading(false)
    }
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [mode, selectedDistrict, gpsCoords, customLat, customLon, customName, apiKey])

  useEffect(() => {
    fetchWeather()
  }, [fetchWeather])

  const getSafetyChecks = (w: WeatherData): SafetyCheck[] => [
    { label: "Wind speed", pass: w.windSpeed < 40, value: `${w.windSpeed.toFixed(0)} km/h`, limit: "< 40 km/h" },
    { label: "Visibility", pass: w.visibility >= 5, value: `${w.visibility.toFixed(1)} km`, limit: "≥ 5 km" },
    { label: "No thunderstorm", pass: !w.description.toLowerCase().includes("thunder"), value: w.description, limit: "No thunderstorm" },
    { label: "No heavy rain", pass: !w.description.toLowerCase().includes("heavy"), value: w.description, limit: "No heavy rain" },
  ]

  return (
    <div className="max-w-4xl mx-auto py-6 px-4 space-y-6">
      {/* Header */}
      <div className="flex items-start justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold">Weather Briefing</h1>
          <p className="text-muted-foreground text-sm">Pre-flight weather conditions — search by district, GPS, or custom coordinates</p>
        </div>
        <div className="flex items-center gap-2">
          {lastUpdated && (
            <span className="text-xs text-muted-foreground flex items-center gap-1">
              <Clock className="h-3 w-3" />
              {lastUpdated.toLocaleTimeString("en-GB", { hour: "2-digit", minute: "2-digit" })}
            </span>
          )}
          <Button variant="outline" size="icon" onClick={fetchWeather} disabled={loading || !apiKey}>
            <RefreshCw className={`h-4 w-4 ${loading ? "animate-spin" : ""}`} />
          </Button>
        </div>
      </div>

      {/* Location selector */}
      <Card>
        <CardContent className="pt-5 space-y-4">
          {/* Mode toggle */}
          <div className="flex gap-2 flex-wrap">
            <Button size="sm" variant={mode === "district" ? "default" : "outline"} onClick={() => setMode("district")}>
              <MapPin className="h-3.5 w-3.5 mr-1.5" /> District
            </Button>
            <Button size="sm" variant={mode === "gps" ? "default" : "outline"} onClick={detectGPS} disabled={gpsLoading}>
              {gpsLoading ? <Loader2 className="h-3.5 w-3.5 mr-1.5 animate-spin" /> : <LocateFixed className="h-3.5 w-3.5 mr-1.5" />}
              {gpsLoading ? "Detecting…" : "Use my GPS location"}
            </Button>
            <Button size="sm" variant={mode === "custom" ? "default" : "outline"} onClick={() => setMode("custom")}>
              <Search className="h-3.5 w-3.5 mr-1.5" /> Custom Coordinates
            </Button>
          </div>

          {/* District search + select */}
          {mode === "district" && (
            <div className="space-y-2">
              <div className="relative">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                <Input
                  className="pl-9"
                  placeholder="Search district…"
                  value={districtSearch}
                  onChange={e => setDistrictSearch(e.target.value)}
                />
              </div>
              <Select
                value={selectedDistrict.name}
                onValueChange={v => {
                  const d = RWANDA_DISTRICTS.find(d => d.name === v)
                  if (d) { setSelectedDistrict(d); setDistrictSearch("") }
                }}
              >
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
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

          {/* GPS result */}
          {mode === "gps" && gpsCoords && (
            <div className="flex items-center gap-2 text-sm text-muted-foreground bg-muted/40 rounded-lg px-3 py-2">
              <LocateFixed className="h-4 w-4 text-primary shrink-0" />
              <span>{gpsCoords.label}</span>
              <span className="text-xs ml-auto">{gpsCoords.lat.toFixed(5)}, {gpsCoords.lon.toFixed(5)}</span>
            </div>
          )}

          {/* Custom coords */}
          {mode === "custom" && (
            <div className="grid sm:grid-cols-3 gap-3">
              <div className="space-y-1">
                <Label htmlFor="clat">Latitude</Label>
                <Input id="clat" type="number" step="0.0001" placeholder="-1.9441" value={customLat} onChange={e => setCustomLat(e.target.value)} />
              </div>
              <div className="space-y-1">
                <Label htmlFor="clon">Longitude</Label>
                <Input id="clon" type="number" step="0.0001" placeholder="30.0619" value={customLon} onChange={e => setCustomLon(e.target.value)} />
              </div>
              <div className="space-y-1">
                <Label htmlFor="clabel">Label (optional)</Label>
                <Input id="clabel" placeholder="My flight site" value={customName} onChange={e => setCustomName(e.target.value)} />
              </div>
              <div className="sm:col-span-3">
                <Button size="sm" onClick={fetchWeather} disabled={!customLat || !customLon || loading}>
                  {loading ? <Loader2 className="h-3.5 w-3.5 mr-1.5 animate-spin" /> : <Search className="h-3.5 w-3.5 mr-1.5" />}
                  Get weather for these coordinates
                </Button>
              </div>
              <p className="sm:col-span-3 text-xs text-muted-foreground">
                Tip: right-click any location on Google Maps to copy its coordinates.
              </p>
            </div>
          )}
        </CardContent>
      </Card>

      {/* No API key */}
      {!apiKey && (
        <Alert>
          <AlertTriangle className="h-4 w-4" />
          <AlertDescription>
            <p className="font-medium mb-1">Weather API key not configured</p>
            <p className="text-sm">Add <code className="bg-muted px-1 rounded">NEXT_PUBLIC_OPENWEATHER_API_KEY</code> to your <code className="bg-muted px-1 rounded">.env</code> file.</p>
            <p className="text-sm mt-2 font-medium">Rwanda typical conditions (offline reference):</p>
            <ul className="text-sm mt-1 space-y-1 text-muted-foreground">
              <li>• Kigali (1,567m): 17–26°C, winds 10–20 km/h, two rainy seasons (Mar–May, Oct–Nov)</li>
              <li>• Musanze (1,850m): 12–22°C, stronger winds, occasional mist near volcanoes</li>
              <li>• Best flying: June–September (long dry season), December–February (short dry)</li>
              <li>• Avoid: 1–4pm during rainy season (afternoon thunderstorms common)</li>
            </ul>
          </AlertDescription>
        </Alert>
      )}

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

        return (
          <>
            {/* Nearest airport reference */}
            <Alert className={`${inBan ? "border-red-500 bg-red-50 dark:bg-red-950/20" : inAdvisory ? "border-orange-400 bg-orange-50 dark:bg-orange-950/20" : "border-border"}`}>
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
                        {getWeatherIcon(weather.icon, "h-10 w-10")}
                      </div>
                      <p className="capitalize text-muted-foreground mt-1">{weather.description}</p>
                      <p className="text-sm text-muted-foreground">Feels like {weather.feelsLike.toFixed(0)}°C</p>
                    </div>
                    <div className="text-right space-y-1 text-sm">
                      <div className="flex items-center justify-end gap-1.5">
                        <Sunrise className="h-4 w-4 text-orange-400" />
                        <span>{formatTime(weather.sunrise)}</span>
                      </div>
                      <div className="flex items-center justify-end gap-1.5">
                        <Sunset className="h-4 w-4 text-orange-600" />
                        <span>{formatTime(weather.sunset)}</span>
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
                        <p className="text-muted-foreground text-xs">Visibility</p>
                        <p className="font-medium">{weather.visibility.toFixed(0)} km</p>
                      </div>
                    </div>
                    <div className="flex items-center gap-2 text-sm">
                      <Gauge className="h-4 w-4 text-purple-400 shrink-0" />
                      <div>
                        <p className="text-muted-foreground text-xs">Pressure</p>
                        <p className="font-medium">{weather.pressure} hPa</p>
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
                    <div key={f.dt} className="text-center p-3 rounded-lg bg-muted/40 space-y-2">
                      <p className="text-xs font-medium text-muted-foreground">
                        {i === 0 ? "Today" : new Date(f.dt * 1000).toLocaleDateString("en-GB", { weekday: "short", day: "numeric" })}
                      </p>
                      <div className="flex justify-center">{getWeatherIcon(f.icon)}</div>
                      <div>
                        <p className="font-semibold text-sm">{f.temp.max.toFixed(0)}°</p>
                        <p className="text-xs text-muted-foreground">{f.temp.min.toFixed(0)}°</p>
                      </div>
                      <div className="space-y-1">
                        <div className="flex items-center justify-center gap-1 text-xs text-muted-foreground">
                          <Wind className="h-3 w-3" />{(f.windSpeed * 3.6).toFixed(0)} km/h
                        </div>
                        {f.pop > 0.2 && (
                          <div className="flex items-center justify-center gap-1 text-xs text-blue-500">
                            <Droplets className="h-3 w-3" />{(f.pop * 100).toFixed(0)}%
                          </div>
                        )}
                      </div>
                    </div>
                  ))}
                </div>
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
              </CardContent>
            </Card>
          </>
        )
      })()}
    </div>
  )
}
