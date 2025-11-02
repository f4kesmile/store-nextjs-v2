"use client";

import { useState } from "react";
import { PageLayout } from "@/components/layout/PageLayout";
import { HeroSection } from "@/components/ui/hero-section";
import { SectionHeader } from "@/components/ui/section-header";
import { FeatureCard } from "@/components/ui/feature-card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent } from "@/components/ui/Card";
import { useSettings } from "@/contexts/SettingsContext";
import { useToast } from "@/components/ui/toast";
import {
  Phone,
  Mail,
  MapPin,
  Clock,
  Send,
  CheckCircle,
  Loader2,
  MessageSquare,
  Users,
  Shield,
  Zap,
} from "lucide-react";

export default function ContactPage() {
  const { settings, loading: settingsLoading } = useSettings();
  const toast = useToast();
  const [formData, setFormData] = useState({
    name: "",
    email: "",
    subject: "",
    message: "",
  });
  const [submitting, setSubmitting] = useState(false);

  const handleInputChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>
  ) => {
    setFormData((prev) => ({
      ...prev,
      [e.target.name]: e.target.value,
    }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSubmitting(true);

    try {
      const response = await fetch("/api/contact", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(formData),
      });

      const result = await response.json();

      if (response.ok) {
        toast({
          title: "✅ Pesan berhasil dikirim!",
          description: "Kami akan membalas dalam 1-2 jam kerja",
          variant: "success",
        });

        setFormData({ name: "", email: "", subject: "", message: "" });
      } else {
        throw new Error(result.error || "Gagal mengirim pesan");
      }
    } catch (error: any) {
      toast({
        title: "Gagal mengirim pesan",
        description: error.message || "Silakan coba lagi",
        variant: "destructive",
      });
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <PageLayout>
      {/* Hero Section */}
      <HeroSection
        subtitle="Hubungi Kami"
        title="Mari Berkolaborasi"
        description="Kami siap membantu Anda dengan layanan terbaik. Hubungi tim customer service untuk konsultasi gratis"
        variant="gradient"
      />

      {/* Contact Methods */}
      <section className="py-12 sm:py-16 px-4">
        <div className="container">
          <SectionHeader
            title="Cara Menghubungi Kami"
            description="Pilih metode komunikasi yang paling nyaman untuk Anda"
            icon={<MessageSquare className="w-6 h-6" />}
            className="mb-8 sm:mb-12"
          />

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 sm:gap-6 lg:gap-8">
            {/* WhatsApp */}
            {settings.supportWhatsApp && (
              <FeatureCard
                icon={<Phone className="w-6 h-6 sm:w-8 sm:h-8" />}
                title="WhatsApp"
                description="Chat langsung dengan customer service kami untuk respon cepat"
                variant="gradient"
                className="border-green-200 bg-gradient-to-br from-green-50 to-emerald-50 hover:shadow-xl"
                action={
                  <Button
                    asChild
                    className="w-full bg-green-500 hover:bg-green-600 text-white font-semibold"
                  >
                    <a
                      href={`https://wa.me/${settings.supportWhatsApp.replace(
                        /[^0-9]/g,
                        ""
                      )}`}
                      target="_blank"
                      rel="noopener noreferrer"
                    >
                      <Phone className="w-4 h-4 mr-2" />
                      Chat Sekarang
                    </a>
                  </Button>
                }
              />
            )}

            {/* Email */}
            {settings.supportEmail && (
              <FeatureCard
                icon={<Mail className="w-6 h-6 sm:w-8 sm:h-8" />}
                title="Email"
                description="Kirim detail pertanyaan Anda melalui email untuk dokumentasi lengkap"
                variant="gradient"
                className="border-blue-200 bg-gradient-to-br from-blue-50 to-sky-50 hover:shadow-xl"
                action={
                  <Button
                    asChild
                    variant="outline"
                    className="w-full border-blue-500 text-blue-600 hover:bg-blue-50 font-semibold"
                  >
                    <a href={`mailto:${settings.supportEmail}`}>
                      <Mail className="w-4 h-4 mr-2" />
                      Kirim Email
                    </a>
                  </Button>
                }
              />
            )}

            {/* Location */}
            {settings.businessAddress && (
              <FeatureCard
                icon={<MapPin className="w-6 h-6 sm:w-8 sm:h-8" />}
                title="Alamat Kantor"
                description={settings.businessAddress}
                variant="gradient"
                className="border-purple-200 bg-gradient-to-br from-purple-50 to-indigo-50 hover:shadow-xl sm:col-span-2 lg:col-span-1"
              />
            )}
          </div>
        </div>
      </section>

      {/* Contact Form & Info */}
      <section className="py-12 sm:py-16 px-4 bg-gray-50">
        <div className="container">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 lg:gap-12">
            {/* Contact Form */}
            <div className="space-y-6 sm:space-y-8">
              <div className="space-y-2 sm:space-y-4">
                <h2 className="text-2xl sm:text-3xl font-bold text-gray-900">
                  Kirim Pesan
                </h2>
                <p className="text-sm sm:text-base text-gray-600">
                  Isi form di bawah ini dan kami akan merespons dalam 1-2 jam
                  kerja
                </p>
              </div>

              <Card className="shadow-xl">
                <CardContent className="p-4 sm:p-8">
                  <form
                    onSubmit={handleSubmit}
                    className="space-y-4 sm:space-y-6"
                  >
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                      <div className="space-y-2">
                        <Label htmlFor="name" className="text-sm font-medium">
                          Nama Lengkap *
                        </Label>
                        <Input
                          id="name"
                          name="name"
                          value={formData.name}
                          onChange={handleInputChange}
                          placeholder="Nama Anda"
                          required
                          disabled={submitting}
                          className="h-10 sm:h-11"
                        />
                      </div>
                      <div className="space-y-2">
                        <Label htmlFor="email" className="text-sm font-medium">
                          Email *
                        </Label>
                        <Input
                          id="email"
                          name="email"
                          type="email"
                          value={formData.email}
                          onChange={handleInputChange}
                          placeholder="email@example.com"
                          required
                          disabled={submitting}
                          className="h-10 sm:h-11"
                        />
                      </div>
                    </div>

                    <div className="space-y-2">
                      <Label htmlFor="subject" className="text-sm font-medium">
                        Subjek *
                      </Label>
                      <Input
                        id="subject"
                        name="subject"
                        value={formData.subject}
                        onChange={handleInputChange}
                        placeholder="Topik yang ingin dibahas"
                        required
                        disabled={submitting}
                        className="h-10 sm:h-11"
                      />
                    </div>

                    <div className="space-y-2">
                      <Label htmlFor="message" className="text-sm font-medium">
                        Pesan *
                      </Label>
                      <textarea
                        id="message"
                        name="message"
                        value={formData.message}
                        onChange={handleInputChange}
                        placeholder="Jelaskan pertanyaan atau kebutuhan Anda secara detail..."
                        required
                        disabled={submitting}
                        rows={5}
                        className="w-full px-3 py-2 text-sm border border-input rounded-md focus:outline-none focus:ring-2 focus:ring-ring focus:border-transparent disabled:opacity-50 resize-none"
                      />
                    </div>

                    <Button
                      type="submit"
                      disabled={submitting}
                      className="w-full bg-gradient-to-r from-brand-primary to-brand-secondary hover:opacity-90 text-sm sm:text-base py-3 sm:py-4 font-semibold"
                    >
                      {submitting ? (
                        <>
                          <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                          Mengirim...
                        </>
                      ) : (
                        <>
                          <Send className="w-4 h-4 mr-2" />
                          Kirim Pesan
                        </>
                      )}
                    </Button>
                  </form>
                </CardContent>
              </Card>
            </div>

            {/* Business Info */}
            <div className="space-y-6 sm:space-y-8">
              {/* Business Hours */}
              <Card className="shadow-lg">
                <CardContent className="p-4 sm:p-6 space-y-4">
                  <div className="flex items-center gap-3">
                    <Clock className="w-5 h-5 sm:w-6 sm:h-6 text-brand-primary" />
                    <h3 className="text-lg sm:text-xl font-semibold">
                      Jam Operasional
                    </h3>
                  </div>
                  <div className="space-y-2 text-sm sm:text-base">
                    <div className="flex justify-between">
                      <span className="text-gray-600">Senin - Jumat:</span>
                      <span className="font-semibold">09:00 - 18:00 WIB</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-gray-600">Sabtu:</span>
                      <span className="font-semibold">09:00 - 15:00 WIB</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-gray-600">Minggu:</span>
                      <span className="font-semibold text-red-500">Tutup</span>
                    </div>
                  </div>
                </CardContent>
              </Card>

              {/* Why Choose Us */}
              <Card className="shadow-lg">
                <CardContent className="p-4 sm:p-6 space-y-4">
                  <div className="flex items-center gap-3">
                    <Shield className="w-5 h-5 sm:w-6 sm:h-6 text-brand-primary" />
                    <h3 className="text-lg sm:text-xl font-semibold">
                      Mengapa Pilih Kami
                    </h3>
                  </div>
                  <div className="space-y-3">
                    {[
                      "Respon cepat dalam 1-2 jam kerja",
                      "Customer service berpengalaman",
                      "Produk digital berkualitas tinggi",
                      "Garansi uang kembali 100%",
                      "Support teknis 24/7 via WhatsApp",
                    ].map((benefit, index) => (
                      <div
                        key={index}
                        className="flex items-start gap-2 sm:gap-3"
                      >
                        <CheckCircle className="w-4 h-4 sm:w-5 sm:h-5 text-green-500 mt-0.5 flex-shrink-0" />
                        <span className="text-sm sm:text-base text-gray-700">
                          {benefit}
                        </span>
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>

              {/* Quick Stats */}
              <div className="grid grid-cols-2 gap-3 sm:gap-4">
                <Card className="text-center bg-gradient-to-br from-blue-50 to-blue-100 border-blue-200">
                  <CardContent className="p-3 sm:p-4">
                    <div className="text-xl sm:text-2xl font-bold text-blue-600">
                      1000+
                    </div>
                    <div className="text-xs sm:text-sm text-blue-700">
                      Customer Puas
                    </div>
                  </CardContent>
                </Card>
                <Card className="text-center bg-gradient-to-br from-green-50 to-green-100 border-green-200">
                  <CardContent className="p-3 sm:p-4">
                    <div className="text-xl sm:text-2xl font-bold text-green-600">
                      24/7
                    </div>
                    <div className="text-xs sm:text-sm text-green-700">
                      Support Ready
                    </div>
                  </CardContent>
                </Card>
              </div>
            </div>
          </div>
        </div>
      </section>
    </PageLayout>
  );
}
