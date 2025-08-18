// import api from './api';

// export interface DashboardStats {
//   machinery: {
//     total: number;
//     available: number;
//     inUse: number;
//     maintenance: number;
//     outOfService: number;
//   };
//   reports: {
//     total: number;
//     pending: number;
//     approved: number;
//     rejected: number;
//   };
//   efficiency: {
//     averageHoursWorked: number;
//     approvalRate: number;
//   };
// }

// export interface MachineryUsageData {
//   id: string;
//   name: string;
//   hoursWorked: number;
//   status: string;
//   efficiency: number;
// }

// export interface RoutePerformance {
//   route: string;
//   totalReports: number;
//   approvedReports: number;
//   efficiency: number;
//   avgCompletionTime: number;
// }

// export const analyticsService = {
//   async getDashboardStats(): Promise<DashboardStats> {
//     const response = await api.get('/analytics/dashboard');
//     return response.data;
//   },

//   async getMachineryUsage(): Promise<MachineryUsageData[]> {
//     const response = await api.get('/analytics/machinery-usage');
//     return response.data;
//   },

//   async getRoutePerformance(): Promise<RoutePerformance[]> {
//     const response = await api.get('/analytics/route-performance');
//     return response.data;
//   },
// };

// src/services/analyticsService.ts
import api from './api';

export interface DashboardStats {
  machinery: {
    total: number;
    available: number;
    inUse: number;
    maintenance: number;
    outOfService: number;
  };
  reports: {
    total: number;
    pending: number;
    approved: number;
    rejected: number;
  };
  efficiency: {
    averageHoursWorked: number;
    approvalRate: number; // %
  };
}

export interface MachineryUsageData {
  id: string;
  name: string;
  hoursWorked: number;
  status: string;
  efficiency: number;
}

export interface RoutePerformance {
  route: string;
  totalReports: number;
  approvedReports: number;
  efficiency: number;
  avgCompletionTime: number;
}

const EMPTY: DashboardStats = {
  machinery: { total: 0, available: 0, inUse: 0, maintenance: 0, outOfService: 0 },
  reports:   { total: 0, pending: 0, approved: 0, rejected: 0 },
  efficiency:{ averageHoursWorked: 0, approvalRate: 0 },
};

export const analyticsService = {
  // ✅ Solo tocamos este: mezclamos respuesta con defaults
  async getDashboardStats(): Promise<DashboardStats> {
    const { data } = await api.get<Partial<DashboardStats>>('/analytics/dashboard');

    return {
      machinery:  { ...EMPTY.machinery,  ...(data?.machinery  ?? {}) },
      reports:    { ...EMPTY.reports,    ...(data?.reports    ?? {}) },
      efficiency: { ...EMPTY.efficiency, ...(data?.efficiency ?? {}) },
    };
  },

  // estos dos no se tocan
  async getMachineryUsage(): Promise<MachineryUsageData[]> {
    const response = await api.get('/analytics/machinery-usage');
    return response.data;
  },

  async getRoutePerformance(): Promise<RoutePerformance[]> {
    const response = await api.get('/analytics/route-performance');
    return response.data;
  },
};
