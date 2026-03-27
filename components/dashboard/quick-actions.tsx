"use client"

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Plus, Search, Calendar, FileText, Users, Upload } from "lucide-react"

const actions = [
  {
    title: "Add New Case",
    description: "Register a new legal case",
    icon: Plus,
    href: "/cases/new",
    color: "bg-blue-500 hover:bg-blue-600",
  },
  {
    title: "Add Client",
    description: "Register a new client",
    icon: Users,
    href: "/clients/new",
    color: "bg-green-500 hover:bg-green-600",
  },
  {
    title: "Search Cases",
    description: "Find cases across courts",
    icon: Search,
    href: "/case-search",
    color: "bg-purple-500 hover:bg-purple-600",
  },
  {
    title: "View Cause List",
    description: "Check daily cause lists",
    icon: Calendar,
    href: "/cause-list",
    color: "bg-orange-500 hover:bg-orange-600",
  },
  {
    title: "Upload Document",
    description: "Add case documents",
    icon: Upload,
    href: "/documents/upload",
    color: "bg-indigo-500 hover:bg-indigo-600",
  },
  {
    title: "Search Judgments",
    description: "Find relevant judgments",
    icon: FileText,
    href: "/judgments",
    color: "bg-teal-500 hover:bg-teal-600",
  },
]

export function QuickActions() {
  return (
    <Card>
      <CardHeader>
        <CardTitle>Quick Actions</CardTitle>
        <CardDescription>Frequently used actions and shortcuts</CardDescription>
      </CardHeader>
      <CardContent>
        <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
          {actions.map((action) => (
            <Button
              key={action.title}
              variant="outline"
              className="h-auto p-4 flex flex-col items-center space-y-2 hover:bg-accent bg-transparent"
              asChild
            >
              <a href={action.href}>
                <div className={`p-2 rounded-full ${action.color} text-white`}>
                  <action.icon className="h-5 w-5" />
                </div>
                <div className="text-center">
                  <p className="font-medium text-sm">{action.title}</p>
                  <p className="text-xs text-muted-foreground">{action.description}</p>
                </div>
              </a>
            </Button>
          ))}
        </div>
      </CardContent>
    </Card>
  )
}
