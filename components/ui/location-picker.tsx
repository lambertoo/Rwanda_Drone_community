"use client"

import { useState, useEffect, useMemo, useRef } from "react"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"

// Rwanda administrative data: Province → Districts
const RWANDA_DATA: Record<string, string[]> = {
  Kigali: ["Nyarugenge", "Kicukiro", "Gasabo"],
  South: ["Huye", "Nyamagabe", "Nyaruguru", "Muhanga", "Kamonyi", "Gisagara", "Nyanza", "Ruhango"],
  North: ["Musanze", "Gicumbi", "Rulindo", "Burera", "Gakenke"],
  East: ["Kayonza", "Ngoma", "Kirehe", "Nyagatare", "Bugesera", "Rwamagana", "Gatsibo"],
  West: ["Rubavu", "Rusizi", "Nyamasheke", "Rutsiro", "Karongi", "Ngororero", "Nyabihu"],
}

// Countries with flags — Rwanda and neighbors first
const COUNTRIES = [
  { code: "RW", name: "Rwanda", flag: "🇷🇼" },
  { code: "BI", name: "Burundi", flag: "🇧🇮" },
  { code: "CD", name: "DR Congo", flag: "🇨🇩" },
  { code: "KE", name: "Kenya", flag: "🇰🇪" },
  { code: "TZ", name: "Tanzania", flag: "🇹🇿" },
  { code: "UG", name: "Uganda", flag: "🇺🇬" },
  { code: "ET", name: "Ethiopia", flag: "🇪🇹" },
  { code: "NG", name: "Nigeria", flag: "🇳🇬" },
  { code: "ZA", name: "South Africa", flag: "🇿🇦" },
  { code: "GH", name: "Ghana", flag: "🇬🇭" },
  { code: "CM", name: "Cameroon", flag: "🇨🇲" },
  { code: "SN", name: "Senegal", flag: "🇸🇳" },
  { code: "CI", name: "Ivory Coast", flag: "🇨🇮" },
  { code: "EG", name: "Egypt", flag: "🇪🇬" },
  { code: "MA", name: "Morocco", flag: "🇲🇦" },
  { code: "US", name: "United States", flag: "🇺🇸" },
  { code: "GB", name: "United Kingdom", flag: "🇬🇧" },
  { code: "FR", name: "France", flag: "🇫🇷" },
  { code: "DE", name: "Germany", flag: "🇩🇪" },
  { code: "CA", name: "Canada", flag: "🇨🇦" },
  { code: "AU", name: "Australia", flag: "🇦🇺" },
  { code: "IN", name: "India", flag: "🇮🇳" },
  { code: "CN", name: "China", flag: "🇨🇳" },
  { code: "JP", name: "Japan", flag: "🇯🇵" },
  { code: "AE", name: "UAE", flag: "🇦🇪" },
  { code: "SA", name: "Saudi Arabia", flag: "🇸🇦" },
  { code: "BR", name: "Brazil", flag: "🇧🇷" },
  { code: "OTHER", name: "Other", flag: "🌍" },
]

// Searchable country dropdown
function CountryDropdown({ value, onChange, disabled }: { value: string; onChange: (code: string) => void; disabled?: boolean }) {
  const [open, setOpen] = useState(false)
  const [search, setSearch] = useState("")
  const ref = useRef<HTMLDivElement>(null)
  const inputRef = useRef<HTMLInputElement>(null)

  useEffect(() => {
    function handleClick(e: MouseEvent) {
      if (ref.current && !ref.current.contains(e.target as Node)) setOpen(false)
    }
    document.addEventListener("mousedown", handleClick)
    return () => document.removeEventListener("mousedown", handleClick)
  }, [])

  const selected = COUNTRIES.find((c) => c.code === value)
  const filtered = search
    ? COUNTRIES.filter((c) => c.name.toLowerCase().includes(search.toLowerCase()) || c.code.toLowerCase().includes(search.toLowerCase()))
    : COUNTRIES

  return (
    <div ref={ref} className="relative">
      <button
        type="button"
        onClick={() => { if (!disabled) { setOpen(!open); setTimeout(() => inputRef.current?.focus(), 50) } }}
        disabled={disabled}
        className="flex items-center justify-between w-full h-9 rounded-md border border-input bg-background px-3 text-sm hover:bg-accent transition-colors disabled:opacity-50"
      >
        {selected ? <span>{selected.flag} {selected.name}</span> : <span className="text-muted-foreground">Select country</span>}
        <svg width="12" height="12" viewBox="0 0 12 12" className="ml-2 opacity-50"><path d="M2 4l4 4 4-4" stroke="currentColor" strokeWidth="1.5" fill="none" /></svg>
      </button>
      {open && (
        <div className="absolute z-50 mt-1 w-full rounded-md border bg-popover shadow-lg">
          <div className="p-2 border-b">
            <input
              ref={inputRef}
              type="text"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="Search country..."
              className="w-full h-8 px-2 text-sm rounded border border-input bg-background focus:outline-none focus:ring-2 focus:ring-ring"
              autoComplete="off"
            />
          </div>
          <div className="max-h-56 overflow-y-auto p-1">
            {filtered.length === 0 ? (
              <p className="p-2 text-sm text-muted-foreground text-center">No countries found</p>
            ) : (
              filtered.map((c) => (
                <button
                  key={c.code}
                  type="button"
                  onClick={() => { onChange(c.code); setSearch(""); setOpen(false) }}
                  className={`flex items-center gap-2 w-full px-2 py-1.5 text-sm rounded hover:bg-accent transition-colors ${value === c.code ? "bg-accent font-medium" : ""}`}
                >
                  <span>{c.flag}</span><span>{c.name}</span>
                </button>
              ))
            )}
          </div>
        </div>
      )}
    </div>
  )
}

interface LocationPickerProps {
  value: string // stored as "Country|Province|District" or "Country|Freeform"
  onChange: (value: string) => void
  disabled?: boolean
}

function parseLocation(value: string) {
  if (!value) return { country: "RW", province: "", district: "", freeform: "" }
  const parts = value.split("|")
  if (parts.length === 3) return { country: parts[0], province: parts[1], district: parts[2], freeform: "" }
  if (parts.length === 2) return { country: parts[0], province: "", district: "", freeform: parts[1] }
  // Legacy enum values like KIGALI_GASABO
  if (value.includes("_")) {
    const [prov, dist] = value.split("_")
    const provMap: Record<string, string> = { KIGALI: "Kigali", SOUTH: "South", NORTH: "North", EAST: "East", WEST: "West" }
    const province = provMap[prov] || ""
    const district = dist ? dist.charAt(0) + dist.slice(1).toLowerCase() : ""
    return { country: "RW", province, district, freeform: "" }
  }
  return { country: "RW", province: "", district: "", freeform: value }
}

export function LocationPicker({ value, onChange, disabled }: LocationPickerProps) {
  const parsed = useMemo(() => parseLocation(value), [value])
  const [country, setCountry] = useState(parsed.country)
  const [province, setProvince] = useState(parsed.province)
  const [district, setDistrict] = useState(parsed.district)
  const [freeform, setFreeform] = useState(parsed.freeform)

  useEffect(() => {
    const p = parseLocation(value)
    setCountry(p.country)
    setProvince(p.province)
    setDistrict(p.district)
    setFreeform(p.freeform)
  }, []) // eslint-disable-line react-hooks/exhaustive-deps

  const isRwanda = country === "RW"
  const districts = isRwanda && province ? RWANDA_DATA[province] || [] : []

  const emit = (c: string, p: string, d: string, f: string) => {
    if (c === "RW") {
      onChange(p && d ? `${c}|${p}|${d}` : c)
    } else {
      onChange(f ? `${c}|${f}` : c)
    }
  }

  return (
    <div className="space-y-3">
      <CountryDropdown
        value={country}
        onChange={(c) => {
          setCountry(c)
          setProvince("")
          setDistrict("")
          setFreeform("")
          emit(c, "", "", "")
        }}
        disabled={disabled}
      />

      {isRwanda ? (
        <div className="grid grid-cols-2 gap-3">
          <div>
            <Label className="text-sm">Province</Label>
            <select
              value={province}
              onChange={(e) => { const p = e.target.value; setProvince(p); setDistrict(""); emit(country, p, "", "") }}
              disabled={disabled}
              className="w-full h-9 rounded-md border border-input bg-background px-3 text-sm focus:outline-none focus:ring-2 focus:ring-ring"
            >
              <option value="">Select province</option>
              {Object.keys(RWANDA_DATA).map((p) => <option key={p} value={p}>{p}</option>)}
            </select>
          </div>
          <div>
            <Label className="text-sm">District</Label>
            <select
              value={district}
              onChange={(e) => { const d = e.target.value; setDistrict(d); emit(country, province, d, "") }}
              disabled={disabled || !province}
              className="w-full h-9 rounded-md border border-input bg-background px-3 text-sm focus:outline-none focus:ring-2 focus:ring-ring disabled:opacity-50"
            >
              <option value="">Select district</option>
              {districts.map((d) => <option key={d} value={d}>{d}</option>)}
            </select>
          </div>
        </div>
      ) : (
        <div>
          <Label className="text-sm">City / Region</Label>
          <Input
            value={freeform}
            onChange={(e) => { const f = e.target.value; setFreeform(f); emit(country, "", "", f) }}
            placeholder="Enter your city or region"
            disabled={disabled}
          />
        </div>
      )}
    </div>
  )
}

/** Format stored location value for display */
export function formatLocation(value: string | null | undefined): string {
  if (!value) return ""
  const parts = value.split("|")
  if (parts.length === 3) {
    const countryName = COUNTRIES.find((c) => c.code === parts[0])?.name || parts[0]
    return `${parts[1]} - ${parts[2]}, ${countryName}`
  }
  if (parts.length === 2) {
    const countryName = COUNTRIES.find((c) => c.code === parts[0])?.name || parts[0]
    return `${parts[1]}, ${countryName}`
  }
  if (value.includes("_")) {
    const [prov, dist] = value.split("_")
    return `${prov.charAt(0) + prov.slice(1).toLowerCase()} - ${dist.charAt(0) + dist.slice(1).toLowerCase()}, Rwanda`
  }
  return value
}
