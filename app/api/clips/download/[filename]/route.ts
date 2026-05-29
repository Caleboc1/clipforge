import { NextRequest, NextResponse } from 'next/server'
import { getSession } from '@/lib/auth'
import { prisma } from '@/lib/prisma'
import path from 'path'
import fs from 'fs'

const UPLOAD_DIR = process.env.UPLOAD_DIR || '/tmp/clipforge'

export async function GET(req: NextRequest, { params }: { params: { filename: string } }) {
  const session = await getSession()
  if (!session) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

  // Sanitize to prevent path traversal
  const safeName = path.basename(params.filename)
  const filePath = path.join(UPLOAD_DIR, safeName)

  // Verify the clip belongs to the requesting user
  const clip = await prisma.clip.findFirst({
    where: { filePath },
    include: { video: true }
  })

  if (!clip || clip.video.userId !== session.userId) {
    return NextResponse.json({ error: 'Not found' }, { status: 404 })
  }

  if (!fs.existsSync(filePath)) {
    return NextResponse.json({ error: 'File no longer available' }, { status: 410 })
  }

  const buffer = fs.readFileSync(filePath)

  return new NextResponse(buffer, {
    headers: {
      'Content-Type': 'video/mp4',
      'Content-Disposition': `attachment; filename="${safeName}"`,
      'Content-Length': buffer.length.toString()
    }
  })
}
