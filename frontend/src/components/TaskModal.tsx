import React, { useState, useEffect, useRef } from "react";
import { Task, Project, TaskFormData, TaskStatus, TaskPriority } from "../types";
import { X } from "lucide-react";

interface TaskModalProps {
  isOpen: boolean;
  task?: Task | null;
  projects: Project[];
  defaultProjectId?: number | null;
  defaultStatus?: TaskStatus;
  onClose: () => void;
  onSubmit: (data: TaskFormData) => Promise<void>;
}

export const TaskModal: React.FC<TaskModalProps> = ({
  isOpen,
  task,
  projects,
  defaultProjectId,
  defaultStatus = "PENDING",
  onClose,
  onSubmit,
}) => {
  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [status, setStatus] = useState<TaskStatus>("PENDING");
  const [priority, setPriority] = useState<TaskPriority>("MEDIUM");
  const [dueDate, setDueDate] = useState("");
  const [projectId, setProjectId] = useState<number>(0);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const prevOpenRef = useRef(false);

  // Initialize form fields ONLY when modal opens or the task being edited changes
  useEffect(() => {
    const wasOpen = prevOpenRef.current;
    prevOpenRef.current = isOpen;

    if (!wasOpen && isOpen) {
      if (task) {
        setTitle(task.title);
        setDescription(task.description || "");
        setStatus(task.status);
        setPriority(task.priority);
        setDueDate(task.due_date ? task.due_date.split("T")[0] : "");
        setProjectId(task.project_id);
      } else {
        setTitle("");
        setDescription("");
        setStatus(defaultStatus || "PENDING");
        setPriority("MEDIUM");
        setDueDate("");
        const initialProjId = defaultProjectId || (projects.length > 0 ? projects[0].id : 0);
        setProjectId(initialProjId);
      }
      setError(null);
    }
  }, [isOpen, task, defaultProjectId, defaultStatus, projects]);

  // Ensure projectId is selected if projects load or if projectId was 0
  useEffect(() => {
    if (isOpen && !task && (projectId === 0 || !projects.some((p) => p.id === projectId)) && projects.length > 0) {
      setProjectId(defaultProjectId || projects[0].id);
    }
  }, [isOpen, task, projectId, projects, defaultProjectId]);

  if (!isOpen) return null;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!title.trim()) {
      setError("El título de la tarea es obligatorio.");
      return;
    }

    const finalProjectId = projectId || defaultProjectId || (projects.length > 0 ? projects[0].id : 0);
    if (!finalProjectId) {
      setError("Debes seleccionar un proyecto. Por favor crea uno primero si no existe.");
      return;
    }

    try {
      setLoading(true);
      setError(null);
      await onSubmit({
        title: title.trim(),
        description: description.trim(),
        status,
        priority,
        due_date: dueDate.trim(),
        project_id: finalProjectId,
      });
      onClose();
    } catch (err: any) {
      setError(err.message || "Error al procesar la tarea.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/40 backdrop-blur-xs animate-in fade-in duration-150">
      <div className="relative w-full max-w-lg bg-white rounded-xl shadow-xl border border-zinc-200 overflow-hidden">
        {/* Header */}
        <div className="px-6 py-4 border-b border-zinc-100 flex items-center justify-between">
          <div>
            <h3 className="text-base font-semibold text-zinc-900">
              {task ? "Editar Tarea" : "Nueva Tarea"}
            </h3>
            <p className="text-xs text-zinc-500 mt-0.5">
              Detalla la actividad, estado de ejecución y fecha límite.
            </p>
          </div>
          <button
            onClick={onClose}
            className="text-zinc-400 hover:text-zinc-600 p-1 rounded-md transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Form */}
        <form onSubmit={handleSubmit}>
          <div className="p-6 space-y-4">
            {error && (
              <div className="p-3 rounded-lg bg-rose-50 border border-rose-200 text-rose-700 text-xs">
                {error}
              </div>
            )}

            <div>
              <label className="block text-xs font-medium text-zinc-700 mb-1">
                Título de la Tarea *
              </label>
              <input
                type="text"
                required
                maxLength={200}
                placeholder="Ej. Configurar variables de entorno en VPS"
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                className="w-full px-3 py-2 text-sm rounded-lg border border-zinc-300 focus:outline-hidden focus:ring-2 focus:ring-zinc-900/10 focus:border-zinc-900 transition-colors"
              />
            </div>

            <div>
              <label className="block text-xs font-medium text-zinc-700 mb-1">
                Proyecto Asociado *
              </label>
              <select
                required
                value={projectId || (projects.length > 0 ? projects[0].id : 0)}
                onChange={(e) => setProjectId(Number(e.target.value))}
                className="w-full px-3 py-2 text-sm rounded-lg border border-zinc-300 bg-white focus:outline-hidden focus:ring-2 focus:ring-zinc-900/10 focus:border-zinc-900 transition-colors"
              >
                {projects.length === 0 ? (
                  <option value={0} disabled>
                    No hay proyectos registrados
                  </option>
                ) : (
                  projects.map((p) => (
                    <option key={p.id} value={p.id}>
                      {p.title}
                    </option>
                  ))
                )}
              </select>
            </div>

            <div>
              <label className="block text-xs font-medium text-zinc-700 mb-1">
                Descripción
              </label>
              <textarea
                rows={3}
                placeholder="Notas adicionales, requerimientos o detalles de implementación..."
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                className="w-full px-3 py-2 text-sm rounded-lg border border-zinc-300 focus:outline-hidden focus:ring-2 focus:ring-zinc-900/10 focus:border-zinc-900 transition-colors"
              />
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
              <div>
                <label className="block text-xs font-medium text-zinc-700 mb-1">
                  Estado
                </label>
                <select
                  value={status}
                  onChange={(e) => setStatus(e.target.value as TaskStatus)}
                  className="w-full px-2.5 py-1.5 text-xs sm:text-sm rounded-lg border border-zinc-300 bg-white"
                >
                  <option value="PENDING">Pendiente</option>
                  <option value="IN_PROGRESS">En Progreso</option>
                  <option value="COMPLETED">Completada</option>
                </select>
              </div>

              <div>
                <label className="block text-xs font-medium text-zinc-700 mb-1">
                  Prioridad
                </label>
                <select
                  value={priority}
                  onChange={(e) => setPriority(e.target.value as TaskPriority)}
                  className="w-full px-2.5 py-1.5 text-xs sm:text-sm rounded-lg border border-zinc-300 bg-white"
                >
                  <option value="LOW">Baja</option>
                  <option value="MEDIUM">Media</option>
                  <option value="HIGH">Alta</option>
                </select>
              </div>

              <div>
                <label className="block text-xs font-medium text-zinc-700 mb-1">
                  Fecha Límite
                </label>
                <input
                  type="date"
                  value={dueDate}
                  onChange={(e) => setDueDate(e.target.value)}
                  className="w-full px-2.5 py-1.5 text-xs sm:text-sm rounded-lg border border-zinc-300 bg-white"
                />
              </div>
            </div>
          </div>

          {/* Footer */}
          <div className="bg-zinc-50 px-6 py-3.5 flex items-center justify-end gap-2 border-t border-zinc-100">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 text-xs sm:text-sm font-medium rounded-lg text-zinc-700 bg-white border border-zinc-300 hover:bg-zinc-100 transition-colors"
            >
              Cancelar
            </button>
            <button
              type="submit"
              disabled={loading}
              className="px-4 py-2 text-xs sm:text-sm font-medium rounded-lg text-white bg-zinc-900 hover:bg-zinc-800 disabled:opacity-50 transition-colors shadow-sm"
            >
              {loading ? "Guardando..." : task ? "Actualizar Tarea" : "Crear Tarea"}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
