"use client";

import React from "react";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { cn } from "../../../lib/utils";
import { Input } from "@/components/ui/input";
import { Loader2 } from "lucide-react";

// Tipe props disesuaikan dengan yang Anda gunakan
interface Column {
  key: string;
  label: string;
  className?: string;
  render?: (value: any, row: any) => React.ReactNode;
}

interface AdminTableProps {
  columns: Column[];
  data: any[];
  loading?: boolean;
  className?: string;
  searchable?: boolean;
  searchValue?: string;
  onSearchChange?: (value: string) => void;
  searchPlaceholder?: string;
  filters?: React.ReactNode;
  emptyMessage?: string;
  actions?: React.ReactNode;
}

const AdminTable: React.FC<AdminTableProps> = ({
  columns,
  data,
  loading = false,
  className,
  searchable,
  searchValue,
  onSearchChange,
  searchPlaceholder = "Search...",
  filters,
  emptyMessage = "No data found.",
  actions,
}) => {
  return (
    <div className={cn("space-y-4", className)}>
      {/* Table Controls */}
      <div className="flex flex-col sm:flex-row gap-2 justify-between">
        <div className="flex flex-1 items-center gap-2">
          {searchable && (
            <Input
              placeholder={searchPlaceholder}
              value={searchValue}
              onChange={(e) => onSearchChange?.(e.target.value)}
              className="max-w-sm" // Input sudah dark mode
            />
          )}
          {filters}
        </div>
        {actions && <div className="flex gap-2">{actions}</div>}
      </div>

      {/* Table */}
      {/* FIX: Hapus 'bg-white' dan 'bg-gray-50'.
        Gunakan 'border-[hsl(var(--border))]' dan 'bg-[hsl(var(--muted))]' 
        agar sesuai dengan globals.css Anda.
      */}
      <div className="rounded-md border border-[hsl(var(--border))] overflow-hidden">
        <div className="overflow-x-auto">
          <Table>
            <TableHeader>
              <TableRow className="border-b-[hsl(var(--border))] bg-[hsl(var(--muted))] hover:bg-[hsl(var(--muted))]">
                {columns.map((column) => (
                  <TableHead
                    key={column.key}
                    className={cn(
                      "font-medium text-[hsl(var(--muted-foreground))] py-3",
                      column.className
                    )}
                  >
                    {column.label}
                  </TableHead>
                ))}
              </TableRow>
            </TableHeader>
            <TableBody>
              {loading ? (
                <TableRow className="border-b-[hsl(var(--border))]">
                  <TableCell
                    colSpan={columns.length}
                    className="text-center h-24"
                  >
                    <div className="flex justify-center items-center gap-2 text-muted-foreground">
                      <Loader2 className="w-4 h-4 animate-spin" />
                      Memuat data...
                    </div>
                  </TableCell>
                </TableRow>
              ) : data.length === 0 ? (
                <TableRow className="border-b-[hsl(var(--border))]">
                  <TableCell
                    colSpan={columns.length}
                    className="text-center h-24 text-muted-foreground"
                  >
                    {emptyMessage}
                  </TableCell>
                </TableRow>
              ) : (
                data.map((row, index) => (
                  <TableRow
                    key={index}
                    className="border-b-[hsl(var(--border))]" // Menghapus hover:bg-gray-50
                  >
                    {columns.map((column) => (
                      <TableCell
                        key={column.key}
                        className={cn("py-4", column.className)}
                      >
                        {column.render ? (
                          column.render(row[column.key], row)
                        ) : (
                          <span className="text-[hsl(var(--foreground))]">
                            {row[column.key]}
                          </span>
                        )}
                      </TableCell>
                    ))}
                  </TableRow>
                ))
              )}
            </TableBody>
          </Table>
        </div>
      </div>
    </div>
  );
};

export default AdminTable;
