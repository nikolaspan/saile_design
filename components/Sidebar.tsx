// components/Sidebar.tsx
import Link from "next/link";
import { roleMenus } from "../lib/roleMenus";

type SidebarProps = {
  role: "B2B" | "Concierge" | "Admin";
  sidebarOpen: boolean;
};

export default function Sidebar({ role, sidebarOpen }: SidebarProps) {
  const menus = roleMenus[role];

  return (
    <div
      className={`
        fixed inset-y-0 left-0 w-64 bg-gray-800 text-white transform
        ${sidebarOpen ? "translate-x-0" : "-translate-x-full"}
        transition-transform duration-200 ease-in-out
        md:translate-x-0
      `}
    >
      <div className="p-4">
        <h1 className="text-2xl font-bold">Dashboard</h1>
      </div>
      <nav className="mt-4 space-y-2">
        {menus.map((menu, idx) => (
          <div key={idx}>
            <Link legacyBehavior href={menu.url}>
              <a className="flex items-center p-2 hover:bg-gray-700">
                {menu.icon && <menu.icon className="w-5 h-5 mr-2" />}
                <span>{menu.title}</span>
              </a>
            </Link>
            {menu.items && (
              <div className="ml-6 space-y-1">
                {menu.items.map((subMenu, subIdx) => (
                  <Link key={subIdx} legacyBehavior href={subMenu.url}>
                    <a
                      className={`flex items-center p-2 hover:bg-gray-700 ${
                        subMenu.isActive ? "bg-gray-900" : ""
                      }`}
                    >
                      {subMenu.icon && (
                        <subMenu.icon className="w-4 h-4 mr-2" />
                      )}
                      <span>{subMenu.title}</span>
                    </a>
                  </Link>
                ))}
              </div>
            )}
          </div>
        ))}
      </nav>
    </div>
  );
}
