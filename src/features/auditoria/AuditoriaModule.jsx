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
import { useAuditLogger } from '@/hooks/useAuditLogger';
import { toast } from '@/hooks/use-toast';

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
  }, [isSuperAdmin]);

  // Función para cargar estadísticas
  const loadAuditStats = useCallback(async (dateRange = {}) => {
    if (!isSuperAdmin) return;
    
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
  }, [isSuperAdmin]);

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
    if (isSuperAdmin) {
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