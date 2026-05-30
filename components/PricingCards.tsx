'use client'
import { useRef } from 'react'
import Link from 'next/link'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Check } from 'lucide-react'

interface PricingCardProps {
  children: React.ReactNode
  glowColor: string
}

function PricingCard({ children, glowColor }: PricingCardProps) {
  const cardRef = useRef<HTMLDivElement>(null)

  const handleMouseMove = (e: React.MouseEvent<HTMLDivElement>) => {
    const card = cardRef.current
    if (!card) return
    const rect = card.getBoundingClientRect()
    const x = e.clientX - rect.left
    const y = e.clientY - rect.top
    const centerX = rect.width / 2
    const centerY = rect.height / 2
    const rotateX = ((y - centerY) / centerY) * -8
    const rotateY = ((x - centerX) / centerX) * 8
    card.style.transform = `perspective(1000px) rotateX(${rotateX}deg) rotateY(${rotateY}deg) translateZ(10px)`
  }

  const handleMouseLeave = () => {
    const card = cardRef.current
    if (!card) return
    card.style.transform = 'perspective(1000px) rotateX(0deg) rotateY(0deg) translateZ(0px)'
  }

  return (
    <div
      ref={cardRef}
      onMouseMove={handleMouseMove}
      onMouseLeave={handleMouseLeave}
      style={{
        transition: 'transform 0.15s ease-out',
        boxShadow: `0 0 0 1px rgba(255,255,255,0.05), 0 20px 40px -12px ${glowColor}`,
        willChange: 'transform',
      }}
      className="relative rounded-2xl p-8 space-y-6 backdrop-blur-xl bg-white/5 border border-white/10"
    >
      {children}
    </div>
  )
}

export function PricingCards() {
  return (
    <div className="grid md:grid-cols-3 gap-8">
      {/* Free */}
      <PricingCard glowColor="rgba(255,255,255,0.06)">
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
          <Button variant="outline" className="w-full border-white/20 hover:bg-white/10">Get started</Button>
        </Link>
      </PricingCard>

      {/* Pro */}
      <PricingCard glowColor="rgba(139,92,246,0.35)">
        <Badge className="absolute -top-3 left-1/2 -translate-x-1/2 bg-violet-600 shadow-lg shadow-violet-500/40">
          Most popular
        </Badge>
        <div
          className="absolute inset-0 rounded-2xl pointer-events-none"
          style={{ background: 'linear-gradient(135deg, rgba(139,92,246,0.15) 0%, transparent 60%)' }}
        />
        <div className="relative">
          <h3 className="text-xl font-bold text-violet-300">Pro</h3>
          <p className="text-4xl font-extrabold mt-2">
            ₦5,000<span className="text-base text-muted-foreground font-normal">/mo</span>
          </p>
        </div>
        <ul className="space-y-3 relative">
          {['10 videos/month', 'Longer videos supported', '3–5 clips per video', 'Vertical 9:16 export', 'Priority processing'].map(f => (
            <li key={f} className="flex items-center gap-2 text-sm">
              <Check className="w-4 h-4 text-violet-400 shrink-0" />
              {f}
            </li>
          ))}
        </ul>
        <Link href="/signup" className="block relative">
          <Button className="w-full bg-violet-600 hover:bg-violet-500 text-white shadow-lg shadow-violet-500/30">
            Upgrade to Pro
          </Button>
        </Link>
      </PricingCard>

      {/* Plus */}
      <PricingCard glowColor="rgba(236,72,153,0.35)">
        <Badge className="absolute -top-3 left-1/2 -translate-x-1/2 bg-pink-600 shadow-lg shadow-pink-500/40">
          Best value
        </Badge>
        <div
          className="absolute inset-0 rounded-2xl pointer-events-none"
          style={{ background: 'linear-gradient(135deg, rgba(236,72,153,0.15) 0%, transparent 60%)' }}
        />
        <div className="relative">
          <h3 className="text-xl font-bold text-pink-300">Plus</h3>
          <p className="text-4xl font-extrabold mt-2">
            ₦20,000<span className="text-base text-muted-foreground font-normal">/mo</span>
          </p>
        </div>
        <ul className="space-y-3 relative">
          {['30 videos/month', 'Longer videos supported', '3–5 clips per video', 'Vertical 9:16 export', 'Priority processing'].map(f => (
            <li key={f} className="flex items-center gap-2 text-sm">
              <Check className="w-4 h-4 text-pink-400 shrink-0" />
              {f}
            </li>
          ))}
        </ul>
        <Link href="/signup" className="block relative">
          <Button className="w-full bg-pink-600 hover:bg-pink-500 text-white shadow-lg shadow-pink-500/30">
            Upgrade to Plus
          </Button>
        </Link>
      </PricingCard>
    </div>
  )
}
