"use client"

import { useState } from "react"
import Link from "next/link"
import { usePathname } from "next/navigation"
import { cn } from "@/lib/utils"
import { Button } from "@/components/ui/button"
import { Sheet, SheetContent, SheetTrigger } from "@/components/ui/sheet"
import {
  LayoutDashboard,
  Users,
  FileText,
  Calendar,
  Search,
  Gavel,
  Bell,
  Settings,
  Menu,
  Shield,
  FolderOpen,
  Clock,
} from "lucide-react"

const navigation = [
  { name: "Dashboard", href: "/dashboard", icon: LayoutDashboard },
  { name: "Cause List", href: "/cause-list", icon: Calendar },
  { name: "Case Search", href: "/case-search", icon: Search },
  { name: "Cases", href: "/cases", icon: FileText },
  { name: "Clients", href: "/clients", icon: Users },
  { name: "Documents", href: "/documents", icon: FolderOpen },
  { name: "Notifications", href: "/notifications", icon: Bell },
  { name: "Activity Log", href: "/activity", icon: Clock },
  { name: "Acts", href: "/acts", icon: Gavel },
  { name: "Settings", href: "/settings", icon: Settings },
]

export function Sidebar({ className }) {
  const pathname = usePathname()

  return (
    <div className={cn("pb-12 min-h-screen", className)}>
      <div className="space-y-4 py-4">
        <div className="px-3 py-2">
          <div className="flex items-center gap-2 px-4 mb-6">
            <div className="w-8 h-8 bg-blue-600 rounded-lg flex items-center justify-center">
              <Shield className="w-5 h-5 text-white" />
            </div>
            <div>
              <h2 className="text-lg font-semibold">Legal Manager</h2>
              <p className="text-xs text-muted-foreground">Case Management</p>
            </div>
          </div>

          <div className="space-y-1">
            {navigation.map((item) => (
              <Link
                key={item.name}
                href={item.href}
                className={cn(
                  "flex items-center gap-3 rounded-lg px-3 py-2 text-sm font-medium hover:bg-accent hover:text-accent-foreground transition-colors",
                  pathname === item.href
                    ? "bg-accent text-accent-foreground"
                    : "text-muted-foreground"
                )}
              >
                <item.icon className="h-4 w-4" />
                {item.name}
              </Link>
            ))}
          </div>
        </div>
      </div>
    </div>
  )
}

export function MobileSidebar() {
  const [open, setOpen] = useState(false)

  return (
    <Sheet open={open} onOpenChange={setOpen}>
      <SheetTrigger asChild>
        <Button variant="ghost" size="icon" className="md:hidden">
          <Menu className="h-5 w-5" />
        </Button>
      </SheetTrigger>

      <SheetContent side="left" className="p-0 w-72">
        <Sidebar />
      </SheetContent>
    </Sheet>
  )
}