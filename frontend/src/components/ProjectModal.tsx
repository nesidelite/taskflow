import React, { useState, useEffect } from "react";
import { Project, ProjectFormData } from "../types";
import { X, Check } from "lucide-react";

interface ProjectModalProps {
  isOpen: boolean;
  project?: Project | null;
  onClose: () => void;
  onSubmit: (data: ProjectFormData) => Promise<void>;
}

const COLOR_PRESETS = [
  "#3B82F6", // Blue
  "#10B981", // Emerald
  "#F59E0B", // Amber
  "#EF4444", // Rose/Red
  "#8B5CF6", // Purple
  "#EC4899", // Pink
  "#06B6D4", // Cyan
  "#64748B", // Slate
];

export const ProjectModal: React.FC<ProjectModalProps> = ({
  isOpen,
  project,
  onClose,
  onSubmit,
}) => {
  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [color, setColor] = useState("#3B82F6");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!isOpen) return;

    if (project) {
      setTitle(project.title);
      setDescription(project.description || "");
      setColor(project.color || "#3B82F6");
    } else {
      setTitle("");
      setDescription("");
      setColor("#3B82F6");
    }
    setError(null);
  }, [project, isOpen]);

  if (!isOpen) return null;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!title.trim()) {
      setError("El título del proyecto es obligatorio.");
      return;
    }

    try {
      setLoading(true);
      setError(null);
      await onSubmit({
        title: title.trim(),
        description: description.trim(),
        color,
      });
      onClose();
    } catch (err: any) {
      setError(err.message || "Error al guardar el proyecto.");
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
              {project ? "Editar Proyecto" : "Nuevo Proyecto"}
            </h3>
            <p className="text-xs text-zinc-500 mt-0.5">
              Organiza tus tareas agrupándolas en proyectos temáticos.
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
                Título del Proyecto *
              </label>
              <input
                type="text"
                required
                maxLength={150}
                placeholder="Ej. Rediseño Web Corporativa"
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                className="w-full px-3 py-2 text-sm rounded-lg border border-zinc-300 focus:outline-hidden focus:ring-2 focus:ring-zinc-900/10 focus:border-zinc-900 transition-colors"
              />
            </div>

            <div>
              <label className="block text-xs font-medium text-zinc-700 mb-1">
                Descripción
              </label>
              <textarea
                rows={3}
                placeholder="Describe el objetivo y alcance de este proyecto..."
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                className="w-full px-3 py-2 text-sm rounded-lg border border-zinc-300 focus:outline-hidden focus:ring-2 focus:ring-zinc-900/10 focus:border-zinc-900 transition-colors"
              />
            </div>

            {/* Color Palette Picker */}
            <div>
              <label className="block text-xs font-medium text-zinc-700 mb-1.5">
                Color de Identificación
              </label>
              <div className="flex flex-wrap items-center gap-2 mb-2">
                {COLOR_PRESETS.map((preset) => (
                  <button
                    key={preset}
                    type="button"
                    onClick={() => setColor(preset)}
                    className="w-7 h-7 rounded-full flex items-center justify-center transition-transform hover:scale-110 relative"
                    style={{ backgroundColor: preset }}
                  >
                    {color.toUpperCase() === preset.toUpperCase() && (
                      <Check className="w-4 h-4 text-white stroke-[3]" />
                    )}
                  </button>
                ))}
              </div>
              <div className="flex items-center gap-2">
                <input
                  type="color"
                  value={color}
                  onChange={(e) => setColor(e.target.value)}
                  className="w-8 h-8 rounded border border-zinc-300 cursor-pointer p-0.5 bg-white"
                />
                <input
                  type="text"
                  value={color}
                  onChange={(e) => setColor(e.target.value)}
                  className="w-28 px-2 py-1 text-xs font-mono rounded border border-zinc-300"
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
              {loading ? "Guardando..." : project ? "Actualizar Proyecto" : "Crear Proyecto"}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
