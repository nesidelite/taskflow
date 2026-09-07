import React from "react";
import { Task, TaskStatus } from "../types";
import { PriorityBadge } from "./PriorityBadge";
import { formatDate, isOverdue } from "../lib/utils";
import { Button } from "./ui/button";
import {
  Calendar,
  Edit2,
  Trash2,
  ArrowRightCircle,
  ArrowLeftCircle,
  GripVertical,
} from "lucide-react";

interface TaskCardProps {
  task: Task;
  onEdit: (task: Task) => void;
  onDelete: (taskId: number) => void;
  onStatusChange: (taskId: number, newStatus: TaskStatus) => void;
  isDragging?: boolean;
}

export const TaskCard: React.FC<TaskCardProps> = ({
  task,
  onEdit,
  onDelete,
  onStatusChange,
  isDragging = false,
}) => {
  const overdue = isOverdue(task.due_date, task.status);

  const getNextStatus = (current: TaskStatus): TaskStatus | null => {
    if (current === "PENDING") return "IN_PROGRESS";
    if (current === "IN_PROGRESS") return "COMPLETED";
    return null;
  };

  const getPrevStatus = (current: TaskStatus): TaskStatus | null => {
    if (current === "COMPLETED") return "IN_PROGRESS";
    if (current === "IN_PROGRESS") return "PENDING";
    return null;
  };

  const nextStatus = getNextStatus(task.status);
  const prevStatus = getPrevStatus(task.status);

  return (
    <div
      className={`group bg-card text-card-foreground rounded-xl border border-border shadow-xs hover:shadow-md transition-all duration-150 p-4 flex flex-col justify-between gap-3 select-none ${
        isDragging
          ? "shadow-xl ring-2 ring-primary/25 border-primary/40 rotate-1 scale-[1.02] bg-white cursor-grabbing"
          : "hover:border-zinc-300 cursor-grab"
      }`}
    >
      {/* Header: Drag Grip, Project Tag & Actions */}
      <div className="flex items-start justify-between gap-2">
        <div className="flex items-center gap-1.5 overflow-hidden">
          <span
            className="text-zinc-300 group-hover:text-zinc-500 transition-colors shrink-0 cursor-grab"
            title="Arrastra para mover entre estados"
          >
            <GripVertical className="w-4 h-4" />
          </span>

          {task.project ? (
            <span
              className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-xs font-medium border truncate"
              style={{
                backgroundColor: `${task.project.color}15`,
                borderColor: `${task.project.color}40`,
                color: task.project.color,
              }}
            >
              <span
                className="w-1.5 h-1.5 rounded-full shrink-0"
                style={{ backgroundColor: task.project.color }}
              />
              <span className="truncate">{task.project.title}</span>
            </span>
          ) : (
            <span className="text-xs text-muted-foreground">Sin proyecto</span>
          )}
        </div>

        {/* Action icons */}
        <div className="flex items-center gap-0.5 opacity-80 group-hover:opacity-100 transition-opacity shrink-0">
          <Button
            variant="ghost"
            size="icon"
            onClick={(e) => {
              e.stopPropagation();
              onEdit(task);
            }}
            title="Editar tarea"
            className="h-7 w-7 text-zinc-400 hover:text-zinc-700 hover:bg-zinc-100"
          >
            <Edit2 className="w-3.5 h-3.5" />
          </Button>
          <Button
            variant="ghost"
            size="icon"
            onClick={(e) => {
              e.stopPropagation();
              onDelete(task.id);
            }}
            title="Eliminar tarea"
            className="h-7 w-7 text-zinc-400 hover:text-rose-600 hover:bg-rose-50"
          >
            <Trash2 className="w-3.5 h-3.5" />
          </Button>
        </div>
      </div>

      {/* Body: Title and Description */}
      <div>
        <h4 className="text-sm font-semibold text-zinc-900 leading-snug group-hover:text-zinc-950">
          {task.title}
        </h4>
        {task.description && (
          <p className="text-xs text-muted-foreground mt-1 line-clamp-2 leading-relaxed">
            {task.description}
          </p>
        )}
      </div>

      {/* Meta: Priority & Due Date */}
      <div className="flex items-center justify-between gap-2 pt-2 border-t border-border/80 text-xs">
        <PriorityBadge priority={task.priority} />

        <div
          className={`inline-flex items-center gap-1 text-xs ${
            overdue
              ? "text-rose-600 font-medium bg-rose-50 px-1.5 py-0.5 rounded border border-rose-200"
              : "text-muted-foreground"
          }`}
          title={overdue ? "Tarea vencida" : "Fecha límite"}
        >
          <Calendar className="w-3.5 h-3.5" />
          <span>{formatDate(task.due_date)}</span>
        </div>
      </div>

      {/* Quick Move Status Footer: Requirement 3 - Keep Advance/Back buttons */}
      <div className="pt-2 border-t border-border/60 flex items-center justify-between text-xs text-muted-foreground">
        <div>
          {prevStatus && (
            <button
              type="button"
              onClick={(e) => {
                e.stopPropagation();
                onStatusChange(task.id, prevStatus);
              }}
              className="inline-flex items-center gap-1 text-zinc-500 hover:text-zinc-900 transition-colors text-[11px] font-medium p-0.5 rounded"
              title={`Mover a ${prevStatus}`}
            >
              <ArrowLeftCircle className="w-3.5 h-3.5" />
              <span>Retroceder</span>
            </button>
          )}
        </div>

        <div>
          {nextStatus && (
            <button
              type="button"
              onClick={(e) => {
                e.stopPropagation();
                onStatusChange(task.id, nextStatus);
              }}
              className="inline-flex items-center gap-1 text-zinc-700 hover:text-zinc-950 transition-colors text-[11px] font-medium bg-zinc-100 hover:bg-zinc-200 px-2 py-0.5 rounded shadow-2xs"
              title={`Avanzar a ${nextStatus}`}
            >
              <span>Avanzar</span>
              <ArrowRightCircle className="w-3.5 h-3.5" />
            </button>
          )}
        </div>
      </div>
    </div>
  );
};
