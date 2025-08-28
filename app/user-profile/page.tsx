"use client"

import { useState, useEffect, Suspense } from "react"
import { useRouter, useSearchParams } from "next/navigation"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Alert, AlertDescription } from "@/components/ui/alert"
import { Loader, User, Shield, CheckCircle, XCircle, ArrowRight } from "lucide-react"

function UserProfileForm() {
  const router = useRouter()
  const searchParams = useSearchParams()
  const message = searchParams.get('message')
  const [userData, setUserData] = useState<any>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    checkUserProfile()
  }, [])

  const checkUserProfile = async () => {
    try {
      setLoading(true)
      const response = await fetch('/api/auth/profile', {
        method: 'GET',
        credentials: 'include',
      })
      
      if (response.ok) {
        const data = await response.json()
        setUserData(data)
        setError(null)
      } else {
        setError('Not authenticated')
      }
    } catch (err) {
      console.error('Profile check error:', err)
      setError('Network error')
    } finally {
      setLoading(false)
    }
  }

  const goToCompleteProfile = () => {
    router.push('/complete-profile')
  }

  const goToDashboard = () => {
    router.push('/')
  }

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-green-50 dark:from-gray-900 dark:via-gray-800 dark:to-gray-900 flex items-center justify-center p-4">
        <Card className="w-full max-w-2xl">
          <CardContent className="flex items-center justify-center p-8">
            <Loader className="h-8 w-8 animate-spin" />
          </CardContent>
        </Card>
      </div>
    )
  }

  if (error) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-green-50 dark:from-gray-900 dark:via-gray-800 dark:to-gray-900 flex items-center justify-center p-4">
        <Card className="w-full max-w-2xl">
          <CardHeader className="text-center">
            <CardTitle className="text-2xl">Authentication Required</CardTitle>
            <CardDescription>You need to be logged in to view this page</CardDescription>
          </CardHeader>
          <CardContent className="text-center space-y-4">
            <Alert variant="destructive">
              <XCircle className="h-4 w-4" />
              <AlertDescription>{error}</AlertDescription>
            </Alert>
            <div className="space-y-2">
              <Button onClick={() => router.push('/login')} className="w-full">
                Go to Login
              </Button>
              <Button onClick={() => router.push('/register')} variant="outline" className="w-full">
                Go to Register
              </Button>
            </div>
          </CardContent>
        </Card>
      </div>
    )
  }

  if (!userData?.user) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-green-50 dark:from-gray-900 dark:via-gray-800 dark:to-gray-900 flex items-center justify-center p-4">
        <Card className="w-full max-w-2xl">
          <CardHeader className="text-center">
            <CardTitle className="text-2xl">Profile Not Found</CardTitle>
            <CardDescription>Unable to load user profile</CardDescription>
          </CardHeader>
          <CardContent className="text-center">
            <Button onClick={checkUserProfile} variant="outline">
              Try Again
            </Button>
          </CardContent>
        </Card>
      </div>
    )
  }

  const user = userData.user
  const hasRole = user.role && user.role !== ''

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-green-50 dark:from-gray-900 dark:via-gray-800 dark:to-gray-900 p-4">
      <div className="max-w-4xl mx-auto space-y-6">
        <Card>
          <CardHeader className="text-center">
            <CardTitle className="text-2xl flex items-center justify-center gap-2">
              <User className="h-6 w-6" />
              User Profile
            </CardTitle>
            <CardDescription>
              Welcome, {user.fullName || user.email}!
            </CardDescription>
            {message && (
              <Alert>
                <AlertDescription>{decodeURIComponent(message)}</AlertDescription>
              </Alert>
            )}
          </CardHeader>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Shield className="h-5 w-5" />
              Profile Status
            </CardTitle>
          </CardHeader>
          <CardContent>
            {hasRole ? (
              <Alert>
                <CheckCircle className="h-4 w-4" />
                <AlertDescription>
                  Your profile is complete! You have the role: <strong>{user.role}</strong>
                </AlertDescription>
              </Alert>
            ) : (
              <Alert variant="destructive">
                <XCircle className="h-4 w-4" />
                <AlertDescription>
                  Your profile is incomplete. You need to assign a role to continue.
                </AlertDescription>
              </Alert>
            )}
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Profile Information</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid md:grid-cols-2 gap-4">
              <div>
                <label className="text-sm font-medium text-muted-foreground">Full Name</label>
                <p className="text-lg">{user.fullName || 'Not set'}</p>
              </div>
              <div>
                <label className="text-sm font-medium text-muted-foreground">Email</label>
                <p className="text-lg">{user.email}</p>
              </div>
              <div>
                <label className="text-sm font-medium text-muted-foreground">Username</label>
                <p className="text-lg">{user.username || 'Not set'}</p>
              </div>
              <div>
                <label className="text-sm font-medium text-muted-foreground">Role</label>
                <p className="text-lg">{user.role || 'Not assigned'}</p>
              </div>
              <div>
                <label className="text-sm font-medium text-muted-foreground">Organization</label>
                <p className="text-lg">{user.organization || 'Not set'}</p>
              </div>
              <div>
                <label className="text-sm font-medium text-muted-foreground">Location</label>
                <p className="text-lg">{user.location || 'Not set'}</p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Next Steps</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            {hasRole ? (
              <div className="text-center space-y-4">
                <Alert>
                  <CheckCircle className="h-4 w-4" />
                  <AlertDescription>
                    Your profile is complete! You can now use all features of the application.
                  </AlertDescription>
                </Alert>
                <Button onClick={goToDashboard} className="w-full" size="lg">
                  Go to Dashboard
                  <ArrowRight className="ml-2 h-4 w-4" />
                </Button>
              </div>
            ) : (
              <div className="text-center space-y-4">
                <Alert variant="destructive">
                  <XCircle className="h-4 w-4" />
                  <AlertDescription>
                    Complete your profile to access all features.
                  </AlertDescription>
                </Alert>
                <Button onClick={goToCompleteProfile} className="w-full" size="lg">
                  Complete Profile
                  <ArrowRight className="ml-2 h-4 w-4" />
                </Button>
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  )
}

export default function UserProfilePage() {
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
      <UserProfileForm />
    </Suspense>
  )
} 