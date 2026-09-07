import React from "react";
import { TaskPriority } from "../types";
import { Badge } from "./ui/badge";
import { AlertCircle, AlertTriangle, ArrowDown } from "lucide-react";
import { cn } from "../lib/utils";

interface PriorityBadgeProps {
  priority: TaskPriority;
  className?: string;
}

export const PriorityBadge: React.FC<PriorityBadgeProps> = ({
  priority,
  className = "",
}) => {
  switch (priority) {
    case "LOW":
      return (
        <Badge
          variant="outline"
          className={cn(
            "gap-1 font-medium bg-slate-100/90 text-slate-700 border-slate-200 hover:bg-slate-100",
            className
          )}
        >
          <ArrowDown className="w-3 h-3 text-slate-500" />
          <span>Baja</span>
        </Badge>
      );
    case "MEDIUM":
      return (
        <Badge
          variant="outline"
          className={cn(
            "gap-1 font-medium bg-amber-50 text-amber-800 border-amber-300/80 hover:bg-amber-50",
            className
          )}
        >
          <AlertTriangle className="w-3 h-3 text-amber-600" />
          <span>Media</span>
        </Badge>
      );
    case "HIGH":
      return (
        <Badge
          variant="outline"
          className={cn(
            "gap-1 font-medium bg-rose-50 text-rose-800 border-rose-200 hover:bg-rose-50",
            className
          )}
        >
          <AlertCircle className="w-3 h-3 text-rose-600" />
          <span>Alta</span>
        </Badge>
      );
    default:
      return (
        <Badge variant="secondary" className={className}>
          {priority}
        </Badge>
      );
  }
};
