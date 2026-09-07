import React from "react";
import { TaskStatus } from "../types";
import { Badge } from "./ui/badge";
import { Clock, Loader2, CheckCircle2 } from "lucide-react";
import { cn } from "../lib/utils";

interface StatusBadgeProps {
  status: TaskStatus;
  className?: string;
  showIcon?: boolean;
}

export const StatusBadge: React.FC<StatusBadgeProps> = ({
  status,
  className = "",
  showIcon = true,
}) => {
  switch (status) {
    case "PENDING":
      return (
        <Badge
          variant="outline"
          className={cn(
            "gap-1.5 font-medium bg-amber-50 text-amber-700 border-amber-200/80 hover:bg-amber-50",
            className
          )}
        >
          {showIcon && <Clock className="w-3 h-3" />}
          <span>Pendiente</span>
        </Badge>
      );
    case "IN_PROGRESS":
      return (
        <Badge
          variant="outline"
          className={cn(
            "gap-1.5 font-medium bg-blue-50 text-blue-700 border-blue-200/80 hover:bg-blue-50",
            className
          )}
        >
          {showIcon && <Loader2 className="w-3 h-3 animate-spin text-blue-600" />}
          <span>En Progreso</span>
        </Badge>
      );
    case "COMPLETED":
      return (
        <Badge
          variant="outline"
          className={cn(
            "gap-1.5 font-medium bg-emerald-50 text-emerald-700 border-emerald-200/80 hover:bg-emerald-50",
            className
          )}
        >
          {showIcon && <CheckCircle2 className="w-3 h-3 text-emerald-600" />}
          <span>Completada</span>
        </Badge>
      );
    default:
      return (
        <Badge variant="secondary" className={className}>
          {status}
        </Badge>
      );
  }
};
