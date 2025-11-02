import { type ClassValue, clsx } from "clsx"
import { twMerge } from "tailwind-merge"

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs))
}

// Price utilities
export function formatPrice(price: number | string): string {
  const numPrice = typeof price === 'string' ? parseFloat(price.replace(/[^0-9.]/g, '')) : price;
  return new Intl.NumberFormat('id-ID', {
    style: 'currency',
    currency: 'IDR',
    minimumFractionDigits: 0
  }).format(numPrice);
}

export function parsePrice(price: string | number): number {
  if (typeof price === 'number') return price;
  return parseFloat(price.replace(/[^0-9.]/g, '')) || 0;
}

// Text utilities
export function truncateText(text: string, maxLength: number): string {
  if (text.length <= maxLength) return text;
  return text.slice(0, maxLength) + '...';
}

// Date utilities
export function formatDate(date: string | Date): string {
  return new Intl.DateTimeFormat('id-ID', {
    day: 'numeric',
    month: 'long',
    year: 'numeric'
  }).format(new Date(date));
}

// URL utilities
export function createWhatsAppUrl(phoneNumber: string, message?: string): string {
  const cleanPhone = phoneNumber.replace(/[^0-9]/g, '');
  const url = `https://wa.me/${cleanPhone}`;
  return message ? `${url}?text=${encodeURIComponent(message)}` : url;
}