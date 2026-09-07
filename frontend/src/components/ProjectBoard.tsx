"use client";

import React, { useState, useEffect } from "react";
import { Project, Task, TaskStatus } from "../types";
import { TaskCard } from "./TaskCard";
import { PriorityBadge } from "./PriorityBadge";
import { formatDate } from "../lib/utils";
import { Button } from "./ui/button";
import { Input } from "./ui/input";
import { Badge } from "./ui/badge";
import { Card } from "./ui/card";
import {
  DragDropContext,
  Droppable,
  Draggable,
  DropResult,
} from "@hello-pangea/dnd";
import {
  Search,
  Filter,
  LayoutGrid,
  List,
  Plus,
  Edit2,
  Trash2,
  CheckCircle2,
  Clock,
  Loader2,
  Move,
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
  const [isMounted, setIsMounted] = useState(false);

  // Prevent Next.js SSR hydration mismatches with drag and drop
  useEffect(() => {
    setIsMounted(true);
  }, []);

  // Drag and Drop Handler
  const handleDragEnd = (result: DropResult) => {
    const { destination, source, draggableId } = result;

    // Dropped outside a valid droppable
    if (!destination) return;

    // Dropped in the same place
    if (
      destination.droppableId === source.droppableId &&
      destination.index === source.index
    ) {
      return;
    }

    const newStatus = destination.droppableId as TaskStatus;
    const taskId = Number(draggableId);

    // If moved to a different column/status
    if (source.droppableId !== destination.droppableId) {
      onStatusChange(taskId, newStatus);
    }
  };

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
          <Button
            variant={selectedProjectId === null ? "default" : "outline"}
            size="sm"
            onClick={() => onSelectProject(null)}
            className="rounded-lg text-xs font-medium whitespace-nowrap h-8"
          >
            Todos los Proyectos ({tasks.length})
          </Button>

          {projects.map((p) => {
            const isSelected = selectedProjectId === p.id;
            return (
              <Button
                key={p.id}
                variant={isSelected ? "default" : "outline"}
                size="sm"
                onClick={() => onSelectProject(p.id)}
                className={`flex items-center gap-2 rounded-lg text-xs font-medium whitespace-nowrap h-8 ${
                  isSelected ? "bg-zinc-900 text-white shadow-xs" : ""
                }`}
              >
                <span
                  className="w-2 h-2 rounded-full shrink-0"
                  style={{ backgroundColor: p.color }}
                />
                <span>{p.title}</span>
                <span
                  className={`text-[10px] px-1.5 py-0.2 rounded-full font-mono ${
                    isSelected
                      ? "bg-zinc-700 text-white"
                      : "bg-zinc-100 text-zinc-600"
                  }`}
                >
                  {p.task_count ??
                    tasks.filter((t) => t.project_id === p.id).length}
                </span>
              </Button>
            );
          })}
        </div>

        {/* Selected Project Quick Actions */}
        {currentProject && (
          <div className="flex items-center gap-1 shrink-0">
            <Button
              variant="outline"
              size="icon"
              onClick={() => onEditProject(currentProject)}
              title="Editar proyecto seleccionado"
              className="h-8 w-8"
            >
              <Edit2 className="w-3.5 h-3.5" />
            </Button>
            <Button
              variant="outline"
              size="icon"
              onClick={() => onDeleteProject(currentProject.id)}
              title="Eliminar proyecto seleccionado"
              className="h-8 w-8 text-zinc-600 hover:text-rose-600 hover:bg-rose-50"
            >
              <Trash2 className="w-3.5 h-3.5" />
            </Button>
          </div>
        )}
      </div>

      {/* 2. Filter & Controls Toolbar */}
      <Card className="p-3">
        <div className="flex flex-col sm:flex-row items-center justify-between gap-3">
          {/* Search */}
          <div className="relative w-full sm:w-72">
            <Search className="w-4 h-4 text-muted-foreground absolute left-3 top-2.5" />
            <Input
              type="text"
              placeholder="Buscar por título o nota..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="pl-9 text-xs sm:text-sm h-9"
            />
          </div>

          <div className="flex items-center gap-2 w-full sm:w-auto justify-between sm:justify-end">
            {/* Priority filter */}
            <div className="flex items-center gap-1.5">
              <Filter className="w-3.5 h-3.5 text-muted-foreground" />
              <select
                value={priorityFilter}
                onChange={(e) => setPriorityFilter(e.target.value)}
                className="px-2.5 py-1.5 text-xs rounded-lg border border-input bg-background text-foreground h-9"
              >
                <option value="ALL">Todas las prioridades</option>
                <option value="LOW">Prioridad Baja</option>
                <option value="MEDIUM">Prioridad Media</option>
                <option value="HIGH">Prioridad Alta</option>
              </select>
            </div>

            {/* View mode switch */}
            <div className="flex items-center bg-zinc-100 p-0.5 rounded-lg border border-zinc-200">
              <Button
                variant={viewMode === "kanban" ? "default" : "ghost"}
                size="icon"
                onClick={() => setViewMode("kanban")}
                className={`h-7 w-7 rounded-md ${
                  viewMode === "kanban"
                    ? "bg-white text-zinc-900 shadow-xs hover:bg-white"
                    : "text-zinc-500 hover:text-zinc-900 hover:bg-transparent"
                }`}
                title="Vista Tablero Kanban con Drag and Drop"
              >
                <LayoutGrid className="w-4 h-4" />
              </Button>
              <Button
                variant={viewMode === "list" ? "default" : "ghost"}
                size="icon"
                onClick={() => setViewMode("list")}
                className={`h-7 w-7 rounded-md ${
                  viewMode === "list"
                    ? "bg-white text-zinc-900 shadow-xs hover:bg-white"
                    : "text-zinc-500 hover:text-zinc-900 hover:bg-transparent"
                }`}
                title="Vista Lista / Tabla"
              >
                <List className="w-4 h-4" />
              </Button>
            </div>
          </div>
        </div>
      </Card>

      {/* Zero projects onboarding banner */}
      {projects.length === 0 && (
        <Card className="p-6 text-center border-dashed border-2 border-zinc-200 bg-zinc-50/50">
          <div className="max-w-md mx-auto space-y-3">
            <h3 className="text-base font-semibold text-zinc-900">
              ¡Tu espacio de trabajo está listo!
            </h3>
            <p className="text-xs text-muted-foreground">
              Comienza en 0 creando tu primer proyecto temático para agrupar y gestionar tus tareas.
            </p>
            <Button
              size="sm"
              onClick={() => onNewTask()}
              className="gap-1.5 text-xs"
            >
              <Plus className="w-4 h-4" />
              <span>Crear mi primer proyecto o tarea</span>
            </Button>
          </div>
        </Card>
      )}

      {/* 3. Main Views */}
      {viewMode === "kanban" ? (
        /* Kanban Column View with Drag and Drop Support */
        isMounted ? (
          <DragDropContext onDragEnd={handleDragEnd}>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4 sm:gap-5 items-start">
              {columns.map((col) => {
                const Icon = col.icon;
                return (
                  <Droppable key={col.status} droppableId={col.status}>
                    {(provided, snapshot) => (
                      <div
                        ref={provided.innerRef}
                        {...provided.droppableProps}
                        className={`rounded-xl border p-3.5 flex flex-col min-h-[460px] transition-colors duration-150 ${
                          snapshot.isDraggingOver
                            ? "bg-zinc-100/90 border-zinc-300 ring-2 ring-zinc-400/20"
                            : "bg-zinc-50/70 border-zinc-200/80"
                        }`}
                      >
                        {/* Column Header */}
                        <div className="flex items-center justify-between mb-3 px-1">
                          <div className="flex items-center gap-2">
                            <Icon className={`w-4 h-4 ${col.color}`} />
                            <h3 className="text-xs font-semibold text-zinc-800 uppercase tracking-wider">
                              {col.title}
                            </h3>
                          </div>
                          <Badge
                            variant="outline"
                            className={`font-mono text-xs font-medium border ${col.badgeBg} ${col.badgeBorder} ${col.color}`}
                          >
                            {col.items.length}
                          </Badge>
                        </div>

                        {/* Task Items Droppable Container */}
                        <div className="space-y-3 flex-1 overflow-y-auto max-h-[calc(100vh-320px)] pr-0.5">
                          {col.items.map((task, index) => (
                            <Draggable
                              key={task.id}
                              draggableId={String(task.id)}
                              index={index}
                            >
                              {(dragProvided, dragSnapshot) => (
                                <div
                                  ref={dragProvided.innerRef}
                                  {...dragProvided.draggableProps}
                                  {...dragProvided.dragHandleProps}
                                >
                                  <TaskCard
                                    task={task}
                                    onEdit={onEditTask}
                                    onDelete={onDeleteTask}
                                    onStatusChange={onStatusChange}
                                    isDragging={dragSnapshot.isDragging}
                                  />
                                </div>
                              )}
                            </Draggable>
                          ))}

                          {provided.placeholder}

                          {col.items.length === 0 && !snapshot.isDraggingOver && (
                            <div className="h-32 border-2 border-dashed border-zinc-200 rounded-xl flex flex-col items-center justify-center p-4 text-center">
                              <p className="text-xs text-muted-foreground">
                                Arrastra tareas aquí o pulsa añadir
                              </p>
                            </div>
                          )}
                        </div>

                        {/* Add task button */}
                        <Button
                          variant="ghost"
                          onClick={() => onNewTask(col.status)}
                          className="mt-3 w-full py-2 border border-dashed border-zinc-300 rounded-lg text-xs font-medium text-muted-foreground hover:text-foreground hover:border-zinc-400 hover:bg-white/60 gap-1.5"
                        >
                          <Plus className="w-3.5 h-3.5" />
                          <span>Añadir tarea</span>
                        </Button>
                      </div>
                    )}
                  </Droppable>
                );
              })}
            </div>
          </DragDropContext>
        ) : (
          /* SSR Fallback before client mount */
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 sm:gap-5 items-start">
            {columns.map((col) => {
              const Icon = col.icon;
              return (
                <div
                  key={col.status}
                  className="bg-zinc-50/70 rounded-xl border border-zinc-200/80 p-3.5 flex flex-col min-h-[420px]"
                >
                  <div className="flex items-center justify-between mb-3 px-1">
                    <div className="flex items-center gap-2">
                      <Icon className={`w-4 h-4 ${col.color}`} />
                      <h3 className="text-xs font-semibold text-zinc-800 uppercase tracking-wider">
                        {col.title}
                      </h3>
                    </div>
                    <Badge variant="outline">{col.items.length}</Badge>
                  </div>
                  <div className="space-y-3 flex-1">
                    {col.items.map((task) => (
                      <TaskCard
                        key={task.id}
                        task={task}
                        onEdit={onEditTask}
                        onDelete={onDeleteTask}
                        onStatusChange={onStatusChange}
                      />
                    ))}
                  </div>
                </div>
              );
            })}
          </div>
        )
      ) : (
        /* List View */
        <Card className="overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs sm:text-sm">
              <thead className="bg-zinc-50 border-b border-border text-muted-foreground uppercase text-[11px] tracking-wider">
                <tr>
                  <th className="px-4 py-3 font-semibold">Tarea</th>
                  <th className="px-4 py-3 font-semibold">Proyecto</th>
                  <th className="px-4 py-3 font-semibold">Estado</th>
                  <th className="px-4 py-3 font-semibold">Prioridad</th>
                  <th className="px-4 py-3 font-semibold">Fecha Límite</th>
                  <th className="px-4 py-3 font-semibold text-right">Acciones</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-border">
                {filteredTasks.length === 0 ? (
                  <tr>
                    <td
                      colSpan={6}
                      className="text-center py-8 text-muted-foreground text-xs"
                    >
                      No se encontraron tareas coincidentes.
                    </td>
                  </tr>
                ) : (
                  filteredTasks.map((t) => (
                    <tr
                      key={t.id}
                      className="hover:bg-zinc-50/80 transition-colors"
                    >
                      <td className="px-4 py-3 font-medium text-foreground">
                        <div>{t.title}</div>
                        {t.description && (
                          <div className="text-xs text-muted-foreground font-normal line-clamp-1">
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
                          <span className="text-muted-foreground text-xs">-</span>
                        )}
                      </td>
                      <td className="px-4 py-3">
                        <select
                          value={t.status}
                          onChange={(e) =>
                            onStatusChange(t.id, e.target.value as TaskStatus)
                          }
                          className="text-xs rounded-md border border-input bg-background px-2 py-1"
                        >
                          <option value="PENDING">Pendiente</option>
                          <option value="IN_PROGRESS">En Progreso</option>
                          <option value="COMPLETED">Completada</option>
                        </select>
                      </td>
                      <td className="px-4 py-3">
                        <PriorityBadge priority={t.priority} />
                      </td>
                      <td className="px-4 py-3 text-muted-foreground text-xs">
                        {formatDate(t.due_date)}
                      </td>
                      <td className="px-4 py-3 text-right">
                        <div className="flex items-center justify-end gap-1">
                          <Button
                            variant="ghost"
                            size="icon"
                            onClick={() => onEditTask(t)}
                            className="h-7 w-7 text-muted-foreground hover:text-foreground"
                            title="Editar"
                          >
                            <Edit2 className="w-3.5 h-3.5" />
                          </Button>
                          <Button
                            variant="ghost"
                            size="icon"
                            onClick={() => onDeleteTask(t.id)}
                            className="h-7 w-7 text-muted-foreground hover:text-rose-600 hover:bg-rose-50"
                            title="Eliminar"
                          >
                            <Trash2 className="w-3.5 h-3.5" />
                          </Button>
                        </div>
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        </Card>
      )}
    </div>
  );
};
