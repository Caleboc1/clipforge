'use client'
import { useEffect, useState } from 'react'
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table'
import { Badge } from '@/components/ui/badge'
import { formatDate, formatDuration } from '@/lib/utils'

interface AdminVideo {
  id: string
  url: string
  title: string | null
  status: string
  duration: number | null
  createdAt: string
  user: { id: string; email: string; name: string | null }
  _count: { clips: number }
}

const statusVariant: Record<string, 'success' | 'processing' | 'destructive' | 'outline'> = {
  done: 'success',
  processing: 'processing',
  failed: 'destructive',
  pending: 'outline'
}

export default function AdminVideosPage() {
  const [videos, setVideos] = useState<AdminVideo[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    fetch('/api/admin/videos')
      .then(r => r.json())
      .then(d => setVideos(d.videos || []))
      .finally(() => setLoading(false))
  }, [])

  return (
    <div className="p-8 space-y-6">
      <div>
        <h1 className="text-2xl font-bold">Videos</h1>
        <p className="text-muted-foreground text-sm">{videos.length} most recent</p>
      </div>

      <div className="rounded-xl border border-border overflow-hidden">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Title</TableHead>
              <TableHead>User</TableHead>
              <TableHead>Status</TableHead>
              <TableHead>Duration</TableHead>
              <TableHead>Clips</TableHead>
              <TableHead>Date</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {loading ? (
              <TableRow>
                <TableCell colSpan={6} className="text-center text-muted-foreground py-10">Loading...</TableCell>
              </TableRow>
            ) : videos.map(v => (
              <TableRow key={v.id}>
                <TableCell>
                  <a href={v.url} target="_blank" rel="noopener noreferrer"
                     className="text-sm text-violet-400 hover:underline max-w-xs truncate block">
                    {v.title || v.url}
                  </a>
                </TableCell>
                <TableCell className="text-sm text-muted-foreground">{v.user.email}</TableCell>
                <TableCell>
                  <Badge variant={statusVariant[v.status] || 'outline'}>{v.status}</Badge>
                </TableCell>
                <TableCell className="text-sm">{v.duration ? formatDuration(v.duration) : '—'}</TableCell>
                <TableCell className="text-sm">{v._count.clips}</TableCell>
                <TableCell className="text-sm text-muted-foreground">{formatDate(v.createdAt)}</TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </div>
    </div>
  )
}
