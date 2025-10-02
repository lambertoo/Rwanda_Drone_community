import { NextRequest, NextResponse } from 'next/server'
import { verifyAdminToken } from '@/lib/auth-middleware'
import { exec } from 'child_process'
import { promisify } from 'util'
import { mkdir, readdir, stat } from 'fs/promises'
import { createWriteStream } from 'fs'
import { join } from 'path'
import archiver from 'archiver'

const execAsync = promisify(exec)

export async function POST(request: NextRequest) {
  try {
    // Verify admin authentication
    const adminUser = await verifyAdminToken(request)
    if (!adminUser) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const { name } = await request.json()
    const backupName = name || `backup-${new Date().toISOString().split('T')[0]}`

    // Get database connection details from environment
    const databaseUrl = process.env.DATABASE_URL || 'postgresql://postgres:drone123456@db:5432/rwanda_drone_community'
    const url = new URL(databaseUrl)
    const dbHost = url.hostname
    const dbPort = url.port || '5432'
    const dbName = url.pathname.slice(1)
    const dbUser = url.username
    const dbPassword = url.password

    console.log('Creating complete application backup...')

    // Create temporary backup directory
    const tempDir = `/tmp/backup-${Date.now()}`
    await mkdir(tempDir, { recursive: true })

    try {
      // 1. Database backup
      console.log('Creating database backup...')
      const pgDumpCommand = `PGPASSWORD="${dbPassword}" pg_dump -h ${dbHost} -p ${dbPort} -U ${dbUser} -d ${dbName} --no-password --clean --if-exists --create`
      
      const { stdout, stderr } = await execAsync(pgDumpCommand)
      
      if (stderr && !stderr.includes('WARNING')) {
        console.error('pg_dump stderr:', stderr)
        throw new Error(`Database backup failed: ${stderr}`)
      }

      // Write database backup to file
      const dbBackupPath = join(tempDir, 'database.sql')
      const fs = await import('fs/promises')
      await fs.writeFile(dbBackupPath, stdout)
      console.log('Database backup completed')

      // 2. Files backup
      console.log('Creating files backup...')
      const uploadsDir = join(process.cwd(), 'public', 'uploads')
      
      try {
        const uploadsExists = await stat(uploadsDir).then(() => true).catch(() => false)
        if (uploadsExists) {
          // Copy uploads directory to backup
          const filesBackupDir = join(tempDir, 'uploads')
          await mkdir(filesBackupDir, { recursive: true })
          
          const copyCommand = `cp -r "${uploadsDir}"/* "${filesBackupDir}/" 2>/dev/null || true`
          await execAsync(copyCommand)
          console.log('Files backup completed')
        } else {
          console.log('No uploads directory found, skipping files backup')
        }
      } catch (error) {
        console.log('Files backup failed, continuing with database only:', error)
      }

      // 3. Create backup metadata
      const metadata = {
        backupName,
        createdAt: new Date().toISOString(),
        createdBy: adminUser.user.userId,
        version: '1.0',
        includes: {
          database: true,
          files: true
        },
        database: {
          host: dbHost,
          port: dbPort,
          name: dbName,
          user: dbUser
        }
      }

      const metadataPath = join(tempDir, 'backup-metadata.json')
      await fs.writeFile(metadataPath, JSON.stringify(metadata, null, 2))

      // 4. Create ZIP archive
      console.log('Creating ZIP archive...')
      const zipPath = join(tempDir, `${backupName}.zip`)
      const output = createWriteStream(zipPath)
      const archive = archiver('zip', { zlib: { level: 9 } })

      return new Promise(async (resolve, reject) => {
        // Check if files exist before starting the archive
        const filesBackupDir = join(tempDir, 'uploads')
        const filesExist = await stat(filesBackupDir).then(() => true).catch(() => false)

        output.on('close', async () => {
          try {
            console.log(`Archive created: ${archive.pointer()} total bytes`)
            
            // Read the ZIP file and return it
            const zipBuffer = await fs.readFile(zipPath)
            
            // Clean up temporary files
            await execAsync(`rm -rf "${tempDir}"`)
            
            resolve(new NextResponse(zipBuffer, {
              status: 200,
              headers: {
                'Content-Type': 'application/zip',
                'Content-Disposition': `attachment; filename="${backupName}.zip"`,
                'Cache-Control': 'no-cache',
              },
            }))
          } catch (error) {
            reject(error)
          }
        })

        archive.on('error', (err) => {
          reject(err)
        })

        archive.pipe(output)

        // Add database backup
        archive.file(dbBackupPath, { name: 'database.sql' })
        
        // Add files backup if they exist
        if (filesExist) {
          archive.directory(filesBackupDir, 'uploads')
        }

        // Add metadata
        archive.file(metadataPath, { name: 'backup-metadata.json' })

        archive.finalize()
      })

    } catch (error) {
      // Clean up on error
      await execAsync(`rm -rf "${tempDir}"`).catch(() => {})
      throw error
    }

  } catch (error) {
    console.error('Backup error:', error)
    return NextResponse.json(
      { error: 'Failed to create backup', details: error instanceof Error ? error.message : 'Unknown error' },
      { status: 500 }
    )
  }
}
