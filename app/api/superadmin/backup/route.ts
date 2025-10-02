import { NextRequest, NextResponse } from 'next/server'
import { requireSuperAdmin } from '@/lib/auth-middleware'
import { exec } from 'child_process'
import { promisify } from 'util'
import { createWriteStream, mkdirSync, existsSync } from 'fs'
import { join } from 'path'
import archiver from 'archiver'

const execAsync = promisify(exec)

export async function POST(request: NextRequest) {
  try {
    // Verify superadmin authentication
    const superAdminUser = await requireSuperAdmin(request)
    if (superAdminUser instanceof NextResponse) {
      return superAdminUser
    }

    const { name, includeFiles = true, includeDatabase = true } = await request.json()
    const backupName = name || `full-backup-${new Date().toISOString().split('T')[0]}`

    // Get database connection details from environment
    const dbHost = process.env.DATABASE_HOST || 'db'
    const dbPort = process.env.DATABASE_PORT || '5432'
    const dbName = process.env.DATABASE_NAME || 'rwanda_drone_community'
    const dbUser = process.env.DATABASE_USER || 'postgres'
    const dbPassword = process.env.DATABASE_PASSWORD || 'postgres'

    console.log('Creating full application backup...')

    // Create temporary backup directory
    const tempDir = `/tmp/backup-${Date.now()}`
    mkdirSync(tempDir, { recursive: true })

    try {
      // 1. Database backup
      if (includeDatabase) {
        console.log('Backing up database...')
        const dbBackupPath = join(tempDir, 'database.sql')
        const pgDumpCommand = `PGPASSWORD="${dbPassword}" pg_dump -h ${dbHost} -p ${dbPort} -U ${dbUser} -d ${dbName} --no-password --clean --if-exists --create`
        
        const { stdout, stderr } = await execAsync(pgDumpCommand)
        
        if (stderr && !stderr.includes('WARNING')) {
          console.error('pg_dump stderr:', stderr)
          throw new Error(`Database backup failed: ${stderr}`)
        }

        // Write database backup to file
        const fs = await import('fs')
        fs.writeFileSync(dbBackupPath, stdout)
        console.log('Database backup completed')
      }

      // 2. Files backup
      if (includeFiles) {
        console.log('Backing up uploaded files...')
        const uploadsDir = '/app/public/uploads'
        if (existsSync(uploadsDir)) {
          const filesBackupPath = join(tempDir, 'uploads')
          await execAsync(`cp -r "${uploadsDir}" "${filesBackupPath}"`)
          console.log('Files backup completed')
        }
      }

      // 3. Configuration backup
      console.log('Backing up configuration...')
      const configFiles = [
        '/app/.env',
        '/app/next.config.mjs',
        '/app/package.json',
        '/app/prisma/schema.prisma'
      ]

      const configDir = join(tempDir, 'config')
      mkdirSync(configDir, { recursive: true })

      for (const configFile of configFiles) {
        if (existsSync(configFile)) {
          const fileName = configFile.split('/').pop()
          await execAsync(`cp "${configFile}" "${join(configDir, fileName)}"`)
        }
      }

      // 4. Create metadata file
      const metadata = {
        backupName,
        timestamp: new Date().toISOString(),
        version: '1.0',
        includes: {
          database: includeDatabase,
          files: includeFiles,
          config: true
        },
        createdBy: superAdminUser.user.userId,
        application: 'Rwanda Drone Community Platform'
      }

      const fs = await import('fs')
      fs.writeFileSync(
        join(tempDir, 'backup-metadata.json'), 
        JSON.stringify(metadata, null, 2)
      )

      // 5. Create ZIP archive
      console.log('Creating ZIP archive...')
      const archive = archiver('zip', { zlib: { level: 9 } })
      
      // Set up the response
      const response = new NextResponse()
      response.headers.set('Content-Type', 'application/zip')
      response.headers.set('Content-Disposition', `attachment; filename="${backupName}.zip"`)
      response.headers.set('Cache-Control', 'no-cache')

      // Pipe archive to response
      archive.pipe(response)

      // Add all backup files to archive
      archive.directory(tempDir, false)
      
      // Finalize the archive
      await archive.finalize()

      console.log('Full backup completed successfully')
      return response

    } finally {
      // Clean up temporary directory
      try {
        await execAsync(`rm -rf "${tempDir}"`)
      } catch (error) {
        console.error('Error cleaning up temp directory:', error)
      }
    }

  } catch (error) {
    console.error('Full backup error:', error)
    return NextResponse.json(
      { error: 'Failed to create full backup', details: error instanceof Error ? error.message : 'Unknown error' },
      { status: 500 }
    )
  }
}
