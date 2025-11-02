import { readFile, mkdir } from "fs/promises";
import path from "path";
import type { StoreSettings } from "@/contexts/SettingsContext";

const FILE_PATH = path.join(process.cwd(), "data", "settings.json");

export async function getServerSettings(): Promise<StoreSettings> {
  try {
    const raw = await readFile(FILE_PATH, "utf8");
    return JSON.parse(raw);
  } catch {
    // Return default settings if file doesn't exist
    const defaults: StoreSettings = {
      storeName: "Store Saya",
      storeDescription: "Toko online modern dengan sistem manajemen lengkap",
      supportWhatsApp: "",
      supportEmail: "",
      storeLocation: "",
      aboutTitle: "",
      aboutDescription: "",
      logoUrl: "",
      faviconUrl: "",
      primaryColor: "#2563EB",
      secondaryColor: "#10B981",
      theme: "light",
      locale: "id",
    };
    
    // Try to create the file with defaults
    try {
      await mkdir(path.dirname(FILE_PATH), { recursive: true });
      await require('fs/promises').writeFile(FILE_PATH, JSON.stringify(defaults, null, 2));
    } catch {
      // Ignore write errors
    }
    
    return defaults;
  }
}