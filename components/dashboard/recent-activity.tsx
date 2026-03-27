"use client"

import Link from "next/link"
import { useEffect, useState } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Avatar, AvatarFallback } from "@/components/ui/avatar"
import { FileText, User, Calendar, Upload } from "lucide-react"

const iconMap: Record<string, any> = {
  CASE: FileText,
  CLIENT: User,
  DOCUMENT: Upload,
  USER: User,
}

const getActivityColor = (entityType: string) => {
  switch (entityType) {
    case "CASE": return "bg-blue-500"
    case "CLIENT": return "bg-green-500"
    case "DOCUMENT": return "bg-purple-500"
    case "USER": return "bg-orange-500"
    default: return "bg-gray-500"
  }
}

const resolvePath = (activity: any) => {
  switch (activity.entityType) {
    case "CASE": return `/cases/${activity.entityId}`
    case "CLIENT": return `/clients/${activity.entityId}`
    case "DOCUMENT": return `/documents/${activity.entityId}`
    case "USER": return `/users/${activity.entityId}`
    default: return "#"
  }
}

function timeAgo(dateString: string) {
  const diffMs = new Date().getTime() - new Date(dateString).getTime()
  const diffHrs = Math.floor(diffMs / 3600000)
  const diffMins = Math.floor(diffMs / 60000)

  if (diffMins < 60) return `${diffMins} min ago`
  if (diffHrs < 24) return `${diffHrs} hrs ago`
  return new Date(dateString).toLocaleDateString()
}

export function RecentActivity() {
  const [activities, setActivities] = useState<any[]>([])

  useEffect(() => {
    async function load() {
      const res = await fetch("/api/activity/recent")
      const data = await res.json()
      setActivities(data)
    }
    load()
  }, [])

  return (
    <Card>
      <CardHeader>
        <CardTitle>Recent Activity</CardTitle>
        <CardDescription>Latest updates and actions in your cases</CardDescription>
      </CardHeader>

      <CardContent>
        <div className="space-y-2">
          {activities.length === 0 && (
            <p className="text-sm text-muted-foreground">No recent activity found.</p>
          )}

          {activities.map((activity) => {
            const Icon = iconMap[activity.entityType] || FileText
            const link = resolvePath(activity)

            return (
              <Link
                href={link}
                key={activity.id}
                className="block hover:bg-accent/60 rounded-lg p-3 transition cursor-pointer"
              >
                <div className="flex items-start space-x-4">
                  <div className={`p-2 rounded-full ${getActivityColor(activity.entityType)}`}>
                    <Icon className="h-4 w-4 text-white" />
                  </div>

                  <div className="flex-1 space-y-1">
                    <div className="flex items-center justify-between">
                      <p className="text-sm font-medium">{activity.action}</p>
                      <p className="text-xs text-muted-foreground">{timeAgo(activity.createdAt)}</p>
                    </div>

                    <p className="text-sm text-muted-foreground">{activity.description}</p>

                    <div className="flex items-center space-x-2">
                      <Avatar className="h-5 w-5">
                        <AvatarFallback className="text-xs">
                          {activity?.user?.name
                            ?.split(" ")
                            .map((n: string) => n[0])
                            .join("") || "?"}
                        </AvatarFallback>
                      </Avatar>
                      <span className="text-xs text-muted-foreground">
                        {activity?.user?.name || "System"}
                      </span>
                    </div>
                  </div>
                </div>
              </Link>
            )
          })}
        </div>
      </CardContent>
    </Card>
  )
}
