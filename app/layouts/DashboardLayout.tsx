'use client';

import React, { useEffect, useState } from 'react';
import { SidebarProvider, useSidebar } from '@/components/sidebar-context';
import { AppSidebar } from '@/components/app-sidebar';
import { Avatar, AvatarImage, AvatarFallback } from '@/components/ui/avatar';
import { ModeToggle } from '@/components/ui/mode-toggle';
import { Bell, LogOut } from 'lucide-react';
import {
  DropdownMenu,
  DropdownMenuTrigger,
  DropdownMenuContent,
  DropdownMenuItem,
} from '@/components/ui/dropdown-menu';
import { roleMenus } from '@/lib/roleMenus';
import { useRouter } from 'next/navigation';

// Sidebar trigger component
const SidebarTrigger = ({ className }: { className?: string }) => {
  const { openSidebar } = useSidebar();
  return (
    <button className={className} onClick={openSidebar}>
      ☰
    </button>
  );
};

interface LayoutProps {
  children: React.ReactNode;
  role: keyof typeof roleMenus;
}

interface OpenMeteoWeather {
  current_weather: {
    temperature: number;
    windspeed: number;
    winddirection: number;
    weathercode: number;
    time: string;
  };
}

const getWeatherDescription = (code: number): string => {
 
  // Refer to https://open-meteo.com/en/docs for full weather code details.
  switch (code) {
    case 0:
      return 'Clear sky';
    case 1:
    case 2:
    case 3:
      return 'Mainly clear, partly cloudy, and overcast';
    case 45:
    case 48:
      return 'Fog';
    case 51:
    case 53:
    case 55:
      return 'Drizzle';
    case 61:
    case 63:
    case 65:
      return 'Rain';
    case 80:
    case 81:
    case 82:
      return 'Rain showers';
    case 95:
      return 'Thunderstorm';
    default:
      return 'Unknown';
  }
};

export default function Layout({ children, role }: LayoutProps) {
  const router = useRouter();
  const [weather, setWeather] = useState<OpenMeteoWeather | null>(null);

  
  useEffect(() => {
    const setVh = () => {
      const vh = window.innerHeight * 0.01;
      document.documentElement.style.setProperty('--vh', `${vh}px`);
    };
    setVh();
    window.addEventListener('resize', setVh);
    return () => window.removeEventListener('resize', setVh);
  }, []);

  // Fetch current weather 
  useEffect(() => {
    const fetchWeather = async (lat: number, lon: number) => {
      try {
        const res = await fetch(
          `https://api.open-meteo.com/v1/forecast?latitude=${lat}&longitude=${lon}&current_weather=true&temperature_unit=celsius`
        );
        if (!res.ok) {
          throw new Error('Failed to fetch weather');
        }
        const data: OpenMeteoWeather = await res.json();
        setWeather(data);
      } catch (error) {
        console.error('Error fetching weather:', error);
      }
    };

    if (navigator.geolocation) {
      navigator.geolocation.getCurrentPosition(
        (position) => {
          const { latitude, longitude } = position.coords;
          fetchWeather(latitude, longitude);
        },
        (/*error*/) => {
          //console.error('Error getting geolocation:', error);
        }
      );
    } else {
      console.error('Geolocation is not supported by this browser.');
    }
  }, []);

  return (
    <SidebarProvider>
      {/* Use the CSS variable for minimum height on mobile */}
      <div className="flex min-h-[calc(var(--vh)*100)] w-screen overflow-hidden">
        <AppSidebar role={role} />
        <div className="flex flex-col flex-1 min-h-full min-w-0">
          <header className="flex items-center justify-between px-4 py-2 border-b border-gray-200">
            <div className="flex items-center space-x-4">
              <SidebarTrigger className="w-12 h-12" />
              <h1 className="text-2xl font-bold capitalize">{role} Dashboard</h1>
            </div>
            <div className="flex items-center space-x-4">
              <button className="relative p-2 rounded-full hover:bg-gray-200 dark:hover:bg-gray-700 transition">
                <Bell className="w-6 h-6" />
              </button>
              <ModeToggle />
              {weather && weather.current_weather && (
                <div className="flex flex-col items-end text-sm">
                  <span className="font-medium">
                    Temp: {Math.round(weather.current_weather.temperature)}°C
                  </span>
                  <span className="capitalize">
                    {getWeatherDescription(weather.current_weather.weathercode)}
                  </span>
                </div>
              )}
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <button className="flex items-center focus:outline-none">
                    <Avatar>
                      <AvatarImage src="/avatars/shadcn.jpg" alt="User Avatar" />
                      <AvatarFallback>U</AvatarFallback>
                    </Avatar>
                  </button>
                </DropdownMenuTrigger>
                <DropdownMenuContent>
                  <DropdownMenuItem>Profile</DropdownMenuItem>
                  <DropdownMenuItem>Settings</DropdownMenuItem>
                  <DropdownMenuItem
                    className="flex items-center text-red-500"
                    onClick={() => router.push('/')}
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
    </SidebarProvider>
  );
}
