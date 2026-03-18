"use client"

import { useState, useEffect } from "react"

// Force dynamic rendering
export const dynamic = 'force-dynamic'
import Link from "next/link"
import { Button } from "@/components/ui/button"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import {
  Star,
  MapPin,
  Phone,
  Mail,
  Globe,
  Plus,
  BadgeCheck,
  ChevronRight,
  ArrowRight,
  Briefcase,
} from "lucide-react"

interface Service {
  id: string
  title: string
  description: string
  category: string
  region: string
  contact: string
  phone?: string
  email?: string
  website?: string
  services?: string
  rating: number
  reviewCount: number
  isApproved: boolean
  isFeatured: boolean
  createdAt: string
  provider: {
    id: string
    fullName: string
    avatar?: string
    organization?: string
    isVerified: boolean
  }
}

const SERVICE_CATEGORIES = [
  "all",
  "Mapping & Surveying",
  "Photography & Videography",
  "Agriculture",
  "Repair & Maintenance",
  "Training & Education",
  "Inspection Services",
]

const REGIONS = [
  { value: "all", label: "All Locations" },
  { value: "KIGALI_NYARUGENGE", label: "Kigali – Nyarugenge" },
  { value: "KIGALI_KICUKIRO", label: "Kigali – Kicukiro" },
  { value: "KIGALI_GASABO", label: "Kigali – Gasabo" },
  { value: "NORTH_MUSANZE", label: "Musanze" },
  { value: "SOUTH_HUYE", label: "Huye" },
]

export default function ServicesPage() {
  const [services, setServices] = useState<Service[]>([])
  const [loading, setLoading] = useState(true)
  const [category, setCategory] = useState("all")
  const [region, setRegion] = useState("all")

  // Prevent hydration mismatch by ensuring client-side rendering
  const [mounted, setMounted] = useState(false)

  useEffect(() => {
    setMounted(true)
  }, [])

  const fetchServices = async () => {
    try {
      const params = new URLSearchParams()
      if (category && category !== "all") params.append("category", category)
      if (region && region !== "all") params.append("region", region)

      const response = await fetch(`/api/services?${params.toString()}`)
      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`)
      }
      const data = await response.json()
      setServices(data.services || [])
    } catch (error) {
      console.error("Error fetching services:", error)
      setServices([])
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    if (mounted) {
      fetchServices()
    }
  }, [category, region, mounted])

  if (!mounted) {
    return (
      <div className="min-h-screen">
        <div className="rounded-2xl bg-muted animate-pulse h-56 mb-8" />
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5">
          {[...Array(6)].map((_, i) => (
            <div key={i} className="rounded-2xl bg-muted animate-pulse h-72" />
          ))}
        </div>
      </div>
    )
  }

  const formatRegion = (r: string) =>
    r.replace(/_/g, " ").replace(/\b\w/g, (l) => l.toUpperCase())

  const renderStars = (rating: number) =>
    Array.from({ length: 5 }, (_, i) => {
      const filled = i + 1 <= rating
      return (
        <Star
          key={i}
          className={`h-3.5 w-3.5 ${
            filled
              ? "fill-yellow-400 text-yellow-400"
              : "text-muted-foreground/40"
          }`}
        />
      )
    })

  const getInitials = (name: string) =>
    name
      .split(" ")
      .map((n) => n[0])
      .join("")
      .toUpperCase()
      .slice(0, 2)

  // ─── Service card ─────────────────────────────────────────────────────────
  const ServiceCard = ({ service }: { service: Service }) => {
    let serviceList: string[] = []
    try {
      serviceList = service.services ? JSON.parse(service.services) : []
    } catch {
      serviceList = []
    }

    const displayName =
      service.provider.organization || service.provider.fullName

    return (
      <div className="group bg-card rounded-2xl overflow-hidden border border-border/40 hover:border-[#0096FC]/30 hover:shadow-xl hover:shadow-[#002674]/5 transition-all duration-300 flex flex-col">
        {/* Cover strip with avatar */}
        <div className="relative h-20 bg-gradient-to-r from-[#002674] to-[#0096FC]">
          {/* Decorative circles */}
          <div className="absolute -top-6 -right-6 w-24 h-24 rounded-full bg-white/5" />
          <div className="absolute bottom-0 left-8 w-16 h-16 rounded-full bg-white/5" />

          {/* Featured badge */}
          {service.isFeatured && (
            <span className="absolute top-3 right-3 px-2.5 py-1 text-xs font-semibold rounded-full bg-white/20 text-white backdrop-blur-sm">
              Featured
            </span>
          )}

          {/* Avatar — positioned to overlap the cover + body boundary */}
          <div className="absolute -bottom-7 left-5">
            <Avatar className="h-14 w-14 ring-4 ring-card">
              <AvatarImage
                src={service.provider.avatar}
                alt={displayName}
              />
              <AvatarFallback className="bg-[#002674] text-white font-bold text-lg">
                {getInitials(displayName)}
              </AvatarFallback>
            </Avatar>
          </div>
        </div>

        {/* Body */}
        <div className="px-5 pt-10 pb-5 flex flex-col flex-1">
          {/* Name + verified */}
          <div className="flex items-start justify-between gap-2 mb-1">
            <div className="flex items-center gap-1.5 min-w-0">
              <h3 className="font-bold text-base text-foreground group-hover:text-[#0096FC] transition-colors truncate">
                {displayName}
              </h3>
              {service.provider.isVerified && (
                <BadgeCheck className="h-4 w-4 text-[#0096FC] shrink-0" />
              )}
            </div>
          </div>

          {/* Title / service type */}
          <p className="text-sm text-muted-foreground line-clamp-1 mb-3">
            {service.title}
          </p>

          {/* Category pill */}
          <span className="self-start px-2.5 py-1 text-xs font-semibold rounded-full bg-[#002674]/10 text-[#002674] dark:bg-[#0096FC]/10 dark:text-[#0096FC] mb-3">
            {service.category}
          </span>

          {/* Rating */}
          <div className="flex items-center gap-1.5 mb-3">
            <div className="flex items-center gap-0.5">
              {renderStars(service.rating)}
            </div>
            <span className="text-xs font-semibold text-foreground">
              {service.rating.toFixed(1)}
            </span>
            <span className="text-xs text-muted-foreground">
              ({service.reviewCount} review{service.reviewCount !== 1 ? "s" : ""})
            </span>
          </div>

          {/* Location */}
          <div className="flex items-center gap-1.5 text-xs text-muted-foreground mb-3">
            <MapPin className="h-3.5 w-3.5 text-[#0096FC] shrink-0" />
            <span>{formatRegion(service.region)}</span>
          </div>

          {/* Description */}
          <p className="text-sm text-muted-foreground line-clamp-2 mb-4 flex-1">
            {service.description}
          </p>

          {/* Service tags */}
          {serviceList.length > 0 && (
            <div className="flex flex-wrap gap-1.5 mb-4">
              {serviceList.slice(0, 3).map((item: string, idx: number) => (
                <span
                  key={idx}
                  className="px-2.5 py-0.5 text-xs font-medium rounded-full bg-muted text-muted-foreground"
                >
                  {item}
                </span>
              ))}
              {serviceList.length > 3 && (
                <span className="px-2.5 py-0.5 text-xs font-medium rounded-full bg-muted text-muted-foreground">
                  +{serviceList.length - 3} more
                </span>
              )}
            </div>
          )}

          {/* Divider */}
          <div className="border-t border-border/40 pt-4 mt-auto">
            {/* Contact icons row */}
            <div className="flex items-center gap-3 mb-3">
              {service.phone && (
                <a
                  href={`tel:${service.phone}`}
                  className="flex items-center gap-1 text-xs text-muted-foreground hover:text-[#0096FC] transition-colors"
                  title={service.phone}
                >
                  <Phone className="h-3.5 w-3.5" />
                  <span className="truncate max-w-[80px]">{service.phone}</span>
                </a>
              )}
              {service.email && (
                <a
                  href={`mailto:${service.email}`}
                  className="flex items-center gap-1 text-xs text-muted-foreground hover:text-[#0096FC] transition-colors"
                  title={service.email}
                >
                  <Mail className="h-3.5 w-3.5" />
                  <span className="truncate max-w-[80px]">{service.email}</span>
                </a>
              )}
              {service.website && (
                <a
                  href={service.website}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="flex items-center gap-1 text-xs text-muted-foreground hover:text-[#0096FC] transition-colors"
                  title={service.website}
                >
                  <Globe className="h-3.5 w-3.5" />
                  <span className="truncate max-w-[80px]">Website</span>
                </a>
              )}
            </div>

            {/* View profile button */}
            <Link href={`/services/${service.id}`}>
              <Button
                size="sm"
                className="w-full rounded-full bg-[#002674] hover:bg-[#002674]/90 text-white group/btn text-xs"
              >
                <span>View Profile</span>
                <span className="relative ml-1.5 inline-flex items-center">
                  <ChevronRight className="h-3.5 w-3.5 opacity-100 group-hover/btn:opacity-0 transition-opacity absolute" />
                  <ArrowRight className="h-3.5 w-3.5 opacity-0 group-hover/btn:opacity-100 transition-opacity" />
                </span>
              </Button>
            </Link>
          </div>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen">
      {/* ── Hero ─────────────────────────────────────────────────────────── */}
      <div className="relative overflow-hidden bg-brand-gradient py-14 px-6 mb-8 rounded-2xl">
        <div className="absolute -top-12 -right-12 w-64 h-64 rounded-full bg-white/5 pointer-events-none" />
        <div className="absolute -bottom-8 -left-8 w-48 h-48 rounded-full bg-white/5 pointer-events-none" />
        <div className="absolute top-1/2 right-1/4 w-32 h-32 rounded-full bg-[#0096FC]/20 pointer-events-none" />

        <div className="relative max-w-3xl">
          <div className="flex items-center gap-2 mb-3">
            <div className="w-px h-5 bg-[#0096FC]" />
            <span className="text-[#0096FC] text-sm font-semibold uppercase tracking-widest">
              Service Directory
            </span>
          </div>
          <h1 className="text-3xl sm:text-4xl font-extrabold text-white mb-3 leading-tight">
            Drone Service Providers
          </h1>
          <p className="text-white/75 text-base mb-6 max-w-xl">
            Connect with trusted drone professionals, operators, and specialists
            across Rwanda.
          </p>
          <Link href="/services/new">
            <Button
              size="lg"
              className="bg-white text-[#002674] hover:bg-white/90 rounded-full font-semibold"
            >
              <Plus className="h-4 w-4 mr-2" />
              List Your Service
            </Button>
          </Link>
        </div>
      </div>

      {/* ── Filter bar ───────────────────────────────────────────────────── */}
      <div className="flex flex-col sm:flex-row gap-3 mb-6 flex-wrap items-start">
        {/* Category pills */}
        <div className="flex gap-2 flex-wrap items-center flex-1">
          {SERVICE_CATEGORIES.map((cat) => (
            <button
              key={cat}
              onClick={() => setCategory(cat)}
              className={`px-4 py-2 rounded-full text-sm font-medium transition-all ${
                category === cat
                  ? "bg-[#002674] text-white shadow-sm"
                  : "bg-muted hover:bg-muted/80 text-foreground"
              }`}
            >
              {cat === "all" ? "All Services" : cat}
            </button>
          ))}
        </div>

        {/* Region select — pill buttons */}
        <div className="flex gap-2 flex-wrap items-center">
          {REGIONS.map((r) => (
            <button
              key={r.value}
              onClick={() => setRegion(r.value)}
              className={`px-4 py-2 rounded-full text-sm font-medium transition-all ${
                region === r.value
                  ? "bg-[#0096FC] text-white shadow-sm"
                  : "bg-muted hover:bg-muted/80 text-foreground"
              }`}
            >
              {r.label}
            </button>
          ))}
        </div>
      </div>

      {/* ── Results count ────────────────────────────────────────────────── */}
      <p className="text-sm text-muted-foreground mb-4">
        Showing{" "}
        <span className="font-semibold text-foreground">{services.length}</span>{" "}
        {services.length === 1 ? "provider" : "providers"}
      </p>

      {/* ── Grid ─────────────────────────────────────────────────────────── */}
      {loading ? (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5">
          {[...Array(6)].map((_, i) => (
            <div
              key={i}
              className="rounded-2xl bg-muted animate-pulse h-80"
            />
          ))}
        </div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5">
          {services.map((service) => (
            <ServiceCard key={service.id} service={service} />
          ))}
        </div>
      )}

      {/* ── Empty state ──────────────────────────────────────────────────── */}
      {services.length === 0 && !loading && (
        <div className="text-center py-16">
          <div className="w-16 h-16 rounded-2xl bg-[#002674]/10 flex items-center justify-center mx-auto mb-4">
            <Briefcase className="h-8 w-8 text-[#002674] dark:text-[#0096FC]" />
          </div>
          <h3 className="text-lg font-bold mb-2">No services found</h3>
          <p className="text-muted-foreground text-sm mb-6">
            Try a different category or region, or be the first to list a
            service.
          </p>
          <Link href="/services/new">
            <Button className="rounded-full bg-[#002674] hover:bg-[#002674]/90 text-white">
              <Plus className="h-4 w-4 mr-2" />
              List Your Service
            </Button>
          </Link>
        </div>
      )}

      {/* ── CTA Banner ───────────────────────────────────────────────────── */}
      <div className="mt-12 rounded-2xl bg-brand-gradient p-8 text-center relative overflow-hidden">
        <div className="absolute -top-8 -right-8 w-48 h-48 rounded-full bg-white/5 pointer-events-none" />
        <div className="absolute -bottom-6 -left-6 w-36 h-36 rounded-full bg-white/5 pointer-events-none" />
        <div className="relative">
          <h2 className="text-2xl font-extrabold text-white mb-2">
            Don&apos;t See Your Service Listed?
          </h2>
          <p className="text-white/75 mb-6 text-sm max-w-md mx-auto">
            Join our directory and connect with drone enthusiasts and operators
            across Rwanda.
          </p>
          <Link href="/services/new">
            <Button
              size="lg"
              className="bg-white text-[#002674] hover:bg-white/90 rounded-full font-semibold"
            >
              Add Your Service
            </Button>
          </Link>
        </div>
      </div>
    </div>
  )
}
