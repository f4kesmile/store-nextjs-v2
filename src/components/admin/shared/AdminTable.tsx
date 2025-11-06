import React from 'react';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '../../ui/table';
import { Button } from '../../ui/button';
import { Input } from '../../ui/input';
import { Search, Filter, Download, RefreshCcw } from 'lucide-react';
import { cn } from '../../../lib/utils';

interface Column {
  key: string;
  label: string;
  sortable?: boolean;
  className?: string;
  render?: (value: any, row: any) => React.ReactNode;
}

interface AdminTableProps {
  columns: Column[];
  data: any[];
  loading?: boolean;
  searchable?: boolean;
  searchPlaceholder?: string;
  searchValue?: string;
  onSearchChange?: (value: string) => void;
  filterable?: boolean;
  onFilterClick?: () => void;
  exportable?: boolean;
  onExportClick?: () => void;
  refreshable?: boolean;
  onRefreshClick?: () => void;
  className?: string;
  emptyMessage?: string;
  actions?: React.ReactNode;
}

const AdminTable: React.FC<AdminTableProps> = ({
  columns,
  data,
  loading = false,
  searchable = true,
  searchPlaceholder = 'Search...',
  searchValue = '',
  onSearchChange,
  filterable = false,
  onFilterClick,
  exportable = false,
  onExportClick,
  refreshable = false,
  onRefreshClick,
  className,
  emptyMessage = 'No data available',
  actions,
}) => {
  return (
    <div className={cn('space-y-4', className)}>
      {/* Table Controls */}
      <div className="flex flex-col sm:flex-row gap-4 items-start sm:items-center justify-between">
        <div className="flex flex-1 gap-2 w-full sm:w-auto">
          {searchable && (
            <div className="relative flex-1 sm:max-w-sm">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4" />
              <Input
                placeholder={searchPlaceholder}
                value={searchValue}
                onChange={(e) => onSearchChange?.(e.target.value)}
                className="pl-10"
              />
            </div>
          )}
          {filterable && (
            <Button variant="outline" onClick={onFilterClick} size="sm">
              <Filter className="h-4 w-4 mr-2" />
              Filter
            </Button>
          )}
        </div>
        
        <div className="flex gap-2 w-full sm:w-auto">
          {refreshable && (
            <Button variant="outline" onClick={onRefreshClick} size="sm">
              <RefreshCcw className="h-4 w-4 mr-2" />
              Refresh
            </Button>
          )}
          {exportable && (
            <Button variant="outline" onClick={onExportClick} size="sm">
              <Download className="h-4 w-4 mr-2" />
              Export
            </Button>
          )}
          {actions}
        </div>
      </div>

      {/* Table */}
      <div className="rounded-md border bg-white overflow-hidden">
        <div className="overflow-x-auto">
          <Table>
            <TableHeader>
              <TableRow className="bg-gray-50">
                {columns.map((column) => (
                  <TableHead 
                    key={column.key} 
                    className={cn(
                      'font-medium text-gray-900 py-3',
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
                <TableRow>
                  <TableCell 
                    colSpan={columns.length} 
                    className="text-center py-12"
                  >
                    <div className="flex items-center justify-center gap-2 text-gray-500">
                      <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-blue-600"></div>
                      Loading...
                    </div>
                  </TableCell>
                </TableRow>
              ) : data.length === 0 ? (
                <TableRow>
                  <TableCell 
                    colSpan={columns.length} 
                    className="text-center py-12 text-gray-500"
                  >
                    {emptyMessage}
                  </TableCell>
                </TableRow>
              ) : (
                data.map((row, index) => (
                  <TableRow 
                    key={index} 
                    className="hover:bg-gray-50 transition-colors"
                  >
                    {columns.map((column) => (
                      <TableCell 
                        key={column.key}
                        className={cn('py-3', column.className)}
                      >
                        {column.render 
                          ? column.render(row[column.key], row)
                          : row[column.key]
                        }
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