'use client';

import React, { createContext, useContext, useEffect, useState } from 'react';
import { useSearchParams, useRouter } from 'next/navigation';

interface ResellerContextType {
  lockedRef: string | null;
  currentRef: string | null;
  isLocked: boolean;
  lockRef: (ref: string) => void;
  resetReseller: () => void;
  getResellerWhatsApp: () => string;
  getResellerData: () => ResellerData | null;
}

interface ResellerData {
  name: string;
  whatsapp: string;
  commission: number;
}

const RESELLER_DATA: Record<string, ResellerData> = {
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

const ResellerContext = createContext<ResellerContextType | undefined>(undefined);

const STORAGE_KEY = 'locked_reseller_ref';

export function ResellerProvider({ children }: { children: React.ReactNode }) {
  const [lockedRef, setLockedRef] = useState<string | null>(null);
  const [currentRef, setCurrentRef] = useState<string | null>(null);
  const searchParams = useSearchParams();
  const router = useRouter();

  // Load locked ref from localStorage on mount
  useEffect(() => {
    const stored = localStorage.getItem(STORAGE_KEY);
    if (stored) {
      setLockedRef(stored);
    }
  }, []);

  // Monitor URL params for ref
  useEffect(() => {
    const ref = searchParams.get('ref');
    if (ref && RESELLER_DATA[ref]) {
      setCurrentRef(ref);
      
      // Auto-lock if no ref is locked yet
      if (!lockedRef) {
        lockRef(ref);
      }
    } else {
      setCurrentRef(null);
    }
  }, [searchParams, lockedRef]);

  const lockRef = (ref: string) => {
    if (RESELLER_DATA[ref]) {
      setLockedRef(ref);
      localStorage.setItem(STORAGE_KEY, ref);
    }
  };

  const resetReseller = () => {
    setLockedRef(null);
    setCurrentRef(null);
    localStorage.removeItem(STORAGE_KEY);
    
    // Remove ref from URL without affecting cart
    const url = new URL(window.location.href);
    url.searchParams.delete('ref');
    router.replace(url.pathname + (url.search || ''));
  };

  const getResellerWhatsApp = () => {
    const ref = lockedRef || currentRef;
    return ref && RESELLER_DATA[ref] ? RESELLER_DATA[ref].whatsapp : process.env.NEXT_PUBLIC_DEFAULT_WHATSAPP || '6281234567890';
  };

  const getResellerData = () => {
    const ref = lockedRef || currentRef;
    return ref && RESELLER_DATA[ref] ? RESELLER_DATA[ref] : null;
  };

  return (
    <ResellerContext.Provider
      value={{
        lockedRef,
        currentRef,
        isLocked: !!lockedRef,
        lockRef,
        resetReseller,
        getResellerWhatsApp,
        getResellerData
      }}
    >
      {children}
    </ResellerContext.Provider>
  );
}

export function useReseller() {
  const context = useContext(ResellerContext);
  if (context === undefined) {
    throw new Error('useReseller must be used within a ResellerProvider');
  }
  return context;
}