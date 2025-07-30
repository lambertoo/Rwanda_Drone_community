import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Checkbox } from "@/components/ui/checkbox"
import { Textarea } from "@/components/ui/textarea"
import Link from "next/link"

export default function RegisterPage() {
  return (
    <div className="min-h-screen flex items-center justify-center p-6">
      <Card className="w-full max-w-2xl">
        <CardHeader className="text-center">
          <CardTitle className="text-2xl">Join Rwanda Drone Community</CardTitle>
          <CardDescription>Connect with drone enthusiasts, professionals, and businesses across Rwanda</CardDescription>
        </CardHeader>
        <CardContent className="space-y-6">
          <form className="space-y-4">
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
              <Label htmlFor="password">Password</Label>
              <Input id="password" type="password" placeholder="Create a password" />
            </div>

            <div className="space-y-2">
              <Label htmlFor="confirmPassword">Confirm Password</Label>
              <Input id="confirmPassword" type="password" placeholder="Confirm your password" />
            </div>

            <div className="space-y-2">
              <Label htmlFor="userType">User Type</Label>
              <Select>
                <SelectTrigger>
                  <SelectValue placeholder="Select your user type" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="hobbyist">Hobbyist</SelectItem>
                  <SelectItem value="pilot">Professional Pilot</SelectItem>
                  <SelectItem value="business">Business</SelectItem>
                  <SelectItem value="student">Student</SelectItem>
                  <SelectItem value="regulator">Regulator</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2">
              <Label htmlFor="location">Location</Label>
              <Select>
                <SelectTrigger>
                  <SelectValue placeholder="Select your location" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="kigali">Kigali</SelectItem>
                  <SelectItem value="musanze">Musanze</SelectItem>
                  <SelectItem value="huye">Huye</SelectItem>
                  <SelectItem value="rubavu">Rubavu</SelectItem>
                  <SelectItem value="nyagatare">Nyagatare</SelectItem>
                  <SelectItem value="muhanga">Muhanga</SelectItem>
                  <SelectItem value="other">Other</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2">
              <Label htmlFor="bio">Bio (Optional)</Label>
              <Textarea
                id="bio"
                placeholder="Tell us about your drone interests and experience..."
                className="min-h-[100px]"
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="interests">Drone Interests</Label>
              <div className="grid grid-cols-2 gap-2">
                <div className="flex items-center space-x-2">
                  <Checkbox id="photography" />
                  <Label htmlFor="photography" className="text-sm">
                    Photography
                  </Label>
                </div>
                <div className="flex items-center space-x-2">
                  <Checkbox id="agriculture" />
                  <Label htmlFor="agriculture" className="text-sm">
                    Agriculture
                  </Label>
                </div>
                <div className="flex items-center space-x-2">
                  <Checkbox id="mapping" />
                  <Label htmlFor="mapping" className="text-sm">
                    Mapping
                  </Label>
                </div>
                <div className="flex items-center space-x-2">
                  <Checkbox id="racing" />
                  <Label htmlFor="racing" className="text-sm">
                    Racing
                  </Label>
                </div>
                <div className="flex items-center space-x-2">
                  <Checkbox id="inspection" />
                  <Label htmlFor="inspection" className="text-sm">
                    Inspection
                  </Label>
                </div>
                <div className="flex items-center space-x-2">
                  <Checkbox id="research" />
                  <Label htmlFor="research" className="text-sm">
                    Research
                  </Label>
                </div>
              </div>
            </div>

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
