"use client";

import React from "react";
import { SidebarProvider, useSidebar } from "@/components/sidebar-context";
import { AppSidebar } from "@/components/app-sidebar";
import { Avatar, AvatarImage, AvatarFallback } from "@/components/ui/avatar";
import { ModeToggle } from "@/components/ui/mode-toggle";
import { Bell, LogOut, AlignJustify } from "lucide-react";
import {
  DropdownMenu,
  DropdownMenuTrigger,
  DropdownMenuContent,
  DropdownMenuItem,
} from "@/components/ui/dropdown-menu";
import { roleMenus } from "@/lib/roleMenus";
import { signOut, useSession } from "next-auth/react";
import { Toaster } from "sonner"; // Import Sonner's Toaster

const SidebarTrigger = ({ className }: { className?: string }) => {
  const { openSidebar } = useSidebar();
  return (
    <button className={className} onClick={openSidebar}>
      <AlignJustify />
    </button>
  );
};

interface LayoutProps {
  children: React.ReactNode;
  role: keyof typeof roleMenus;
}

export default function Layout({ children, role }: LayoutProps) {
  useSession();

  return (
    <SidebarProvider>
      <div className="flex min-h-screen w-screen overflow-hidden">
        <AppSidebar role={role} />
        <div className="flex flex-col flex-1 min-h-full min-w-0">
          <header className="flex flex-wrap items-center justify-between px-3 py-2 border-b border-gray-200 sm:px-4">
            <div className="flex items-center space-x-2 sm:space-x-4">
              <SidebarTrigger className="md:hidden w-8 h-8 sm:w-10 sm:h-10" />
              <h1 className="text-lg font-bold capitalize truncate sm:text-xl md:text-2xl">
                {role} Dashboard
              </h1>
            </div>
            <div className="flex items-center space-x-2 sm:space-x-3">
              <button className="p-1.5 rounded-full hover:bg-gray-200 dark:hover:bg-gray-700 transition sm:p-2">
                <Bell className="w-5 h-5 sm:w-6 sm:h-6" />
              </button>
              <ModeToggle />
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <button className="flex items-center focus:outline-none">
                    <Avatar className="w-8 h-8 sm:w-9 sm:h-9">
                      <AvatarImage src="/avatars/shadcn.jpg" alt="User Avatar" />
                      <AvatarFallback>U</AvatarFallback>
                    </Avatar>
                  </button>
                </DropdownMenuTrigger>
                <DropdownMenuContent align="end">
                  <DropdownMenuItem>Profile</DropdownMenuItem>
                  <DropdownMenuItem>Settings</DropdownMenuItem>
                  <DropdownMenuItem
                    className="flex items-center text-red-500"
                    onClick={() =>
                      signOut({
                        callbackUrl: `${window.location.origin}/` // Using absolute URL
                      })
                    }
                  >
                    <LogOut className="w-4 h-4 mr-2" /> Logout
                  </DropdownMenuItem>
                </DropdownMenuContent>
              </DropdownMenu>
            </div>
          </header>
          <main className="flex-1 overflow-y-auto p-4 pb-16">{children}</main>
        </div>
      </div>
      {/* Sonner Toaster to display toast notifications */}
      <Toaster richColors />
    </SidebarProvider>
  );
}
