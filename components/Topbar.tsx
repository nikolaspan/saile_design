"use client";

import * as React from "react";
import Link from "next/link";
import { ModeToggle } from "@/components/ui/mode-toggle";

type TopbarProps = {
  toggleSidebar: () => void;
};

export default function Topbar({ toggleSidebar }: TopbarProps) {
  return (
    <header className="flex items-center justify-between p-4  border-b">
      <button className="md:hidden focus:outline-none" onClick={toggleSidebar}>
        {/* Hamburger Icon */}
        <svg
          className="w-6 h-6"
          fill="none"
          stroke="currentColor"
          viewBox="0 0 24 24"
        >
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            strokeWidth={2}
            d="M4 6h16M4 12h16M4 18h16"
          />
        </svg>
      </button>
      <div className="flex items-center space-x-4">
        {/* Mode Toggle using shadcn UI */}
        <ModeToggle />
        {/* Logout Link with legacyBehavior to support <a> child */}
        <Link legacyBehavior href="/logout">
          <a className="text-gray-900 dark:text-white">Logout</a>
        </Link>
      </div>
    </header>
  );
}
