// features/auditoria/AuditoriaModule.jsx
import React, { useState, useEffect, useCallback } from 'react';
import { useAuth } from '@/context/AuthContext';
import { 
  Shield, AlertCircle, BarChart3, Eye, Users, Activity,
  Truck, HardHat, FileText, TrendingUp
} from 'lucide-react';
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import auditService from '@/services/auditService';
import statisticsService from '@/services/statisticsService';
import AuditTable from './components/AuditTable';
import AuditFilters from './components/AuditFilters';
import AuditStats from './components/AuditStats';
import ActiveUsers from './components/ActiveUsers';
import { useAuditLogger } from '@/hooks/useAuditLogger';
import { toast } from '@/hooks/use-toast';

// Importar componentes de estadísticas del sistema
import DashboardStats from '../estadisticas/components/DashboardStats';
import OverviewStats from '../estadisticas/components/OverviewStats';
import UsersStats from '../estadisticas/components/UsersStats';
import MachineryStats from '../estadisticas/components/MachineryStats';
import OperatorsStats from '../estadisticas/components/OperatorsStats';
import ReportsStats from '../estadisticas/components/ReportsStats';
import AuditStatsAdvanced from '../estadisticas/components/AuditStatsAdvanced';
import TrendsStats from '../estadisticas/components/TrendsStats';

// Importar las imágenes para el PDF
import headerUrl from '@/assets/header.png';
import footerUrl from '@/assets/footer.png';

const AuditoriaModule = () => {
  const { user } = useAuth();
  const { logCreate } = useAuditLogger();
  
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

  // Estados para estadísticas del sistema
  const [systemStats, setSystemStats] = useState({
    dashboard: null,
    overview: null,
    users: null,
    machinery: null,
    operators: null,
    reports: null,
    auditAdvanced: null,
    trends: null
  });
  const [isLoadingSystemStats, setIsLoadingSystemStats] = useState(false);

  // Verificar si el usuario es superadmin, ingeniero o inspector
  const isSuperAdmin = user?.roles && (
    user.roles.includes('superadmin') || 
    user.roles.includes('SuperAdmin') ||
    user.roles.includes('SUPERADMIN')
  );

  const isIngeniero = user?.roles && (
    user.roles.includes('ingeniero') ||
    user.roles.includes('Ingeniero')
  );

  const isInspector = user?.roles && (
    user.roles.includes('inspector') ||
    user.roles.includes('Inspector')
  );

  const canViewAudit = isSuperAdmin || isIngeniero || isInspector;
  const canEditAudit = isSuperAdmin; // Solo superadmin puede editar/eliminar
  
  // Permisos específicos para estadísticas
  const canViewStatistics = isSuperAdmin || isIngeniero || isInspector;
  const canViewAdvancedStatistics = isSuperAdmin || isIngeniero;

  
  // Función para cargar logs con filtros
  const loadAuditLogs = useCallback(async (filters) => {
    if (!canViewAudit) {
      return;
    }
    
    setIsLoading(true);
    setError(null);
    
    try {
      const filtersToUse = filters || currentFilters;
      const result = await auditService.getAuditLogs(filtersToUse);
      
      if (result.success) {
        // El backend puede devolver los datos en result.data.data o result.data.logs
        const logsData = result.data.data || result.data.logs || [];
        
        // Filtrar y transformar los datos para evitar duplicados
        const filteredLogs = [];
        const seenLogs = new Map();
        
        for (const log of logsData) {
          // Crear clave única para detectar duplicados
          const logKey = `${log.action}-${log.entity}-${log.entityId}-${log.timestamp}`;
          
          // Si ya existe un log similar
          if (seenLogs.has(logKey)) {
            const existingLog = seenLogs.get(logKey);
            
            // Si el log actual tiene más información (nombre, email), usar ese
            if ((log.name && log.lastname && log.userEmail) && 
                (!existingLog.name || !existingLog.lastname || !existingLog.userEmail)) {
              seenLogs.set(logKey, log);
              // Reemplazar en filteredLogs
              const index = filteredLogs.findIndex(l => 
                `${l.action}-${l.entity}-${l.entityId}-${l.timestamp}` === logKey
              );
              if (index >= 0) {
                filteredLogs[index] = log;
              }
            }
            // Si el log existente tiene más información, mantener ese
            continue;
          }
          
          // Agregar el log si no es duplicado
          seenLogs.set(logKey, log);
          filteredLogs.push(log);
        }
        
        // Transformar los logs filtrados para asegurar que tengan name y lastname
        const transformedLogs = filteredLogs.map(log => {
          // Si ya tiene name y lastname, usar esos
          if (log.name && log.lastname) {
            return log;
          }
          
          let transformedLog = { ...log };
          
          // Intentar extraer de userFullName
          if (log.userFullName && !transformedLog.name) {
            const nameParts = log.userFullName.split(' ');
            if (nameParts.length >= 2) {
              transformedLog.name = nameParts.slice(0, Math.ceil(nameParts.length / 2)).join(' ');
              transformedLog.lastname = nameParts.slice(Math.ceil(nameParts.length / 2)).join(' ');
            }
          }
          
          // Intentar extraer de userName
          if (log.userName && !transformedLog.name) {
            const nameParts = log.userName.split(' ');
            if (nameParts.length >= 2) {
              transformedLog.name = nameParts.slice(0, Math.ceil(nameParts.length / 2)).join(' ');
              transformedLog.lastname = nameParts.slice(Math.ceil(nameParts.length / 2)).join(' ');
            }
          }
          
          // Intentar desde objetos anidados
          if (log.User && !transformedLog.name) {
            if (log.User.name && log.User.lastname) {
              transformedLog.name = log.User.name;
              transformedLog.lastname = log.User.lastname;
              transformedLog.userEmail = transformedLog.userEmail || log.User.email;
            }
          }
          
          if (log.user && !transformedLog.name) {
            if (log.user.name && log.user.lastname) {
              transformedLog.name = log.user.name;
              transformedLog.lastname = log.user.lastname;
              transformedLog.userEmail = transformedLog.userEmail || log.user.email;
            }
          }
          
          // Asegurar que tiene userEmail
          if (!transformedLog.userEmail) {
            transformedLog.userEmail = log.email || log.user_email || (log.User && log.User.email) || (log.user && log.user.email);
          }
          
          return transformedLog;
        });
        
        setLogs(transformedLogs);
        setPagination({
          currentPage: result.data.page || result.data.currentPage || 1,
          totalPages: result.data.totalPages || 1,
          total: result.data.total || 0,
          limit: filtersToUse.limit || 50
        });


        
        // Detectar si son datos simulados
        const isSimulated = logsData.length > 0 && (
          (logsData[0].id === '1' && logsData[0].userName === 'Juan Pérez') ||
          logsData.some(log => log.userCedula && log.userCedula.length === 9) // Los datos simulados tienen cédula
        );
        setIsUsingSimulatedData(isSimulated);
        
        setIsUsingSimulatedData(isSimulated);
      } else {
        throw new Error(result.error || 'Error al cargar logs');
      }
    } catch (error) {
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
  }, [canViewAudit]);

  // Función para cargar estadísticas
  const loadAuditStats = useCallback(async (dateRange = {}) => {
    if (!canViewAudit) return;
    
    setIsLoadingStats(true);
    
    try {
      const result = await auditService.getAuditStats(dateRange);
      
      if (result.success) {
        setStats(result.data);
      }
    } catch (error) {
      // No mostramos toast para stats para no ser muy intrusivos
    } finally {
      setIsLoadingStats(false);
    }
  }, [canViewAudit]);

  // Función para cargar estadísticas específicas del sistema
  const loadSystemStatistics = useCallback(async (statType) => {
    if (!canViewAudit) return;
    
    setIsLoadingSystemStats(true);
    
    try {
      let result;
      
      switch (statType) {
        case 'dashboard':
          result = await statisticsService.getDashboardStats();
          break;
        case 'overview':
          result = await statisticsService.getOverviewStats();
          break;
        case 'users':
          result = await statisticsService.getUsersStats();
          break;
        case 'machinery':
          result = await statisticsService.getMachineryStats();
          break;
        case 'operators':
          result = await statisticsService.getOperatorsStats();
          break;
        case 'reports':
          result = await statisticsService.getReportsStats();
          break;
        case 'auditAdvanced':
          result = await statisticsService.getAuditStats();
          break;
        case 'trends':
          result = await statisticsService.getTrendsStats();
          break;
        default:
          return;
      }
      
      if (result.success) {
        setSystemStats(prev => ({
          ...prev,
          [statType]: result.data
        }));
      } else {
        // Si falla la API, usar datos simulados para desarrollo
        if (statType === 'dashboard') {
          const simulatedResult = statisticsService.getSimulatedDashboardStats();
          setSystemStats(prev => ({
            ...prev,
            [statType]: simulatedResult.data
          }));
        }
      }
    } catch (error) {
      console.error(`Error loading ${statType} statistics:`, error);
      // Fallback a datos simulados para dashboard
      if (statType === 'dashboard') {
        const simulatedResult = statisticsService.getSimulatedDashboardStats();
        setSystemStats(prev => ({
          ...prev,
          [statType]: simulatedResult.data
        }));
      }
    } finally {
      setIsLoadingSystemStats(false);
    }
  }, [canViewAudit]);

  // Manejar cambios en los filtros
  const handleFiltersChange = useCallback((newFilters) => {
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

  // Funciones auxiliares para la exportación a PDF
  const getUserFullName = (log) => {
    if (log.name && log.lastname) {
      return `${log.name} ${log.lastname}`;
    }
    
    if (log.userFullName) return log.userFullName;
    if (log.fullName) return log.fullName;
    if (log.user_full_name) return log.user_full_name;
    
    if (log.userName) return log.userName;
    if (log.user_name) return log.user_name;
    if (log.username) return log.username;
    
    if (log.User) {
      const user = log.User;
      if (user.name && user.lastname) return `${user.name} ${user.lastname}`;
      if (user.fullName) return user.fullName;
      if (user.userName) return user.userName;
    }
    
    if (log.user) {
      const user = log.user;
      if (user.name && user.lastname) return `${user.name} ${user.lastname}`;
      if (user.fullName) return user.fullName;
      if (user.userName) return user.userName;
      if (user.full_name) return user.full_name;
    }
    
    return 'Sin nombre';
  };

  const getUserEmail = (log) => {
    if (log.userEmail) return log.userEmail;
    if (log.email) return log.email;
    if (log.user_email) return log.user_email;
    
    if (log.User && log.User.email) return log.User.email;
    if (log.user && log.user.email) return log.user.email;
    
    return 'No email';
  };

  const getActionText = (action) => {
    const translations = {
      CREATE: 'CREAR',
      UPDATE: 'ACTUALIZAR', 
      DELETE: 'ELIMINAR',
      RESTORE: 'RESTAURAR',
      AUTH: 'AUTENTICACIÓN',
      ROLE_CHANGE: 'CAMBIO DE ROL',
      LOGIN: 'INICIO SESIÓN',
      LOGOUT: 'CIERRE SESIÓN',
      VIEW: 'VER',
      EXPORT: 'EXPORTAR',
      SYSTEM: 'SISTEMA',
      CREAR: 'CREAR',
      ACTUALIZAR: 'ACTUALIZAR',
      ELIMINAR: 'ELIMINAR',
      RESTAURAR: 'RESTAURAR',
      AUTENTICACIÓN: 'AUTENTICACIÓN',
      'INICIO SESIÓN': 'INICIO SESIÓN',
      'CIERRE SESIÓN': 'CIERRE SESIÓN',
      VER: 'VER',
      EXPORTAR: 'EXPORTAR'
    };
    return translations[action] || action;
  };

  const formatCostaRicaTime = (timestamp) => {
    if (!timestamp) return 'N/A';
    
    try {
      const date = new Date(timestamp);
      return date.toLocaleString('es-CR', {
        timeZone: 'America/Costa_Rica',
        year: 'numeric',
        month: '2-digit',
        day: '2-digit',
        hour: '2-digit',
        minute: '2-digit',
        second: '2-digit'
      });
    } catch (error) {
      console.error('Error formateando fecha:', error);
      return 'Fecha inválida';
    }
  };

  const isEmptyVal = (v) => {
    return v === undefined || v === null || v === "" || (typeof v === "number" && Number.isNaN(v));
  };

  const toHTML = (v) => {
    if (isEmptyVal(v)) return "—";
    return String(v).replace(/\n/g, "<br>").replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;');
  };

  const buildFlatAuditRow = (log) => {
    return {
      Fecha: formatCostaRicaTime(log.timestamp || log.createdAt),
      Acción: getActionText(log.action),
      Email: getUserEmail(log),
      'Nombre Completo': getUserFullName(log),
      Descripción: log.description || 'Sin descripción',
      Entidad: log.entity || '—'
    };
  };

  // Función principal de exportación a PDF
  const handleExportPDF = useCallback(() => {
    if (!logs || logs.length === 0) {
      toast({
        title: "Sin datos",
        description: "No hay logs de auditoría para exportar",
        variant: "destructive",
      });
      return;
    }

    try {
      // 1) Convertir logs a filas planas
      const rows = logs.map(buildFlatAuditRow);

      // 2) Headers dinámicos 
      const headers = ['Fecha', 'Acción', 'Email', 'Nombre Completo', 'Descripción', 'Entidad'];

      // 3) URLs absolutas para las imágenes
      const headerAbs = new URL(headerUrl, window.location.origin).toString();
      const footerAbs = new URL(footerUrl, window.location.origin).toString();

      // 4) CSS (mismo estilo que en transporte)
      const head = `
      <style>
        :root{
          --footer-h: 50px;
          --gap-bottom: 8px;
          --margin-x: 18mm;
        }

        @page{
          size: A4 landscape;
          margin: 16mm var(--margin-x) calc(var(--footer-h) + var(--gap-bottom)) var(--margin-x);
        }

        html, body{
          margin:0; padding:0;
          font-family: system-ui, -apple-system, "Segoe UI", Roboto, Arial, sans-serif;
          -webkit-print-color-adjust: exact;
          print-color-adjust: exact;
          position: relative;
        }

        .report-title{
          margin: 0 0 6px;
          break-after: avoid-page;
          page-break-after: avoid;
        }

        footer{
          position: fixed;
          left: var(--margin-x);
          right: var(--margin-x);
          bottom: 0;
          height: var(--footer-h);
          display: flex;
          align-items: center;
          justify-content: center;
          background: #fff;
          z-index: 9999;
          transform: translateZ(0);
        }

        footer img{
          height: 40px;
          max-width: 100%;
          width: auto;
          object-fit: contain;
          object-position: center;
          display: block;
        }

        main{
          padding-bottom: calc(var(--footer-h) + var(--gap-bottom));
          transform: translateZ(0);
        }

        .logo-row td{ border:none; padding:8px 0; background:#fff; }
        .logo-wrap{ display:flex; justify-content:center; }
        .logo-wrap img{ 
          height: 60px; 
          max-width: 100%; 
          object-fit: contain; 
          object-position: center;
        }

        .title-row td{ border:none; padding:0 0 6px; background:#fff; }
        .title-wrap{ display:flex; flex-direction:column; align-items:flex-start; }
        .title-wrap h1{ margin:0; font-size:16px; }
        .meta{ font-size:11px; color:#374151; margin-top:2px; }

        table{ width:100%; border-collapse:collapse; table-layout:fixed; font-size:10px; }
        thead{ display: table-header-group; }

        thead .cols th{
          background:#f3f4f6; border:1px solid #e5e7eb; padding:6px 5px; vertical-align:bottom;
        }

        thead .cols .th{ line-height:1.1; hyphens:auto; word-break:break-word; }

        tbody td{
          border:1px solid #f1f5f9; padding:5px 6px; vertical-align:top;
          word-break:break-word; hyphens:auto;
        }

        tbody tr:nth-child(even) td{ background:#fafafa; }

        /* Control de paginación: máximo 10 filas por página */
        tbody tr:nth-child(10n) {
          page-break-after: always;
        }
        
        table, thead, tbody, tr, td, th{ break-inside: avoid; page-break-inside: avoid; }
        tr{ page-break-before:auto; page-break-after:auto; }
      </style>`;

      // 5) Título del reporte
      const titleBlock = `
        <div class="report-title">
          <h1>Logs de Auditoría del Sistema</h1>
          <div class="meta">Registros de auditoría — ${rows.length} registro(s) — Generado el ${new Date().toLocaleDateString('es-CR')}</div>
        </div>
      `;

      // 6) Encabezado de la tabla
      const thead = `
        <tr class="logo-row">
          <td colspan="${headers.length}">
            <div class="logo-wrap">
              <img src="${headerAbs}" alt="Encabezado" />
            </div>
          </td>
        </tr>
        
        <tr class="cols">
          ${headers.map(h => `<th><div class="th">${h}</div></th>`).join("")}
        </tr>
      `;

      // 7) Cuerpo de la tabla
      const tbody = rows
        .map(row => `<tr>${headers.map(h => `<td>${toHTML(row[h])}</td>`).join("")}</tr>`)
        .join("");

      // 8) HTML final
      const html = `
      <html>
        <head>${head}</head>
        <body>
          <main>
            <table>
              <thead>${thead}</thead>
              <tbody>${tbody}</tbody>
            </table>
          </main>

          <footer>
            <img src="${footerAbs}" alt="Pie de página" />
          </footer>
        </body>
      </html>`;

      // 9) Abrir ventana e imprimir
      const win = window.open("", "_blank");
      if (!win) {
        toast({
          title: "Error",
          description: "Bloqueado por el navegador. Habilita pop-ups para exportar.",
          variant: "destructive",
        });
        return;
      }

      win.document.open();
      win.document.write(html);
      win.document.close();

      // Esperar que las imágenes carguen antes de imprimir
      const waitImages = () =>
        Promise.all(
          Array.from(win.document.images).map(
            img =>
              new Promise(res => {
                if (img.complete) return res();
                img.onload = res;
                img.onerror = res;
              })
          )
        );

      waitImages().then(() => {
        win.focus();
        win.print();
      });

      win.onafterprint = () => {
        try {
          win.close();
        } catch {}
      };

      // Log de auditoría para la exportación
      logCreate('EXPORT', 'audit_logs', null, 'Exportación de logs de auditoría a PDF');

      toast({
        title: "Exportación iniciada",
        description: `Se está generando el PDF con ${rows.length} registros de auditoría`,
      });

    } catch (error) {
      console.error('Error exportando PDF:', error);
      toast({
        title: "Error en exportación",
        description: "No se pudo generar el PDF. Inténtalo de nuevo.",
        variant: "destructive",
      });
    }
  }, [logs, logCreate]);



  // Efecto inicial - cargar datos cuando el componente se monta
  useEffect(() => {
    if (canViewAudit) {
      loadAuditLogs({ page: 1, limit: 50 });
      loadAuditStats();
      
      // Cargar todas las estadísticas del sistema si el usuario tiene permisos
      if (canViewStatistics) {
        // Cargar estadísticas básicas para todos
        loadSystemStatistics('dashboard');
        loadSystemStatistics('overview');
        loadSystemStatistics('users');
        
        // Cargar estadísticas avanzadas solo para usuarios autorizados
        if (canViewAdvancedStatistics) {
          loadSystemStatistics('machinery');
          loadSystemStatistics('operators');
          loadSystemStatistics('reports');
          loadSystemStatistics('trends');
        }
      }
    }
  }, [canViewAudit, canViewStatistics, canViewAdvancedStatistics]);

  // Si no tiene permisos para ver auditoría, mostrar mensaje de acceso denegado
  if (!canViewAudit) {
    return (
      <div className="container mx-auto px-4 py-8">
        <Card className="max-w-md mx-auto">
          <CardContent className="flex flex-col items-center justify-center py-12">
            <Shield className="h-16 w-16 text-red-500 mb-4" />
            <h2 className="text-xl font-semibold text-gray-900 mb-2">
              Acceso Denegado
            </h2>
            <p className="text-gray-600 text-center mb-4">
              Solo los superadministradores, ingenieros e inspectores pueden acceder al módulo de auditoría.
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
            {isSuperAdmin ? 'Superadmin' : isIngeniero ? 'Ingeniero' : isInspector ? 'Inspector' : 'Usuario'}
          </Badge>
          <Badge variant="outline">
            {pagination.total} registros totales
          </Badge>
        </div>
      </div>



      {/* Indicador de datos simulados */}
      {isUsingSimulatedData && (
        <Alert className="mb-6 border-yellow-200 bg-yellow-50">
          <AlertCircle className="h-4 w-4 text-yellow-600" />
          <AlertDescription className="text-yellow-800">
            <strong>⚠️ Modo Demo:</strong> Se están mostrando datos de demostración porque el backend no está disponible. 
            Los cambios nuevos no se guardarán hasta que se restablezca la conexión.
          </AlertDescription>
        </Alert>
      )}

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
            onExportPDF={() => {
              // Crear una referencia temporal al AuditTable para acceder a su función de exportación
              if (logs && logs.length > 0) {
                // Llamar directamente a la función de exportación con los logs actuales
                handleExportPDF();
              } else {
                toast({
                  title: "Sin datos",
                  description: "No hay logs de auditoría para exportar",
                  variant: "destructive",
                });
              }
            }}
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
            onExportPDF={() => handleExportPDF()}
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

        {/* Tab de estadísticas - Todas las estadísticas del sistema */}
        <TabsContent value="stats" className="space-y-8">
          {canViewStatistics ? (
            <div>
              {/* Header principal */}
              <div className="bg-gradient-to-r from-blue-600 to-purple-700 rounded-xl p-6 text-white mb-8">
                <div className="flex items-center justify-between">
                  <div>
                    <h2 className="text-3xl font-bold mb-2 flex items-center gap-3">
                      <BarChart3 className="h-8 w-8" />
                      Estadísticas del Sistema
                    </h2>
                    <p className="text-blue-100 text-lg">
                      Dashboard completo con métricas y análisis del sistema de gestión vial municipal
                    </p>
                  </div>
                  <div className="flex gap-3">
                    <Button
                      variant="outline"
                      onClick={() => {
                        loadSystemStatistics('dashboard');
                        loadSystemStatistics('overview');
                        loadSystemStatistics('users');
                        if (canViewAdvancedStatistics) {
                          loadSystemStatistics('machinery');
                          loadSystemStatistics('operators');
                          loadSystemStatistics('reports');
                          loadSystemStatistics('trends');
                        }
                      }}
                      disabled={isLoadingSystemStats}
                      className="bg-white text-blue-600 border-blue-200 hover:bg-blue-50 flex items-center gap-2"
                    >
                      <Activity className="h-4 w-4" />
                      {isLoadingSystemStats ? 'Actualizando...' : 'Actualizar Todo'}
                    </Button>
                  </div>
                </div>
              </div>

              {/* Grid de estadísticas principales */}
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 mb-8">
                {/* Dashboard General */}
                <div className="lg:col-span-2">
                  <div className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden">
                    <div className="bg-gradient-to-r from-blue-50 to-blue-100 px-6 py-4 border-b border-blue-200">
                      <h3 className="text-xl font-semibold text-blue-900 flex items-center gap-2">
                        <Activity className="h-5 w-5" />
                        Dashboard General del Sistema
                      </h3>
                    </div>
                    <div className="p-6">
                      <DashboardStats 
                        data={systemStats.dashboard}
                        isLoading={isLoadingSystemStats}
                        onRefresh={() => loadSystemStatistics('dashboard')}
                      />
                    </div>
                  </div>
                </div>

                {/* Resumen Ejecutivo */}
                <div className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden">
                  <div className="bg-gradient-to-r from-green-50 to-green-100 px-6 py-4 border-b border-green-200">
                    <h3 className="text-lg font-semibold text-green-900 flex items-center gap-2">
                      <Eye className="h-5 w-5" />
                      Resumen Ejecutivo
                    </h3>
                  </div>
                  <div className="p-6">
                    <OverviewStats 
                      data={systemStats.overview}
                      isLoading={isLoadingSystemStats}
                      onRefresh={() => loadSystemStatistics('overview')}
                    />
                  </div>
                </div>

                {/* Estadísticas de Usuarios */}
                <div className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden">
                  <div className="bg-gradient-to-r from-purple-50 to-purple-100 px-6 py-4 border-b border-purple-200">
                    <h3 className="text-lg font-semibold text-purple-900 flex items-center gap-2">
                      <Users className="h-5 w-5" />
                      Usuarios del Sistema
                    </h3>
                  </div>
                  <div className="p-6">
                    <UsersStats 
                      data={systemStats.users}
                      isLoading={isLoadingSystemStats}
                      onRefresh={() => loadSystemStatistics('users')}
                    />
                  </div>
                </div>
              </div>

              {/* Estadísticas avanzadas (solo para usuarios autorizados) */}
              {canViewAdvancedStatistics && (
                <div className="space-y-8">
                  <div className="border-t border-gray-200 pt-8">
                    <h3 className="text-2xl font-bold text-gray-900 mb-6 flex items-center gap-2">
                      <Shield className="h-6 w-6 text-blue-600" />
                      Estadísticas Avanzadas
                    </h3>
                    
                    <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
                      {/* Estadísticas de Maquinaria */}
                      <div className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden">
                        <div className="bg-gradient-to-r from-orange-50 to-orange-100 px-6 py-4 border-b border-orange-200">
                          <h4 className="text-lg font-semibold text-orange-900 flex items-center gap-2">
                            <Truck className="h-5 w-5" />
                            Maquinaria y Equipos
                          </h4>
                        </div>
                        <div className="p-6">
                          <MachineryStats 
                            data={systemStats.machinery}
                            isLoading={isLoadingSystemStats}
                            onRefresh={() => loadSystemStatistics('machinery')}
                          />
                        </div>
                      </div>

                      {/* Estadísticas de Operadores */}
                      <div className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden">
                        <div className="bg-gradient-to-r from-yellow-50 to-yellow-100 px-6 py-4 border-b border-yellow-200">
                          <h4 className="text-lg font-semibold text-yellow-900 flex items-center gap-2">
                            <HardHat className="h-5 w-5" />
                            Operadores
                          </h4>
                        </div>
                        <div className="p-6">
                          <OperatorsStats 
                            data={systemStats.operators}
                            isLoading={isLoadingSystemStats}
                            onRefresh={() => loadSystemStatistics('operators')}
                          />
                        </div>
                      </div>

                      {/* Estadísticas de Reportes */}
                      <div className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden">
                        <div className="bg-gradient-to-r from-indigo-50 to-indigo-100 px-6 py-4 border-b border-indigo-200">
                          <h4 className="text-lg font-semibold text-indigo-900 flex items-center gap-2">
                            <FileText className="h-5 w-5" />
                            Reportes y Documentos
                          </h4>
                        </div>
                        <div className="p-6">
                          <ReportsStats 
                            data={systemStats.reports}
                            isLoading={isLoadingSystemStats}
                            onRefresh={() => loadSystemStatistics('reports')}
                          />
                        </div>
                      </div>

                      {/* Análisis de Tendencias */}
                      <div className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden">
                        <div className="bg-gradient-to-r from-teal-50 to-teal-100 px-6 py-4 border-b border-teal-200">
                          <h4 className="text-lg font-semibold text-teal-900 flex items-center gap-2">
                            <TrendingUp className="h-5 w-5" />
                            Tendencias y Análisis
                          </h4>
                        </div>
                        <div className="p-6">
                          <TrendsStats 
                            data={systemStats.trends}
                            isLoading={isLoadingSystemStats}
                            onRefresh={() => loadSystemStatistics('trends')}
                          />
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              )}

              {/* Mensaje para usuarios con acceso limitado */}
              {!canViewAdvancedStatistics && (
                <div className="bg-yellow-50 border border-yellow-200 rounded-xl p-6 mt-8">
                  <div className="flex items-center gap-3">
                    <Shield className="h-6 w-6 text-yellow-600" />
                    <div>
                      <h4 className="font-semibold text-yellow-800">Estadísticas Limitadas</h4>
                      <p className="text-yellow-700 text-sm mt-1">
                        Como Inspector, tiene acceso a las estadísticas básicas. Para ver estadísticas avanzadas, contacte a un Ingeniero o Superadministrador.
                      </p>
                    </div>
                  </div>
                </div>
              )}
            </div>
          ) : (
            <div className="text-center py-12">
              <Shield className="h-16 w-16 text-gray-300 mx-auto mb-4" />
              <h3 className="text-lg font-semibold text-gray-900 mb-2">
                Acceso Restringido
              </h3>
              <p className="text-gray-600">
                No tiene permisos para ver las estadísticas del sistema
              </p>
            </div>
          )}
        </TabsContent>
      </Tabs>
    </div>
  );
};

export default AuditoriaModule;