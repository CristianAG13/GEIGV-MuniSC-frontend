import api from './api';

export interface Machinery {
  id: string;
  name: string;
  type: string;
  plate: string;
  status: 'disponible' | 'en_uso' | 'mantenimiento' | 'fuera_servicio';
  hoursWorked: number;
  lastMaintenance: string;
  currentDriver?: string;
  currentRoute?: string;
  observations?: string;
  createdAt: string;
  updatedAt: string;
}

export interface CreateMachineryRequest {
  name: string;
  type: string;
  plate: string;
  status?: string;
  hoursWorked?: number;
  lastMaintenance: string;
  currentDriver?: string;
  currentRoute?: string;
  observations?: string;
}

export const machineryService = {
  async getAll(): Promise<Machinery[]> {
    const response = await api.get('/machinery');
    return response.data;
  },

  async getById(id: string): Promise<Machinery> {
    const response = await api.get(`/machinery/${id}`);
    return response.data;
  },

  async create(data: CreateMachineryRequest): Promise<Machinery> {
    const response = await api.post('/machinery', data);
    return response.data;
  },

  async update(id: string, data: Partial<CreateMachineryRequest>): Promise<Machinery> {
    const response = await api.patch(`/machinery/${id}`, data);
    return response.data;
  },

  async delete(id: string): Promise<void> {
    await api.delete(`/machinery/${id}`);
  },

  async getByStatus(status: string): Promise<Machinery[]> {
    const response = await api.get(`/machinery?status=${status}`);
    return response.data;
  },
};