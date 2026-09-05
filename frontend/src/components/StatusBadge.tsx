import React from "react";
import { TaskStatus } from "../types";
import { Clock, Loader2, CheckCircle2 } from "lucide-react";

interface StatusBadgeProps {
  status: TaskStatus;
  className?: string;
  showIcon?: boolean;
}

export const StatusBadge: React.FC<StatusBadgeProps> = ({ status, className = "", showIcon = true }) => {
  switch (status) {
    case "PENDING":
      return (
        <span
          className={`inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-xs font-medium bg-amber-50 text-amber-700 border border-amber-200/80 ${className}`}
        >
          {showIcon && <Clock className="w-3 h-3" />}
          Pendiente
        </span>
      );
    case "IN_PROGRESS":
      return (
        <span
          className={`inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-xs font-medium bg-blue-50 text-blue-700 border border-blue-200/80 ${className}`}
        >
          {showIcon && <Loader2 className="w-3 h-3 animate-spin text-blue-600" />}
          En Progreso
        </span>
      );
    case "COMPLETED":
      return (
        <span
          className={`inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-xs font-medium bg-emerald-50 text-emerald-700 border border-emerald-200/80 ${className}`}
        >
          {showIcon && <CheckCircle2 className="w-3 h-3 text-emerald-600" />}
          Completada
        </span>
      );
    default:
      return (
        <span className={`inline-flex items-center px-2 py-0.5 rounded text-xs bg-gray-100 text-gray-700 ${className}`}>
          {status}
        </span>
      );
  }
};
