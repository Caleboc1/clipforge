import { exec } from 'child_process'
import { promisify } from 'util'
import path from 'path'
import fs from 'fs'

const execAsync = promisify(exec)

export const UPLOAD_DIR = process.env.UPLOAD_DIR || '/tmp/clipforge'

export function ensureUploadDir() {
  if (!fs.existsSync(UPLOAD_DIR)) {
    fs.mkdirSync(UPLOAD_DIR, { recursive: true })
  }
}

export interface VideoInfo {
  title: string
  duration: number
  filePath: string
}

export async function getVideoInfo(url: string): Promise<{ title: string; duration: number }> {
  const { stdout } = await execAsync(
    `yt-dlp --dump-json --no-playlist "${url}"`,
    { timeout: 30000 }
  )
  const info = JSON.parse(stdout)
  return { title: info.title || 'Untitled', duration: info.duration || 0 }
}

export async function downloadVideo(url: string, videoId: string): Promise<VideoInfo> {
  ensureUploadDir()
  const outputTemplate = path.join(UPLOAD_DIR, `${videoId}.%(ext)s`)

  const { title, duration } = await getVideoInfo(url)

  await execAsync(
    `yt-dlp -f "best[ext=mp4]/bestvideo[ext=mp4]+bestaudio[ext=m4a]/best" --no-playlist -o "${outputTemplate}" "${url}"`,
    { timeout: 600000 }
  )

  const files = fs.readdirSync(UPLOAD_DIR).filter(f => f.startsWith(videoId) && !f.includes('_audio') && !f.includes('_clip'))
  if (!files.length) throw new Error('Download produced no output file')

  return { title, duration, filePath: path.join(UPLOAD_DIR, files[0]) }
}

export async function extractAudio(videoPath: string, videoId: string): Promise<string> {
  const audioPath = path.join(UPLOAD_DIR, `${videoId}_audio.mp3`)
  await execAsync(
    `ffmpeg -i "${videoPath}" -vn -acodec libmp3lame -ar 16000 -ac 1 -q:a 5 "${audioPath}" -y`,
    { timeout: 300000 }
  )
  return audioPath
}

export function cleanupFiles(...paths: string[]) {
  for (const p of paths) {
    try { if (fs.existsSync(p)) fs.unlinkSync(p) } catch {}
  }
}
