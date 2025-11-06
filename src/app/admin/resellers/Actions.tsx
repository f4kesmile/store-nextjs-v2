"use client";
import { useState } from "react";
import { ResellerEditDialog } from "@/components/layout";
import { Button } from "@/components/ui/button";

export function ResellersActions({ resellerId }:{ resellerId:string }){
  const [open, setOpen] = useState(false);
  return (
    <>
      <Button size="sm" variant="secondary" onClick={()=> setOpen(true)}>Edit</Button>
      <ResellerEditDialog resellerId={resellerId} open={open} onOpenChange={setOpen}/>
    </>
  );
}
