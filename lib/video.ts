import { prisma } from './prisma'

export async function getUserVideos(userId: string) {
  return prisma.video.findMany({
    where: { userId },
    include: { clips: true },
    orderBy: { createdAt: 'desc' }
  })
}

export async function getVideoWithClips(videoId: string, userId: string) {
  return prisma.video.findFirst({
    where: { id: videoId, userId },
    include: { clips: true }
  })
}
