// services/statisticsService.js
import apiClient from '@/config/api';

class StatisticsService {
  constructor() {
    // El baseURL se configura a través del apiClient usando VITE_API_URL
  }

  /**
   * 1. Dashboard Completo (PRINCIPAL)
   * Obtiene TODAS las estadísticas del sistema en una sola respuesta
   */
  async getDashboardStats(params = {}) {
    try {
      const response = await apiClient.get('/statistics/dashboard', {
        params: this.cleanParams(params)
      });
      return {
        success: true,
        data: response.data
      };
    } catch (error) {
      console.error('Error fetching dashboard stats:', error);
      return this.handleError(error, 'Error al obtener estadísticas del dashboard');
    }
  }

  /**
   * 2. Resumen del Sistema
   * Solo el resumen general (más liviano que dashboard)
   */
  async getOverviewStats() {
    try {
      const response = await apiClient.get('/statistics/overview');
      return {
        success: true,
        data: response.data
      };
    } catch (error) {
      console.error('Error fetching overview stats:', error);
      const errorResult = this.handleError(error, 'Error al obtener resumen del sistema');
      
      // Si debe usar datos simulados, retornarlos
      if (errorResult.useSimulated) {
        return this.getSimulatedOverviewStats();
      }
      
      return errorResult;
    }
  }

  /**
   * 3. Estadísticas de Usuarios
   * Métricas detalladas de usuarios
   */
  async getUsersStats() {
    try {
      const response = await apiClient.get('/statistics/users');
      return {
        success: true,
        data: response.data
      };
    } catch (error) {
      console.error('Error fetching users stats:', error);
      const errorResult = this.handleError(error, 'Error al obtener estadísticas de usuarios');
      
      if (errorResult.useSimulated) {
        return this.getSimulatedUsersStats();
      }
      
      return errorResult;
    }
  }

  /**
   * 4. Estadísticas de Maquinaria
   * Métricas de maquinaria y reportes
   */
  async getMachineryStats() {
    try {
      const response = await apiClient.get('/statistics/machinery');
      return {
        success: true,
        data: response.data
      };
    } catch (error) {
      console.error('Error fetching machinery stats:', error);
      const errorResult = this.handleError(error, 'Error al obtener estadísticas de maquinaria');
      
      if (errorResult.useSimulated) {
        return this.getSimulatedMachineryStats();
      }
      
      return errorResult;
    }
  }

  /**
   * 5. Estadísticas de Operadores
   * Métricas de operadores
   */
  async getOperatorsStats() {
    try {
      const response = await apiClient.get('/statistics/operators');
      return {
        success: true,
        data: response.data
      };
    } catch (error) {
      console.error('Error fetching operators stats:', error);
      const errorResult = this.handleError(error, 'Error al obtener estadísticas de operadores');
      
      if (errorResult.useSimulated) {
        return this.getSimulatedOperatorsStats();
      }
      
      return errorResult;
    }
  }

  /**
   * 6. Estadísticas de Reportes
   * Análisis de reportes por tipo, tiempo, etc.
   */
  async getReportsStats() {
    try {
      const response = await apiClient.get('/statistics/reports');
      return {
        success: true,
        data: response.data
      };
    } catch (error) {
      console.error('Error fetching reports stats:', error);
      const errorResult = this.handleError(error, 'Error al obtener estadísticas de reportes');
      
      if (errorResult.useSimulated) {
        return this.getSimulatedReportsStats();
      }
      
      return errorResult;
    }
  }

  /**
   * 7. Tendencias del Sistema
   * Métricas de tendencias y análisis temporal
   */
  async getTrendsStats() {
    try {
      const response = await apiClient.get('/statistics/trends');
      return {
        success: true,
        data: response.data
      };
    } catch (error) {
      console.error('Error fetching trends stats:', error);
      const errorResult = this.handleError(error, 'Error al obtener tendencias del sistema');
      
      if (errorResult.useSimulated) {
        return this.getSimulatedTrendsStats();
      }
      
      return errorResult;
    }
  }

  /**
   * Método genérico para obtener estadísticas con filtros personalizados
   */
  async getCustomStats(endpoint, params = {}) {
    try {
      const response = await apiClient.get(`/statistics/${endpoint}`, {
        params: this.cleanParams(params)
      });
      return {
        success: true,
        data: response.data
      };
    } catch (error) {
      console.error(`Error fetching ${endpoint} stats:`, error);
      return this.handleError(error, `Error al obtener estadísticas de ${endpoint}`);
    }
  }

  /**
   * Verificar conectividad con el backend
   */
  async testConnection() {
    try {
      const response = await apiClient.get('/statistics/test');
      return {
        success: true,
        data: response.data,
        connected: true
      };
    } catch (error) {
      console.error('Error testing connection:', error);
      return {
        success: false,
        connected: false,
        error: error.message,
        data: null
      };
    }
  }

  /**
   * Métodos de utilidad
   */

  // Limpiar parámetros vacíos para evitar errores de validación
  cleanParams(params) {
    const cleaned = {};
    Object.entries(params).forEach(([key, value]) => {
      // Solo incluir valores que no sean vacíos, null, undefined o cadenas vacías
      if (value !== '' && value !== null && value !== undefined && String(value).trim() !== '') {
        cleaned[key] = value;
      }
    });
    return cleaned;
  }

  // Manejar errores de forma consistente
  handleError(error, defaultMessage) {
    let message = defaultMessage;
    
    if (error.response?.data?.message) {
      message = error.response.data.message;
    } else if (error.message) {
      message = error.message;
    }

    // Si es un error de endpoint no implementado, usar datos simulados
    if (error.response?.status === 404 || 
        error.response?.status === 501 || 
        error.message?.includes('Network Error') ||
        error.response?.data === 'PRO FEATURE ONLY') {
      console.warn(`Endpoint no disponible: ${defaultMessage}. Usando datos simulados.`);
      return {
        success: false,
        error: message,
        data: null,
        useSimulated: true
      };
    }

    return {
      success: false,
      error: message,
      data: null
    };
  }

  /**
   * Generar datos simulados para desarrollo/testing
   */
  getSimulatedDashboardStats() {
    return {
      success: true,
      data: {
        // Resumen general
        totalUsers: 125,
        activeUsers: 89,
        totalMachinery: 45,
        activeMachinery: 38,
        totalOperators: 67,
        activeOperators: 52,
        totalReports: 1247,
        reportsThisMonth: 89,
        
        // Métricas por periodo
        userGrowth: 12.5,
        machineryUtilization: 84.4,
        operatorEfficiency: 91.2,
        reportCompletionRate: 96.8,
        
        // Distribuciones
        usersByRole: {
          superadmin: 2,
          ingeniero: 8,
          inspector: 25,
          operario: 90
        },
        
        machineryByType: {
          excavadora: 12,
          retroexcavadora: 8,
          camion: 15,
          volqueta: 10
        },
        
        reportsByStatus: {
          completed: 1089,
          pending: 89,
          in_progress: 69
        },
        
        // Actividad temporal
        dailyActivity: Array.from({ length: 30 }, (_, i) => ({
          date: new Date(Date.now() - (29 - i) * 24 * 60 * 60 * 1000).toISOString().split('T')[0],
          users: Math.floor(Math.random() * 50) + 20,
          reports: Math.floor(Math.random() * 15) + 5,
          machinery: Math.floor(Math.random() * 30) + 15
        })),
        
        // Top performers
        topOperators: [
          { id: 1, name: 'Juan Pérez', reports: 45, efficiency: 98.2 },
          { id: 2, name: 'María González', reports: 42, efficiency: 96.8 },
          { id: 3, name: 'Carlos López', reports: 38, efficiency: 95.5 }
        ],
        
        mostUsedMachinery: [
          { id: 1, name: 'Excavadora CAT-001', hours: 287, utilization: 89.2 },
          { id: 2, name: 'Camión VOL-015', hours: 245, utilization: 82.3 },
          { id: 3, name: 'Retroexcavadora RET-008', hours: 223, utilization: 78.9 }
        ]
      }
    };
  }

  /**
   * Datos simulados para resumen general
   */
  getSimulatedOverviewStats() {
    return {
      success: true,
      data: {
        totalUsers: 125,
        activeUsers: 89,
        totalOperators: 67,
        activeMachinery: 38,
        completedReports: 1089,
        pendingReports: 89,
        systemUptime: 99.2,
        avgResponseTime: 0.45
      }
    };
  }

  /**
   * Datos simulados para estadísticas de usuarios
   */
  getSimulatedUsersStats() {
    return {
      success: true,
      data: {
        totalUsers: 125,
        activeUsers: 89,
        newUsersThisMonth: 12,
        usersByRole: {
          superadmin: 2,
          ingeniero: 8,
          inspector: 25,
          operario: 90
        },
        userActivity: Array.from({ length: 6 }, (_, i) => ({
          month: ['Jul', 'Ago', 'Sep', 'Oct', 'Nov', 'Dic'][i],
          count: Math.floor(Math.random() * 20) + 80
        })),
        topActiveUsers: [
          { id: 1, name: 'Juan Pérez', email: 'juan.perez@santacruz.go.cr', lastLogin: '2024-11-11', sessions: 45 },
          { id: 2, name: 'María González', email: 'maria.gonzalez@santacruz.go.cr', lastLogin: '2024-11-10', sessions: 42 }
        ]
      }
    };
  }

  /**
   * Datos simulados para estadísticas de maquinaria
   */
  getSimulatedMachineryStats() {
    return {
      success: true,
      data: {
        totalMachinery: 45,
        activeMachinery: 38,
        utilizationRate: 84.4,
        machineryByType: {
          excavadora: 12,
          retroexcavadora: 8,
          camion: 15,
          volqueta: 10
        },
        topMachinery: [
          { id: 1, name: 'Excavadora CAT-001', hours: 287, utilization: 89.2 },
          { id: 2, name: 'Camión VOL-015', hours: 245, utilization: 82.3 }
        ]
      }
    };
  }

  /**
   * Datos simulados para estadísticas de reportes
   */
  getSimulatedReportsStats() {
    return {
      success: true,
      data: {
        totalReports: 1247,
        completedReports: 1089,
        pendingReports: 89,
        inProgressReports: 69,
        reportsByType: {
          mantenimiento: 456,
          reparacion: 298,
          inspeccion: 234,
          emergencia: 127,
          rutina: 132
        },
        reportsByStatus: {
          completed: 1089,
          pending: 89,
          in_progress: 69
        },
        reportsByPriority: {
          alta: 245,
          media: 678,
          baja: 324
        },
        topReporters: [
          { id: 1, name: 'Juan Pérez', reportsCount: 45, completionRate: 98.2 },
          { id: 2, name: 'María González', reportsCount: 42, completionRate: 96.8 },
          { id: 3, name: 'Carlos López', reportsCount: 38, completionRate: 95.5 }
        ],
        monthlyActivity: Array.from({ length: 12 }, (_, i) => ({
          month: ['Ene', 'Feb', 'Mar', 'Abr', 'May', 'Jun', 'Jul', 'Ago', 'Sep', 'Oct', 'Nov', 'Dic'][i],
          reports: Math.floor(Math.random() * 50) + 80
        })),
        avgCompletionTime: 4.5,
        satisfaction: 4.2
      }
    };
  }

  /**
   * Datos simulados para estadísticas de operadores
   */
  getSimulatedOperatorsStats() {
    return {
      success: true,
      data: {
        totalOperators: 67,
        activeOperators: 52,
        efficiency: 91.2,
        operatorsByShift: {
          morning: 28,
          afternoon: 25,
          night: 14
        },
        operatorsByExperience: {
          junior: 15,
          mid: 32,
          senior: 20
        },
        certifications: {
          excavadora: 45,
          camion: 38,
          retroexcavadora: 28,
          volqueta: 22
        },
        topOperators: [
          { id: 1, name: 'Juan Pérez', efficiency: 98.2, hours: 287 },
          { id: 2, name: 'María González', efficiency: 96.8, hours: 245 },
          { id: 3, name: 'Carlos López', efficiency: 95.5, hours: 223 }
        ]
      }
    };
  }

  /**
   * Datos simulados para tendencias
   */
  getSimulatedTrendsStats() {
    return {
      success: true,
      data: {
        overallTrend: {
          direction: 'up',
          percentage: 12.5,
          description: 'Crecimiento general del sistema'
        },
        keyPerformanceIndicators: {
          systemAvailability: { current: 99.2, target: 99.5, trend: 'up' },
          userSatisfaction: { current: 4.3, target: 4.5, trend: 'up' },
          operationalEfficiency: { current: 91.2, target: 92.0, trend: 'stable' },
          costOptimization: { current: 85.7, target: 88.0, trend: 'up' }
        },
        userGrowthTrend: {
          last6Months: [
            { month: 'Jul', users: 95, growth: 5.2 },
            { month: 'Ago', users: 102, growth: 7.4 },
            { month: 'Sep', users: 108, growth: 5.9 },
            { month: 'Oct', users: 115, growth: 6.5 },
            { month: 'Nov', users: 121, growth: 5.2 },
            { month: 'Dic', users: 125, growth: 3.3 }
          ]
        },
        predictiveAnalysis: {
          nextMonth: {
            expectedUsers: 130,
            expectedReports: 165,
            predictedUtilization: 85.2,
            confidenceLevel: 87.3
          },
          maintenanceSchedule: {
            critical: 3,
            planned: 12,
            overdue: 1
          },
          resourceNeeds: {
            additionalOperators: 2,
            machineryUpgrade: 1,
            trainingRequired: 8
          }
        }
      }
    };
  }
}

// Exportar una instancia del servicio
const statisticsService = new StatisticsService();
export default statisticsService;