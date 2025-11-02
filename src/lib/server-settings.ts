import { prisma } from "./prisma";

export type ServerSettings = {
  storeName: string;
  storeDescription?: string;
  faviconUrl?: string;
  logoUrl?: string;
  primaryColor?: string;
  secondaryColor?: string;
  theme?: string;
};

export async function getServerSettings(): Promise<ServerSettings> {
  try {
    const settings = await prisma.siteSettings.findFirst();
    
    if (!settings) {
      return {
        storeName: "Store Saya",
        storeDescription: "Toko online modern dengan sistem manajemen lengkap",
        faviconUrl: "/favicon.ico",
        logoUrl: "",
        primaryColor: "#2563EB",
        secondaryColor: "#10B981",
        theme: "light"
      };
    }
    
    return {
      storeName: settings.storeName,
      storeDescription: settings.storeDescription || "",
      faviconUrl: settings.faviconUrl || "/favicon.ico",
      logoUrl: settings.logoUrl || "",
      primaryColor: settings.primaryColor || "#2563EB", 
      secondaryColor: settings.secondaryColor || "#10B981",
      theme: settings.theme || "light"
    };
  } catch (error) {
    return {
      storeName: "Store Saya",
      storeDescription: "Toko online modern",
      faviconUrl: "/favicon.ico"
    };
  }
}
