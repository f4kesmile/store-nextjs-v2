// src/components/AdminSidebar.tsx
"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { signOut } from "next-auth/react";

interface MenuItem {
  name: string;
  path: string;
  icon: string;
}

interface AdminSidebarProps {
  isOpen: boolean;
  onToggle: () => void;
  menuItems: MenuItem[];
}

export function AdminSidebar({
  isOpen,
  onToggle,
  menuItems,
}: AdminSidebarProps) {
  const pathname = usePathname();

  return (
    <aside
      className={`${
        isOpen ? "w-64" : "w-20"
      } bg-gradient-to-b from-purple-700 to-purple-900 text-white transition-all duration-300 fixed h-full z-10 shadow-2xl`}
    >
      <div className="p-4 border-b border-purple-600 flex items-center justify-between">
        {isOpen && <h1 className="text-xl font-bold">Admin Panel</h1>}
        <button onClick={onToggle} className="p-2 hover:bg-purple-600 rounded">
          {isOpen ? "◀" : "▶"}
        </button>
      </div>

      <nav className="p-4 space-y-2">
        {menuItems.map((item) => (
          <Link
            key={item.path}
            href={item.path}
            className={`flex items-center gap-3 p-3 rounded-lg hover:bg-purple-600 transition-all ${
              pathname === item.path ? "bg-purple-600 shadow-lg" : ""
            }`}
          >
            <span className="text-2xl">{item.icon}</span>
            {isOpen && <span className="font-medium">{item.name}</span>}
          </Link>
        ))}
      </nav>

      <div className="absolute bottom-4 left-0 right-0 px-4">
        <button
          onClick={() => signOut({ callbackUrl: "/login" })}
          className="w-full flex items-center gap-3 p-3 rounded-lg bg-red-600 hover:bg-red-700 transition-all"
        >
          <span className="text-2xl">🚪</span>
          {isOpen && <span className="font-medium">Logout</span>}
        </button>
      </div>
    </aside>
  );
}
