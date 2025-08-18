import api from './api';

export interface FieldReport {
  id: string;
  route: string;
  workType: string;
  startTime: string;
  endTime?: string;
  materialsUsed?: Array<{ name: string; quantity: number; unit: string }>;
  observations: string;
  status: 'pendiente' | 'aprobado' | 'rechazado';
  images?: string[];
  locationLat?: number;
  locationLng?: number;
  reviewedBy?: string;
  reviewDate?: string;
  reviewComments?: string;
  driverId: string;
  machineryId: string;
  driver?: {
    id: string;
    name: string;
    email: string;
  };
  machinery?: {
    id: string;
    name: string;
    plate: string;
  };
  createdAt: string;
  updatedAt: string;
}

export interface CreateFieldReportRequest {
  route: string;
  workType: string;
  startTime: string;
  endTime?: string;
  materialsUsed?: Array<{ name: string; quantity: number; unit: string }>;
  observations: string;
  status?: string;
  images?: string[];
  locationLat?: number;
  locationLng?: number;
  driverId: string;
  machineryId: string;
}

export const fieldReportsService = {
  async getAll(): Promise<FieldReport[]> {
    const response = await api.get('/field-reports');
    return response.data;
  },

  async getById(id: string): Promise<FieldReport> {
    const response = await api.get(`/field-reports/${id}`);
    return response.data;
  },

  async create(data: CreateFieldReportRequest): Promise<FieldReport> {
    const response = await api.post('/field-reports', data);
    return response.data;
  },

  async update(id: string, data: Partial<CreateFieldReportRequest>): Promise<FieldReport> {
    const response = await api.patch(`/field-reports/${id}`, data);
    return response.data;
  },

  async delete(id: string): Promise<void> {
    await api.delete(`/field-reports/${id}`);
  },

  async getByStatus(status: string): Promise<FieldReport[]> {
    const response = await api.get(`/field-reports?status=${status}`);
    return response.data;
  },

  async getByDriver(driverId: string): Promise<FieldReport[]> {
    const response = await api.get(`/field-reports?driverId=${driverId}`);
    return response.data;
  },
};