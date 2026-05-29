'use client'
import { useEffect, useState } from 'react'
import { Loader2, Check, Download, Brain, Mic, Video } from 'lucide-react'

const STEPS = [
  { key: 'download',   label: 'Downloading video',     icon: Video },
  { key: 'audio',      label: 'Extracting audio',       icon: Mic },
  { key: 'transcribe', label: 'Transcribing with AI',   icon: Brain },
  { key: 'clips',      label: 'Detecting viral moments', icon: Loader2 },
  { key: 'render',     label: 'Rendering clips',        icon: Download }
]

interface ProcessingStatusProps {
  videoId: string
  onComplete: () => void
}

export function ProcessingStatus({ videoId, onComplete }: ProcessingStatusProps) {
  const [status, setStatus] = useState<string>('processing')
  const [currentStep, setCurrentStep] = useState(0)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    let interval: NodeJS.Timeout

    const poll = async () => {
      try {
        const res = await fetch(`/api/videos/${videoId}`)
        const data = await res.json()

        if (data.video) {
          setStatus(data.video.status)

          if (data.video.status === 'done') {
            setCurrentStep(STEPS.length)
            clearInterval(interval)
            setTimeout(onComplete, 1000)
          } else if (data.video.status === 'failed') {
            setError(data.video.error || 'Processing failed')
            clearInterval(interval)
          }
        }
      } catch {
        // Ignore transient errors
      }
    }

    poll()
    interval = setInterval(() => {
      setCurrentStep(s => Math.min(s + 1, STEPS.length - 1))
      poll()
    }, 4000)

    return () => clearInterval(interval)
  }, [videoId, onComplete])

  if (status === 'failed') {
    return (
      <div className="rounded-xl border border-destructive/40 bg-destructive/10 p-6 text-center space-y-2">
        <p className="font-semibold text-destructive">Processing failed</p>
        <p className="text-sm text-muted-foreground">{error}</p>
      </div>
    )
  }

  return (
    <div className="rounded-xl border border-border bg-card p-6 space-y-5">
      <p className="text-sm font-medium text-center text-muted-foreground">
        Your video is being processed — this takes 2–5 minutes
      </p>
      <div className="space-y-3">
        {STEPS.map((step, i) => {
          const done = currentStep > i || status === 'done'
          const active = currentStep === i && status !== 'done'
          const Icon = step.icon

          return (
            <div key={step.key} className="flex items-center gap-3">
              <div className={`w-7 h-7 rounded-full flex items-center justify-center shrink-0 transition-colors ${
                done ? 'bg-green-500/20' : active ? 'bg-violet-500/20' : 'bg-muted'
              }`}>
                {done
                  ? <Check className="w-3.5 h-3.5 text-green-400" />
                  : active
                    ? <Icon className="w-3.5 h-3.5 text-violet-400 animate-spin" />
                    : <Icon className="w-3.5 h-3.5 text-muted-foreground" />
                }
              </div>
              <span className={`text-sm ${done ? 'text-foreground' : active ? 'text-violet-400' : 'text-muted-foreground'}`}>
                {step.label}
              </span>
            </div>
          )
        })}
      </div>
    </div>
  )
}
