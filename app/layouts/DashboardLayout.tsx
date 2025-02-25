'use client';

import React, { useEffect, useState } from 'react';
import { SidebarProvider, useSidebar } from '@/components/sidebar-context';
import { AppSidebar } from '@/components/app-sidebar';
import { Avatar, AvatarImage, AvatarFallback } from '@/components/ui/avatar';
import { ModeToggle } from '@/components/ui/mode-toggle';
import {
  Bell,
  LogOut,
  Sun,
  Cloud,
  CloudDrizzle,
  CloudFog,
  CloudLightning,
  CloudRain,
  CloudSun,
  AlignJustify,
} from 'lucide-react';
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
      <AlignJustify />
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

// Update the getWeatherDescription function to return both description and icon component
const getWeatherInfo = (
  code: number,
  className = 'w-5 h-5 sm:w-6 sm:h-6'
): { description: string; icon: React.ReactNode } => {
  // Refer to https://open-meteo.com/en/docs for full weather code details.

  // Weather description mapping
  let description: string;
  let icon: React.ReactNode;

  switch (code) {
    case 0:
      description = 'Clear sky';
      icon = <Sun className={className} />;
      break;
    case 1:
      description = 'Mainly clear';
      icon = <Sun className={className} />;
      break;
    case 2:
      description = 'Partly cloudy';
      icon = <CloudSun className={className} />;
      break;
    case 3:
      description = 'Overcast';
      icon = <Cloud className={className} />;
      break;
    case 45:
    case 48:
      description = 'Fog';
      icon = <CloudFog className={className} />;
      break;
    case 51:
    case 53:
    case 55:
      description = 'Drizzle';
      icon = <CloudDrizzle className={className} />;
      break;
    case 61:
    case 63:
    case 65:
      description = 'Rain';
      icon = <CloudRain className={className} />;
      break;
    case 80:
    case 81:
    case 82:
      description = 'Rain showers';
      icon = <CloudRain className={className} />;
      break;
    case 95:
      description = 'Thunderstorm';
      icon = <CloudLightning className={className} />;
      break;
    default:
      description = 'Unknown';
      icon = <Cloud className={className} />;
  }

  return { description, icon };
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
      <div className='flex min-h-[calc(var(--vh)*100)] w-screen overflow-hidden'>
        <AppSidebar role={role} />
        <div className='flex flex-col flex-1 min-h-full min-w-0'>
          <header className='flex flex-wrap items-center justify-between px-3 py-2 border-b border-gray-200 sm:px-4'>
            <div className='flex items-center space-x-2 sm:space-x-4'>
              <SidebarTrigger className='md:hidden w-8 h-8 sm:w-10 sm:h-10' />
              <h1 className='text-lg font-bold capitalize truncate sm:text-xl md:text-2xl'>
                {role} Dashboard
              </h1>
            </div>
            <div className='flex items-center space-x-2 sm:space-x-3'>
              {/* Weather dropdown with icon */}
              {weather && weather.current_weather && (
                <DropdownMenu>
                  <DropdownMenuTrigger asChild>
                    <button
                      className='p-1.5 rounded-full hover:bg-gray-200 dark:hover:bg-gray-700 transition sm:p-2 relative'
                      aria-label='Weather'
                    >
                      {getWeatherInfo(weather.current_weather.weathercode).icon}
                      <span className='absolute -top-1 -right-1 text-xs bg-primary text-primary-foreground rounded-full px-1 min-w-[20px] text-center'>
                        {Math.round(weather.current_weather.temperature)}°
                      </span>
                    </button>
                  </DropdownMenuTrigger>
                  <DropdownMenuContent align='end'>
                    <div className='px-2 py-1.5'>
                      <div className='flex items-center gap-2 mb-1'>
                        {getWeatherInfo(weather.current_weather.weathercode, 'w-4 h-4').icon}
                        <span className='font-bold'>
                          {Math.round(weather.current_weather.temperature)}°C
                        </span>
                      </div>
                      <p className='text-sm text-muted-foreground'>
                        {getWeatherInfo(weather.current_weather.weathercode).description}
                      </p>
                      <div className='text-xs text-muted-foreground mt-1 grid grid-cols-2 gap-x-3 gap-y-1'>
                        <span>Wind: {weather.current_weather.windspeed} km/h</span>
                        <span>Dir: {weather.current_weather.winddirection}°</span>
                        <span className='col-span-2'>
                          Updated:{' '}
                          {new Date(weather.current_weather.time).toLocaleTimeString([], {
                            hour: '2-digit',
                            minute: '2-digit',
                          })}
                        </span>
                      </div>
                    </div>
                  </DropdownMenuContent>
                </DropdownMenu>
              )}

              <button className='p-1.5 rounded-full hover:bg-gray-200 dark:hover:bg-gray-700 transition sm:p-2'>
                <Bell className='w-5 h-5 sm:w-6 sm:h-6' />
              </button>
              <ModeToggle />
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <button className='flex items-center focus:outline-none'>
                    <Avatar className='w-8 h-8 sm:w-9 sm:h-9'>
                      <AvatarImage src='/avatars/shadcn.jpg' alt='User Avatar' />
                      <AvatarFallback>U</AvatarFallback>
                    </Avatar>
                  </button>
                </DropdownMenuTrigger>
                <DropdownMenuContent align='end'>
                  <DropdownMenuItem>Profile</DropdownMenuItem>
                  <DropdownMenuItem>Settings</DropdownMenuItem>
                  <DropdownMenuItem
                    className='flex items-center text-red-500'
                    onClick={() => router.push('/')}
                  >
                    <LogOut className='w-4 h-4 mr-2' /> Logout
                  </DropdownMenuItem>
                </DropdownMenuContent>
              </DropdownMenu>
            </div>
          </header>
          <main className='flex-1 overflow-y-auto p-4 pb-16'>{children}</main>
        </div>
      </div>
    </SidebarProvider>
  );
}
