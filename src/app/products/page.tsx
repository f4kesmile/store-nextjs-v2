"use client";

import { useEffect, useState, Suspense } from "react";
import { useSearchParams, useRouter } from "next/navigation";
import Link from "next/link";
import { PageLayout } from "@/components/layout/PageLayout";
import { HeroSection } from "@/components/ui/hero-section";
import { SectionHeader } from "@/components/ui/section-header";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { useCart } from "@/contexts/CartContext";
import { useSettings } from "@/contexts/SettingsContext";
import { useToast } from "@/components/ui/toast";
import { 
  ShoppingCart, 
  Package, 
  Star, 
  Filter,
  Search,
  Plus,
  Minus,
  X,
  CheckCircle,
  AlertCircle,
  ShoppingBag,
  Loader2
} from "lucide-react";
import { useResellerRef } from "@/hooks/useResellerRef";

// ... existing types remain

function ProductsContent() {
  const searchParams = useSearchParams();
  const router = useRouter();
  const { resellerRef } = useResellerRef();
  const { settings } = useSettings();
  const toast = useToast();
  
  const { addToCart, getCartCount } = useCart();

  const [products, setProducts] = useState<Product[]>([]);
  const [filteredProducts, setFilteredProducts] = useState<Product[]>([]);
  const [reseller, setReseller] = useState<Reseller | null>(null);
  const [selectedProduct, setSelectedProduct] = useState<Product | null>(null);
  const [quantity, setQuantity] = useState(1);
  const [selectedVariant, setSelectedVariant] = useState<Variant | null>(null);
  const [notes, setNotes] = useState("");
  const [searchTerm, setSearchTerm] = useState("");
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchProducts();
  }, []);

  useEffect(() => {
    async function validate() {
      if (resellerRef) {
        const r = await fetch(`/api/resellers/validate?ref=${resellerRef}`);
        if (r.ok) setReseller(await r.json());
      } else {
        setReseller(null);
      }
    }
    validate();
  }, [resellerRef]);

  useEffect(() => {
    const filtered = products.filter(product => 
      product.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      product.description.toLowerCase().includes(searchTerm.toLowerCase())
    );
    setFilteredProducts(filtered);
  }, [products, searchTerm]);

  const fetchProducts = async () => {
    try {
      setLoading(true);
      const res = await fetch("/api/products");
      const data = await res.json();
      setProducts(data);
      setFilteredProducts(data);
    } catch (error) {
      toast({ title: "Error", description: "Gagal memuat produk", variant: "destructive" });
    } finally { setLoading(false); }
  };

  const goToCart = () => {
    router.push(resellerRef ? `/cart?ref=${resellerRef}` : "/cart");
  };

  // ... the rest of file remains unchanged
}

export default function ProductsPage() {
  return (
    <Suspense fallback={
      <PageLayout>
        <div className="container py-12 sm:py-20">
          <div className="flex items-center justify-center min-h-96">
            <div className="flex flex-col items-center gap-4">
              <Loader2 className="w-6 h-6 sm:w-8 sm:h-8 animate-spin brand-primary" />
              <p className="text-base sm:text-lg font-semibold">Loading products...</p>
            </div>
          </div>
        </div>
      </PageLayout>
    }>
      <ProductsContent />
    </Suspense>
  );
}
