"use client"

import type React from "react"

import { useState, useEffect } from "react"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Card, CardContent } from "@/components/ui/card"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { ScrollArea } from "@/components/ui/scroll-area"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import { Bell, Check, CheckCheck, Calendar, FileText, AlertTriangle, Info, X } from "lucide-react"
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

interface NotificationCenterProps {
  trigger?: React.ReactNode
}

export function NotificationCenter({ trigger }: NotificationCenterProps) {
  const [notifications, setNotifications] = useState<Notification[]>([])
  const [unreadCount, setUnreadCount] = useState(0)
  const [loading, setLoading] = useState(false)
  const [activeTab, setActiveTab] = useState("all")
  const { toast } = useToast()

  useEffect(() => {
    fetchNotifications()
  }, [activeTab])

  const fetchNotifications = async () => {
    setLoading(true)
    try {
      const params = new URLSearchParams()
      if (activeTab === "unread") params.append("unreadOnly", "true")
      if (activeTab !== "all" && activeTab !== "unread") params.append("type", activeTab.toUpperCase())

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
        return <Calendar className="h-4 w-4" />
      case "CASE_UPDATE":
        return <FileText className="h-4 w-4" />
      case "DOCUMENT_UPLOAD":
        return <FileText className="h-4 w-4" />
      case "DEADLINE_REMINDER":
        return <AlertTriangle className="h-4 w-4" />
      default:
        return <Info className="h-4 w-4" />
    }
  }

  const getNotificationColor = (type: string) => {
    switch (type) {
      case "HEARING_REMINDER":
        return "text-blue-600"
      case "CASE_UPDATE":
        return "text-green-600"
      case "DOCUMENT_UPLOAD":
        return "text-purple-600"
      case "DEADLINE_REMINDER":
        return "text-red-600"
      default:
        return "text-gray-600"
    }
  }

  const defaultTrigger = (
    <Button variant="ghost" size="icon" className="relative">
      <Bell className="h-4 w-4" />
      {unreadCount > 0 && (
        <Badge
          variant="destructive"
          className="absolute -top-1 -right-1 h-5 w-5 rounded-full p-0 flex items-center justify-center text-xs"
        >
          {unreadCount > 99 ? "99+" : unreadCount}
        </Badge>
      )}
    </Button>
  )

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>{trigger || defaultTrigger}</DropdownMenuTrigger>
      <DropdownMenuContent className="w-96" align="end">
        <DropdownMenuLabel className="flex items-center justify-between">
          <span>Notifications</span>
          {unreadCount > 0 && (
            <Button variant="ghost" size="sm" onClick={markAllAsRead}>
              <CheckCheck className="h-4 w-4 mr-1" />
              Mark all read
            </Button>
          )}
        </DropdownMenuLabel>
        <DropdownMenuSeparator />

        <div className="p-2">
          <Tabs value={activeTab} onValueChange={setActiveTab}>
            <TabsList className="grid w-full grid-cols-4">
              <TabsTrigger value="all" className="text-xs">
                All
              </TabsTrigger>
              <TabsTrigger value="unread" className="text-xs">
                Unread
              </TabsTrigger>
              <TabsTrigger value="hearing_reminder" className="text-xs">
                Hearings
              </TabsTrigger>
              <TabsTrigger value="case_update" className="text-xs">
                Cases
              </TabsTrigger>
            </TabsList>

            <TabsContent value={activeTab} className="mt-2">
              <ScrollArea className="h-96">
                {loading ? (
                  <div className="text-center py-8 text-muted-foreground">Loading notifications...</div>
                ) : notifications.length === 0 ? (
                  <div className="text-center py-8 text-muted-foreground">No notifications found</div>
                ) : (
                  <div className="space-y-2">
                    {notifications.map((notification) => (
                      <Card
                        key={notification.id}
                        className={`cursor-pointer transition-colors ${
                          !notification.isRead ? "bg-blue-50 dark:bg-blue-950 border-blue-200" : ""
                        }`}
                      >
                        <CardContent className="p-3">
                          <div className="flex items-start justify-between space-x-2">
                            <div className="flex items-start space-x-2 flex-1">
                              <div className={`mt-1 ${getNotificationColor(notification.type)}`}>
                                {getNotificationIcon(notification.type)}
                              </div>
                              <div className="flex-1 min-w-0">
                                <div className="flex items-center space-x-2">
                                  <p className="font-medium text-sm">{notification.title}</p>
                                  {!notification.isRead && <div className="w-2 h-2 bg-blue-600 rounded-full" />}
                                </div>
                                <p className="text-sm text-muted-foreground mt-1">{notification.message}</p>
                                {notification.case && (
                                  <p className="text-xs text-muted-foreground mt-1">
                                    Case: {notification.case.caseNumber}
                                  </p>
                                )}
                                <p className="text-xs text-muted-foreground mt-1">
                                  {new Date(notification.createdAt).toLocaleString()}
                                </p>
                              </div>
                            </div>
                            <div className="flex items-center space-x-1">
                              {!notification.isRead && (
                                <Button
                                  variant="ghost"
                                  size="sm"
                                  onClick={(e) => {
                                    e.stopPropagation()
                                    markAsRead(notification.id)
                                  }}
                                >
                                  <Check className="h-3 w-3" />
                                </Button>
                              )}
                              <Button
                                variant="ghost"
                                size="sm"
                                onClick={(e) => {
                                  e.stopPropagation()
                                  deleteNotification(notification.id)
                                }}
                              >
                                <X className="h-3 w-3" />
                              </Button>
                            </div>
                          </div>
                        </CardContent>
                      </Card>
                    ))}
                  </div>
                )}
              </ScrollArea>
            </TabsContent>
          </Tabs>
        </div>
      </DropdownMenuContent>
    </DropdownMenu>
  )
}
