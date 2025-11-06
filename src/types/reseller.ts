export interface ResellerData {
  name: string;
  whatsapp: string;
  commission: number;
}

export interface ResellerContextType {
  lockedRef: string | null;
  currentRef: string | null;
  isLocked: boolean;
  lockRef: (ref: string) => void;
  resetReseller: () => void;
  getResellerWhatsApp: () => string;
  getResellerData: () => ResellerData | null;
}

export interface CartItem {
  id: string;
  name: string;
  price: number;
  quantity: number;
  image?: string;
  description?: string;
}

export interface CheckoutData {
  items: CartItem[];
  total: number;
  resellerRef?: string;
  resellerData?: ResellerData;
}