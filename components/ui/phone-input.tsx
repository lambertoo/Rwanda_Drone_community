"use client"

import { useState, useEffect, useMemo } from "react"
import { Input } from "@/components/ui/input"
import {
  parsePhoneNumberFromString,
  getCountries,
  getCountryCallingCode,
  type CountryCode,
} from "libphonenumber-js"

// Country data with flag emoji
function getFlagEmoji(countryCode: string) {
  return countryCode
    .toUpperCase()
    .replace(/./g, (c) => String.fromCodePoint(0x1f1e6 - 65 + c.charCodeAt(0)))
}

interface PhoneInputProps {
  value: string
  onChange: (value: string, isValid: boolean) => void
  disabled?: boolean
  required?: boolean
  defaultCountry?: CountryCode
}

export function PhoneInput({
  value,
  onChange,
  disabled,
  required,
  defaultCountry = "RW",
}: PhoneInputProps) {
  const [country, setCountry] = useState<CountryCode>(defaultCountry)
  const [localNumber, setLocalNumber] = useState("")
  const [isValid, setIsValid] = useState(true)
  const [touched, setTouched] = useState(false)

  // Build sorted country list
  const countries = useMemo(() => {
    const list = getCountries().map((code) => ({
      code,
      callingCode: getCountryCallingCode(code),
      flag: getFlagEmoji(code),
    }))
    // Put Rwanda first, then sort by country code
    list.sort((a, b) => {
      if (a.code === "RW") return -1
      if (b.code === "RW") return 1
      return a.code.localeCompare(b.code)
    })
    return list
  }, [])

  // Parse incoming value on mount
  useEffect(() => {
    if (value && value.startsWith("+")) {
      const parsed = parsePhoneNumberFromString(value)
      if (parsed) {
        setCountry(parsed.country || defaultCountry)
        setLocalNumber(parsed.nationalNumber)
        return
      }
    }
    if (value && !value.startsWith("+")) {
      setLocalNumber(value)
    }
  }, []) // eslint-disable-line react-hooks/exhaustive-deps

  const handleNumberChange = (num: string) => {
    // Strip non-digits
    const digits = num.replace(/[^\d]/g, "")
    setLocalNumber(digits)
    setTouched(true)

    const callingCode = getCountryCallingCode(country)
    const fullNumber = `+${callingCode}${digits}`
    const parsed = parsePhoneNumberFromString(fullNumber, country)
    const valid = parsed ? parsed.isValid() : false
    setIsValid(valid || digits.length === 0)
    onChange(fullNumber, valid)
  }

  const handleCountryChange = (newCountry: CountryCode) => {
    setCountry(newCountry)
    const callingCode = getCountryCallingCode(newCountry)
    const fullNumber = `+${callingCode}${localNumber}`
    const parsed = parsePhoneNumberFromString(fullNumber, newCountry)
    const valid = parsed ? parsed.isValid() : false
    setIsValid(valid || localNumber.length === 0)
    onChange(fullNumber, valid)
  }

  const callingCode = getCountryCallingCode(country)

  return (
    <div className="space-y-1">
      <div className="flex gap-2">
        <select
          value={country}
          onChange={(e) => handleCountryChange(e.target.value as CountryCode)}
          disabled={disabled}
          className="h-9 rounded-md border border-input bg-background px-2 text-sm focus:outline-none focus:ring-2 focus:ring-ring min-w-[120px]"
        >
          {countries.map((c) => (
            <option key={c.code} value={c.code}>
              {c.flag} {c.code} +{c.callingCode}
            </option>
          ))}
        </select>
        <Input
          type="tel"
          value={localNumber}
          onChange={(e) => handleNumberChange(e.target.value)}
          placeholder="Phone number"
          disabled={disabled}
          required={required}
          className={touched && !isValid && localNumber.length > 0 ? "border-red-500 focus-visible:ring-red-500" : ""}
        />
      </div>
      {touched && !isValid && localNumber.length > 0 && (
        <p className="text-xs text-red-500">
          Invalid phone number for {country} (+{callingCode})
        </p>
      )}
    </div>
  )
}
