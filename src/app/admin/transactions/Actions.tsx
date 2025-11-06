"use client";
import { useState } from "react";
import { TransactionEditDialog } from "@/components/layout";
import { Button } from "@/components/ui/button";

export function TransactionsActions({ orderId }:{ orderId:string }){
  const [open, setOpen] = useState(false);
  return (
    <>
      <Button size="sm" variant="secondary" onClick={()=> setOpen(true)}>Edit</Button>
      <TransactionEditDialog orderId={orderId} open={open} onOpenChange={setOpen}/>
    </>
  );
}
