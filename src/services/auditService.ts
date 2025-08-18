import api from './api';

export interface AuditLog {
  id: string;
  action: string;
  resourceType: string;
  resourceId: string;
  details: string;
  beforeData?: any;
  afterData?: any;
  timestamp: string;
  userId: string;
  user?: {
    id: string;
    name: string;
    email: string;
  };
}

export const auditService = {
  async getAll(): Promise<AuditLog[]> {
    const response = await api.get('/audit');
    return response.data;
  },

  async getByUser(userId: string): Promise<AuditLog[]> {
    const response = await api.get(`/audit?userId=${userId}`);
    return response.data;
  },

  async getByResourceType(resourceType: string): Promise<AuditLog[]> {
    const response = await api.get(`/audit?resourceType=${resourceType}`);
    return response.data;
  },
};