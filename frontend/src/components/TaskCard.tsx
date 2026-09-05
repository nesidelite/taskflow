import React from "react";
import { Task, TaskStatus } from "../types";
import { PriorityBadge } from "./PriorityBadge";
import { StatusBadge } from "./StatusBadge";
import { formatDate, isOverdue } from "../lib/utils";
import {
  Calendar,
  MoreVertical,
  Edit2,
  Trash2,
  ArrowRightCircle,
  ArrowLeftCircle,
  Clock,
} from "lucide-react";

interface TaskCardProps {
  task: Task;
  onEdit: (task: Task) => void;
  onDelete: (taskId: number) => void;
  onStatusChange: (taskId: number, newStatus: TaskStatus) => void;
}

export const TaskCard: React.FC<TaskCardProps> = ({
  task,
  onEdit,
  onDelete,
  onStatusChange,
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
    <div className="group bg-white rounded-xl border border-zinc-200/90 hover:border-zinc-300 shadow-xs hover:shadow-md transition-all duration-200 p-4 flex flex-col justify-between gap-3">
      {/* Header: Project Tag & Actions */}
      <div className="flex items-start justify-between gap-2">
        {task.project ? (
          <span
            className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-xs font-medium border"
            style={{
              backgroundColor: `${task.project.color}15`,
              borderColor: `${task.project.color}40`,
              color: task.project.color,
            }}
          >
            <span
              className="w-1.5 h-1.5 rounded-full"
              style={{ backgroundColor: task.project.color }}
            />
            {task.project.title}
          </span>
        ) : (
          <span className="text-xs text-zinc-400">Sin proyecto</span>
        )}

        {/* Action icons */}
        <div className="flex items-center gap-1 opacity-80 group-hover:opacity-100 transition-opacity">
          <button
            onClick={() => onEdit(task)}
            title="Editar tarea"
            className="p-1 rounded-md text-zinc-400 hover:text-zinc-700 hover:bg-zinc-100 transition-colors"
          >
            <Edit2 className="w-3.5 h-3.5" />
          </button>
          <button
            onClick={() => onDelete(task.id)}
            title="Eliminar tarea"
            className="p-1 rounded-md text-zinc-400 hover:text-rose-600 hover:bg-rose-50 transition-colors"
          >
            <Trash2 className="w-3.5 h-3.5" />
          </button>
        </div>
      </div>

      {/* Body: Title and Description */}
      <div>
        <h4 className="text-sm font-semibold text-zinc-900 leading-snug group-hover:text-zinc-950">
          {task.title}
        </h4>
        {task.description && (
          <p className="text-xs text-zinc-500 mt-1 line-clamp-2 leading-relaxed">
            {task.description}
          </p>
        )}
      </div>

      {/* Meta: Priority & Due Date */}
      <div className="flex items-center justify-between gap-2 pt-2 border-t border-zinc-100 text-xs">
        <PriorityBadge priority={task.priority} />

        <div
          className={`inline-flex items-center gap-1 text-xs ${
            overdue
              ? "text-rose-600 font-medium bg-rose-50 px-1.5 py-0.5 rounded border border-rose-200"
              : "text-zinc-500"
          }`}
          title={overdue ? "Tarea vencida" : "Fecha límite"}
        >
          <Calendar className="w-3.5 h-3.5" />
          <span>{formatDate(task.due_date)}</span>
        </div>
      </div>

      {/* Quick Move Status Footer */}
      <div className="pt-2 border-t border-zinc-100/70 flex items-center justify-between text-xs text-zinc-500">
        <div>
          {prevStatus && (
            <button
              onClick={() => onStatusChange(task.id, prevStatus)}
              className="inline-flex items-center gap-1 text-zinc-500 hover:text-zinc-800 transition-colors text-[11px] font-medium"
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
              onClick={() => onStatusChange(task.id, nextStatus)}
              className="inline-flex items-center gap-1 text-zinc-700 hover:text-zinc-950 transition-colors text-[11px] font-medium bg-zinc-100 hover:bg-zinc-200 px-2 py-0.5 rounded"
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
