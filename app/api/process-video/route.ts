import { NextRequest, NextResponse } from 'next/server'
import { getSession } from '@/lib/auth'
import { prisma } from '@/lib/prisma'
import { checkUsageLimit } from '@/lib/usage'
import { getVideoInfo } from '@/services/download'
import { processVideo } from '@/services/process'

export async function POST(req: NextRequest) {
  const session = await getSession()
  if (!session) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

  const { url } = await req.json()

  if (!url || typeof url !== 'string') {
    return NextResponse.json({ error: 'YouTube URL is required' }, { status: 400 })
  }

  const isYouTube = url.includes('youtube.com') || url.includes('youtu.be')
  if (!isYouTube) {
    return NextResponse.json({ error: 'Only YouTube URLs are supported' }, { status: 400 })
  }

  const user = await prisma.user.findUnique({
    where: { id: session.userId },
    include: { subscription: true }
  })
  if (!user) return NextResponse.json({ error: 'User not found' }, { status: 404 })

  const plan = user.subscription?.plan || 'free'

  // Check video count limit first (cheap check)
  const countCheck = await checkUsageLimit(session.userId, plan, 0)
  if (!countCheck.allowed) {
    return NextResponse.json({ error: countCheck.reason }, { status: 403 })
  }

  // Get video duration to validate plan limits
  let duration = 0
  try {
    const info = await getVideoInfo(url)
    duration = info.duration
  } catch {
    return NextResponse.json({ error: 'Could not fetch video info. Check the URL.' }, { status: 400 })
  }

  const durationMinutes = duration / 60
  const limitCheck = await checkUsageLimit(session.userId, plan, durationMinutes)
  if (!limitCheck.allowed) {
    return NextResponse.json({ error: limitCheck.reason }, { status: 403 })
  }

  const video = await prisma.video.create({
    data: { userId: session.userId, url, status: 'pending' }
  })

  // Fire-and-forget processing
  processVideo(video.id, url, session.userId).catch(console.error)

  return NextResponse.json({ videoId: video.id, status: 'pending' })
}
