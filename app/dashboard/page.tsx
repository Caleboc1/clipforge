'use client'
import { useState, useEffect, useCallback } from 'react'
import { useRouter, useSearchParams } from 'next/navigation'
import Link from 'next/link'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Badge } from '@/components/ui/badge'
import { VideoCard } from '@/components/VideoCard'
import { ClipCard } from '@/components/ClipCard'
import { ProcessingStatus } from '@/components/ProcessingStatus'
import { Scissors, LogOut, Settings, Loader2, Zap, ArrowLeft, AlertCircle } from 'lucide-react'

interface User {
  id: string
  email: string
  name: string | null
  isAdmin: boolean
  subscription: { plan: string; status: string } | null
}

interface Clip { id: string; start: number; end: number; hook: string | null; reason: string | null; url: string | null }
interface Video { id: string; title: string | null; url: string; status: string; duration: number | null; createdAt: string; clips: Clip[] }

export default function DashboardPage() {
  const router = useRouter()
  const searchParams = useSearchParams()

  const [user, setUser]               = useState<User | null>(null)
  const [videos, setVideos]           = useState<Video[]>([])
  const [url, setUrl]                 = useState('')
  const [submitting, setSubmitting]   = useState(false)
  const [error, setError]             = useState('')
  const [processingId, setProcessingId] = useState<string | null>(null)
  const [selectedVideo, setSelectedVideo] = useState<Video | null>(null)
  const [loadingVideos, setLoadingVideos] = useState(true)

  const loadVideos = useCallback(async () => {
    const res = await fetch('/api/videos')
    if (res.ok) {
      const data = await res.json()
      setVideos(data.videos)
    }
  }, [])

  useEffect(() => {
    fetch('/api/auth/me').then(r => r.json()).then(d => {
      if (d.user) setUser(d.user)
      else router.push('/login')
    })
    loadVideos().finally(() => setLoadingVideos(false))

    if (searchParams.get('payment') === 'success') {
      // Re-fetch user to get updated subscription
      setTimeout(() => fetch('/api/auth/me').then(r => r.json()).then(d => setUser(d.user)), 2000)
    }
  }, [router, loadVideos, searchParams])

  // Poll for in-progress videos
  useEffect(() => {
    const hasProcessing = videos.some(v => v.status === 'pending' || v.status === 'processing')
    if (!hasProcessing) return

    const interval = setInterval(loadVideos, 5000)
    return () => clearInterval(interval)
  }, [videos, loadVideos])

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setError('')
    setSubmitting(true)

    try {
      const res = await fetch('/api/process-video', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ url })
      })
      const data = await res.json()

      if (!res.ok) {
        setError(data.error || 'Failed to start processing')
        return
      }

      setUrl('')
      setProcessingId(data.videoId)
      await loadVideos()
    } catch {
      setError('Something went wrong. Try again.')
    } finally {
      setSubmitting(false)
    }
  }

  const handleLogout = async () => {
    await fetch('/api/auth/logout', { method: 'POST' })
    router.push('/login')
  }

  const handleUpgrade = async (plan: 'pro' | 'plus') => {
    const res = await fetch('/api/paystack/subscribe', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ plan })
    })
    const data = await res.json()
    if (data.authorizationUrl) window.location.href = data.authorizationUrl
  }

  const currentPlan = user?.subscription?.status === 'active' ? user.subscription.plan : 'free'
  const isPro = currentPlan === 'pro'
  const isPlus = currentPlan === 'plus'
  const isPaid = isPro || isPlus
  const processingCount = videos.filter(v => v.status === 'pending' || v.status === 'processing').length

  const selectedVideoId = selectedVideo?.id ?? null
  const planLabel = isPlus ? 'Plus' : isPro ? 'Pro' : 'Free'
  const planLimitsText = isPlus
    ? '30 videos/month · Longer videos'
    : isPro
    ? '10 videos/month · Longer videos'
    : '2 free videos/month · Max 5 min each'

  return (
    <div className="min-h-screen flex flex-col">
      {/* Header */}
      <header className="border-b border-border/50 bg-card/50 backdrop-blur sticky top-0 z-10">
        <div className="max-w-6xl mx-auto px-6 h-16 flex items-center justify-between">
          <Link href="/" className="flex items-center gap-2">
            <Scissors className="w-5 h-5 text-violet-400" />
            <span className="font-bold">ClipForge</span>
          </Link>
          <div className="flex items-center gap-3">
            <Badge variant={isPaid ? 'success' : 'secondary'} className="hidden sm:flex">
              {planLabel}
            </Badge>
            {!isPlus && (
              <Button
                size="sm"
                onClick={() => handleUpgrade(isPro ? 'plus' : 'pro')}
                className={isPro ? 'bg-pink-600 hover:bg-pink-700 text-white hidden sm:flex' : 'bg-violet-600 hover:bg-violet-700 text-white hidden sm:flex'}
              >
                <Zap className="w-3 h-3" />
                {isPro ? 'Upgrade to Plus' : 'Upgrade'}
              </Button>
            )}
            {user?.isAdmin && (
              <Link href="/admin">
                <Button size="sm" variant="outline"><Settings className="w-4 h-4" /></Button>
              </Link>
            )}
            <Button size="sm" variant="ghost" onClick={handleLogout}>
              <LogOut className="w-4 h-4" />
            </Button>
          </div>
        </div>
      </header>

      <main className="flex-1 max-w-6xl mx-auto w-full px-6 py-10 space-y-10">
        {/* Welcome */}
        <div className="space-y-1">
          <h1 className="text-2xl font-bold">
            Welcome{user?.name ? `, ${user.name}` : ''}
          </h1>
          <p className="text-muted-foreground text-sm">
            {planLimitsText}
            {!isPlus && (
              <button
                onClick={() => handleUpgrade(isPro ? 'plus' : 'pro')}
                className="ml-2 text-violet-400 hover:underline text-sm"
              >
                {isPro ? 'Upgrade to Plus →' : 'Upgrade to Pro →'}
              </button>
            )}
          </p>
        </div>

        {/* URL Input */}
        <div className="rounded-2xl border border-border bg-card p-6 space-y-4">
          <h2 className="font-semibold">Generate clips from a YouTube video</h2>
          <form onSubmit={handleSubmit} className="flex gap-3">
            <Input
              placeholder="https://youtube.com/watch?v=..."
              value={url}
              onChange={e => setUrl(e.target.value)}
              className="flex-1"
              disabled={submitting}
            />
            <Button
              type="submit"
              disabled={submitting || !url}
              className="bg-violet-600 hover:bg-violet-700 text-white shrink-0"
            >
              {submitting ? <Loader2 className="w-4 h-4 animate-spin" /> : 'Generate Clips'}
            </Button>
          </form>
          {error && (
            <div className="flex items-center gap-2 text-sm text-destructive">
              <AlertCircle className="w-4 h-4 shrink-0" />
              {error}
            </div>
          )}
        </div>

        {/* Processing status */}
        {processingId && (
          <div className="space-y-3">
            <div className="flex items-center justify-between">
              <h2 className="font-semibold">Processing your video</h2>
              <button onClick={() => setProcessingId(null)} className="text-sm text-muted-foreground hover:text-foreground">
                Dismiss
              </button>
            </div>
            <ProcessingStatus
              videoId={processingId}
              onComplete={() => {
                setProcessingId(null)
                loadVideos()
              }}
            />
          </div>
        )}

        {/* Videos grid */}
        {selectedVideo ? (
          <div className="space-y-6">
            <div className="flex items-center gap-4">
              <Button variant="ghost" size="sm" onClick={() => setSelectedVideo(null)}>
                <ArrowLeft className="w-4 h-4 mr-1" />
                Back
              </Button>
              <div>
                <h2 className="font-semibold">{selectedVideo.title}</h2>
                <p className="text-sm text-muted-foreground">{selectedVideo.clips.length} clips generated</p>
              </div>
            </div>
            {selectedVideo.clips.length > 0 ? (
              <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-4">
                {selectedVideo.clips.map((clip, i) => (
                  <ClipCard key={clip.id} clip={clip} index={i} />
                ))}
              </div>
            ) : (
              <p className="text-muted-foreground text-sm">No clips were generated for this video.</p>
            )}
          </div>
        ) : (
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <h2 className="font-semibold">Your videos</h2>
              {processingCount > 0 && (
                <Badge variant="processing" className="gap-1">
                  <Loader2 className="w-3 h-3 animate-spin" />
                  {processingCount} processing
                </Badge>
              )}
            </div>
            {loadingVideos ? (
              <div className="flex justify-center py-16">
                <Loader2 className="w-6 h-6 animate-spin text-muted-foreground" />
              </div>
            ) : videos.length === 0 ? (
              <div className="rounded-2xl border border-dashed border-border p-16 text-center space-y-3">
                <Scissors className="w-10 h-10 text-muted-foreground mx-auto" />
                <p className="text-muted-foreground">No videos yet — paste a YouTube URL above to get started</p>
              </div>
            ) : (
              <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-4">
                {videos.map(v => (
                  <VideoCard
                    key={v.id}
                    video={v}
                    selected={selectedVideoId === v.id}
                    onSelect={id => {
                      const found = videos.find(x => x.id === id)
                      if (found) setSelectedVideo(found)
                    }}
                  />
                ))}
              </div>
            )}
          </div>
        )}
      </main>
    </div>
  )
}
