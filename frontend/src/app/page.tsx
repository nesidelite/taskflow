"use client";

import React, { useState, useEffect, useCallback } from "react";
import { Project, Task, DashboardMetrics, TaskStatus, ProjectFormData, TaskFormData } from "../types";
import { api } from "../lib/api";
import { Navbar } from "../components/Navbar";
import { MetricsOverview } from "../components/MetricsOverview";
import { ProjectBoard } from "../components/ProjectBoard";
import { ProjectModal } from "../components/ProjectModal";
import { TaskModal } from "../components/TaskModal";
import { ConfirmDialog } from "../components/ConfirmDialog";
import { RefreshCw, AlertCircle, Sparkles } from "lucide-react";

export default function DashboardPage() {
  const [apiStatus, setApiStatus] = useState<"healthy" | "offline" | "loading">("loading");
  const [metrics, setMetrics] = useState<DashboardMetrics | null>(null);
  const [projects, setProjects] = useState<Project[]>([]);
  const [tasks, setTasks] = useState<Task[]>([]);
  const [selectedProjectId, setSelectedProjectId] = useState<number | null>(null);

  const [loading, setLoading] = useState<boolean>(true);
  const [refreshing, setRefreshing] = useState<boolean>(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  // Modals state
  const [isProjectModalOpen, setIsProjectModalOpen] = useState<boolean>(false);
  const [editingProject, setEditingProject] = useState<Project | null>(null);

  const [isTaskModalOpen, setIsTaskModalOpen] = useState<boolean>(false);
  const [editingTask, setEditingTask] = useState<Task | null>(null);
  const [defaultTaskStatus, setDefaultTaskStatus] = useState<TaskStatus>("PENDING");

  // Confirm delete dialog
  const [confirmDelete, setConfirmDelete] = useState<{
    isOpen: boolean;
    type: "project" | "task";
    id: number;
    title: string;
  }>({
    isOpen: false,
    type: "task",
    id: 0,
    title: "",
  });

  // Load all dashboard data
  const loadData = useCallback(async (isSilent = false) => {
    if (!isSilent) setLoading(true);
    else setRefreshing(true);

    try {
      // 1. Health check
      const health = await api.getHealth();
      setApiStatus(health.status === "healthy" ? "healthy" : "offline");

      // 2. Fetch concurrent data
      const [metricsData, projectsData, tasksData] = await Promise.all([
        api.getMetrics().catch((err) => {
          console.error("Error cargando métricas:", err);
          return null;
        }),
        api.getProjects().catch((err) => {
          console.error("Error cargando proyectos:", err);
          return [];
        }),
        api.getTasks().catch((err) => {
          console.error("Error cargando tareas:", err);
          return [];
        }),
      ]);

      if (metricsData) setMetrics(metricsData);
      setProjects(projectsData);
      setTasks(tasksData);
      setErrorMessage(null);
    } catch (err: any) {
      setApiStatus("offline");
      setErrorMessage(
        "No se pudo conectar con el servidor backend. Asegúrate de que los contenedores de Docker estén activos."
      );
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  }, []);

  useEffect(() => {
    loadData();
    // Heartbeat every 30s (only when no modal is open to avoid re-render interruptions)
    const timer = setInterval(() => {
      if (!isProjectModalOpen && !isTaskModalOpen && !confirmDelete.isOpen) {
        loadData(true);
      }
    }, 30000);
    return () => clearInterval(timer);
  }, [loadData, isProjectModalOpen, isTaskModalOpen, confirmDelete.isOpen]);

  // Project Actions
  const handleOpenNewProject = () => {
    setEditingProject(null);
    setIsProjectModalOpen(true);
  };

  const handleEditProject = (project: Project) => {
    setEditingProject(project);
    setIsProjectModalOpen(true);
  };

  const handleProjectSubmit = async (formData: ProjectFormData) => {
    if (editingProject) {
      const updated = await api.updateProject(editingProject.id, formData);
      setProjects((prev) => prev.map((p) => (p.id === updated.id ? updated : p)));
    } else {
      const created = await api.createProject(formData);
      setProjects((prev) => [...prev, created]);
    }
    await loadData(true);
  };

  const handleDeleteProjectClick = (projectId: number) => {
    const proj = projects.find((p) => p.id === projectId);
    setConfirmDelete({
      isOpen: true,
      type: "project",
      id: projectId,
      title: proj ? `¿Eliminar "${proj.title}"?` : "¿Eliminar proyecto?",
    });
  };

  // Task Actions
  const handleOpenNewTask = (status: TaskStatus = "PENDING") => {
    setEditingTask(null);
    setDefaultTaskStatus(status);
    setIsTaskModalOpen(true);
  };

  const handleEditTask = (task: Task) => {
    setEditingTask(task);
    setIsTaskModalOpen(true);
  };

  const handleTaskSubmit = async (formData: TaskFormData) => {
    if (editingTask) {
      const updated = await api.updateTask(editingTask.id, formData);
      setTasks((prev) => prev.map((t) => (t.id === updated.id ? updated : t)));
    } else {
      const created = await api.createTask(formData);
      setTasks((prev) => [created, ...prev]);
    }
    await loadData(true);
  };

  const handleStatusChange = async (taskId: number, newStatus: TaskStatus) => {
    // Optimistic UI update
    setTasks((prev) =>
      prev.map((t) => (t.id === taskId ? { ...t, status: newStatus } : t))
    );
    try {
      await api.updateTaskStatus(taskId, newStatus);
      // Reload metrics silently
      const updatedMetrics = await api.getMetrics();
      setMetrics(updatedMetrics);
    } catch (err: any) {
      loadData(true);
    }
  };

  const handleDeleteTaskClick = (taskId: number) => {
    const task = tasks.find((t) => t.id === taskId);
    setConfirmDelete({
      isOpen: true,
      type: "task",
      id: taskId,
      title: task ? `¿Eliminar "${task.title}"?` : "¿Eliminar tarea?",
    });
  };

  // Confirm delete handler
  const handleConfirmDelete = async () => {
    try {
      if (confirmDelete.type === "project") {
        await api.deleteProject(confirmDelete.id);
        if (selectedProjectId === confirmDelete.id) {
          setSelectedProjectId(null);
        }
      } else {
        await api.deleteTask(confirmDelete.id);
      }
      setConfirmDelete((prev) => ({ ...prev, isOpen: false }));
      await loadData(true);
    } catch (err: any) {
      alert(err.message || "Error al eliminar");
    }
  };

  return (
    <div className="min-h-screen flex flex-col bg-slate-50 text-zinc-900">
      {/* 1. Header & Navigation */}
      <Navbar
        apiStatus={apiStatus}
        onOpenNewTask={() => handleOpenNewTask("PENDING")}
        onOpenNewProject={handleOpenNewProject}
      />

      {/* 2. Main Content Container */}
      <main className="flex-1 max-w-7xl w-full mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-7">
        {/* Offline Banner alert if API down */}
        {apiStatus === "offline" && (
          <div className="p-4 rounded-xl border border-rose-200 bg-rose-50/90 text-rose-800 text-xs sm:text-sm flex items-start gap-3 shadow-xs">
            <AlertCircle className="w-5 h-5 text-rose-600 shrink-0 mt-0.5" />
            <div className="flex-1">
              <span className="font-semibold">Servidor Backend Desconectado:</span> No se pudo establecer conexión con el backend en <code className="bg-rose-100 px-1 py-0.5 rounded text-rose-900">{process.env.NEXT_PUBLIC_API_URL || "http://localhost:8000"}</code>. Verifica que los contenedores en Docker estén iniciados con <code className="bg-rose-100 px-1 py-0.5 rounded text-rose-900">docker compose up</code>.
            </div>
            <button
              onClick={() => loadData()}
              className="px-3 py-1 bg-white border border-rose-300 hover:bg-rose-100 rounded-md font-medium text-xs text-rose-700"
            >
              Reintentar
            </button>
          </div>
        )}

        {/* Dashboard Title & Refresh button */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
          <div>
            <h2 className="text-2xl font-bold tracking-tight text-zinc-900 flex items-center gap-2">
              <span>Panel de Control & Tareas</span>
            </h2>
            <p className="text-xs sm:text-sm text-zinc-500 mt-1">
              Monitorea el progreso en tiempo real de tus proyectos y gestiona el flujo de trabajo.
            </p>
          </div>

          <div className="flex items-center gap-2 self-start sm:self-auto">
            <button
              onClick={() => loadData(true)}
              disabled={refreshing}
              className="inline-flex items-center gap-1.5 px-3 py-1.5 text-xs font-medium rounded-lg text-zinc-600 bg-white border border-zinc-200 hover:bg-zinc-50 hover:text-zinc-900 transition-colors shadow-xs"
              title="Actualizar datos"
            >
              <RefreshCw className={`w-3.5 h-3.5 ${refreshing ? "animate-spin text-zinc-900" : ""}`} />
              <span>{refreshing ? "Actualizando..." : "Sincronizar"}</span>
            </button>
          </div>
        </div>

        {/* 3. Metrics Overview Cards */}
        <MetricsOverview metrics={metrics} loading={loading} />

        {/* 4. Interactive Project Board */}
        <ProjectBoard
          projects={projects}
          tasks={tasks}
          selectedProjectId={selectedProjectId}
          onSelectProject={setSelectedProjectId}
          onEditProject={handleEditProject}
          onDeleteProject={handleDeleteProjectClick}
          onNewTask={handleOpenNewTask}
          onEditTask={handleEditTask}
          onDeleteTask={handleDeleteTaskClick}
          onStatusChange={handleStatusChange}
        />
      </main>

      {/* 5. Modals & Dialogs */}
      <ProjectModal
        isOpen={isProjectModalOpen}
        project={editingProject}
        onClose={() => setIsProjectModalOpen(false)}
        onSubmit={handleProjectSubmit}
      />

      <TaskModal
        isOpen={isTaskModalOpen}
        task={editingTask}
        projects={projects}
        defaultProjectId={selectedProjectId}
        defaultStatus={defaultTaskStatus}
        onClose={() => setIsTaskModalOpen(false)}
        onSubmit={handleTaskSubmit}
      />

      <ConfirmDialog
        isOpen={confirmDelete.isOpen}
        title={confirmDelete.title}
        message={
          confirmDelete.type === "project"
            ? "Esta acción eliminará el proyecto y todas las tareas asociadas de forma irreversible."
            : "Esta acción eliminará la tarea permanentemente."
        }
        confirmText="Eliminar Definitivamente"
        isDangerous={true}
        onConfirm={handleConfirmDelete}
        onCancel={() => setConfirmDelete((prev) => ({ ...prev, isOpen: false }))}
      />
    </div>
  );
}
