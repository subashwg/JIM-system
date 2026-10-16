import type {
  Exercise,
  PaginatedResult,
  User,
  WorkoutSession,
  WorkoutTemplate,
} from '../types';

const API_BASE = '/api/v1';

class ApiService {
  private token: string | null = null;

  constructor() {
    this.token = localStorage.getItem('jim_token');
  }

  setToken(token: string | null) {
    this.token = token;
    if (token) {
      localStorage.setItem('jim_token', token);
    } else {
      localStorage.removeItem('jim_token');
    }
  }

  getToken(): string | null {
    if (!this.token) {
      this.token = localStorage.getItem('jim_token');
    }
    return this.token;
  }

  private async request<T>(endpoint: string, options: RequestInit = {}): Promise<T> {
    const headers: Record<string, string> = {
      'Content-Type': 'application/json',
      ...(options.headers as Record<string, string>),
    };

    const token = this.getToken();
    if (token) {
      headers['Authorization'] = `Bearer ${token}`;
    }

    const response = await fetch(`${API_BASE}${endpoint}`, {
      ...options,
      headers,
    });

    if (response.status === 401) {
      // Auto-clear invalid token
      this.setToken(null);
      window.dispatchEvent(new Event('jim_auth_expired'));
    }

    if (!response.ok) {
      let errorMessage = `Request failed (${response.status})`;
      try {
        const errorData = await response.json();
        if (Array.isArray(errorData.message)) {
          errorMessage = errorData.message.join(', ');
        } else if (errorData.message) {
          errorMessage = errorData.message;
        }
      } catch {
        // use default message
      }
      throw new Error(errorMessage);
    }

    // Handle 204 or empty responses
    if (response.status === 204) {
      return {} as T;
    }

    return response.json();
  }

  // --- Auth ---
  async login(credentials: { email: string; password: string }): Promise<{ accessToken: string; user: User }> {
    const res = await this.request<{ accessToken: string; user: User }>('/auth/login', {
      method: 'POST',
      body: JSON.stringify(credentials),
    });
    this.setToken(res.accessToken);
    return res;
  }

  async register(data: { email: string; password: string; displayName?: string }): Promise<{ accessToken: string; user: User }> {
    const res = await this.request<{ accessToken: string; user: User }>('/auth/register', {
      method: 'POST',
      body: JSON.stringify(data),
    });
    this.setToken(res.accessToken);
    return res;
  }

  async getMe(): Promise<User> {
    return this.request<User>('/auth/me');
  }

  // --- Exercises ---
  async getExercises(query: {
    page?: number;
    limit?: number;
    search?: string;
    movementCategory?: string;
    equipmentType?: string;
  } = {}): Promise<PaginatedResult<Exercise>> {
    const params = new URLSearchParams();
    if (query.page) params.append('page', query.page.toString());
    if (query.limit) params.append('limit', query.limit.toString());
    if (query.search) params.append('search', query.search);
    if (query.movementCategory) params.append('movementCategory', query.movementCategory);
    if (query.equipmentType) params.append('equipmentType', query.equipmentType);

    const queryString = params.toString() ? `?${params.toString()}` : '';
    return this.request<PaginatedResult<Exercise>>(`/exercises${queryString}`);
  }

  async getExercise(id: string): Promise<Exercise> {
    return this.request<Exercise>(`/exercises/${id}`);
  }

  async getExerciseHistory(id: string): Promise<any> {
    return this.request<any>(`/exercises/${id}/history`);
  }

  async createExercise(data: Partial<Exercise>): Promise<Exercise> {
    return this.request<Exercise>('/exercises', {
      method: 'POST',
      body: JSON.stringify(data),
    });
  }

  // --- Workout Templates ---
  async getTemplates(): Promise<WorkoutTemplate[]> {
    return this.request<WorkoutTemplate[]>('/workout-templates');
  }

  async getTemplate(id: string): Promise<WorkoutTemplate> {
    return this.request<WorkoutTemplate>(`/workout-templates/${id}`);
  }

  async createTemplate(data: Partial<WorkoutTemplate>): Promise<WorkoutTemplate> {
    return this.request<WorkoutTemplate>('/workout-templates', {
      method: 'POST',
      body: JSON.stringify(data),
    });
  }

  async deleteTemplate(id: string): Promise<void> {
    return this.request<void>(`/workout-templates/${id}`, {
      method: 'DELETE',
    });
  }

  // --- Workouts ---
  async getWorkouts(query: { page?: number; limit?: number; status?: string } = {}): Promise<PaginatedResult<WorkoutSession>> {
    const params = new URLSearchParams();
    if (query.page) params.append('page', query.page.toString());
    if (query.limit) params.append('limit', query.limit.toString());
    if (query.status) params.append('status', query.status);

    const queryString = params.toString() ? `?${params.toString()}` : '';
    return this.request<PaginatedResult<WorkoutSession>>(`/workouts${queryString}`);
  }

  async getWorkout(id: string): Promise<WorkoutSession> {
    return this.request<WorkoutSession>(`/workouts/${id}`);
  }

  async createWorkout(data: Partial<WorkoutSession>): Promise<WorkoutSession> {
    return this.request<WorkoutSession>('/workouts', {
      method: 'POST',
      body: JSON.stringify(data),
    });
  }

  async updateWorkout(id: string, data: Partial<WorkoutSession>): Promise<WorkoutSession> {
    return this.request<WorkoutSession>(`/workouts/${id}`, {
      method: 'PATCH',
      body: JSON.stringify(data),
    });
  }

  async deleteWorkout(id: string): Promise<void> {
    return this.request<void>(`/workouts/${id}`, {
      method: 'DELETE',
    });
  }
}

export const api = new ApiService();
