import OpenAI from 'openai'
import fs from 'fs'

function getOpenAI() {
  return new OpenAI({ apiKey: process.env.OPENAI_API_KEY })
}

const WHISPER_MAX_BYTES = 24 * 1024 * 1024 // 24MB — stay under the 25MB hard limit

export interface TranscriptSegment {
  start: number
  end: number
  text: string
}

export interface ClipSuggestion {
  start: number
  end: number
  hook: string
  reason: string
}

async function callWhisper(audioPath: string) {
  const stat = fs.statSync(audioPath)
  if (stat.size > WHISPER_MAX_BYTES) {
    throw new Error(`Audio file is ${(stat.size / 1024 / 1024).toFixed(1)}MB — exceeds Whisper's 25MB limit. Use a shorter video.`)
  }

  const buffer = fs.readFileSync(audioPath)
  const file = new File([buffer], 'audio.mp3', { type: 'audio/mpeg' })
  return getOpenAI().audio.transcriptions.create({
    file,
    model: 'whisper-1',
    response_format: 'verbose_json',
    timestamp_granularities: ['segment']
  })
}

export async function transcribeAudio(audioPath: string): Promise<TranscriptSegment[]> {
  let lastErr: unknown
  for (let attempt = 1; attempt <= 3; attempt++) {
    try {
      const response = await callWhisper(audioPath)
      const segments = (response as any).segments || []
      return segments.map((seg: any) => ({
        start: seg.start,
        end: seg.end,
        text: seg.text.trim()
      }))
    } catch (err: any) {
      lastErr = err
      if (err?.status === 429 && err?.error?.code === 'insufficient_quota') {
        throw new Error('OpenAI quota exceeded. Add billing credits at platform.openai.com/billing.')
      }
      const isRetryable =
        err?.cause?.code === 'ECONNRESET' ||
        err?.name === 'APIConnectionError' ||
        err?.status === 429 ||
        err?.status >= 500
      if (!isRetryable || attempt === 3) throw err
      await new Promise(r => setTimeout(r, attempt * 2000))
    }
  }
  throw lastErr
}

export async function detectViralClips(segments: TranscriptSegment[]): Promise<ClipSuggestion[]> {
  if (segments.length === 0) return []

  const transcript = segments
    .map(s => `[${s.start.toFixed(1)}s–${s.end.toFixed(1)}s]: ${s.text}`)
    .join('\n')

  const response = await getOpenAI().chat.completions.create({
    model: 'gpt-4o-mini',
    messages: [
      {
        role: 'system',
        content: 'You are an expert viral video editor. Return ONLY valid JSON arrays — no markdown, no extra text.'
      },
      {
        role: 'user',
        content: `Analyze this transcript and extract 3–5 highly engaging segments for TikTok/YouTube Shorts.

Criteria:
- Strong hook in first 3 seconds of the segment
- Emotionally resonant or highly valuable content
- Self-contained — makes sense without prior context
- Duration strictly between 15 and 60 seconds

Transcript:
${transcript}

Return ONLY a JSON array:
[{"start":number,"end":number,"hook":"string","reason":"string"}]`
      }
    ],
    temperature: 0.6,
    max_tokens: 1000
  })

  const content = response.choices[0]?.message?.content?.trim() || '[]'

  try {
    const parsed: ClipSuggestion[] = JSON.parse(content)
    return parsed.filter(c => {
      const dur = c.end - c.start
      return dur >= 15 && dur <= 60 && c.start >= 0
    })
  } catch {
    const match = content.match(/\[[\s\S]*\]/)
    if (match) {
      try {
        return JSON.parse(match[0])
      } catch {
        return []
      }
    }
    return []
  }
}
