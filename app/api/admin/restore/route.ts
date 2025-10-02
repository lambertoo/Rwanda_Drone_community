import { NextRequest, NextResponse } from 'next/server'
import { verifyAdminToken } from '@/lib/auth-middleware'
import { exec } from 'child_process'
import { promisify } from 'util'
import { mkdir, writeFile, readdir, stat, readFile } from 'fs/promises'
import { join } from 'path'
import yauzl from 'yauzl'

const execAsync = promisify(exec)

export async function POST(request: NextRequest) {
  try {
    // Verify admin authentication
    const adminUser = await verifyAdminToken(request)
    if (!adminUser) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const formData = await request.formData()
    const backupFile = formData.get('backup') as File

    if (!backupFile) {
      return NextResponse.json({ error: 'No backup file provided' }, { status: 400 })
    }

    console.log('Starting full application restore...')

    // Create temporary restore directory
    const tempDir = `/tmp/restore-${Date.now()}`
    await mkdir(tempDir, { recursive: true })

    try {
      // Extract backup file
      console.log('Extracting backup file...')
      const zipBuffer = await backupFile.arrayBuffer()
      const zipPath = join(tempDir, 'backup.zip')
      await writeFile(zipPath, Buffer.from(zipBuffer))

      // Extract ZIP file
      await new Promise<void>((resolve, reject) => {
        yauzl.open(zipPath, { lazyEntries: true }, (err, zipfile) => {
          if (err) return reject(err)
          
          zipfile.readEntry()
          zipfile.on('entry', (entry) => {
            if (/\/$/.test(entry.fileName)) {
              // Directory entry
              zipfile.readEntry()
            } else {
              // File entry
              zipfile.openReadStream(entry, (err, readStream) => {
                if (err) return reject(err)
                
                const filePath = join(tempDir, entry.fileName)
                const fs = require('fs')
                const path = require('path')
                
                // Create directory if it doesn't exist
                const dir = path.dirname(filePath)
                fs.mkdirSync(dir, { recursive: true })
                
                const writeStream = fs.createWriteStream(filePath)
                
                readStream.pipe(writeStream)
                writeStream.on('close', () => {
                  zipfile.readEntry()
                })
              })
            }
          })
          
          zipfile.on('end', () => resolve())
          zipfile.on('error', reject)
        })
      })

      // 2. Read backup metadata
      const metadataPath = join(tempDir, 'backup-metadata.json')
      let metadata
      try {
        const metadataContent = await readFile(metadataPath, 'utf-8')
        metadata = JSON.parse(metadataContent)
        console.log('Backup metadata loaded:', metadata.backupName)
      } catch (error) {
        console.log('No metadata found, proceeding with basic restore')
        metadata = { backupName: 'unknown' }
      }

      // 3. Restore database
      const dbBackupPath = join(tempDir, 'database.sql')
      try {
        const dbBackupExists = await stat(dbBackupPath).then(() => true).catch(() => false)
        if (!dbBackupExists) {
          throw new Error('Database backup file not found in backup')
        }

        // Get database connection details from environment
        const databaseUrl = process.env.DATABASE_URL || 'postgresql://postgres:drone123456@db:5432/rwanda_drone_community'
        const url = new URL(databaseUrl)
        const dbHost = url.hostname
        const dbPort = url.port || '5432'
        const dbName = url.pathname.slice(1)
        const dbUser = url.username
        const dbPassword = url.password

        // First, terminate existing connections and drop the database
        const terminateConnectionsCommand = `PGPASSWORD="${dbPassword}" psql -h ${dbHost} -p ${dbPort} -U ${dbUser} -d postgres -c "SELECT pg_terminate_backend(pid) FROM pg_stat_activity WHERE datname = '${dbName}' AND pid <> pg_backend_pid();"`
        const dropDbCommand = `PGPASSWORD="${dbPassword}" dropdb -h ${dbHost} -p ${dbPort} -U ${dbUser} --if-exists ${dbName}`
        const createDbCommand = `PGPASSWORD="${dbPassword}" createdb -h ${dbHost} -p ${dbPort} -U ${dbUser} ${dbName}`

        console.log('Terminating existing connections...')
        try {
          await execAsync(terminateConnectionsCommand)
        } catch (error) {
          console.log('No connections to terminate or error occurred:', error)
        }

        console.log('Dropping existing database...')
        await execAsync(dropDbCommand)

        console.log('Creating new database...')
        await execAsync(createDbCommand)

        // Restore database from backup
        const psqlCommand = `PGPASSWORD="${dbPassword}" psql -h ${dbHost} -p ${dbPort} -U ${dbUser} -d ${dbName}`
        const { stdout, stderr } = await execAsync(psqlCommand, {
          input: await readFile(dbBackupPath, 'utf-8')
        })
        
        if (stderr && !stderr.includes('WARNING') && !stderr.includes('NOTICE')) {
          console.error('psql stderr:', stderr)
          throw new Error(`Database restore failed: ${stderr}`)
        }

        console.log('Database restored successfully')
      } catch (error) {
        console.error('Database restore error:', error)
        throw new Error(`Database restore failed: ${error.message}`)
      }

      // 4. Restore files
      const uploadsBackupDir = join(tempDir, 'uploads')
      try {
        const filesExist = await stat(uploadsBackupDir).then(() => true).catch(() => false)
        if (filesExist) {
          console.log('Restoring uploaded files...')
          const uploadsDir = join(process.cwd(), 'public', 'uploads')
          
          // Create uploads directory if it doesn't exist
          await mkdir(uploadsDir, { recursive: true })
          
          // Copy files back
          const copyCommand = `cp -r "${uploadsBackupDir}"/* "${uploadsDir}/" 2>/dev/null || true`
          await execAsync(copyCommand)
          console.log('Files restored successfully')
        } else {
          console.log('No files to restore')
        }
      } catch (error) {
        console.log('Files restore failed, continuing:', error)
      }

      // 5. Clean up temporary files
      await execAsync(`rm -rf "${tempDir}"`)

      console.log('Full application restore completed successfully')

      return NextResponse.json({ 
        success: true, 
        message: 'Full application restored successfully',
        details: {
          restoredAt: new Date().toISOString(),
          restoredBy: adminUser.user.userId,
          backupName: metadata.backupName,
          includes: {
            database: true,
            files: true
          }
        }
      })

    } catch (error) {
      // Clean up on error
      await execAsync(`rm -rf "${tempDir}"`).catch(() => {})
      throw error
    }

  } catch (error) {
    console.error('Full restore error:', error)
    return NextResponse.json(
      { error: 'Failed to restore application', details: error instanceof Error ? error.message : 'Unknown error' },
      { status: 500 }
    )
  }
}
