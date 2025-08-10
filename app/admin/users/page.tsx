"use client"

import { useEffect, useState } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Switch } from "@/components/ui/switch"
import { Label } from "@/components/ui/label"
import { Input } from "@/components/ui/input"
import { Textarea } from "@/components/ui/textarea"
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog"
import { Alert, AlertDescription } from "@/components/ui/alert"
import { 
  Users, 
  Shield, 
  CheckCircle,
  XCircle,
  AlertTriangle,
  UserCheck,

  Crown,
  Building,
  Plus,
  Search,
  Filter,
  MoreHorizontal,
  Edit,
  Trash2,
  Eye,
  Mail,
  Phone,
  Globe,
  MapPin,
  Calendar,
  Award
} from "lucide-react"
import { AdminOnly } from "@/components/auth-guard"

interface User {
  id: string
  username: string
  email: string
  fullName: string
  role: string
  isVerified: boolean
  reputation: number
  joinedAt: string
  lastActive: string
  organization: string | null
  location: string | null
  bio: string | null
  pilotLicense: string | null
  experience: string | null
  website: string | null
  phone: string | null
}

interface CreateUserForm {
  fullName: string
  email: string
  username: string
  password: string
  confirmPassword: string
  role: string
  organization: string
  bio: string
  location: string
  pilotLicense: string
  experience: string
  website: string
  phone: string
}

const roleColors = {
  admin: "bg-red-100 text-red-800 dark:bg-red-900/30 dark:text-red-400",
  regulator: "bg-purple-100 text-purple-800 dark:bg-purple-900/30 dark:text-purple-400",
  pilot: "bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-400",
  service_provider: "bg-indigo-100 text-indigo-800 dark:bg-indigo-900/30 dark:text-indigo-400",
  student: "bg-orange-100 text-orange-800 dark:bg-orange-900/30 dark:text-orange-400",
  hobbyist: "bg-blue-100 text-blue-800 dark:bg-blue-900/30 dark:text-blue-400",
}

const roleNames = {
  admin: "Administrator",
  regulator: "Regulator",
  pilot: "Commercial Pilot",
  service_provider: "Service Provider",
  student: "Student",
  hobbyist: "Hobbyist",
}

const experienceLevels = {
  beginner: "Beginner (0-1 years)",
  intermediate: "Intermediate (1-3 years)",
  advanced: "Advanced (3-5 years)",
  expert: "Expert (5+ years)",
}

const locations = [
  "KIGALI_NYARUGENGE", "KIGALI_KICUKIRO", "KIGALI_GASABO",
  "SOUTH_HUYE", "SOUTH_NYAMAGABE", "SOUTH_NYARUGURU", "SOUTH_MUHANGA", "SOUTH_KAMONYI", "SOUTH_GISAGARA", "SOUTH_NYANZA", "SOUTH_RUHANGO",
  "NORTH_MUSANZE", "NORTH_GICUMBI", "NORTH_RULINDO", "NORTH_BURERA", "NORTH_GAKENKE",
  "EAST_KAYONZA", "EAST_NGOMA", "EAST_KIREHE", "EAST_NYAGATARE", "EAST_BUGESERA", "EAST_RWAMAGANA", "EAST_GATSIBO",
  "WEST_RUBAVU", "WEST_RUSIZI", "WEST_NYAMASHEKE", "WEST_RUTSIRO", "WEST_KARONGI", "WEST_NGORORERO", "WEST_NYABIHU",
  "UNKNOWN"
]

function UserManagementPage() {
  const [users, setUsers] = useState<User[]>([])
  const [loading, setLoading] = useState(true)
  const [updating, setUpdating] = useState<string | null>(null)
  const [searchTerm, setSearchTerm] = useState("")
  const [roleFilter, setRoleFilter] = useState("")
  const [statusFilter, setStatusFilter] = useState("")
  const [showCreateModal, setShowCreateModal] = useState(false)
  const [createUserForm, setCreateUserForm] = useState<CreateUserForm>({
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
  const [createUserLoading, setCreateUserLoading] = useState(false)
  const [createUserError, setCreateUserError] = useState("")
  const [selectedUser, setSelectedUser] = useState<User | null>(null)
  const [showUserDetails, setShowUserDetails] = useState(false)

  useEffect(() => {
    fetchUsers()
  }, [])

  const fetchUsers = async () => {
    try {
      const response = await fetch("/api/admin/users")
      if (response.ok) {
        const data = await response.json()
        setUsers(data)
      } else {
        console.error("Failed to fetch users")
      }
    } catch (error) {
      console.error("Error fetching users:", error)
    } finally {
      setLoading(false)
    }
  }

  const createUser = async () => {
    if (createUserForm.password !== createUserForm.confirmPassword) {
      setCreateUserError("Passwords do not match")
      return
    }

    setCreateUserLoading(true)
    setCreateUserError("")

    try {
      const response = await fetch("/api/admin/users", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          fullName: createUserForm.fullName,
          email: createUserForm.email,
          username: createUserForm.username,
          password: createUserForm.password,
          role: createUserForm.role,
          organization: createUserForm.organization || undefined,
          bio: createUserForm.bio || undefined,
          location: createUserForm.location || undefined,
          pilotLicense: createUserForm.pilotLicense || undefined,
          experience: createUserForm.experience || undefined,
          website: createUserForm.website || undefined,
          phone: createUserForm.phone || undefined,
        }),
      })

      if (response.ok) {
        const data = await response.json()
        setUsers(prev => [data.user, ...prev])
        setShowCreateModal(false)
        resetCreateUserForm()
        // Refresh users to get the complete data
        fetchUsers()
      } else {
        const error = await response.json()
        if (error.details && Array.isArray(error.details)) {
          const errorMessages = error.details.map((err: any) => err.message).join(", ")
          setCreateUserError(`Validation failed: ${errorMessages}`)
        } else {
          setCreateUserError(error.error || "Failed to create user")
        }
      }
    } catch (error) {
      console.error("Error creating user:", error)
      setCreateUserError("Failed to create user")
    } finally {
      setCreateUserLoading(false)
    }
  }

  const resetCreateUserForm = () => {
    setCreateUserForm({
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
    setCreateUserError("")
  }

  const updateUserRole = async (userId: string, newRole: string) => {
    setUpdating(userId)
    try {
      const response = await fetch("/api/admin/users", {
        method: "PATCH",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ userId, role: newRole }),
      })

      if (response.ok) {
        // Update local state
        setUsers(prev => prev.map(user => 
          user.id === userId ? { ...user, role: newRole } : user
        ))
      } else {
        const error = await response.json()
        alert(`Failed to update role: ${error.error}`)
      }
    } catch (error) {
      console.error("Error updating user role:", error)
      alert("Failed to update user role")
    } finally {
      setUpdating(null)
    }
  }

  const updateUserVerification = async (userId: string, isVerified: boolean) => {
    setUpdating(userId)
    try {
      const response = await fetch("/api/admin/users", {
        method: "PATCH",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ userId, isVerified }),
      })

      if (response.ok) {
        // Update local state
        setUsers(prev => prev.map(user => 
          user.id === userId ? { ...user, isVerified } : user
        ))
      } else {
        const error = await response.json()
        alert(`Failed to update verification: ${error.error}`)
      }
    } catch (error) {
      console.error("Error updating user verification:", error)
      alert("Failed to update user verification")
    } finally {
      setUpdating(null)
    }
  }



  const filteredUsers = users.filter(user => {
    const matchesSearch = 
      user.fullName.toLowerCase().includes(searchTerm.toLowerCase()) ||
      user.username.toLowerCase().includes(searchTerm.toLowerCase()) ||
      user.email.toLowerCase().includes(searchTerm.toLowerCase()) ||
      (user.organization && user.organization.toLowerCase().includes(searchTerm.toLowerCase()))
    
    const matchesRole = !roleFilter || roleFilter === 'all' || user.role === roleFilter
    const matchesStatus = !statusFilter || statusFilter === 'all' ||
      (statusFilter === 'verified' && user.isVerified) ||
      (statusFilter === 'unverified' && !user.isVerified)

    return matchesSearch && matchesRole && matchesStatus
  })

  if (loading) {
    return (
      <div className="container mx-auto px-4 py-8">
        <div className="text-center">Loading users...</div>
      </div>
    )
  }

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="mb-8">
        <h1 className="text-3xl font-bold mb-2">User Management</h1>
        <p className="text-muted-foreground">
          Manage user accounts, roles, and permissions. Only administrators can assign admin and regulator roles.
        </p>
      </div>

      {/* Create User Button */}
      <div className="mb-6">
        <Dialog open={showCreateModal} onOpenChange={setShowCreateModal}>
          <DialogTrigger asChild>
            <Button className="flex items-center gap-2">
              <Plus className="h-4 w-4" />
              Create New User
            </Button>
          </DialogTrigger>
          <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
            <DialogHeader>
              <DialogTitle>Create New User</DialogTitle>
              <DialogDescription>
                Create a new user account with full administrative control.
              </DialogDescription>
            </DialogHeader>
            
            <div className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="fullName">Full Name *</Label>
                  <Input
                    id="fullName"
                    value={createUserForm.fullName}
                    onChange={(e) => setCreateUserForm(prev => ({ ...prev, fullName: e.target.value }))}
                    placeholder="Enter full name"
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="username">Username *</Label>
                  <Input
                    id="username"
                    value={createUserForm.username}
                    onChange={(e) => setCreateUserForm(prev => ({ ...prev, username: e.target.value }))}
                    placeholder="Choose username"
                  />
                </div>
              </div>

              <div className="space-y-2">
                <Label htmlFor="email">Email Address *</Label>
                <Input
                  id="email"
                  type="email"
                  value={createUserForm.email}
                  onChange={(e) => setCreateUserForm(prev => ({ ...prev, email: e.target.value }))}
                  placeholder="Enter email address"
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="password">Password *</Label>
                  <Input
                    id="password"
                    type="password"
                    value={createUserForm.password}
                    onChange={(e) => setCreateUserForm(prev => ({ ...prev, password: e.target.value }))}
                    placeholder="Create password"
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="confirmPassword">Confirm Password *</Label>
                  <Input
                    id="confirmPassword"
                    type="password"
                    value={createUserForm.confirmPassword}
                    onChange={(e) => setCreateUserForm(prev => ({ ...prev, confirmPassword: e.target.value }))}
                    placeholder="Confirm password"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="role">Role *</Label>
                  <Select value={createUserForm.role} onValueChange={(value) => setCreateUserForm(prev => ({ ...prev, role: value }))}>
                    <SelectTrigger>
                      <SelectValue placeholder="Select role" />
                    </SelectTrigger>
                    <SelectContent>
                      {Object.entries(roleNames).map(([role, name]) => (
                        <SelectItem key={role} value={role}>
                          <div className="flex items-center gap-2">
                            <Badge className={roleColors[role as keyof typeof roleColors]}>
                              {name}
                            </Badge>
                          </div>
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
                <div className="space-y-2">
                  <Label htmlFor="location">Location</Label>
                  <Select value={createUserForm.location} onValueChange={(value) => setCreateUserForm(prev => ({ ...prev, location: value }))}>
                    <SelectTrigger>
                      <SelectValue placeholder="Select location" />
                    </SelectTrigger>
                    <SelectContent>
                      {locations.map((location) => (
                        <SelectItem key={location} value={location}>
                          {location.replace(/_/g, ' ').replace(/\b\w/g, l => l.toUpperCase())}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="organization">Organization</Label>
                  <Input
                    id="organization"
                    value={createUserForm.organization}
                    onChange={(e) => setCreateUserForm(prev => ({ ...prev, organization: e.target.value }))}
                    placeholder="Organization name"
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="phone">Phone Number</Label>
                  <Input
                    id="phone"
                    value={createUserForm.phone}
                    onChange={(e) => setCreateUserForm(prev => ({ ...prev, phone: e.target.value }))}
                    placeholder="+250 123 456 789"
                  />
                </div>
              </div>

              <div className="space-y-2">
                <Label htmlFor="website">Website</Label>
                <Input
                  id="website"
                  type="url"
                  value={createUserForm.website}
                  onChange={(e) => setCreateUserForm(prev => ({ ...prev, website: e.target.value }))}
                  placeholder="https://example.com"
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="bio">Bio</Label>
                <Textarea
                  id="bio"
                  value={createUserForm.bio}
                  onChange={(e) => setCreateUserForm(prev => ({ ...prev, bio: e.target.value }))}
                  placeholder="Tell us about this user..."
                  rows={3}
                />
              </div>

              {createUserForm.role === "pilot" && (
                <div className="space-y-2">
                  <Label htmlFor="pilotLicense">Pilot License Number</Label>
                  <Input
                    id="pilotLicense"
                    value={createUserForm.pilotLicense}
                    onChange={(e) => setCreateUserForm(prev => ({ ...prev, pilotLicense: e.target.value }))}
                    placeholder="Enter pilot license number"
                  />
                </div>
              )}

              <div className="space-y-2">
                <Label htmlFor="experience">Experience Level</Label>
                <Select value={createUserForm.experience} onValueChange={(value) => setCreateUserForm(prev => ({ ...prev, experience: value }))}>
                  <SelectTrigger>
                    <SelectValue placeholder="Select experience level" />
                  </SelectTrigger>
                  <SelectContent>
                    {Object.entries(experienceLevels).map(([level, description]) => (
                      <SelectItem key={level} value={level}>
                        {description}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              {createUserError && (
                <Alert variant="destructive">
                  <AlertDescription>{createUserError}</AlertDescription>
                </Alert>
              )}

              <div className="flex gap-2 pt-4">
                <Button 
                  onClick={createUser} 
                  disabled={createUserLoading}
                  className="flex-1"
                >
                  {createUserLoading ? "Creating..." : "Create User"}
                </Button>
                <Button 
                  variant="outline" 
                  onClick={() => {
                    setShowCreateModal(false)
                    resetCreateUserForm()
                  }}
                >
                  Cancel
                </Button>
              </div>
            </div>
          </DialogContent>
        </Dialog>
      </div>

      {/* Filters and Search */}
      <div className="mb-6 space-y-4">
        <div className="flex flex-col sm:flex-row gap-4">
          <div className="flex-1">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
              <Input
                placeholder="Search users by name, username, email, or organization..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-10"
              />
            </div>
          </div>
          <Select value={roleFilter} onValueChange={setRoleFilter}>
            <SelectTrigger className="w-40">
              <SelectValue placeholder="Filter by role" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All Roles</SelectItem>
              {Object.entries(roleNames).map(([role, name]) => (
                <SelectItem key={role} value={role}>{name}</SelectItem>
              ))}
            </SelectContent>
          </Select>
          <Select value={statusFilter} onValueChange={setStatusFilter}>
            <SelectTrigger className="w-40">
              <SelectValue placeholder="Filter by status" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All Status</SelectItem>
              <SelectItem value="verified">Verified</SelectItem>
              <SelectItem value="unverified">Unverified</SelectItem>
            </SelectContent>
          </Select>
        </div>
      </div>

      {/* Users Table */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Users className="h-5 w-5" />
            All Users ({filteredUsers.length})
          </CardTitle>
          <CardDescription>
            View and manage user accounts, roles, and verification status
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="border-b">
                  <th className="text-left p-2">User</th>
                  <th className="text-left p-2">Role</th>
                  <th className="text-left p-2">Verified</th>
                  <th className="text-left p-2">Reputation</th>
                  <th className="text-left p-2">Joined</th>
                  <th className="text-left p-2">Actions</th>
                </tr>
              </thead>
              <tbody>
                {filteredUsers.map((user) => (
                  <tr key={user.id} className="border-b hover:bg-gray-50">
                    <td className="p-2">
                      <div>
                        <div className="font-medium">{user.fullName}</div>
                        <div className="text-sm text-muted-foreground">
                          @{user.username} • {user.email}
                        </div>
                        {user.organization && (
                          <div className="text-xs text-muted-foreground flex items-center gap-1">
                            <Building className="h-3 w-3" />
                            {user.organization}
                          </div>
                        )}
                      </div>
                    </td>
                    <td className="p-2">
                      <Select
                        value={user.role}
                        onValueChange={(newRole) => updateUserRole(user.id, newRole)}
                        disabled={updating === user.id}
                      >
                        <SelectTrigger className="w-32">
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                          {Object.entries(roleNames).map(([role, name]) => (
                            <SelectItem key={role} value={role}>
                              <div className="flex items-center gap-2">
                                <Badge className={roleColors[role as keyof typeof roleColors]}>
                                  {name}
                                </Badge>
                              </div>
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    </td>

                    <td className="p-2">
                      <div className="flex items-center gap-2">
                        <Switch
                          checked={user.isVerified}
                          onCheckedChange={(checked) => updateUserVerification(user.id, checked)}
                          disabled={updating === user.id}
                        />
                        <Label>
                          {user.isVerified ? "Verified" : "Unverified"}
                        </Label>
                      </div>
                    </td>
                    <td className="p-2">
                      <Badge variant="outline">{user.reputation}</Badge>
                    </td>
                    <td className="p-2">
                                      <div className="text-sm text-muted-foreground">
                  {new Date(user.joinedAt).toLocaleDateString()}
                </div>
                    </td>
                    <td className="p-2">
                      <div className="flex gap-2">
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => {
                            setSelectedUser(user)
                            setShowUserDetails(true)
                          }}
                          title="View Details"
                        >
                          <Eye className="h-4 w-4" />
                        </Button>
                        {user.role === 'admin' && (
                          <Crown className="h-4 w-4 text-yellow-600" title="Administrator" />
                        )}
                        {user.role === 'regulator' && (
                          <Shield className="h-4 w-4 text-purple-600" title="Regulator" />
                        )}
                        {user.isVerified && (
                          <UserCheck className="h-4 w-4 text-green-600" title="Verified User" />
                        )}

                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </CardContent>
      </Card>

      {/* User Details Modal */}
      <Dialog open={showUserDetails} onOpenChange={setShowUserDetails}>
        <DialogContent className="max-w-2xl">
          <DialogHeader>
            <DialogTitle>User Details</DialogTitle>
            <DialogDescription>
              Detailed information about {selectedUser?.fullName}
            </DialogDescription>
          </DialogHeader>
          
          {selectedUser && (
            <div className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label className="text-sm font-medium text-muted-foreground">Full Name</Label>
                  <p className="text-sm">{selectedUser.fullName}</p>
                </div>
                <div>
                  <Label className="text-sm font-medium text-muted-foreground">Username</Label>
                  <p className="text-sm">@{selectedUser.username}</p>
                </div>
              </div>

              <div>
                <Label className="text-sm font-medium text-muted-foreground">Email</Label>
                <div className="flex items-center gap-2">
                  <Mail className="h-4 w-4 text-muted-foreground" />
                  <p className="text-sm">{selectedUser.email}</p>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label className="text-sm font-medium text-muted-foreground">Role</Label>
                  <Badge className={roleColors[selectedUser.role as keyof typeof roleColors]}>
                    {roleNames[selectedUser.role as keyof typeof roleNames]}
                  </Badge>
                </div>
                <div>
                  <Label className="text-sm font-medium text-muted-foreground">Reputation</Label>
                  <div className="flex items-center gap-2">
                    <Award className="h-4 w-4 text-muted-foreground" />
                    <p className="text-sm">{selectedUser.reputation}</p>
                  </div>
                </div>
              </div>

              {selectedUser.organization && (
                <div>
                  <Label className="text-sm font-medium text-muted-foreground">Organization</Label>
                  <div className="flex items-center gap-2">
                    <Building className="h-4 w-4 text-muted-foreground" />
                    <p className="text-sm">{selectedUser.organization}</p>
                  </div>
                </div>
              )}

              {selectedUser.location && (
                <div>
                  <Label className="text-sm font-medium text-muted-foreground">Location</Label>
                  <div className="flex items-center gap-2">
                    <MapPin className="h-4 w-4 text-muted-foreground" />
                    <p className="text-sm">{selectedUser.location.replace(/_/g, ' ').replace(/\b\w/g, l => l.toUpperCase())}</p>
                  </div>
                </div>
              )}

              {selectedUser.phone && (
                <div>
                  <Label className="text-sm font-medium text-muted-foreground">Phone</Label>
                  <div className="flex items-center gap-2">
                    <Phone className="h-4 w-4 text-muted-foreground" />
                    <p className="text-sm">{selectedUser.phone}</p>
                  </div>
                </div>
              )}

              {selectedUser.website && (
                <div>
                  <Label className="text-sm font-medium text-muted-foreground">Website</Label>
                  <div className="flex items-center gap-2">
                    <Globe className="h-4 w-4 text-muted-foreground" />
                    <a href={selectedUser.website} target="_blank" rel="noopener noreferrer" className="text-sm text-blue-600 hover:underline">
                      {selectedUser.website}
                    </a>
                  </div>
                </div>
              )}

              {selectedUser.bio && (
                <div>
                  <Label className="text-sm font-medium text-muted-foreground">Bio</Label>
                  <p className="text-sm">{selectedUser.bio}</p>
                </div>
              )}

              {selectedUser.pilotLicense && (
                <div>
                  <Label className="text-sm font-medium text-muted-foreground">Pilot License</Label>
                  <p className="text-sm">{selectedUser.pilotLicense}</p>
                </div>
              )}

              {selectedUser.experience && (
                <div>
                  <Label className="text-sm font-medium text-muted-foreground">Experience Level</Label>
                  <p className="text-sm">{experienceLevels[selectedUser.experience as keyof typeof experienceLevels]}</p>
                </div>
              )}

              <div>
                <Label className="text-sm font-medium text-muted-foreground">Verification Status</Label>
                <div className="flex items-center gap-2">
                  {selectedUser.isVerified ? (
                    <UserCheck className="h-4 w-4 text-green-600" />
                  ) : (
                    <AlertTriangle className="h-4 w-4 text-yellow-600" />
                  )}
                  <p className="text-sm">{selectedUser.isVerified ? "Verified" : "Unverified"}</p>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label className="text-sm font-medium text-muted-foreground">Joined</Label>
                  <div className="flex items-center gap-2">
                    <Calendar className="h-4 w-4 text-muted-foreground" />
                    <p className="text-sm">{new Date(selectedUser.joinedAt).toLocaleDateString()}</p>
                  </div>
                </div>
                              {selectedUser.lastActive && (
                <div>
                  <Label className="text-sm font-medium text-muted-foreground">Last Active</Label>
                  <div className="flex items-center gap-2">
                    <Calendar className="h-4 w-4 text-muted-foreground" />
                    <p className="text-sm">{new Date(selectedUser.lastActive).toLocaleDateString()}</p>
                  </div>
                </div>
              )}
              </div>
            </div>
          )}
        </DialogContent>
      </Dialog>

      <div className="mt-6 p-4 bg-blue-50 border border-blue-200 rounded-lg">
        <h3 className="font-medium text-blue-900 mb-2">Role Management Guidelines</h3>
        <ul className="text-sm text-blue-800 space-y-1">
          <li>• <strong>Administrator:</strong> Full system access and management capabilities</li>
          <li>• <strong>Regulator:</strong> Government and regulatory officials with oversight access</li>
          <li>• <strong>Commercial Pilot:</strong> Licensed drone pilots with commercial experience</li>
          <li>• <strong>Service Provider:</strong> Drone services, maintenance, and support</li>
          <li>• <strong>Student:</strong> Students and researchers in drone technology</li>
          <li>• <strong>Hobbyist:</strong> Recreational drone enthusiasts</li>
        </ul>
      </div>
    </div>
  )
}

export default function AdminUsersPage() {
  return (
    <AdminOnly>
      <UserManagementPage />
    </AdminOnly>
  )
} 