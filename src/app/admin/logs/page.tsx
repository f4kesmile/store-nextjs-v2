"use client";

import { useEffect, useMemo, useState } from "react";
import { useSession } from "next-auth/react";

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Input } from "@/components/ui/input";

interface LogUser { username?: string; email?: string; role?: { name: string } | null }
interface Log { id: string | number; action?: string; title?: string; description?: string; timestamp: string; user?: LogUser | null }

const Icons = { activity: (p:any)=>(<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" aria-hidden="true" {...p}><path d="M22 12h-4l-3 9-6-18-3 9H2"/></svg>) };

export default function ActivityLogsPage(){
  const { data: session } = useSession();
  const [logs, setLogs] = useState<Log[]>([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState("");

  useEffect(()=>{ if (!session) return; fetchLogs(); }, [session]);

  async function fetchLogs(){ 
    try { 
      const res = await fetch("/api/admin/activity"); 
      const data = await res.json(); 
      setLogs(data.activities ?? []); 
    } catch(e){ console.error(e); } finally { setLoading(false); } 
  }

  const filtered = useMemo(()=> logs.filter(l => {
    const actionText = (l.description || l.title || l.action || "").toLowerCase();
    const username = (l.user?.username || "").toLowerCase();
    return actionText.includes(filter.toLowerCase()) || username.includes(filter.toLowerCase());
  }), [logs, filter]);

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader className="pb-3">
          <div className="flex items-center gap-2">
            <span className="size-8 rounded-md bg-muted grid place-items-center"><Icons.activity className="w-4 h-4"/></span>
            <div>
              <CardTitle className="text-lg">Activity Logs</CardTitle>
              <CardDescription>Semua aktivitas sistem dan admin</CardDescription>
            </div>
          </div>
        </CardHeader>
      </Card>

      <Card>
        <CardHeader className="pb-2">
          <CardDescription>Filter</CardDescription>
        </CardHeader>
        <CardContent>
          <Input placeholder="Cari aktivitas atau username..." value={filter} onChange={(e)=>setFilter(e.target.value)} />
        </CardContent>
      </Card>

      <Card>
        <CardContent>
          <div className="w-full overflow-x-auto">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Timestamp</TableHead>
                  <TableHead>User</TableHead>
                  <TableHead>Role</TableHead>
                  <TableHead>Deskripsi</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {filtered.map((log)=>{
                  const username = log.user?.username || 'SYSTEM';
                  const email = log.user?.email || '-';
                  const roleName = log.user?.role?.name || 'SYSTEM';
                  const desc = log.description || log.title || log.action || '-';
                  return (
                    <TableRow key={log.id}>
                      <TableCell className="whitespace-nowrap text-sm text-muted-foreground">{new Date(log.timestamp).toLocaleString("id-ID", { dateStyle: "short", timeStyle: "medium" })}</TableCell>
                      <TableCell>
                        <div className="font-medium">{username}</div>
                        <div className="text-sm text-muted-foreground">{email}</div>
                      </TableCell>
                      <TableCell><Badge variant={roleName === "DEVELOPER" ? "destructive" : "secondary"}>{roleName}</Badge></TableCell>
                      <TableCell className="text-sm">{desc}</TableCell>
                    </TableRow>
                  );
                })}
              </TableBody>
            </Table>
          </div>
          {!loading && filtered.length === 0 && (<div className="text-center py-8 text-muted-foreground">Tidak ada log ditemukan</div>)}
        </CardContent>
      </Card>
    </div>
  );
}