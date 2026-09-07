import {
  Project,
  Task,
  DashboardMetrics,
  ProjectFormData,
  TaskFormData,
  TaskStatus,
  User,
  AuthTokenResponse,
  LoginPayload,
  RegisterPayload,
} from "../types";

const TOKEN_STORAGE_KEY = "taskflow_auth_token";

export function getAuthToken(): string | null {
  if (typeof window !== "undefined") {
    return localStorage.getItem(TOKEN_STORAGE_KEY);
  }
  return null;
}

export function setAuthToken(token: string): void {
  if (typeof window !== "undefined") {
    localStorage.setItem(TOKEN_STORAGE_KEY, token);
  }
}

export function removeAuthToken(): void {
  if (typeof window !== "undefined") {
    localStorage.removeItem(TOKEN_STORAGE_KEY);
  }
}

export function getApiBaseUrl(): string {
  if (typeof window !== "undefined") {
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

function getAuthHeaders(): Record<string, string> {
  const token = getAuthToken();
  const headers: Record<string, string> = {
    "Content-Type": "application/json",
  };
  if (token) {
    headers["Authorization"] = `Bearer ${token}`;
  }
  return headers;
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
  // System Health
  async getHealth(): Promise<{ status: string; database?: string }> {
    try {
      const res = await fetch(`${getApiBaseUrl()}/health`, { cache: "no-store" });
      return await res.json();
    } catch {
      return { status: "offline" };
    }
  },

  // Authentication & Users
  async register(data: RegisterPayload): Promise<AuthTokenResponse> {
    const res = await fetch(`${getApiBaseUrl()}/api/v1/auth/register`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(data),
    });
    const result = await handleResponse<AuthTokenResponse>(res);
    setAuthToken(result.access_token);
    return result;
  },

  async login(credentials: LoginPayload): Promise<AuthTokenResponse> {
    const res = await fetch(`${getApiBaseUrl()}/api/v1/auth/login`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(credentials),
    });
    const result = await handleResponse<AuthTokenResponse>(res);
    setAuthToken(result.access_token);
    return result;
  },

  async forgotPassword(email: string): Promise<{ message: string }> {
    const res = await fetch(`${getApiBaseUrl()}/api/v1/auth/forgot-password`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ email }),
    });
    return handleResponse<{ message: string }>(res);
  },

  async getMe(): Promise<User | null> {
    const token = getAuthToken();
    if (!token) return null;
    try {
      const res = await fetch(`${getApiBaseUrl()}/api/v1/auth/me`, {
        headers: getAuthHeaders(),
        cache: "no-store",
      });
      return await handleResponse<User>(res);
    } catch {
      removeAuthToken();
      return null;
    }
  },

  logout(): void {
    removeAuthToken();
  },

  // Metrics
  async getMetrics(): Promise<DashboardMetrics> {
    const res = await fetch(`${getApiBaseUrl()}/api/v1/metrics/`, {
      headers: getAuthHeaders(),
      cache: "no-store",
    });
    return handleResponse<DashboardMetrics>(res);
  },

  // Projects
  async getProjects(): Promise<Project[]> {
    const res = await fetch(`${getApiBaseUrl()}/api/v1/projects/`, {
      headers: getAuthHeaders(),
      cache: "no-store",
    });
    return handleResponse<Project[]>(res);
  },

  async createProject(data: ProjectFormData): Promise<Project> {
    const res = await fetch(`${getApiBaseUrl()}/api/v1/projects/`, {
      method: "POST",
      headers: getAuthHeaders(),
      body: JSON.stringify(data),
    });
    return handleResponse<Project>(res);
  },

  async updateProject(id: number, data: Partial<ProjectFormData>): Promise<Project> {
    const res = await fetch(`${getApiBaseUrl()}/api/v1/projects/${id}`, {
      method: "PUT",
      headers: getAuthHeaders(),
      body: JSON.stringify(data),
    });
    return handleResponse<Project>(res);
  },

  async deleteProject(id: number): Promise<{ message: string }> {
    const res = await fetch(`${getApiBaseUrl()}/api/v1/projects/${id}`, {
      method: "DELETE",
      headers: getAuthHeaders(),
    });
    return handleResponse<{ message: string }>(res);
  },

  // Tasks
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
    const res = await fetch(url, {
      headers: getAuthHeaders(),
      cache: "no-store",
    });
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
      headers: getAuthHeaders(),
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
      headers: getAuthHeaders(),
      body: JSON.stringify(body),
    });
    return handleResponse<Task>(res);
  },

  async updateTaskStatus(id: number, status: TaskStatus): Promise<Task> {
    const res = await fetch(`${getApiBaseUrl()}/api/v1/tasks/${id}/status`, {
      method: "PATCH",
      headers: getAuthHeaders(),
      body: JSON.stringify({ status }),
    });
    return handleResponse<Task>(res);
  },

  async deleteTask(id: number): Promise<{ message: string }> {
    const res = await fetch(`${getApiBaseUrl()}/api/v1/tasks/${id}`, {
      method: "DELETE",
      headers: getAuthHeaders(),
    });
    return handleResponse<{ message: string }>(res);
  },
};
