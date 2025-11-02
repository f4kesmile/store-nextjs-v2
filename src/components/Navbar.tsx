// src/components/Navbar.tsx
"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";

export function Navbar() {
  const pathname = usePathname();

  const links = [
    { href: "/", label: "Beranda" },
    { href: "/products", label: "Produk" },
    { href: "/contact", label: "Kontak" },
  ];

  return (
    <nav className="bg-white shadow-md sticky top-0 z-40">
      <div className="container mx-auto px-4 py-4 flex justify-between items-center">
        <Link href="/" className="text-2xl font-bold text-purple-600">
          Store Saya
        </Link>
        <div className="flex items-center space-x-4">
          {links.map((link) => (
            <Link
              key={link.href}
              href={link.href}
              className={`text-gray-700 hover:text-purple-600 transition-colors ${
                pathname === link.href ? "text-purple-600 font-bold" : ""
              }`}
            >
              {link.label}
            </Link>
          ))}
          <Link
            href="/login"
            className="bg-purple-600 text-white px-4 py-2 rounded-lg hover:bg-purple-700 transition-colors"
          >
            Login Admin
          </Link>
        </div>
      </div>
    </nav>
  );
}
