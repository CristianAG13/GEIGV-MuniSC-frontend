// features/estadisticas/EstadisticasModule.jsx
import React, { useState, useEffect } from 'react';
import { useAuth } from '@/context/AuthContext';
import { 
  BarChart3, 
  Users, 
  Truck, 
  HardHat, 
  FileText, 
  Shield, 
  TrendingUp,
  Activity,
  Eye,
  AlertCircle
} from 'lucide-react';
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import statisticsService from '@/services/statisticsService';
import { toast } from '@/hooks/use-toast';

// Importar componentes de estadísticas
import DashboardStats from './components/DashboardStats';
import OverviewStats from './components/OverviewStats';
import UsersStats from './components/UsersStats';
import MachineryStats from './components/MachineryStats';
import OperatorsStats from './components/OperatorsStats';
import ReportsStats from './components/ReportsStats';
import AuditStatsAdvanced from './components/AuditStatsAdvanced';
import TrendsStats from './components/TrendsStats';

const EstadisticasModule = () => {
  const { user } = useAuth();
  
  // Estados principales
  const [activeTab, setActiveTab] = useState('dashboard');
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState(null);
  
  // Estados para cada tipo de estadística
  const [dashboardData, setDashboardData] = useState(null);
  const [overviewData, setOverviewData] = useState(null);
  const [usersData, setUsersData] = useState(null);
  const [machineryData, setMachineryData] = useState(null);
  const [operatorsData, setOperatorsData] = useState(null);
  const [reportsData, setReportsData] = useState(null);
  const [auditData, setAuditData] = useState(null);
  const [trendsData, setTrendsData] = useState(null);

  // Verificar permisos - solo superadmin, ingeniero e inspector pueden ver estadísticas
  const hasStatsPermission = () => {
    if (!user || !user.roles) return false;
    const userRoles = Array.isArray(user.roles) ? user.roles : [user.roles];
    return userRoles.some(role => ['superadmin', 'ingeniero', 'inspector'].includes(role));
  };

  const canViewAdvancedStats = () => {
    if (!user || !user.roles) return false;
    const userRoles = Array.isArray(user.roles) ? user.roles : [user.roles];
    return userRoles.some(role => ['superadmin', 'ingeniero'].includes(role));
  };

  // Funciones para cargar datos
  const loadDashboardStats = async () => {
    try {
      setIsLoading(true);
      setError(null);
      
      const result = await statisticsService.getDashboardStats();
      
      if (result.success) {
        setDashboardData(result.data);
      } else {
        // Si falla la API, usar datos simulados para desarrollo
        const simulatedResult = statisticsService.getSimulatedDashboardStats();
        setDashboardData(simulatedResult.data);
        console.warn('Using simulated dashboard data due to API error:', result.error);
      }
    } catch (error) {
      console.error('Error loading dashboard stats:', error);
      setError('Error al cargar estadísticas del dashboard');
      
      // Fallback a datos simulados
      const simulatedResult = statisticsService.getSimulatedDashboardStats();
      setDashboardData(simulatedResult.data);
    } finally {
      setIsLoading(false);
    }
  };

  const loadTabData = async (tabName) => {
    if (!hasStatsPermission()) return;
    
    try {
      setIsLoading(true);
      setError(null);
      
      let result;
      
      switch (tabName) {
        case 'overview':
          result = await statisticsService.getOverviewStats();
          if (result.success) setOverviewData(result.data);
          break;
        case 'users':
          result = await statisticsService.getUsersStats();
          if (result.success) setUsersData(result.data);
          break;
        case 'machinery':
          result = await statisticsService.getMachineryStats();
          if (result.success) setMachineryData(result.data);
          break;
        case 'operators':
          result = await statisticsService.getOperatorsStats();
          if (result.success) setOperatorsData(result.data);
          break;
        case 'reports':
          result = await statisticsService.getReportsStats();
          if (result.success) setReportsData(result.data);
          break;
        case 'audit':
          if (canViewAdvancedStats()) {
            result = await statisticsService.getAuditStats();
            if (result.success) setAuditData(result.data);
          }
          break;
        case 'trends':
          if (canViewAdvancedStats()) {
            result = await statisticsService.getTrendsStats();
            if (result.success) setTrendsData(result.data);
          }
          break;
      }
      
      if (result && !result.success) {
        console.error(`Error loading ${tabName} data:`, result.error);
        toast({
          title: "Error",
          description: `No se pudieron cargar las estadísticas de ${tabName}: ${result.error}`,
          variant: "destructive",
        });
      }
    } catch (error) {
      console.error(`Error loading ${tabName} data:`, error);
      setError(`Error al cargar estadísticas de ${tabName}`);
    } finally {
      setIsLoading(false);
    }
  };

  // Cargar datos iniciales
  useEffect(() => {
    if (hasStatsPermission()) {
      loadDashboardStats();
    }
  }, []);

  // Cargar datos cuando cambia de tab
  useEffect(() => {
    if (activeTab !== 'dashboard') {
      loadTabData(activeTab);
    }
  }, [activeTab]);

  // Si no tiene permisos, mostrar mensaje de acceso denegado
  if (!hasStatsPermission()) {
    return (
      <div className="container mx-auto px-4 py-8">
        <Card className="max-w-md mx-auto">
          <CardContent className="flex flex-col items-center justify-center py-12">
            <BarChart3 className="h-16 w-16 text-red-500 mb-4" />
            <h2 className="text-xl font-semibold text-gray-900 mb-2">
              Acceso Denegado
            </h2>
            <p className="text-gray-600 text-center">
              No tienes permisos para ver las estadísticas del sistema.
            </p>
          </CardContent>
        </Card>
      </div>
    );
  }

  const tabConfig = [
    {
      id: 'dashboard',
      label: 'Dashboard Principal',
      icon: Activity,
      description: 'Vista completa del sistema',
      permission: 'basic'
    },
    {
      id: 'overview',
      label: 'Resumen',
      icon: Eye,
      description: 'Resumen ejecutivo',
      permission: 'basic'
    },
    {
      id: 'users',
      label: 'Usuarios',
      icon: Users,
      description: 'Estadísticas de usuarios',
      permission: 'basic'
    },
    {
      id: 'machinery',
      label: 'Maquinaria',
      icon: Truck,
      description: 'Métricas de maquinaria',
      permission: 'basic'
    },
    {
      id: 'operators',
      label: 'Operadores',
      icon: HardHat,
      description: 'Rendimiento de operadores',
      permission: 'basic'
    },
    {
      id: 'reports',
      label: 'Reportes',
      icon: FileText,
      description: 'Análisis de reportes',
      permission: 'basic'
    },
    {
      id: 'audit',
      label: 'Auditoría Avanzada',
      icon: Shield,
      description: 'Métricas de auditoría avanzadas',
      permission: 'advanced'
    },
    {
      id: 'trends',
      label: 'Tendencias',
      icon: TrendingUp,
      description: 'Análisis de tendencias',
      permission: 'advanced'
    }
  ];

  // Filtrar tabs según permisos
  const availableTabs = tabConfig.filter(tab => 
    tab.permission === 'basic' || 
    (tab.permission === 'advanced' && canViewAdvancedStats())
  );

  return (
    <div className="container mx-auto px-4 py-8 space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-gray-900 flex items-center gap-3">
            <BarChart3 className="h-8 w-8 text-blue-600" />
            Estadísticas del Sistema
          </h1>
          <p className="text-gray-600 mt-1">
            Análisis y métricas detalladas del sistema de gestión vial
          </p>
        </div>
        
        <div className="flex items-center gap-2">
          <Badge variant="outline" className="text-xs">
            {user?.roles?.join(', ') || 'Usuario'}
          </Badge>
          <Button
            variant="outline"
            onClick={() => activeTab === 'dashboard' ? loadDashboardStats() : loadTabData(activeTab)}
            disabled={isLoading}
          >
            {isLoading ? 'Actualizando...' : 'Actualizar'}
          </Button>
        </div>
      </div>

      {/* Error Alert */}
      {error && (
        <Alert variant="destructive">
          <AlertCircle className="h-4 w-4" />
          <AlertDescription>
            {error}
          </AlertDescription>
        </Alert>
      )}

      {/* Tabs de Estadísticas */}
      <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-6">
        <TabsList className="grid w-full grid-cols-4 lg:grid-cols-8 gap-1 h-auto p-1">
          {availableTabs.map((tab) => {
            const IconComponent = tab.icon;
            return (
              <TabsTrigger 
                key={tab.id} 
                value={tab.id} 
                className="flex flex-col items-center gap-1 p-3 text-xs"
                title={tab.description}
              >
                <IconComponent className="h-4 w-4" />
                <span className="hidden sm:block">{tab.label}</span>
              </TabsTrigger>
            );
          })}
        </TabsList>

        {/* Dashboard Principal */}
        <TabsContent value="dashboard">
          <DashboardStats 
            data={dashboardData}
            isLoading={isLoading}
            onRefresh={loadDashboardStats}
          />
        </TabsContent>

        {/* Resumen */}
        <TabsContent value="overview">
          <OverviewStats 
            data={overviewData}
            isLoading={isLoading}
            onRefresh={() => loadTabData('overview')}
          />
        </TabsContent>

        {/* Usuarios */}
        <TabsContent value="users">
          <UsersStats 
            data={usersData}
            isLoading={isLoading}
            onRefresh={() => loadTabData('users')}
          />
        </TabsContent>

        {/* Maquinaria */}
        <TabsContent value="machinery">
          <MachineryStats 
            data={machineryData}
            isLoading={isLoading}
            onRefresh={() => loadTabData('machinery')}
          />
        </TabsContent>

        {/* Operadores */}
        <TabsContent value="operators">
          <OperatorsStats 
            data={operatorsData}
            isLoading={isLoading}
            onRefresh={() => loadTabData('operators')}
          />
        </TabsContent>

        {/* Reportes */}
        <TabsContent value="reports">
          <ReportsStats 
            data={reportsData}
            isLoading={isLoading}
            onRefresh={() => loadTabData('reports')}
          />
        </TabsContent>

        {/* Auditoría Avanzada */}
        {canViewAdvancedStats() && (
          <TabsContent value="audit">
            <AuditStatsAdvanced 
              data={auditData}
              isLoading={isLoading}
              onRefresh={() => loadTabData('audit')}
            />
          </TabsContent>
        )}

        {/* Tendencias */}
        {canViewAdvancedStats() && (
          <TabsContent value="trends">
            <TrendsStats 
              data={trendsData}
              isLoading={isLoading}
              onRefresh={() => loadTabData('trends')}
            />
          </TabsContent>
        )}
      </Tabs>
    </div>
  );
};

export default EstadisticasModule;