'use client';

import { useReseller } from '@/contexts/ResellerContext';
import { Button } from '@/components/ui/button';
import { RotateCcw } from 'lucide-react';

export function ResetResellerButton() {
  const { lockedRef, resetReseller } = useReseller();
  
  // Only show when there's a locked ref
  if (!lockedRef) return null;
  
  return (
    <Button 
      variant="outline" 
      size="sm" 
      onClick={resetReseller}
      className="flex items-center gap-2 text-red-600 border-red-300 hover:bg-red-50"
    >
      <RotateCcw className="h-4 w-4" />
      Reset Reseller
    </Button>
  );
}