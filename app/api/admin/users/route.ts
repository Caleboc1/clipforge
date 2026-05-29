import { NextResponse } from 'next/server'
import { getSession } from '@/lib/auth'
import { prisma } from '@/lib/prisma'

export async function GET() {
  const session = await getSession()
  if (!session?.isAdmin) return NextResponse.json({ error: 'Forbidden' }, { status: 403 })

  const users = await prisma.user.findMany({
    include: { subscription: true, _count: { select: { videos: true } } },
    orderBy: { createdAt: 'desc' }
  })

  return NextResponse.json({
    users: users.map(({ password: _, ...u }) => u)
  })
}
