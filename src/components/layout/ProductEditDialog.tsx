"use client";
import { useState } from "react";
import { AdminDialog } from "@/components/layout/AdminDialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";

export function ProductEditDialog({ productId, open, onOpenChange }:{ productId:string; open:boolean; onOpenChange:(o:boolean)=>void }){
  return (
    <AdminDialog open={open} onOpenChange={onOpenChange} title={`Edit Produk #${productId}`} size="xl">
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div className="space-y-3">
          <Input placeholder="Nama Produk" />
          <Textarea placeholder="Deskripsi" rows={6} />
          <Input placeholder="URL Gambar" />
        </div>
        <div className="space-y-3">
          <Input placeholder="Harga" />
          <Input placeholder="Stok" />
          <Input placeholder="SKU" />
        </div>
      </div>
      <div className="flex justify-end gap-2 pt-4">
        <Button variant="secondary" onClick={()=> onOpenChange(false)}>Batal</Button>
        <Button>Update</Button>
      </div>
    </AdminDialog>
  );
}
