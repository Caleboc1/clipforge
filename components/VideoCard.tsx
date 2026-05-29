'use client'
import { formatDate, formatDuration } from '@/lib/utils'
import { Badge } from './ui/badge'
import { Loader2, CheckCircle, XCircle, Clock, Film } from 'lucide-react'

interface Clip {
  id: string
  start: number
  end: number
  hook: string | null
}

interface Video {
  id: string
  title: string | null
  url: string
  status: string
  duration: number | null
  createdAt: string
  clips: Clip[]
}

interface VideoCardProps {
  video: Video
  onSelect: (videoId: string) => void
  selected: boolean
}

const statusConfig = {
  pending:    { label: 'Queued',     variant: 'outline'     as const, icon: Clock },
  processing: { label: 'Processing', variant: 'processing'  as const, icon: Loader2 },
  done:       { label: 'Done',       variant: 'success'     as const, icon: CheckCircle },
  failed:     { label: 'Failed',     variant: 'destructive' as const, icon: XCircle }
}

export function VideoCard({ video, onSelect, selected }: VideoCardProps) {
  const cfg = statusConfig[video.status as keyof typeof statusConfig] || statusConfig.pending
  const Icon = cfg.icon

  const thumbnailUrl = (() => {
    try {
      const u = new URL(video.url)
      const v = u.searchParams.get('v') || u.pathname.split('/').pop()
      return v ? `https://img.youtube.com/vi/${v}/mqdefault.jpg` : null
    } catch { return null }
  })()

  return (
    <div
      onClick={() => video.status === 'done' && onSelect(video.id)}
      className={`rounded-xl border bg-card overflow-hidden transition-all cursor-pointer hover:border-violet-500/50 ${
        selected ? 'border-violet-500 ring-2 ring-violet-500/20' : 'border-border'
      } ${video.status !== 'done' ? 'opacity-80 cursor-default' : ''}`}
    >
      <div className="relative aspect-video bg-zinc-900">
        {thumbnailUrl ? (
          // eslint-disable-next-line @next/next/no-img-element
          <img src={thumbnailUrl} alt={video.title || 'Video'} className="w-full h-full object-cover" />
        ) : (
          <div className="w-full h-full flex items-center justify-center">
            <Film className="w-10 h-10 text-zinc-600" />
          </div>
        )}
        {video.status === 'processing' && (
          <div className="absolute inset-0 bg-black/60 flex items-center justify-center">
            <Loader2 className="w-8 h-8 text-white animate-spin" />
          </div>
        )}
        {video.duration && (
          <span className="absolute bottom-2 right-2 bg-black/80 text-white text-xs px-1.5 py-0.5 rounded">
            {formatDuration(video.duration)}
          </span>
        )}
      </div>

      <div className="p-4 space-y-2">
        <p className="font-medium text-sm truncate">{video.title || 'Processing...'}</p>
        <div className="flex items-center justify-between">
          <Badge variant={cfg.variant} className="gap-1">
            <Icon className={`w-3 h-3 ${video.status === 'processing' ? 'animate-spin' : ''}`} />
            {cfg.label}
          </Badge>
          {video.status === 'done' && (
            <span className="text-xs text-muted-foreground">{video.clips.length} clips</span>
          )}
        </div>
        <p className="text-xs text-muted-foreground">{formatDate(video.createdAt)}</p>
      </div>
    </div>
  )
}
