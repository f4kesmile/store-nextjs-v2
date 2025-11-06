"use client";
import { useState } from "react";
import { ProductEditDialog } from "@/components/layout";
import { Button } from "@/components/ui/button";

export function ProductsActions({ productId }:{ productId:string }){
  const [open, setOpen] = useState(false);
  return (
    <>
      <Button size="sm" variant="secondary" onClick={()=> setOpen(true)}>Edit</Button>
      <ProductEditDialog productId={productId} open={open} onOpenChange={setOpen}/>
    </>
  );
}
