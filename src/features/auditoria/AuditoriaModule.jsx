// features/auditoria/AuditoriaModule.jsx
import React, { useState, useEffect, useCallback } from 'react';
import { useAuth } from '@/context/AuthContext';
import { Shield, AlertCircle, BarChart3, Eye, Users } from 'lucide-react';
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import auditService from '@/services/auditService';
import AuditTable from './components/AuditTable';
import AuditFilters from './components/AuditFilters';
import AuditStats from './components/AuditStats';
import ActiveUsers from './components/ActiveUsers';
import { toast } from '@/hooks/use-toast';

const AuditoriaModule = () => {
  const { user } = useAuth();
  
  // Estados principales
  const [logs, setLogs] = useState([]);
  const [stats, setStats] = useState(null);
  const [isLoading, setIsLoading] = useState(false);
  const [isLoadingStats, setIsLoadingStats] = useState(false);
  const [error, setError] = useState(null);
  const [isUsingSimulatedData, setIsUsingSimulatedData] = useState(false);
  const [pagination, setPagination] = useState({
    currentPage: 1,
    totalPages: 1,
    total: 0,
    limit: 50
  });
  
  // Estados de filtros - inicializar solo con valores necesarios
  const [currentFilters, setCurrentFilters] = useState({
    page: 1,
    limit: 50
  });

  // Verificar si el usuario es superadmin
  const isSuperAdmin = user?.roles && (
    user.roles.includes('superadmin') || 
    user.roles.includes('SuperAdmin') ||
    user.roles.includes('SUPERADMIN')
  );

  
  // Función para cargar logs con filtros
  const loadAuditLogs = useCallback(async (filters) => {
    if (!isSuperAdmin) {
      return;
    }
    
    console.log('🔄 Iniciando carga de logs con filtros:', filters);
    setIsLoading(true);
    setError(null);
    
    try {
      const filtersToUse = filters || currentFilters;
      console.log('📋 Filtros finales a usar:', filtersToUse);
      const result = await auditService.getAuditLogs(filtersToUse);
      
      if (result.success) {
        console.log('✅ Datos recibidos exitosamente:', result.data);
        
        // El backend puede devolver los datos en result.data.data o result.data.logs
        const logsData = result.data.data || result.data.logs || [];
        
        // Debug específico para nombres
        console.log('👤 Debug de nombres en los logs:', logsData.map(log => ({
          id: log.id,
          name: log.name,
          lastname: log.lastname,
          userFullName: log.userFullName,
          userName: log.userName,
          hasNameLastname: !!(log.name && log.lastname)
        })));
        
        // Transformar los datos para asegurar que tengan name y lastname
        const transformedLogs = logsData.map(log => {
          // Si ya tiene name y lastname, usar esos
          if (log.name && log.lastname) {
            return log;
          }
          
          // Si no, intentar extraer de otros campos
          if (log.userFullName) {
            const nameParts = log.userFullName.split(' ');
            if (nameParts.length >= 2) {
              return {
                ...log,
                name: nameParts.slice(0, Math.ceil(nameParts.length / 2)).join(' '),
                lastname: nameParts.slice(Math.ceil(nameParts.length / 2)).join(' ')
              };
            }
          } else if (log.userName) {
            const nameParts = log.userName.split(' ');
            if (nameParts.length >= 2) {
              return {
                ...log,
                name: nameParts.slice(0, Math.ceil(nameParts.length / 2)).join(' '),
                lastname: nameParts.slice(Math.ceil(nameParts.length / 2)).join(' ')
              };
            }
          }
          
          return log;
        });
        
        console.log('🔄 Logs transformados:', transformedLogs.map(log => ({
          id: log.id,
          name: log.name,
          lastname: log.lastname,
          transformed: !!(log.name && log.lastname)
        })));
        
        setLogs(transformedLogs);
        setPagination({
          currentPage: result.data.page || result.data.currentPage || 1,
          totalPages: result.data.totalPages || 1,
          total: result.data.total || 0,
          limit: filtersToUse.limit || 50
        });

        // Log para debugging cuando no hay resultados
        if (logsData.length === 0) {
          console.log('⚠️ No se encontraron registros con los filtros aplicados:', {
            filters: filtersToUse,
            hasDateFilters: !!(filtersToUse.startDate || filtersToUse.endDate),
            dateRange: filtersToUse.startDate && filtersToUse.endDate ? 
              `${filtersToUse.startDate} a ${filtersToUse.endDate}` : null
          });
        }
        
        // Detectar si son datos simulados
        const isSimulated = logsData.length > 0 && 
                           logsData[0].id === '1' && 
                           logsData[0].userName === 'Juan Pérez';
        setIsUsingSimulatedData(isSimulated);
        
        if (isSimulated) {
          setError('⚠️ Mostrando datos de demostración. El servidor backend no está disponible.');
        } else {
          setError(null);
        }
      } else {
        throw new Error(result.error || 'Error al cargar logs');
      }
    } catch (error) {
      console.error('❌ Error loading audit logs:', error);
      console.error('📋 Filtros que causaron error:', filtersToUse);
      setError(error.message);
      setIsUsingSimulatedData(false);
      
      // Mostrar toast solo si no es un error de red común
      if (!error.message.includes('Network Error') && !error.message.includes('ERR_NETWORK')) {
        toast({
          title: "Error",
          description: `No se pudieron cargar los logs: ${error.message}`,
          variant: "destructive",
        });
      }
    } finally {
      setIsLoading(false);
    }
  }, [isSuperAdmin]);

  // Función para cargar estadísticas
  const loadAuditStats = useCallback(async (dateRange = {}) => {
    if (!isSuperAdmin) return;
    
    setIsLoadingStats(true);
    
    try {
      const result = await auditService.getAuditStats(dateRange);
      
      if (result.success) {
        setStats(result.data);
      } else {
        console.warn('Error loading stats:', result.error);
      }
    } catch (error) {
      console.error('Error loading audit stats:', error);
      // No mostramos toast para stats para no ser muy intrusivos
    } finally {
      setIsLoadingStats(false);
    }
  }, [isSuperAdmin]);

  // Manejar cambios en los filtros
  const handleFiltersChange = useCallback((newFilters) => {
    console.log('🔄 AuditoriaModule - Cambio de filtros:', { 
      oldFilters: currentFilters, 
      newFilters 
    });
    
    setCurrentFilters(newFilters);
    loadAuditLogs(newFilters);
    
    // Si hay filtros de fecha, actualizar estadísticas
    if (newFilters.startDate || newFilters.endDate) {
      loadAuditStats({
        startDate: newFilters.startDate,
        endDate: newFilters.endDate
      });
    } else {
      loadAuditStats();
    }
  }, [loadAuditLogs, loadAuditStats]);

  // Manejar cambio de página
  const handlePageChange = useCallback((newPage) => {
    const newFilters = { ...currentFilters, page: newPage };
    setCurrentFilters(newFilters);
    loadAuditLogs(newFilters);
  }, [currentFilters, loadAuditLogs]);



  // Manejar refresco
  const handleRefresh = useCallback(() => {
    loadAuditLogs(currentFilters);
    loadAuditStats(
      currentFilters.startDate || currentFilters.endDate 
        ? { startDate: currentFilters.startDate, endDate: currentFilters.endDate }
        : {}
    );
  }, [currentFilters, loadAuditLogs, loadAuditStats]);

  // Efecto inicial - cargar datos cuando el componente se monta
  useEffect(() => {
    if (isSuperAdmin) {
      console.log('🚀 Cargando datos iniciales de auditoría...');
      loadAuditLogs({ page: 1, limit: 50 });
      loadAuditStats();
    }
  }, [isSuperAdmin]);

  // Si no es superadmin, mostrar mensaje de acceso denegado
  if (!isSuperAdmin) {
    return (
      <div className="container mx-auto px-4 py-8">
        <Card className="max-w-md mx-auto">
          <CardContent className="flex flex-col items-center justify-center py-12">
            <Shield className="h-16 w-16 text-red-500 mb-4" />
            <h2 className="text-xl font-semibold text-gray-900 mb-2">
              Acceso Denegado
            </h2>
            <p className="text-gray-600 text-center mb-4">
              Solo los superadministradores pueden acceder al módulo de auditoría.
            </p>
            <Badge variant="destructive">
              Permisos insuficientes
            </Badge>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="container mx-auto px-4 py-6">
      {/* Header */}
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-3xl font-bold text-gray-900 flex items-center gap-2">
            <Shield className="h-8 w-8 text-blue-600" />
            Auditoría del Sistema
          </h1>
          <p className="text-gray-600 mt-1">
            Registro completo de todas las actividades del sistema
          </p>
        </div>
        <div className="flex items-center gap-2">
          <Badge variant="outline" className="text-green-600 border-green-600">
            <Eye className="h-3 w-3 mr-1" />
            Superadmin
          </Badge>
          <Badge variant="outline">
            {pagination.total} registros totales
          </Badge>
        </div>
      </div>

     
   

      {/* Error general */}
      {error && !isUsingSimulatedData && (
        <Alert className="mb-6 border-red-200 bg-red-50">
          <AlertCircle className="h-4 w-4 text-red-600" />
          <AlertDescription className="text-red-800">
            {error}
          </AlertDescription>
        </Alert>
      )}

      {/* Contenido principal con tabs */}
      <Tabs defaultValue="logs" className="space-y-6">
        <TabsList className="grid w-full grid-cols-3">
          <TabsTrigger value="logs" className="flex items-center gap-2">
            <Eye className="h-4 w-4" />
            Logs de Auditoría
          </TabsTrigger>
          <TabsTrigger value="users" className="flex items-center gap-2">
            <Users className="h-4 w-4" />
            Usuarios Conectados
          </TabsTrigger>
          <TabsTrigger value="stats" className="flex items-center gap-2">
            <BarChart3 className="h-4 w-4" />
            Estadísticas
          </TabsTrigger>
        </TabsList>

        {/* Tab de logs */}
        <TabsContent value="logs" className="space-y-6">
          <AuditFilters
            onFiltersChange={handleFiltersChange}
            onRefresh={handleRefresh}
            isLoading={isLoading}
            totalRecords={pagination.total}
          />
          
          <AuditTable
            logs={logs}
            isLoading={isLoading}
            pagination={pagination}
            onPageChange={handlePageChange}
            hasActiveFilters={!!(currentFilters.startDate || currentFilters.endDate || 
                                 (currentFilters.entity && currentFilters.entity !== 'all') ||
                                 (currentFilters.action && currentFilters.action !== 'all') ||
                                 currentFilters.search || currentFilters.userId || currentFilters.userName)}
          />
        </TabsContent>

        {/* Tab de usuarios conectados */}
        <TabsContent value="users" className="space-y-6">
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            <div className="lg:col-span-2">
              <ActiveUsers 
                logs={logs}
                isLoading={isLoading}
              />
            </div>
            <div className="space-y-6">
              {/* Estadísticas rápidas de usuarios */}
              <Card>
                <CardHeader>
                  <CardTitle className="text-sm font-medium text-gray-600">
                    Resumen de Conexiones
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="flex items-center justify-between p-3 bg-blue-50 rounded-lg">
                    <div>
                      <p className="text-sm text-gray-600">Hoy</p>
                      <p className="text-2xl font-bold text-blue-600">
                        {logs.filter(log => {
                          const today = new Date();
                          const logDate = new Date(log.timestamp);
                          return log.action === 'AUTH' && 
                                 logDate.toDateString() === today.toDateString();
                        }).length}
                      </p>
                    </div>
                    <Users className="h-8 w-8 text-blue-600 opacity-50" />
                  </div>
                  
                  <div className="flex items-center justify-between p-3 bg-green-50 rounded-lg">
                    <div>
                      <p className="text-sm text-gray-600">Esta semana</p>
                      <p className="text-2xl font-bold text-green-600">
                        {logs.filter(log => {
                          const weekAgo = new Date();
                          weekAgo.setDate(weekAgo.getDate() - 7);
                          const logDate = new Date(log.timestamp);
                          return log.action === 'AUTH' && logDate >= weekAgo;
                        }).length}
                      </p>
                    </div>
                    <Users className="h-8 w-8 text-green-600 opacity-50" />
                  </div>
                  
                  <div className="flex items-center justify-between p-3 bg-purple-50 rounded-lg">
                    <div>
                      <p className="text-sm text-gray-600">Este mes</p>
                      <p className="text-2xl font-bold text-purple-600">
                        {logs.filter(log => {
                          const monthAgo = new Date();
                          monthAgo.setDate(monthAgo.getDate() - 30);
                          const logDate = new Date(log.timestamp);
                          return log.action === 'AUTH' && logDate >= monthAgo;
                        }).length}
                      </p>
                    </div>
                    <Users className="h-8 w-8 text-purple-600 opacity-50" />
                  </div>
                </CardContent>
              </Card>
            </div>
          </div>
        </TabsContent>

        {/* Tab de estadísticas */}
        <TabsContent value="stats" className="space-y-6">
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-xl font-semibold">Estadísticas de Auditoría</h2>
            <Button
              variant="outline"
              onClick={() => loadAuditStats(
                currentFilters.startDate || currentFilters.endDate 
                  ? { startDate: currentFilters.startDate, endDate: currentFilters.endDate }
                  : {}
              )}
              disabled={isLoadingStats}
            >
              {isLoadingStats ? 'Actualizando...' : 'Actualizar'}
            </Button>
          </div>
          
          <AuditStats
            stats={stats}
            isLoading={isLoadingStats}
            dateRange={
              currentFilters.startDate || currentFilters.endDate
                ? {
                    startDate: currentFilters.startDate,
                    endDate: currentFilters.endDate,
                  }
                : null
            }
          />
        </TabsContent>
      </Tabs>
    </div>
  );
};

export default AuditoriaModule;