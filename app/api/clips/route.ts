import { NextRequest, NextResponse } from 'next/server'
import { getSession } from '@/lib/auth'
import { prisma } from '@/lib/prisma'

export async function GET(req: NextRequest) {
  const session = await getSession()
  if (!session) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

  const videoId = req.nextUrl.searchParams.get('videoId')
  if (!videoId) return NextResponse.json({ error: 'videoId is required' }, { status: 400 })

  // Verify ownership
  const video = await prisma.video.findFirst({ where: { id: videoId, userId: session.userId } })
  if (!video) return NextResponse.json({ error: 'Not found' }, { status: 404 })

  const clips = await prisma.clip.findMany({
    where: { videoId },
    orderBy: { start: 'asc' }
  })

  return NextResponse.json({ clips })
}
