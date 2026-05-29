import { prisma } from '@/lib/prisma'
import { transcribeAudio, detectViralClips } from '@/lib/ai'
import { trackUsage } from '@/lib/usage'
import { downloadVideo, extractAudio, cleanupFiles } from './download'
import { generateClips } from './clip'

export async function processVideo(videoId: string, url: string, userId: string) {
  let audioPath: string | null = null
  let videoPath: string | null = null

  try {
    await prisma.video.update({ where: { id: videoId }, data: { status: 'processing' } })

    // Step 1: Download
    const { title, duration, filePath } = await downloadVideo(url, videoId)
    videoPath = filePath
    await prisma.video.update({ where: { id: videoId }, data: { title, duration, filePath } })

    // Step 2: Extract audio
    audioPath = await extractAudio(videoPath, videoId)

    // Step 3: Transcribe via Whisper
    const segments = await transcribeAudio(audioPath)

    // Step 4: AI clip detection via GPT
    const suggestions = await detectViralClips(segments)

    // Step 5: Generate clips with ffmpeg
    const generatedClips = await generateClips(videoPath, videoId, suggestions)

    // Step 6: Persist clips
    if (generatedClips.length > 0) {
      await prisma.clip.createMany({
        data: generatedClips.map(c => ({
          videoId,
          start: c.start,
          end: c.end,
          hook: c.hook,
          reason: c.reason,
          filePath: c.filePath,
          url: c.url
        }))
      })
    }

    // Track usage
    await trackUsage(userId, videoId, (duration || 0) / 60)

    await prisma.video.update({ where: { id: videoId }, data: { status: 'done' } })
  } catch (err: any) {
    console.error(`processVideo error [${videoId}]:`, err)
    await prisma.video.update({
      where: { id: videoId },
      data: { status: 'failed', error: err?.message || 'Processing failed' }
    })
  } finally {
    if (audioPath) cleanupFiles(audioPath)
  }
}
