"use client";

import Link from "next/link";
import { PageLayout } from "@/components/layout/PageLayout";
import { HeroSection } from "@/components/ui/hero-section";
import { FeatureCard } from "@/components/ui/feature-card";
import { SectionHeader } from "@/components/ui/section-header";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { useSettings } from "@/contexts/SettingsContext";
import { 
  ShoppingBag, 
  Shield, 
  Zap, 
  Heart, 
  Star, 
  Users, 
  Phone, 
  Mail, 
  ArrowRight,
  Sparkles,
  Crown,
  Gift
} from "lucide-react";

export default function HomePage() {
  const { settings } = useSettings();

  return (
    <PageLayout>
      {/* Hero Section */}
      <HeroSection
        subtitle="Premium Digital Store"
        title={`Welcome to ${settings.storeName}`}
        description={settings.storeDescription || "Platform digital terpercaya untuk semua kebutuhan produk premium dan layanan terbaik."}
        actions={
          <>
            <Button 
              size="lg" 
              className="px-8 py-4 text-lg font-semibold shadow-lg hover:shadow-xl transition-all duration-300 bg-gradient-to-r from-brand-primary to-brand-secondary hover:opacity-90"
              asChild
            >
              <Link href="/products">
                <ShoppingBag className="w-5 h-5 mr-2" />
                Belanja Sekarang
                <ArrowRight className="w-5 h-5 ml-2" />
              </Link>
            </Button>
            <Button 
              variant="outline" 
              size="lg" 
              className="px-8 py-4 text-lg font-semibold border-2 hover:bg-white/90 backdrop-blur-sm"
              asChild
            >
              <Link href="/contact">
                <Phone className="w-5 h-5 mr-2" />
                Hubungi Kami
              </Link>
            </Button>
          </>
        }
      />

      {/* Features Section */}
      <section className="py-20 px-4">
        <div className="container">
          <SectionHeader
            title="Mengapa Memilih Kami?"
            description="Komitmen kami untuk memberikan pengalaman terbaik dalam setiap transaksi"
            icon={<Crown className="w-6 h-6" />}
            centered
            className="mb-16"
          />
          
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            <FeatureCard
              icon={<Zap className="text-brand-primary" />}
              title="Cepat & Aman"
              description="Transaksi instan dengan sistem keamanan berlapis untuk melindungi data Anda"
              variant="gradient"
            />
            <FeatureCard
              icon={<Sparkles className="text-brand-secondary" />}
              title="Produk Premium"
              description="Koleksi eksklusif produk digital berkualitas tinggi yang telah terpercaya"
              variant="gradient"
            />
            <FeatureCard
              icon={<Heart className="text-red-500" />}
              title="Support 24/7"
              description="Tim customer service profesional siap membantu Anda kapan saja dibutuhkan"
              variant="gradient"
            />
          </div>
        </div>
      </section>

      {/* Stats Section */}
      <section className="py-16 px-4 bg-gradient-to-r from-gray-50 to-gray-100">
        <div className="container">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-8 text-center">
            <div className="space-y-2">
              <div className="text-4xl font-bold text-brand-primary">10K+</div>
              <div className="text-gray-600 font-medium">Happy Customers</div>
            </div>
            <div className="space-y-2">
              <div className="text-4xl font-bold text-brand-secondary">500+</div>
              <div className="text-gray-600 font-medium">Products</div>
            </div>
            <div className="space-y-2">
              <div className="text-4xl font-bold text-brand-primary">99.9%</div>
              <div className="text-gray-600 font-medium">Uptime</div>
            </div>
            <div className="space-y-2">
              <div className="text-4xl font-bold text-brand-secondary">24/7</div>
              <div className="text-gray-600 font-medium">Support</div>
            </div>
          </div>
        </div>
      </section>

      {/* About Section with CTA */}
      {settings?.aboutTitle && settings?.aboutDescription && (
        <section className="py-20 px-4">
          <div className="container">
            <Card className="relative overflow-hidden border-0 shadow-2xl">
              <div 
                className="absolute inset-0"
                style={{
                  background: `linear-gradient(135deg, ${settings.primaryColor}, ${settings.secondaryColor})`
                }}
              />
              <div className="absolute inset-0 bg-black/20" />
              
              <CardContent className="relative z-10 py-16 px-8 text-center text-white">
                <div className="max-w-4xl mx-auto space-y-8">
                  <div className="space-y-4">
                    <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-white/20 backdrop-blur-sm text-sm font-medium">
                      <Gift className="w-4 h-4" />
                      About Us
                    </div>
                    <h2 className="text-4xl md:text-5xl font-bold">{settings.aboutTitle}</h2>
                    <p className="text-xl text-white/90 leading-relaxed whitespace-pre-line">
                      {settings.aboutDescription}
                    </p>
                  </div>

                  <div className="flex flex-col sm:flex-row gap-4 justify-center">
                    {settings.supportWhatsApp && (
                      <Button
                        size="lg"
                        className="bg-green-600 hover:bg-green-700 border-0 shadow-lg"
                        asChild
                      >
                        <a
                          href={`https://wa.me/${settings.supportWhatsApp.replace(/[^0-9]/g, '')}`}
                          target="_blank"
                          rel="noopener noreferrer"
                        >
                          <Phone className="w-5 h-5 mr-2" />
                          Chat WhatsApp
                        </a>
                      </Button>
                    )}
                    {settings.supportEmail && (
                      <Button
                        variant="outline"
                        size="lg"
                        className="bg-white/10 border-white/30 text-white hover:bg-white/20 backdrop-blur-sm"
                        asChild
                      >
                        <a href={`mailto:${settings.supportEmail}`}>
                          <Mail className="w-5 h-5 mr-2" />
                          Kirim Email
                        </a>
                      </Button>
                    )}
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        </section>
      )}

      {/* Testimonials Section */}
      <section className="py-20 px-4 bg-gray-50">
        <div className="container">
          <SectionHeader
            title="Apa Kata Mereka?"
            description="Pengalaman nyata dari customers yang telah mempercayai layanan kami"
            icon={<Users className="w-6 h-6" />}
            centered
            className="mb-16"
          />
          
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            {[
              {
                name: "Sarah Johnson",
                role: "Digital Marketer",
                content: "Pelayanan yang sangat memuaskan! Produk berkualitas tinggi dan support yang responsif.",
                rating: 5
              },
              {
                name: "Ahmad Rizki",
                role: "Business Owner", 
                content: "Sudah bertahun-tahun menggunakan layanan ini. Selalu konsisten dengan kualitas terbaiknya.",
                rating: 5
              },
              {
                name: "Lisa Wong",
                role: "Content Creator",
                content: "Proses yang mudah dan cepat. Sangat direkomendasikan untuk kebutuhan digital!",
                rating: 5
              }
            ].map((testimonial, index) => (
              <Card key={index} className="bg-white shadow-lg border-0 hover:shadow-xl transition-shadow duration-300">
                <CardContent className="p-6 space-y-4">
                  <div className="flex gap-1">
                    {[...Array(testimonial.rating)].map((_, i) => (
                      <Star key={i} className="w-5 h-5 fill-yellow-400 text-yellow-400" />
                    ))}
                  </div>
                  <p className="text-gray-600 leading-relaxed italic">
                    "{testimonial.content}"
                  </p>
                  <div className="pt-4 border-t">
                    <div className="font-semibold text-gray-900">{testimonial.name}</div>
                    <div className="text-sm text-gray-500">{testimonial.role}</div>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      </section>

      {/* Final CTA */}
      <section className="py-20 px-4">
        <div className="container">
          <div className="text-center space-y-8">
            <div className="space-y-4">
              <h2 className="text-4xl md:text-5xl font-bold text-gray-900">
                Siap Memulai?
              </h2>
              <p className="text-xl text-gray-600 max-w-2xl mx-auto">
                Bergabunglah dengan ribuan customer yang telah mempercayai layanan kami
              </p>
            </div>
            
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <Button 
                size="lg" 
                className="px-8 py-4 text-lg font-semibold shadow-lg hover:shadow-xl transition-all duration-300 bg-gradient-to-r from-brand-primary to-brand-secondary"
                asChild
              >
                <Link href="/products">
                  <ShoppingBag className="w-5 h-5 mr-2" />
                  Mulai Belanja
                </Link>
              </Button>
              <Button 
                variant="outline" 
                size="lg" 
                className="px-8 py-4 text-lg font-semibold border-2"
                asChild
              >
                <Link href="/contact">
                  <Phone className="w-5 h-5 mr-2" />
                  Konsultasi Gratis
                </Link>
              </Button>
            </div>
          </div>
        </div>
      </section>
    </PageLayout>
  );
}