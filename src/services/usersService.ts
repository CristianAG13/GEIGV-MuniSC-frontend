import api from './api';

export interface User {
  id: string;
  name: string;
  email: string;
  role: 'conductor' | 'supervisor' | 'analista' | 'administrador';
  department: string;
  isActive: boolean;
  createdAt: string;
}

export interface CreateUserRequest {
  name: string;
  email: string;
  password: string;
  role?: string;
  department?: string;
}

export const usersService = {
  async getAll(): Promise<User[]> {
    const response = await api.get('/users');
    return response.data;
  },

  async getById(id: string): Promise<User> {
    const response = await api.get(`/users/${id}`);
    return response.data;
  },

  async create(data: CreateUserRequest): Promise<User> {
    const response = await api.post('/users', data);
    return response.data;
  },

  async update(id: string, data: Partial<CreateUserRequest>): Promise<User> {
    const response = await api.patch(`/users/${id}`, data);
    return response.data;
  },

  async delete(id: string): Promise<void> {
    await api.delete(`/users/${id}`);
  },
};