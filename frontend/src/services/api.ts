import axios from 'axios';
import type {
  User,
  Circle,
  Story,
  Contribution,
  Invitation,
  AdminUser,
  AdminUserDetail,
  AdminCircle,
  AdminStory,
  AdminStoryDetail,
} from '../types';

const api = axios.create({
  baseURL: '/api',
  headers: {
    'Content-Type': 'application/json',
  },
});

// Add auth token to requests
api.interceptors.request.use((config) => {
  const token = localStorage.getItem('authToken');
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

// Handle auth errors
api.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response?.status === 401) {
      localStorage.removeItem('authToken');
      window.location.href = '/login';
    }
    return Promise.reject(error);
  }
);

// Auth endpoints
export const authApi = {
  login: (email: string, password: string) =>
    api.post<{ user: User; token: string }>('/auth/login', { email, password }),

  register: (email: string, password: string, name: string) =>
    api.post<{ user: User; token: string }>('/auth/register', { email, password, name }),

  logout: () => api.delete('/auth/logout'),

  getCurrentUser: () => api.get<User>('/auth/me'),
};

// Circle endpoints
export const circleApi = {
  list: () => api.get<Circle[]>('/circles'),

  get: (id: number) => api.get<Circle>(`/circles/${id}`),

  create: (data: { name: string; description?: string }) =>
    api.post<Circle>('/circles', { circle: data }),

  update: (id: number, data: { name?: string; description?: string }) =>
    api.patch<Circle>(`/circles/${id}`, { circle: data }),

  delete: (id: number) => api.delete(`/circles/${id}`),

  invite: (circleId: number, email: string) =>
    api.post<Invitation>(`/circles/${circleId}/invitations`, { email }),

  acceptInvitation: (token: string) =>
    api.post<Circle>(`/invitations/${token}/accept`),
};

// Invitation endpoints (public)
export const invitationApi = {
  get: (token: string) =>
    api.get<{ email: string; circle_name: string; inviter_name: string }>(`/invitations/${token}`),

  accept: (token: string) =>
    api.post<Circle>(`/invitations/${token}/accept`),
};

// Story endpoints
export const storyApi = {
  list: (circleId: number) => api.get<Story[]>(`/circles/${circleId}/stories`),

  get: (id: number) => api.get<Story>(`/stories/${id}`),

  create: (circleId: number, data: { title: string; prompt?: string; initialContent?: string }) =>
    api.post<Story>(`/circles/${circleId}/stories`, { story: data }),

  complete: (id: number) => api.patch<Story>(`/stories/${id}/complete`),
};

// Contribution endpoints
export const contributionApi = {
  create: (storyId: number, content: string) =>
    api.post<Contribution>(`/stories/${storyId}/contributions`, { contribution: { content } }),

  // Super admin impersonation
  createAsUser: (
    storyId: number,
    content: string,
    userId: number,
    writtenAt?: string // ISO 8601 string with timezone
  ) =>
    api.post<Contribution>(`/stories/${storyId}/contributions`, {
      contribution: { content, user_id: userId, written_at: writtenAt },
    }),
};

// Admin endpoints (super admin only)
export const adminApi = {
  // Users
  listUsers: () => api.get<AdminUser[]>('/admin/users'),

  getUser: (id: number) => api.get<AdminUserDetail>(`/admin/users/${id}`),

  impersonateUser: (id: number) =>
    api.post<{ message: string; token: string; user: User }>(`/admin/users/${id}/impersonate`),

  // Circles
  listCircles: () => api.get<AdminCircle[]>('/admin/circles'),

  getCircle: (id: number) => api.get<AdminCircle>(`/admin/circles/${id}`),

  // Stories
  listStories: () => api.get<AdminStory[]>('/admin/stories'),

  getStory: (id: number) => api.get<AdminStoryDetail>(`/admin/stories/${id}`),
};

export default api;
