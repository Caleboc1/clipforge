import { getCurrentUser } from '@/lib/auth'
import { redirect } from 'next/navigation'
import Link from 'next/link'
import { Scissors, LayoutDashboard, Users, Video, BarChart2 } from 'lucide-react'

const navLinks = [
  { href: '/admin',            label: 'Overview',   icon: LayoutDashboard },
  { href: '/admin/users',      label: 'Users',       icon: Users },
  { href: '/admin/videos',     label: 'Videos',      icon: Video },
  { href: '/admin/analytics',  label: 'Analytics',   icon: BarChart2 }
]

export default async function AdminLayout({ children }: { children: React.ReactNode }) {
  const user = await getCurrentUser()
  if (!user) redirect('/login')
  if (!user.isAdmin) redirect('/dashboard')

  return (
    <div className="min-h-screen flex">
      {/* Sidebar */}
      <aside className="w-56 shrink-0 border-r border-border bg-card/50 flex flex-col">
        <div className="h-16 px-5 flex items-center gap-2 border-b border-border">
          <Scissors className="w-5 h-5 text-violet-400" />
          <span className="font-bold text-sm">ClipForge Admin</span>
        </div>
        <nav className="p-3 space-y-1 flex-1">
          {navLinks.map(l => (
            <Link
              key={l.href}
              href={l.href}
              className="flex items-center gap-2 px-3 py-2 rounded-lg text-sm text-muted-foreground hover:text-foreground hover:bg-accent transition-colors"
            >
              <l.icon className="w-4 h-4" />
              {l.label}
            </Link>
          ))}
        </nav>
        <div className="p-4 border-t border-border">
          <Link href="/dashboard" className="text-xs text-muted-foreground hover:text-foreground">
            ← Back to Dashboard
          </Link>
        </div>
      </aside>

      {/* Main */}
      <main className="flex-1 overflow-auto">
        {children}
      </main>
    </div>
  )
}
