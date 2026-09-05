import React from "react";
import { CheckSquare, Plus, Layers, Activity } from "lucide-react";

interface NavbarProps {
  apiStatus: "healthy" | "offline" | "loading";
  onOpenNewTask: () => void;
  onOpenNewProject: () => void;
}

export const Navbar: React.FC<NavbarProps> = ({
  apiStatus,
  onOpenNewTask,
  onOpenNewProject,
}) => {
  return (
    <header className="sticky top-0 z-30 w-full border-b border-zinc-200/80 bg-white/95 backdrop-blur supports-[backdrop-filter]:bg-white/80">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between">
        {/* Brand */}
        <div className="flex items-center gap-3">
          <div className="h-9 w-9 rounded-lg bg-zinc-900 text-white flex items-center justify-center shadow-sm">
            <CheckSquare className="w-5 h-5 text-zinc-100" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h1 className="text-base font-semibold text-zinc-900 tracking-tight">
                TaskFlow
              </h1>
              <span className="text-[10px] font-mono uppercase bg-zinc-100 text-zinc-600 px-1.5 py-0.5 rounded border border-zinc-200">
                v1.0
              </span>
            </div>
            <p className="text-xs text-zinc-500 hidden sm:block">
              Task Tracker & Project Board
            </p>
          </div>
        </div>

        {/* Status Indicator & Action Buttons */}
        <div className="flex items-center gap-2 sm:gap-3">
          {/* API Server status badge */}
          <div className="hidden md:flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-medium border bg-zinc-50 border-zinc-200 text-zinc-600">
            <span
              className={`h-2 w-2 rounded-full ${
                apiStatus === "healthy"
                  ? "bg-emerald-500 animate-pulse"
                  : apiStatus === "offline"
                  ? "bg-rose-500"
                  : "bg-amber-400 animate-spin"
              }`}
            />
            <span>
              {apiStatus === "healthy"
                ? "API Online"
                : apiStatus === "offline"
                ? "API Offline"
                : "Conectando..."}
            </span>
          </div>

          <button
            onClick={onOpenNewProject}
            className="inline-flex items-center gap-1.5 px-3 py-1.5 text-xs sm:text-sm font-medium rounded-lg text-zinc-700 bg-white border border-zinc-300 hover:bg-zinc-50 hover:border-zinc-400 transition-colors shadow-xs"
          >
            <Layers className="w-4 h-4 text-zinc-500" />
            <span className="hidden sm:inline">Nuevo</span> Proyecto
          </button>

          <button
            onClick={onOpenNewTask}
            className="inline-flex items-center gap-1.5 px-3 py-1.5 text-xs sm:text-sm font-medium rounded-lg text-white bg-zinc-900 hover:bg-zinc-800 transition-colors shadow-sm"
          >
            <Plus className="w-4 h-4" />
            <span>Nueva Tarea</span>
          </button>
        </div>
      </div>
    </header>
  );
};
