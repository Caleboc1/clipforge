import { exec } from 'child_process'
import { promisify } from 'util'
import path from 'path'
import fs from 'fs'
import type { ClipSuggestion } from '@/lib/ai'

const execAsync = promisify(exec)
const UPLOAD_DIR = process.env.UPLOAD_DIR || '/tmp/clipforge'

export interface GeneratedClip {
  start: number
  end: number
  hook: string
  reason: string
  filePath: string
  url: string
}

export async function generateClips(
  videoPath: string,
  videoId: string,
  suggestions: ClipSuggestion[]
): Promise<GeneratedClip[]> {
  const clips: GeneratedClip[] = []

  for (let i = 0; i < suggestions.length; i++) {
    const { start, end, hook, reason } = suggestions[i]
    const duration = end - start

    if (duration < 5 || duration > 120) continue

    const filename = `${videoId}_clip_${i}.mp4`
    const clipPath = path.join(UPLOAD_DIR, filename)

    try {
      // Cut clip, scale/crop to 9:16 vertical (1080x1920)
      await execAsync(
        `ffmpeg -ss ${start} -i "${videoPath}" -t ${duration} ` +
        `-vf "scale=1080:1920:force_original_aspect_ratio=increase,crop=1080:1920,setsar=1" ` +
        `-c:v libx264 -preset fast -crf 23 -c:a aac -b:a 128k ` +
        `"${clipPath}" -y`,
        { timeout: 120000 }
      )

      if (fs.existsSync(clipPath)) {
        clips.push({
          start,
          end,
          hook,
          reason,
          filePath: clipPath,
          url: `/api/clips/download/${filename}`
        })
      }
    } catch (err) {
      console.error(`Clip ${i} generation failed:`, err)
    }
  }

  return clips
}
