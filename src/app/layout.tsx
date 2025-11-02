import type { Metadata } from "next";
import "./globals.css";
import { Providers } from "./providers";
import { CartProvider } from "@/contexts/CartContext";
import { ThemeProvider } from "@/components/theme-provider";

export const metadata: Metadata = {
  title: "Store Saya - E-Commerce",
  description: "Toko online modern dengan sistem manajemen lengkap",
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="id">
      <body>
        <ThemeProvider>
          <Providers>
            <CartProvider>{children}</CartProvider>
          </Providers>
        </ThemeProvider>
      </body>
    </html>
  );
}
