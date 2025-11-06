"use client";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { LayoutGrid, Package, Users, ShoppingCart, Settings, Shield, FileText, LogOut } from "lucide-react";

const menus = [
  { href: "/admin", label: "Dashboard", icon: LayoutGrid },
  { href: "/admin/products", label: "Products", icon: Package },
  { href: "/admin/resellers", label: "Reseller", icon: Users },
  { href: "/admin/transactions", label: "Transactions", icon: ShoppingCart },
  { href: "/admin/users", label: "Users", icon: Users },
  { href: "/admin/roles", label: "Roles", icon: Shield },
  { href: "/admin/settings", label: "Settings", icon: Settings },
  { href: "/admin/logs", label: "Logs", icon: FileText },
];

export function AdminSidebar(){
  const pathname = usePathname();
  return (
    <aside className="admin-sidebar w-64 shrink-0 hidden md:flex md:flex-col border-r">
      <div className="h-14 flex items-center px-4 text-lg font-semibold">Devlog Store</div>
      <nav className="flex-1 px-2 py-2 space-y-1">
        {menus.map(({href,label,icon:Icon}) => {
          const active = pathname === href || (href !== "/admin" && pathname.startsWith(href));
          return (
            <Link key={href} href={href} className={`flex items-center gap-2 px-3 py-2 rounded-md transition ${active?"active" : "hover:bg-muted"}`}>
              <Icon className="h-4 w-4"/>
              <span className="text-sm">{label}</span>
            </Link>
          );
        })}
      </nav>
      <div className="p-2 border-t">
        <button className="w-full inline-flex items-center gap-2 px-3 py-2 rounded-md hover:bg-muted text-sm"><LogOut className="h-4 w-4"/> Logout</button>
      </div>
    </aside>
  );
}
