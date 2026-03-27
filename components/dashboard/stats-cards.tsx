"use client"

import Link from "next/link"
import { useEffect, useState } from "react"
import { FileText, Users, Calendar, AlertTriangle } from "lucide-react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"

function StatsCard({ title, value, description, icon, trend, href }: any) {
  return (
    <Link href={href} className="block transition hover:scale-[1.02]">
      <Card className="cursor-pointer hover:shadow-lg transition">
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
          <CardTitle className="text-sm font-medium">{title}</CardTitle>
          {icon}
        </CardHeader>
        <CardContent>
          <div className="text-2xl font-bold">{value}</div>
          {description && <p className="text-xs text-muted-foreground">{description}</p>}
          {trend && (
            <div className="flex items-center pt-1">
              <span className={`text-xs ${trend.isPositive ? "text-green-600" : "text-red-600"}`}>
                {trend.isPositive ? "+" : ""}
                {trend.value}%
              </span>
              <span className="text-xs text-muted-foreground ml-1">from last month</span>
            </div>
          )}
        </CardContent>
      </Card>
    </Link>
  )
}

export function StatsCards() {
  const [stats, setStats] = useState<any>(null);

  useEffect(() => {
    async function fetchStats() {
      const res = await fetch("/api/dashboard/stats");
      const data = await res.json();
      setStats(data);
    }
    fetchStats();
  }, []);

  if (!stats) return <p>Loading...</p>;

  return (
    <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
      <StatsCard
        title="Total Cases"
        value={stats.totalCases}
        description="Active legal cases"
        icon={<FileText className="h-4 w-4 text-muted-foreground" />}
        href="/cases"
        trend={stats.trend.cases}
      />

      <StatsCard
        title="Clients"
        value={stats.clients}
        description="Registered clients"
        icon={<Users className="h-4 w-4 text-muted-foreground" />}
        href="/clients"
        trend={stats.trend.clients}
      />

      <StatsCard
        title="Upcoming Hearings"
        value={stats.upcomingHearings}
        description="Next 30 days"
        icon={<Calendar className="h-4 w-4 text-muted-foreground" />}
        href="/cases/hearings"
      />

      <StatsCard
        title="Urgent Cases"
        value={stats.urgentCases}
        description="Require immediate attention"
        icon={<AlertTriangle className="h-4 w-4 text-red-500" />}
        href="/cases?priority=HIGH,URGENT"
      />
    </div>
  )
}
