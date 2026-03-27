"use client";

import { usePathname } from "next/navigation";
import { ThemeProvider } from "@/components/theme-provider";
import { Toaster } from "@/components/ui/toaster";
import { Sidebar } from "@/components/layout/sidebar";
import { Header } from "@/components/layout/header";

export default function AppLayout({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();

  const hiddenSidebarRoutes = ["/", "/login", "/signup", "/profile"];
  const shouldHideSidebar = hiddenSidebarRoutes.includes(pathname);

  return (
    <ThemeProvider
      attribute="class"
      defaultTheme="system"
      enableSystem
      disableTransitionOnChange
    >
      {shouldHideSidebar ? (
        <main className="container py-6">{children}</main>
      ) : (
        <div className="min-h-screen bg-background">
          <div className="flex">
            <aside className="hidden md:block w-64 border-r bg-muted/10 mr-5">
              <Sidebar />
            </aside>
            <div className="flex-1">
              <Header />
              <main className="container py-6">{children}</main>
            </div>
          </div>
        </div>
      )}
      <Toaster />
    </ThemeProvider>
  );
}
