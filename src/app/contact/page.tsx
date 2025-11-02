"use client";

import { useState } from "react";
import { PageLayout } from "@/components/layout/PageLayout";
import { HeroSection } from "@/components/ui/hero-section";
import { SectionHeader } from "@/components/ui/section-header";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent } from "@/components/ui/card";
import { useSettings } from "@/contexts/SettingsContext";
import { useToast } from "@/components/ui/toast";
import { 
  Mail, 
  Phone, 
  MapPin, 
  MessageCircle, 
  Send, 
  Clock,
  Users,
  Headphones,
  CheckCircle
} from "lucide-react";

export default function ContactPage() {
  const { settings } = useSettings();
  const toast = useToast();
  const [formData, setFormData] = useState({
    name: "",
    email: "",
    subject: "",
    message: ""
  });
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);
    
    try {
      const response = await fetch('/api/contact', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(formData),
      });
      
      if (response.ok) {
        toast({ 
          title: "Pesan terkirim!", 
          description: "Terima kasih, kami akan merespons segera.",
          variant: "success" 
        });
        setFormData({ name: "", email: "", subject: "", message: "" });
      } else {
        throw new Error('Failed to send message');
      }
    } catch (error) {
      toast({ 
        title: "Gagal mengirim", 
        description: "Silakan coba lagi atau hubungi kami langsung.",
        variant: "destructive" 
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    setFormData(prev => ({
      ...prev,
      [e.target.name]: e.target.value
    }));
  };

  return (
    <PageLayout>
      {/* Hero Section */}
      <HeroSection
        subtitle="Get in Touch"
        title="Hubungi Kami"
        description="Kami siap membantu Anda kapan saja. Tim customer service profesional kami akan merespons dengan cepat."
        variant="minimal"
      />

      {/* Contact Methods */}
      <section className="py-20 px-4 bg-gray-50">
        <div className="container">
          <SectionHeader
            title="Cara Menghubungi Kami"
            description="Pilih metode yang paling nyaman untuk Anda"
            icon={<MessageCircle className="w-6 h-6" />}
            centered
            className="mb-16"
          />
          
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8 mb-12">
            {/* WhatsApp */}
            {settings.supportWhatsApp && (
              <Card className="group hover:shadow-xl transition-all duration-300 hover:-translate-y-2 border-0 bg-gradient-to-br from-green-50 to-green-100">
                <CardContent className="p-8 text-center space-y-4">
                  <div className="w-16 h-16 mx-auto rounded-2xl bg-green-500 grid place-items-center group-hover:scale-110 transition-transform duration-300">
                    <Phone className="w-8 h-8 text-white" />
                  </div>
                  <div className="space-y-2">
                    <h3 className="text-xl font-bold text-gray-900">WhatsApp</h3>
                    <p className="text-gray-600">Chat langsung untuk respon cepat</p>
                    <p className="text-green-600 font-semibold">{settings.supportWhatsApp}</p>
                  </div>
                  <Button 
                    className="w-full bg-green-500 hover:bg-green-600 text-white" 
                    asChild
                  >
                    <a
                      href={`https://wa.me/${settings.supportWhatsApp.replace(/[^0-9]/g, '')}`}
                      target="_blank"
                      rel="noopener noreferrer"
                    >
                      <MessageCircle className="w-4 h-4 mr-2" />
                      Chat Sekarang
                    </a>
                  </Button>
                </CardContent>
              </Card>
            )}

            {/* Email */}
            {settings.supportEmail && (
              <Card className="group hover:shadow-xl transition-all duration-300 hover:-translate-y-2 border-0 bg-gradient-to-br from-blue-50 to-blue-100">
                <CardContent className="p-8 text-center space-y-4">
                  <div className="w-16 h-16 mx-auto rounded-2xl bg-blue-500 grid place-items-center group-hover:scale-110 transition-transform duration-300">
                    <Mail className="w-8 h-8 text-white" />
                  </div>
                  <div className="space-y-2">
                    <h3 className="text-xl font-bold text-gray-900">Email</h3>
                    <p className="text-gray-600">Untuk pertanyaan detail</p>
                    <p className="text-blue-600 font-semibold text-sm">{settings.supportEmail}</p>
                  </div>
                  <Button 
                    variant="outline" 
                    className="w-full border-blue-500 text-blue-600 hover:bg-blue-50" 
                    asChild
                  >
                    <a href={`mailto:${settings.supportEmail}`}>
                      <Mail className="w-4 h-4 mr-2" />
                      Kirim Email
                    </a>
                  </Button>
                </CardContent>
              </Card>
            )}

            {/* Location */}
            {settings.storeLocation && (
              <Card className="group hover:shadow-xl transition-all duration-300 hover:-translate-y-2 border-0 bg-gradient-to-br from-purple-50 to-purple-100">
                <CardContent className="p-8 text-center space-y-4">
                  <div className="w-16 h-16 mx-auto rounded-2xl bg-purple-500 grid place-items-center group-hover:scale-110 transition-transform duration-300">
                    <MapPin className="w-8 h-8 text-white" />
                  </div>
                  <div className="space-y-2">
                    <h3 className="text-xl font-bold text-gray-900">Lokasi</h3>
                    <p className="text-gray-600">Kantor pusat kami</p>
                    <p className="text-purple-600 font-semibold text-sm">{settings.storeLocation}</p>
                  </div>
                  <Button 
                    variant="outline" 
                    className="w-full border-purple-500 text-purple-600 hover:bg-purple-50"
                  >
                    <MapPin className="w-4 h-4 mr-2" />
                    Lihat Maps
                  </Button>
                </CardContent>
              </Card>
            )}
          </div>
        </div>
      </section>

      {/* Contact Form & Business Hours */}
      <section className="py-20 px-4">
        <div className="container">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-12">
            {/* Contact Form */}
            <Card className="shadow-xl border-0">
              <CardContent className="p-8">
                <div className="space-y-6">
                  <div className="space-y-2">
                    <h3 className="text-2xl font-bold text-gray-900">Kirim Pesan</h3>
                    <p className="text-gray-600">Isi form di bawah ini dan kami akan merespons dalam 24 jam</p>
                  </div>

                  <form onSubmit={handleSubmit} className="space-y-6">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <div className="space-y-2">
                        <Label htmlFor="name">Nama Lengkap</Label>
                        <Input
                          id="name"
                          name="name"
                          value={formData.name}
                          onChange={handleInputChange}
                          placeholder="Masukkan nama Anda"
                          required
                          disabled={isSubmitting}
                        />
                      </div>
                      <div className="space-y-2">
                        <Label htmlFor="email">Email</Label>
                        <Input
                          id="email"
                          name="email"
                          type="email"
                          value={formData.email}
                          onChange={handleInputChange}
                          placeholder="email@example.com"
                          required
                          disabled={isSubmitting}
                        />
                      </div>
                    </div>
                    
                    <div className="space-y-2">
                      <Label htmlFor="subject">Subject</Label>
                      <Input
                        id="subject"
                        name="subject"
                        value={formData.subject}
                        onChange={handleInputChange}
                        placeholder="Topik pertanyaan Anda"
                        required
                        disabled={isSubmitting}
                      />
                    </div>
                    
                    <div className="space-y-2">
                      <Label htmlFor="message">Pesan</Label>
                      <textarea
                        id="message"
                        name="message"
                        value={formData.message}
                        onChange={handleInputChange}
                        placeholder="Tuliskan pesan Anda di sini..."
                        required
                        disabled={isSubmitting}
                        rows={6}
                        className="w-full px-3 py-2 border border-input rounded-md focus:outline-none focus:ring-2 focus:ring-ring focus:border-transparent disabled:opacity-50"
                      />
                    </div>
                    
                    <Button 
                      type="submit" 
                      className="w-full bg-gradient-to-r from-brand-primary to-brand-secondary hover:opacity-90" 
                      disabled={isSubmitting}
                    >
                      {isSubmitting ? (
                        <>
                          <Clock className="w-4 h-4 mr-2 animate-spin" />
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
                </div>
              </CardContent>
            </Card>

            {/* Business Hours & Additional Info */}
            <div className="space-y-8">
              {/* Business Hours */}
              <Card className="shadow-xl border-0">
                <CardContent className="p-8">
                  <div className="space-y-6">
                    <div className="flex items-center gap-3">
                      <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-brand-primary to-brand-secondary grid place-items-center">
                        <Clock className="w-6 h-6 text-white" />
                      </div>
                      <div>
                        <h3 className="text-xl font-bold text-gray-900">Jam Operasional</h3>
                        <p className="text-gray-600">Waktu respons customer service</p>
                      </div>
                    </div>

                    <div className="space-y-3">
                      <div className="flex justify-between items-center py-2 border-b border-gray-100">
                        <span className="text-gray-700">Senin - Jumat</span>
                        <span className="font-semibold text-green-600">09:00 - 18:00 WIB</span>
                      </div>
                      <div className="flex justify-between items-center py-2 border-b border-gray-100">
                        <span className="text-gray-700">Sabtu</span>
                        <span className="font-semibold text-green-600">09:00 - 15:00 WIB</span>
                      </div>
                      <div className="flex justify-between items-center py-2">
                        <span className="text-gray-700">Minggu</span>
                        <span className="font-semibold text-red-600">Tutup</span>
                      </div>
                    </div>

                    <div className="bg-blue-50 p-4 rounded-lg">
                      <div className="flex items-start gap-3">
                        <Headphones className="w-5 h-5 text-blue-600 mt-0.5" />
                        <div className="text-sm">
                          <p className="font-semibold text-blue-900">Support 24/7</p>
                          <p className="text-blue-700">WhatsApp tersedia kapan saja untuk urgent matters</p>
                        </div>
                      </div>
                    </div>
                  </div>
                </CardContent>
              </Card>

              {/* Why Choose Us */}
              <Card className="shadow-xl border-0">
                <CardContent className="p-8">
                  <div className="space-y-6">
                    <div className="flex items-center gap-3">
                      <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-green-400 to-green-600 grid place-items-center">
                        <Users className="w-6 h-6 text-white" />
                      </div>
                      <div>
                        <h3 className="text-xl font-bold text-gray-900">Mengapa Pilih Kami?</h3>
                        <p className="text-gray-600">Komitmen layanan terbaik</p>
                      </div>
                    </div>

                    <div className="space-y-4">
                      {[
                        "Respons cepat dalam 1-2 jam",
                        "Tim support berpengalaman", 
                        "Solusi tepat untuk setiap kebutuhan",
                        "Layanan after-sales terjamin"
                      ].map((item, index) => (
                        <div key={index} className="flex items-center gap-3">
                          <CheckCircle className="w-5 h-5 text-green-500 flex-shrink-0" />
                          <span className="text-gray-700">{item}</span>
                        </div>
                      ))}
                    </div>
                  </div>
                </CardContent>
              </Card>
            </div>
          </div>
        </div>
      </section>
    </PageLayout>
  );
}