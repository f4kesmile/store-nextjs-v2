// src/components/TransactionExportButton.tsx
"use client";

import { useEffect, useState } from "react";
import { Button } from "@/components/ui/button";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { CalendarIcon, Download } from "lucide-react";

interface Reseller { id: number; name: string; }

export default function TransactionExportButton({ className = "" }: { className?: string }){
  const [exporting, setExporting] = useState(false);
  const [resellers, setResellers] = useState<Reseller[]>([]);
  const [format, setFormat] = useState("xlsx");
  const [status, setStatus] = useState("all");
  const [resellerId, setResellerId] = useState("all");
  const [dateFrom, setDateFrom] = useState("");
  const [dateTo, setDateTo] = useState("");

  useEffect(()=>{ fetchResellers(); },[]);
  async function fetchResellers(){
    try { const r = await fetch('/api/resellers'); if(r.ok){ setResellers(await r.json()); } } catch {}
  }

  async function onExport(){
    setExporting(true);
    const q = new URLSearchParams();
    if(format && format !== 'all') q.append('format', format);
    if(status && status !== 'all') q.append('status', status);
    if(resellerId && resellerId !== 'all') q.append('resellerId', resellerId);
    if(dateFrom) q.append('dateFrom', dateFrom);
    if(dateTo) q.append('dateTo', dateTo);
    const url = `/api/transactions/export?${q.toString()}`;
    try {
      const res = await fetch(url);
      if(!res.ok){ window.open(url,'_blank'); return; }
      const cd = res.headers.get('content-disposition');
      const name = cd?.match(/filename="(.+)"/)?.[1] || `transactions_${Date.now()}.${format}`;
      const blob = await res.blob();
      const link = document.createElement('a');
      link.href = URL.createObjectURL(blob);
      link.download = name; link.click();
      setTimeout(()=>URL.revokeObjectURL(link.href), 0);
    } finally { setExporting(false); }
  }

  return (
    <Popover>
      <PopoverTrigger asChild>
        <Button variant="outline" size="sm" disabled={exporting} className={className}>
          <Download className="w-4 h-4 mr-2" /> {exporting ? 'Exporting...' : 'Export'}
        </Button>
      </PopoverTrigger>
      <PopoverContent className="w-80 p-4 space-y-4" align="end">
        <div className="space-y-2">
          <Label className="text-sm">Format</Label>
          <Select value={format} onValueChange={setFormat}>
            <SelectTrigger><SelectValue placeholder="Pilih format" /></SelectTrigger>
            <SelectContent>
              <SelectItem value="xlsx">Excel (XLSX)</SelectItem>
              <SelectItem value="csv">CSV</SelectItem>
            </SelectContent>
          </Select>
        </div>
        <div className="space-y-2">
          <Label className="text-sm">Status</Label>
          <Select value={status} onValueChange={setStatus}>
            <SelectTrigger><SelectValue placeholder="Semua status" /></SelectTrigger>
            <SelectContent>
              <SelectItem value="all">Semua</SelectItem>
              <SelectItem value="PENDING">Pending</SelectItem>
              <SelectItem value="COMPLETED">Completed</SelectItem>
              <SelectItem value="CANCELLED">Cancelled</SelectItem>
            </SelectContent>
          </Select>
        </div>
        <div className="space-y-2">
          <Label className="text-sm">Reseller</Label>
          <Select value={resellerId} onValueChange={setResellerId}>
            <SelectTrigger><SelectValue placeholder="Semua reseller" /></SelectTrigger>
            <SelectContent>
              <SelectItem value="all">Semua Reseller & Direct</SelectItem>
              <SelectItem value="direct">Direct saja</SelectItem>
              {resellers.map(r=> <SelectItem key={r.id} value={r.id.toString()}>{r.name}</SelectItem>)}
            </SelectContent>
          </Select>
        </div>
        <div className="grid grid-cols-2 gap-2">
          <div className="space-y-2">
            <Label className="text-sm">Dari</Label>
            <input type="date" value={dateFrom} onChange={e=>setDateFrom(e.target.value)} className="border rounded-md h-9 px-2 text-sm" />
          </div>
          <div className="space-y-2">
            <Label className="text-sm">Sampai</Label>
            <input type="date" value={dateTo} onChange={e=>setDateTo(e.target.value)} className="border rounded-md h-9 px-2 text-sm" />
          </div>
        </div>
        <Button onClick={onExport} disabled={exporting} className="w-full">📊 Export Data</Button>
      </PopoverContent>
    </Popover>
  );
}
