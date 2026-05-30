'use client'
import { useRef } from 'react'
import Link from 'next/link'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Check } from 'lucide-react'

interface PricingCardProps {
  children: React.ReactNode
  blobColor: string
  borderColor: string
}

function PricingCard({ children, blobColor, borderColor }: PricingCardProps) {
  const cardRef = useRef<HTMLDivElement>(null)

  const handleMouseMove = (e: React.MouseEvent<HTMLDivElement>) => {
    const card = cardRef.current
    if (!card) return
    const rect = card.getBoundingClientRect()
    const x = e.clientX - rect.left
    const y = e.clientY - rect.top
    const cx = rect.width / 2
    const cy = rect.height / 2
    const rotX = ((y - cy) / cy) * -7
    const rotY = ((x - cx) / cx) * 7
    card.style.transform = `perspective(900px) rotateX(${rotX}deg) rotateY(${rotY}deg) translateZ(12px)`
  }

  const handleMouseLeave = () => {
    const card = cardRef.current
    if (!card) return
    card.style.transform = 'perspective(900px) rotateX(0deg) rotateY(0deg) translateZ(0px)'
  }

  return (
    <div className="relative" style={{ isolation: 'isolate' }}>
      {/* Blob behind the card — gives backdrop-blur something to blur */}
      <div
        className="absolute -inset-4 rounded-3xl blur-2xl opacity-60 pointer-events-none"
        style={{ background: blobColor }}
      />

      {/* Glass card */}
      <div
        ref={cardRef}
        onMouseMove={handleMouseMove}
        onMouseLeave={handleMouseLeave}
        style={{
          transition: 'transform 0.18s ease-out',
          background: 'rgba(255, 255, 255, 0.06)',
          backdropFilter: 'blur(18px) saturate(160%)',
          WebkitBackdropFilter: 'blur(18px) saturate(160%)',
          border: `1px solid ${borderColor}`,
          boxShadow: `0 8px 32px rgba(0,0,0,0.4), inset 0 1px 0 rgba(255,255,255,0.1)`,
          willChange: 'transform',
        }}
        className="relative rounded-2xl p-8 space-y-6"
      >
        {children}
      </div>
    </div>
  )
}

export function PricingCards() {
  return (
    <div className="grid md:grid-cols-3 gap-10">
      {/* Free */}
      <PricingCard
        blobColor="radial-gradient(circle, rgba(100,116,139,0.5) 0%, transparent 70%)"
        borderColor="rgba(255,255,255,0.12)"
      >
        <div>
          <h3 className="text-xl font-bold">Free</h3>
          <p className="text-4xl font-extrabold mt-2">
            ₦0<span className="text-base text-muted-foreground font-normal">/mo</span>
          </p>
        </div>
        <ul className="space-y-3">
          {['2 videos/month', 'Max 5 min per video', '3–5 clips per video', 'Vertical 9:16 export'].map(f => (
            <li key={f} className="flex items-center gap-2 text-sm">
              <Check className="w-4 h-4 text-green-400 shrink-0" />
              {f}
            </li>
          ))}
        </ul>
        <Link href="/signup" className="block">
          <Button variant="outline" className="w-full" style={{ borderColor: 'rgba(255,255,255,0.2)', background: 'rgba(255,255,255,0.05)' }}>
            Get started
          </Button>
        </Link>
      </PricingCard>

      {/* Pro */}
      <PricingCard
        blobColor="radial-gradient(circle, rgba(139,92,246,0.6) 0%, transparent 70%)"
        borderColor="rgba(139,92,246,0.5)"
      >
        <Badge className="absolute -top-3 left-1/2 -translate-x-1/2 bg-violet-600 shadow-lg shadow-violet-500/40 z-10">
          Most popular
        </Badge>
        <div>
          <h3 className="text-xl font-bold text-violet-300">Pro</h3>
          <p className="text-4xl font-extrabold mt-2">
            ₦5,000<span className="text-base text-muted-foreground font-normal">/mo</span>
          </p>
        </div>
        <ul className="space-y-3">
          {['10 videos/month', 'Longer videos supported', '3–5 clips per video', 'Vertical 9:16 export', 'Priority processing'].map(f => (
            <li key={f} className="flex items-center gap-2 text-sm">
              <Check className="w-4 h-4 text-violet-400 shrink-0" />
              {f}
            </li>
          ))}
        </ul>
        <Link href="/signup" className="block">
          <Button className="w-full bg-violet-600 hover:bg-violet-500 text-white shadow-lg shadow-violet-500/30">
            Upgrade to Pro
          </Button>
        </Link>
      </PricingCard>

      {/* Plus */}
      <PricingCard
        blobColor="radial-gradient(circle, rgba(236,72,153,0.6) 0%, transparent 70%)"
        borderColor="rgba(236,72,153,0.5)"
      >
        <Badge className="absolute -top-3 left-1/2 -translate-x-1/2 bg-pink-600 shadow-lg shadow-pink-500/40 z-10">
          Best value
        </Badge>
        <div>
          <h3 className="text-xl font-bold text-pink-300">Plus</h3>
          <p className="text-4xl font-extrabold mt-2">
            ₦20,000<span className="text-base text-muted-foreground font-normal">/mo</span>
          </p>
        </div>
        <ul className="space-y-3">
          {['30 videos/month', 'Longer videos supported', '3–5 clips per video', 'Vertical 9:16 export', 'Priority processing'].map(f => (
            <li key={f} className="flex items-center gap-2 text-sm">
              <Check className="w-4 h-4 text-pink-400 shrink-0" />
              {f}
            </li>
          ))}
        </ul>
        <Link href="/signup" className="block">
          <Button className="w-full bg-pink-600 hover:bg-pink-500 text-white shadow-lg shadow-pink-500/30">
            Upgrade to Plus
          </Button>
        </Link>
      </PricingCard>
    </div>
  )
}
