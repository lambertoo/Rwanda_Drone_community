"use client"

import { useState, useEffect } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { useToast } from "@/hooks/use-toast"
import { useAuth } from "@/lib/auth-context"
import { Users, Download, Mail, Calendar } from "lucide-react"

interface Participant {
  id: string
  user: {
    id: string
    username: string
    email: string
    fullName: string
    avatar: string | null
    role: string
    joinedAt: string
  }
  createdAt: string
}

interface EventParticipantsProps {
  eventId: string
  eventTitle: string
  organizerId: string
}

export default function EventParticipants({
  eventId,
  eventTitle,
  organizerId
}: EventParticipantsProps) {
  const { toast } = useToast()
  const { user } = useAuth()
  const [participants, setParticipants] = useState<Participant[]>([])
  const [loading, setLoading] = useState(true)
  const [exporting, setExporting] = useState(false)

  // Check if user can view participants
  const canViewParticipants = user && (user.id === organizerId || user.role === 'admin')

  useEffect(() => {
    if (canViewParticipants) {
      fetchParticipants()
    }
  }, [eventId, canViewParticipants])

  const fetchParticipants = async () => {
    try {
      const response = await fetch(`/api/events/${eventId}/rsvp`, {
        credentials: 'include'
      })

      if (response.ok) {
        const data = await response.json()
        setParticipants(data.rsvps || [])
      } else {
        toast({
          title: "Error",
          description: "Failed to fetch participants",
          variant: "destructive",
        })
      }
    } catch (error) {
      console.error('Error fetching participants:', error)
      toast({
        title: "Error",
        description: "Failed to fetch participants",
        variant: "destructive",
      })
    } finally {
      setLoading(false)
    }
  }

  const exportParticipants = async () => {
    setExporting(true)

    try {
      // Create CSV content
      const csvContent = [
        ['Name', 'Email', 'Role', 'Joined Date', 'RSVP Date'],
        ...participants.map(p => [
          p.user.fullName || p.user.username,
          p.user.email,
          p.user.role,
          new Date(p.user.joinedAt).toLocaleDateString(),
          new Date(p.createdAt).toLocaleDateString()
        ])
      ].map(row => row.join(',')).join('\n')

      // Create and download file
      const blob = new Blob([csvContent], { type: 'text/csv' })
      const url = window.URL.createObjectURL(blob)
      const a = document.createElement('a')
      a.href = url
      a.download = `${eventTitle.replace(/[^a-z0-9]/gi, '_').toLowerCase()}_participants.csv`
      document.body.appendChild(a)
      a.click()
      window.URL.revokeObjectURL(url)
      document.body.removeChild(a)

      toast({
        title: "Export Successful",
        description: "Participants list has been exported to CSV",
        variant: "default",
      })
    } catch (error) {
      console.error('Error exporting participants:', error)
      toast({
        title: "Export Failed",
        description: "Failed to export participants list",
        variant: "destructive",
      })
    } finally {
      setExporting(false)
    }
  }

  const sendEmailToParticipants = () => {
    // This would integrate with an email service
    toast({
      title: "Feature Coming Soon",
      description: "Email functionality will be available in the next update",
      variant: "default",
    })
  }

  if (!canViewParticipants) {
    return null
  }

  if (loading) {
    return (
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Users className="h-5 w-5" />
            Event Participants
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="animate-pulse space-y-3">
            {[1, 2, 3].map((i) => (
              <div key={i} className="flex items-center gap-3">
                <div className="w-10 h-10 bg-gray-200 rounded-full"></div>
                <div className="space-y-2">
                  <div className="h-4 bg-gray-200 rounded w-32"></div>
                  <div className="h-3 bg-gray-200 rounded w-24"></div>
                </div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>
    )
  }

  return (
    <Card>
      <CardHeader>
        <div className="flex items-center justify-between">
          <div>
            <CardTitle className="flex items-center gap-2">
              <Users className="h-5 w-5" />
              Event Participants
            </CardTitle>
            <CardDescription>
              {participants.length} participant{participants.length !== 1 ? 's' : ''} registered
            </CardDescription>
          </div>
          
          <div className="flex gap-2">
            <Button
              onClick={exportParticipants}
              disabled={exporting || participants.length === 0}
              variant="outline"
              size="sm"
            >
              <Download className="h-4 w-4 mr-2" />
              {exporting ? "Exporting..." : "Export CSV"}
            </Button>
            
            <Button
              onClick={sendEmailToParticipants}
              disabled={participants.length === 0}
              variant="outline"
              size="sm"
            >
              <Mail className="h-4 w-4 mr-2" />
              Email All
            </Button>
          </div>
        </div>
      </CardHeader>
      
      <CardContent>
        {participants.length === 0 ? (
          <div className="text-center py-8">
            <Users className="h-12 w-12 text-gray-400 mx-auto mb-4" />
            <p className="text-gray-500">No participants registered yet.</p>
          </div>
        ) : (
          <div className="space-y-4">
            {participants.map((participant) => (
              <div
                key={participant.id}
                className="flex items-center justify-between p-4 border rounded-lg hover:bg-gray-50 transition-colors"
              >
                <div className="flex items-center gap-3">
                  <Avatar className="h-10 w-10">
                    <AvatarImage src={participant.user.avatar || undefined} />
                    <AvatarFallback>
                      {participant.user.fullName?.charAt(0) || participant.user.username.charAt(0)}
                    </AvatarFallback>
                  </Avatar>
                  
                  <div>
                    <div className="flex items-center gap-2">
                      <p className="font-medium text-gray-900">
                        {participant.user.fullName || participant.user.username}
                      </p>
                      <Badge variant="secondary" className="text-xs">
                        {participant.user.role}
                      </Badge>
                    </div>
                    
                    <div className="flex items-center gap-4 text-sm text-gray-500">
                      <span className="flex items-center gap-1">
                        <Mail className="h-3 w-3" />
                        {participant.user.email}
                      </span>
                      <span className="flex items-center gap-1">
                        <Calendar className="h-3 w-3" />
                        Joined {new Date(participant.user.joinedAt).toLocaleDateString()}
                      </span>
                    </div>
                  </div>
                </div>
                
                <div className="text-right">
                  <p className="text-sm text-gray-500">
                    RSVP'd on {new Date(participant.createdAt).toLocaleDateString()}
                  </p>
                </div>
              </div>
            ))}
          </div>
        )}
      </CardContent>
    </Card>
  )
} 

import { useState, useEffect } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { useToast } from "@/hooks/use-toast"
import { useAuth } from "@/lib/auth-context"
import { Users, Download, Mail, Calendar } from "lucide-react"

interface Participant {
  id: string
  user: {
    id: string
    username: string
    email: string
    fullName: string
    avatar: string | null
    role: string
    joinedAt: string
  }
  createdAt: string
}

interface EventParticipantsProps {
  eventId: string
  eventTitle: string
  organizerId: string
}

export default function EventParticipants({
  eventId,
  eventTitle,
  organizerId
}: EventParticipantsProps) {
  const { toast } = useToast()
  const { user } = useAuth()
  const [participants, setParticipants] = useState<Participant[]>([])
  const [loading, setLoading] = useState(true)
  const [exporting, setExporting] = useState(false)

  // Check if user can view participants
  const canViewParticipants = user && (user.id === organizerId || user.role === 'admin')

  useEffect(() => {
    if (canViewParticipants) {
      fetchParticipants()
    }
  }, [eventId, canViewParticipants])

  const fetchParticipants = async () => {
    try {
      const response = await fetch(`/api/events/${eventId}/rsvp`, {
        credentials: 'include'
      })

      if (response.ok) {
        const data = await response.json()
        setParticipants(data.rsvps || [])
      } else {
        toast({
          title: "Error",
          description: "Failed to fetch participants",
          variant: "destructive",
        })
      }
    } catch (error) {
      console.error('Error fetching participants:', error)
      toast({
        title: "Error",
        description: "Failed to fetch participants",
        variant: "destructive",
      })
    } finally {
      setLoading(false)
    }
  }

  const exportParticipants = async () => {
    setExporting(true)

    try {
      // Create CSV content
      const csvContent = [
        ['Name', 'Email', 'Role', 'Joined Date', 'RSVP Date'],
        ...participants.map(p => [
          p.user.fullName || p.user.username,
          p.user.email,
          p.user.role,
          new Date(p.user.joinedAt).toLocaleDateString(),
          new Date(p.createdAt).toLocaleDateString()
        ])
      ].map(row => row.join(',')).join('\n')

      // Create and download file
      const blob = new Blob([csvContent], { type: 'text/csv' })
      const url = window.URL.createObjectURL(blob)
      const a = document.createElement('a')
      a.href = url
      a.download = `${eventTitle.replace(/[^a-z0-9]/gi, '_').toLowerCase()}_participants.csv`
      document.body.appendChild(a)
      a.click()
      window.URL.revokeObjectURL(url)
      document.body.removeChild(a)

      toast({
        title: "Export Successful",
        description: "Participants list has been exported to CSV",
        variant: "default",
      })
    } catch (error) {
      console.error('Error exporting participants:', error)
      toast({
        title: "Export Failed",
        description: "Failed to export participants list",
        variant: "destructive",
      })
    } finally {
      setExporting(false)
    }
  }

  const sendEmailToParticipants = () => {
    // This would integrate with an email service
    toast({
      title: "Feature Coming Soon",
      description: "Email functionality will be available in the next update",
      variant: "default",
    })
  }

  if (!canViewParticipants) {
    return null
  }

  if (loading) {
    return (
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Users className="h-5 w-5" />
            Event Participants
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="animate-pulse space-y-3">
            {[1, 2, 3].map((i) => (
              <div key={i} className="flex items-center gap-3">
                <div className="w-10 h-10 bg-gray-200 rounded-full"></div>
                <div className="space-y-2">
                  <div className="h-4 bg-gray-200 rounded w-32"></div>
                  <div className="h-3 bg-gray-200 rounded w-24"></div>
                </div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>
    )
  }

  return (
    <Card>
      <CardHeader>
        <div className="flex items-center justify-between">
          <div>
            <CardTitle className="flex items-center gap-2">
              <Users className="h-5 w-5" />
              Event Participants
            </CardTitle>
            <CardDescription>
              {participants.length} participant{participants.length !== 1 ? 's' : ''} registered
            </CardDescription>
          </div>
          
          <div className="flex gap-2">
            <Button
              onClick={exportParticipants}
              disabled={exporting || participants.length === 0}
              variant="outline"
              size="sm"
            >
              <Download className="h-4 w-4 mr-2" />
              {exporting ? "Exporting..." : "Export CSV"}
            </Button>
            
            <Button
              onClick={sendEmailToParticipants}
              disabled={participants.length === 0}
              variant="outline"
              size="sm"
            >
              <Mail className="h-4 w-4 mr-2" />
              Email All
            </Button>
          </div>
        </div>
      </CardHeader>
      
      <CardContent>
        {participants.length === 0 ? (
          <div className="text-center py-8">
            <Users className="h-12 w-12 text-gray-400 mx-auto mb-4" />
            <p className="text-gray-500">No participants registered yet.</p>
          </div>
        ) : (
          <div className="space-y-4">
            {participants.map((participant) => (
              <div
                key={participant.id}
                className="flex items-center justify-between p-4 border rounded-lg hover:bg-gray-50 transition-colors"
              >
                <div className="flex items-center gap-3">
                  <Avatar className="h-10 w-10">
                    <AvatarImage src={participant.user.avatar || undefined} />
                    <AvatarFallback>
                      {participant.user.fullName?.charAt(0) || participant.user.username.charAt(0)}
                    </AvatarFallback>
                  </Avatar>
                  
                  <div>
                    <div className="flex items-center gap-2">
                      <p className="font-medium text-gray-900">
                        {participant.user.fullName || participant.user.username}
                      </p>
                      <Badge variant="secondary" className="text-xs">
                        {participant.user.role}
                      </Badge>
                    </div>
                    
                    <div className="flex items-center gap-4 text-sm text-gray-500">
                      <span className="flex items-center gap-1">
                        <Mail className="h-3 w-3" />
                        {participant.user.email}
                      </span>
                      <span className="flex items-center gap-1">
                        <Calendar className="h-3 w-3" />
                        Joined {new Date(participant.user.joinedAt).toLocaleDateString()}
                      </span>
                    </div>
                  </div>
                </div>
                
                <div className="text-right">
                  <p className="text-sm text-gray-500">
                    RSVP'd on {new Date(participant.createdAt).toLocaleDateString()}
                  </p>
                </div>
              </div>
            ))}
          </div>
        )}
      </CardContent>
    </Card>
  )
} 
 
 
 

import { useState, useEffect } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { useToast } from "@/hooks/use-toast"
import { useAuth } from "@/lib/auth-context"
import { Users, Download, Mail, Calendar } from "lucide-react"

interface Participant {
  id: string
  user: {
    id: string
    username: string
    email: string
    fullName: string
    avatar: string | null
    role: string
    joinedAt: string
  }
  createdAt: string
}

interface EventParticipantsProps {
  eventId: string
  eventTitle: string
  organizerId: string
}

export default function EventParticipants({
  eventId,
  eventTitle,
  organizerId
}: EventParticipantsProps) {
  const { toast } = useToast()
  const { user } = useAuth()
  const [participants, setParticipants] = useState<Participant[]>([])
  const [loading, setLoading] = useState(true)
  const [exporting, setExporting] = useState(false)

  // Check if user can view participants
  const canViewParticipants = user && (user.id === organizerId || user.role === 'admin')

  useEffect(() => {
    if (canViewParticipants) {
      fetchParticipants()
    }
  }, [eventId, canViewParticipants])

  const fetchParticipants = async () => {
    try {
      const response = await fetch(`/api/events/${eventId}/rsvp`, {
        credentials: 'include'
      })

      if (response.ok) {
        const data = await response.json()
        setParticipants(data.rsvps || [])
      } else {
        toast({
          title: "Error",
          description: "Failed to fetch participants",
          variant: "destructive",
        })
      }
    } catch (error) {
      console.error('Error fetching participants:', error)
      toast({
        title: "Error",
        description: "Failed to fetch participants",
        variant: "destructive",
      })
    } finally {
      setLoading(false)
    }
  }

  const exportParticipants = async () => {
    setExporting(true)

    try {
      // Create CSV content
      const csvContent = [
        ['Name', 'Email', 'Role', 'Joined Date', 'RSVP Date'],
        ...participants.map(p => [
          p.user.fullName || p.user.username,
          p.user.email,
          p.user.role,
          new Date(p.user.joinedAt).toLocaleDateString(),
          new Date(p.createdAt).toLocaleDateString()
        ])
      ].map(row => row.join(',')).join('\n')

      // Create and download file
      const blob = new Blob([csvContent], { type: 'text/csv' })
      const url = window.URL.createObjectURL(blob)
      const a = document.createElement('a')
      a.href = url
      a.download = `${eventTitle.replace(/[^a-z0-9]/gi, '_').toLowerCase()}_participants.csv`
      document.body.appendChild(a)
      a.click()
      window.URL.revokeObjectURL(url)
      document.body.removeChild(a)

      toast({
        title: "Export Successful",
        description: "Participants list has been exported to CSV",
        variant: "default",
      })
    } catch (error) {
      console.error('Error exporting participants:', error)
      toast({
        title: "Export Failed",
        description: "Failed to export participants list",
        variant: "destructive",
      })
    } finally {
      setExporting(false)
    }
  }

  const sendEmailToParticipants = () => {
    // This would integrate with an email service
    toast({
      title: "Feature Coming Soon",
      description: "Email functionality will be available in the next update",
      variant: "default",
    })
  }

  if (!canViewParticipants) {
    return null
  }

  if (loading) {
    return (
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Users className="h-5 w-5" />
            Event Participants
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="animate-pulse space-y-3">
            {[1, 2, 3].map((i) => (
              <div key={i} className="flex items-center gap-3">
                <div className="w-10 h-10 bg-gray-200 rounded-full"></div>
                <div className="space-y-2">
                  <div className="h-4 bg-gray-200 rounded w-32"></div>
                  <div className="h-3 bg-gray-200 rounded w-24"></div>
                </div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>
    )
  }

  return (
    <Card>
      <CardHeader>
        <div className="flex items-center justify-between">
          <div>
            <CardTitle className="flex items-center gap-2">
              <Users className="h-5 w-5" />
              Event Participants
            </CardTitle>
            <CardDescription>
              {participants.length} participant{participants.length !== 1 ? 's' : ''} registered
            </CardDescription>
          </div>
          
          <div className="flex gap-2">
            <Button
              onClick={exportParticipants}
              disabled={exporting || participants.length === 0}
              variant="outline"
              size="sm"
            >
              <Download className="h-4 w-4 mr-2" />
              {exporting ? "Exporting..." : "Export CSV"}
            </Button>
            
            <Button
              onClick={sendEmailToParticipants}
              disabled={participants.length === 0}
              variant="outline"
              size="sm"
            >
              <Mail className="h-4 w-4 mr-2" />
              Email All
            </Button>
          </div>
        </div>
      </CardHeader>
      
      <CardContent>
        {participants.length === 0 ? (
          <div className="text-center py-8">
            <Users className="h-12 w-12 text-gray-400 mx-auto mb-4" />
            <p className="text-gray-500">No participants registered yet.</p>
          </div>
        ) : (
          <div className="space-y-4">
            {participants.map((participant) => (
              <div
                key={participant.id}
                className="flex items-center justify-between p-4 border rounded-lg hover:bg-gray-50 transition-colors"
              >
                <div className="flex items-center gap-3">
                  <Avatar className="h-10 w-10">
                    <AvatarImage src={participant.user.avatar || undefined} />
                    <AvatarFallback>
                      {participant.user.fullName?.charAt(0) || participant.user.username.charAt(0)}
                    </AvatarFallback>
                  </Avatar>
                  
                  <div>
                    <div className="flex items-center gap-2">
                      <p className="font-medium text-gray-900">
                        {participant.user.fullName || participant.user.username}
                      </p>
                      <Badge variant="secondary" className="text-xs">
                        {participant.user.role}
                      </Badge>
                    </div>
                    
                    <div className="flex items-center gap-4 text-sm text-gray-500">
                      <span className="flex items-center gap-1">
                        <Mail className="h-3 w-3" />
                        {participant.user.email}
                      </span>
                      <span className="flex items-center gap-1">
                        <Calendar className="h-3 w-3" />
                        Joined {new Date(participant.user.joinedAt).toLocaleDateString()}
                      </span>
                    </div>
                  </div>
                </div>
                
                <div className="text-right">
                  <p className="text-sm text-gray-500">
                    RSVP'd on {new Date(participant.createdAt).toLocaleDateString()}
                  </p>
                </div>
              </div>
            ))}
          </div>
        )}
      </CardContent>
    </Card>
  )
} 

import { useState, useEffect } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { useToast } from "@/hooks/use-toast"
import { useAuth } from "@/lib/auth-context"
import { Users, Download, Mail, Calendar } from "lucide-react"

interface Participant {
  id: string
  user: {
    id: string
    username: string
    email: string
    fullName: string
    avatar: string | null
    role: string
    joinedAt: string
  }
  createdAt: string
}

interface EventParticipantsProps {
  eventId: string
  eventTitle: string
  organizerId: string
}

export default function EventParticipants({
  eventId,
  eventTitle,
  organizerId
}: EventParticipantsProps) {
  const { toast } = useToast()
  const { user } = useAuth()
  const [participants, setParticipants] = useState<Participant[]>([])
  const [loading, setLoading] = useState(true)
  const [exporting, setExporting] = useState(false)

  // Check if user can view participants
  const canViewParticipants = user && (user.id === organizerId || user.role === 'admin')

  useEffect(() => {
    if (canViewParticipants) {
      fetchParticipants()
    }
  }, [eventId, canViewParticipants])

  const fetchParticipants = async () => {
    try {
      const response = await fetch(`/api/events/${eventId}/rsvp`, {
        credentials: 'include'
      })

      if (response.ok) {
        const data = await response.json()
        setParticipants(data.rsvps || [])
      } else {
        toast({
          title: "Error",
          description: "Failed to fetch participants",
          variant: "destructive",
        })
      }
    } catch (error) {
      console.error('Error fetching participants:', error)
      toast({
        title: "Error",
        description: "Failed to fetch participants",
        variant: "destructive",
      })
    } finally {
      setLoading(false)
    }
  }

  const exportParticipants = async () => {
    setExporting(true)

    try {
      // Create CSV content
      const csvContent = [
        ['Name', 'Email', 'Role', 'Joined Date', 'RSVP Date'],
        ...participants.map(p => [
          p.user.fullName || p.user.username,
          p.user.email,
          p.user.role,
          new Date(p.user.joinedAt).toLocaleDateString(),
          new Date(p.createdAt).toLocaleDateString()
        ])
      ].map(row => row.join(',')).join('\n')

      // Create and download file
      const blob = new Blob([csvContent], { type: 'text/csv' })
      const url = window.URL.createObjectURL(blob)
      const a = document.createElement('a')
      a.href = url
      a.download = `${eventTitle.replace(/[^a-z0-9]/gi, '_').toLowerCase()}_participants.csv`
      document.body.appendChild(a)
      a.click()
      window.URL.revokeObjectURL(url)
      document.body.removeChild(a)

      toast({
        title: "Export Successful",
        description: "Participants list has been exported to CSV",
        variant: "default",
      })
    } catch (error) {
      console.error('Error exporting participants:', error)
      toast({
        title: "Export Failed",
        description: "Failed to export participants list",
        variant: "destructive",
      })
    } finally {
      setExporting(false)
    }
  }

  const sendEmailToParticipants = () => {
    // This would integrate with an email service
    toast({
      title: "Feature Coming Soon",
      description: "Email functionality will be available in the next update",
      variant: "default",
    })
  }

  if (!canViewParticipants) {
    return null
  }

  if (loading) {
    return (
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Users className="h-5 w-5" />
            Event Participants
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="animate-pulse space-y-3">
            {[1, 2, 3].map((i) => (
              <div key={i} className="flex items-center gap-3">
                <div className="w-10 h-10 bg-gray-200 rounded-full"></div>
                <div className="space-y-2">
                  <div className="h-4 bg-gray-200 rounded w-32"></div>
                  <div className="h-3 bg-gray-200 rounded w-24"></div>
                </div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>
    )
  }

  return (
    <Card>
      <CardHeader>
        <div className="flex items-center justify-between">
          <div>
            <CardTitle className="flex items-center gap-2">
              <Users className="h-5 w-5" />
              Event Participants
            </CardTitle>
            <CardDescription>
              {participants.length} participant{participants.length !== 1 ? 's' : ''} registered
            </CardDescription>
          </div>
          
          <div className="flex gap-2">
            <Button
              onClick={exportParticipants}
              disabled={exporting || participants.length === 0}
              variant="outline"
              size="sm"
            >
              <Download className="h-4 w-4 mr-2" />
              {exporting ? "Exporting..." : "Export CSV"}
            </Button>
            
            <Button
              onClick={sendEmailToParticipants}
              disabled={participants.length === 0}
              variant="outline"
              size="sm"
            >
              <Mail className="h-4 w-4 mr-2" />
              Email All
            </Button>
          </div>
        </div>
      </CardHeader>
      
      <CardContent>
        {participants.length === 0 ? (
          <div className="text-center py-8">
            <Users className="h-12 w-12 text-gray-400 mx-auto mb-4" />
            <p className="text-gray-500">No participants registered yet.</p>
          </div>
        ) : (
          <div className="space-y-4">
            {participants.map((participant) => (
              <div
                key={participant.id}
                className="flex items-center justify-between p-4 border rounded-lg hover:bg-gray-50 transition-colors"
              >
                <div className="flex items-center gap-3">
                  <Avatar className="h-10 w-10">
                    <AvatarImage src={participant.user.avatar || undefined} />
                    <AvatarFallback>
                      {participant.user.fullName?.charAt(0) || participant.user.username.charAt(0)}
                    </AvatarFallback>
                  </Avatar>
                  
                  <div>
                    <div className="flex items-center gap-2">
                      <p className="font-medium text-gray-900">
                        {participant.user.fullName || participant.user.username}
                      </p>
                      <Badge variant="secondary" className="text-xs">
                        {participant.user.role}
                      </Badge>
                    </div>
                    
                    <div className="flex items-center gap-4 text-sm text-gray-500">
                      <span className="flex items-center gap-1">
                        <Mail className="h-3 w-3" />
                        {participant.user.email}
                      </span>
                      <span className="flex items-center gap-1">
                        <Calendar className="h-3 w-3" />
                        Joined {new Date(participant.user.joinedAt).toLocaleDateString()}
                      </span>
                    </div>
                  </div>
                </div>
                
                <div className="text-right">
                  <p className="text-sm text-gray-500">
                    RSVP'd on {new Date(participant.createdAt).toLocaleDateString()}
                  </p>
                </div>
              </div>
            ))}
          </div>
        )}
      </CardContent>
    </Card>
  )
} 
 
 
 