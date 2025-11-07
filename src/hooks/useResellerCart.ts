'use client';

import { useReseller } from '@/contexts/ResellerContext';
import { generateWhatsAppLink, buildCheckoutMessage } from '@/lib/reseller-utils';
import { CartItem } from '@/types/reseller';

export function useResellerCart() {
  // PERBAIKAN: Mengambil activeResellerData (properti) alih-alih getResellerData (fungsi)
  const { getResellerWhatsApp, lockedRef, activeResellerData } = useReseller(); 

  const processCheckout = (items: CartItem[]) => {
    const total = items.reduce((sum, item) => sum + (item.price * item.quantity), 0);
    const whatsappNumber = getResellerWhatsApp();
    
    // Pastikan kita mengirim uniqueId (lockedRef) ke API checkout
    const message = buildCheckoutMessage(items, total, lockedRef || undefined);
    
    const whatsappLink = generateWhatsAppLink(whatsappNumber, message);
    
    window.open(whatsappLink, '_blank');
  };

  const getActiveReseller = () => {
    // Menggunakan properti yang sudah ada
    return activeResellerData; 
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