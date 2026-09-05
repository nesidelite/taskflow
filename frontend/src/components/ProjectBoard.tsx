import React, { useState } from "react";
import { Project, Task, TaskStatus, TaskPriority } from "../types";
import { TaskCard } from "./TaskCard";
import { StatusBadge } from "./StatusBadge";
import { PriorityBadge } from "./PriorityBadge";
import { formatDate } from "../lib/utils";
import {
  Search,
  Filter,
  LayoutGrid,
  List,
  Plus,
  Edit2,
  Trash2,
  FolderOpen,
  CheckCircle2,
  Clock,
  Loader2,
} from "lucide-react";

interface ProjectBoardProps {
  projects: Project[];
  tasks: Task[];
  selectedProjectId: number | null;
  onSelectProject: (id: number | null) => void;
  onEditProject: (project: Project) => void;
  onDeleteProject: (projectId: number) => void;
  onNewTask: (defaultStatus?: TaskStatus) => void;
  onEditTask: (task: Task) => void;
  onDeleteTask: (taskId: number) => void;
  onStatusChange: (taskId: number, newStatus: TaskStatus) => void;
}

export const ProjectBoard: React.FC<ProjectBoardProps> = ({
  projects,
  tasks,
  selectedProjectId,
  onSelectProject,
  onEditProject,
  onDeleteProject,
  onNewTask,
  onEditTask,
  onDeleteTask,
  onStatusChange,
}) => {
  const [search, setSearch] = useState("");
  const [priorityFilter, setPriorityFilter] = useState<string>("ALL");
  const [viewMode, setViewMode] = useState<"kanban" | "list">("kanban");

  // Filtering
  const filteredTasks = tasks.filter((t) => {
    const matchesProject =
      selectedProjectId === null || t.project_id === selectedProjectId;
    const matchesPriority =
      priorityFilter === "ALL" || t.priority === priorityFilter;
    const matchesSearch =
      search.trim() === "" ||
      t.title.toLowerCase().includes(search.toLowerCase()) ||
      (t.description &&
        t.description.toLowerCase().includes(search.toLowerCase()));

    return matchesProject && matchesPriority && matchesSearch;
  });

  const pendingTasks = filteredTasks.filter((t) => t.status === "PENDING");
  const inProgressTasks = filteredTasks.filter((t) => t.status === "IN_PROGRESS");
  const completedTasks = filteredTasks.filter((t) => t.status === "COMPLETED");

  const currentProject = projects.find((p) => p.id === selectedProjectId);

  const columns: {
    status: TaskStatus;
    title: string;
    icon: any;
    color: string;
    badgeBg: string;
    badgeBorder: string;
    items: Task[];
  }[] = [
    {
      status: "PENDING",
      title: "Por Iniciar",
      icon: Clock,
      color: "text-amber-700",
      badgeBg: "bg-amber-50",
      badgeBorder: "border-amber-200",
      items: pendingTasks,
    },
    {
      status: "IN_PROGRESS",
      title: "En Desarrollo",
      icon: Loader2,
      color: "text-blue-700",
      badgeBg: "bg-blue-50",
      badgeBorder: "border-blue-200",
      items: inProgressTasks,
    },
    {
      status: "COMPLETED",
      title: "Completado",
      icon: CheckCircle2,
      color: "text-emerald-700",
      badgeBg: "bg-emerald-50",
      badgeBorder: "border-emerald-200",
      items: completedTasks,
    },
  ];

  return (
    <div className="space-y-5">
      {/* 1. Projects horizontal selector tabs */}
      <div className="flex items-center justify-between gap-3 overflow-x-auto pb-1 scrollbar-thin">
        <div className="flex items-center gap-2">
          <button
            onClick={() => onSelectProject(null)}
            className={`px-3 py-1.5 rounded-lg text-xs font-medium transition-all whitespace-nowrap border ${
              selectedProjectId === null
                ? "bg-zinc-900 text-white border-zinc-900 shadow-xs"
                : "bg-white text-zinc-600 border-zinc-200 hover:bg-zinc-50"
            }`}
          >
            Todos los Proyectos ({tasks.length})
          </button>

          {projects.map((p) => {
            const isSelected = selectedProjectId === p.id;
            return (
              <button
                key={p.id}
                onClick={() => onSelectProject(p.id)}
                className={`flex items-center gap-2 px-3 py-1.5 rounded-lg text-xs font-medium transition-all whitespace-nowrap border ${
                  isSelected
                    ? "bg-white text-zinc-900 border-zinc-800 shadow-xs ring-1 ring-zinc-800"
                    : "bg-white text-zinc-600 border-zinc-200 hover:bg-zinc-50"
                }`}
              >
                <span
                  className="w-2 h-2 rounded-full"
                  style={{ backgroundColor: p.color }}
                />
                <span>{p.title}</span>
                <span className="text-[10px] px-1.5 py-0.2 rounded-full bg-zinc-100 text-zinc-500 font-mono">
                  {p.task_count ?? tasks.filter((t) => t.project_id === p.id).length}
                </span>
              </button>
            );
          })}
        </div>

        {/* Selected Project Quick Actions */}
        {currentProject && (
          <div className="flex items-center gap-1 shrink-0">
            <button
              onClick={() => onEditProject(currentProject)}
              className="p-1.5 rounded-lg border border-zinc-200 bg-white text-zinc-600 hover:text-zinc-900 hover:bg-zinc-50 transition-colors"
              title="Editar proyecto seleccionado"
            >
              <Edit2 className="w-3.5 h-3.5" />
            </button>
            <button
              onClick={() => onDeleteProject(currentProject.id)}
              className="p-1.5 rounded-lg border border-zinc-200 bg-white text-zinc-600 hover:text-rose-600 hover:bg-rose-50 transition-colors"
              title="Eliminar proyecto seleccionado"
            >
              <Trash2 className="w-3.5 h-3.5" />
            </button>
          </div>
        )}
      </div>

      {/* 2. Filter & Controls Toolbar */}
      <div className="flex flex-col sm:flex-row items-center justify-between gap-3 bg-white p-3 rounded-xl border border-zinc-200 shadow-xs">
        {/* Search */}
        <div className="relative w-full sm:w-72">
          <Search className="w-4 h-4 text-zinc-400 absolute left-3 top-2.5" />
          <input
            type="text"
            placeholder="Buscar por título o nota..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="w-full pl-9 pr-3 py-1.5 text-xs sm:text-sm rounded-lg border border-zinc-200 bg-zinc-50/50 focus:bg-white focus:outline-hidden focus:ring-2 focus:ring-zinc-900/10 focus:border-zinc-900 transition-colors"
          />
        </div>

        <div className="flex items-center gap-2 w-full sm:w-auto justify-between sm:justify-end">
          {/* Priority filter */}
          <div className="flex items-center gap-1.5">
            <Filter className="w-3.5 h-3.5 text-zinc-400" />
            <select
              value={priorityFilter}
              onChange={(e) => setPriorityFilter(e.target.value)}
              className="px-2.5 py-1.5 text-xs rounded-lg border border-zinc-200 bg-white text-zinc-700"
            >
              <option value="ALL">Todas las prioridades</option>
              <option value="LOW">Prioridad Baja</option>
              <option value="MEDIUM">Prioridad Media</option>
              <option value="HIGH">Prioridad Alta</option>
            </select>
          </div>

          {/* View mode switch */}
          <div className="flex items-center bg-zinc-100 p-0.5 rounded-lg border border-zinc-200">
            <button
              onClick={() => setViewMode("kanban")}
              className={`p-1.5 rounded-md text-xs transition-all ${
                viewMode === "kanban"
                  ? "bg-white text-zinc-900 shadow-xs"
                  : "text-zinc-500 hover:text-zinc-800"
              }`}
              title="Vista Tablero Kanban"
            >
              <LayoutGrid className="w-4 h-4" />
            </button>
            <button
              onClick={() => setViewMode("list")}
              className={`p-1.5 rounded-md text-xs transition-all ${
                viewMode === "list"
                  ? "bg-white text-zinc-900 shadow-xs"
                  : "text-zinc-500 hover:text-zinc-800"
              }`}
              title="Vista Lista / Tabla"
            >
              <List className="w-4 h-4" />
            </button>
          </div>
        </div>
      </div>

      {/* 3. Main Views */}
      {viewMode === "kanban" ? (
        /* Kanban Column View */
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 sm:gap-5 items-start">
          {columns.map((col) => {
            const Icon = col.icon;
            return (
              <div
                key={col.status}
                className="bg-zinc-50/70 rounded-xl border border-zinc-200/80 p-3.5 flex flex-col min-h-[420px]"
              >
                {/* Column Header */}
                <div className="flex items-center justify-between mb-3 px-1">
                  <div className="flex items-center gap-2">
                    <Icon className={`w-4 h-4 ${col.color}`} />
                    <h3 className="text-xs font-semibold text-zinc-800 uppercase tracking-wider">
                      {col.title}
                    </h3>
                  </div>
                  <span
                    className={`px-2 py-0.5 rounded-full text-xs font-mono font-medium border ${col.badgeBg} ${col.badgeBorder} ${col.color}`}
                  >
                    {col.items.length}
                  </span>
                </div>

                {/* Task Items List */}
                <div className="space-y-3 flex-1 overflow-y-auto max-h-[calc(100vh-320px)] pr-0.5">
                  {col.items.map((task) => (
                    <TaskCard
                      key={task.id}
                      task={task}
                      onEdit={onEditTask}
                      onDelete={onDeleteTask}
                      onStatusChange={onStatusChange}
                    />
                  ))}

                  {col.items.length === 0 && (
                    <div className="h-32 border-2 border-dashed border-zinc-200 rounded-xl flex flex-col items-center justify-center p-4 text-center">
                      <p className="text-xs text-zinc-400">
                        No hay tareas en este estado
                      </p>
                    </div>
                  )}
                </div>

                {/* Add task to column button */}
                <button
                  onClick={() => onNewTask(col.status)}
                  className="mt-3 w-full py-2 px-3 border border-dashed border-zinc-300 rounded-lg text-xs font-medium text-zinc-500 hover:text-zinc-800 hover:border-zinc-400 hover:bg-white/60 transition-colors flex items-center justify-center gap-1.5"
                >
                  <Plus className="w-3.5 h-3.5" />
                  <span>Añadir tarea</span>
                </button>
              </div>
            );
          })}
        </div>
      ) : (
        /* List View */
        <div className="bg-white rounded-xl border border-zinc-200 shadow-xs overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs sm:text-sm">
              <thead className="bg-zinc-50 border-b border-zinc-200 text-zinc-500 uppercase text-[11px] tracking-wider">
                <tr>
                  <th className="px-4 py-3 font-semibold">Tarea</th>
                  <th className="px-4 py-3 font-semibold">Proyecto</th>
                  <th className="px-4 py-3 font-semibold">Estado</th>
                  <th className="px-4 py-3 font-semibold">Prioridad</th>
                  <th className="px-4 py-3 font-semibold">Fecha Límite</th>
                  <th className="px-4 py-3 font-semibold text-right">Acciones</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-zinc-100">
                {filteredTasks.length === 0 ? (
                  <tr>
                    <td colSpan={6} className="text-center py-8 text-zinc-400 text-xs">
                      No se encontraron tareas coincidentes.
                    </td>
                  </tr>
                ) : (
                  filteredTasks.map((t) => (
                    <tr key={t.id} className="hover:bg-zinc-50/80 transition-colors">
                      <td className="px-4 py-3 font-medium text-zinc-900">
                        <div>{t.title}</div>
                        {t.description && (
                          <div className="text-xs text-zinc-400 font-normal line-clamp-1">
                            {t.description}
                          </div>
                        )}
                      </td>
                      <td className="px-4 py-3">
                        {t.project ? (
                          <span
                            className="inline-flex items-center gap-1.5 px-2 py-0.5 rounded-full text-xs font-medium border"
                            style={{
                              backgroundColor: `${t.project.color}15`,
                              borderColor: `${t.project.color}30`,
                              color: t.project.color,
                            }}
                          >
                            <span
                              className="w-1.5 h-1.5 rounded-full"
                              style={{ backgroundColor: t.project.color }}
                            />
                            {t.project.title}
                          </span>
                        ) : (
                          <span className="text-zinc-400 text-xs">-</span>
                        )}
                      </td>
                      <td className="px-4 py-3">
                        <select
                          value={t.status}
                          onChange={(e) => onStatusChange(t.id, e.target.value as TaskStatus)}
                          className="text-xs rounded-md border border-zinc-200 bg-white px-2 py-1"
                        >
                          <option value="PENDING">Pendiente</option>
                          <option value="IN_PROGRESS">En Progreso</option>
                          <option value="COMPLETED">Completada</option>
                        </select>
                      </td>
                      <td className="px-4 py-3">
                        <PriorityBadge priority={t.priority} />
                      </td>
                      <td className="px-4 py-3 text-zinc-600 text-xs">
                        {formatDate(t.due_date)}
                      </td>
                      <td className="px-4 py-3 text-right">
                        <div className="flex items-center justify-end gap-1">
                          <button
                            onClick={() => onEditTask(t)}
                            className="p-1 rounded text-zinc-400 hover:text-zinc-700 hover:bg-zinc-100"
                            title="Editar"
                          >
                            <Edit2 className="w-3.5 h-3.5" />
                          </button>
                          <button
                            onClick={() => onDeleteTask(t.id)}
                            className="p-1 rounded text-zinc-400 hover:text-rose-600 hover:bg-rose-50"
                            title="Eliminar"
                          >
                            <Trash2 className="w-3.5 h-3.5" />
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        </div>
      )}
    </div>
  );
};
