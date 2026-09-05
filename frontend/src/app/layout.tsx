import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "TaskFlow | Gestor de Proyectos y Tareas",
  description: "Tablero moderno y minimalista de seguimiento de proyectos y tareas.",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="es" className="h-full bg-slate-50">
      <body className="h-full antialiased text-zinc-900 selection:bg-zinc-900 selection:text-white">
        {children}
      </body>
    </html>
  );
}
