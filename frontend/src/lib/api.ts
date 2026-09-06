import {
  Project,
  Task,
  DashboardMetrics,
  ProjectFormData,
  TaskFormData,
  TaskStatus,
} from "../types";

export function getApiBaseUrl(): string {
  if (typeof window !== "undefined") {
    // When running in the browser in production (not localhost/127.0.0.1),
    // always use the current origin to route through Nginx reverse proxy (port 443 / SSL)
    if (window.location.hostname !== "localhost" && window.location.hostname !== "127.0.0.1") {
      return window.location.origin.replace(/\/+$/, "");
    }
    const env = process.env.NEXT_PUBLIC_API_URL;
    if (env && !env.includes(":8000")) {
      return env.replace(/\/+$/, "");
    }
    return "http://localhost:8000";
  }
  const env = process.env.NEXT_PUBLIC_API_URL;
  if (env && !env.includes(":8000")) {
    return env.replace(/\/+$/, "");
  }
  return "http://localhost:8000";
}

async function handleResponse<T>(response: Response): Promise<T> {
  if (!response.ok) {
    let errorMessage = `Error HTTP ${response.status}`;
    try {
      const errorData = await response.json();
      if (errorData.detail) {
        errorMessage = Array.isArray(errorData.detail)
          ? errorData.detail.map((e: any) => e.msg || e).join(", ")
          : errorData.detail;
      }
    } catch {
      errorMessage = response.statusText || errorMessage;
    }
    throw new Error(errorMessage);
  }
  return response.json();
}

export const api = {
  async getHealth(): Promise<{ status: string; database?: string }> {
    try {
      const res = await fetch(`${getApiBaseUrl()}/health`, { cache: "no-store" });
      return await res.json();
    } catch {
      return { status: "offline" };
    }
  },

  async getMetrics(): Promise<DashboardMetrics> {
    const res = await fetch(`${getApiBaseUrl()}/api/v1/metrics/`, { cache: "no-store" });
    return handleResponse<DashboardMetrics>(res);
  },

  async getProjects(): Promise<Project[]> {
    const res = await fetch(`${getApiBaseUrl()}/api/v1/projects/`, { cache: "no-store" });
    return handleResponse<Project[]>(res);
  },

  async createProject(data: ProjectFormData): Promise<Project> {
    const res = await fetch(`${getApiBaseUrl()}/api/v1/projects/`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(data),
    });
    return handleResponse<Project>(res);
  },

  async updateProject(id: number, data: Partial<ProjectFormData>): Promise<Project> {
    const res = await fetch(`${getApiBaseUrl()}/api/v1/projects/${id}`, {
      method: "PUT",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(data),
    });
    return handleResponse<Project>(res);
  },

  async deleteProject(id: number): Promise<{ message: string }> {
    const res = await fetch(`${getApiBaseUrl()}/api/v1/projects/${id}`, {
      method: "DELETE",
    });
    return handleResponse<{ message: string }>(res);
  },

  async getTasks(filters?: {
    projectId?: number;
    status?: string;
    priority?: string;
    search?: string;
  }): Promise<Task[]> {
    const params = new URLSearchParams();
    if (filters?.projectId) params.append("project_id", filters.projectId.toString());
    if (filters?.status && filters.status !== "ALL") params.append("status", filters.status);
    if (filters?.priority && filters.priority !== "ALL") params.append("priority", filters.priority);
    if (filters?.search && filters.search.trim()) params.append("search", filters.search.trim());

    const qs = params.toString();
    const url = qs ? `${getApiBaseUrl()}/api/v1/tasks/?${qs}` : `${getApiBaseUrl()}/api/v1/tasks/`;
    const res = await fetch(url, { cache: "no-store" });
    return handleResponse<Task[]>(res);
  },

  async createTask(data: TaskFormData): Promise<Task> {
    const body: any = {
      title: data.title,
      description: data.description || null,
      status: data.status,
      priority: data.priority,
      project_id: Number(data.project_id),
      due_date: data.due_date && data.due_date.trim() ? data.due_date.trim() : null,
    };
    const res = await fetch(`${getApiBaseUrl()}/api/v1/tasks/`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(body),
    });
    return handleResponse<Task>(res);
  },

  async updateTask(id: number, data: Partial<TaskFormData>): Promise<Task> {
    const body: any = { ...data };
    if (body.project_id !== undefined) body.project_id = Number(body.project_id);
    if (body.due_date === "" || (typeof body.due_date === "string" && !body.due_date.trim())) {
      body.due_date = null;
    }

    const res = await fetch(`${getApiBaseUrl()}/api/v1/tasks/${id}`, {
      method: "PUT",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(body),
    });
    return handleResponse<Task>(res);
  },

  async updateTaskStatus(id: number, status: TaskStatus): Promise<Task> {
    const res = await fetch(`${getApiBaseUrl()}/api/v1/tasks/${id}/status`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ status }),
    });
    return handleResponse<Task>(res);
  },

  async deleteTask(id: number): Promise<{ message: string }> {
    const res = await fetch(`${getApiBaseUrl()}/api/v1/tasks/${id}`, {
      method: "DELETE",
    });
    return handleResponse<{ message: string }>(res);
  },
};
