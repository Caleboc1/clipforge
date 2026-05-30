import Link from 'next/link'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Scissors, Zap, TrendingUp, Shield, Check } from 'lucide-react'
import { PricingCards } from '@/components/PricingCards'

export default function LandingPage() {
  return (
    <div className="min-h-screen bg-background">
      {/* Nav */}
      <nav className="fixed top-0 w-full z-50 border-b border-border/50 bg-background/80 backdrop-blur-xl">
        <div className="max-w-6xl mx-auto px-6 h-16 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Scissors className="w-6 h-6 text-violet-400" />
            <span className="font-bold text-lg">ClipForge</span>
          </div>
          <div className="flex items-center gap-3">
            <Link href="/login">
              <Button variant="ghost" size="sm">Log in</Button>
            </Link>
            <Link href="/signup">
              <Button size="sm" className="bg-violet-600 hover:bg-violet-700 text-white">Get started free</Button>
            </Link>
          </div>
        </div>
      </nav>

      {/* Hero */}
      <section className="pt-40 pb-28 px-6 text-center relative overflow-hidden">
        <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_top,_var(--tw-gradient-stops))] from-violet-900/30 via-background to-background pointer-events-none" />
        <div className="relative max-w-4xl mx-auto space-y-8">
          <Badge variant="outline" className="border-violet-500/40 text-violet-300 px-4 py-1.5">
            <Zap className="w-3 h-3 mr-1.5" />
            AI-Powered Clip Detection
          </Badge>
          <h1 className="text-5xl md:text-7xl font-extrabold leading-tight tracking-tight">
            Turn Long Videos Into{' '}
            <span className="bg-gradient-to-r from-violet-400 to-pink-400 bg-clip-text text-transparent">
              Viral Clips
            </span>
          </h1>
          <p className="text-xl text-muted-foreground max-w-2xl mx-auto leading-relaxed">
            Paste any YouTube URL. ClipForge downloads, transcribes, and uses AI to find the most
            engaging 15–60 second moments — then cuts them into vertical shorts ready to post.
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Link href="/signup">
              <Button size="lg" className="bg-violet-600 hover:bg-violet-700 text-white px-8 h-12 text-base">
                Start for free
              </Button>
            </Link>
            <Link href="#how-it-works">
              <Button size="lg" variant="outline" className="px-8 h-12 text-base">
                See how it works
              </Button>
            </Link>
          </div>
          <p className="text-sm text-muted-foreground">No credit card required · 2 free videos/month</p>
        </div>
      </section>

      {/* How it works */}
      <section id="how-it-works" className="py-24 px-6 border-t border-border/50">
        <div className="max-w-5xl mx-auto">
          <div className="text-center mb-16 space-y-3">
            <h2 className="text-3xl md:text-4xl font-bold">How it works</h2>
            <p className="text-muted-foreground">From YouTube link to downloadable clip in minutes</p>
          </div>
          <div className="grid md:grid-cols-4 gap-8">
            {[
              { step: '01', title: 'Paste URL', desc: 'Drop any YouTube link into the dashboard.' },
              { step: '02', title: 'AI Transcribes', desc: 'Whisper transcribes every word with timestamps.' },
              { step: '03', title: 'GPT Detects Hooks', desc: 'GPT-4o finds the most viral-worthy moments.' },
              { step: '04', title: 'Download Clips', desc: 'ffmpeg renders vertical 9:16 clips ready to post.' }
            ].map(item => (
              <div key={item.step} className="space-y-3 text-center">
                <div className="w-12 h-12 rounded-full bg-violet-500/20 text-violet-300 text-sm font-bold flex items-center justify-center mx-auto">
                  {item.step}
                </div>
                <h3 className="font-semibold">{item.title}</h3>
                <p className="text-sm text-muted-foreground">{item.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Features */}
      <section className="py-24 px-6 bg-card/30">
        <div className="max-w-5xl mx-auto">
          <div className="text-center mb-16 space-y-3">
            <h2 className="text-3xl md:text-4xl font-bold">Everything you need</h2>
          </div>
          <div className="grid md:grid-cols-3 gap-6">
            {[
              { icon: Zap,         title: 'Instant transcription',  desc: 'OpenAI Whisper delivers accurate transcripts with word-level timestamps.' },
              { icon: TrendingUp,  title: 'Viral-moment detection', desc: 'GPT-4o identifies segments with the strongest hooks and emotional pull.' },
              { icon: Scissors,    title: 'Auto vertical crop',     desc: 'ffmpeg renders clips in 9:16 format — perfect for TikTok & Shorts.' },
              { icon: Shield,      title: 'Secure & private',       desc: 'All files processed on your server. No third-party storage.' },
              { icon: TrendingUp,  title: 'Usage analytics',        desc: 'Track how many minutes you\'ve processed and costs per job.' },
              { icon: Zap,         title: 'Paystack billing',       desc: 'NGN-native subscriptions. Cancel anytime.' }
            ].map(f => (
              <div key={f.title} className="rounded-xl border border-border p-6 space-y-3">
                <div className="w-10 h-10 rounded-lg bg-violet-500/20 flex items-center justify-center">
                  <f.icon className="w-5 h-5 text-violet-400" />
                </div>
                <h3 className="font-semibold">{f.title}</h3>
                <p className="text-sm text-muted-foreground">{f.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Pricing */}
      <section id="pricing" className="py-24 px-6 relative overflow-hidden">
        <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_center,_var(--tw-gradient-stops))] from-violet-900/20 via-background to-background pointer-events-none" />
        <div className="max-w-4xl mx-auto">
          <div className="text-center mb-16 space-y-3">
            <h2 className="text-3xl md:text-4xl font-bold">Simple pricing</h2>
            <p className="text-muted-foreground">Start free, upgrade when you need more</p>
          </div>
          <PricingCards />
        </div>
      </section>

      {/* Footer */}
      <footer className="border-t border-border/50 py-10 px-6">
        <div className="max-w-6xl mx-auto flex flex-col md:flex-row items-center justify-between gap-4">
          <div className="flex items-center gap-2">
            <Scissors className="w-5 h-5 text-violet-400" />
            <span className="font-semibold">ClipForge</span>
          </div>
          <p className="text-sm text-muted-foreground">© {new Date().getFullYear()} ClipForge. Built with Next.js + OpenAI.</p>
        </div>
      </footer>
    </div>
  )
}
