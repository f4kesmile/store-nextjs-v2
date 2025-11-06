"use client";
import { useState } from "react";
import { AdminDialog } from "@/components/layout/AdminDialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";

export function RoleEditDialog({ roleName, open, onOpenChange }:{ roleName:string; open:boolean; onOpenChange:(o:boolean)=>void }){
  return (
    <AdminDialog open={open} onOpenChange={onOpenChange} title={`Edit Role ${roleName}`} size="lg">
      <div className="space-y-3">
        <Input placeholder="Nama Role" />
        <div className="grid grid-cols-1 md:grid-cols-2 gap-2">
          {Array.from({length:12}).map((_,i)=> (
            <label key={i} className="flex items-center gap-2 text-sm"><input type="checkbox" className="rounded"/> Permission {i+1}</label>
          ))}
        </div>
      </div>
      <div className="flex justify-end gap-2 pt-4">
        <Button variant="secondary" onClick={()=> onOpenChange(false)}>Batal</Button>
        <Button>Update</Button>
      </div>
    </AdminDialog>
  );
}
