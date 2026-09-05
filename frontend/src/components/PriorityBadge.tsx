import React from "react";
import { TaskPriority } from "../types";
import { AlertCircle, AlertTriangle, ArrowDown } from "lucide-react";

interface PriorityBadgeProps {
  priority: TaskPriority;
  className?: string;
}

export const PriorityBadge: React.FC<PriorityBadgeProps> = ({ priority, className = "" }) => {
  switch (priority) {
    case "LOW":
      return (
        <span
          className={`inline-flex items-center gap-1 px-2 py-0.5 rounded-md text-xs font-medium bg-slate-100 text-slate-700 border border-slate-200 ${className}`}
        >
          <ArrowDown className="w-3 h-3 text-slate-500" />
          Baja
        </span>
      );
    case "MEDIUM":
      return (
        <span
          className={`inline-flex items-center gap-1 px-2 py-0.5 rounded-md text-xs font-medium bg-amber-50 text-amber-800 border border-amber-300 ${className}`}
        >
          <AlertTriangle className="w-3 h-3 text-amber-600" />
          Media
        </span>
      );
    case "HIGH":
      return (
        <span
          className={`inline-flex items-center gap-1 px-2 py-0.5 rounded-md text-xs font-medium bg-rose-50 text-rose-800 border border-rose-200 ${className}`}
        >
          <AlertCircle className="w-3 h-3 text-rose-600" />
          Alta
        </span>
      );
    default:
      return (
        <span className={`inline-flex items-center px-2 py-0.5 rounded text-xs bg-gray-100 text-gray-700 ${className}`}>
          {priority}
        </span>
      );
  }
};
