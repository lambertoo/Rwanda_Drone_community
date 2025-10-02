"use client"

import { useState } from "react"
import { useAuth, useIsAdmin } from "@/lib/auth-context"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Label } from "@/components/ui/label"
import { Input } from "@/components/ui/input"
import { Alert, AlertDescription } from "@/components/ui/alert"
import { Download, Upload, Database, AlertTriangle, CheckCircle, Shield } from "lucide-react"
import { toast } from "sonner"

export default function SystemManagementPage() {
  const { user, loading } = useAuth()
  const isAdmin = useIsAdmin()
  const [isCreatingBackup, setIsCreatingBackup] = useState(false)
  const [isRestoring, setIsRestoring] = useState(false)
  const [backupFile, setBackupFile] = useState<File | null>(null)
  const [backupName, setBackupName] = useState("")

  // Show loading state while authentication is being checked
  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-900">
        <div className="text-center">
          <div className="animate-spin rounded-full h-16 w-16 border-b-2 border-blue-400 mx-auto mb-4"></div>
          <h1 className="text-2xl font-bold text-white mb-2">Loading...</h1>
          <p className="text-gray-400">Verifying admin access...</p>
        </div>
      </div>
    )
  }

  // Check if user is admin
  if (!isAdmin) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-900">
        <div className="text-center">
          <Shield className="h-16 w-16 text-red-500 mx-auto mb-4" />
          <h1 className="text-2xl font-bold text-white mb-2">Access Denied</h1>
          <p className="text-gray-400">This area is restricted to authorized administrators only.</p>
          <p className="text-gray-500 text-sm mt-2">Current role: {user?.role || 'Not logged in'}</p>
        </div>
      </div>
    )
  }

  const handleCreateBackup = async () => {
    setIsCreatingBackup(true)
    try {
      const response = await fetch('/api/admin/backup', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          name: backupName || `backup-${new Date().toISOString().split('T')[0]}`
        })
      })

      if (!response.ok) {
        throw new Error('Failed to create backup')
      }

      // Download the backup file
      const blob = await response.blob()
      const url = window.URL.createObjectURL(blob)
      const a = document.createElement('a')
      a.href = url
      a.download = `${backupName || `backup-${new Date().toISOString().split('T')[0]}`}.zip`
      document.body.appendChild(a)
      a.click()
      window.URL.revokeObjectURL(url)
      document.body.removeChild(a)

      toast.success("Complete application backup created and downloaded successfully")
      setBackupName("")
    } catch (error) {
      console.error('Backup error:', error)
      toast.error("Failed to create application backup. Please try again.")
    } finally {
      setIsCreatingBackup(false)
    }
  }

  const handleRestore = async () => {
    if (!backupFile) {
      toast.error("Please select a backup file to restore.")
      return
    }

    setIsRestoring(true)
    try {
      const formData = new FormData()
      formData.append('backup', backupFile)

      const response = await fetch('/api/admin/restore', {
        method: 'POST',
        body: formData
      })

      if (!response.ok) {
        const errorData = await response.json()
        throw new Error(errorData.error || 'Failed to restore database')
      }

      toast.success("Complete application has been successfully restored from backup.")
      setBackupFile(null)
    } catch (error) {
      console.error('Restore error:', error)
      toast.error("Failed to restore application. Please check the backup file and try again.")
    } finally {
      setIsRestoring(false)
    }
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-900 via-gray-800 to-gray-900 py-8">
      <div className="max-w-4xl mx-auto px-4">
        <div className="mb-8 text-center">
          <div className="inline-flex items-center gap-3 mb-4">
            <Shield className="h-8 w-8 text-blue-400" />
            <h1 className="text-3xl font-bold text-white">System Management</h1>
          </div>
          <p className="text-gray-400">
            Secure database backup and restore operations. Admin access only.
          </p>
        </div>

        <div className="grid gap-6 md:grid-cols-2">
          {/* Database Backup */}
          <Card className="bg-gray-800 border-gray-700">
            <CardHeader>
              <CardTitle className="flex items-center gap-2 text-white">
                <Database className="h-5 w-5 text-green-400" />
                Complete Application Backup
              </CardTitle>
              <CardDescription className="text-gray-400">
                Create a complete backup including database, uploaded files, and all resources. Downloads as a ZIP file.
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div>
                <Label htmlFor="backup-name" className="text-gray-300">Backup Name (Optional)</Label>
                <Input
                  id="backup-name"
                  placeholder="Enter backup name"
                  value={backupName}
                  onChange={(e) => setBackupName(e.target.value)}
                  className="bg-gray-700 border-gray-600 text-white placeholder-gray-400"
                />
              </div>
              
              <Button 
                onClick={handleCreateBackup}
                disabled={isCreatingBackup}
                className="w-full bg-green-600 hover:bg-green-700 text-white"
              >
                <Download className="h-4 w-4 mr-2" />
                {isCreatingBackup ? "Creating Backup..." : "Create Complete Backup"}
              </Button>
            </CardContent>
          </Card>

          {/* Database Restore */}
          <Card className="bg-gray-800 border-gray-700">
            <CardHeader>
              <CardTitle className="flex items-center gap-2 text-white">
                <Upload className="h-5 w-5 text-orange-400" />
                Complete Application Restore
              </CardTitle>
              <CardDescription className="text-gray-400">
                Restore your complete application from a previously created ZIP backup file.
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div>
                <Label htmlFor="backup-file" className="text-gray-300">Select Backup File</Label>
                <Input
                  id="backup-file"
                  type="file"
                  accept=".zip"
                  onChange={(e) => setBackupFile(e.target.files?.[0] || null)}
                  className="bg-gray-700 border-gray-600 text-white file:bg-gray-600 file:text-white file:border-gray-500"
                />
                <p className="text-sm text-gray-500 mt-1">
                  Only .zip files from complete application backups are supported
                </p>
              </div>

              <Alert className="bg-red-900/20 border-red-800">
                <AlertTriangle className="h-4 w-4 text-red-400" />
                <AlertDescription className="text-red-300">
                  <strong>Warning:</strong> This will replace all current data and files with the backup data. This action cannot be undone.
                </AlertDescription>
              </Alert>
              
              <Button 
                onClick={handleRestore}
                disabled={isRestoring || !backupFile}
                variant="destructive"
                className="w-full"
              >
                <Upload className="h-4 w-4 mr-2" />
                {isRestoring ? "Restoring..." : "Restore Application"}
              </Button>
            </CardContent>
          </Card>
        </div>

        {/* System Status */}
        <Card className="mt-6 bg-gray-800 border-gray-700">
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-white">
              <CheckCircle className="h-5 w-5 text-green-400" />
              System Status
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid gap-4 md:grid-cols-3">
              <div className="text-center p-4 bg-green-900/20 rounded-lg border border-green-800">
                <div className="text-2xl font-bold text-green-400">Active</div>
                <div className="text-sm text-gray-400">System Status</div>
              </div>
              <div className="text-center p-4 bg-blue-900/20 rounded-lg border border-blue-800">
                <div className="text-2xl font-bold text-blue-400">Admin</div>
                <div className="text-sm text-gray-400">User Role</div>
              </div>
              <div className="text-center p-4 bg-purple-900/20 rounded-lg border border-purple-800">
                <div className="text-2xl font-bold text-purple-400">Secure</div>
                <div className="text-sm text-gray-400">Access Level</div>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Security Notice */}
        <div className="mt-6 text-center">
          <p className="text-xs text-gray-500">
            This is a secure, hidden administrative interface. Access is logged and monitored.
          </p>
        </div>
      </div>
    </div>
  )
}
