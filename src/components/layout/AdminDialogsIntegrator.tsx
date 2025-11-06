"use client";
import { useState } from "react";
import { TransactionEditDialog, ProductEditDialog, ResellerEditDialog, UserEditDialog, RoleEditDialog } from "@/components/layout";
import { Button } from "@/components/ui/button";

// NOTE: This is a lightweight integration example. Replace your existing action buttons to open these dialogs.
export function AdminDialogsIntegrator(){
  const [openTx, setOpenTx] = useState(false);
  const [openPr, setOpenPr] = useState(false);
  const [openRs, setOpenRs] = useState(false);
  const [openUs, setOpenUs] = useState(false);
  const [openRl, setOpenRl] = useState(false);

  return (
    <div className="fixed bottom-4 right-4 z-[60] grid gap-2">
      <Button onClick={()=> setOpenTx(true)} size="sm" variant="secondary">Test Edit Transaksi</Button>
      <Button onClick={()=> setOpenPr(true)} size="sm" variant="secondary">Test Edit Produk</Button>
      <Button onClick={()=> setOpenRs(true)} size="sm" variant="secondary">Test Edit Reseller</Button>
      <Button onClick={()=> setOpenUs(true)} size="sm" variant="secondary">Test Edit User</Button>
      <Button onClick={()=> setOpenRl(true)} size="sm" variant="secondary">Test Edit Role</Button>

      <TransactionEditDialog orderId="1" open={openTx} onOpenChange={setOpenTx}/>
      <ProductEditDialog productId="1" open={openPr} onOpenChange={setOpenPr}/>
      <ResellerEditDialog resellerId="1" open={openRs} onOpenChange={setOpenRs}/>
      <UserEditDialog userId="1" open={openUs} onOpenChange={setOpenUs}/>
      <RoleEditDialog roleName="ADMIN" open={openRl} onOpenChange={setOpenRl}/>
    </div>
  );
}
