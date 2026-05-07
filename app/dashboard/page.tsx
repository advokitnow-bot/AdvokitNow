"use client"

import { StatsCards } from "@/components/dashboard/stats-cards"
import { RecentActivity } from "@/components/dashboard/recent-activity"
import { UpcomingHearings } from "@/components/dashboard/upcoming-hearings"
import { QuickActions } from "@/components/dashboard/quick-actions"
import { useAuth } from "@/hooks/use-auth"

export default function DashboardPage() {
  const { user, loading } = useAuth()

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-blue-600"></div>
      </div>
    )
  }

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold tracking-tight">Welcome back, {user?.name || "User"}</h1>
        <p className="text-muted-foreground">Here's what's happening with your cases today.</p>
      </div>

      <StatsCards />

      <div className="grid gap-6 md:grid-cols-2">
        <UpcomingHearings />
        <RecentActivity />
      </div>

      <QuickActions />
    </div>
  )
}
