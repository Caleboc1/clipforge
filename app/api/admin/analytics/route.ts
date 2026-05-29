import { NextResponse } from 'next/server'
import { getSession } from '@/lib/auth'
import { prisma } from '@/lib/prisma'

export async function GET() {
  const session = await getSession()
  if (!session?.isAdmin) return NextResponse.json({ error: 'Forbidden' }, { status: 403 })

  const startOfMonth = new Date()
  startOfMonth.setDate(1)
  startOfMonth.setHours(0, 0, 0, 0)

  const [
    totalUsers,
    newUsersThisMonth,
    activeSubscriptions,
    totalVideos,
    videosThisMonth,
    failedVideos,
    usageAgg,
    usageThisMonth
  ] = await Promise.all([
    prisma.user.count(),
    prisma.user.count({ where: { createdAt: { gte: startOfMonth } } }),
    prisma.subscription.count({ where: { plan: 'pro', status: 'active' } }),
    prisma.video.count(),
    prisma.video.count({ where: { createdAt: { gte: startOfMonth } } }),
    prisma.video.count({ where: { status: 'failed' } }),
    prisma.usage.aggregate({ _sum: { minutesProcessed: true, costEstimate: true } }),
    prisma.usage.aggregate({
      _sum: { minutesProcessed: true, costEstimate: true },
      where: { createdAt: { gte: startOfMonth } }
    })
  ])

  return NextResponse.json({
    totalUsers,
    newUsersThisMonth,
    activeSubscriptions,
    estimatedMonthlyRevenue: activeSubscriptions * 5000,
    totalVideos,
    videosThisMonth,
    failedVideos,
    totalMinutesProcessed: usageAgg._sum.minutesProcessed || 0,
    totalCostEstimate: usageAgg._sum.costEstimate || 0,
    monthlyMinutes: usageThisMonth._sum.minutesProcessed || 0,
    monthlyCost: usageThisMonth._sum.costEstimate || 0
  })
}
