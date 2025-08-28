"use client"

import { useState, useEffect } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Alert, AlertDescription } from "@/components/ui/alert"
import { Loader, User, Shield, CheckCircle, XCircle } from "lucide-react"

export default function DebugProfilePage() {
  const [userData, setUserData] = useState<any>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [cookies, setCookies] = useState<string>("")

  useEffect(() => {
    // Get cookies for debugging
    setCookies(document.cookie)
    
    // Try to fetch user profile
    fetchUserProfile()
  }, [])

  const fetchUserProfile = async () => {
    try {
      setLoading(true)
      const response = await fetch('/api/auth/profile', {
        method: 'GET',
        credentials: 'include',
        headers: {
          'Content-Type': 'application/json',
        }
      })
      
      console.log('Profile response:', { 
        status: response.status, 
        ok: response.ok, 
        statusText: response.statusText,
        headers: Object.fromEntries(response.headers.entries())
      })

      if (response.ok) {
        const data = await response.json()
        console.log('User data received:', data)
        setUserData(data)
        setError(null)
      } else {
        const errorData = await response.json().catch(() => ({}))
        setError(`Failed to fetch profile: ${response.status} ${response.statusText}`)
        console.error('Profile fetch error:', errorData)
      }
    } catch (err) {
      console.error('Profile fetch error:', err)
      setError(`Network error: ${err}`)
    } finally {
      setLoading(false)
    }
  }

  const checkAuthStatus = async () => {
    try {
      const response = await fetch('/api/auth/me', {
        method: 'GET',
        credentials: 'include',
      })
      
      if (response.ok) {
        const data = await response.json()
        console.log('Auth check response:', data)
        setUserData(data)
      } else {
        console.log('Auth check failed:', response.status)
      }
    } catch (err) {
      console.error('Auth check error:', err)
    }
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-green-50 dark:from-gray-900 dark:via-gray-800 dark:to-gray-900 p-4">
      <div className="max-w-4xl mx-auto space-y-6">
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Shield className="h-5 w-5" />
              Authentication Debug Page
            </CardTitle>
            <CardDescription>
              This page helps debug authentication and user profile issues
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="flex gap-2">
              <Button onClick={fetchUserProfile} disabled={loading}>
                {loading ? <Loader className="h-4 w-4 animate-spin mr-2" /> : null}
                Refresh Profile
              </Button>
              <Button onClick={checkAuthStatus} variant="outline">
                Check Auth Status
              </Button>
            </div>

            {error && (
              <Alert variant="destructive">
                <XCircle className="h-4 w-4" />
                <AlertDescription>{error}</AlertDescription>
              </Alert>
            )}

            {userData && (
              <Alert>
                <CheckCircle className="h-4 w-4" />
                <AlertDescription>Profile data loaded successfully!</AlertDescription>
              </Alert>
            )}
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <User className="h-5 w-5" />
              Current Cookies
            </CardTitle>
            <CardDescription>
              Browser cookies that might contain authentication tokens
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="bg-gray-100 dark:bg-gray-800 p-3 rounded text-sm font-mono break-all">
              {cookies || "No cookies found"}
            </div>
          </CardContent>
        </Card>

        {userData && (
          <Card>
            <CardHeader>
              <CardTitle>User Profile Data</CardTitle>
              <CardDescription>
                Data received from the profile API
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="bg-gray-100 dark:bg-gray-800 p-3 rounded">
                <pre className="text-sm overflow-auto">
                  {JSON.stringify(userData, null, 2)}
                </pre>
              </div>
            </CardContent>
          </Card>
        )}

        <Card>
          <CardHeader>
            <CardTitle>Next Steps</CardTitle>
            <CardDescription>
              What to do based on the current status
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-2">
            {!userData && !loading && (
              <Alert>
                <AlertDescription>
                  No user data found. You may need to register or login first.
                </AlertDescription>
              </Alert>
            )}
            
            {userData?.user && !userData.user.role && (
              <Alert>
                <AlertDescription>
                  User found but no role assigned. Redirect to profile completion.
                </AlertDescription>
              </Alert>
            )}
            
            {userData?.user && userData.user.role && (
              <Alert>
                <AlertDescription>
                  User profile complete with role: {userData.user.role}. Ready to use the app.
                </AlertDescription>
              </Alert>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  )
} 