import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Textarea } from "@/components/ui/textarea"
import { Checkbox } from "@/components/ui/checkbox"
import Link from "next/link"

export default function RegisterPage() {
  const userTypes = [
    { value: "hobbyist", label: "Hobbyist", description: "Recreational drone flying" },
    { value: "pilot", label: "Professional Pilot", description: "Commercial drone operations" },
    { value: "business", label: "Business", description: "Company offering drone services" },
    { value: "student", label: "Student", description: "Learning about drone technology" },
    { value: "regulator", label: "Regulator", description: "Government or regulatory body" },
  ]

  const districts = [
    "Kigali",
    "Musanze",
    "Huye",
    "Rubavu",
    "Nyagatare",
    "Rusizi",
    "Muhanga",
    "Karongi",
    "Kayonza",
    "Kirehe",
    "Ngoma",
    "Nyanza",
    "Ruhango",
    "Rulindo",
    "Gakenke",
    "Gatsibo",
    "Gicumbi",
    "Gisagara",
    "Nyabihu",
    "Nyamagabe",
    "Nyamasheke",
    "Rwamagana",
    "Burera",
    "Bugesera",
    "Gasabo",
    "Kicukiro",
    "Nyarugenge",
    "Ruhango",
    "Kamonyi",
    "Ngororero",
  ]

  const interests = [
    "Agriculture",
    "Photography/Videography",
    "Mapping & Surveying",
    "Construction",
    "Emergency Response",
    "Conservation",
    "Racing/FPV",
    "Education",
    "Research",
    "Commercial Operations",
    "Hobby Flying",
    "Technology Development",
  ]

  return (
    <div className="min-h-screen bg-gray-50 flex items-center justify-center p-4">
      <Card className="w-full max-w-2xl">
        <CardHeader className="text-center">
          <CardTitle className="text-2xl">Join Rwanda Drone Community</CardTitle>
          <CardDescription>Connect with drone enthusiasts, professionals, and businesses across Rwanda</CardDescription>
        </CardHeader>
        <CardContent className="space-y-6">
          <form className="space-y-6">
            {/* Basic Information */}
            <div className="space-y-4">
              <h3 className="text-lg font-semibold">Basic Information</h3>

              <div className="grid md:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="firstName">First Name</Label>
                  <Input id="firstName" placeholder="Enter your first name" />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="lastName">Last Name</Label>
                  <Input id="lastName" placeholder="Enter your last name" />
                </div>
              </div>

              <div className="space-y-2">
                <Label htmlFor="email">Email Address</Label>
                <Input id="email" type="email" placeholder="Enter your email" />
              </div>

              <div className="space-y-2">
                <Label htmlFor="phone">Phone Number</Label>
                <Input id="phone" placeholder="+250 7XX XXX XXX" />
              </div>

              <div className="space-y-2">
                <Label htmlFor="password">Password</Label>
                <Input id="password" type="password" placeholder="Create a strong password" />
              </div>

              <div className="space-y-2">
                <Label htmlFor="confirmPassword">Confirm Password</Label>
                <Input id="confirmPassword" type="password" placeholder="Confirm your password" />
              </div>
            </div>

            {/* Profile Information */}
            <div className="space-y-4">
              <h3 className="text-lg font-semibold">Profile Information</h3>

              <div className="space-y-2">
                <Label htmlFor="userType">User Type</Label>
                <Select>
                  <SelectTrigger>
                    <SelectValue placeholder="Select your user type" />
                  </SelectTrigger>
                  <SelectContent>
                    {userTypes.map((type) => (
                      <SelectItem key={type.value} value={type.value}>
                        <div>
                          <div className="font-medium">{type.label}</div>
                          <div className="text-sm text-muted-foreground">{type.description}</div>
                        </div>
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              <div className="space-y-2">
                <Label htmlFor="location">Location (District)</Label>
                <Select>
                  <SelectTrigger>
                    <SelectValue placeholder="Select your district" />
                  </SelectTrigger>
                  <SelectContent>
                    {districts.map((district) => (
                      <SelectItem key={district} value={district.toLowerCase()}>
                        {district}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              <div className="space-y-2">
                <Label htmlFor="bio">Bio</Label>
                <Textarea
                  id="bio"
                  placeholder="Tell us about yourself and your interest in drones..."
                  className="min-h-[100px]"
                />
              </div>
            </div>

            {/* Interests and Experience */}
            <div className="space-y-4">
              <h3 className="text-lg font-semibold">Interests & Experience</h3>

              <div className="space-y-2">
                <Label>Areas of Interest (Select all that apply)</Label>
                <div className="grid grid-cols-2 gap-2">
                  {interests.map((interest) => (
                    <div key={interest} className="flex items-center space-x-2">
                      <Checkbox id={interest} />
                      <Label htmlFor={interest} className="text-sm">
                        {interest}
                      </Label>
                    </div>
                  ))}
                </div>
              </div>

              <div className="space-y-2">
                <Label htmlFor="experience">Experience Level</Label>
                <Select>
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
                <Label htmlFor="certifications">Certifications</Label>
                <Textarea
                  id="certifications"
                  placeholder="List any drone-related certifications (RCAA license, etc.)"
                  className="min-h-[80px]"
                />
              </div>
            </div>

            {/* Terms and Conditions */}
            <div className="space-y-4">
              <div className="flex items-center space-x-2">
                <Checkbox id="terms" />
                <Label htmlFor="terms" className="text-sm">
                  I agree to the{" "}
                  <Link href="/terms" className="text-blue-600 hover:underline">
                    Terms of Service
                  </Link>{" "}
                  and{" "}
                  <Link href="/privacy" className="text-blue-600 hover:underline">
                    Privacy Policy
                  </Link>
                </Label>
              </div>

              <div className="flex items-center space-x-2">
                <Checkbox id="newsletter" />
                <Label htmlFor="newsletter" className="text-sm">
                  Subscribe to community newsletter and updates
                </Label>
              </div>
            </div>

            <Button type="submit" className="w-full" size="lg">
              Create Account
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
