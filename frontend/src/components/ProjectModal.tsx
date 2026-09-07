"use client";

import React, { useState, useEffect } from "react";
import { Project, ProjectFormData } from "../types";
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
import { Check, FolderPlus, Palette } from "lucide-react";

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
    <Dialog open={isOpen} onOpenChange={(open) => !open && onClose()}>
      <DialogContent className="sm:max-w-lg p-0 overflow-hidden">
        {/* Header */}
        <div className="px-6 py-4 border-b border-zinc-100 bg-zinc-50/50">
          <DialogHeader className="text-left">
            <DialogTitle className="text-base font-semibold text-zinc-900 flex items-center gap-2">
              <FolderPlus className="w-4 h-4 text-zinc-600" />
              <span>{project ? "Editar Proyecto" : "Nuevo Proyecto"}</span>
            </DialogTitle>
            <DialogDescription className="text-xs text-zinc-500">
              Organiza tus tareas agrupándolas en proyectos temáticos.
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
              <Label htmlFor="project-title">Título del Proyecto *</Label>
              <Input
                id="project-title"
                type="text"
                required
                maxLength={150}
                placeholder="Ej. Rediseño Web Corporativa"
                value={title}
                onChange={(e) => setTitle(e.target.value)}
              />
            </div>

            <div className="space-y-1.5">
              <Label htmlFor="project-desc">Descripción</Label>
              <Textarea
                id="project-desc"
                rows={3}
                placeholder="Describe el objetivo y alcance de este proyecto..."
                value={description}
                onChange={(e) => setDescription(e.target.value)}
              />
            </div>

            {/* Color Palette Picker */}
            <div className="space-y-1.5">
              <Label className="flex items-center gap-1.5">
                <Palette className="w-3.5 h-3.5 text-zinc-500" />
                <span>Color de Identificación</span>
              </Label>
              <div className="flex flex-wrap items-center gap-2 pt-1 pb-2">
                {COLOR_PRESETS.map((preset) => (
                  <button
                    key={preset}
                    type="button"
                    onClick={() => setColor(preset)}
                    className="w-7 h-7 rounded-full flex items-center justify-center transition-transform hover:scale-110 relative border border-black/10 shadow-xs"
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
                  className="w-8 h-8 rounded-lg border border-input cursor-pointer p-0.5 bg-white"
                />
                <Input
                  type="text"
                  value={color}
                  onChange={(e) => setColor(e.target.value)}
                  className="w-28 font-mono text-xs uppercase"
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
                : project
                ? "Actualizar Proyecto"
                : "Crear Proyecto"}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
};
