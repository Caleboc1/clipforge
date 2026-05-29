import { NextResponse } from 'next/server'
import { getSession } from '@/lib/auth'
import { getUserVideos } from '@/lib/video'

export async function GET() {
  const session = await getSession()
  if (!session) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

  const videos = await getUserVideos(session.userId)
  return NextResponse.json({ videos })
}
