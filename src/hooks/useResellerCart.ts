'use client';

import { useReseller } from '@/contexts/ResellerContext';
import { generateWhatsAppLink, buildCheckoutMessage } from '@/lib/reseller-utils';

export interface CartItem {
  id: string;
  name: string;
  price: number;
  quantity: number;
  image?: string;
}

export function useResellerCart() {
  const { getResellerWhatsApp, lockedRef, getResellerData } = useReseller();

  const processCheckout = (items: CartItem[]) => {
    const total = items.reduce((sum, item) => sum + (item.price * item.quantity), 0);
    const whatsappNumber = getResellerWhatsApp();
    const message = buildCheckoutMessage(items, total, lockedRef || undefined);
    
    const whatsappLink = generateWhatsAppLink(whatsappNumber, message);
    
    // Open WhatsApp in new tab
    window.open(whatsappLink, '_blank');
  };

  const getActiveReseller = () => {
    return getResellerData();
  };

  const isResellerActive = () => {
    return !!lockedRef;
  };

  return {
    processCheckout,
    getActiveReseller,
    isResellerActive,
    whatsappNumber: getResellerWhatsApp()
  };
}