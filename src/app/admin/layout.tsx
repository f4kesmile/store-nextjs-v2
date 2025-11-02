// src/app/admin/layout.tsx
"use client";

import { useSession, signOut } from "next-auth/react";
import { useRouter, usePathname } from "next/navigation";
import Link from "next/link";
import { useEffect, useState } from "react";

export default function AdminLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const { data: session, status } = useSession();
  const router = useRouter();
  const pathname = usePathname();
  const [sidebarOpen, setSidebarOpen] = useState(true);

  useEffect(() => {
    if (status === "unauthenticated") {
      router.push("/login");
    }
  }, [status, router]);

  if (status === "loading") {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-xl">Loading...</div>
      </div>
    );
  }

  if (!session) {
    return null;
  }

  const isDeveloper = session.user.role === "DEVELOPER";
  const permissions = session.user.permissions || [];

  const menuItems = [
    {
      name: "Dashboard",
      path: "/admin",
      icon: "📊",
      permission: null,
    },
    {
      name: "Produk",
      path: "/admin/products",
      icon: "📦",
      permission: "products:read",
    },
    { name: "Settings", path: "/admin/settings", icon: "⚙️" },
    {
      name: "Reseller",
      path: "/admin/resellers",
      icon: "👥",
      permission: "resellers:read",
    },
    {
      name: "Transaksi",
      path: "/admin/transactions",
      icon: "💳",
      permission: "transactions:read",
    },
    {
      name: "Users",
      path: "/admin/users",
      icon: "👤",
      permission: "users:read",
      developerOnly: true,
    },
    {
      name: "Roles",
      path: "/admin/roles",
      icon: "🔐",
      permission: "roles:manage",
      developerOnly: true,
    },
    {
      name: "Activity Logs",
      path: "/admin/logs",
      icon: "📝",
      permission: "logs:read",
      developerOnly: true,
    },
  ];

  const hasAccess = (item: any) => {
    if (item.developerOnly && !isDeveloper) return false;
    if (item.permission && !permissions.includes(item.permission)) return false;
    return true;
  };

  return (
    <div className="min-h-screen bg-gray-100 flex">
      {/* Sidebar */}
      <aside
        className={`${
          sidebarOpen ? "w-64" : "w-20"
        } bg-gradient-to-b from-purple-700 to-purple-900 text-white transition-all duration-300 fixed h-full z-10 shadow-2xl`}
      >
        <div className="p-4 border-b border-purple-600 flex items-center justify-between">
          {sidebarOpen && <h1 className="text-xl font-bold">Admin Panel</h1>}
          <button
            onClick={() => setSidebarOpen(!sidebarOpen)}
            className="p-2 hover:bg-purple-600 rounded"
          >
            {sidebarOpen ? "◀" : "▶"}
          </button>
        </div>

        <nav className="p-4 space-y-2">
          {menuItems.map(
            (item) =>
              hasAccess(item) && (
                <Link
                  key={item.path}
                  href={item.path}
                  className={`flex items-center gap-3 p-3 rounded-lg hover:bg-purple-600 transition-all ${
                    pathname === item.path ? "bg-purple-600 shadow-lg" : ""
                  }`}
                >
                  <span className="text-2xl">{item.icon}</span>
                  {sidebarOpen && (
                    <span className="font-medium">{item.name}</span>
                  )}
                </Link>
              )
          )}
        </nav>

        <div className="absolute bottom-4 left-0 right-0 px-4">
          <button
            onClick={() => signOut({ callbackUrl: "/login" })}
            className="w-full flex items-center gap-3 p-3 rounded-lg bg-red-600 hover:bg-red-700 transition-all"
          >
            <span className="text-2xl">🚪</span>
            {sidebarOpen && <span className="font-medium">Logout</span>}
          </button>
        </div>
      </aside>

      {/* Main Content */}
      <main
        className={`flex-1 ${
          sidebarOpen ? "ml-64" : "ml-20"
        } transition-all duration-300`}
      >
        {/* Top Bar */}
        <header className="bg-white shadow-md p-4 sticky top-0 z-5">
          <div className="flex justify-between items-center">
            <h2 className="text-2xl font-bold text-gray-800">
              Welcome, {session.user.name}
            </h2>
            <div className="flex items-center gap-4">
              <span className="px-4 py-2 bg-purple-100 text-purple-700 rounded-full font-medium">
                {session.user.role}
              </span>
              <Link
                href="/"
                target="_blank"
                className="px-4 py-2 bg-blue-500 text-white rounded-lg hover:bg-blue-600"
              >
                View Store
              </Link>
            </div>
          </div>
        </header>

        {/* Content Area */}
        <div className="p-6">{children}</div>
      </main>
    </div>
  );
}
