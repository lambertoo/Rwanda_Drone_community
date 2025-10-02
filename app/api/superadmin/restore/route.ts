import { NextRequest, NextResponse } from 'next/server'
import { requireSuperAdmin } from '@/lib/auth-middleware'
import { exec } from 'child_process'
import { promisify } from 'util'
import { createReadStream, mkdirSync, existsSync, writeFileSync } from 'fs'
import { join } from 'path'
import { unlinkSync, rmdirSync } from 'fs'
import yauzl from 'yauzl'

const execAsync = promisify(exec)

export async function POST(request: NextRequest) {
  try {
    // Verify superadmin authentication
    const superAdminUser = await requireSuperAdmin(request)
    if (superAdminUser instanceof NextResponse) {
      return superAdminUser
    }

    const formData = await request.formData()
    const backupFile = formData.get('backup') as File

    if (!backupFile) {
      return NextResponse.json({ error: 'No backup file provided' }, { status: 400 })
    }

    console.log('Starting full application restore...')

    // Create temporary directory for extraction
    const tempDir = `/tmp/restore-${Date.now()}`
    mkdirSync(tempDir, { recursive: true })

    try {
      // 1. Extract ZIP file
      console.log('Extracting backup file...')
      const zipBuffer = await backupFile.arrayBuffer()
      const zipPath = join(tempDir, 'backup.zip')
      writeFileSync(zipPath, Buffer.from(zipBuffer))

      // Extract using unzip command
      await execAsync(`cd "${tempDir}" && unzip -o backup.zip`)

      // 2. Read backup metadata
      const metadataPath = join(tempDir, 'backup-metadata.json')
      if (!existsSync(metadataPath)) {
        throw new Error('Backup metadata not found. This may not be a valid full backup.')
      }

      const metadata = JSON.parse(require('fs').readFileSync(metadataPath, 'utf8'))
      console.log('Backup metadata:', metadata)

      // 3. Restore database
      if (metadata.includes.database) {
        console.log('Restoring database...')
        const dbBackupPath = join(tempDir, 'database.sql')
        
        if (!existsSync(dbBackupPath)) {
          throw new Error('Database backup file not found in backup')
        }

        // Get database connection details
        const dbHost = process.env.DATABASE_HOST || 'db'
        const dbPort = process.env.DATABASE_PORT || '5432'
        const dbName = process.env.DATABASE_NAME || 'rwanda_drone_community'
        const dbUser = process.env.DATABASE_USER || 'postgres'
        const dbPassword = process.env.DATABASE_PASSWORD || 'postgres'

        // Drop and recreate database
        const dropDbCommand = `PGPASSWORD="${dbPassword}" dropdb -h ${dbHost} -p ${dbPort} -U ${dbUser} --if-exists ${dbName}`
        const createDbCommand = `PGPASSWORD="${dbPassword}" createdb -h ${dbHost} -p ${dbPort} -U ${dbUser} ${dbName}`

        try {
          await execAsync(dropDbCommand)
        } catch (error) {
          console.log('Database might not exist, continuing...')
        }

        await execAsync(createDbCommand)

        // Restore database
        const psqlCommand = `PGPASSWORD="${dbPassword}" psql -h ${dbHost} -p ${dbPort} -U ${dbUser} -d ${dbName}`
        const dbContent = require('fs').readFileSync(dbBackupPath, 'utf8')
        
        const { stdout, stderr } = await execAsync(psqlCommand, {
          input: dbContent
        })
        
        if (stderr && !stderr.includes('WARNING') && !stderr.includes('NOTICE')) {
          console.error('psql stderr:', stderr)
          throw new Error(`Database restore failed: ${stderr}`)
        }

        console.log('Database restored successfully')
      }

      // 4. Restore files
      if (metadata.includes.files) {
        console.log('Restoring uploaded files...')
        const uploadsBackupPath = join(tempDir, 'uploads')
        const uploadsTargetPath = '/app/public/uploads'

        if (existsSync(uploadsBackupPath)) {
          // Remove existing uploads directory
          try {
            await execAsync(`rm -rf "${uploadsTargetPath}"`)
          } catch (error) {
            console.log('Uploads directory might not exist, continuing...')
          }

          // Restore uploads
          await execAsync(`cp -r "${uploadsBackupPath}" "${uploadsTargetPath}"`)
          console.log('Files restored successfully')
        }
      }

      // 5. Restore configuration (optional - be careful with this)
      console.log('Configuration restore skipped for safety. Manual review recommended.')

      // 6. Regenerate Prisma client
      console.log('Regenerating Prisma client...')
      await execAsync('cd /app && npx prisma generate')

      console.log('Full application restore completed successfully')

      return NextResponse.json({ 
        success: true, 
        message: 'Full application restored successfully',
        metadata: {
          restoredAt: new Date().toISOString(),
          restoredBy: superAdminUser.user.userId,
          originalBackup: metadata
        }
      })

    } finally {
      // Clean up temporary directory
      try {
        await execAsync(`rm -rf "${tempDir}"`)
      } catch (error) {
        console.error('Error cleaning up temp directory:', error)
      }
    }

  } catch (error) {
    console.error('Full restore error:', error)
    return NextResponse.json(
      { error: 'Failed to restore application', details: error instanceof Error ? error.message : 'Unknown error' },
      { status: 500 }
    )
  }
}
