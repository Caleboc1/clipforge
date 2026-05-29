import OpenAI from 'openai'
import fs from 'fs'

const openai = new OpenAI({ apiKey: process.env.OPENAI_API_KEY })

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

export async function transcribeAudio(audioPath: string): Promise<TranscriptSegment[]> {
  const audioStream = fs.createReadStream(audioPath)

  const response = await openai.audio.transcriptions.create({
    file: audioStream,
    model: 'whisper-1',
    response_format: 'verbose_json',
    timestamp_granularities: ['segment']
  })

  const segments = (response as any).segments || []
  return segments.map((seg: any) => ({
    start: seg.start,
    end: seg.end,
    text: seg.text.trim()
  }))
}

export async function detectViralClips(segments: TranscriptSegment[]): Promise<ClipSuggestion[]> {
  if (segments.length === 0) return []

  const transcript = segments
    .map(s => `[${s.start.toFixed(1)}s–${s.end.toFixed(1)}s]: ${s.text}`)
    .join('\n')

  const response = await openai.chat.completions.create({
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
