import React from "react";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "../../ui/card";
import { Button } from "../../ui/button";
import { MoreHorizontal, Plus, Loader2 } from "lucide-react";
import { cn } from "../../../lib/utils";

interface AdminCardProps {
  title: string;
  description?: string;
  children: React.ReactNode;
  className?: string;
  headerActions?: React.ReactNode;
  showAddButton?: boolean;
  onAddClick?: () => void;
  loading?: boolean;
  empty?: boolean;
  emptyMessage?: string;
  emptyIcon?: React.ReactNode;
}

const AdminCard: React.FC<AdminCardProps> = ({
  title,
  description,
  children,
  className,
  headerActions,
  showAddButton = false,
  onAddClick,
  loading = false,
  empty = false,
  emptyMessage = "No data available",
  emptyIcon,
}) => {
  return (
    <Card
      className={cn(
        "bg-[hsl(var(--card))] shadow-sm hover:shadow-md transition-shadow",
        className
      )}
    >
      {" "}
      <CardHeader className="pb-4">
        <div className="flex items-center justify-between">
          <div className="space-y-1">
            <CardTitle className="text-lg font-semibold text-[hsl(var(--foreground))]">
              {title}
            </CardTitle>
            {description && (
              <CardDescription className="text-gray-600">
                {description}
              </CardDescription>
            )}
          </div>
          <div className="flex items-center gap-2">
            {showAddButton && (
              <Button
                onClick={onAddClick}
                size="sm"
                className="flex items-center gap-2"
              >
                <Plus className="h-4 w-4" />
                Add
              </Button>
            )}
            {headerActions}
          </div>
        </div>
      </CardHeader>
      <CardContent>
        {loading ? (
          <div className="flex items-center justify-center py-8">
            <div className="flex items-center justify-center gap-2 text-muted-foreground">
              <Loader2 className="w-5 h-5 animate-spin" />
              <span>Memuat...</span>
            </div>
          </div>
        ) : empty ? (
          <div className="flex flex-col items-center justify-center py-12 text-center">
            {emptyIcon && <div className="mb-4 text-gray-400">{emptyIcon}</div>}
            <p className="text-muted-foreground text-sm">{emptyMessage}</p>
          </div>
        ) : (
          children
        )}
      </CardContent>
    </Card>
  );
};

export default AdminCard;
