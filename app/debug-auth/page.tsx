'use client'

import { useAuth } from "@/lib/auth-context"
import { useEffect, useState } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"

export default function DebugAuthPage() {
  const { user, loading, isAuthenticated, login, logout } = useAuth()
  const [cookies, setCookies] = useState<string>('')
  const [apiTest, setApiTest] = useState<any>(null)

  useEffect(() => {
    // Get cookies
    setCookies(document.cookie)
  }, [])

  const testApi = async () => {
    try {
      const response = await fetch('/api/auth/profile', {
        method: 'GET',
        credentials: 'include',
        headers: {
          'Content-Type': 'application/json',
        }
      })
      
      const data = await response.json()
      setApiTest({
        status: response.status,
        ok: response.ok,
        data
      })
    } catch (error) {
      setApiTest({
        error: error instanceof Error ? error.message : 'Unknown error'
      })
    }
  }

  const testLogin = async () => {
    const result = await login('admin@rwandadrone.com', 'Admin@2024!')
    console.log('Login result:', result)
  }

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="max-w-4xl mx-auto space-y-6">
        <h1 className="text-3xl font-bold">Authentication Debug Page</h1>
        
        <Card>
          <CardHeader>
            <CardTitle>Authentication Context State</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid grid-cols-2 gap-4">
              <div>
                <strong>Loading:</strong> 
                <Badge variant={loading ? "destructive" : "default"} className="ml-2">
                  {loading ? "Yes" : "No"}
                </Badge>
              </div>
              <div>
                <strong>Authenticated:</strong> 
                <Badge variant={isAuthenticated ? "default" : "destructive"} className="ml-2">
                  {isAuthenticated ? "Yes" : "No"}
                </Badge>
              </div>
            </div>
            
            <div>
              <strong>User:</strong>
              <pre className="mt-2 p-2 bg-gray-100 rounded text-sm overflow-auto">
                {user ? JSON.stringify(user, null, 2) : 'null'}
              </pre>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Browser Cookies</CardTitle>
          </CardHeader>
          <CardContent>
            <pre className="p-2 bg-gray-100 rounded text-sm overflow-auto">
              {cookies || 'No cookies found'}
            </pre>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>API Test</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <Button onClick={testApi}>Test /api/auth/profile</Button>
            {apiTest && (
              <pre className="p-2 bg-gray-100 rounded text-sm overflow-auto">
                {JSON.stringify(apiTest, null, 2)}
              </pre>
            )}
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Actions</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="flex gap-2">
              <Button onClick={testLogin}>Test Login (admin@rwandadrone.com)</Button>
              <Button onClick={logout} variant="destructive">Logout</Button>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Debug Information</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-sm text-muted-foreground">
              This page helps debug authentication issues. Check the console for additional logs.
            </p>
          </CardContent>
        </Card>
      </div>
    </div>
  )
} 