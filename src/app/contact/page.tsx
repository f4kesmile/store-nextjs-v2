"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { SiteNavbar } from "@/components/site-navbar";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Skeleton } from "@/components/ui/skeleton";

interface Settings {
  storeName: string;
  storeDescription: string;
  supportWhatsApp: string;
  supportEmail: string;
  storeLocation: string;
  aboutTitle: string;
  aboutDescription: string;
}

export default function ContactPage() {
  const [settings, setSettings] = useState<Settings | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    (async () => {
      try {
        const res = await fetch("/api/settings");
        const data = await res.json();
        setSettings(data);
      } catch (e) {
        console.error(e);
      } finally {
        setLoading(false);
      }
    })();
  }, []);

  return (
    <div className="min-h-screen bg-background">
      <SiteNavbar />

      <section className="container mx-auto px-4 py-8">
        <div className="max-w-4xl mx-auto">
          <h1 className="text-3xl font-bold tracking-tight text-center mb-2">Hubungi Kami</h1>
          <p className="text-center text-muted-foreground mb-8">Kami siap membantu Anda kapan saja.</p>

          {/* Quick Contacts */}
          <div className="grid md:grid-cols-2 gap-4 mb-8">
            <Card>
              <CardHeader>
                <CardTitle>📧 Email</CardTitle>
              </CardHeader>
              <CardContent className="text-muted-foreground">
                {loading ? (
                  <Skeleton className="h-5 w-48" />
                ) : (
                  <a href={`mailto:${settings?.supportEmail}`} className="text-primary underline">
                    {settings?.supportEmail}
                  </a>
                )}
              </CardContent>
            </Card>
            <Card>
              <CardHeader>
                <CardTitle>💬 WhatsApp</CardTitle>
              </CardHeader>
              <CardContent className="text-muted-foreground">
                {loading ? (
                  <Skeleton className="h-5 w-40" />
                ) : (
                  <a href={`https://wa.me/${settings?.supportWhatsApp}`} target="_blank" rel="noopener noreferrer" className="text-primary underline">
                    {settings?.supportWhatsApp}
                  </a>
                )}
              </CardContent>
            </Card>
          </div>

          {/* Contact Form */}
          <Card>
            <CardHeader>
              <CardTitle>Kirim Pesan</CardTitle>
            </CardHeader>
            <CardContent>
              <form className="grid md:grid-cols-2 gap-4">
                <div className="md:col-span-1">
                  <label className="text-sm font-medium">Nama</label>
                  <Input placeholder="Nama lengkap" />
                </div>
                <div className="md:col-span-1">
                  <label className="text-sm font-medium">Email</label>
                  <Input type="email" placeholder="email@example.com" />
                </div>
                <div className="md:col-span-1">
                  <label className="text-sm font-medium">No. WhatsApp</label>
                  <Input placeholder="08xxxxxxxxxx" />
                </div>
                <div className="md:col-span-1">
                  <label className="text-sm font-medium">Subjek</label>
                  <Input placeholder="Judul pesan" />
                </div>
                <div className="md:col-span-2">
                  <label className="text-sm font-medium">Pesan</label>
                  <textarea className="w-full border rounded-md p-3 min-h-[120px]" placeholder="Tulis pesan Anda..." />
                </div>
                <div className="md:col-span-2 flex justify-end gap-2">
                  <Button type="button" variant="outline" asChild>
                    <Link href="/products">← Lihat Produk</Link>
                  </Button>
                  <Button type="button">Kirim Pesan</Button>
                </div>
              </form>
            </CardContent>
          </Card>

          {/* About Section */}
          {settings?.aboutTitle && settings?.aboutDescription && (
            <Card className="mt-8">
              <CardHeader>
                <CardTitle>{settings.aboutTitle}</CardTitle>
              </CardHeader>
              <CardContent className="text-muted-foreground whitespace-pre-line">
                {settings.aboutDescription}
              </CardContent>
            </Card>
          )}
        </div>
      </section>

      <footer className="border-t">
        <div className="container mx-auto px-4 py-6 text-center text-sm text-muted-foreground">
          <div className="mb-2 font-medium">{settings?.storeName || "Store Saya"}</div>
          <div className="flex justify-center gap-2 flex-wrap">
            {settings?.storeLocation && <span>📍 {settings.storeLocation}</span>}
            {settings?.supportEmail && <span>• 📧 {settings.supportEmail}</span>}
            {settings?.supportWhatsApp && <span>• 💬 {settings.supportWhatsApp}</span>}
          </div>
        </div>
      </footer>
    </div>
  );
}
