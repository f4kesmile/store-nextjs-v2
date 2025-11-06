'use client';

import { useReseller } from '@/contexts/ResellerContext';
import { Badge } from '@/components/ui/badge';

export function ResellerBadge() {
  const { lockedRef, getResellerData } = useReseller();
  
  if (!lockedRef) return null;
  
  const resellerData = getResellerData();
  
  return (
    <Badge variant="secondary" className="bg-green-100 text-green-800 border-green-300">
      Via {resellerData?.name || lockedRef}
    </Badge>
  );
}