import React from "react";
import { AlertTriangle, X } from "lucide-react";

interface ConfirmDialogProps {
  isOpen: boolean;
  title: string;
  message: string;
  confirmText?: string;
  cancelText?: string;
  onConfirm: () => void;
  onCancel: () => void;
  isDangerous?: boolean;
}

export const ConfirmDialog: React.FC<ConfirmDialogProps> = ({
  isOpen,
  title,
  message,
  confirmText = "Eliminar",
  cancelText = "Cancelar",
  onConfirm,
  onCancel,
  isDangerous = true,
}) => {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/40 backdrop-blur-xs animate-in fade-in duration-150">
      <div className="relative w-full max-w-md bg-white rounded-xl shadow-xl border border-zinc-200 overflow-hidden">
        <div className="p-5">
          <div className="flex items-start gap-4">
            <div
              className={`p-2.5 rounded-full ${
                isDangerous ? "bg-rose-100 text-rose-600" : "bg-zinc-100 text-zinc-600"
              }`}
            >
              <AlertTriangle className="w-5 h-5" />
            </div>
            <div className="flex-1">
              <h3 className="text-base font-semibold text-zinc-900">{title}</h3>
              <p className="text-sm text-zinc-500 mt-1">{message}</p>
            </div>
            <button
              onClick={onCancel}
              className="text-zinc-400 hover:text-zinc-600 p-1 rounded-md"
            >
              <X className="w-4 h-4" />
            </button>
          </div>
        </div>

        <div className="bg-zinc-50 px-5 py-3 flex items-center justify-end gap-2 border-t border-zinc-100">
          <button
            onClick={onCancel}
            className="px-3.5 py-2 text-xs sm:text-sm font-medium rounded-lg text-zinc-700 bg-white border border-zinc-300 hover:bg-zinc-100 transition-colors"
          >
            {cancelText}
          </button>
          <button
            onClick={onConfirm}
            className={`px-3.5 py-2 text-xs sm:text-sm font-medium rounded-lg text-white transition-colors ${
              isDangerous
                ? "bg-rose-600 hover:bg-rose-700"
                : "bg-zinc-900 hover:bg-zinc-800"
            }`}
          >
            {confirmText}
          </button>
        </div>
      </div>
    </div>
  );
};
