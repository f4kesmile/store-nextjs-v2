// src/app/layout.tsx
import type { Metadata } from "next";
import "./globals.css";
import { Providers } from "./providers";
import { CartProvider } from "@/contexts/CartContext";

export const metadata: Metadata = {
  title: "Store Saya - E-Commerce",
  description: "Toko online modern dengan sistem manajemen lengkap",
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="id">
      <body>
        <Providers>
          <CartProvider>{children}</CartProvider>
        </Providers>
      </body>
    </html>
  );
}
