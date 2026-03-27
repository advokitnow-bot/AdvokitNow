"use client"

import { useState, useEffect } from "react"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Calendar, FileText, AlertTriangle, Info, Check, Trash2, CheckCheck } from "lucide-react"
import { useToast } from "@/hooks/use-toast"

interface Notification {
  id: string
  title: string
  message: string
  type: string
  isRead: boolean
  createdAt: string
  case?: {
    id: string
    caseNumber: string
    title: string
  }
}

export function NotificationList() {
  const [notifications, setNotifications] = useState<Notification[]>([])
  const [loading, setLoading] = useState(false)
  const [filter, setFilter] = useState("all")
  const [unreadCount, setUnreadCount] = useState(0)
  const { toast } = useToast()

  useEffect(() => {
    fetchNotifications()
  }, [filter])

  const fetchNotifications = async () => {
    setLoading(true)
    try {
      const params = new URLSearchParams()
      if (filter === "unread") params.append("unreadOnly", "true")
      if (filter !== "all" && filter !== "unread") params.append("type", filter.toUpperCase())

      const response = await fetch(`/api/notifications?${params}`)
      if (response.ok) {
        const data = await response.json()
        setNotifications(data.notifications)
        setUnreadCount(data.unreadCount)
      } else {
        toast({
          title: "Error",
          description: "Failed to fetch notifications",
          variant: "destructive",
        })
      }
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to fetch notifications",
        variant: "destructive",
      })
    } finally {
      setLoading(false)
    }
  }

  const markAsRead = async (notificationId: string) => {
    try {
      const response = await fetch(`/api/notifications/${notificationId}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ isRead: true }),
      })

      if (response.ok) {
        setNotifications((prev) =>
          prev.map((notif) => (notif.id === notificationId ? { ...notif, isRead: true } : notif)),
        )
        setUnreadCount((prev) => Math.max(0, prev - 1))
      }
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to mark notification as read",
        variant: "destructive",
      })
    }
  }

  const markAllAsRead = async () => {
    try {
      const response = await fetch("/api/notifications/mark-all-read", {
        method: "POST",
      })

      if (response.ok) {
        setNotifications((prev) => prev.map((notif) => ({ ...notif, isRead: true })))
        setUnreadCount(0)
        toast({
          title: "Success",
          description: "All notifications marked as read",
        })
      }
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to mark all notifications as read",
        variant: "destructive",
      })
    }
  }

  const deleteNotification = async (notificationId: string) => {
    try {
      const response = await fetch(`/api/notifications/${notificationId}`, {
        method: "DELETE",
      })

      if (response.ok) {
        setNotifications((prev) => prev.filter((notif) => notif.id !== notificationId))
        toast({
          title: "Success",
          description: "Notification deleted",
        })
      }
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to delete notification",
        variant: "destructive",
      })
    }
  }

  const getNotificationIcon = (type: string) => {
    switch (type) {
      case "HEARING_REMINDER":
        return <Calendar className="h-5 w-5 text-blue-600" />
      case "CASE_UPDATE":
        return <FileText className="h-5 w-5 text-green-600" />
      case "DOCUMENT_UPLOAD":
        return <FileText className="h-5 w-5 text-purple-600" />
      case "DEADLINE_REMINDER":
        return <AlertTriangle className="h-5 w-5 text-red-600" />
      default:
        return <Info className="h-5 w-5 text-gray-600" />
    }
  }

  const getTypeColor = (type: string) => {
    switch (type) {
      case "HEARING_REMINDER":
        return "bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-300"
      case "CASE_UPDATE":
        return "bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-300"
      case "DOCUMENT_UPLOAD":
        return "bg-purple-100 text-purple-800 dark:bg-purple-900 dark:text-purple-300"
      case "DEADLINE_REMINDER":
        return "bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-300"
      default:
        return "bg-gray-100 text-gray-800 dark:bg-gray-900 dark:text-gray-300"
    }
  }

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row gap-4 items-start sm:items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Notifications</h1>
          <p className="text-muted-foreground">
            Stay updated with your cases and important alerts
            {unreadCount > 0 && ` (${unreadCount} unread)`}
          </p>
        </div>
        {unreadCount > 0 && (
          <Button onClick={markAllAsRead}>
            <CheckCheck className="mr-2 h-4 w-4" />
            Mark All Read
          </Button>
        )}
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Filter Notifications</CardTitle>
        </CardHeader>
        <CardContent>
          <Select value={filter} onValueChange={setFilter}>
            <SelectTrigger className="max-w-xs">
              <SelectValue placeholder="Filter by type" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All Notifications</SelectItem>
              <SelectItem value="unread">Unread Only</SelectItem>
              <SelectItem value="hearing_reminder">Hearing Reminders</SelectItem>
              <SelectItem value="case_update">Case Updates</SelectItem>
              <SelectItem value="document_upload">Document Uploads</SelectItem>
              <SelectItem value="deadline_reminder">Deadline Reminders</SelectItem>
              <SelectItem value="system_alert">System Alerts</SelectItem>
            </SelectContent>
          </Select>
        </CardContent>
      </Card>

      <div className="space-y-4">
        {loading ? (
          <Card>
            <CardContent className="text-center py-8">Loading notifications...</CardContent>
          </Card>
        ) : notifications.length === 0 ? (
          <Card>
            <CardContent className="text-center py-8">
              <Info className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
              <p className="text-muted-foreground">No notifications found</p>
            </CardContent>
          </Card>
        ) : (
          notifications.map((notification) => (
            <Card
              key={notification.id}
              className={`transition-colors ${
                !notification.isRead ? "bg-blue-50 dark:bg-blue-950 border-blue-200" : ""
              }`}
            >
              <CardContent className="p-6">
                <div className="flex items-start justify-between space-x-4">
                  <div className="flex items-start space-x-4 flex-1">
                    {getNotificationIcon(notification.type)}
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center space-x-2 mb-2">
                        <h3 className="font-semibold">{notification.title}</h3>
                        {!notification.isRead && <div className="w-2 h-2 bg-blue-600 rounded-full" />}
                        <Badge className={getTypeColor(notification.type)}>{notification.type.replace("_", " ")}</Badge>
                      </div>
                      <p className="text-muted-foreground mb-2">{notification.message}</p>
                      {notification.case && (
                        <p className="text-sm text-muted-foreground mb-2">
                          Related to case: <span className="font-medium">{notification.case.caseNumber}</span> -{" "}
                          {notification.case.title}
                        </p>
                      )}
                      <p className="text-xs text-muted-foreground">
                        {new Date(notification.createdAt).toLocaleString()}
                      </p>
                    </div>
                  </div>
                  <div className="flex items-center space-x-2">
                    {!notification.isRead && (
                      <Button variant="outline" size="sm" onClick={() => markAsRead(notification.id)}>
                        <Check className="h-4 w-4 mr-1" />
                        Mark Read
                      </Button>
                    )}
                    <Button variant="ghost" size="sm" onClick={() => deleteNotification(notification.id)}>
                      <Trash2 className="h-4 w-4" />
                    </Button>
                  </div>
                </div>
              </CardContent>
            </Card>
          ))
        )}
      </div>
    </div>
  )
}
