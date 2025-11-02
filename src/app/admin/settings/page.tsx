"use client";

import { useState, useEffect } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { toast } from "sonner";
import { Loader2 } from "lucide-react";

const Icons = { 
  gear: (p:any)=>(<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" {...p}><path d="M12 15a3 3 0 1 0 0-6 3 3 0 0 0 0 6Z"/><path d="M19.4 15a1.65 1.65 0 0 0 .33 1.82l.06.06a2 2 0 1 1-2.83 2.83l-.06-.06a1.65 1.65 0 0 0-1.82-.33 1.65 1.65 0 0 0-1 1.51V21a2 2 0 1 1-4 0v-.09a1.65 1.65 0 0 0-1-1.51 1.65 1.65 0 0 0-1.82.33l-.06-.06a2 2 0 1 1-2.83-2.83l.06-.06a1.65 1.65 0 0 0 .33-1.82 1.65 1.65 0 0 0-1.51-1H3a2 2 0 1 1 0-4h.09a1.65 1.65 0 0 0 1.51-1 1.65 1.65 0 0 0-.33-1.82l-.06-.06a2 2 0 1 1 2.83-2.83l.06.06a1.65 1.65 0 0 0 1.82.33H9a1.65 1.65 0 0 0 1-1.51V3a2 2 0 1 1 4 0v.09a1.65 1.65 0 0 0 1 1.51 1.65 1.65 0 0 0 1.82-.33l.06-.06a2 2 0 1 1 2.83 2.83l-.06.06a1.65 1.65 0 0 0-.33 1.82V9c0 .66.26 1.3.73 1.77.47.47 1.11.73 1.77.73H21a2 2 0 1 1 0 4h-.09a1.65 1.65 0 0 0-1.51 1Z"/></svg>)
};

export default function SettingsPage(){
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [uploadingLogo, setUploadingLogo] = useState(false);
  const [uploadingFavicon, setUploadingFavicon] = useState(false);
  const [formData, setFormData] = useState({
    storeName: "",
    storeDescription: "",
    supportEmail: "",
    supportWhatsApp: "",
    storeLocation: "",
    aboutTitle: "",
    aboutDescription: "",
    locale: "id",
    logoUrl: "",
    faviconUrl: "",
    primaryColor: "#2563EB",
    secondaryColor: "#10B981",
    theme: "light" as "light" | "dark",
  });

  // Auto-fetch existing settings on page load
  useEffect(() => {
    async function fetchSettings() {
      try {
        setLoading(true);
        const res = await fetch("/api/settings");
        if (res.ok) {
          const data = await res.json();
          setFormData(prev => ({ ...prev, ...data }));
          toast.success("Settings loaded successfully");
        } else {
          throw new Error('Failed to fetch settings');
        }
      } catch (error) {
        console.error('Error fetching settings:', error);
        toast.error("Failed to load settings");
      } finally {
        setLoading(false);
      }
    }
    fetchSettings();
  }, []);

  async function submit(e: React.FormEvent){
    e.preventDefault(); 
    setSaving(true);
    
    try{ 
      const res = await fetch("/api/settings", { 
        method: "PUT", 
        headers: { "Content-Type": "application/json" }, 
        body: JSON.stringify(formData) 
      });
      
      if (res.ok) {
        toast.success("✅ Berhasil disimpan!");
        // Trigger a custom event to notify other components about settings update
        window.dispatchEvent(new CustomEvent('settings-updated', { detail: formData }));
      } else {
        throw new Error('Failed to save settings');
      }
    } catch (error) {
      console.error('Error saving settings:', error);
      toast.error("❌ Gagal menyimpan settings");
    } finally{ 
      setSaving(false); 
    }
  }

  async function uploadFile(kind: "logo" | "favicon", file?: File){
    if(!file) return;
    
    // Check file size (max 5MB)
    if (file.size > 5 * 1024 * 1024) {
      toast.error("File terlalu besar. Maksimal 5MB");
      return;
    }
    
    if(kind === "logo") setUploadingLogo(true); 
    else setUploadingFavicon(true);
    
    try{
      const fd = new FormData();
      fd.append(kind, file);
      
      const res = await fetch(`/api/upload/${kind}`, { method: "POST", body: fd });
      const data = await res.json();
      
      if (res.ok) {
        if(data.logoPath && kind === "logo"){ 
          setFormData(prev=>({ ...prev, logoUrl: data.logoPath })); 
          toast.success("✅ Logo berhasil diupload!");
        }
        if(data.faviconPath && kind === "favicon"){ 
          setFormData(prev=>({ ...prev, faviconUrl: data.faviconPath })); 
          toast.success("✅ Favicon berhasil diupload!");
        }
      } else {
        throw new Error(data.error || 'Upload failed');
      }
    } catch (error) {
      console.error('Upload error:', error);
      toast.error(`❌ Gagal upload ${kind === 'logo' ? 'logo' : 'favicon'}`);
    } finally{ 
      if(kind === "logo") setUploadingLogo(false); 
      else setUploadingFavicon(false); 
    }
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-96">
        <div className="flex items-center gap-3">
          <Loader2 className="w-6 h-6 animate-spin" />
          <span className="text-lg">Loading settings...</span>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader className="pb-3">
          <div className="flex items-center gap-2">
            <span className="size-8 rounded-md bg-muted grid place-items-center"><Icons.gear className="w-4 h-4"/></span>
            <div>
              <CardTitle className="text-lg">Settings</CardTitle>
              <CardDescription>Konfigurasi dasar toko + Brand & Tema</CardDescription>
            </div>
          </div>
        </CardHeader>
      </Card>

      <form onSubmit={submit} className="grid grid-cols-1 gap-4">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-base">Informasi Toko</CardTitle>
              <CardDescription>Nama dan kontak</CardDescription>
            </CardHeader>
            <CardContent className="space-y-3">
              <Input 
                placeholder="Nama Toko" 
                value={formData.storeName} 
                onChange={(e)=>setFormData({...formData, storeName: e.target.value})}
                disabled={saving}
              />
              <Input 
                placeholder="Email Toko" 
                type="email"
                value={formData.supportEmail} 
                onChange={(e)=>setFormData({...formData, supportEmail: e.target.value})}
                disabled={saving}
              />
              <Input 
                placeholder="No. WhatsApp (contoh: +6281234567890)" 
                value={formData.supportWhatsApp} 
                onChange={(e)=>setFormData({...formData, supportWhatsApp: e.target.value})}
                disabled={saving}
              />
              <Input 
                placeholder="Lokasi Toko" 
                value={formData.storeLocation} 
                onChange={(e)=>setFormData({...formData, storeLocation: e.target.value})}
                disabled={saving}
              />
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-base">Brand & Tema</CardTitle>
              <CardDescription>Logo, favicon, warna, dan tema</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                <div className="space-y-2">
                  <label className="text-sm font-medium">Upload Logo</label>
                  <input 
                    className="block w-full text-sm file:mr-4 file:py-2 file:px-4 file:rounded-lg file:border-0 file:text-sm file:font-medium file:bg-primary/10 file:text-primary hover:file:bg-primary/20 disabled:opacity-50" 
                    type="file" 
                    accept="image/*" 
                    onChange={(e)=>uploadFile("logo", e.target.files?.[0])} 
                    disabled={uploadingLogo || saving}
                  />
                  <div className="h-12 w-12 rounded bg-muted overflow-hidden grid place-items-center border">
                    {formData.logoUrl ? (
                      <img src={formData.logoUrl} alt="logo" className="max-h-12" />
                    ) : (
                      <div className="text-xs text-muted-foreground">Logo</div>
                    )}
                  </div>
                  <div className="text-xs text-muted-foreground">
                    {uploadingLogo ? (
                      <span className="flex items-center gap-1">
                        <Loader2 className="w-3 h-3 animate-spin" />
                        Mengunggah...
                      </span>
                    ) : (
                      "PNG/JPG transparan direkomendasikan"
                    )}
                  </div>
                </div>

                <div className="space-y-2">
                  <label className="text-sm font-medium">Upload Favicon</label>
                  <input 
                    className="block w-full text-sm file:mr-4 file:py-2 file:px-4 file:rounded-lg file:border-0 file:text-sm file:font-medium file:bg-primary/10 file:text-primary hover:file:bg-primary/20 disabled:opacity-50" 
                    type="file" 
                    accept="image/x-icon,image/png" 
                    onChange={(e)=>uploadFile("favicon", e.target.files?.[0])} 
                    disabled={uploadingFavicon || saving}
                  />
                  <div className="h-8 w-8 rounded bg-muted overflow-hidden grid place-items-center border">
                    {formData.faviconUrl ? (
                      <img src={formData.faviconUrl} alt="favicon" className="max-h-8" />
                    ) : (
                      <div className="text-[10px] text-muted-foreground">ico</div>
                    )}
                  </div>
                  <div className="text-xs text-muted-foreground">
                    {uploadingFavicon ? (
                      <span className="flex items-center gap-1">
                        <Loader2 className="w-3 h-3 animate-spin" />
                        Mengunggah...
                      </span>
                    ) : (
                      "PNG 32x32 atau ICO"
                    )}
                  </div>
                </div>

                <div className="space-y-3">
                  <div className="grid grid-cols-2 gap-3">
                    <div className="space-y-1">
                      <label className="text-sm font-medium">Primary</label>
                      <Input 
                        type="color" 
                        value={formData.primaryColor} 
                        onChange={(e)=>setFormData({...formData, primaryColor: e.target.value})}
                        disabled={saving}
                        className="h-10 cursor-pointer"
                      />
                    </div>
                    <div className="space-y-1">
                      <label className="text-sm font-medium">Secondary</label>
                      <Input 
                        type="color" 
                        value={formData.secondaryColor} 
                        onChange={(e)=>setFormData({...formData, secondaryColor: e.target.value})}
                        disabled={saving}
                        className="h-10 cursor-pointer"
                      />
                    </div>
                  </div>
                  <div className="space-y-1">
                    <label className="text-sm font-medium">Tema default</label>
                    <Select 
                      value={formData.theme} 
                      onValueChange={(v)=>setFormData({...formData, theme: v as "light" | "dark"})}
                      disabled={saving}
                    >
                      <SelectTrigger><SelectValue placeholder="Tema default"/></SelectTrigger>
                      <SelectContent>
                        <SelectItem value="light">Light</SelectItem>
                        <SelectItem value="dark">Dark</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                </div>
              </div>

              <div className="mt-6 space-y-2">
                <div className="text-sm text-muted-foreground">Preview</div>
                <div className="border rounded-lg p-4 space-y-3">
                  <div className="flex items-center gap-3">
                    <div className="size-10 rounded bg-muted overflow-hidden grid place-items-center">
                      {formData.logoUrl ? (
                        <img src={formData.logoUrl} alt="logo" className="max-h-10"/>
                      ) : (
                        <div className="text-xs text-muted-foreground">Logo</div>
                      )}
                    </div>
                    <div className="flex gap-2">
                      <span className="size-6 rounded" style={{ background: formData.primaryColor }} />
                      <span className="size-6 rounded" style={{ background: formData.secondaryColor }} />
                    </div>
                    <div className="ml-auto flex items-center gap-2">
                      <span className="text-xs text-muted-foreground">Favicon</span>
                      <div className="size-6 rounded overflow-hidden bg-muted grid place-items-center">
                        {formData.faviconUrl ? (
                          <img src={formData.faviconUrl} alt="favicon" className="max-h-6" />
                        ) : (
                          <div className="text-[10px] text-muted-foreground">ico</div>
                        )}
                      </div>
                    </div>
                  </div>
                  <div className="text-xs text-muted-foreground">Tema: {formData.theme}</div>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        <div className="flex gap-2">
          <Button 
            type="submit" 
            disabled={saving || uploadingLogo || uploadingFavicon} 
            className="ml-auto"
          >
            {saving ? (
              <span className="flex items-center gap-2">
                <Loader2 className="w-4 h-4 animate-spin" />
                Menyimpan...
              </span>
            ) : (
              "Simpan Settings"
            )}
          </Button>
        </div>
      </form>
    </div>
  );
}