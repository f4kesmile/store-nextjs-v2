"use client";
import { AdminSidebar } from "@/components/layout/AdminSidebar";
import { useEffect } from "react";

export default function AdminLayout({ children }: { children: React.ReactNode }){
  useEffect(() => {
    document.documentElement.classList.add("admin-dark");
    document.body.classList.add("admin-body");
    return () => {
      document.documentElement.classList.remove("admin-dark");
      document.body.classList.remove("admin-body");
    };
  }, []);

  return (
    <div className="min-h-screen flex">
      <AdminSidebar/>
      <div className="flex-1 flex flex-col">
        <div className="h-14 border-b flex items-center px-4 justify-between">
          <div className="text-sm text-muted-foreground">Welcome back, developer</div>
          <div className="flex items-center gap-2">
            <a href="/" className="text-sm underline-offset-4 hover:underline">View Store</a>
          </div>
        </div>
        <main className="flex-1 p-4 md:p-6">{children}</main>
      </div>
    </div>
  );
}
