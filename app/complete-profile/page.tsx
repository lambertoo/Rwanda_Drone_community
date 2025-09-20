"use client"

import { useState, Suspense, useEffect } from "react"

// Force dynamic rendering
export const dynamic = 'force-dynamic'
import { useRouter } from "next/navigation"
import { useAuth } from "@/lib/auth-context"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Textarea } from "@/components/ui/textarea"
import { Alert, AlertDescription } from "@/components/ui/alert"
import { Loader, Camera, Plane, GraduationCap, Wrench } from "lucide-react"
import { RoleCheck } from "@/components/role-check"

const roleInfo = {
  hobbyist: {
    name: "Hobbyist",
    description: "Drone enthusiasts and recreational pilots",
    icon: Camera,
    color: "bg-blue-100 text-blue-800 dark:bg-blue-900/30 dark:text-blue-400",
  },
  student: {
    name: "Student",
    description: "Students and researchers",
    icon: GraduationCap,
    color: "bg-orange-100 text-orange-800 dark:bg-orange-900/30 dark:text-orange-400",
  },
  pilot: {
    name: "Commercial Pilot",
    description: "Licensed commercial drone pilots",
    icon: Plane,
    color: "bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-400",
  },
  service_provider: {
    name: "Service Provider",
    description: "Drone services and maintenance",
    icon: Wrench,
    color: "bg-indigo-100 text-indigo-800 dark:bg-indigo-900/30 dark:text-indigo-400",
  },
}

function CompleteProfileForm() {
  const router = useRouter()
  const { user, loading: authLoading, refreshUser } = useAuth()
  
  const [formData, setFormData] = useState({
    username: "",
    role: "",
    organization: "",
    bio: "",
    location: "",
    pilotLicense: "",
    pilotLicenseCountry: "",
    experience: "",
    website: "",
    phone: "",
  })
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState("")
  const [success, setSuccess] = useState("")

  // Handle authentication state with better error handling
  useEffect(() => {
    console.log('CompleteProfile - Auth state:', { user, authLoading })
    
    // Only redirect if we're sure about the auth state
    if (!authLoading && user === null) {
      console.log('CompleteProfile - No user found, redirecting to login')
      router.push("/login")
      return
    }
    
    if (!authLoading && user && user.role !== null) {
      console.log('CompleteProfile - User already has role, redirecting to dashboard')
      router.push("/")
      return
    }
    
    if (!authLoading && user && user.role === null) {
      console.log('CompleteProfile - User authenticated with no role, showing form')
    }
  }, [user, authLoading, router])

  // Show loading while checking authentication
  if (authLoading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-green-50 dark:from-gray-900 dark:via-gray-800 dark:to-gray-900 flex items-center justify-center p-4">
        <Card className="w-full max-w-2xl">
          <CardContent className="flex items-center justify-center p-8">
            <Loader className="h-8 w-8 animate-spin" />
            <p className="mt-4 text-gray-600">Loading...</p>
          </CardContent>
        </Card>
      </div>
    )
  }

  // Show loading if user is not available yet
  if (!user) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-green-50 dark:from-gray-900 dark:via-gray-800 dark:to-gray-900 flex items-center justify-center p-4">
        <Card className="w-full max-w-2xl">
          <CardContent className="flex items-center justify-center p-8">
            <Loader className="h-8 w-8 animate-spin" />
            <p className="mt-4 text-gray-600">Checking authentication...</p>
          </CardContent>
        </Card>
      </div>
    )
  }

  // Don't render form if user already has a role
  if (user.role !== null) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-green-50 dark:from-gray-900 dark:via-gray-800 dark:to-gray-900 flex items-center justify-center p-4">
        <Card className="w-full max-w-2xl">
          <CardContent className="flex items-center justify-center p-8">
            <p className="text-gray-600">Redirecting to dashboard...</p>
          </CardContent>
        </Card>
      </div>
    )
  }

  const handleInputChange = (field: string, value: string) => {
    setFormData(prev => ({ ...prev, [field]: value }))
    setError("")
    setSuccess("")
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setIsLoading(true)
    setError("")
    setSuccess("")

    // Validate required fields
    if (!formData.username || !formData.role || !formData.phone) {
      setError("Username, role, and phone number are required")
      setIsLoading(false)
      return
    }

    try {
      const response = await fetch("/api/profile/update", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(formData),
      })

      const data = await response.json()

      if (response.ok) {
        setSuccess("Profile updated successfully!")
        // Refresh user context to get updated user data
        await refreshUser()
        // Redirect to dashboard after a short delay
        setTimeout(() => {
          router.push("/")
        }, 2000)
      } else {
        setError(data.error || "Failed to update profile")
      }
    } catch (err) {
      console.error("Profile update error:", err)
      setError("Network error. Please try again.")
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-green-50 dark:from-gray-900 dark:via-gray-800 dark:to-gray-900 flex items-center justify-center p-4">
      <Card className="w-full max-w-2xl">
        <CardHeader className="text-center">
          <CardTitle className="text-2xl">Complete Your Profile</CardTitle>
          <CardDescription>Welcome! Please complete your profile to access the full platform</CardDescription>
        </CardHeader>
        <CardContent className="space-y-6">
          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="grid md:grid-cols-2 gap-4">
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
                    {Object.entries(roleInfo).map(([role, info]) => {
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
              </div>
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
                <Label htmlFor="phone">Phone Number *</Label>
                <Input
                  type="tel"
                  id="phone"
                  placeholder="+250 123 456 789"
                  required
                  value={formData.phone}
                  onChange={(e) => handleInputChange("phone", e.target.value)}
                  disabled={isLoading}
                />
              </div>
            </div>

            {formData.role === "pilot" && (
              <div className="grid md:grid-cols-2 gap-4">
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
                <div className="space-y-2">
                  <Label htmlFor="pilotLicenseCountry">Pilot License Country</Label>
                  <Input
                    id="pilotLicenseCountry"
                    placeholder="Enter the country that issued your pilot license"
                    value={formData.pilotLicenseCountry}
                    onChange={(e) => handleInputChange("pilotLicenseCountry", e.target.value)}
                    disabled={isLoading}
                  />
                </div>
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

            {success && (
              <Alert>
                <AlertDescription>{success}</AlertDescription>
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
                  Updating Profile...
                </>
              ) : (
                "Complete Profile"
              )}
            </Button>
          </form>

          <div className="text-center">
            <p className="text-sm text-muted-foreground">
              You can skip this for now and complete your profile later from your account settings.
            </p>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}

export default function CompleteProfilePage() {
  return (
    <Suspense fallback={
      <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-green-50 dark:from-gray-900 dark:via-gray-800 dark:to-gray-900 flex items-center justify-center p-4">
        <Card className="w-full max-w-2xl">
          <CardContent className="flex items-center justify-center p-8">
            <Loader className="h-8 w-8 animate-spin" />
          </CardContent>
        </Card>
      </div>
    }>
      <CompleteProfileForm />
    </Suspense>
  )
} 