// src/app/cart/page.tsx
"use client";

import { useEffect, useState, Suspense } from "react";
import { useCart } from "@/contexts/CartContext";
import { useRouter } from "next/navigation";
import Link from "next/link";

// ✅ COMPONENT UTAMA DIBUNGKUS DI SINI
function CartContent() {
  const {
    cart,
    removeFromCart,
    updateQuantity,
    updateNotes,
    clearCart,
    getCartTotal,
    getCartCount,
  } = useCart();

  const router = useRouter();
  const [loading, setLoading] = useState(false);

  const handleCheckoutAll = async () => {
    if (cart.length === 0) {
      alert("Keranjang kosong!");
      return;
    }

    setLoading(true);
    try {
      const settingsRes = await fetch("/api/settings");
      const settings = await settingsRes.json();

      let whatsappNumber = settings?.supportWhatsApp || "6285185031023";
      let sellerName = settings?.storeName || "Official Store";

      const promises = cart.map((item) =>
        fetch("/api/checkout", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            productId: item.productId,
            variantId: item.variantId || null,
            quantity: item.quantity,
            resellerId: null,
            notes: item.enableNotes !== false ? item.notes : undefined,
          }),
        })
      );

      await Promise.all(promises);

      const now = new Date();
      const orderDate = now.toLocaleDateString("id-ID", {
        weekday: "long",
        year: "numeric",
        month: "long",
        day: "numeric",
      });
      const orderTime = now.toLocaleTimeString("id-ID", {
        hour: "2-digit",
        minute: "2-digit",
        hour12: false,
      });

      let message = `Halo ${sellerName}! 👋\n\n`;
      message += `Pesanan Baru:\n`;
      message += `━━━━━━━━━━━━━━━━━━━━━\n`;
      message += `📅 Tanggal: ${orderDate}\n`;
      message += `⏰ Waktu: ${orderTime} WIB\n`;
      message += `━━━━━━━━━━━━━━━━━━━━━\n\n`;
      message += `Detail Pesanan:\n`;

      cart.forEach((item, idx) => {
        message += `\n${idx + 1}. ${item.productName}\n`;
        if (item.variantName && item.variantValue) {
          message += `   Varian: ${item.variantName}: ${item.variantValue}\n`;
        }
        message += `   Jumlah: ${item.quantity}x\n`;
        message += `   Subtotal: Rp ${(
          item.productPrice * item.quantity
        ).toLocaleString("id-ID")}\n`;
        if (item.enableNotes !== false && item.notes) {
          message += `   Catatan: ${item.notes}\n`;
        }
      });

      message += `\n━━━━━━━━━━━━━━━━━━━━━\n`;
      message += `💰 TOTAL: Rp ${getCartTotal().toLocaleString("id-ID")}\n`;
      message += `━━━━━━━━━━━━━━━━━━━━━\n\n`;
      message += `Mohon diproses ya. Terima kasih! 🙏`;

      const whatsappUrl = `https://wa.me/${whatsappNumber}?text=${encodeURIComponent(
        message
      )}`;

      window.open(whatsappUrl, "_blank");
      clearCart();

      setTimeout(() => {
        router.push("/products");
      }, 1000);
    } catch (error) {
      console.error("Checkout error:", error);
      alert("Gagal melakukan checkout");
    } finally {
      setLoading(false);
    }
  };

  if (cart.length === 0) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-purple-50 to-blue-50">
        <nav className="bg-white shadow-md">
          <div className="container mx-auto px-4 py-4 flex justify-between items-center">
            <Link href="/" className="text-2xl font-bold text-purple-600">
              Store Saya
            </Link>
            <Link href="/products" className="text-gray-700 hover:text-purple-600">
              ← Kembali Belanja
            </Link>
          </div>
        </nav>

        <div className="container mx-auto px-4 py-20 text-center">
          <div className="text-8xl mb-6">🛒</div>
          <h1 className="text-3xl font-bold text-gray-800 mb-4">
            Keranjang Kosong
          </h1>
          <p className="text-gray-600 mb-8">
            Belum ada produk di keranjang Anda
          </p>
          <Link
            href="/products"
            className="inline-block bg-purple-600 text-white px-8 py-3 rounded-lg text-lg hover:bg-purple-700"
          >
            Mulai Belanja
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-purple-50 to-blue-50">
      <nav className="bg-white shadow-md">
        <div className="container mx-auto px-4 py-4 flex justify-between items-center">
          <Link href="/" className="text-2xl font-bold text-purple-600">
            Store Saya
          </Link>
          <div className="flex items-center gap-4">
            <Link href="/products" className="text-gray-700 hover:text-purple-600">
              ← Kembali Belanja
            </Link>
            <div className="relative">
              <span className="absolute -top-2 -right-2 bg-red-500 text-white text-xs w-5 h-5 rounded-full flex items-center justify-center">
                {getCartCount()}
              </span>
              <span className="text-2xl">🛒</span>
            </div>
          </div>
        </div>
      </nav>

      <div className="container mx-auto px-4 py-12">
        <div className="flex items-center justify-between mb-8">
          <h1 className="text-3xl font-bold text-gray-800">
            Keranjang Belanja ({getCartCount()} item)
          </h1>
          <button
            onClick={() => {
              if (confirm("Hapus semua item dari keranjang?")) {
                clearCart();
              }
            }}
            className="px-4 py-2 bg-red-500 text-white rounded-lg hover:bg-red-600"
          >
            🗑️ Kosongkan Keranjang
          </button>
        </div>

        <div className="grid lg:grid-cols-3 gap-6">
          <div className="lg:col-span-2 space-y-4">
            {cart.map((item) => (
              <div
                key={`${item.productId}-${item.variantId || "no-variant"}`}
                className="bg-white rounded-xl shadow-lg p-6"
              >
                <div className="flex gap-4">
                  <img
                    src={item.productImage || "https://via.placeholder.com/100"}
                    alt={item.productName}
                    className="w-24 h-24 object-cover rounded-lg"
                  />

                  <div className="flex-1">
                    <h3 className="text-lg font-bold text-gray-800 mb-1">
                      {item.productName}
                    </h3>

                    {item.variantName && (
                      <p className="text-sm text-gray-600 mb-2">
                        {item.variantName}: {item.variantValue}
                      </p>
                    )}

                    <p className="text-xl font-bold text-purple-600 mb-3">
                      Rp {item.productPrice.toLocaleString("id-ID")} × {item.quantity}
                    </p>

                    <div className="flex items-center gap-3 mb-3">
                      <button
                        onClick={() =>
                          updateQuantity(
                            item.productId,
                            item.quantity - 1,
                            item.variantId
                          )
                        }
                        className="w-8 h-8 bg-gray-200 rounded hover:bg-gray-300"
                      >
                        −
                      </button>
                      <span className="font-bold">{item.quantity}</span>
                      <button
                        onClick={() =>
                          updateQuantity(
                            item.productId,
                            item.quantity + 1,
                            item.variantId
                          )
                        }
                        disabled={item.quantity >= item.maxStock}
                        className="w-8 h-8 bg-gray-200 rounded hover:bg-gray-300 disabled:opacity-50"
                      >
                        +
                      </button>
                      <span className="text-sm text-gray-500 ml-2">
                        (Max: {item.maxStock})
                      </span>
                    </div>

                    {item.enableNotes !== false && (
                      <div className="mb-3">
                        <input
                          type="text"
                          placeholder="Tambahkan catatan..."
                          value={item.notes || ""}
                          onChange={(e) =>
                            updateNotes(
                              item.productId,
                              e.target.value,
                              item.variantId
                            )
                          }
                          className="w-full border rounded-lg p-2 text-sm"
                        />
                      </div>
                    )}

                    <button
                      onClick={() =>
                        removeFromCart(item.productId, item.variantId)
                      }
                      className="text-red-500 text-sm hover:text-red-700"
                    >
                      🗑️ Hapus
                    </button>
                  </div>

                  <div className="text-right">
                    <p className="text-sm text-gray-600 mb-1">Subtotal</p>
                    <p className="text-xl font-bold text-gray-800">
                      Rp {(item.productPrice * item.quantity).toLocaleString("id-ID")}
                    </p>
                  </div>
                </div>
              </div>
            ))}
          </div>

          <div className="lg:col-span-1">
            <div className="bg-white rounded-xl shadow-lg p-6 sticky top-6">
              <h2 className="text-xl font-bold mb-4">Ringkasan Pesanan</h2>

              <div className="space-y-3 mb-4">
                <div className="flex justify-between">
                  <span className="text-gray-600">Total Item</span>
                  <span className="font-medium">{getCartCount()}</span>
                </div>
                <div className="flex justify-between text-xl font-bold">
                  <span>Total</span>
                  <span className="text-purple-600">
                    Rp {getCartTotal().toLocaleString("id-ID")}
                  </span>
                </div>
              </div>

              <button
                onClick={handleCheckoutAll}
                disabled={loading}
                className="w-full bg-green-500 text-white py-4 rounded-lg font-bold text-lg hover:bg-green-600 disabled:bg-gray-400 mb-3"
              >
                {loading ? "Processing..." : "💬 Checkout via WhatsApp"}
              </button>

              <Link href="/products" className="block w-full text-center bg-gray-200 text-gray-800 py-3 rounded-lg hover:bg-gray-300">
                Lanjut Belanja
              </Link>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

export default function CartPage() {
  return (
    <Suspense fallback={
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-purple-50 to-blue-50">
        <div className="text-center">
          <div className="text-6xl mb-4">🛒</div>
          <div className="text-xl font-bold text-gray-800">Loading Cart...</div>
        </div>
      </div>
    }>
      <CartContent />
    </Suspense>
  );
}