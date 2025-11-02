// src/components/ProductCard.tsx
import React from "react";
import Image from "next/image";

interface ProductCardProps {
  product: {
    id: number;
    name: string;
    description: string;
    price: number;
    iconUrl: string;
    stock: number;
  };
  onClick?: () => void;
}

export function ProductCard({ product, onClick }: ProductCardProps) {
  return (
    <div
      onClick={onClick}
      className="bg-white rounded-xl shadow-lg overflow-hidden hover:shadow-2xl transform hover:scale-105 transition-all duration-300 cursor-pointer"
    >
      <div className="h-48 bg-gradient-to-br from-purple-400 to-blue-400 flex items-center justify-center">
        {product.iconUrl ? (
          <img
            src={product.iconUrl}
            alt={product.name}
            className="h-32 w-32 object-contain"
          />
        ) : (
          <div className="text-6xl">📦</div>
        )}
      </div>
      <div className="p-4">
        <h3 className="text-xl font-bold mb-2 text-gray-800 line-clamp-1">
          {product.name}
        </h3>
        <p className="text-gray-600 text-sm mb-3 line-clamp-2">
          {product.description}
        </p>
        <div className="flex justify-between items-center">
          <span className="text-2xl font-bold text-purple-600">
            Rp {product.price.toLocaleString("id-ID")}
          </span>
          <span className="text-sm text-gray-500">Stok: {product.stock}</span>
        </div>
      </div>
    </div>
  );
}
