import React from "react";
import { DashboardMetrics } from "../types";
import {
  CheckCircle2,
  Clock,
  Loader2,
  FolderGit2,
  TrendingUp,
} from "lucide-react";

interface MetricsOverviewProps {
  metrics: DashboardMetrics | null;
  loading: boolean;
}

export const MetricsOverview: React.FC<MetricsOverviewProps> = ({
  metrics,
  loading,
}) => {
  const defaultMetrics = {
    total_projects: 0,
    total_tasks: 0,
    status_counts: { pending: 0, in_progress: 0, completed: 0 },
    priority_counts: { low: 0, medium: 0, high: 0 },
    completion_rate_percentage: 0,
  };

  const data = metrics || defaultMetrics;

  const cards = [
    {
      label: "Total Tareas",
      value: data.total_tasks,
      icon: TrendingUp,
      color: "text-zinc-900",
      bg: "bg-zinc-50",
      border: "border-zinc-200",
      subtext: `${data.total_projects} proyectos activos`,
    },
    {
      label: "Pendientes",
      value: data.status_counts.pending,
      icon: Clock,
      color: "text-amber-700",
      bg: "bg-amber-50/70",
      border: "border-amber-200/80",
      subtext: "Por iniciar",
    },
    {
      label: "En Progreso",
      value: data.status_counts.in_progress,
      icon: Loader2,
      color: "text-blue-700",
      bg: "bg-blue-50/70",
      border: "border-blue-200/80",
      subtext: "En desarrollo",
    },
    {
      label: "Completadas",
      value: data.status_counts.completed,
      icon: CheckCircle2,
      color: "text-emerald-700",
      bg: "bg-emerald-50/70",
      border: "border-emerald-200/80",
      subtext: `${data.completion_rate_percentage}% del total`,
    },
  ];

  return (
    <div className="space-y-4">
      {/* 4 Cards */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-4">
        {cards.map((card, i) => {
          const Icon = card.icon;
          return (
            <div
              key={i}
              className={`p-4 rounded-xl border ${card.border} bg-white shadow-xs hover:shadow-sm transition-all`}
            >
              <div className="flex items-center justify-between mb-2">
                <span className="text-xs font-medium text-zinc-500">{card.label}</span>
                <div className={`p-1.5 rounded-lg ${card.bg}`}>
                  <Icon className={`w-4 h-4 ${card.color}`} />
                </div>
              </div>
              <div className="flex items-baseline gap-2">
                <span className="text-2xl font-bold tracking-tight text-zinc-900">
                  {loading ? "-" : card.value}
                </span>
                <span className="text-xs text-zinc-400">{card.subtext}</span>
              </div>
            </div>
          );
        })}
      </div>

      {/* Progress Bar */}
      <div className="p-3.5 rounded-xl border border-zinc-200 bg-white shadow-xs flex flex-col sm:flex-row sm:items-center justify-between gap-3">
        <div className="flex items-center gap-3">
          <div className="p-2 rounded-lg bg-emerald-50 text-emerald-600 border border-emerald-200/70">
            <CheckCircle2 className="w-4 h-4" />
          </div>
          <div>
            <div className="text-xs font-semibold text-zinc-800">
              Progreso General de Tareas
            </div>
            <div className="text-xs text-zinc-500">
              {data.status_counts.completed} de {data.total_tasks} tareas completadas
            </div>
          </div>
        </div>

        <div className="flex-1 max-w-md w-full flex items-center gap-3">
          <div className="w-full bg-zinc-100 rounded-full h-2.5 overflow-hidden border border-zinc-200/60">
            <div
              className="bg-emerald-500 h-2.5 rounded-full transition-all duration-500 ease-out"
              style={{ width: `${Math.min(100, data.completion_rate_percentage)}%` }}
            />
          </div>
          <span className="text-xs font-bold text-zinc-700 min-w-[40px] text-right font-mono">
            {data.completion_rate_percentage}%
          </span>
        </div>
      </div>
    </div>
  );
};
