// services/transporteService.js
import apiClient from '../config/api.js';

class TransporteService {
  // ===== GESTIÓN DE VEHÍCULOS =====
  
  // Obtener todos los vehículos
  async getAllVehiculos() {
    try {
      const response = await apiClient.get('/vehiculos');
      return response.data;
    } catch (error) {
      console.error('Error fetching vehiculos:', error);
      throw new Error(error.response?.data?.message || 'Error al obtener vehículos');
    }
  }

  // Obtener vehículo por ID
  async getVehiculoById(id) {
    try {
      const response = await apiClient.get(`/vehiculos/${id}`);
      return response.data;
    } catch (error) {
      console.error('Error fetching vehiculo:', error);
      throw new Error(error.response?.data?.message || 'Error al obtener vehículo');
    }
  }

  // Crear nuevo vehículo
  async createVehiculo(vehiculoData) {
    try {
      const response = await apiClient.post('/vehiculos', vehiculoData);
      return response.data;
    } catch (error) {
      console.error('Error creating vehiculo:', error);
      throw new Error(error.response?.data?.message || 'Error al crear vehículo');
    }
  }

  // Actualizar vehículo
  async updateVehiculo(id, vehiculoData) {
    try {
      const response = await apiClient.patch(`/vehiculos/${id}`, vehiculoData);
      return response.data;
    } catch (error) {
      console.error('Error updating vehiculo:', error);
      throw new Error(error.response?.data?.message || 'Error al actualizar vehículo');
    }
  }

  // Eliminar vehículo
  async deleteVehiculo(id) {
    try {
      await apiClient.delete(`/vehiculos/${id}`);
      return { success: true };
    } catch (error) {
      console.error('Error deleting vehiculo:', error);
      throw new Error(error.response?.data?.message || 'Error al eliminar vehículo');
    }
  }

  // ===== GESTIÓN DE MAQUINARIA =====
  
  // Obtener toda la maquinaria
  async getAllMaquinaria() {
    try {
      const response = await apiClient.get('/maquinaria');
      return response.data;
    } catch (error) {
      console.error('Error fetching maquinaria:', error);
      throw new Error(error.response?.data?.message || 'Error al obtener maquinaria');
    }
  }

  // Obtener maquinaria por ID
  async getMaquinariaById(id) {
    try {
      const response = await apiClient.get(`/maquinaria/${id}`);
      return response.data;
    } catch (error) {
      console.error('Error fetching maquinaria:', error);
      throw new Error(error.response?.data?.message || 'Error al obtener maquinaria');
    }
  }

  // Crear nueva maquinaria
  async createMaquinaria(maquinariaData) {
    try {
      const response = await apiClient.post('/maquinaria', maquinariaData);
      return response.data;
    } catch (error) {
      console.error('Error creating maquinaria:', error);
      throw new Error(error.response?.data?.message || 'Error al crear maquinaria');
    }
  }

  // Actualizar maquinaria
  async updateMaquinaria(id, maquinariaData) {
    try {
      const response = await apiClient.patch(`/maquinaria/${id}`, maquinariaData);
      return response.data;
    } catch (error) {
      console.error('Error updating maquinaria:', error);
      throw new Error(error.response?.data?.message || 'Error al actualizar maquinaria');
    }
  }

  // Eliminar maquinaria
  async deleteMaquinaria(id) {
    try {
      await apiClient.delete(`/maquinaria/${id}`);
      return { success: true };
    } catch (error) {
      console.error('Error deleting maquinaria:', error);
      throw new Error(error.response?.data?.message || 'Error al eliminar maquinaria');
    }
  }

  // ===== GESTIÓN DE MANTENIMIENTOS =====
  
  // Obtener mantenimientos de un vehículo/maquinaria
  async getMantenimientos(transporteId, tipo) {
    try {
      const endpoint = tipo === 'vehiculo' ? `/vehiculos/${transporteId}/mantenimientos` : `/maquinaria/${transporteId}/mantenimientos`;
      const response = await apiClient.get(endpoint);
      return response.data;
    } catch (error) {
      console.error('Error fetching mantenimientos:', error);
      throw new Error(error.response?.data?.message || 'Error al obtener mantenimientos');
    }
  }

  // Crear mantenimiento
  async createMantenimiento(transporteId, tipo, mantenimientoData) {
    try {
      const endpoint = tipo === 'vehiculo' ? `/vehiculos/${transporteId}/mantenimientos` : `/maquinaria/${transporteId}/mantenimientos`;
      const response = await apiClient.post(endpoint, mantenimientoData);
      return response.data;
    } catch (error) {
      console.error('Error creating mantenimiento:', error);
      throw new Error(error.response?.data?.message || 'Error al crear mantenimiento');
    }
  }

  // ===== GESTIÓN DE ASIGNACIONES =====
  
  // Obtener asignaciones de transporte
  async getAsignaciones(filtros = {}) {
    try {
      const response = await apiClient.get('/asignaciones-transporte', { params: filtros });
      return response.data;
    } catch (error) {
      console.error('Error fetching asignaciones:', error);
      throw new Error(error.response?.data?.message || 'Error al obtener asignaciones');
    }
  }

  // Crear asignación de transporte
  async createAsignacion(asignacionData) {
    try {
      const response = await apiClient.post('/asignaciones-transporte', asignacionData);
      return response.data;
    } catch (error) {
      console.error('Error creating asignacion:', error);
      throw new Error(error.response?.data?.message || 'Error al crear asignación');
    }
  }

  // Finalizar asignación
  async finalizarAsignacion(asignacionId, datosFinalizacion) {
    try {
      const response = await apiClient.patch(`/asignaciones-transporte/${asignacionId}/finalizar`, datosFinalizacion);
      return response.data;
    } catch (error) {
      console.error('Error finalizando asignacion:', error);
      throw new Error(error.response?.data?.message || 'Error al finalizar asignación');
    }
  }

  // ===== REPORTES Y ESTADÍSTICAS =====
  
  // Obtener estadísticas de transporte
  async getEstadisticas(periodo = 'mes') {
    try {
      const response = await apiClient.get('/transporte/estadisticas', { 
        params: { periodo } 
      });
      return response.data;
    } catch (error) {
      console.error('Error fetching estadisticas:', error);
      throw new Error(error.response?.data?.message || 'Error al obtener estadísticas');
    }
  }

  // Obtener reporte de uso de combustible
  async getReporteCombustible(fechaInicio, fechaFin) {
    try {
      const response = await apiClient.get('/transporte/reporte-combustible', {
        params: { fechaInicio, fechaFin }
      });
      return response.data;
    } catch (error) {
      console.error('Error fetching reporte combustible:', error);
      throw new Error(error.response?.data?.message || 'Error al obtener reporte de combustible');
    }
  }

  // Obtener reporte de mantenimientos
  async getReporteMantenimientos(fechaInicio, fechaFin) {
    try {
      const response = await apiClient.get('/transporte/reporte-mantenimientos', {
        params: { fechaInicio, fechaFin }
      });
      return response.data;
    } catch (error) {
      console.error('Error fetching reporte mantenimientos:', error);
      throw new Error(error.response?.data?.message || 'Error al obtener reporte de mantenimientos');
    }
  }

  // ===== GESTIÓN DE BOLETAS =====

  // Crear boleta municipal
  async createBoletaMunicipal(data) {
    try {
      const response = await apiClient.post('/transporte/boletas-municipales', data);
      return response.data;
    } catch (error) {
      console.error('Error creando boleta municipal:', error);
      throw new Error(error.response?.data?.message || 'Error al crear boleta municipal');
    }
  }

  // Obtener boletas municipales
  async getBoletasMunicipales(filters = {}) {
    try {
      const response = await apiClient.get('/transporte/boletas-municipales', { params: filters });
      return response.data;
    } catch (error) {
      console.error('Error obteniendo boletas municipales:', error);
      throw new Error(error.response?.data?.message || 'Error al obtener boletas municipales');
    }
  }

  // Crear boleta de alquiler
  async createBoletaAlquiler(data) {
    try {
      const response = await apiClient.post('/transporte/boletas-alquiler', data);
      return response.data;
    } catch (error) {
      console.error('Error creando boleta de alquiler:', error);
      throw new Error(error.response?.data?.message || 'Error al crear boleta de alquiler');
    }
  }

  // Obtener boletas de alquiler
  async getBoletasAlquiler(filters = {}) {
    try {
      const response = await apiClient.get('/transporte/boletas-alquiler', { params: filters });
      return response.data;
    } catch (error) {
      console.error('Error obteniendo boletas de alquiler:', error);
      throw new Error(error.response?.data?.message || 'Error al obtener boletas de alquiler');
    }
  }

  // ===== REPORTES Y CÁLCULOS ADICIONALES =====

  // Reporte de consumo de maquinaria
  async getCalculosConsumo(maquinariaId, fechaInicio, fechaFin) {
    try {
      const response = await apiClient.get(`/transporte/reportes/consumo/${maquinariaId}`, {
        params: { fechaInicio, fechaFin }
      });
      return response.data;
    } catch (error) {
      console.error('Error obteniendo cálculos de consumo:', error);
      throw new Error(error.response?.data?.message || 'Error al obtener cálculos de consumo');
    }
  }

  // Reporte de estaciones
  async getReporteEstaciones(fechaInicio, fechaFin) {
    try {
      const response = await apiClient.get('/transporte/reportes/estaciones', {
        params: { fechaInicio, fechaFin }
      });
      return response.data;
    } catch (error) {
      console.error('Error obteniendo reporte de estaciones:', error);
      throw new Error(error.response?.data?.message || 'Error al obtener reporte de estaciones');
    }
  }


  
}

const transporteService = new TransporteService();
export default transporteService;


