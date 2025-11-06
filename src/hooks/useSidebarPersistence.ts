"use client";
import { useEffect } from "react";

export function useSidebarPersistence(key = "admin_sidebar_collapsed", value: boolean, setValue: (v: boolean)=>void){
  useEffect(()=>{
    try { const v = localStorage.getItem(key); if (v !== null) setValue(v === "1"); } catch {}
  }, [key, setValue]);
  useEffect(()=>{ try { localStorage.setItem(key, value ? "1" : "0"); } catch {} }, [key, value]);
}
