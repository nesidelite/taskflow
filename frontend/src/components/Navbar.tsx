"use client";

import React, { useState } from "react";
import { User } from "../types";
import { Button } from "./ui/button";
import { Badge } from "./ui/badge";
import {
  CheckSquare,
  Plus,
  Layers,
  LogIn,
  LogOut,
  Menu,
  X,
  User as UserIcon,
} from "lucide-react";

interface NavbarProps {
  apiStatus: "healthy" | "offline" | "loading";
  currentUser: User | null;
  onOpenNewTask: () => void;
  onOpenNewProject: () => void;
  onOpenAuth: () => void;
  onLogout: () => void;
}

export const Navbar: React.FC<NavbarProps> = ({
  apiStatus,
  currentUser,
  onOpenNewTask,
  onOpenNewProject,
  onOpenAuth,
  onLogout,
}) => {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  const closeMobileMenu = () => setMobileMenuOpen(false);

  return (
    <header className="sticky top-0 z-30 w-full border-b border-border/80 bg-background/95 backdrop-blur-sm supports-[backdrop-filter]:bg-background/80">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between">
        {/* Brand */}
        <div className="flex items-center gap-3">
          <div className="h-9 w-9 rounded-lg bg-primary text-primary-foreground flex items-center justify-center shadow-xs">
            <CheckSquare className="w-5 h-5 text-zinc-100" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h1 className="text-base font-semibold text-foreground tracking-tight">
                TaskFlow
              </h1>
              <Badge
                variant="outline"
                className="text-[10px] font-mono uppercase px-1.5 py-0.2 bg-zinc-100 text-zinc-600 border-zinc-200"
              >
                v2.0
              </Badge>
            </div>
            <p className="text-xs text-muted-foreground hidden sm:block">
              Task Tracker & Project Board
            </p>
          </div>
        </div>

        {/* Desktop Controls (md and up) */}
        <div className="hidden md:flex items-center gap-3">
          {/* API Server status badge */}
          <div className="flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-medium border bg-zinc-50 border-zinc-200 text-zinc-600">
            <span
              className={`h-2 w-2 rounded-full ${
                apiStatus === "healthy"
                  ? "bg-emerald-500 animate-pulse"
                  : apiStatus === "offline"
                  ? "bg-rose-500"
                  : "bg-amber-400 animate-spin"
              }`}
            />
            <span>
              {apiStatus === "healthy"
                ? "Online"
                : apiStatus === "offline"
                ? "Offline"
                : "Conectando..."}
            </span>
          </div>

          <Button
            variant="outline"
            size="sm"
            onClick={onOpenNewProject}
            className="gap-1.5 h-8 text-xs font-medium"
          >
            <Layers className="w-4 h-4 text-zinc-500" />
            <span>Nuevo Proyecto</span>
          </Button>

          <Button
            size="sm"
            onClick={onOpenNewTask}
            className="gap-1.5 h-8 text-xs font-medium shadow-xs"
          >
            <Plus className="w-4 h-4" />
            <span>Nueva Tarea</span>
          </Button>

          {/* User Auth Section */}
          <div className="border-l border-border pl-3 ml-1">
            {currentUser ? (
              <div className="flex items-center gap-2">
                <div
                  className="w-8 h-8 rounded-full bg-zinc-900 text-white flex items-center justify-center text-xs font-bold shadow-xs ring-1 ring-zinc-200"
                  title={currentUser.email}
                >
                  {currentUser.full_name
                    ? currentUser.full_name
                        .split(" ")
                        .map((n) => n[0])
                        .slice(0, 2)
                        .join("")
                        .toUpperCase()
                    : currentUser.email[0].toUpperCase()}
                </div>
                <div className="hidden lg:block text-left">
                  <div className="text-xs font-semibold text-zinc-800 leading-tight truncate max-w-[120px]">
                    {currentUser.full_name || currentUser.email.split("@")[0]}
                  </div>
                  <div className="text-[10px] text-zinc-400 truncate max-w-[120px]">
                    {currentUser.email}
                  </div>
                </div>
                <Button
                  variant="ghost"
                  size="icon"
                  onClick={onLogout}
                  title="Cerrar sesión"
                  className="h-8 w-8 text-zinc-400 hover:text-rose-600 hover:bg-rose-50"
                >
                  <LogOut className="w-4 h-4" />
                </Button>
              </div>
            ) : (
              <Button
                variant="secondary"
                size="sm"
                onClick={onOpenAuth}
                className="gap-1.5 text-xs font-medium h-8"
              >
                <LogIn className="w-3.5 h-3.5 text-zinc-600" />
                <span>Acceder</span>
              </Button>
            )}
          </div>
        </div>

        {/* Mobile Hamburger Toggle Button */}
        <div className="flex md:hidden items-center gap-2">
          {currentUser && (
            <div
              className="w-7 h-7 rounded-full bg-zinc-900 text-white flex items-center justify-center text-xs font-bold"
              title={currentUser.email}
            >
              {currentUser.email[0].toUpperCase()}
            </div>
          )}
          <Button
            variant="outline"
            size="icon"
            onClick={() => setMobileMenuOpen((prev) => !prev)}
            className="h-9 w-9"
            aria-label="Abrir menú de navegación"
          >
            {mobileMenuOpen ? (
              <X className="w-5 h-5 text-foreground" />
            ) : (
              <Menu className="w-5 h-5 text-foreground" />
            )}
          </Button>
        </div>
      </div>

      {/* Mobile Drawer / Expandable Menu (Responsive) */}
      {mobileMenuOpen && (
        <div className="md:hidden border-t border-border bg-background px-4 py-4 space-y-3 animate-in slide-in-from-top-2 duration-150 shadow-lg">
          {/* User profile / Login banner */}
          <div className="p-3 rounded-lg bg-zinc-50 border border-zinc-200">
            {currentUser ? (
              <div className="flex items-center justify-between gap-3">
                <div className="flex items-center gap-2.5 overflow-hidden">
                  <div className="w-8 h-8 rounded-full bg-zinc-900 text-white flex items-center justify-center text-xs font-bold shrink-0">
                    {currentUser.email[0].toUpperCase()}
                  </div>
                  <div className="overflow-hidden">
                    <div className="text-xs font-semibold text-zinc-900 truncate">
                      {currentUser.full_name || currentUser.email.split("@")[0]}
                    </div>
                    <div className="text-[11px] text-zinc-500 truncate">
                      {currentUser.email}
                    </div>
                  </div>
                </div>
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => {
                    closeMobileMenu();
                    onLogout();
                  }}
                  className="h-8 text-xs text-rose-600 hover:bg-rose-50"
                >
                  <LogOut className="w-3.5 h-3.5 mr-1" />
                  <span>Salir</span>
                </Button>
              </div>
            ) : (
              <div className="flex items-center justify-between gap-3">
                <div className="text-xs text-zinc-600">
                  Inicia sesión para ver tus proyectos
                </div>
                <Button
                  size="sm"
                  onClick={() => {
                    closeMobileMenu();
                    onOpenAuth();
                  }}
                  className="h-8 text-xs gap-1.5"
                >
                  <LogIn className="w-3.5 h-3.5" />
                  <span>Acceder</span>
                </Button>
              </div>
            )}
          </div>

          {/* Action Buttons */}
          <div className="grid grid-cols-2 gap-2">
            <Button
              variant="outline"
              size="sm"
              onClick={() => {
                closeMobileMenu();
                onOpenNewProject();
              }}
              className="gap-1.5 h-9 text-xs font-medium justify-center"
            >
              <Layers className="w-4 h-4 text-zinc-500" />
              <span>Nuevo Proyecto</span>
            </Button>

            <Button
              size="sm"
              onClick={() => {
                closeMobileMenu();
                onOpenNewTask();
              }}
              className="gap-1.5 h-9 text-xs font-medium justify-center"
            >
              <Plus className="w-4 h-4" />
              <span>Nueva Tarea</span>
            </Button>
          </div>

          {/* API Health */}
          <div className="pt-2 border-t border-border/60 flex items-center justify-between text-xs text-muted-foreground">
            <span>Estado</span>
            <div className="flex items-center gap-1.5">
              <span
                className={`h-2 w-2 rounded-full ${
                  apiStatus === "healthy"
                    ? "bg-emerald-500"
                    : apiStatus === "offline"
                    ? "bg-rose-500"
                    : "bg-amber-400"
                }`}
              />
              <span className="font-medium text-foreground">
                {apiStatus === "healthy" ? "En Línea" : "Desconectado"}
              </span>
            </div>
          </div>
        </div>
      )}
    </header>
  );
};
