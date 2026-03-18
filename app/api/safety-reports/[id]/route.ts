import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { getCurrentUser } from '@/lib/auth'

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const user = await getCurrentUser()
    const { id } = await params

    const report = await prisma.safetyReport.findUnique({
      where: { id },
      include: {
        reporter: {
          select: { id: true, username: true, fullName: true, avatar: true },
        },
      },
    })

    if (!report) return NextResponse.json({ error: 'Report not found' }, { status: 404 })

    // Public reports are visible to all; private only to reporter or admin
    if (!report.isPublic) {
      if (!user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
      if (report.reporterId !== user.id && user.role !== 'admin') {
        return NextResponse.json({ error: 'Forbidden' }, { status: 403 })
      }
    }

    // Mask reporter for anonymous reports unless viewing own or admin
    const canSeeReporter =
      user && (user.id === report.reporterId || user.role === 'admin')

    const sanitized =
      report.isAnonymous && !canSeeReporter
        ? { ...report, reporter: null, reporterId: null }
        : report

    return NextResponse.json({ report: sanitized })
  } catch (error) {
    console.error('Error fetching safety report:', error)
    return NextResponse.json({ error: 'Failed to fetch safety report' }, { status: 500 })
  }
}

export async function PUT(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const user = await getCurrentUser()
    if (!user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

    const { id } = await params

    const existing = await prisma.safetyReport.findUnique({ where: { id } })
    if (!existing) return NextResponse.json({ error: 'Report not found' }, { status: 404 })

    if (existing.reporterId !== user.id && user.role !== 'admin') {
      return NextResponse.json({ error: 'Forbidden' }, { status: 403 })
    }

    const body = await request.json()
    const { status, adminNotes, isPublic, description } = body

    const report = await prisma.safetyReport.update({
      where: { id },
      data: {
        status: status !== undefined ? status : existing.status,
        adminNotes: user.role === 'admin' ? adminNotes ?? existing.adminNotes : existing.adminNotes,
        isPublic: isPublic !== undefined ? isPublic === true : existing.isPublic,
        description: description !== undefined ? description : existing.description,
      },
    })

    return NextResponse.json({ report })
  } catch (error) {
    console.error('Error updating safety report:', error)
    return NextResponse.json({ error: 'Failed to update safety report' }, { status: 500 })
  }
}

export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const user = await getCurrentUser()
    if (!user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

    const { id } = await params

    const existing = await prisma.safetyReport.findUnique({ where: { id } })
    if (!existing) return NextResponse.json({ error: 'Report not found' }, { status: 404 })
    if (existing.reporterId !== user.id && user.role !== 'admin') {
      return NextResponse.json({ error: 'Forbidden' }, { status: 403 })
    }

    await prisma.safetyReport.delete({ where: { id } })

    return NextResponse.json({ message: 'Report deleted successfully' })
  } catch (error) {
    console.error('Error deleting safety report:', error)
    return NextResponse.json({ error: 'Failed to delete safety report' }, { status: 500 })
  }
}
