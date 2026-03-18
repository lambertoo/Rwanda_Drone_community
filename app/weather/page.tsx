"use client"

import { useState, useEffect, useCallback } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Alert, AlertDescription } from "@/components/ui/alert"
import {
  Loader2, Wind, Thermometer, Eye, Droplets, Gauge, CloudRain,
  Sun, Cloud, CloudSnow, Zap, RefreshCw, CheckCircle, XCircle,
  AlertTriangle, MapPin, Clock, Sunrise, Sunset
} from "lucide-react"

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

interface WeatherData {
  location: string
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

export default function WeatherPage() {
  const [selectedDistrict, setSelectedDistrict] = useState(RWANDA_DISTRICTS[0])
  const [weather, setWeather] = useState<WeatherData | null>(null)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState("")
  const [lastUpdated, setLastUpdated] = useState<Date | null>(null)

  const apiKey = process.env.NEXT_PUBLIC_OPENWEATHER_API_KEY

  const fetchWeather = useCallback(async () => {
    if (!apiKey) return
    setLoading(true)
    setError("")

    try {
      const [current, forecast] = await Promise.all([
        fetch(
          `https://api.openweathermap.org/data/2.5/weather?lat=${selectedDistrict.lat}&lon=${selectedDistrict.lon}&appid=${apiKey}&units=metric`
        ).then(r => r.json()),
        fetch(
          `https://api.openweathermap.org/data/2.5/forecast?lat=${selectedDistrict.lat}&lon=${selectedDistrict.lon}&appid=${apiKey}&units=metric&cnt=32`
        ).then(r => r.json()),
      ])

      if (current.cod !== 200) throw new Error(current.message || "Failed to fetch weather")

      // Extract daily forecast (one per day at noon)
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
        location: selectedDistrict.name,
        temp: current.main.temp,
        feelsLike: current.main.feels_like,
        humidity: current.main.humidity,
        windSpeed: current.wind.speed * 3.6, // m/s to km/h
        windDir: current.wind.deg || 0,
        visibility: current.visibility / 1000, // m to km
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
  }, [selectedDistrict, apiKey])

  useEffect(() => {
    fetchWeather()
  }, [fetchWeather])

  const getSafetyChecks = (w: WeatherData): SafetyCheck[] => [
    {
      label: "Wind speed",
      pass: w.windSpeed < 40,
      value: `${w.windSpeed.toFixed(0)} km/h`,
      limit: "< 40 km/h",
    },
    {
      label: "Visibility",
      pass: w.visibility >= 5,
      value: `${w.visibility.toFixed(1)} km`,
      limit: "≥ 5 km",
    },
    {
      label: "No thunderstorm",
      pass: !w.description.toLowerCase().includes("thunder"),
      value: w.description,
      limit: "No thunderstorm",
    },
    {
      label: "No heavy rain",
      pass: !w.description.toLowerCase().includes("heavy"),
      value: w.description,
      limit: "No heavy rain",
    },
  ]

  const isFlightSafe = (checks: SafetyCheck[]) => checks.every(c => c.pass)

  return (
    <div className="max-w-4xl mx-auto py-6 px-4 space-y-6">
      {/* Header */}
      <div className="flex items-start justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold">Weather Briefing</h1>
          <p className="text-muted-foreground text-sm">Pre-flight weather conditions across Rwanda</p>
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

      {/* District selector */}
      <div className="flex items-center gap-3">
        <MapPin className="h-4 w-4 text-muted-foreground shrink-0" />
        <Select
          value={selectedDistrict.name}
          onValueChange={v => {
            const d = RWANDA_DISTRICTS.find(d => d.name === v)
            if (d) setSelectedDistrict(d)
          }}
        >
          <SelectTrigger className="w-72">
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            {RWANDA_DISTRICTS.map(d => (
              <SelectItem key={d.name} value={d.name}>{d.name}</SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>

      {/* No API key */}
      {!apiKey && (
        <Alert>
          <AlertTriangle className="h-4 w-4" />
          <AlertDescription>
            <p className="font-medium mb-1">Weather API key not configured</p>
            <p className="text-sm">
              Add <code className="bg-muted px-1 rounded">NEXT_PUBLIC_OPENWEATHER_API_KEY</code> to your{" "}
              <code className="bg-muted px-1 rounded">.env</code> file.
              Get a free key at{" "}
              <span className="font-medium">openweathermap.org</span> (free tier: 60 calls/min).
            </p>
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

      {error && (
        <Alert variant="destructive">
          <AlertDescription>{error}</AlertDescription>
        </Alert>
      )}

      {loading && (
        <div className="flex items-center justify-center py-16">
          <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
        </div>
      )}

      {weather && !loading && (
        <>
          {/* Current conditions */}
          <div className="grid sm:grid-cols-3 gap-4">
            {/* Main weather card */}
            <Card className="sm:col-span-2">
              <CardContent className="pt-6">
                <div className="flex items-start justify-between">
                  <div>
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

            {/* Safety panel */}
            <Card>
              <CardHeader className="pb-2">
                <CardTitle className="text-base">Flight Safety</CardTitle>
              </CardHeader>
              <CardContent className="space-y-2">
                {(() => {
                  const checks = getSafetyChecks(weather)
                  const safe = isFlightSafe(checks)
                  return (
                    <>
                      <div className={`rounded-lg p-3 text-center mb-3 ${safe ? "bg-green-500/10" : "bg-red-500/10"}`}>
                        {safe ? (
                          <>
                            <CheckCircle className="h-6 w-6 text-green-500 mx-auto mb-1" />
                            <p className="font-semibold text-green-600 dark:text-green-400 text-sm">Safe to fly</p>
                          </>
                        ) : (
                          <>
                            <XCircle className="h-6 w-6 text-red-500 mx-auto mb-1" />
                            <p className="font-semibold text-red-600 dark:text-red-400 text-sm">Not recommended</p>
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
                    </>
                  )
                })()}
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
      )}
    </div>
  )
}
