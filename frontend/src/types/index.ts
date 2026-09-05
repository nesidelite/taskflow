export type TaskStatus = 'PENDING' | 'IN_PROGRESS' | 'COMPLETED';
export type TaskPriority = 'LOW' | 'MEDIUM' | 'HIGH';

export interface ProjectSummary {
  id: number;
  title: string;
  color: string;
}

export interface Project {
  id: number;
  title: string;
  description: string | null;
  color: string;
  created_at: string;
  updated_at: string;
  task_count?: number;
}

export interface Task {
  id: number;
  title: string;
  description: string | null;
  status: TaskStatus;
  priority: TaskPriority;
  due_date: string | null;
  project_id: number;
  created_at: string;
  updated_at: string;
  project?: ProjectSummary | null;
}

export interface DashboardMetrics {
  total_projects: number;
  total_tasks: number;
  status_counts: {
    pending: number;
    in_progress: number;
    completed: number;
  };
  priority_counts: {
    low: number;
    medium: number;
    high: number;
  };
  completion_rate_percentage: number;
}

export interface ProjectFormData {
  title: string;
  description: string;
  color: string;
}

export interface TaskFormData {
  title: string;
  description: string;
  status: TaskStatus;
  priority: TaskPriority;
  due_date: string;
  project_id: number;
}
