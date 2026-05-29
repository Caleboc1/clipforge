'use client'
import { useEffect, useState } from 'react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Users, Video, TrendingUp, DollarSign, AlertTriangle, Activity } from 'lucide-react'

interface Analytics {
  totalUsers: number
  newUsersThisMonth: number
  activeSubscriptions: number
  estimatedMonthlyRevenue: number
  totalVideos: number
  videosThisMonth: number
  failedVideos: number
  totalMinutesProcessed: number
  totalCostEstimate: number
  monthlyMinutes: number
  monthlyCost: number
}

export default function AdminOverviewPage() {
  const [data, setData] = useState<Analytics | null>(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    fetch('/api/admin/analytics')
      .then(r => r.json())
      .then(d => setData(d))
      .finally(() => setLoading(false))
  }, [])

  if (loading) {
    return <div className="p-8 text-muted-foreground text-sm">Loading analytics...</div>
  }

  if (!data) return null

  const metrics = [
    { label: 'Total Users',          value: data.totalUsers,                          sub: `+${data.newUsersThisMonth} this month`,  icon: Users,         color: 'text-blue-400' },
    { label: 'Pro Subscriptions',    value: data.activeSubscriptions,                 sub: 'active plans',                            icon: TrendingUp,    color: 'text-violet-400' },
    { label: 'Monthly Revenue (est)', value: `₦${data.estimatedMonthlyRevenue.toLocaleString()}`, sub: 'from active subs',           icon: DollarSign,    color: 'text-green-400' },
    { label: 'Total Videos',         value: data.totalVideos,                         sub: `${data.videosThisMonth} this month`,      icon: Video,         color: 'text-yellow-400' },
    { label: 'Failed Jobs',          value: data.failedVideos,                        sub: 'need attention',                          icon: AlertTriangle, color: 'text-red-400' },
    { label: 'Minutes Processed',    value: `${Math.round(data.totalMinutesProcessed)}min`, sub: `~$${data.totalCostEstimate.toFixed(2)} total cost`, icon: Activity, color: 'text-pink-400' }
  ]

  return (
    <div className="p-8 space-y-8">
      <div>
        <h1 className="text-2xl font-bold">Overview</h1>
        <p className="text-muted-foreground text-sm">Platform-wide metrics</p>
      </div>

      <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-4">
        {metrics.map(m => (
          <Card key={m.label}>
            <CardHeader className="pb-2 flex flex-row items-center justify-between space-y-0">
              <CardTitle className="text-sm font-medium text-muted-foreground">{m.label}</CardTitle>
              <m.icon className={`w-4 h-4 ${m.color}`} />
            </CardHeader>
            <CardContent>
              <p className="text-2xl font-bold">{m.value}</p>
              <p className="text-xs text-muted-foreground mt-1">{m.sub}</p>
            </CardContent>
          </Card>
        ))}
      </div>

      <Card>
        <CardHeader>
          <CardTitle className="text-sm font-medium">This Month</CardTitle>
        </CardHeader>
        <CardContent className="grid sm:grid-cols-3 gap-6 text-sm">
          <div>
            <p className="text-muted-foreground">Videos processed</p>
            <p className="text-xl font-bold mt-1">{data.videosThisMonth}</p>
          </div>
          <div>
            <p className="text-muted-foreground">Minutes processed</p>
            <p className="text-xl font-bold mt-1">{Math.round(data.monthlyMinutes)}min</p>
          </div>
          <div>
            <p className="text-muted-foreground">Processing cost (est.)</p>
            <p className="text-xl font-bold mt-1">${data.monthlyCost.toFixed(2)}</p>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
