"use client"

import { useState } from "react"
import { useRouter } from "next/navigation"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Textarea } from "@/components/ui/textarea"
import { Alert, AlertDescription } from "@/components/ui/alert"
import { Loader, Eye, EyeOff, Shield, Users, Plane, GraduationCap, Wrench, Camera } from "lucide-react"
import Link from "next/link"

const roleInfo = {
  hobbyist: {
    name: "Hobbyist",
    description: "Drone enthusiasts and recreational pilots",
    icon: Camera,
    color: "bg-blue-100 text-blue-800 dark:bg-blue-900/30 dark:text-blue-400",
  },
  pilot: {
    name: "Commercial Pilot",
    description: "Licensed commercial drone pilots",
    icon: Plane,
    color: "bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-400",
  },
  student: {
    name: "Student",
    description: "Students and researchers",
    icon: GraduationCap,
    color: "bg-orange-100 text-orange-800 dark:bg-orange-900/30 dark:text-orange-400",
  },
  service_provider: {
    name: "Service Provider",
    description: "Drone services and maintenance",
    icon: Wrench,
    color: "bg-indigo-100 text-indigo-800 dark:bg-indigo-900/30 dark:text-indigo-400",
  },
}

export default function RegisterPage() {
  const router = useRouter()
  const [formData, setFormData] = useState({
    fullName: "",
    email: "",
    username: "",
    password: "",
    confirmPassword: "",
    role: "",
    organization: "",
    bio: "",
    location: "",
    pilotLicense: "",
    experience: "",
    website: "",
    phone: "",
  })
  const [showPassword, setShowPassword] = useState(false)
  const [showConfirmPassword, setShowConfirmPassword] = useState(false)
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState("")

  const handleInputChange = (field: string, value: string) => {
    setFormData(prev => ({ ...prev, [field]: value }))
    setError("")
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setIsLoading(true)
    setError("")

    // Basic validation
    if (!formData.fullName || !formData.email || !formData.username || !formData.password || !formData.role) {
      setError("Please fill in all required fields")
      setIsLoading(false)
      return
    }

    if (formData.password !== formData.confirmPassword) {
      setError("Passwords do not match")
      setIsLoading(false)
      return
    }

    if (formData.password.length < 8) {
      setError("Password must be at least 8 characters long")
      setIsLoading(false)
      return
    }

    // Check password complexity
    const passwordRegex = /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)/
    if (!passwordRegex.test(formData.password)) {
      setError("Password must contain at least 1 uppercase letter, 1 lowercase letter, and 1 number")
      setIsLoading(false)
      return
    }

    try {
      const response = await fetch("/api/auth/register", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(formData),
      })

      const data = await response.json()

      if (response.ok) {
        // Redirect to login page
        router.push("/login?message=Registration successful! Please sign in.")
      } else {
        if (data.details && Array.isArray(data.details)) {
          const errorMessages = data.details.map((err: any) => err.message).join(", ")
          setError(`Validation failed: ${errorMessages}`)
        } else {
          setError(data.error || "Registration failed")
        }
      }
    } catch (err) {
      setError("Network error. Please try again.")
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-green-50 dark:from-gray-900 dark:via-gray-800 dark:to-gray-900 flex items-center justify-center p-4">
      <Card className="w-full max-w-2xl">
        <CardHeader className="text-center">
          <CardTitle className="text-2xl">Join Rwanda Drone Community</CardTitle>
          <CardDescription>Create your account and connect with the drone community</CardDescription>
        </CardHeader>
        <CardContent className="space-y-6">
          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="grid md:grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="fullName">Full Name *</Label>
                <Input
                  id="fullName"
                  placeholder="Enter your full name"
                  value={formData.fullName}
                  onChange={(e) => handleInputChange("fullName", e.target.value)}
                  required
                  disabled={isLoading}
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="username">Username *</Label>
                <Input
                  id="username"
                  placeholder="Choose a username"
                  value={formData.username}
                  onChange={(e) => handleInputChange("username", e.target.value)}
                  required
                  disabled={isLoading}
                />
              </div>
            </div>

            <div className="space-y-2">
              <Label htmlFor="email">Email Address *</Label>
              <Input
                id="email"
                type="email"
                placeholder="Enter your email"
                value={formData.email}
                onChange={(e) => handleInputChange("email", e.target.value)}
                required
                disabled={isLoading}
              />
            </div>

            <div className="grid md:grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="password">Password *</Label>
                <div className="relative">
                  <Input
                    id="password"
                    type={showPassword ? "text" : "password"}
                    placeholder="Create a password"
                    value={formData.password}
                    onChange={(e) => handleInputChange("password", e.target.value)}
                    required
                    disabled={isLoading}
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="absolute right-3 top-1/2 transform -translate-y-1/2 text-muted-foreground hover:text-foreground"
                  >
                    {showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                  </button>
                </div>
              </div>

              <div className="space-y-2">
                <Label htmlFor="confirmPassword">Confirm Password *</Label>
                <div className="relative">
                  <Input
                    id="confirmPassword"
                    type={showConfirmPassword ? "text" : "password"}
                    placeholder="Confirm your password"
                    value={formData.confirmPassword}
                    onChange={(e) => handleInputChange("confirmPassword", e.target.value)}
                    required
                    disabled={isLoading}
                  />
                  <button
                    type="button"
                    onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                    className="absolute right-3 top-1/2 transform -translate-y-1/2 text-muted-foreground hover:text-foreground"
                  >
                    {showConfirmPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                  </button>
                </div>
              </div>
            </div>

            <div className="space-y-2">
              <Label htmlFor="role">Role *</Label>
              <Select
                value={formData.role}
                onValueChange={(value) => handleInputChange("role", value)}
                disabled={isLoading}
              >
                <SelectTrigger>
                  <SelectValue placeholder="Select your role" />
                </SelectTrigger>
                <SelectContent>
                  {Object.entries(roleInfo)
                    .map(([role, info]) => {
                      const IconComponent = info.icon
                      return (
                        <SelectItem key={role} value={role}>
                          <div className="flex items-center gap-2">
                            <div className={`p-1 rounded ${info.color}`}>
                              <IconComponent className="h-3 w-3" />
                            </div>
                            <span>{info.name}</span>
                          </div>
                        </SelectItem>
                      )
                    })}
                </SelectContent>
              </Select>
              <p className="text-xs text-muted-foreground">
                Note: Administrator and Regulator roles are assigned by system administrators only.
              </p>
            </div>

            <div className="grid md:grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="organization">Organization</Label>
                <Input
                  id="organization"
                  placeholder="Your organization or company"
                  value={formData.organization}
                  onChange={(e) => handleInputChange("organization", e.target.value)}
                  disabled={isLoading}
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="location">Location</Label>
                <Select
                  value={formData.location}
                  onValueChange={(value) => handleInputChange("location", value)}
                  disabled={isLoading}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Select your location" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="KIGALI_NYARUGENGE">Kigali - Nyarugenge</SelectItem>
                    <SelectItem value="KIGALI_KICUKIRO">Kigali - Kicukiro</SelectItem>
                    <SelectItem value="KIGALI_GASABO">Kigali - Gasabo</SelectItem>
                    <SelectItem value="SOUTH_HUYE">South - Huye</SelectItem>
                    <SelectItem value="SOUTH_NYAMAGABE">South - Nyamagabe</SelectItem>
                    <SelectItem value="SOUTH_NYARUGURU">South - Nyaruguru</SelectItem>
                    <SelectItem value="SOUTH_MUHANGA">South - Muhanga</SelectItem>
                    <SelectItem value="SOUTH_KAMONYI">South - Kamonyi</SelectItem>
                    <SelectItem value="SOUTH_GISAGARA">South - Gisagara</SelectItem>
                    <SelectItem value="SOUTH_NYANZA">South - Nyanza</SelectItem>
                    <SelectItem value="SOUTH_RUHANGO">South - Ruhango</SelectItem>
                    <SelectItem value="NORTH_MUSANZE">North - Musanze</SelectItem>
                    <SelectItem value="NORTH_GICUMBI">North - Gicumbi</SelectItem>
                    <SelectItem value="NORTH_RULINDO">North - Rulindo</SelectItem>
                    <SelectItem value="NORTH_BURERA">North - Burera</SelectItem>
                    <SelectItem value="NORTH_GAKENKE">North - Gakenke</SelectItem>
                    <SelectItem value="EAST_KAYONZA">East - Kayonza</SelectItem>
                    <SelectItem value="EAST_NGOMA">East - Ngoma</SelectItem>
                    <SelectItem value="EAST_KIREHE">East - Kirehe</SelectItem>
                    <SelectItem value="EAST_NYAGATARE">East - Nyagatare</SelectItem>
                    <SelectItem value="EAST_BUGESERA">East - Bugesera</SelectItem>
                    <SelectItem value="EAST_RWAMAGANA">East - Rwamagana</SelectItem>
                    <SelectItem value="EAST_GATSIBO">East - Gatsibo</SelectItem>
                    <SelectItem value="WEST_RUBAVU">West - Rubavu</SelectItem>
                    <SelectItem value="WEST_RUSIZI">West - Rusizi</SelectItem>
                    <SelectItem value="WEST_NYAMASHEKE">West - Nyamasheke</SelectItem>
                    <SelectItem value="WEST_RUTSIRO">West - Rutsiro</SelectItem>
                    <SelectItem value="WEST_KARONGI">West - Karongi</SelectItem>
                    <SelectItem value="WEST_NGORORERO">West - Ngororero</SelectItem>
                    <SelectItem value="WEST_NYABIHU">West - Nyabihu</SelectItem>
                    <SelectItem value="UNKNOWN">Unknown</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="website">Website (Optional)</Label>
                <Input
                  id="website"
                  type="url"
                  placeholder="https://yourwebsite.com"
                  value={formData.website}
                  onChange={(e) => handleInputChange("website", e.target.value)}
                  disabled={isLoading}
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="phone">Phone Number (Optional)</Label>
                <Input
                  id="phone"
                  type="tel"
                  placeholder="+250 123 456 789"
                  value={formData.phone}
                  onChange={(e) => handleInputChange("phone", e.target.value)}
                  disabled={isLoading}
                />
              </div>
            </div>

            {formData.role === "pilot" && (
              <div className="space-y-2">
                <Label htmlFor="pilotLicense">Pilot License Number</Label>
                <Input
                  id="pilotLicense"
                  placeholder="Enter your pilot license number"
                  value={formData.pilotLicense}
                  onChange={(e) => handleInputChange("pilotLicense", e.target.value)}
                  disabled={isLoading}
                />
              </div>
            )}

            <div className="space-y-2">
              <Label htmlFor="experience">Experience Level</Label>
              <Select
                value={formData.experience}
                onValueChange={(value) => handleInputChange("experience", value)}
                disabled={isLoading}
              >
                <SelectTrigger>
                  <SelectValue placeholder="Select your experience level" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="beginner">Beginner (0-1 years)</SelectItem>
                  <SelectItem value="intermediate">Intermediate (1-3 years)</SelectItem>
                  <SelectItem value="advanced">Advanced (3-5 years)</SelectItem>
                  <SelectItem value="expert">Expert (5+ years)</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2">
              <Label htmlFor="bio">Bio</Label>
              <Textarea
                id="bio"
                placeholder="Tell us about yourself and your interest in drones..."
                value={formData.bio}
                onChange={(e) => handleInputChange("bio", e.target.value)}
                rows={3}
                disabled={isLoading}
              />
            </div>

            {error && (
              <Alert variant="destructive">
                <AlertDescription>{error}</AlertDescription>
              </Alert>
            )}

            <Button
              type="submit"
              className="w-full"
              size="lg"
              disabled={isLoading}
            >
              {isLoading ? (
                <>
                  <Loader className="mr-2 h-4 w-4 animate-spin" />
                  Creating Account...
                </>
              ) : (
                "Create Account"
              )}
            </Button>
          </form>

          <div className="text-center">
            <p className="text-sm text-muted-foreground">
              Already have an account?{" "}
              <Link href="/login" className="text-blue-600 hover:underline">
                Sign in here
              </Link>
            </p>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
