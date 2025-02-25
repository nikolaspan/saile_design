'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { useSidebar } from '@/components/sidebar-context'; // Import sidebar context directly
import { roleMenus, MenuItem } from '@/lib/roleMenus';
import { Avatar, AvatarImage, AvatarFallback } from '@/components/ui/avatar';

const Sidebar = ({
  children,
  className,
}: {
  children: React.ReactNode;
  className?: string;
}) => <aside className={className}>{children}</aside>;

const SidebarContent = ({ children }: { children: React.ReactNode }) => (
  <div>{children}</div>
);

const SidebarGroup = ({ children }: { children: React.ReactNode }) => (
  <div>{children}</div>
);

const SidebarGroupContent = ({ children }: { children: React.ReactNode }) => (
  <div>{children}</div>
);

const SidebarMenu = ({ children }: { children: React.ReactNode }) => (
  <ul>{children}</ul>
);

const SidebarMenuItem = ({
  children,
  className,
}: {
  children: React.ReactNode;
  className?: string;
}) => <li className={className}>{children}</li>;

const SidebarMenuButton = ({ children }: { children: React.ReactNode }) => (
  <div>{children}</div>
);

const SidebarMenuSub = ({
  children,
  className,
}: {
  children: React.ReactNode;
  className?: string;
}) => <ul className={className}>{children}</ul>;

interface AppSidebarProps {
  role: keyof typeof roleMenus;
}

/**
 * Recursively render menu items.
 */
function renderMenuItems(items: MenuItem[], currentPath: string) {
  return items.map((item) => {
    return (
      <SidebarMenuItem key={item.title}>
        <SidebarMenuButton>
          {item.disabled ? (
            <span className="flex items-center space-x-2 p-2 cursor-not-allowed opacity-50">
              {item.icon && <item.icon className="w-6 h-6" />}
              <span>{item.title}</span>
            </span>
          ) : (
            <Link href={item.url} className="flex items-center space-x-2 p-2 hover:underline">
              {item.icon && <item.icon className="w-6 h-6" />}
              <span>{item.title}</span>
            </Link>
          )}
        </SidebarMenuButton>
        {item.items && (
          <SidebarMenuSub className="ml-6 mt-1 space-y-1">
            {renderMenuItems(item.items, currentPath)}
          </SidebarMenuSub>
        )}
      </SidebarMenuItem>
    );
  });
}

export function AppSidebar({ role }: AppSidebarProps) {
  const pathname = usePathname();
  const menuItems = roleMenus[role] || [];
  const { sidebarOpen, closeSidebar } = useSidebar();

  return (
    <>
      {/* Mobile overlay */}
      <div
        className={`fixed inset-0 dark:bg-black bg-white bg-opacity-95 z-40 transition-opacity duration-300 md:hidden ${
          sidebarOpen ? "opacity-100" : "opacity-0 pointer-events-none"
        }`}
        onClick={closeSidebar}
      />

      <Sidebar
        className={`h-full w-64 border-r border-gray-200 flex-shrink-0 fixed z-50 transform transition-transform duration-300 ease-in-out 
          ${sidebarOpen ? "translate-x-0" : "-translate-x-full"} 
          md:static md:translate-x-0`}
      >
        <SidebarContent>
          <SidebarGroup>
            {/* Sidebar header with avatar */}
            <div className="flex items-center space-x-3 p-4">
              <Avatar className="w-10 h-10">
                <AvatarImage src="/avatars/shadcn.jpg" alt="User Avatar" />
                <AvatarFallback>{role.charAt(0)}</AvatarFallback>
              </Avatar>
              <span className="text-lg font-medium capitalize">{role}</span>
            </div>
            <SidebarGroupContent>
              <SidebarMenu>{renderMenuItems(menuItems, pathname)}</SidebarMenu>
            </SidebarGroupContent>
          </SidebarGroup>
        </SidebarContent>
      </Sidebar>
    </>
  );
}
