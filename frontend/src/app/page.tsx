"use client";

import React, { useState, useEffect, useCallback } from "react";
import {
  Project,
  Task,
  DashboardMetrics,
  TaskStatus,
  ProjectFormData,
  TaskFormData,
  User,
} from "../types";
import { api, getApiBaseUrl } from "../lib/api";
import { Navbar } from "../components/Navbar";
import { MetricsOverview } from "../components/MetricsOverview";
import { ProjectBoard } from "../components/ProjectBoard";
import { ProjectModal } from "../components/ProjectModal";
import { TaskModal } from "../components/TaskModal";
import { ConfirmDialog } from "../components/ConfirmDialog";
import { AuthModal } from "../components/AuthModal";
import { Button } from "../components/ui/button";
import { RefreshCw, AlertCircle, Sparkles } from "lucide-react";

export default function DashboardPage() {
  const [apiStatus, setApiStatus] = useState<"healthy" | "offline" | "loading">("loading");
  const [currentUser, setCurrentUser] = useState<User | null>(null);
  const [isAuthModalOpen, setIsAuthModalOpen] = useState<boolean>(false);

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

  // Load dashboard data based on current user session (or demo content if guest)
  const loadData = useCallback(async (isSilent = false) => {
    if (!isSilent) setLoading(true);
    else setRefreshing(true);

    try {
      // 1. Health check
      const health = await api.getHealth();
      setApiStatus(health.status === "healthy" ? "healthy" : "offline");

      // 2. Fetch concurrent data (includes token automatically if logged in)
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
        "No se pudo conectar con el servidor backend. Asegúrate de que los contenedores estén activos."
      );
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  }, []);

  // Check active user session on initial startup
  useEffect(() => {
    api
      .getMe()
      .then((user) => {
        if (user) setCurrentUser(user);
      })
      .finally(() => {
        loadData();
      });
  }, [loadData]);

  // Periodic heartbeat every 30s
  useEffect(() => {
    const timer = setInterval(() => {
      if (
        !isProjectModalOpen &&
        !isTaskModalOpen &&
        !confirmDelete.isOpen &&
        !isAuthModalOpen
      ) {
        loadData(true);
      }
    }, 30000);
    return () => clearInterval(timer);
  }, [loadData, isProjectModalOpen, isTaskModalOpen, confirmDelete.isOpen, isAuthModalOpen]);

  // Auth Actions
  const handleAuthSuccess = (user: User) => {
    setCurrentUser(user);
    setSelectedProjectId(null);
    loadData();
  };

  const handleLogout = () => {
    api.logout();
    setCurrentUser(null);
    setSelectedProjectId(null);
    loadData();
  };

  // Project Actions
  const handleOpenNewProject = () => {
    if (!currentUser) {
      setIsAuthModalOpen(true);
      return;
    }
    setEditingProject(null);
    setIsProjectModalOpen(true);
  };

  const handleEditProject = (project: Project) => {
    if (!currentUser) {
      setIsAuthModalOpen(true);
      return;
    }
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
    if (!currentUser) {
      setIsAuthModalOpen(true);
      return;
    }
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
    if (!currentUser) {
      setIsAuthModalOpen(true);
      return;
    }
    setEditingTask(null);
    setDefaultTaskStatus(status);
    setIsTaskModalOpen(true);
  };

  const handleEditTask = (task: Task) => {
    if (!currentUser) {
      setIsAuthModalOpen(true);
      return;
    }
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

  // Optimistic UI status synchronization with rollback
  const handleStatusChange = async (taskId: number, newStatus: TaskStatus) => {
    if (!currentUser) {
      setIsAuthModalOpen(true);
      return;
    }

    const currentTask = tasks.find((t) => t.id === taskId);
    if (!currentTask || currentTask.status === newStatus) return;

    const previousStatus = currentTask.status;

    // 1. Optimistic local update (zero-latency, no flickering)
    setTasks((prev) =>
      prev.map((t) => (t.id === taskId ? { ...t, status: newStatus } : t))
    );

    try {
      // 2. Persist in backend
      await api.updateTaskStatus(taskId, newStatus);
      // Reload metrics silently
      const updatedMetrics = await api.getMetrics();
      setMetrics(updatedMetrics);
    } catch (err: any) {
      console.error("Error sincronizando estado:", err);
      // 3. Rollback state seamlessly if backend failed
      setTasks((prev) =>
        prev.map((t) => (t.id === taskId ? { ...t, status: previousStatus } : t))
      );
      alert(
        err.message ||
          "No se pudo guardar el cambio de estado en el servidor. Revirtiendo..."
      );
    }
  };

  const handleDeleteTaskClick = (taskId: number) => {
    if (!currentUser) {
      setIsAuthModalOpen(true);
      return;
    }
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
    <div className="min-h-screen flex flex-col bg-background text-foreground">
      {/* 1. Header & Navigation with Responsive Mobile Menu */}
      <Navbar
        apiStatus={apiStatus}
        currentUser={currentUser}
        onOpenNewTask={() => handleOpenNewTask("PENDING")}
        onOpenNewProject={handleOpenNewProject}
        onOpenAuth={() => setIsAuthModalOpen(true)}
        onLogout={handleLogout}
      />

      {/* 2. Main Content Container */}
      <main className="flex-1 max-w-7xl w-full mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-7">
        {/* Offline Banner alert if API down */}
        {apiStatus === "offline" && (
          <div className="p-4 rounded-xl border border-rose-200 bg-rose-50/90 text-rose-800 text-xs sm:text-sm flex items-start gap-3 shadow-xs">
            <AlertCircle className="w-5 h-5 text-rose-600 shrink-0 mt-0.5" />
            <div className="flex-1">
              <span className="font-semibold">Servidor Backend Desconectado:</span> No se pudo establecer conexión con el backend en <code className="bg-rose-100 px-1 py-0.5 rounded text-rose-900">{getApiBaseUrl()}</code>.
            </div>
            <Button
              variant="outline"
              size="sm"
              onClick={() => loadData()}
              className="bg-white border-rose-300 text-rose-700 hover:bg-rose-100 h-7 text-xs"
            >
              Reintentar
            </Button>
          </div>
        )}

        {/* Demo Mode Notice for Guest Users */}
        {!currentUser && (
          <div className="p-3.5 rounded-xl border border-zinc-200 bg-white shadow-xs flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 text-xs">
            <div className="flex items-center gap-2.5">
              <div className="p-1.5 rounded-lg bg-amber-50 text-amber-700 border border-amber-200/60">
                <Sparkles className="w-4 h-4 text-amber-600" />
              </div>
              <div>
                <span className="font-semibold text-zinc-900">Modo Demostración:</span>{" "}
                <span className="text-zinc-600">
                  Estás visualizando un tablero de prueba de ejemplo. Inicia sesión o regístrate para comenzar con tus propios proyectos y tareas en blanco.
                </span>
              </div>
            </div>
            <Button
              size="sm"
              onClick={() => setIsAuthModalOpen(true)}
              className="h-7 text-xs font-medium shrink-0"
            >
              Iniciar Sesión / Registro
            </Button>
          </div>
        )}

        {/* Dashboard Title & Refresh button */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
          <div>
            <h2 className="text-2xl font-bold tracking-tight text-foreground flex items-center gap-2">
              <span>
                {currentUser
                  ? `Tablero de ${currentUser.full_name || currentUser.email.split("@")[0]}`
                  : "Panel de Control & Tareas"}
              </span>
            </h2>
            <p className="text-xs sm:text-sm text-muted-foreground mt-1">
              {currentUser
                ? "Tus proyectos y actividades organizadas en tiempo real."
                : "Organiza, arrastra y monitorea el progreso de tus tareas con sincronización instantánea."}
            </p>
          </div>

          <div className="flex items-center gap-2 self-start sm:self-auto">
            <Button
              variant="outline"
              size="sm"
              onClick={() => loadData(true)}
              disabled={refreshing}
              className="gap-1.5 text-xs font-medium text-muted-foreground hover:text-foreground h-8"
              title="Actualizar datos"
            >
              <RefreshCw className={`w-3.5 h-3.5 ${refreshing ? "animate-spin text-foreground" : ""}`} />
              <span>{refreshing ? "Actualizando..." : "Sincronizar"}</span>
            </Button>
          </div>
        </div>

        {/* 3. Metrics Overview Cards */}
        <MetricsOverview metrics={metrics} loading={loading} />

        {/* 4. Interactive Project Board with Drag and Drop */}
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

      <AuthModal
        isOpen={isAuthModalOpen}
        onClose={() => setIsAuthModalOpen(false)}
        onAuthSuccess={handleAuthSuccess}
      />
    </div>
  );
}
