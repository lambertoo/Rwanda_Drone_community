"use client"

import { useState, useEffect } from "react"
import { Button } from "@/components/ui/button"
import { useToast } from "@/hooks/use-toast"
import { useAuth } from "@/lib/auth-context"
import { Calendar, Users, CheckCircle, XCircle } from "lucide-react"

interface EventRSVPProps {
  eventId: string
  eventTitle: string
  allowRegistration: boolean
  capacity: number | null
  registeredCount: number
  startDate: string
  endDate: string
  location: string
}

export default function EventRSVP({
  eventId,
  eventTitle,
  allowRegistration,
  capacity,
  registeredCount,
  startDate,
  endDate,
  location
}: EventRSVPProps) {
  const { toast } = useToast()
  const { user } = useAuth()
  const [isRSVPd, setIsRSVPd] = useState(false)
  const [isLoading, setIsLoading] = useState(false)
  const [loadingRSVPStatus, setLoadingRSVPStatus] = useState(true)

  // Check if user has already RSVP'd
  useEffect(() => {
    if (user) {
      checkRSVPStatus()
    } else {
      setLoadingRSVPStatus(false)
    }
  }, [user, eventId])

  const checkRSVPStatus = async () => {
    try {
      const response = await fetch(`/api/events/${eventId}/rsvp`, {
        credentials: 'include'
      })
      
      if (response.ok) {
        setIsRSVPd(true)
      } else if (response.status === 404) {
        setIsRSVPd(false)
      }
    } catch (error) {
      console.error('Error checking RSVP status:', error)
    } finally {
      setLoadingRSVPStatus(false)
    }
  }

  const handleRSVP = async () => {
    if (!user) {
      toast({
        title: "Authentication required",
        description: "Please log in to RSVP for this event",
        variant: "destructive",
      })
      return
    }

    setIsLoading(true)

    try {
      const response = await fetch(`/api/events/${eventId}/rsvp`, {
        method: 'POST',
        credentials: 'include'
      })

      if (response.ok) {
        setIsRSVPd(true)
        toast({
          title: "Success!",
          description: "You have successfully RSVP'd for this event",
          variant: "default",
        })
      } else {
        const errorData = await response.json()
        toast({
          title: "Error",
          description: errorData.error || "Failed to RSVP for event",
          variant: "destructive",
        })
      }
    } catch (error) {
      console.error('Error RSVPing for event:', error)
      toast({
        title: "Error",
        description: "An unexpected error occurred",
        variant: "destructive",
      })
    } finally {
      setIsLoading(false)
    }
  }

  const handleCancelRSVP = async () => {
    setIsLoading(true)

    try {
      const response = await fetch(`/api/events/${eventId}/rsvp`, {
        method: 'DELETE',
        credentials: 'include'
      })

      if (response.ok) {
        setIsRSVPd(false)
        toast({
          title: "RSVP Cancelled",
          description: "Your RSVP has been cancelled successfully",
          variant: "default",
        })
      } else {
        const errorData = await response.json()
        toast({
          title: "Error",
          description: errorData.error || "Failed to cancel RSVP",
          variant: "destructive",
        })
      }
    } catch (error) {
      console.error('Error cancelling RSVP:', error)
      toast({
        title: "Error",
        description: "An unexpected error occurred",
        variant: "destructive",
      })
    } finally {
      setIsLoading(false)
    }
  }

  if (loadingRSVPStatus) {
    return (
      <div className="bg-white rounded-lg border p-6 space-y-4">
        <div className="animate-pulse">
          <div className="h-4 bg-gray-200 rounded w-3/4 mb-2"></div>
          <div className="h-4 bg-gray-200 rounded w-1/2"></div>
        </div>
      </div>
    )
  }

  if (!allowRegistration) {
    return (
      <div className="bg-white rounded-lg border p-6 space-y-4">
        <div className="text-center">
          <XCircle className="h-12 w-12 text-gray-400 mx-auto mb-2" />
          <h3 className="text-lg font-semibold text-gray-900 mb-2">
            Registration Not Available
          </h3>
          <p className="text-gray-600">
            This event does not allow registration at this time.
          </p>
        </div>
      </div>
    )
  }

  const isAtCapacity = capacity && registeredCount >= capacity
  const isPastEvent = new Date(startDate) < new Date()

  if (isPastEvent) {
    return (
      <div className="bg-white rounded-lg border p-6 space-y-4">
        <div className="text-center">
          <Calendar className="h-12 w-12 text-gray-400 mx-auto mb-2" />
          <h3 className="text-lg font-semibold text-gray-900 mb-2">
            Event Has Passed
          </h3>
          <p className="text-gray-600">
            This event has already taken place.
          </p>
        </div>
      </div>
    )
  }

  return (
    <div className="bg-white rounded-lg border p-6 space-y-4">
      <div className="flex items-center justify-between">
        <h3 className="text-lg font-semibold text-gray-900">
          Event Registration
        </h3>
        {isRSVPd && (
          <div className="flex items-center gap-2 text-green-600">
            <CheckCircle className="h-5 w-5" />
            <span className="text-sm font-medium">Registered</span>
          </div>
        )}
      </div>

      <div className="space-y-3">
        <div className="flex items-center gap-2 text-sm text-gray-600">
          <Calendar className="h-4 w-4" />
          <span>
            {new Date(startDate).toLocaleDateString()} - {new Date(endDate).toLocaleDateString()}
          </span>
        </div>
        
        <div className="flex items-center gap-2 text-sm text-gray-600">
          <Users className="h-4 w-4" />
          <span>
            {registeredCount} registered
            {capacity && ` / ${capacity} capacity`}
          </span>
        </div>

        {isAtCapacity && (
          <div className="bg-yellow-50 border border-yellow-200 rounded-md p-3">
            <p className="text-sm text-yellow-800">
              ⚠️ This event is at capacity. You can join the waitlist.
            </p>
          </div>
        )}
      </div>

      {user ? (
        <div className="space-y-3">
          {!isRSVPd ? (
            <Button
              onClick={handleRSVP}
              disabled={isLoading || isAtCapacity}
              className="w-full"
            >
              {isLoading ? "Processing..." : isAtCapacity ? "Join Waitlist" : "RSVP for Event"}
            </Button>
          ) : (
            <Button
              onClick={handleCancelRSVP}
              disabled={isLoading}
              variant="outline"
              className="w-full"
            >
              {isLoading ? "Cancelling..." : "Cancel RSVP"}
            </Button>
          )}
          
          <p className="text-xs text-gray-500 text-center">
            By RSVPing, you confirm your attendance to this event.
          </p>
        </div>
      ) : (
        <div className="text-center">
          <p className="text-sm text-gray-600 mb-3">
            Please log in to RSVP for this event.
          </p>
          <Button variant="outline" className="w-full">
            Log In to RSVP
          </Button>
        </div>
      )}
    </div>
  )
} 
 
 

import { useState, useEffect } from "react"
import { Button } from "@/components/ui/button"
import { useToast } from "@/hooks/use-toast"
import { useAuth } from "@/lib/auth-context"
import { Calendar, Users, CheckCircle, XCircle } from "lucide-react"

interface EventRSVPProps {
  eventId: string
  eventTitle: string
  allowRegistration: boolean
  capacity: number | null
  registeredCount: number
  startDate: string
  endDate: string
  location: string
}

export default function EventRSVP({
  eventId,
  eventTitle,
  allowRegistration,
  capacity,
  registeredCount,
  startDate,
  endDate,
  location
}: EventRSVPProps) {
  const { toast } = useToast()
  const { user } = useAuth()
  const [isRSVPd, setIsRSVPd] = useState(false)
  const [isLoading, setIsLoading] = useState(false)
  const [loadingRSVPStatus, setLoadingRSVPStatus] = useState(true)

  // Check if user has already RSVP'd
  useEffect(() => {
    if (user) {
      checkRSVPStatus()
    } else {
      setLoadingRSVPStatus(false)
    }
  }, [user, eventId])

  const checkRSVPStatus = async () => {
    try {
      const response = await fetch(`/api/events/${eventId}/rsvp`, {
        credentials: 'include'
      })
      
      if (response.ok) {
        setIsRSVPd(true)
      } else if (response.status === 404) {
        setIsRSVPd(false)
      }
    } catch (error) {
      console.error('Error checking RSVP status:', error)
    } finally {
      setLoadingRSVPStatus(false)
    }
  }

  const handleRSVP = async () => {
    if (!user) {
      toast({
        title: "Authentication required",
        description: "Please log in to RSVP for this event",
        variant: "destructive",
      })
      return
    }

    setIsLoading(true)

    try {
      const response = await fetch(`/api/events/${eventId}/rsvp`, {
        method: 'POST',
        credentials: 'include'
      })

      if (response.ok) {
        setIsRSVPd(true)
        toast({
          title: "Success!",
          description: "You have successfully RSVP'd for this event",
          variant: "default",
        })
      } else {
        const errorData = await response.json()
        toast({
          title: "Error",
          description: errorData.error || "Failed to RSVP for event",
          variant: "destructive",
        })
      }
    } catch (error) {
      console.error('Error RSVPing for event:', error)
      toast({
        title: "Error",
        description: "An unexpected error occurred",
        variant: "destructive",
      })
    } finally {
      setIsLoading(false)
    }
  }

  const handleCancelRSVP = async () => {
    setIsLoading(true)

    try {
      const response = await fetch(`/api/events/${eventId}/rsvp`, {
        method: 'DELETE',
        credentials: 'include'
      })

      if (response.ok) {
        setIsRSVPd(false)
        toast({
          title: "RSVP Cancelled",
          description: "Your RSVP has been cancelled successfully",
          variant: "default",
        })
      } else {
        const errorData = await response.json()
        toast({
          title: "Error",
          description: errorData.error || "Failed to cancel RSVP",
          variant: "destructive",
        })
      }
    } catch (error) {
      console.error('Error cancelling RSVP:', error)
      toast({
        title: "Error",
        description: "An unexpected error occurred",
        variant: "destructive",
      })
    } finally {
      setIsLoading(false)
    }
  }

  if (loadingRSVPStatus) {
    return (
      <div className="bg-white rounded-lg border p-6 space-y-4">
        <div className="animate-pulse">
          <div className="h-4 bg-gray-200 rounded w-3/4 mb-2"></div>
          <div className="h-4 bg-gray-200 rounded w-1/2"></div>
        </div>
      </div>
    )
  }

  if (!allowRegistration) {
    return (
      <div className="bg-white rounded-lg border p-6 space-y-4">
        <div className="text-center">
          <XCircle className="h-12 w-12 text-gray-400 mx-auto mb-2" />
          <h3 className="text-lg font-semibold text-gray-900 mb-2">
            Registration Not Available
          </h3>
          <p className="text-gray-600">
            This event does not allow registration at this time.
          </p>
        </div>
      </div>
    )
  }

  const isAtCapacity = capacity && registeredCount >= capacity
  const isPastEvent = new Date(startDate) < new Date()

  if (isPastEvent) {
    return (
      <div className="bg-white rounded-lg border p-6 space-y-4">
        <div className="text-center">
          <Calendar className="h-12 w-12 text-gray-400 mx-auto mb-2" />
          <h3 className="text-lg font-semibold text-gray-900 mb-2">
            Event Has Passed
          </h3>
          <p className="text-gray-600">
            This event has already taken place.
          </p>
        </div>
      </div>
    )
  }

  return (
    <div className="bg-white rounded-lg border p-6 space-y-4">
      <div className="flex items-center justify-between">
        <h3 className="text-lg font-semibold text-gray-900">
          Event Registration
        </h3>
        {isRSVPd && (
          <div className="flex items-center gap-2 text-green-600">
            <CheckCircle className="h-5 w-5" />
            <span className="text-sm font-medium">Registered</span>
          </div>
        )}
      </div>

      <div className="space-y-3">
        <div className="flex items-center gap-2 text-sm text-gray-600">
          <Calendar className="h-4 w-4" />
          <span>
            {new Date(startDate).toLocaleDateString()} - {new Date(endDate).toLocaleDateString()}
          </span>
        </div>
        
        <div className="flex items-center gap-2 text-sm text-gray-600">
          <Users className="h-4 w-4" />
          <span>
            {registeredCount} registered
            {capacity && ` / ${capacity} capacity`}
          </span>
        </div>

        {isAtCapacity && (
          <div className="bg-yellow-50 border border-yellow-200 rounded-md p-3">
            <p className="text-sm text-yellow-800">
              ⚠️ This event is at capacity. You can join the waitlist.
            </p>
          </div>
        )}
      </div>

      {user ? (
        <div className="space-y-3">
          {!isRSVPd ? (
            <Button
              onClick={handleRSVP}
              disabled={isLoading || isAtCapacity}
              className="w-full"
            >
              {isLoading ? "Processing..." : isAtCapacity ? "Join Waitlist" : "RSVP for Event"}
            </Button>
          ) : (
            <Button
              onClick={handleCancelRSVP}
              disabled={isLoading}
              variant="outline"
              className="w-full"
            >
              {isLoading ? "Cancelling..." : "Cancel RSVP"}
            </Button>
          )}
          
          <p className="text-xs text-gray-500 text-center">
            By RSVPing, you confirm your attendance to this event.
          </p>
        </div>
      ) : (
        <div className="text-center">
          <p className="text-sm text-gray-600 mb-3">
            Please log in to RSVP for this event.
          </p>
          <Button variant="outline" className="w-full">
            Log In to RSVP
          </Button>
        </div>
      )}
    </div>
  )
} 
 
 