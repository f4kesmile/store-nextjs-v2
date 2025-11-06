"use client";
import { useState } from "react";
import { RoleEditDialog } from "@/components/layout";
import { Button } from "@/components/ui/button";

export function RolesActions({ roleName }:{ roleName:string }){
  const [open, setOpen] = useState(false);
  return (
    <>
      <Button size="sm" variant="secondary" onClick={()=> setOpen(true)}>Edit</Button>
      <RoleEditDialog roleName={roleName} open={open} onOpenChange={setOpen}/>
    </>
  );
}
