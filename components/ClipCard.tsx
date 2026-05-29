'use client'
import { formatDuration } from '@/lib/utils'
import { Button } from './ui/button'
import { Download, Scissors } from 'lucide-react'

interface Clip {
  id: string
  start: number
  end: number
  hook: string | null
  reason: string | null
  url: string | null
}

export function ClipCard({ clip, index }: { clip: Clip; index: number }) {
  const duration = clip.end - clip.start

  const handleDownload = () => {
    if (!clip.url) return
    const a = document.createElement('a')
    a.href = clip.url
    a.download = `clip_${index + 1}.mp4`
    a.click()
  }

  return (
    <div className="rounded-xl border border-border bg-card p-5 flex flex-col gap-3">
      <div className="flex items-start justify-between gap-2">
        <div className="flex items-center gap-2">
          <div className="w-8 h-8 rounded-full bg-violet-500/20 flex items-center justify-center shrink-0">
            <Scissors className="w-4 h-4 text-violet-400" />
          </div>
          <span className="font-semibold text-sm">Clip {index + 1}</span>
        </div>
        <span className="text-xs text-muted-foreground bg-muted px-2 py-1 rounded-full">
          {formatDuration(clip.start)} – {formatDuration(clip.end)} · {Math.round(duration)}s
        </span>
      </div>

      {clip.hook && (
        <div className="space-y-1">
          <p className="text-xs font-medium text-violet-400 uppercase tracking-wide">Hook</p>
          <p className="text-sm font-medium leading-snug">{clip.hook}</p>
        </div>
      )}

      {clip.reason && (
        <div className="space-y-1">
          <p className="text-xs font-medium text-muted-foreground uppercase tracking-wide">Why it works</p>
          <p className="text-sm text-muted-foreground leading-snug">{clip.reason}</p>
        </div>
      )}

      <Button
        size="sm"
        onClick={handleDownload}
        disabled={!clip.url}
        className="w-full bg-violet-600 hover:bg-violet-700 text-white mt-1"
      >
        <Download className="w-4 h-4" />
        Download Clip
      </Button>
    </div>
  )
}
