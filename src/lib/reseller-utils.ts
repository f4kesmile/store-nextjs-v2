export interface ResellerData {
  name: string;
  whatsapp: string;
  commission: number;
}

export const RESELLER_DATA: Record<string, ResellerData> = {
  'RESELLER-A': {
    name: 'Reseller A',
    whatsapp: '6281234567890',
    commission: 10
  },
  'RESELLER-B': {
    name: 'Reseller B', 
    whatsapp: '6281234567891',
    commission: 15
  },
  'RESELLER-C': {
    name: 'Reseller C',
    whatsapp: '6281234567892', 
    commission: 12
  }
};

export function isValidResellerRef(ref: string): boolean {
  return !!RESELLER_DATA[ref];
}

export function getResellerFromRef(ref: string): ResellerData | null {
  return RESELLER_DATA[ref] || null;
}

export function generateWhatsAppLink(phone: string, message: string): string {
  const encodedMessage = encodeURIComponent(message);
  return `https://wa.me/${phone}?text=${encodedMessage}`;
}

export function buildCheckoutMessage(items: any[], total: number, resellerRef?: string): string {
  const itemsList = items.map(item => 
    `• ${item.name} (${item.quantity}x) - Rp ${item.price.toLocaleString()}`
  ).join('\n');
  
  const resellerInfo = resellerRef ? `\n\nSumber: ${resellerRef}` : '';
  
  return `Halo! Saya ingin memesan:\n\n${itemsList}\n\nTotal: Rp ${total.toLocaleString()}${resellerInfo}`;
}

export function getStoredResellerRef(): string | null {
  if (typeof window === 'undefined') return null;
  return localStorage.getItem('locked_reseller_ref');
}

export function storeResellerRef(ref: string): void {
  if (typeof window === 'undefined') return;
  localStorage.setItem('locked_reseller_ref', ref);
}

export function clearStoredResellerRef(): void {
  if (typeof window === 'undefined') return;
  localStorage.removeItem('locked_reseller_ref');
}