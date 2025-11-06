"use client";
import { useState } from "react";
import { AdminDialog } from "@/components/layout/AdminDialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";

export function TransactionEditDialog({ orderId, open, onOpenChange }:{ orderId:string; open:boolean; onOpenChange:(o:boolean)=>void }){
  return (
    <AdminDialog open={open} onOpenChange={onOpenChange} title={`Edit Transaksi #${orderId}`} size="lg">
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div className="space-y-3">
          <Input placeholder="Nama Customer" />
          <Input placeholder="Email/No. Telp" />
          <Select>
            <SelectTrigger><SelectValue placeholder="Status"/></SelectTrigger>
            <SelectContent>
              <SelectItem value="PENDING">Pending</SelectItem>
              <SelectItem value="PAID">Paid</SelectItem>
              <SelectItem value="CANCELLED">Cancelled</SelectItem>
            </SelectContent>
          </Select>
        </div>
        <div className="space-y-3">
          <Input placeholder="Total (Rp)" />
          <Textarea placeholder="Catatan" rows={5}/>
        </div>
      </div>
      <div className="flex justify-end gap-2 pt-4">
        <Button variant="secondary" onClick={()=> onOpenChange(false)}>Batal</Button>
        <Button>Simpan Perubahan</Button>
      </div>
    </AdminDialog>
  );
}
