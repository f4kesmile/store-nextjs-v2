"use client";
import { useState } from "react";
import { UserEditDialog } from "@/components/layout";
import { Button } from "@/components/ui/button";

export function UsersActions({ userId }:{ userId:string }){
  const [open, setOpen] = useState(false);
  return (
    <>
      <Button size="sm" variant="secondary" onClick={()=> setOpen(true)}>Edit</Button>
      <UserEditDialog userId={userId} open={open} onOpenChange={setOpen}/>
    </>
  );
}
