"use client";

import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import { useSession, signOut } from "next-auth/react";

import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Card } from "@/components/ui/card";
import { cn } from "@/lib/utils";

// Minimal icon set
const IconUser = (props: any) => (<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" aria-hidden="true" {...props}><circle cx="12" cy="8" r="4"/><path d="M6 20a6 6 0 0112 0"/></svg>);
const IconDashboard = (props: any) => (<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" aria-hidden="true" {...props}><rect x="3" y="3" width="7" height="7" rx="1"/><rect x="14" y="3" width="7" height="7" rx="1"/><rect x="14" y="14" width="7" height="7" rx="1"/><rect x="3" y="14" width="7" height="7" rx="1"/></svg>);
const IconChevronLeft = (props: any) => (<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" aria-hidden="true" {...props}><path d="M15 19l-7-7 7-7"/></svg>);
const IconChevronRight = (props: any) => (<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" aria-hidden="true" {...props}><path d="M9 5l7 7-7 7"/></svg>);
const IconMenu = (props: any) => (<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" aria-hidden="true" {...props}><path d="M4 6h16M4 12h16M4 18h16"/></svg>);
const IconLogout = (props: any) => (<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" aria-hidden="true" {...props}><path d="M17 16l4-4-4-4"/><path d="M7 12h14"/><path d="M3 21V3h8"/></svg>);
const IconExternal = (props: any) => (<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" aria-hidden="true" {...props}><path d="M14 3h7v7"/><path d="M10 14L21 3"/><path d="M5 12v7a2 2 0 002 2h7"/></svg>);

interface MenuItem { name: string; path: string; icon: React.ComponentType<any>; permission?: string | null; developerOnly?: boolean; }

const menuItems: MenuItem[] = [
  { name: "Dashboard", path: "/admin", icon: IconDashboard, permission: null },
  { name: "Produk", path: "/admin/products", icon: IconDashboard, permission: "products:read" },
  { name: "Settings", path: "/admin/settings", icon: IconDashboard },
  { name: "Reseller", path: "/admin/resellers", icon: IconDashboard, permission: "resellers:read" },
  { name: "Transaksi", path: "/admin/transactions", icon: IconDashboard, permission: "transactions:read" },
  { name: "Users", path: "/admin/users", icon: IconDashboard, permission: "users:read", developerOnly: true },
];

export default function AdminLayout({ children }: { children: React.ReactNode }) {
  const { data: session, status } = useSession();
  const router = useRouter();
  const pathname = usePathname();
  const [sidebarOpen, setSidebarOpen] = useState(true);
  const [isMobile, setIsMobile] = useState(false);

  useEffect(() => { if (status === "unauthenticated") router.push("/login"); }, [status, router]);
  useEffect(() => { const onResize = () => { setIsMobile(window.innerWidth < 768); if (window.innerWidth < 768) setSidebarOpen(false); }; onResize(); window.addEventListener("resize", onResize); return () => window.removeEventListener("resize", onResize); }, []);

  if (status === "loading") return (<div className="min-h-screen grid place-items-center"><div className="w-8 h-8 border-4 border-primary border-t-transparent rounded-full animate-spin"/></div>);
  if (!session) return null;

  const isDeveloper = session.user.role === "DEVELOPER";
  const permissions = session.user.permissions || [];
  const hasAccess = (item: MenuItem) => { if (item.developerOnly && !isDeveloper) return false; if (item.permission && !permissions.includes(item.permission)) return false; return true; };

  const getPageTitle = () => menuItems.find((m) => m.path === pathname)?.name ?? "Dashboard";

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 to-slate-100 flex">
      {isMobile && sidebarOpen && (<div onClick={() => setSidebarOpen(false)} className="fixed inset-0 bg-black/50 z-40 md:hidden" />)}

      <aside className={cn("bg-white border-r border-border/40 text-foreground transition-all duration-300 fixed h-full z-50 shadow-xl", sidebarOpen ? "w-72" : "w-20", isMobile && "md:relative")}>
        <div className="p-6 border-b border-border/40">
          <div className="flex items-center justify-between">
            {sidebarOpen && (
              <div className="flex items-center gap-3">
                <div className="w-8 h-8 bg-gradient-to-r from-primary to-primary/80 rounded-lg grid place-items-center">
                  <IconDashboard className="w-4 h-4 text-primary-foreground"/>
                </div>
                <h1 className="text-lg font-bold">Admin Panel</h1>
              </div>
            )}
            <Button variant="ghost" size="icon" onClick={() => setSidebarOpen(!sidebarOpen)}>
              {sidebarOpen ? <IconChevronLeft className="w-4 h-4"/> : <IconChevronRight className="w-4 h-4"/>}
            </Button>
          </div>
        </div>

        <nav className="p-4 space-y-2 flex-1">
          {menuItems.map((item) => hasAccess(item) && (
            <Link href={item.path} key={item.path}>
              <Button variant={pathname === item.path ? "default" : "ghost"} className={cn("w-full justify-start gap-3 h-12", pathname === item.path ? "bg-primary text-primary-foreground shadow-md" : "hover:bg-accent/50")}>
                <item.icon className="w-5 h-5"/>
                {sidebarOpen && <span className="font-medium truncate">{item.name}</span>}
              </Button>
            </Link>
          ))}
        </nav>

        <div className="p-4 border-t border-border/40 space-y-3">
          {sidebarOpen && (
            <Card className="p-3 bg-gradient-to-r from-primary/10 to-accent/10 border-primary/20">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 bg-primary/20 rounded-full grid place-items-center"><IconUser className="w-5 h-5 text-primary"/></div>
                <div className="flex-1 min-w-0">
                  <p className="font-medium text-sm truncate">{session.user.name}</p>
                  <Badge variant="secondary" className="text-xs">{session.user.role}</Badge>
                </div>
              </div>
            </Card>
          )}
          <Button variant="destructive" onClick={() => signOut({ callbackUrl: "/login" })} className="w-full justify-start gap-3 h-12"><IconLogout className="w-5 h-5"/>{sidebarOpen && <span className="font-medium">Logout</span>}</Button>
        </div>
      </aside>

      <main className={cn("flex-1 flex flex-col min-h-screen transition-all duration-300", !isMobile && (sidebarOpen ? "ml-72" : "ml-20"))}>
        <header className="bg-white/80 backdrop-blur-md border-b border-border/40 p-6 sticky top-0 z-30">
          <div className="flex justify-between items-center">
            <div className="flex items-center gap-4">
              {isMobile && (<Button variant="ghost" size="icon" onClick={() => setSidebarOpen(true)} className="md:hidden"><IconMenu className="w-5 h-5"/></Button>)}
              <div>
                <h1 className="text-2xl font-bold text-foreground">{getPageTitle()}</h1>
                <p className="text-sm text-muted-foreground">Welcome back, {session.user.name}</p>
              </div>
            </div>
            <div className="flex items-center gap-3">
              <Badge variant="secondary" className="px-3 py-1 font-medium hidden sm:inline-flex">{session.user.role}</Badge>
              <Button asChild variant="outline" className="gap-2"><Link href="/"><IconExternal className="w-4 h-4"/><span className="hidden sm:inline">View Store</span></Link></Button>
            </div>
          </div>
        </header>
        <div className="flex-1 p-6 space-y-6">{children}</div>
      </main>
    </div>
  );
}
