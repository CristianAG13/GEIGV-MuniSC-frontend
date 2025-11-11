// services/statisticsService.js
import apiClient from '@/config/api';

class StatisticsService {
  constructor() {
    this.baseURL = 'http://localhost:3000/api/v1/statistics';
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
      return this.handleError(error, 'Error al obtener resumen del sistema');
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
      return this.handleError(error, 'Error al obtener estadísticas de usuarios');
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
      return this.handleError(error, 'Error al obtener estadísticas de maquinaria');
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
      return this.handleError(error, 'Error al obtener estadísticas de operadores');
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
      return this.handleError(error, 'Error al obtener estadísticas de reportes');
    }
  }

  /**
   * 7. Estadísticas de Auditoría Avanzadas
   * Métricas avanzadas de auditoría (complementa al módulo de auditoría existente)
   */
  async getAuditStats() {
    try {
      const response = await apiClient.get('/statistics/audit');
      return {
        success: true,
        data: response.data
      };
    } catch (error) {
      console.error('Error fetching audit stats:', error);
      return this.handleError(error, 'Error al obtener estadísticas de auditoría');
    }
  }

  /**
   * 8. Tendencias del Sistema
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
      return this.handleError(error, 'Error al obtener tendencias del sistema');
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
}

// Exportar una instancia del servicio
const statisticsService = new StatisticsService();
export default statisticsService;