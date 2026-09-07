"use client";

import React, { useState } from "react";
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
import { Label } from "./ui/label";
import { api } from "../lib/api";
import { User } from "../types";
import {
  Sparkles,
  Lock,
  Mail,
  User as UserIcon,
  AlertCircle,
  CheckCircle2,
  ArrowRight,
  CheckSquare,
} from "lucide-react";

interface AuthModalProps {
  isOpen: boolean;
  onClose: () => void;
  onAuthSuccess: (user: User) => void;
}

type AuthTab = "login" | "register" | "forgot";

export const AuthModal: React.FC<AuthModalProps> = ({
  isOpen,
  onClose,
  onAuthSuccess,
}) => {
  const [tab, setTab] = useState<AuthTab>("login");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [fullName, setFullName] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [successMessage, setSuccessMessage] = useState<string | null>(null);

  const resetForm = () => {
    setEmail("");
    setPassword("");
    setFullName("");
    setError(null);
    setSuccessMessage(null);
  };

  const handleTabChange = (newTab: AuthTab) => {
    setTab(newTab);
    setError(null);
    setSuccessMessage(null);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setSuccessMessage(null);

    if (!email.trim()) {
      setError("Por favor ingresa un correo electrónico.");
      return;
    }

    if (tab !== "forgot" && !password) {
      setError("Por favor ingresa tu contraseña.");
      return;
    }

    if (tab === "register" && password.length < 8) {
      setError("La contraseña debe tener al menos 8 caracteres.");
      return;
    }

    try {
      setLoading(true);
      if (tab === "login") {
        const response = await api.login({ email: email.trim(), password });
        onAuthSuccess(response.user);
        resetForm();
        onClose();
      } else if (tab === "register") {
        const response = await api.register({
          email: email.trim(),
          password,
          full_name: fullName.trim() || undefined,
        });
        onAuthSuccess(response.user);
        resetForm();
        onClose();
      } else if (tab === "forgot") {
        const response = await api.forgotPassword(email.trim());
        setSuccessMessage(response.message);
      }
    } catch (err: any) {
      if (err.message && err.message.includes("429")) {
        setError("Límite de solicitudes alcanzado. Por favor espera unos momentos antes de reintentar.");
      } else {
        setError(err.message || "Ocurrió un error en el proceso. Intenta nuevamente.");
      }
    } finally {
      setLoading(false);
    }
  };

  return (
    <Dialog open={isOpen} onOpenChange={(open) => !open && onClose()}>
      <DialogContent className="sm:max-w-[440px] p-0 overflow-hidden border-zinc-200">
        {/* Banner with Tabs */}
        <div className="bg-zinc-900 text-white p-6 pb-5">
          <div className="flex items-center gap-2.5 mb-3">
            <div className="p-2 rounded-lg bg-white/10 text-white backdrop-blur-xs">
              <Sparkles className="w-5 h-5 text-amber-400" />
            </div>
            <div>
              <h2 className="text-base font-semibold leading-tight text-white">
                TaskFlow Workspace
              </h2>
              <p className="text-xs text-zinc-300">
                Tu espacio de trabajo para organizar proyectos y tareas
              </p>
            </div>
          </div>

          {/* Tab Switcher */}
          <div className="flex rounded-lg bg-zinc-800/80 p-1 mt-3 text-xs font-medium">
            <button
              type="button"
              onClick={() => handleTabChange("login")}
              className={`flex-1 py-1.5 rounded-md transition-all text-center ${
                tab === "login"
                  ? "bg-white text-zinc-900 shadow-xs font-semibold"
                  : "text-zinc-400 hover:text-white"
              }`}
            >
              Iniciar Sesión
            </button>
            <button
              type="button"
              onClick={() => handleTabChange("register")}
              className={`flex-1 py-1.5 rounded-md transition-all text-center ${
                tab === "register"
                  ? "bg-white text-zinc-900 shadow-xs font-semibold"
                  : "text-zinc-400 hover:text-white"
              }`}
            >
              Crear Cuenta
            </button>
          </div>
        </div>

        {/* Form Body */}
        <form onSubmit={handleSubmit} className="p-6 space-y-4 pt-4">
          <DialogHeader className="text-left space-y-1">
            <DialogTitle className="text-base">
              {tab === "login" && "Bienvenido a tu tablero"}
              {tab === "register" && "Comienza con TaskFlow"}
              {tab === "forgot" && "Recuperar Acceso"}
            </DialogTitle>
            <DialogDescription className="text-xs">
              {tab === "login" && "Ingresa a tu cuenta para acceder a tus tableros y proyectos personales."}
              {tab === "register" && "Crea tu cuenta gratuita para personalizar y gestionar tus propias actividades."}
              {tab === "forgot" && "Ingresa tu correo para recibir las instrucciones de acceso."}
            </DialogDescription>
          </DialogHeader>

          {/* Feedback alerts */}
          {error && (
            <div className="p-3 rounded-lg bg-rose-50 border border-rose-200 text-rose-700 text-xs flex items-start gap-2 animate-in fade-in">
              <AlertCircle className="w-4 h-4 shrink-0 mt-0.5 text-rose-600" />
              <span>{error}</span>
            </div>
          )}

          {successMessage && (
            <div className="p-3 rounded-lg bg-emerald-50 border border-emerald-200 text-emerald-800 text-xs flex items-start gap-2 animate-in fade-in">
              <CheckCircle2 className="w-4 h-4 shrink-0 mt-0.5 text-emerald-600" />
              <span>{successMessage}</span>
            </div>
          )}

          {/* Input fields */}
          <div className="space-y-3.5">
            {tab === "register" && (
              <div className="space-y-1.5">
                <Label htmlFor="fullname">Nombre Completo</Label>
                <div className="relative">
                  <UserIcon className="w-4 h-4 absolute left-3 top-2.5 text-zinc-400" />
                  <Input
                    id="fullname"
                    placeholder="Ej. Ana Pérez"
                    value={fullName}
                    onChange={(e) => setFullName(e.target.value)}
                    className="pl-9"
                  />
                </div>
              </div>
            )}

            <div className="space-y-1.5">
              <Label htmlFor="email">Correo Electrónico *</Label>
              <div className="relative">
                <Mail className="w-4 h-4 absolute left-3 top-2.5 text-zinc-400" />
                <Input
                  id="email"
                  type="email"
                  required
                  placeholder="usuario@ejemplo.com"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className="pl-9"
                />
              </div>
            </div>

            {tab !== "forgot" && (
              <div className="space-y-1.5">
                <div className="flex items-center justify-between">
                  <Label htmlFor="password">Contraseña *</Label>
                  {tab === "login" && (
                    <button
                      type="button"
                      onClick={() => handleTabChange("forgot")}
                      className="text-[11px] text-zinc-500 hover:text-zinc-900 transition-colors"
                    >
                      ¿Olvidaste tu contraseña?
                    </button>
                  )}
                </div>
                <div className="relative">
                  <Lock className="w-4 h-4 absolute left-3 top-2.5 text-zinc-400" />
                  <Input
                    id="password"
                    type="password"
                    required
                    placeholder={tab === "register" ? "Mínimo 8 caracteres" : "Tu contraseña"}
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    className="pl-9"
                  />
                </div>
              </div>
            )}

            {tab === "forgot" && (
              <button
                type="button"
                onClick={() => handleTabChange("login")}
                className="text-xs text-zinc-600 hover:text-zinc-900 inline-flex items-center gap-1 font-medium"
              >
                Volver al inicio de sesión
              </button>
            )}
          </div>

          {/* Attractive feature callout */}
          <div className="p-3 rounded-lg bg-zinc-50 border border-zinc-200/80 text-[11px] text-zinc-600 flex items-center gap-2.5">
            <CheckSquare className="w-4 h-4 text-emerald-600 shrink-0" />
            <span>
              Gestiona tareas con tableros interactivos, arrastra actividades en tiempo real y sincroniza tu progreso.
            </span>
          </div>

          {/* Action buttons */}
          <DialogFooter className="pt-2 gap-2 sm:gap-0">
            <Button
              type="button"
              variant="outline"
              onClick={onClose}
              disabled={loading}
            >
              Cancelar
            </Button>
            <Button
              type="submit"
              disabled={loading}
              className="gap-1.5"
            >
              <span>
                {loading
                  ? "Procesando..."
                  : tab === "login"
                  ? "Iniciar Sesión"
                  : tab === "register"
                  ? "Comenzar Ahora"
                  : "Enviar Enlace"}
              </span>
              <ArrowRight className="w-3.5 h-3.5" />
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
};
