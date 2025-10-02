"use client"

import { useState } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Badge } from "@/components/ui/badge"
import { Separator } from "@/components/ui/separator"
import { 
  Database, 
  Download, 
  Upload, 
  Trash2, 
  AlertTriangle,
  CheckCircle,
  Clock,
  HardDrive
} from "lucide-react"
import { toast } from "@/hooks/use-toast"

export default function AdminSettingsPage() {
  const [isBackingUp, setIsBackingUp] = useState(false)
  const [isRestoring, setIsRestoring] = useState(false)
  const [backupFile, setBackupFile] = useState<File | null>(null)
  const [backupName, setBackupName] = useState("")

  const handleBackup = async () => {
    setIsBackingUp(true)
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
        throw new Error('Backup failed')
      }

      const blob = await response.blob()
      const url = window.URL.createObjectURL(blob)
      const a = document.createElement('a')
      a.href = url
      a.download = `${backupName || `backup-${new Date().toISOString().split('T')[0]}`}.sql`
      document.body.appendChild(a)
      a.click()
      window.URL.revokeObjectURL(url)
      document.body.removeChild(a)

      toast({
        title: "Backup Created",
        description: "Database backup has been created and downloaded successfully.",
      })
    } catch (error) {
      console.error('Backup error:', error)
      toast({
        title: "Backup Failed",
        description: "Failed to create database backup. Please try again.",
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

      const response = await fetch('/api/admin/restore', {
        method: 'POST',
        body: formData
      })

      if (!response.ok) {
        throw new Error('Restore failed')
      }

      toast({
        title: "Database Restored",
        description: "Database has been successfully restored from backup.",
      })
    } catch (error) {
      console.error('Restore error:', error)
      toast({
        title: "Restore Failed",
        description: "Failed to restore database. Please check the backup file and try again.",
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
    <div className="max-w-4xl mx-auto space-y-8">
      <div>
        <h1 className="text-3xl font-bold">Admin Settings</h1>
        <p className="text-muted-foreground mt-2">
          Manage system settings and database operations
        </p>
      </div>

      {/* Database Management */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Database className="h-5 w-5" />
            Database Management
          </CardTitle>
          <CardDescription>
            Create backups and restore your database to ensure data safety
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-6">
          {/* Backup Section */}
          <div className="space-y-4">
            <div className="flex items-center gap-2">
              <Download className="h-4 w-4" />
              <h3 className="text-lg font-semibold">Create Backup</h3>
            </div>
            <p className="text-sm text-muted-foreground">
              Create a complete backup of your database. This will include all tables, data, and schema.
            </p>
            
            <div className="space-y-4">
              <div>
                <Label htmlFor="backup-name">Backup Name (Optional)</Label>
                <Input
                  id="backup-name"
                  placeholder="Enter backup name"
                  value={backupName}
                  onChange={(e) => setBackupName(e.target.value)}
                  className="max-w-md"
                />
                <p className="text-xs text-muted-foreground mt-1">
                  If left empty, will use current date
                </p>
              </div>
              
              <Button 
                onClick={handleBackup} 
                disabled={isBackingUp}
                className="bg-green-600 hover:bg-green-700"
              >
                {isBackingUp ? (
                  <>
                    <Clock className="h-4 w-4 mr-2 animate-spin" />
                    Creating Backup...
                  </>
                ) : (
                  <>
                    <Download className="h-4 w-4 mr-2" />
                    Create Backup
                  </>
                )}
              </Button>
            </div>
          </div>

          <Separator />

          {/* Restore Section */}
          <div className="space-y-4">
            <div className="flex items-center gap-2">
              <Upload className="h-4 w-4" />
              <h3 className="text-lg font-semibold">Restore from Backup</h3>
            </div>
            <p className="text-sm text-muted-foreground">
              Restore your database from a previously created backup file.
            </p>
            
            <div className="space-y-4">
              <div>
                <Label htmlFor="backup-file">Select Backup File</Label>
                <Input
                  id="backup-file"
                  type="file"
                  accept=".sql"
                  onChange={handleFileChange}
                  className="max-w-md"
                />
                <p className="text-xs text-muted-foreground mt-1">
                  Only .sql files are supported
                </p>
              </div>
              
              <div className="flex items-center gap-2 p-3 bg-yellow-50 dark:bg-yellow-900/20 border border-yellow-200 dark:border-yellow-800 rounded-md">
                <AlertTriangle className="h-4 w-4 text-yellow-600 dark:text-yellow-400" />
                <p className="text-sm text-yellow-800 dark:text-yellow-200">
                  <strong>Warning:</strong> This will replace all current data with the backup data. This action cannot be undone.
                </p>
              </div>
              
              <Button 
                onClick={handleRestore} 
                disabled={isRestoring || !backupFile}
                variant="destructive"
              >
                {isRestoring ? (
                  <>
                    <Clock className="h-4 w-4 mr-2 animate-spin" />
                    Restoring...
                  </>
                ) : (
                  <>
                    <Upload className="h-4 w-4 mr-2" />
                    Restore Database
                  </>
                )}
              </Button>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* System Information */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <HardDrive className="h-5 w-5" />
            System Information
          </CardTitle>
          <CardDescription>
            Current system status and database information
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid md:grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label>Database Status</Label>
              <div className="flex items-center gap-2">
                <CheckCircle className="h-4 w-4 text-green-600" />
                <Badge variant="secondary" className="bg-green-100 text-green-800">
                  Connected
                </Badge>
              </div>
            </div>
            
            <div className="space-y-2">
              <Label>Last Backup</Label>
              <p className="text-sm text-muted-foreground">
                No backups created yet
              </p>
            </div>
            
            <div className="space-y-2">
              <Label>Database Type</Label>
              <p className="text-sm text-muted-foreground">
                PostgreSQL
              </p>
            </div>
            
            <div className="space-y-2">
              <Label>Environment</Label>
              <Badge variant="outline">
                {process.env.NODE_ENV || 'development'}
              </Badge>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Quick Actions */}
      <Card>
        <CardHeader>
          <CardTitle>Quick Actions</CardTitle>
          <CardDescription>
            Common administrative tasks
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid md:grid-cols-3 gap-4">
            <Button variant="outline" className="h-auto p-4 flex flex-col items-center gap-2">
              <Trash2 className="h-6 w-6" />
              <span className="font-medium">Clear Cache</span>
              <span className="text-xs text-muted-foreground">Clear application cache</span>
            </Button>
            
            <Button variant="outline" className="h-auto p-4 flex flex-col items-center gap-2">
              <Database className="h-6 w-6" />
              <span className="font-medium">Optimize DB</span>
              <span className="text-xs text-muted-foreground">Optimize database performance</span>
            </Button>
            
            <Button variant="outline" className="h-auto p-4 flex flex-col items-center gap-2">
              <CheckCircle className="h-6 w-6" />
              <span className="font-medium">Health Check</span>
              <span className="text-xs text-muted-foreground">Run system health check</span>
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
