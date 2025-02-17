import React, { useState } from "react"
import Sidebar from "@/components/Sidebar"
import Topbar from "@/components/Topbar"

type LayoutProps = {
  children: React.ReactNode
  role: "B2B" | "Concierge" | "Admin"
}

export default function DashboardLayout({ children, role }: LayoutProps) {
  const [sidebarOpen, setSidebarOpen] = useState(false)

  const toggleSidebar = () => setSidebarOpen(!sidebarOpen)

  return (
    <div className="flex h-screen">
      {/* Sidebar */}
      <Sidebar role={role} sidebarOpen={sidebarOpen} />
      {/* Main Content */}
      <div className="flex flex-col flex-1 ml-0 md:ml-64">
        <Topbar toggleSidebar={toggleSidebar} />
        <main className="flex-1 p-4 overflow-auto ">
          {children}
        </main>
      </div>
    </div>
  )
}
