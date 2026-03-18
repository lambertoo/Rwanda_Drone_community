import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { getCurrentUser } from '@/lib/auth'

export async function GET(request: NextRequest) {
  try {
    const user = await getCurrentUser()

    const where: any = {
      OR: [{ isPublic: true }],
    }

    if (user) {
      where.OR.push({ reporterId: user.id })
    }

    const reports = await prisma.safetyReport.findMany({
      where,
      include: {
        reporter: {
          select: { id: true, username: true, fullName: true, avatar: true },
        },
      },
      orderBy: { createdAt: 'desc' },
    })

    // Mask reporter info for anonymous reports
    const sanitized = reports.map((report) => {
      if (report.isAnonymous && (!user || report.reporterId !== user.id)) {
        return { ...report, reporter: null, reporterId: null }
      }
      return report
    })

    return NextResponse.json({ reports: sanitized })
  } catch (error) {
    console.error('Error fetching safety reports:', error)
    return NextResponse.json({ error: 'Failed to fetch safety reports' }, { status: 500 })
  }
}

export async function POST(request: NextRequest) {
  try {
    const user = await getCurrentUser()

    const body = await request.json()
    const {
      type,
      date,
      location,
      latitude,
      longitude,
      description,
      injuries,
      propertyDamage,
      reportedToCAA,
      caaReferenceNumber,
      isAnonymous,
      isPublic,
    } = body

    if (!type || !date || !location || !description) {
      return NextResponse.json(
        { error: 'Type, date, location, and description are required' },
        { status: 400 }
      )
    }

    const report = await prisma.safetyReport.create({
      data: {
        reporterId: user && !isAnonymous ? user.id : null,
        type,
        date: new Date(date),
        location,
        latitude: latitude ? parseFloat(latitude) : null,
        longitude: longitude ? parseFloat(longitude) : null,
        description,
        injuries: injuries === true,
        propertyDamage: propertyDamage === true,
        reportedToCAA: reportedToCAA === true,
        caaReferenceNumber: reportedToCAA ? caaReferenceNumber || null : null,
        isAnonymous: isAnonymous === true,
        isPublic: isPublic !== false,
        status: 'received',
      },
    })

    return NextResponse.json({ report }, { status: 201 })
  } catch (error) {
    console.error('Error creating safety report:', error)
    return NextResponse.json({ error: 'Failed to create safety report' }, { status: 500 })
  }
}
