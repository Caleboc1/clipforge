import { NextRequest, NextResponse } from 'next/server'
import { getSession } from '@/lib/auth'
import { getVideoWithClips } from '@/lib/video'

export async function GET(_req: NextRequest, { params }: { params: { id: string } }) {
  const session = await getSession()
  if (!session) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

  const video = await getVideoWithClips(params.id, session.userId)
  if (!video) return NextResponse.json({ error: 'Not found' }, { status: 404 })

  return NextResponse.json({ video })
}
