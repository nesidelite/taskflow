"use client";

import React, { useState, useEffect, useRef } from "react";
import { Task, Project, TaskFormData, TaskStatus, TaskPriority } from "../types";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
} from "./ui/dialog";
import { Button } from "./ui/button";
import { Input } from "./ui/input";
import { Textarea } from "./ui/textarea";
import { Label } from "./ui/label";
import { CheckSquare } from "lucide-react";

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

  // Initialize form fields ONLY when modal opens
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
        const initialProjId =
          defaultProjectId || (projects.length > 0 ? projects[0].id : 0);
        setProjectId(initialProjId);
      }
      setError(null);
    }
  }, [isOpen, task, defaultProjectId, defaultStatus, projects]);

  useEffect(() => {
    if (
      isOpen &&
      !task &&
      (projectId === 0 || !projects.some((p) => p.id === projectId)) &&
      projects.length > 0
    ) {
      setProjectId(defaultProjectId || projects[0].id);
    }
  }, [isOpen, task, projectId, projects, defaultProjectId]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!title.trim()) {
      setError("El título de la tarea es obligatorio.");
      return;
    }

    const finalProjectId =
      projectId || defaultProjectId || (projects.length > 0 ? projects[0].id : 0);
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
    <Dialog open={isOpen} onOpenChange={(open) => !open && onClose()}>
      <DialogContent className="sm:max-w-lg p-0 overflow-hidden">
        {/* Header */}
        <div className="px-6 py-4 border-b border-zinc-100 bg-zinc-50/50">
          <DialogHeader className="text-left">
            <DialogTitle className="text-base font-semibold text-zinc-900 flex items-center gap-2">
              <CheckSquare className="w-4 h-4 text-zinc-600" />
              <span>{task ? "Editar Tarea" : "Nueva Tarea"}</span>
            </DialogTitle>
            <DialogDescription className="text-xs text-zinc-500">
              Detalla la actividad, estado de ejecución y fecha límite.
            </DialogDescription>
          </DialogHeader>
        </div>

        {/* Form */}
        <form onSubmit={handleSubmit}>
          <div className="p-6 space-y-4">
            {error && (
              <div className="p-3 rounded-lg bg-rose-50 border border-rose-200 text-rose-700 text-xs">
                {error}
              </div>
            )}

            <div className="space-y-1.5">
              <Label htmlFor="task-title">Título de la Tarea *</Label>
              <Input
                id="task-title"
                type="text"
                required
                maxLength={200}
                placeholder="Ej. Configurar variables de entorno en VPS"
                value={title}
                onChange={(e) => setTitle(e.target.value)}
              />
            </div>

            <div className="space-y-1.5">
              <Label htmlFor="task-project">Proyecto Asociado *</Label>
              <select
                id="task-project"
                required
                value={projectId || (projects.length > 0 ? projects[0].id : 0)}
                onChange={(e) => setProjectId(Number(e.target.value))}
                className="w-full px-3 py-2 text-sm rounded-lg border border-input bg-transparent focus-visible:outline-hidden focus-visible:ring-1 focus-visible:ring-ring transition-colors"
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

            <div className="space-y-1.5">
              <Label htmlFor="task-desc">Descripción</Label>
              <Textarea
                id="task-desc"
                rows={3}
                placeholder="Notas adicionales, requerimientos o detalles de implementación..."
                value={description}
                onChange={(e) => setDescription(e.target.value)}
              />
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
              <div className="space-y-1.5">
                <Label htmlFor="task-status">Estado</Label>
                <select
                  id="task-status"
                  value={status}
                  onChange={(e) => setStatus(e.target.value as TaskStatus)}
                  className="w-full px-2.5 py-1.5 text-xs sm:text-sm rounded-lg border border-input bg-transparent"
                >
                  <option value="PENDING">Pendiente</option>
                  <option value="IN_PROGRESS">En Progreso</option>
                  <option value="COMPLETED">Completada</option>
                </select>
              </div>

              <div className="space-y-1.5">
                <Label htmlFor="task-priority">Prioridad</Label>
                <select
                  id="task-priority"
                  value={priority}
                  onChange={(e) => setPriority(e.target.value as TaskPriority)}
                  className="w-full px-2.5 py-1.5 text-xs sm:text-sm rounded-lg border border-input bg-transparent"
                >
                  <option value="LOW">Baja</option>
                  <option value="MEDIUM">Media</option>
                  <option value="HIGH">Alta</option>
                </select>
              </div>

              <div className="space-y-1.5">
                <Label htmlFor="task-due">Fecha Límite</Label>
                <Input
                  id="task-due"
                  type="date"
                  value={dueDate}
                  onChange={(e) => setDueDate(e.target.value)}
                  className="px-2.5 py-1.5 text-xs sm:text-sm"
                />
              </div>
            </div>
          </div>

          {/* Footer */}
          <DialogFooter className="bg-zinc-50 px-6 py-3.5 border-t border-zinc-100 gap-2 sm:gap-0">
            <Button
              type="button"
              variant="outline"
              onClick={onClose}
              disabled={loading}
            >
              Cancelar
            </Button>
            <Button type="submit" disabled={loading}>
              {loading
                ? "Guardando..."
                : task
                ? "Actualizar Tarea"
                : "Crear Tarea"}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
};
