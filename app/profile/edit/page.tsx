"use client"

import { useState, useEffect } from "react"
import React from "react"

// Force dynamic rendering
export const dynamic = 'force-dynamic'
import { useRouter } from "next/navigation"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Textarea } from "@/components/ui/textarea"
import { Label } from "@/components/ui/label"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { Switch } from "@/components/ui/switch"
import { Save, Upload, User, Briefcase, Shield, Bell, Mail, Lock } from "lucide-react"
import Link from "next/link"
import { AuthGuard } from "@/components/auth-guard"
import { PhoneInput } from "@/components/ui/phone-input"
import { LocationPicker } from "@/components/ui/location-picker"

interface UserProfile {
  id: string
  fullName: string
  username: string
  email: string
  bio: string
  location: string
  website?: string
  phone?: string
  avatar?: string
  role: string
  organization?: string
  pilotLicense?: string
  experience?: string
  specializations?: string[]
  certifications?: string[]
}

function EditProfilePageContent() {
  const router = useRouter()
  const [profile, setProfile] = useState<UserProfile | null>(null)
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)
  const [activeTab, setActiveTab] = useState("basic")
  const [uploadingAvatar, setUploadingAvatar] = useState(false)
  const [avatarUrl, setAvatarUrl] = useState<string | null>(null)
  const [formData, setFormData] = useState({
    fullName: "",
    username: "",
    bio: "",
    location: "",
    website: "",
    phone: "",
    role: "",
    organization: "",
    pilotLicense: "",
    experience: "",
    specializations: [] as string[],
    certifications: [] as string[]
  })
  const [privacySettings, setPrivacySettings] = useState({
    profilePublic: true,
    showEmail: false,
    showPhone: false,
    showLocation: true,
    showStats: true
  })
  const [notificationSettings, setNotificationSettings] = useState({
    emailNotifications: true,
    pushNotifications: true,
    forumUpdates: true,
    projectUpdates: true,
    eventReminders: true,
    weeklyDigest: false
  })

  useEffect(() => {
    const fetchProfile = async () => {
      try {
        const response = await fetch('/api/auth/profile')
        if (response.ok) {
          const data = await response.json()
          const userData = data.user
          setProfile(userData)
          
          // Parse JSON strings for specializations and certifications
          const parseJsonField = (field: any) => {
            if (!field) return []
            if (Array.isArray(field)) return field
            if (typeof field === 'string') {
              try {
                return JSON.parse(field)
              } catch {
                return []
              }
            }
            return []
          }
          
          setFormData({
            fullName: userData.fullName || "",
            username: userData.username || "",
            bio: userData.bio || "",
            location: userData.location || "",
            website: userData.website || "",
            phone: userData.phone || "",
            role: userData.role || "",
            organization: userData.organization || "",
            pilotLicense: userData.pilotLicense || "",
            experience: userData.experience || "",
            specializations: parseJsonField(userData.specializations),
            certifications: parseJsonField(userData.certifications)
          })
          if (userData.privacySettings) setPrivacySettings(userData.privacySettings)
          if (userData.notificationSettings) setNotificationSettings(userData.notificationSettings)
        } else {
          console.error('Failed to fetch profile')
        }
      } catch (error) {
        console.error('Error fetching profile:', error)
      } finally {
        setLoading(false)
      }
    }

    fetchProfile()
  }, [])

  const handleInputChange = (field: string, value: string) => {
    setFormData(prev => ({ ...prev, [field]: value }))
  }

  const handleArrayInputChange = (field: string, value: string) => {
    const items = value.split(',').map(item => item.trim()).filter(item => item.length > 0)
    setFormData(prev => ({ ...prev, [field]: items }))
  }

  const handlePrivacyChange = (field: string, value: boolean) => {
    setPrivacySettings(prev => ({ ...prev, [field]: value }))
  }

  const handleNotificationChange = (field: string, value: boolean) => {
    setNotificationSettings(prev => ({ ...prev, [field]: value }))
  }

  const handleAvatarUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (!file) return

    // Validate file type
    const allowedTypes = ['image/jpeg', 'image/jpg', 'image/png', 'image/gif', 'image/webp']
    if (!allowedTypes.includes(file.type)) {
      alert('Invalid file type. Please upload a JPEG, PNG, GIF, or WebP image.')
      return
    }

    // Validate file size (max 5MB)
    const maxSize = 5 * 1024 * 1024
    if (file.size > maxSize) {
      alert('File too large. Maximum size is 5MB.')
      return
    }

    setUploadingAvatar(true)

    try {
      const formData = new FormData()
      formData.append('file', file)
      formData.append('type', 'avatars')
      formData.append('entityId', profile?.id || 'general')
      formData.append('subfolder', 'profile')

      const response = await fetch('/api/upload', {
        method: 'POST',
        body: formData,
      })

      if (response.ok) {
        const data = await response.json()
        setAvatarUrl(data.fileUrl)
        
        // Update user avatar in database
        await fetch('/api/user', {
          method: 'PUT',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({
            avatar: data.fileUrl
          }),
        })

        // Update local profile state
        if (profile) {
          setProfile({ ...profile, avatar: data.fileUrl })
        }

        alert('Profile picture updated successfully!')
      } else {
        const error = await response.json()
        alert(`Failed to upload: ${error.error || 'Unknown error'}`)
      }
    } catch (error) {
      console.error('Avatar upload error:', error)
      alert('An error occurred while uploading your profile picture')
    } finally {
      setUploadingAvatar(false)
    }
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setSaving(true)

    try {
      const response = await fetch('/api/user', {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          fullName: formData.fullName,
          username: formData.username,
          bio: formData.bio,
          location: formData.location,
          website: formData.website,
          phone: formData.phone,
          organization: formData.organization,
          pilotLicense: formData.pilotLicense,
          experience: formData.experience,
          specializations: formData.specializations,
          certifications: formData.certifications,
          privacySettings,
          notificationSettings,
        }),
      })

      if (response.ok) {
        const data = await response.json()
        // Also update role if changed
        if (formData.role && formData.role !== profile?.role) {
          await fetch('/api/profile/update', {
            method: 'POST',
            headers: {
              'Content-Type': 'application/json',
            },
            body: JSON.stringify({
              username: formData.username,
              role: formData.role,
              phone: formData.phone
            }),
          })
        }
        
        // Show success message and redirect
        alert('Profile updated successfully!')
        router.push(`/profile/${formData.username}`)
      } else {
        const error = await response.json()
        alert(`Failed to update profile: ${error.error || 'Unknown error'}`)
      }
      
    } catch (error) {
      console.error('Error updating profile:', error)
      alert('An error occurred while updating your profile')
    } finally {
      setSaving(false)
    }
  }

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-background">
        <div className="text-center">
          <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-primary mx-auto"></div>
          <p className="mt-4 text-muted-foreground">Loading profile...</p>
        </div>
      </div>
    )
  }

  if (!profile) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-background">
        <div className="text-center">
          <h1 className="text-2xl font-bold text-foreground mb-4">Profile not found</h1>
          <p className="text-muted-foreground">Unable to load your profile.</p>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-background">
      <div className="max-w-4xl mx-auto px-4 py-8">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-2xl font-bold text-foreground">Edit Profile</h1>
          <p className="text-muted-foreground">Update your profile information and settings</p>
        </div>

        {/* Tab Navigation */}
        <div className="flex flex-wrap gap-2 mb-6">
          {[
            { id: "basic", label: "Basic Info", icon: User },
            { id: "professional", label: "Professional", icon: Briefcase },
            { id: "privacy", label: "Privacy", icon: Shield },
            { id: "notifications", label: "Notifications", icon: Bell },
            { id: "mailing", label: "Mailing", icon: Mail },
            { id: "security", label: "Security", icon: Lock },
          ].map((tab) => (
            <button
              key={tab.id}
              type="button"
              onClick={() => setActiveTab(tab.id)}
              className={`inline-flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-medium border transition-colors ${
                activeTab === tab.id
                  ? "bg-primary text-primary-foreground border-primary shadow-sm"
                  : "bg-background hover:bg-muted border-border"
              }`}
            >
              <tab.icon className="h-4 w-4" />
              {tab.label}
            </button>
          ))}
        </div>

        <div className="space-y-6">
          <form onSubmit={handleSubmit}>
            {/* Basic Info Tab */}
            {activeTab === "basic" && (<div className="space-y-6">
              {/* Profile Picture */}
              <Card>
                <CardHeader>
                  <CardTitle>Profile Picture</CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="flex items-center gap-4">
                    <Avatar className="h-24 w-24">
                      <AvatarImage src={avatarUrl || profile.avatar} alt={profile.fullName} />
                      <AvatarFallback className="text-2xl font-bold">
                        {profile.fullName.split(' ').map(n => n[0]).join('')}
                      </AvatarFallback>
                    </Avatar>
                    <div className="space-y-2">
                      <input
                        type="file"
                        id="avatar-upload"
                        accept="image/jpeg,image/jpg,image/png,image/gif,image/webp"
                        onChange={handleAvatarUpload}
                        className="hidden"
                      />
                      <Button 
                        type="button" 
                        variant="outline" 
                        size="sm"
                        onClick={() => document.getElementById('avatar-upload')?.click()}
                        disabled={uploadingAvatar}
                      >
                        <Upload className="h-4 w-4 mr-2" />
                        {uploadingAvatar ? 'Uploading...' : 'Change Photo'}
                      </Button>
                      <p className="text-sm text-muted-foreground">
                        JPG, PNG, GIF, or WebP. Max size 5MB.
                      </p>
                    </div>
                  </div>
                </CardContent>
              </Card>

              {/* Basic Information */}
              <Card>
                <CardHeader>
                  <CardTitle>Basic Information</CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <Label htmlFor="fullName">First Name</Label>
                      <Input
                        id="fullName"
                        value={formData.fullName.split(' ')[0] || ""}
                        onChange={(e) => {
                          const lastName = formData.fullName.split(' ').slice(1).join(' ') || ""
                          handleInputChange('fullName', `${e.target.value} ${lastName}`.trim())
                        }}
                        placeholder="Enter your first name"
                        required
                      />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="lastName">Last Name</Label>
                      <Input
                        id="lastName"
                        value={formData.fullName.split(' ').slice(1).join(' ') || ""}
                        onChange={(e) => {
                          const firstName = formData.fullName.split(' ')[0] || ""
                          handleInputChange('fullName', `${firstName} ${e.target.value}`.trim())
                        }}
                        placeholder="Enter your last name"
                        required
                      />
                    </div>
                  </div>
                  
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <Label htmlFor="username">Username</Label>
                      <Input
                        id="username"
                        value={formData.username}
                        onChange={(e) => handleInputChange('username', e.target.value)}
                        placeholder="Enter username"
                        required
                      />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="email">Email</Label>
                      <Input
                        id="email"
                        value={profile.email}
                        disabled
                        className="bg-muted"
                      />
                      <p className="text-sm text-muted-foreground">
                        Email cannot be changed. Contact support if needed.
                      </p>
                    </div>
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <Label>Phone</Label>
                      <PhoneInput
                        value={formData.phone}
                        onChange={(val) => handleInputChange('phone', val)}
                        required
                      />
                    </div>
                    <div className="space-y-2">
                      <Label>Location</Label>
                      <LocationPicker
                        value={formData.location}
                        onChange={(val) => handleInputChange('location', val)}
                      />
                    </div>
                  </div>
                  
                  <div className="space-y-2">
                    <Label htmlFor="role">Role</Label>
                    <Select value={formData.role} onValueChange={(value) => handleInputChange('role', value)}>
                      <SelectTrigger>
                        <SelectValue placeholder="Select your role" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="hobbyist">Hobbyist</SelectItem>
                        <SelectItem value="pilot">Pilot</SelectItem>
                        <SelectItem value="student">Student</SelectItem>
                        <SelectItem value="service_provider">Service Provider</SelectItem>
                      </SelectContent>
                    </Select>
                    <p className="text-sm text-muted-foreground">
                      Choose the role that best describes you. Admin and Regulator roles require special approval.
                    </p>
                  </div>
                  
                  <div className="space-y-2">
                    <Label htmlFor="website">Website</Label>
                    <Input
                      id="website"
                      value={formData.website}
                      onChange={(e) => handleInputChange('website', e.target.value)}
                      placeholder="https://yourwebsite.com"
                      type="url"
                    />
                  </div>
                  
                  <div className="space-y-2">
                    <Label htmlFor="bio">Bio</Label>
                    <Textarea
                      id="bio"
                      value={formData.bio}
                      onChange={(e) => handleInputChange('bio', e.target.value)}
                      placeholder="Tell us about yourself..."
                      rows={4}
                    />
                  </div>
                </CardContent>
              </Card>

              <div className="flex justify-end gap-4 pt-6">
                <Link href={`/profile/${profile.username}`}>
                  <Button type="button" variant="outline">Cancel</Button>
                </Link>
                <Button type="submit" disabled={saving}>
                  <Save className="h-4 w-4 mr-2" />
                  {saving ? 'Saving...' : 'Save Changes'}
                </Button>
              </div>
            </div>)}

            {/* Professional Tab */}
            {activeTab === "professional" && (<div className="space-y-6">
              <Card>
                <CardHeader>
                  <CardTitle>Professional Information</CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <Label htmlFor="organization">Organization</Label>
                      <Input
                        id="organization"
                        value={formData.organization}
                        onChange={(e) => handleInputChange('organization', e.target.value)}
                        placeholder="Company or organization"
                      />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="pilotLicense">Pilot License</Label>
                      <Input
                        id="pilotLicense"
                        value={formData.pilotLicense}
                        onChange={(e) => handleInputChange('pilotLicense', e.target.value)}
                        placeholder="License number"
                      />
                    </div>
                  </div>
                  
                  <div className="space-y-2">
                    <Label htmlFor="experience">Experience</Label>
                    <Select value={formData.experience} onValueChange={(value) => handleInputChange('experience', value)}>
                      <SelectTrigger>
                        <SelectValue placeholder="Select experience level" />
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
                    <Label htmlFor="specializations">Specializations</Label>
                    <Input
                      id="specializations"
                      value={formData.specializations.join(', ')}
                      onChange={(e) => handleArrayInputChange('specializations', e.target.value)}
                      placeholder="Aerial Photography, Mapping, Delivery (comma separated)"
                    />
                    <p className="text-sm text-muted-foreground">
                      Enter your specializations separated by commas
                    </p>
                  </div>
                  
                  <div className="space-y-2">
                    <Label htmlFor="certifications">Certifications</Label>
                    <Input
                      id="certifications"
                      value={formData.certifications.join(', ')}
                      onChange={(e) => handleArrayInputChange('certifications', e.target.value)}
                      placeholder="Commercial Pilot License, RCAA Certified (comma separated)"
                    />
                    <p className="text-sm text-muted-foreground">
                      Enter your certifications separated by commas
                    </p>
                  </div>
                </CardContent>
              </Card>

              <div className="flex justify-end gap-4 pt-6">
                <Link href={`/profile/${profile.username}`}>
                  <Button type="button" variant="outline">Cancel</Button>
                </Link>
                <Button type="submit" disabled={saving}>
                  <Save className="h-4 w-4 mr-2" />
                  {saving ? 'Saving...' : 'Save Changes'}
                </Button>
              </div>
            </div>)}

            {/* Privacy Tab */}
            {activeTab === "privacy" && (<div className="space-y-6">
              <Card>
                <CardHeader>
                  <CardTitle>Privacy Settings</CardTitle>
                </CardHeader>
                <CardContent className="space-y-6">
                  <div className="space-y-4">
                    <div className="flex items-center justify-between">
                      <div>
                        <Label htmlFor="profilePublic">Public Profile</Label>
                        <p className="text-sm text-muted-foreground">
                          Allow other users to view your profile
                        </p>
                      </div>
                      <Switch
                        id="profilePublic"
                        checked={privacySettings.profilePublic}
                        onCheckedChange={(checked) => handlePrivacyChange('profilePublic', checked)}
                      />
                    </div>
                    
                    <div className="flex items-center justify-between">
                      <div>
                        <Label htmlFor="showEmail">Show Email</Label>
                        <p className="text-sm text-muted-foreground">
                          Display your email on your public profile
                        </p>
                      </div>
                      <Switch
                        id="showEmail"
                        checked={privacySettings.showEmail}
                        onCheckedChange={(checked) => handlePrivacyChange('showEmail', checked)}
                      />
                    </div>
                    
                    <div className="flex items-center justify-between">
                      <div>
                        <Label htmlFor="showPhone">Show Phone</Label>
                        <p className="text-sm text-muted-foreground">
                          Display your phone number on your public profile
                        </p>
                      </div>
                      <Switch
                        id="showPhone"
                        checked={privacySettings.showPhone}
                        onCheckedChange={(checked) => handlePrivacyChange('showPhone', checked)}
                      />
                    </div>
                    
                    <div className="flex items-center justify-between">
                      <div>
                        <Label htmlFor="showLocation">Show Location</Label>
                        <p className="text-sm text-muted-foreground">
                          Display your location on your public profile
                        </p>
                      </div>
                      <Switch
                        id="showLocation"
                        checked={privacySettings.showLocation}
                        onCheckedChange={(checked) => handlePrivacyChange('showLocation', checked)}
                      />
                    </div>
                    
                    <div className="flex items-center justify-between">
                      <div>
                        <Label htmlFor="showStats">Show Statistics</Label>
                        <p className="text-sm text-muted-foreground">
                          Display your activity statistics publicly
                        </p>
                      </div>
                      <Switch
                        id="showStats"
                        checked={privacySettings.showStats}
                        onCheckedChange={(checked) => handlePrivacyChange('showStats', checked)}
                      />
                    </div>
                  </div>
                </CardContent>
              </Card>

              <div className="flex justify-end gap-4 pt-6">
                <Link href={`/profile/${profile.username}`}>
                  <Button type="button" variant="outline">Cancel</Button>
                </Link>
                <Button type="submit" disabled={saving}>
                  <Save className="h-4 w-4 mr-2" />
                  {saving ? 'Saving...' : 'Save Changes'}
                </Button>
              </div>
            </div>)}

            {/* Notifications Tab */}
            {activeTab === "notifications" && (<div className="space-y-6">
              <Card>
                <CardHeader>
                  <CardTitle>Notification Preferences</CardTitle>
                </CardHeader>
                <CardContent className="space-y-6">
                  <div className="space-y-4">
                    <div className="flex items-center justify-between">
                      <div>
                        <Label htmlFor="emailNotifications">Email Notifications</Label>
                        <p className="text-sm text-muted-foreground">
                          Receive notifications via email
                        </p>
                      </div>
                      <Switch
                        id="emailNotifications"
                        checked={notificationSettings.emailNotifications}
                        onCheckedChange={(checked) => handleNotificationChange('emailNotifications', checked)}
                      />
                    </div>
                    
                    <div className="flex items-center justify-between">
                      <div>
                        <Label htmlFor="pushNotifications">Push Notifications</Label>
                        <p className="text-sm text-muted-foreground">
                          Receive push notifications in your browser
                        </p>
                      </div>
                      <Switch
                        id="pushNotifications"
                        checked={notificationSettings.pushNotifications}
                        onCheckedChange={(checked) => handleNotificationChange('pushNotifications', checked)}
                      />
                    </div>
                    
                    <div className="flex items-center justify-between">
                      <div>
                        <Label htmlFor="forumUpdates">Forum Updates</Label>
                        <p className="text-sm text-muted-foreground">
                          Notify me about forum posts and comments
                        </p>
                      </div>
                      <Switch
                        id="forumUpdates"
                        checked={notificationSettings.forumUpdates}
                        onCheckedChange={(checked) => handleNotificationChange('forumUpdates', checked)}
                      />
                    </div>
                    
                    <div className="flex items-center justify-between">
                      <div>
                        <Label htmlFor="projectUpdates">Project Updates</Label>
                        <p className="text-sm text-muted-foreground">
                          Notify me about project updates and opportunities
                        </p>
                      </div>
                      <Switch
                        id="projectUpdates"
                        checked={notificationSettings.projectUpdates}
                        onCheckedChange={(checked) => handleNotificationChange('projectUpdates', checked)}
                      />
                    </div>
                    
                    <div className="flex items-center justify-between">
                      <div>
                        <Label htmlFor="eventReminders">Event Reminders</Label>
                        <p className="text-sm text-muted-foreground">
                          Send reminders for upcoming events
                        </p>
                      </div>
                      <Switch
                        id="eventReminders"
                        checked={notificationSettings.eventReminders}
                        onCheckedChange={(checked) => handleNotificationChange('eventReminders', checked)}
                      />
                    </div>
                    
                    <div className="flex items-center justify-between">
                      <div>
                        <Label htmlFor="weeklyDigest">Weekly Digest</Label>
                        <p className="text-sm text-muted-foreground">
                          Receive a weekly summary of community activity
                        </p>
                      </div>
                      <Switch
                        id="weeklyDigest"
                        checked={notificationSettings.weeklyDigest}
                        onCheckedChange={(checked) => handleNotificationChange('weeklyDigest', checked)}
                      />
                    </div>
                  </div>
                </CardContent>
              </Card>

              <div className="flex justify-end gap-4 pt-6">
                <Link href={`/profile/${profile.username}`}>
                  <Button type="button" variant="outline">Cancel</Button>
                </Link>
                <Button type="submit" disabled={saving}>
                  <Save className="h-4 w-4 mr-2" />
                  {saving ? 'Saving...' : 'Save Changes'}
                </Button>
              </div>
            </div>)}

            {/* Mailing Tab */}
            {activeTab === "mailing" && (<div className="space-y-6">
              <MailingPreferencesForm email={profile.email} />

              <div className="flex justify-end gap-4 pt-6">
                <Link href={`/profile/${profile.username}`}>
                  <Button type="button" variant="outline">Cancel</Button>
                </Link>
                <Button type="submit" disabled={saving}>
                  <Save className="h-4 w-4 mr-2" />
                  {saving ? 'Saving...' : 'Save Changes'}
                </Button>
              </div>
            </div>)}
          </form>

          {/* Security Tab — outside profile form to avoid nested <form> */}
          {activeTab === "security" && (<div className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle>Change Password</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <PasswordChangeForm />
              </CardContent>
            </Card>
          </div>)}
        </div>
      </div>
    </div>
  )
}

const MAILING_TOPICS = [
  { id: "events",        label: "Events & Programmes",     desc: "Workshops, meetups and competitions" },
  { id: "opportunities", label: "Opportunities & Jobs",    desc: "Grants, jobs and open calls" },
  { id: "projects",      label: "Community Projects",      desc: "New projects shared by members" },
  { id: "resources",     label: "Resources & Guides",      desc: "Manuals, reports and reference docs" },
  { id: "forum",         label: "Forum Highlights",        desc: "Top discussions and answers" },
  { id: "news",          label: "Platform News",           desc: "Updates about the RDC platform" },
]

function MailingPreferencesForm({ email }: { email: string }) {
  const [subStatus, setSubStatus]   = useState<"loading"|"subscribed"|"unsubscribed"|"none">("loading")
  const [topics, setTopics]         = useState<string[]>([])
  const [saving, setSaving]         = useState(false)
  const [saved, setSaved]           = useState(false)
  const [token, setToken]           = useState("")

  useEffect(() => {
    // Load existing subscription by trying to subscribe with 0 topics (idempotent PUT)
    fetch("/api/subscribe", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ email, topics: [] }),
    })
      .then(r => r.json())
      .then(d => {
        if (d.success) {
          setToken(d.token || "")
          // Load their current topics via a GET-like POST
          return fetch(`/api/subscribe?email=${encodeURIComponent(email)}`)
            .then(r => r.json())
            .then(sub => {
              setTopics(sub.topics || [])
              setSubStatus(sub.isActive ? "subscribed" : "unsubscribed")
            })
            .catch(() => { setTopics([]); setSubStatus("subscribed") })
        }
      })
      .catch(() => setSubStatus("none"))
  }, [email])

  function toggleTopic(id: string) {
    setTopics(prev => prev.includes(id) ? prev.filter(t => t !== id) : [...prev, id])
    setSaved(false)
  }

  async function savePreferences() {
    setSaving(true)
    const res = await fetch("/api/subscribe", {
      method: "PUT",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ email, topics }),
    }).catch(() => null)
    setSaving(false)
    if (res?.ok) { setSaved(true); setSubStatus("subscribed"); setTimeout(() => setSaved(false), 3000) }
  }

  async function unsubscribe() {
    if (!token) return
    await fetch("/api/unsubscribe", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ token }),
    })
    setSubStatus("unsubscribed")
  }

  async function resubscribe() {
    const res = await fetch("/api/subscribe", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ email, topics: topics.length ? topics : ["events","news"] }),
    }).then(r => r.json()).catch(() => null)
    if (res?.success) { setToken(res.token); setSubStatus("subscribed") }
  }

  if (subStatus === "loading") return <p className="text-sm text-muted-foreground py-4">Loading preferences…</p>

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2"><Mail className="h-5 w-5" /> Mailing Preferences</CardTitle>
      </CardHeader>
      <CardContent className="space-y-6">
        {subStatus === "unsubscribed" ? (
          <div className="space-y-3">
            <p className="text-sm text-muted-foreground">You are currently unsubscribed from community emails.</p>
            <Button type="button" onClick={resubscribe} style={{ background: "linear-gradient(135deg,#002674,#0058dd)", color: "#fff" }}>
              Re-subscribe
            </Button>
          </div>
        ) : (
          <>
            <p className="text-sm text-muted-foreground">Choose which types of content you want to receive at <strong>{email}</strong>.</p>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              {MAILING_TOPICS.map(t => (
                <label key={t.id} style={{ display: "flex", alignItems: "flex-start", gap: 12, padding: "12px 14px", borderRadius: 10, border: `1px solid ${topics.includes(t.id) ? "#0058dd" : "rgba(0,38,116,0.1)"}`, background: topics.includes(t.id) ? "rgba(0,88,221,0.04)" : "#fff", cursor: "pointer" }}>
                  <input
                    type="checkbox"
                    checked={topics.includes(t.id)}
                    onChange={() => toggleTopic(t.id)}
                    style={{ accentColor: "#0058dd", marginTop: 2, flexShrink: 0 }}
                  />
                  <div>
                    <p style={{ fontWeight: 600, fontSize: 13, color: "#0f172a", margin: "0 0 2px" }}>{t.label}</p>
                    <p style={{ fontSize: 12, color: "#64748b", margin: 0 }}>{t.desc}</p>
                  </div>
                </label>
              ))}
            </div>
            <div className="flex items-center gap-3">
              <Button type="button" onClick={savePreferences} disabled={saving} style={{ background: "linear-gradient(135deg,#002674,#0058dd)", color: "#fff" }}>
                {saving ? "Saving…" : "Save Preferences"}
              </Button>
              {saved && <span className="text-sm text-green-600">✓ Saved</span>}
              <button type="button" onClick={unsubscribe} style={{ fontSize: 13, color: "#94a3b8", background: "none", border: "none", cursor: "pointer", textDecoration: "underline" }}>
                Unsubscribe from all
              </button>
            </div>
          </>
        )}
      </CardContent>
    </Card>
  )
}

export default function EditProfilePage() {
  return (
    <AuthGuard 
      requiredPermissions={["authenticated"]}
      fallback={
        <div className="text-center py-12">
          <p className="text-muted-foreground mb-4">
            You need to be logged in to edit your profile.
          </p>
        </div>
      }
    >
      <EditProfilePageContent />
    </AuthGuard>
  )
} 

function PasswordChangeForm() {
  const [currentPassword, setCurrentPassword] = useState("")
  const [newPassword, setNewPassword] = useState("")
  const [confirmNewPassword, setConfirmNewPassword] = useState("")
  const [submitting, setSubmitting] = useState(false)
  const [message, setMessage] = useState<string | null>(null)
  const [error, setError] = useState<string | null>(null)

  const onSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setSubmitting(true)
    setMessage(null)
    setError(null)

    try {
      const res = await fetch('/api/auth/change-password', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ currentPassword, newPassword, confirmNewPassword })
      })

      if (res.ok) {
        setMessage('Password updated successfully')
        setCurrentPassword("")
        setNewPassword("")
        setConfirmNewPassword("")
      } else {
        const data = await res.json().catch(() => ({} as any))
        setError(data.error || 'Failed to change password')
      }
    } catch (err) {
      setError('Failed to change password')
    } finally {
      setSubmitting(false)
    }
  }

  return (
    <form onSubmit={onSubmit} className="space-y-4">
      <div className="space-y-2">
        <Label htmlFor="currentPassword">Current Password</Label>
        <Input id="currentPassword" type="password" value={currentPassword} onChange={(e) => setCurrentPassword(e.target.value)} required />
      </div>
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div className="space-y-2">
          <Label htmlFor="newPassword">New Password</Label>
          <Input id="newPassword" type="password" value={newPassword} onChange={(e) => setNewPassword(e.target.value)} required />
          <p className="text-xs text-muted-foreground">At least 8 chars, include upper, lower and a number.</p>
        </div>
        <div className="space-y-2">
          <Label htmlFor="confirmNewPassword">Confirm New Password</Label>
          <Input id="confirmNewPassword" type="password" value={confirmNewPassword} onChange={(e) => setConfirmNewPassword(e.target.value)} required />
        </div>
      </div>
      {message && <p className="text-sm text-green-600">{message}</p>}
      {error && <p className="text-sm text-red-600">{error}</p>}
      <div className="flex justify-end">
        <Button type="submit" disabled={submitting}>{submitting ? 'Updating...' : 'Update Password'}</Button>
      </div>
    </form>
  )
}