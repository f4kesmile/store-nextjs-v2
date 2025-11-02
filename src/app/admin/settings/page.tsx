"use client";

import { useEffect, useState } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";

const Icons = { gear: (p:any)=>(<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" {...p}><path d="M12 15a3 3 0 1 0 0-6 3 3 0 0 0 0 6Z"/><path d="M19.4 15a1.65 1.65 0 0 0 .33 1.82l.06.06a2 2 0 1 1-2.83 2.83l-.06-.06a1.65 1.65 0 0 0-1.82-.33 1.65 1.65 0 0 0-1 1.51V21a2 2 0 1 1-4 0v-.09a1.65 1.65 0 0 0-1-1.51 1.65 1.65 0 0 0-1.82.33l-.06-.06a2 2 0 1 1-2.83-2.83l.06-.06a1.65 1.65 0 0 0 .33-1.82 1.65 1.65 0 0 0-1.51-1H3a2 2 0 1 1 0-4h.09a1.65 1.65 0 0 0 1.51-1 1.65 1.65 0 0 0-.33-1.82l-.06-.06a2 2 0 1 1 2.83-2.83l.06.06a1.65 1.65 0 0 0 1.82.33H9a1.65 1.65 0 0 0 1-1.51V3a2 2 0 1 1 4 0v.09a1.65 1.65 0 0 0 1 1.51 1.65 1.65 0 0 0 1.82-.33l.06-.06a2 2 0 1 1 2.83 2.83l-.06.06a1.65 1.65 0 0 0-.33 1.82V9c0 .66.26 1.3.73 1.77.47.47 1.11.73 1.77.73H21a2 2 0 1 1 0 4h-.09a1.65 1.65 0 0 0-1.51 1Z"/></svg>)}

export default function SettingsPage(){
  const [saving, setSaving] = useState(false);
  const [formData, setFormData] = useState({ storeName: "", supportEmail: "", supportWhatsApp: "", locale: "id" });

  async function submit(e: React.FormEvent){
    e.preventDefault(); setSaving(true);
    try{ await fetch("/api/settings", { method: "PUT", headers: { "Content-Type": "application/json" }, body: JSON.stringify(formData) }); }
    finally{ setSaving(false); }
  }

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader className="pb-3">
          <div className="flex items-center gap-2">
            <span className="size-8 rounded-md bg-muted grid place-items-center"><Icons.gear className="w-4 h-4"/></span>
            <div>
              <CardTitle className="text-lg">Settings</CardTitle>
              <CardDescription>Konfigurasi dasar toko</CardDescription>
            </div>
          </div>
        </CardHeader>
      </Card>

      <form onSubmit={submit} className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <Card>
          <CardHeader className="pb-2"><CardTitle className="text-base">Informasi Toko</CardTitle><CardDescription>Nama dan kontak</CardDescription></CardHeader>
          <CardContent className="space-y-3">
            <Input placeholder="Nama Toko" value={formData.storeName} onChange={(e)=>setFormData({...formData, storeName: e.target.value})}/>
            <Input placeholder="Email Toko" value={formData.supportEmail} onChange={(e)=>setFormData({...formData, supportEmail: e.target.value})}/>
            <Input placeholder="No. WhatsApp" value={formData.supportWhatsApp} onChange={(e)=>setFormData({...formData, supportWhatsApp: e.target.value})}/>
            <Button disabled={saving}>{saving?"Menyimpan...":"Simpan"}</Button>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="pb-2"><CardTitle className="text-base">Preferensi</CardTitle><CardDescription>Bahasa/Locale</CardDescription></CardHeader>
          <CardContent className="space-y-3">
            <Select value={formData.locale} onValueChange={(v)=>setFormData({...formData, locale:v})}>
              <SelectTrigger><SelectValue placeholder="Bahasa"/></SelectTrigger>
              <SelectContent><SelectItem value="id">Indonesia</SelectItem><SelectItem value="en">English</SelectItem></SelectContent>
            </Select>
            <Button variant="outline" disabled={saving}>{saving?"Menyimpan...":"Simpan Preferensi"}</Button>
          </CardContent>
        </Card>
      </form>
    </div>
  );
}
