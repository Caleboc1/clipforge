'use client'
import { useEffect, useState } from 'react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'

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

export default function AdminAnalyticsPage() {
  const [data, setData] = useState<Analytics | null>(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    fetch('/api/admin/analytics').then(r => r.json()).then(setData).finally(() => setLoading(false))
  }, [])

  if (loading) return <div className="p-8 text-muted-foreground text-sm">Loading...</div>
  if (!data) return null

  const profitEstimate = data.estimatedMonthlyRevenue / 1600 - data.monthlyCost // NGN to USD approx

  return (
    <div className="p-8 space-y-8">
      <div>
        <h1 className="text-2xl font-bold">Analytics</h1>
        <p className="text-muted-foreground text-sm">Revenue vs costs and usage trends</p>
      </div>

      <div className="grid md:grid-cols-2 gap-6">
        <Card>
          <CardHeader><CardTitle className="text-base">Revenue Overview</CardTitle></CardHeader>
          <CardContent className="space-y-4 text-sm">
            <div className="flex justify-between py-2 border-b border-border">
              <span className="text-muted-foreground">Active Pro subscribers</span>
              <span className="font-semibold">{data.activeSubscriptions}</span>
            </div>
            <div className="flex justify-between py-2 border-b border-border">
              <span className="text-muted-foreground">Monthly revenue (est.)</span>
              <span className="font-semibold text-green-400">₦{data.estimatedMonthlyRevenue.toLocaleString()}</span>
            </div>
            <div className="flex justify-between py-2 border-b border-border">
              <span className="text-muted-foreground">Monthly AI cost (est.)</span>
              <span className="font-semibold text-red-400">${data.monthlyCost.toFixed(2)}</span>
            </div>
            <div className="flex justify-between py-2">
              <span className="text-muted-foreground">Estimated profit (USD)</span>
              <span className={`font-semibold ${profitEstimate > 0 ? 'text-green-400' : 'text-red-400'}`}>
                ${profitEstimate.toFixed(2)}
              </span>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader><CardTitle className="text-base">Usage Totals</CardTitle></CardHeader>
          <CardContent className="space-y-4 text-sm">
            <div className="flex justify-between py-2 border-b border-border">
              <span className="text-muted-foreground">All-time videos</span>
              <span className="font-semibold">{data.totalVideos}</span>
            </div>
            <div className="flex justify-between py-2 border-b border-border">
              <span className="text-muted-foreground">All-time minutes</span>
              <span className="font-semibold">{Math.round(data.totalMinutesProcessed)} min</span>
            </div>
            <div className="flex justify-between py-2 border-b border-border">
              <span className="text-muted-foreground">All-time AI cost</span>
              <span className="font-semibold">${data.totalCostEstimate.toFixed(2)}</span>
            </div>
            <div className="flex justify-between py-2">
              <span className="text-muted-foreground">Failed jobs</span>
              <span className="font-semibold text-red-400">{data.failedVideos}</span>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader><CardTitle className="text-base">This Month</CardTitle></CardHeader>
          <CardContent className="space-y-4 text-sm">
            <div className="flex justify-between py-2 border-b border-border">
              <span className="text-muted-foreground">New users</span>
              <span className="font-semibold">{data.newUsersThisMonth}</span>
            </div>
            <div className="flex justify-between py-2 border-b border-border">
              <span className="text-muted-foreground">Videos processed</span>
              <span className="font-semibold">{data.videosThisMonth}</span>
            </div>
            <div className="flex justify-between py-2">
              <span className="text-muted-foreground">Minutes processed</span>
              <span className="font-semibold">{Math.round(data.monthlyMinutes)} min</span>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader><CardTitle className="text-base">User Breakdown</CardTitle></CardHeader>
          <CardContent className="space-y-4 text-sm">
            <div className="flex justify-between py-2 border-b border-border">
              <span className="text-muted-foreground">Total users</span>
              <span className="font-semibold">{data.totalUsers}</span>
            </div>
            <div className="flex justify-between py-2 border-b border-border">
              <span className="text-muted-foreground">Pro users</span>
              <span className="font-semibold text-violet-400">{data.activeSubscriptions}</span>
            </div>
            <div className="flex justify-between py-2">
              <span className="text-muted-foreground">Free users</span>
              <span className="font-semibold">{data.totalUsers - data.activeSubscriptions}</span>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}
