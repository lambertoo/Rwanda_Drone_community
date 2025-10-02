"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Plus, X } from "lucide-react"
import { createServiceAction } from "@/lib/actions"

export default function NewServiceForm() {
  const [loading, setLoading] = useState(false)
  const [services, setServices] = useState<string[]>([])
  const [newService, setNewService] = useState("")

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault()
    setLoading(true)

    try {
      // Check if user is logged in
      const user = localStorage.getItem("user")
      if (!user) {
        alert("Please log in to create a service.")
        return
      }

      const formData = new FormData(e.currentTarget)
      
      // Add services array to form data
      formData.append("services", JSON.stringify(services))
      
      // Add user ID from localStorage
      const userData = JSON.parse(user)
      formData.append("userId", userData.id)

      console.log("Creating service with user:", userData.id)
      await createServiceAction(formData)
    } catch (error) {
      console.error("Error creating service:", error)
      alert("Failed to create service. Please try again.")
    } finally {
      setLoading(false)
    }
  }

  const addService = () => {
    if (newService.trim() && !services.includes(newService.trim())) {
      setServices([...services, newService.trim()])
      setNewService("")
    }
  }

  const removeService = (index: number) => {
    setServices(services.filter((_, i) => i !== index))
  }

  return (
    <div className="max-w-4xl mx-auto">
      <div className="space-y-6">
        <div className="text-center space-y-4">
          <h1 className="text-3xl font-bold">List Your Service</h1>
          <p className="text-lg text-muted-foreground">
            Join our directory and connect with drone enthusiasts across Rwanda
          </p>
        </div>

        <Card>
          <CardHeader>
            <CardTitle>Service Information</CardTitle>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleSubmit} className="space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="title">Service Title *</Label>
              <Input
                id="title"
                name="title"
                placeholder="e.g., Rwanda Aerial Solutions"
                required
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="category">Category *</Label>
              <Select name="category" required>
                <SelectTrigger>
                  <SelectValue placeholder="Select category" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="Mapping & Surveying">Mapping & Surveying</SelectItem>
                  <SelectItem value="Photography & Videography">Photography & Videography</SelectItem>
                  <SelectItem value="Agriculture">Agriculture</SelectItem>
                  <SelectItem value="Repair & Maintenance">Repair & Maintenance</SelectItem>
                  <SelectItem value="Training & Education">Training & Education</SelectItem>
                  <SelectItem value="Inspection Services">Inspection Services</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>

          <div className="space-y-2">
            <Label htmlFor="description">Description *</Label>
            <Textarea
              id="description"
              name="description"
              placeholder="Describe your services and what makes you unique..."
              rows={4}
              required
            />
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="region">Region *</Label>
              <Select name="region" required>
                <SelectTrigger>
                  <SelectValue placeholder="Select region" />
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

            <div className="space-y-2">
              <Label htmlFor="contact">Contact Name *</Label>
              <Input
                id="contact"
                name="contact"
                placeholder="e.g., Rwanda Aerial Solutions"
                required
              />
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="space-y-2">
              <Label htmlFor="phone">Phone Number</Label>
              <Input
                id="phone"
                name="phone"
                placeholder="+250 788 123 456"
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="email">Email</Label>
              <Input
                id="email"
                name="email"
                type="email"
                placeholder="info@example.com"
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="website">Website</Label>
              <Input
                id="website"
                name="website"
                placeholder="www.example.com"
              />
            </div>
          </div>

          <div className="space-y-4">
            <Label>Services Offered</Label>
            <div className="flex gap-2">
              <Input
                value={newService}
                onChange={(e) => setNewService(e.target.value)}
                placeholder="Add a service (e.g., 3D Mapping)"
                onKeyPress={(e) => e.key === 'Enter' && (e.preventDefault(), addService())}
              />
              <Button
                type="button"
                variant="outline"
                onClick={addService}
                disabled={!newService.trim()}
              >
                <Plus className="h-4 w-4" />
              </Button>
            </div>
            
            {services.length > 0 && (
              <div className="flex flex-wrap gap-2">
                {services.map((service, index) => (
                  <Badge key={index} variant="secondary" className="flex items-center gap-1">
                    {service}
                    <button
                      type="button"
                      onClick={() => removeService(index)}
                      className="ml-1 hover:text-red-600"
                    >
                      <X className="h-3 w-3" />
                    </button>
                  </Badge>
                ))}
              </div>
            )}
          </div>

          <div className="flex gap-4 pt-4">
            <Button type="submit" disabled={loading} className="flex-1 bg-blue-600 hover:bg-blue-700">
              {loading ? "Creating..." : "Create Service"}
            </Button>
          </div>
        </form>
          </CardContent>
        </Card>
      </div>
    </div>
  )
} 