"use client"

import { useState, useEffect } from "react"
import { useRouter } from "next/navigation"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Checkbox } from "@/components/ui/checkbox"
import { Badge } from "@/components/ui/badge"
import { Alert, AlertDescription } from "@/components/ui/alert"
import { Loader, Eye, EyeOff, Shield, Users, Plane, GraduationCap, Wrench, CheckCircle } from "lucide-react"
import Link from "next/link"
import { useNotification } from "@/components/ui/notification"
import { useAuth } from "@/lib/auth-context"

// Demo credentials for each role
const demoCredentials = {
  admin: { email: "admin@drone.com", password: "admin123" },
  pilot: { email: "pilot@drone.com", password: "password123" },
  regulator: { email: "regulator@drone.com", password: "password123" },
  student: { email: "student@drone.com", password: "password123" },
  "service-provider": { email: "service@drone.com", password: "password123" },
}

const roleInfo = {
  admin: {
    name: "Administrator",
    description: "Full system access and management",
    icon: Shield,
    color: "bg-red-500",
    bgColor: "bg-red-50",
    borderColor: "border-red-200",
  },
  pilot: {
    name: "Commercial Pilot",
    description: "Licensed commercial drone pilots",
    icon: Plane,
    color: "bg-green-500",
    bgColor: "bg-green-50",
    borderColor: "border-green-200",
  },
  regulator: {
    name: "Regulator",
    description: "Government and regulatory officials",
    icon: Shield,
    color: "bg-purple-500",
    bgColor: "bg-purple-50",
    borderColor: "border-purple-200",
  },
  student: {
    name: "Student",
    description: "Students and researchers",
    icon: GraduationCap,
    color: "bg-orange-500",
    bgColor: "bg-orange-50",
    borderColor: "border-orange-200",
  },
  "service-provider": {
    name: "Service Provider",
    description: "Drone services and maintenance",
    icon: Wrench,
    color: "bg-indigo-500",
    bgColor: "bg-indigo-50",
    borderColor: "border-indigo-200",
  },
}

export default function LoginPage() {
  const router = useRouter()
  const [selectedRole, setSelectedRole] = useState<string>("")
  const [email, setEmail] = useState("")
  const [password, setPassword] = useState("")
  const [showPassword, setShowPassword] = useState(false)
  const [rememberMe, setRememberMe] = useState(false)
  const [isLoading, setIsLoading] = useState(false)
  const [isCheckingAuth, setIsCheckingAuth] = useState(true)
  const [hasShownRedirectNotification, setHasShownRedirectNotification] = useState(false)
  const { showNotification } = useNotification()
  const { user, login } = useAuth()

  // Check if user is already logged in
  useEffect(() => {
    const checkAuth = () => {
      if (user && !hasShownRedirectNotification) {
        // User is logged in, show notification only once and redirect
        setHasShownRedirectNotification(true)
        showNotification('info', 'You are already logged in!', 'Redirecting to home page...')
        setTimeout(() => {
          window.location.href = "/"
        }, 2000)
        return
      }
      // Always set to false to prevent getting stuck
      setIsCheckingAuth(false)
    }

    // Add a timeout to prevent getting stuck
    const timeoutId = setTimeout(() => {
      setIsCheckingAuth(false)
    }, 3000)

    checkAuth()

    return () => clearTimeout(timeoutId)
  }, [user, hasShownRedirectNotification]) // Added hasShownRedirectNotification to dependencies



  const handleRoleSelect = (role: string) => {
    setSelectedRole(role)
    if (demoCredentials[role as keyof typeof demoCredentials]) {
      const creds = demoCredentials[role as keyof typeof demoCredentials]
      setEmail(creds.email)
      setPassword(creds.password)
    }
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    
    if (!email || !password) {
      showNotification('error', 'Missing Information', 'Please enter both email and password')
      return
    }
    
    setIsLoading(true)

    try {
      const result = await login(email, password)
      
      if (result.success) {
        // Show success notification
        showNotification('success', `Welcome back!`, 'Login successful. Redirecting...')
        
        // Redirect after notification
        setTimeout(() => {
          console.log('Redirecting to home page')
          router.push("/")
        }, 2000)
      } else {
        showNotification('error', 'Login Failed', result.error || 'Invalid credentials')
      }
    } catch (err) {
      console.error("Login error:", err)
      showNotification('error', 'Network Error', 'Please check your connection and try again')
    } finally {
      setIsLoading(false)
    }
  }

  // Show loading while checking authentication
  if (isCheckingAuth) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-indigo-100 flex items-center justify-center">
        <div className="text-center">
          <div className="w-16 h-16 bg-gradient-to-r from-blue-600 to-indigo-600 rounded-full flex items-center justify-center mx-auto mb-4">
            <Loader className="h-8 w-8 text-white animate-spin" />
          </div>
          <h2 className="text-xl font-semibold text-gray-900 mb-2">Checking authentication...</h2>
          <p className="text-gray-600">Please wait while we verify your login status</p>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-[calc(100vh-120px)] bg-gradient-to-br from-slate-50 via-blue-50 to-indigo-100 flex items-center justify-center p-4">


      <div className="w-full max-w-6xl grid lg:grid-cols-2 gap-8">
        {/* Left Side - Welcome & Role Selection */}
        <div className="space-y-8">
          <div className="text-center lg:text-left">
            <div className="inline-flex items-center gap-2 mb-4">
              <div className="w-12 h-12 bg-gradient-to-r from-blue-600 to-indigo-600 rounded-xl flex items-center justify-center">
                <span className="text-white font-bold text-xl">RDC</span>
              </div>
              <div>
                <h1 className="text-2xl font-bold text-gray-900">Rwanda Drone Community</h1>
                <p className="text-gray-600">Connect • Learn • Fly</p>
              </div>
            </div>
            <h2 className="text-4xl font-bold bg-gradient-to-r from-blue-600 to-indigo-600 bg-clip-text text-transparent mb-4">
              Welcome Back
            </h2>
            <p className="text-lg text-gray-600 mb-8">
              Access the platform with your credentials or try demo accounts below
            </p>
          </div>

          {/* Demo Accounts Information */}
          <div className="space-y-4">
            <h3 className="text-lg font-semibold text-gray-900 mb-4">Demo Accounts for Testing</h3>
            <p className="text-sm text-gray-600 mb-4">
              Try different user roles to test platform features. Click any role to auto-fill credentials.
            </p>
            <div className="grid gap-3">
              {Object.entries(roleInfo).map(([role, info]) => {
                const IconComponent = info.icon
                const isSelected = selectedRole === role
                return (
                  <button
                    key={role}
                    onClick={() => handleRoleSelect(role)}
                    className={`p-4 rounded-xl border-2 transition-all duration-200 text-left hover:shadow-lg ${
                      isSelected
                        ? `${info.bgColor} ${info.borderColor} border-2 shadow-md`
                        : "bg-white border-gray-200 hover:border-gray-300"
                    }`}
                  >
                    <div className="flex items-center gap-4">
                      <div className={`p-3 rounded-lg ${info.color} text-white`}>
                        <IconComponent className="h-6 w-6" />
                      </div>
                      <div className="flex-1">
                        <h4 className="font-semibold text-gray-900">{info.name}</h4>
                        <p className="text-sm text-gray-600">{info.description}</p>
                        <p className="text-xs text-gray-500 mt-1">
                          Demo: {demoCredentials[role as keyof typeof demoCredentials]?.email}
                        </p>
                      </div>
                      {isSelected && (
                        <CheckCircle className="h-6 w-6 text-green-500" />
                      )}
                    </div>
                  </button>
                )
              })}
            </div>

            {selectedRole && (
              <Alert className={`${roleInfo[selectedRole as keyof typeof roleInfo]?.bgColor} ${roleInfo[selectedRole as keyof typeof roleInfo]?.borderColor}`}>
                <CheckCircle className="h-4 w-4" />
                <AlertDescription className="text-gray-700">
                  <strong>Demo Credentials Auto-filled:</strong> {demoCredentials[selectedRole as keyof typeof demoCredentials]?.email}
                </AlertDescription>
              </Alert>
            )}
          </div>
        </div>

        {/* Right Side - Login Form */}
        <div className="flex items-center justify-center">
          <Card className="w-full max-w-md shadow-xl border-0 bg-white/80 backdrop-blur-sm">
            <CardHeader className="text-center pb-6">
              <div className="w-16 h-16 bg-gradient-to-r from-blue-600 to-indigo-600 rounded-full flex items-center justify-center mx-auto mb-4">
                <Users className="h-8 w-8 text-white" />
              </div>
              <CardTitle className="text-2xl font-bold text-gray-900">Sign In</CardTitle>
              <CardDescription className="text-gray-600">
                Enter your credentials to access the platform
              </CardDescription>
            </CardHeader>
            
            <CardContent className="space-y-6">
              <form onSubmit={handleSubmit} className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="email" className="text-sm font-medium text-gray-700">
                    Username or Email
                  </Label>
                  <Input
                    id="email"
                    type="text"
                    placeholder="Enter your username or email"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    required
                    disabled={isLoading}
                    className="h-12 border-gray-200 focus:border-blue-500 focus:ring-blue-500"
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="password" className="text-sm font-medium text-gray-700">
                    Password
                  </Label>
                  <div className="relative">
                    <Input
                      id="password"
                      type={showPassword ? "text" : "password"}
                      placeholder="Enter your password"
                      value={password}
                      onChange={(e) => setPassword(e.target.value)}
                      required
                      disabled={isLoading}
                      className="h-12 border-gray-200 focus:border-blue-500 focus:ring-blue-500 pr-12"
                    />
                    <button
                      type="button"
                      onClick={() => setShowPassword(!showPassword)}
                      className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400 hover:text-gray-600"
                    >
                      {showPassword ? <EyeOff className="h-5 w-5" /> : <Eye className="h-5 w-5" />}
                    </button>
                  </div>
                </div>

                <div className="flex items-center justify-between">
                  <div className="flex items-center space-x-2">
                    <Checkbox
                      id="remember"
                      checked={rememberMe}
                      onCheckedChange={(checked) => setRememberMe(checked as boolean)}
                      disabled={isLoading}
                    />
                    <Label htmlFor="remember" className="text-sm text-gray-600">
                      Remember me
                    </Label>
                  </div>
                  <Link href="/forgot-password" className="text-sm text-blue-600 hover:text-blue-800 font-medium">
                    Forgot password?
                  </Link>
                </div>

                <Button
                  type="submit"
                  className="w-full h-12 bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700 text-white font-medium rounded-lg transition-all duration-200"
                  disabled={isLoading}
                >
                  {isLoading ? (
                    <>
                      <Loader className="mr-2 h-4 w-4 animate-spin" />
                      Signing In...
                    </>
                  ) : (
                    "Sign In"
                  )}
                </Button>
              </form>

              <div className="relative">
                <div className="absolute inset-0 flex items-center">
                  <div className="w-full border-t border-gray-200" />
                </div>
                <div className="relative flex justify-center text-xs uppercase">
                  <span className="bg-white px-2 text-gray-500">Or continue with</span>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <Button variant="outline" disabled={isLoading} className="h-10">
                  <svg className="mr-2 h-4 w-4" viewBox="0 0 24 24">
                    <path
                      d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"
                      fill="#4285F4"
                    />
                    <path
                      d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"
                      fill="#34A853"
                    />
                    <path
                      d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"
                      fill="#FBBC05"
                    />
                    <path
                      d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"
                      fill="#EA4335"
                    />
                  </svg>
                  Google
                </Button>
                <Button variant="outline" disabled={isLoading} className="h-10">
                  <svg className="mr-2 h-4 w-4" fill="currentColor" viewBox="0 0 24 24">
                    <path d="M24 4.557c-.883.392-1.832.656-2.828.775 1.017-.609 1.798-1.574 2.165-2.724-.951.564-2.005.974-3.127 1.195-.897-.957-2.178-1.555-3.594-1.555-3.179 0-5.515 2.966-4.797 6.045-4.091-.205-7.719-2.165-10.148-5.144-1.29 2.213-.669 5.108 1.523 6.574-.806-.026-1.566-.247-2.229-.616-.054 2.281 1.581 4.415 3.949 4.89-.693.188-1.452.232-2.224.084.626 1.956 2.444 3.379 4.6 3.419-2.07 1.623-4.678 2.348-7.29 2.04 2.179 1.397 4.768 2.212 7.548 2.212 9.142 0 14.307-7.721 13.995-14.646.962-.695 1.797-1.562 2.457-2.549z" />
                  </svg>
                  Twitter
                </Button>
              </div>

              <div className="text-center">
                <p className="text-sm text-gray-600">
                  Don't have an account?{" "}
                  <Link href="/register" className="text-blue-600 hover:text-blue-800 font-medium">
                    Sign up here
                  </Link>
                </p>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  )
}
