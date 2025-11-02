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

interface Variant {
  id: number;
  name: string;
  value: string;
  stock: number;
}

interface Product {
  id: number;
  name: string;
  description: string;
  iconUrl: string;
  price: number;
  stock: number;
  status: string;
  enableNotes: boolean;
  variants: Variant[];
}

interface Reseller {
  id: number;
  name: string;
  uniqueId: string;
  whatsappNumber: string;
}

function ProductsContent() {
  const searchParams = useSearchParams();
  const router = useRouter();
  const resellerRef = searchParams.get("ref");
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
    if (resellerRef) {
      fetchReseller(resellerRef);
    }
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
      toast({ 
        title: "Error", 
        description: "Gagal memuat produk",
        variant: "destructive" 
      });
    } finally {
      setLoading(false);
    }
  };

  const fetchReseller = async (refId: string) => {
    try {
      const res = await fetch(`/api/resellers/validate?ref=${refId}`);
      if (res.ok) {
        const data = await res.json();
        setReseller(data);
      }
    } catch (error) {
      console.error("Reseller tidak ditemukan");
    }
  };

  const openProductModal = (product: Product) => {
    setSelectedProduct(product);
    setQuantity(1);
    setSelectedVariant(null);
    setNotes("");
  };

  const getAvailableStock = () => {
    if (!selectedProduct) return 0;
    if (selectedVariant) return selectedVariant.stock;
    return selectedProduct.stock;
  };

  const isOutOfStock = () => {
    const stock = getAvailableStock();
    return stock === 0;
  };

  const canAddToCart = () => {
    if (!selectedProduct) return false;
    if (selectedProduct.variants.length > 0 && !selectedVariant) return false;
    const stock = getAvailableStock();
    return stock >= quantity && quantity > 0;
  };

  const handleVariantChange = (variantId: number) => {
    if (!selectedProduct) return;
    const variant = selectedProduct.variants.find((v) => v.id === variantId);
    setSelectedVariant(variant || null);
    setQuantity(1);
  };

  const handleAddToCart = () => {
    if (!selectedProduct || !canAddToCart()) return;

    addToCart({
      productId: selectedProduct.id,
      productName: selectedProduct.name,
      productPrice: selectedProduct.price,
      productImage: selectedProduct.iconUrl,
      variantId: selectedVariant?.id,
      variantName: selectedVariant?.name,
      variantValue: selectedVariant?.value,
      quantity,
      notes: selectedProduct.enableNotes ? notes : undefined,
      maxStock: getAvailableStock(),
      enableNotes: selectedProduct.enableNotes,
    });

    toast({ 
      title: "✅ Ditambahkan ke keranjang!", 
      description: `${selectedProduct.name} x${quantity}`,
      variant: "success" 
    });
    
    setSelectedProduct(null);
    setQuantity(1);
    setSelectedVariant(null);
    setNotes("");
  };

  const goToCart = () => {
    router.push(resellerRef ? `/cart?ref=${resellerRef}` : "/cart");
  };

  if (loading) {
    return (
      <PageLayout>
        <div className="container py-20">
          <div className="flex items-center justify-center min-h-96">
            <div className="flex flex-col items-center gap-4">
              <Loader2 className="w-8 h-8 animate-spin brand-primary" />
              <p className="text-lg font-semibold">Loading products...</p>
            </div>
          </div>
        </div>
      </PageLayout>
    );
  }

  return (
    <PageLayout>
      {/* Hero Section */}
      <HeroSection
        subtitle="Premium Collection"
        title="Jelajahi Produk Kami"
        description="Temukan berbagai produk digital berkualitas tinggi yang telah dipercaya ribuan customer"
        variant="gradient"
      />

      {/* Reseller Banner */}
      {reseller && (
        <section className="py-4 bg-gradient-to-r from-green-500 to-green-600 text-white">
          <div className="container">
            <div className="text-center space-y-2">
              <p className="text-lg font-bold flex items-center justify-center gap-2">
                <CheckCircle className="w-5 h-5" />
                Anda membeli melalui reseller: <span className="text-yellow-300">{reseller.name}</span>
              </p>
              <p className="text-sm opacity-90">
                Pesanan Anda akan langsung diproses oleh reseller kami
              </p>
            </div>
          </div>
        </section>
      )}

      {/* Search & Filter Section */}
      <section className="py-8 px-4 bg-gray-50">
        <div className="container">
          <div className="flex flex-col md:flex-row gap-4 items-center justify-between">
            <div className="flex-1 max-w-md">
              <div className="relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
                <Input
                  placeholder="Cari produk..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="pl-10 h-12"
                />
              </div>
            </div>
            
            {getCartCount() > 0 && (
              <Button 
                onClick={goToCart}
                className="bg-gradient-to-r from-brand-primary to-brand-secondary hover:opacity-90 shadow-lg"
                size="lg"
              >
                <ShoppingCart className="w-5 h-5 mr-2" />
                Keranjang ({getCartCount()})
              </Button>
            )}
          </div>
        </div>
      </section>

      {/* Products Grid */}
      <section className="py-16 px-4">
        <div className="container">
          <SectionHeader
            title="Katalog Produk"
            description={`Menampilkan ${filteredProducts.length} produk dari ${products.length} total produk`}
            icon={<Package className="w-6 h-6" />}
            className="mb-12"
          />
          
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-8">
            {filteredProducts.map((product) => {
              const hasStock = product.stock > 0 || product.variants.some((v) => v.stock > 0);
              const isActive = product.status === "ACTIVE";
              const canPurchase = hasStock && isActive;

              return (
                <Card key={product.id} className={`group overflow-hidden border-0 shadow-lg hover:shadow-2xl transition-all duration-300 ${
                  canPurchase ? "hover:-translate-y-2" : "opacity-60"
                }`}>
                  <div className="relative">
                    {/* Product Image */}
                    <div className="aspect-square bg-gradient-to-br from-gray-100 to-gray-200 flex items-center justify-center relative overflow-hidden">
                      {product.iconUrl ? (
                        <img
                          src={product.iconUrl}
                          alt={product.name}
                          className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                        />
                      ) : (
                        <Package className="w-20 h-20 text-gray-400" />
                      )}
                      
                      {!canPurchase && (
                        <div className="absolute inset-0 bg-black/50 flex items-center justify-center">
                          <div className="bg-red-500 text-white px-4 py-2 rounded-lg font-bold transform -rotate-12">
                            {!isActive ? "INACTIVE" : "SOLD OUT"}
                          </div>
                        </div>
                      )}
                      
                      {canPurchase && (
                        <div className="absolute top-4 right-4 opacity-0 group-hover:opacity-100 transition-opacity">
                          <Button
                            size="sm"
                            className="rounded-full shadow-lg"
                            onClick={() => openProductModal(product)}
                          >
                            <Plus className="w-4 h-4" />
                          </Button>
                        </div>
                      )}
                    </div>
                    
                    {/* Stock Status Badge */}
                    <div className="absolute top-4 left-4">
                      <Badge variant={hasStock ? "default" : "destructive"} className="shadow-sm">
                        {hasStock ? `Stok: ${product.stock}` : "Habis"}
                      </Badge>
                    </div>
                  </div>
                  
                  <CardContent className="p-6 space-y-4">
                    <div className="space-y-2">
                      <h3 className="text-lg font-bold text-gray-900 line-clamp-2 group-hover:text-brand-primary transition-colors">
                        {product.name}
                      </h3>
                      <p className="text-sm text-gray-600 line-clamp-3">
                        {product.description}
                      </p>
                    </div>
                    
                    {/* Variants Preview */}
                    {product.variants.length > 0 && (
                      <div className="space-y-2">
                        <p className="text-xs text-gray-500">
                          {product.variants.length} varian tersedia
                        </p>
                        <div className="flex flex-wrap gap-1">
                          {product.variants.slice(0, 3).map((variant) => (
                            <Badge
                              key={variant.id}
                              variant={variant.stock > 0 ? "secondary" : "outline"}
                              className={`text-xs ${
                                variant.stock === 0 ? "line-through opacity-50" : ""
                              }`}
                            >
                              {variant.value}
                            </Badge>
                          ))}
                          {product.variants.length > 3 && (
                            <Badge variant="outline" className="text-xs">
                              +{product.variants.length - 3}
                            </Badge>
                          )}
                        </div>
                      </div>
                    )}
                    
                    {/* Price */}
                    <div className="flex items-center justify-between">
                      <div className="text-2xl font-bold text-brand-primary">
                        Rp {product.price.toLocaleString("id-ID")}
                      </div>
                      <div className="flex items-center gap-1">
                        <Star className="w-4 h-4 fill-yellow-400 text-yellow-400" />
                        <span className="text-sm text-gray-600">4.8</span>
                      </div>
                    </div>
                    
                    {/* Action Button */}
                    <Button
                      onClick={() => canPurchase && openProductModal(product)}
                      disabled={!canPurchase}
                      className="w-full"
                      variant={canPurchase ? "default" : "secondary"}
                    >
                      {!canPurchase ? (
                        <>
                          <AlertCircle className="w-4 h-4 mr-2" />
                          Tidak Tersedia
                        </>
                      ) : (
                        <>
                          <ShoppingBag className="w-4 h-4 mr-2" />
                          Tambah ke Keranjang
                        </>
                      )}
                    </Button>
                  </CardContent>
                </Card>
              );
            })}
          </div>
          
          {filteredProducts.length === 0 && (
            <div className="text-center py-16">
              <Package className="w-20 h-20 text-gray-300 mx-auto mb-4" />
              <h3 className="text-xl font-semibold text-gray-600 mb-2">
                {searchTerm ? "Produk tidak ditemukan" : "Belum ada produk"}
              </h3>
              <p className="text-gray-500">
                {searchTerm 
                  ? "Coba kata kunci yang berbeda" 
                  : "Produk akan segera ditambahkan"}
              </p>
            </div>
          )}
        </div>
      </section>

      {/* Product Modal */}
      {selectedProduct && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4 backdrop-blur-sm">
          <Card className="w-full max-w-2xl max-h-[90vh] overflow-y-auto">
            <CardContent className="p-0">
              {/* Modal Header */}
              <div className="relative">
                <div className="aspect-video bg-gradient-to-br from-gray-100 to-gray-200 flex items-center justify-center">
                  {selectedProduct.iconUrl ? (
                    <img
                      src={selectedProduct.iconUrl}
                      alt={selectedProduct.name}
                      className="max-h-full max-w-full object-contain"
                    />
                  ) : (
                    <Package className="w-24 h-24 text-gray-400" />
                  )}
                </div>
                <Button
                  variant="secondary"
                  size="sm"
                  className="absolute top-4 right-4 rounded-full"
                  onClick={() => setSelectedProduct(null)}
                >
                  <X className="w-4 h-4" />
                </Button>
              </div>
              
              <div className="p-8 space-y-6">
                <div className="space-y-2">
                  <h2 className="text-2xl font-bold text-gray-900">{selectedProduct.name}</h2>
                  <p className="text-gray-600">{selectedProduct.description}</p>
                  <div className="text-3xl font-bold text-brand-primary">
                    Rp {selectedProduct.price.toLocaleString("id-ID")}
                  </div>
                </div>

                {/* Reseller Info */}
                {reseller && (
                  <div className="bg-green-50 border border-green-200 rounded-lg p-4">
                    <div className="flex items-center gap-2">
                      <CheckCircle className="w-5 h-5 text-green-600" />
                      <span className="font-medium text-green-800">
                        Pesanan via: <span className="font-bold">{reseller.name}</span>
                      </span>
                    </div>
                  </div>
                )}

                {/* Variant Selection */}
                {selectedProduct.variants.length > 0 && (
                  <div className="space-y-4">
                    <Label className="text-base font-medium">
                      Pilih Varian <span className="text-red-500">*</span>
                    </Label>
                    <div className="space-y-3">
                      {selectedProduct.variants.map((variant) => (
                        <div key={variant.id}>
                          <label className={`flex items-center justify-between p-4 border-2 rounded-lg cursor-pointer transition-all ${
                            selectedVariant?.id === variant.id
                              ? "border-brand-primary bg-brand-primary/5"
                              : variant.stock > 0
                              ? "border-gray-200 hover:border-brand-primary/50"
                              : "border-gray-200 opacity-50 cursor-not-allowed"
                          }`}>
                            <div className="flex items-center gap-3">
                              <input
                                type="radio"
                                name="variant"
                                value={variant.id}
                                checked={selectedVariant?.id === variant.id}
                                onChange={() => handleVariantChange(variant.id)}
                                disabled={variant.stock === 0}
                                className="w-4 h-4 text-brand-primary"
                              />
                              <div>
                                <p className="font-medium">
                                  {variant.name}: {variant.value}
                                </p>
                                <p className={`text-sm ${
                                  variant.stock > 0 ? "text-gray-600" : "text-red-500"
                                }`}>
                                  {variant.stock > 0 ? `Stok: ${variant.stock}` : "Sold Out"}
                                </p>
                              </div>
                            </div>
                            {selectedVariant?.id === variant.id && (
                              <CheckCircle className="w-5 h-5 text-brand-primary" />
                            )}
                          </label>
                        </div>
                      ))}
                    </div>
                  </div>
                )}

                {/* Out of Stock Warning */}
                {isOutOfStock() && (
                  <div className="bg-red-50 border border-red-200 rounded-lg p-4">
                    <div className="flex items-center gap-2">
                      <AlertCircle className="w-5 h-5 text-red-600" />
                      <span className="font-medium text-red-800">Stok tidak tersedia</span>
                    </div>
                  </div>
                )}

                {!isOutOfStock() && (
                  <>
                    {/* Quantity Selection */}
                    <div className="space-y-4">
                      <Label className="text-base font-medium">
                        Jumlah <span className="text-sm text-gray-500">(Tersedia: {getAvailableStock()})</span>
                      </Label>
                      <div className="flex items-center gap-4">
                        <Button
                          variant="outline"
                          size="icon"
                          onClick={() => setQuantity(Math.max(1, quantity - 1))}
                          disabled={quantity <= 1}
                        >
                          <Minus className="w-4 h-4" />
                        </Button>
                        <Input
                          type="number"
                          min="1"
                          max={getAvailableStock()}
                          value={quantity}
                          onChange={(e) => {
                            const val = parseInt(e.target.value) || 1;
                            setQuantity(Math.min(Math.max(1, val), getAvailableStock()));
                          }}
                          className="w-20 text-center text-lg font-bold"
                        />
                        <Button
                          variant="outline"
                          size="icon"
                          onClick={() => setQuantity(Math.min(getAvailableStock(), quantity + 1))}
                          disabled={quantity >= getAvailableStock()}
                        >
                          <Plus className="w-4 h-4" />
                        </Button>
                      </div>
                    </div>

                    {/* Notes Input */}
                    {selectedProduct.enableNotes && (
                      <div className="space-y-2">
                        <Label htmlFor="notes">Catatan (Opsional)</Label>
                        <Input
                          id="notes"
                          value={notes}
                          onChange={(e) => setNotes(e.target.value)}
                          placeholder="Contoh: warna merah, ukuran L, dll..."
                        />
                      </div>
                    )}

                    {/* Price Summary */}
                    <div className="bg-gray-50 rounded-lg p-6">
                      <div className="flex justify-between items-center">
                        <span className="text-lg font-medium">Total Harga:</span>
                        <span className="text-2xl font-bold text-brand-primary">
                          Rp {(Number(selectedProduct.price) * quantity).toLocaleString("id-ID")}
                        </span>
                      </div>
                    </div>
                  </>
                )}

                {/* Action Buttons */}
                <div className="flex gap-3 pt-4">
                  <Button
                    variant="outline"
                    onClick={() => setSelectedProduct(null)}
                    className="flex-1"
                  >
                    Batal
                  </Button>
                  <Button
                    onClick={handleAddToCart}
                    disabled={!canAddToCart()}
                    className="flex-1 bg-gradient-to-r from-brand-primary to-brand-secondary hover:opacity-90"
                  >
                    <ShoppingCart className="w-4 h-4 mr-2" />
                    {!canAddToCart()
                      ? selectedProduct.variants.length > 0 && !selectedVariant
                        ? "Pilih Varian Dulu"
                        : "Stok Tidak Cukup"
                      : "Tambah ke Keranjang"}
                  </Button>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
      )}
    </PageLayout>
  );
}

export default function ProductsPage() {
  return (
    <Suspense
      fallback={
        <PageLayout>
          <div className="container py-20">
            <div className="flex items-center justify-center min-h-96">
              <div className="flex flex-col items-center gap-4">
                <Loader2 className="w-8 h-8 animate-spin brand-primary" />
                <p className="text-lg font-semibold">Loading products...</p>
              </div>
            </div>
          </div>
        </PageLayout>
      }
    >
      <ProductsContent />
    </Suspense>
  );
}