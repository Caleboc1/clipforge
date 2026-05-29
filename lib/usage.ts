import { prisma } from './prisma'

const WHISPER_COST_PER_MINUTE = 0.006
const GPT_COST_FLAT = 0.01

export async function trackUsage(userId: string, videoId: string, durationMinutes: number) {
  const costEstimate = durationMinutes * WHISPER_COST_PER_MINUTE + GPT_COST_FLAT
  await prisma.usage.create({
    data: { userId, videoId, minutesProcessed: durationMinutes, costEstimate }
  })
}

export async function getMonthlyUsage(userId: string) {
  const startOfMonth = new Date()
  startOfMonth.setDate(1)
  startOfMonth.setHours(0, 0, 0, 0)

  const [usageRecords, videosThisMonth] = await Promise.all([
    prisma.usage.findMany({
      where: { userId, createdAt: { gte: startOfMonth } }
    }),
    prisma.video.count({
      where: {
        userId,
        status: { in: ['processing', 'done'] },
        createdAt: { gte: startOfMonth }
      }
    })
  ])

  return {
    videosProcessed: videosThisMonth,
    minutesProcessed: usageRecords.reduce((s, u) => s + u.minutesProcessed, 0),
    costEstimate: usageRecords.reduce((s, u) => s + u.costEstimate, 0)
  }
}

export async function checkUsageLimit(
  userId: string,
  plan: string,
  videoDurationMinutes: number
): Promise<{ allowed: boolean; reason?: string }> {
  const { videosProcessed } = await getMonthlyUsage(userId)

  if (plan === 'free') {
    if (videosProcessed >= 2) {
      return { allowed: false, reason: 'Free plan: 2 videos/month limit reached. Upgrade to Pro.' }
    }
    if (videoDurationMinutes > 5) {
      return { allowed: false, reason: 'Free plan: max 5 minutes per video. Upgrade to Pro.' }
    }
  }

  if (plan === 'pro' && videosProcessed >= 30) {
    return { allowed: false, reason: 'Pro plan: 30 videos/month limit reached.' }
  }

  return { allowed: true }
}
