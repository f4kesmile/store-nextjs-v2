// src/app/products/page.tsx
"use client";

import { useEffect, useState, Suspense } from "react";
import { useSearchParams, useRouter } from "next/navigation";
import Link from "next/link";
import { useCart } from "@/contexts/CartContext";

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

// ✅ COMPONENT UTAMA DIBUNGKUS DI SINI
function ProductsContent() {
  const searchParams = useSearchParams();
  const router = useRouter();
  const resellerRef = searchParams.get("ref");

  const { addToCart, getCartCount } = useCart();

  const [products, setProducts] = useState<Product[]>([]);
  const [reseller, setReseller] = useState<Reseller | null>(null);
  const [selectedProduct, setSelectedProduct] = useState<Product | null>(null);
  const [quantity, setQuantity] = useState(1);
  const [selectedVariant, setSelectedVariant] = useState<Variant | null>(null);
  const [notes, setNotes] = useState("");

  useEffect(() => {
    fetchProducts();
    if (resellerRef) {
      fetchReseller(resellerRef);
    }
  }, [resellerRef]);

  const fetchProducts = async () => {
    const res = await fetch("/api/products");
    const data = await res.json();
    setProducts(data);
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

    alert("✅ Produk ditambahkan ke keranjang!");
    setSelectedProduct(null);
    setQuantity(1);
    setSelectedVariant(null);
    setNotes("");
  };

  const goToCart = () => {
    router.push(resellerRef ? `/cart?ref=${resellerRef}` : "/cart");
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-purple-50 to-blue-50">
      {/* Navbar */}
      <nav className="bg-white shadow-md sticky top-0 z-40">
        <div className="container mx-auto px-4 py-4 flex justify-between items-center">
          <Link href="/" className="text-2xl font-bold text-purple-600">
            Store Saya
          </Link>
          <div className="flex items-center space-x-4">
            <Link href="/" className="text-gray-700 hover:text-purple-600">
              Beranda
            </Link>
            <Link
              href="/products"
              className="text-gray-700 hover:text-purple-600 font-bold"
            >
              Produk
            </Link>
            <Link
              href="/contact"
              className="text-gray-700 hover:text-purple-600"
            >
              Kontak
            </Link>

            {/* Cart Icon */}
            <button
              onClick={goToCart}
              className="relative p-2 hover:bg-gray-100 rounded-lg transition-all"
            >
              {getCartCount() > 0 && (
                <span className="absolute -top-1 -right-1 bg-red-500 text-white text-xs w-5 h-5 rounded-full flex items-center justify-center font-bold">
                  {getCartCount()}
                </span>
              )}
              <span className="text-2xl">🛒</span>
            </button>
          </div>
        </div>
      </nav>

      {/* Reseller Banner */}
      {reseller && (
        <div className="bg-gradient-to-r from-green-500 to-green-600 text-white py-4 shadow-lg">
          <div className="container mx-auto px-4 text-center">
            <p className="text-lg font-bold">
              🎉 Anda membeli melalui reseller:{" "}
              <span className="text-yellow-300">{reseller.name}</span>
            </p>
            <p className="text-sm opacity-90">
              Pesanan Anda akan langsung diproses oleh reseller kami
            </p>
          </div>
        </div>
      )}

      {/* Products Grid */}
      <div className="container mx-auto px-4 py-12">
        <div className="flex justify-between items-center mb-12">
          <h1 className="text-4xl font-bold text-gray-800">Produk Kami</h1>

          {getCartCount() > 0 && (
            <button
              onClick={goToCart}
              className="bg-purple-600 text-white px-6 py-3 rounded-lg hover:bg-purple-700 font-bold flex items-center gap-2"
            >
              🛒 Lihat Keranjang ({getCartCount()})
            </button>
          )}
        </div>

        <div className="grid md:grid-cols-3 lg:grid-cols-4 gap-6">
          {products.map((product) => {
            const hasStock =
              product.stock > 0 || product.variants.some((v) => v.stock > 0);
            const isActive = product.status === "ACTIVE";

            return (
              <div
                key={product.id}
                className={`bg-white rounded-xl shadow-lg overflow-hidden hover:shadow-2xl transition-all duration-300 ${
                  !hasStock || !isActive ? "opacity-60" : ""
                }`}
              >
                <div
                  className="relative h-48 bg-gradient-to-br from-purple-400 to-blue-400 flex items-center justify-center cursor-pointer"
                  onClick={() =>
                    hasStock && isActive && openProductModal(product)
                  }
                >
                  {product.iconUrl ? (
                    <img
                      src={product.iconUrl}
                      alt={product.name}
                      className="h-32 w-32 object-contain"
                    />
                  ) : (
                    <div className="text-6xl">📦</div>
                  )}

                  {(!hasStock || !isActive) && (
                    <div className="absolute inset-0 bg-black bg-opacity-50 flex items-center justify-center">
                      <span className="text-white text-2xl font-bold transform -rotate-12">
                        SOLD OUT
                      </span>
                    </div>
                  )}
                </div>

                <div className="p-4">
                  <h3 className="text-xl font-bold mb-2 text-gray-800 line-clamp-1">
                    {product.name}
                  </h3>
                  <p className="text-gray-600 text-sm mb-3 line-clamp-2">
                    {product.description}
                  </p>

                  {product.variants.length > 0 && (
                    <div className="mb-3">
                      <p className="text-xs text-gray-500 mb-1">
                        {product.variants.length} varian tersedia
                      </p>
                      <div className="flex flex-wrap gap-1">
                        {product.variants.slice(0, 3).map((variant) => (
                          <span
                            key={variant.id}
                            className={`text-xs px-2 py-1 rounded ${
                              variant.stock > 0
                                ? "bg-green-100 text-green-700"
                                : "bg-gray-100 text-gray-500 line-through"
                            }`}
                          >
                            {variant.value}
                          </span>
                        ))}
                        {product.variants.length > 3 && (
                          <span className="text-xs px-2 py-1 bg-gray-100 text-gray-600 rounded">
                            +{product.variants.length - 3}
                          </span>
                        )}
                      </div>
                    </div>
                  )}

                  <div className="flex justify-between items-center mb-3">
                    <span className="text-2xl font-bold text-purple-600">
                      Rp {product.price.toLocaleString("id-ID")}
                    </span>
                    <span
                      className={`text-sm ${
                        hasStock ? "text-gray-500" : "text-red-500 font-bold"
                      }`}
                    >
                      {hasStock ? `Stok: ${product.stock}` : "Habis"}
                    </span>
                  </div>

                  {hasStock && isActive && (
                    <button
                      onClick={() => openProductModal(product)}
                      className="w-full bg-purple-600 text-white py-2 rounded-lg hover:bg-purple-700 font-medium"
                    >
                      + Tambah ke Keranjang
                    </button>
                  )}
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* Product Modal */}
      {selectedProduct && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-xl max-w-md w-full p-6 animate-slide-up max-h-[90vh] overflow-y-auto">
            <h2 className="text-2xl font-bold mb-4">{selectedProduct.name}</h2>

            {reseller && (
              <div className="bg-green-50 border border-green-200 rounded-lg p-3 mb-4">
                <p className="text-sm font-medium text-green-800">
                  ✅ Pesanan via:{" "}
                  <span className="font-bold">{reseller.name}</span>
                </p>
              </div>
            )}

            {/* Variant Selection */}
            {selectedProduct.variants.length > 0 && (
              <div className="mb-4">
                <label className="block text-sm font-medium mb-2">
                  Pilih Varian: <span className="text-red-500">*</span>
                </label>
                <div className="space-y-2">
                  {selectedProduct.variants.map((variant) => (
                    <label
                      key={variant.id}
                      className={`flex items-center justify-between p-3 border-2 rounded-lg cursor-pointer transition-all ${
                        selectedVariant?.id === variant.id
                          ? "border-purple-600 bg-purple-50"
                          : variant.stock > 0
                          ? "border-gray-200 hover:border-purple-300"
                          : "border-gray-200 opacity-50 cursor-not-allowed"
                      }`}
                    >
                      <div className="flex items-center gap-3">
                        <input
                          type="radio"
                          name="variant"
                          value={variant.id}
                          checked={selectedVariant?.id === variant.id}
                          onChange={() => handleVariantChange(variant.id)}
                          disabled={variant.stock === 0}
                          className="w-4 h-4"
                        />
                        <div>
                          <p className="font-medium">
                            {variant.name}: {variant.value}
                          </p>
                          <p
                            className={`text-xs ${
                              variant.stock > 0
                                ? "text-gray-600"
                                : "text-red-500"
                            }`}
                          >
                            {variant.stock > 0
                              ? `Stok: ${variant.stock}`
                              : "Sold Out"}
                          </p>
                        </div>
                      </div>
                      {selectedVariant?.id === variant.id && (
                        <span className="text-purple-600">✓</span>
                      )}
                    </label>
                  ))}
                </div>
              </div>
            )}

            {isOutOfStock() && (
              <div className="bg-red-50 border border-red-200 rounded-lg p-3 mb-4">
                <p className="text-sm font-medium text-red-800">
                  ⚠️ Stok tidak tersedia
                </p>
              </div>
            )}

            {!isOutOfStock() && (
              <>
                {/* Quantity */}
                <div className="mb-4">
                  <label className="block text-sm font-medium mb-2">
                    Jumlah:{" "}
                    <span className="text-xs text-gray-500">
                      (Tersedia: {getAvailableStock()})
                    </span>
                  </label>
                  <div className="flex items-center gap-3">
                    <button
                      onClick={() => setQuantity(Math.max(1, quantity - 1))}
                      className="w-10 h-10 bg-gray-200 rounded-lg hover:bg-gray-300 font-bold"
                    >
                      −
                    </button>
                    <input
                      type="number"
                      min="1"
                      max={getAvailableStock()}
                      value={quantity}
                      onChange={(e) => {
                        const val = parseInt(e.target.value) || 1;
                        setQuantity(
                          Math.min(Math.max(1, val), getAvailableStock())
                        );
                      }}
                      className="flex-1 border rounded-lg p-2 text-center font-bold text-lg"
                    />
                    <button
                      onClick={() =>
                        setQuantity(Math.min(getAvailableStock(), quantity + 1))
                      }
                      className="w-10 h-10 bg-gray-200 rounded-lg hover:bg-gray-300 font-bold"
                    >
                      +
                    </button>
                  </div>
                </div>

                {/* Notes Input */}
                {selectedProduct.enableNotes && (
                  <div className="mb-4">
                    <label className="block text-sm font-medium mb-2">
                      Catatan (Opsional)
                    </label>
                    <input
                      type="text"
                      value={notes}
                      onChange={(e) => setNotes(e.target.value)}
                      placeholder="Contoh: warna merah, ukuran L, dll..."
                      className="w-full border rounded-lg p-3"
                    />
                  </div>
                )}

                {/* Price Summary */}
                <div className="bg-gray-50 rounded-lg p-4 mb-4">
                  <div className="flex justify-between items-center">
                    <span className="font-bold text-lg">Total</span>
                    <span className="font-bold text-xl text-purple-600">
                      Rp{" "}
                      {(
                        Number(selectedProduct.price) * quantity
                      ).toLocaleString("id-ID")}
                    </span>
                  </div>
                </div>
              </>
            )}

            {/* Action Buttons */}
            <div className="flex gap-2">
              <button
                onClick={handleAddToCart}
                disabled={!canAddToCart()}
                className="flex-1 bg-purple-600 text-white py-3 rounded-lg font-bold hover:bg-purple-700 disabled:bg-gray-400 disabled:cursor-not-allowed"
              >
                {!canAddToCart()
                  ? selectedProduct.variants.length > 0 && !selectedVariant
                    ? "Pilih Varian Dulu"
                    : "Stok Tidak Cukup"
                  : "🛒 Tambah ke Keranjang"}
              </button>
              <button
                onClick={() => {
                  setSelectedProduct(null);
                  setSelectedVariant(null);
                  setQuantity(1);
                  setNotes("");
                }}
                className="px-4 bg-gray-300 rounded-lg hover:bg-gray-400"
              >
                Batal
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

// ✅ EXPORT DENGAN SUSPENSE
export default function ProductsPage() {
  return (
    <Suspense
      fallback={
        <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-purple-50 to-blue-50">
          <div className="text-center">
            <div className="text-6xl mb-4">🛒</div>
            <div className="text-xl font-bold text-gray-800">
              Loading Products...
            </div>
          </div>
        </div>
      }
    >
      <ProductsContent />
    </Suspense>
  );
}
