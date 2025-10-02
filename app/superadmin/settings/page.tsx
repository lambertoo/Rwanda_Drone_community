"use client"

import { useState } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Badge } from "@/components/ui/badge"
import { Separator } from "@/components/ui/separator"
import { Alert, AlertDescription } from "@/components/ui/alert"
import { 
  Database, 
  Download, 
  Upload, 
  AlertTriangle,
  CheckCircle,
  Clock,
  HardDrive,
  Shield,
  Archive,
  FileText,
  Server,
  Users,
  Settings as SettingsIcon
} from "lucide-react"
import { toast } from "@/hooks/use-toast"

export default function SuperAdminSettingsPage() {
  const [isBackingUp, setIsBackingUp] = useState(false)
  const [isRestoring, setIsRestoring] = useState(false)
  const [backupFile, setBackupFile] = useState<File | null>(null)
  const [backupName, setBackupName] = useState("")
  const [includeFiles, setIncludeFiles] = useState(true)
  const [includeDatabase, setIncludeDatabase] = useState(true)

  const handleFullBackup = async () => {
    setIsBackingUp(true)
    try {
      const response = await fetch('/api/superadmin/backup', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          name: backupName || `full-backup-${new Date().toISOString().split('T')[0]}`,
          includeFiles,
          includeDatabase
        })
      })

      if (!response.ok) {
        throw new Error('Backup failed')
      }

      const blob = await response.blob()
      const url = window.URL.createObjectURL(blob)
      const a = document.createElement('a')
      a.href = url
      a.download = `${backupName || `full-backup-${new Date().toISOString().split('T')[0]}`}.zip`
      document.body.appendChild(a)
      a.click()
      window.URL.revokeObjectURL(url)
      document.body.removeChild(a)

      toast({
        title: "Full Backup Created",
        description: "Complete application backup has been created and downloaded successfully.",
      })
    } catch (error) {
      console.error('Backup error:', error)
      toast({
        title: "Backup Failed",
        description: "Failed to create full backup. Please try again.",
        variant: "destructive",
      })
    } finally {
      setIsBackingUp(false)
    }
  }

  const handleRestore = async () => {
    if (!backupFile) {
      toast({
        title: "No File Selected",
        description: "Please select a backup file to restore.",
        variant: "destructive",
      })
      return
    }

    setIsRestoring(true)
    try {
      const formData = new FormData()
      formData.append('backup', backupFile)

      const response = await fetch('/api/superadmin/restore', {
        method: 'POST',
        body: formData
      })

      if (!response.ok) {
        throw new Error('Restore failed')
      }

      toast({
        title: "Application Restored",
        description: "Complete application has been successfully restored from backup.",
      })
    } catch (error) {
      console.error('Restore error:', error)
      toast({
        title: "Restore Failed",
        description: "Failed to restore application. Please check the backup file and try again.",
        variant: "destructive",
      })
    } finally {
      setIsRestoring(false)
    }
  }

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (file) {
      setBackupFile(file)
    }
  }

  return (
    <div className="max-w-6xl mx-auto space-y-8">
      <div className="flex items-center gap-3">
        <Shield className="h-8 w-8 text-red-600" />
        <div>
          <h1 className="text-3xl font-bold">Super Admin Settings</h1>
          <p className="text-muted-foreground mt-2">
            Complete application management and disaster recovery
          </p>
        </div>
        <Badge variant="destructive" className="ml-auto">
          SUPER ADMIN ONLY
        </Badge>
      </div>

      {/* Full Application Backup */}
      <Card className="border-red-200 dark:border-red-800">
        <CardHeader>
          <CardTitle className="flex items-center gap-2 text-red-700 dark:text-red-400">
            <Archive className="h-5 w-5" />
            Full Application Backup
          </CardTitle>
          <CardDescription>
            Create a complete backup of the entire application including database, files, and configuration
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-6">
          <div className="grid md:grid-cols-2 gap-6">
            <div className="space-y-4">
              <div>
                <Label htmlFor="backup-name">Backup Name</Label>
                <Input
                  id="backup-name"
                  placeholder="Enter backup name"
                  value={backupName}
                  onChange={(e) => setBackupName(e.target.value)}
                />
              </div>
              
              <div className="space-y-3">
                <Label>Backup Components</Label>
                <div className="space-y-2">
                  <label className="flex items-center space-x-2">
                    <input
                      type="checkbox"
                      checked={includeDatabase}
                      onChange={(e) => setIncludeDatabase(e.target.checked)}
                      className="rounded"
                    />
                    <span className="text-sm">Database (PostgreSQL)</span>
                  </label>
                  <label className="flex items-center space-x-2">
                    <input
                      type="checkbox"
                      checked={includeFiles}
                      onChange={(e) => setIncludeFiles(e.target.checked)}
                      className="rounded"
                    />
                    <span className="text-sm">Uploaded Files & Resources</span>
                  </label>
                </div>
              </div>
            </div>
            
            <div className="space-y-4">
              <div className="p-4 bg-blue-50 dark:bg-blue-900/20 rounded-lg">
                <h4 className="font-medium mb-2">What's Included:</h4>
                <ul className="text-sm space-y-1 text-muted-foreground">
                  <li>• Complete database schema and data</li>
                  <li>• All uploaded files and resources</li>
                  <li>• Application configuration</li>
                  <li>• User data and permissions</li>
                  <li>• System settings and preferences</li>
                </ul>
              </div>
            </div>
          </div>

          <Alert className="border-yellow-200 dark:border-yellow-800">
            <AlertTriangle className="h-4 w-4 text-yellow-600 dark:text-yellow-400" />
            <AlertDescription>
              <strong>Important:</strong> Full backups are large and may take several minutes to complete. 
              Ensure you have sufficient disk space and a stable internet connection.
            </AlertDescription>
          </Alert>
          
          <Button 
            onClick={handleFullBackup} 
            disabled={isBackingUp}
            className="bg-red-600 hover:bg-red-700 w-full"
          >
            {isBackingUp ? (
              <>
                <Clock className="h-4 w-4 mr-2 animate-spin" />
                Creating Full Backup...
              </>
            ) : (
              <>
                <Download className="h-4 w-4 mr-2" />
                Create Full Backup
              </>
            )}
          </Button>
        </CardContent>
      </Card>

      {/* Full Application Restore */}
      <Card className="border-orange-200 dark:border-orange-800">
        <CardHeader>
          <CardTitle className="flex items-center gap-2 text-orange-700 dark:text-orange-400">
            <Upload className="h-5 w-5" />
            Full Application Restore
          </CardTitle>
          <CardDescription>
            Restore the entire application from a previously created full backup
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-6">
          <div>
            <Label htmlFor="backup-file">Select Full Backup File</Label>
            <Input
              id="backup-file"
              type="file"
              accept=".zip"
              onChange={handleFileChange}
              className="mt-2"
            />
            <p className="text-xs text-muted-foreground mt-1">
              Only .zip files from full backups are supported
            </p>
          </div>
          
          <Alert className="border-red-200 dark:border-red-800">
            <AlertTriangle className="h-4 w-4 text-red-600 dark:text-red-400" />
            <AlertDescription>
              <strong>DANGER:</strong> This will completely replace the current application with the backup data. 
              This action cannot be undone and will result in data loss if the backup is incomplete or corrupted.
            </AlertDescription>
          </Alert>
          
          <Button 
            onClick={handleRestore} 
            disabled={isRestoring || !backupFile}
            variant="destructive"
            className="w-full"
          >
            {isRestoring ? (
              <>
                <Clock className="h-4 w-4 mr-2 animate-spin" />
                Restoring Application...
              </>
            ) : (
              <>
                <Upload className="h-4 w-4 mr-2" />
                Restore Full Application
              </>
            )}
          </Button>
        </CardContent>
      </Card>

      {/* System Information */}
      <div className="grid md:grid-cols-2 gap-6">
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Server className="h-5 w-5" />
              System Status
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="flex items-center justify-between">
              <span>Database Status</span>
              <Badge variant="secondary" className="bg-green-100 text-green-800">
                <CheckCircle className="h-3 w-3 mr-1" />
                Connected
              </Badge>
            </div>
            <div className="flex items-center justify-between">
              <span>File System</span>
              <Badge variant="secondary" className="bg-green-100 text-green-800">
                <CheckCircle className="h-3 w-3 mr-1" />
                Healthy
              </Badge>
            </div>
            <div className="flex items-center justify-between">
              <span>Application</span>
              <Badge variant="secondary" className="bg-green-100 text-green-800">
                <CheckCircle className="h-3 w-3 mr-1" />
                Running
              </Badge>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Users className="h-5 w-5" />
              User Management
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="flex items-center justify-between">
              <span>Total Users</span>
              <Badge variant="outline">Loading...</Badge>
            </div>
            <div className="flex items-center justify-between">
              <span>Active Admins</span>
              <Badge variant="outline">Loading...</Badge>
            </div>
            <div className="flex items-center justify-between">
              <span>Super Admins</span>
              <Badge variant="destructive">1</Badge>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Quick Actions */}
      <Card>
        <CardHeader>
          <CardTitle>Quick Actions</CardTitle>
          <CardDescription>
            Common superadmin tasks and maintenance operations
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid md:grid-cols-4 gap-4">
            <Button variant="outline" className="h-auto p-4 flex flex-col items-center gap-2">
              <Database className="h-6 w-6" />
              <span className="font-medium">Database Health</span>
              <span className="text-xs text-muted-foreground">Check database integrity</span>
            </Button>
            
            <Button variant="outline" className="h-auto p-4 flex flex-col items-center gap-2">
              <FileText className="h-6 w-6" />
              <span className="font-medium">System Logs</span>
              <span className="text-xs text-muted-foreground">View application logs</span>
            </Button>
            
            <Button variant="outline" className="h-auto p-4 flex flex-col items-center gap-2">
              <Users className="h-6 w-6" />
              <span className="font-medium">User Audit</span>
              <span className="text-xs text-muted-foreground">Review user activities</span>
            </Button>
            
            <Button variant="outline" className="h-auto p-4 flex flex-col items-center gap-2">
              <SettingsIcon className="h-6 w-6" />
              <span className="font-medium">System Config</span>
              <span className="text-xs text-muted-foreground">Manage system settings</span>
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
