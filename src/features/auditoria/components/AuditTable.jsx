// features/auditoria/components/AuditTable.jsx
import React, { useState } from 'react';
import { 
  Eye, 
  User, 
  Calendar, 
  Activity,
  ChevronLeft,
  ChevronRight,
  Plus,
  Edit3,
  Trash2,
  RefreshCw,
  Shield,
  Settings,
  AlertCircle,
  Info
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Card, CardContent } from '@/components/ui/card';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { fmtDMY_HM } from '@/utils/date';
import auditService from '@/services/auditService';

// Importar las imágenes para el PDF
import headerUrl from '@/assets/header.png';
import footerUrl from '@/assets/footer.png';

// URLs de los logos para exportar PDF
const HEADER_URL = headerUrl;
const FOOTER_URL = footerUrl;

/**
 * Funciones auxiliares para la exportación a PDF
 */

// Función para obtener el nombre completo del usuario (reutilizada del código existente)
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

// Función para obtener el email del usuario (reutilizada del código existente)
const getUserEmail = (log) => {
  if (log.userEmail) return log.userEmail;
  if (log.email) return log.email;
  if (log.user_email) return log.user_email;
  
  if (log.User && log.User.email) return log.User.email;
  if (log.user && log.user.email) return log.user.email;
  
  return 'No email';
};

// Función para traducir las acciones a español (reutilizada del código existente)
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
    // Las acciones ya en español se mantienen igual
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

// Función para verificar si un valor está vacío
const isEmptyVal = (v) => {
  return v === undefined || v === null || v === "" || (typeof v === "number" && Number.isNaN(v));
};

// Función para convertir valor a HTML seguro
const toHTML = (v) => {
  if (isEmptyVal(v)) return "—";
  return String(v).replace(/\n/g, "<br>").replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;');
};

// Función para crear una fila plana de datos de auditoría para exportar
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

/**
 * Función para formatear timestamp a hora de Costa Rica
 */
const formatCostaRicaTime = (timestamp) => {
  if (!timestamp) return 'N/A';
  
  try {
    // Usar la utilidad fmtDMY_HM que maneja correctamente las fechas
    return fmtDMY_HM(timestamp);
  } catch (error) {
    console.error('Error formateando fecha:', error);
    return 'Fecha inválida';
  }
};

const AuditTable = ({ 
  logs = [], 
  isLoading = false, 
  pagination = {}, 
  onPageChange,
  hasActiveFilters = false,
  onExportPDF
}) => {
  const [selectedLog, setSelectedLog] = useState(null);
  const [showDetailsModal, setShowDetailsModal] = useState(false);

  // Función para obtener el icono de la acción
  const getActionIcon = (action) => {
    const icons = {
      CREATE: Plus,
      UPDATE: Edit3,
      DELETE: Trash2,
      RESTORE: RefreshCw,
      AUTH: Shield,
      LOGIN: Shield,
      LOGOUT: Shield,
      VIEW: Eye,
      EXPORT: Activity,
      ROLE_CHANGE: User,
      SYSTEM: Settings,
      CREAR: Plus,
      ACTUALIZAR: Edit3,
      ELIMINAR: Trash2,
      RESTAURAR: RefreshCw,
      AUTENTICACIÓN: Shield,
      'INICIO SESIÓN': Shield,
      'CIERRE SESIÓN': Shield,
      VER: Eye,
      EXPORTAR: Activity
    };
    const IconComponent = icons[action] || Activity;
    return <IconComponent className="h-4 w-4" />;
  };

  // Función para obtener el color de la acción
  const getActionColor = (action) => {
    const colors = {
      CREATE: 'bg-green-100 text-green-800 border-green-200',
      UPDATE: 'bg-blue-100 text-blue-800 border-blue-200',
      DELETE: 'bg-red-100 text-red-800 border-red-200',
      RESTORE: 'bg-yellow-100 text-yellow-800 border-yellow-200',
      AUTH: 'bg-purple-100 text-purple-800 border-purple-200',
      LOGIN: 'bg-purple-100 text-purple-800 border-purple-200',
      LOGOUT: 'bg-indigo-100 text-indigo-800 border-indigo-200',
      VIEW: 'bg-cyan-100 text-cyan-800 border-cyan-200',
      EXPORT: 'bg-emerald-100 text-emerald-800 border-emerald-200',
      ROLE_CHANGE: 'bg-orange-100 text-orange-800 border-orange-200',
      SYSTEM: 'bg-gray-100 text-gray-800 border-gray-200',
      CREAR: 'bg-green-100 text-green-800 border-green-200',
      ACTUALIZAR: 'bg-blue-100 text-blue-800 border-blue-200',
      ELIMINAR: 'bg-red-100 text-red-800 border-red-200',
      RESTAURAR: 'bg-yellow-100 text-yellow-800 border-yellow-200',
      AUTENTICACIÓN: 'bg-purple-100 text-purple-800 border-purple-200',
      'INICIO SESIÓN': 'bg-purple-100 text-purple-800 border-purple-200',
      'CIERRE SESIÓN': 'bg-indigo-100 text-indigo-800 border-indigo-200',
      VER: 'bg-cyan-100 text-cyan-800 border-cyan-200',
      EXPORTAR: 'bg-emerald-100 text-emerald-800 border-emerald-200'
    };
    return colors[action] || 'bg-gray-100 text-gray-800 border-gray-200';
  };

  // Función para traducir las acciones a español
  const getActionText = (action) => {
    const translations = {
      CREATE: 'CREAR',
      UPDATE: 'ACTUALIZAR', 
      DELETE: 'ELIMINAR',
      RESTORE: 'RESTAURAR',
      AUTH: 'AUTENTICACIÓN',
      ROLE_CHANGE: 'CAMBIO DE ROL',
      // Las acciones ya en español se mantienen igual
      CREAR: 'CREAR',
      ACTUALIZAR: 'ACTUALIZAR',
      ELIMINAR: 'ELIMINAR',
      RESTAURAR: 'RESTAURAR',
      AUTENTICACIÓN: 'AUTENTICACIÓN'
    };
    return translations[action] || action;
  };

  // Función para obtener el nombre completo del usuario
  const getUserFullName = (log) => {
    // Primero, intentar con los campos más comunes
    if (log.name && log.lastname) {
      return `${log.name} ${log.lastname}`;
    }
    
    // Intentar con campos de nombre completo
    if (log.userFullName) return log.userFullName;
    if (log.fullName) return log.fullName;
    if (log.user_full_name) return log.user_full_name;
    
    // Intentar con userName en diferentes formatos
    if (log.userName) return log.userName;
    if (log.user_name) return log.user_name;
    if (log.username) return log.username;
    
    // Intentar con campos anidados de usuario (si el log tiene un objeto User)
    if (log.User) {
      const user = log.User;
      if (user.name && user.lastname) return `${user.name} ${user.lastname}`;
      if (user.fullName) return user.fullName;
      if (user.userName) return user.userName;
    }
    
    // Intentar con campos anidados en minúscula
    if (log.user) {
      const user = log.user;
      if (user.name && user.lastname) return `${user.name} ${user.lastname}`;
      if (user.fullName) return user.fullName;
      if (user.userName) return user.userName;
      if (user.full_name) return user.full_name;
    }
    
    return 'Sin nombre';
  };

  // Función para obtener el email del usuario
  const getUserEmail = (log) => {
    // Intentar con los campos más comunes
    if (log.userEmail) return log.userEmail;
    if (log.email) return log.email;
    if (log.user_email) return log.user_email;
    
    // Intentar con campos anidados de usuario
    if (log.User && log.User.email) return log.User.email;
    if (log.user && log.user.email) return log.user.email;
    
    return 'No email';
  };

  // Función para truncar texto
  const truncateText = (text, maxLength = 50) => {
    if (!text) return '';
    return text.length > maxLength ? `${text.substring(0, maxLength)}...` : text;
  };

  // Función para mostrar detalles del log
  const showLogDetails = (log) => {
    setSelectedLog(log);
    setShowDetailsModal(true);
  };

  // Función para exportar a PDF (usando el mismo diseño del módulo de transporte)
  const exportAuditPDF = () => {
    if (!logs || logs.length === 0) {
      alert('No hay datos de auditoría para exportar');
      return;
    }

    // 1) Convertir logs a filas planas
    const rows = logs.map(buildFlatAuditRow);

    // 2) Headers dinámicos 
    const headers = ['Fecha', 'Acción', 'Email', 'Nombre Completo', 'Descripción', 'Entidad'];

    // 3) URLs absolutas para las imágenes
    const headerAbs = new URL(HEADER_URL, window.location.origin).toString();
    const footerAbs = new URL(FOOTER_URL, window.location.origin).toString();

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
        <div class="meta">Registros de auditoría — ${rows.length} registro(s)</div>
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
      alert("Bloqueado por el navegador. Habilita pop-ups para exportar.");
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
  };

  if (isLoading) {
    return (
      <Card>
        <CardContent className="flex items-center justify-center py-12">
          <div className="flex items-center gap-2 text-gray-500">
            <Activity className="h-5 w-5 animate-spin" />
            Cargando logs de auditoría...
          </div>
        </CardContent>
      </Card>
    );
  }

  if (!logs || logs.length === 0) {
    return (
      <Card>
        <CardContent className="flex flex-col items-center justify-center py-12">
          <AlertCircle className="h-12 w-12 text-gray-400 mb-4" />
          <h3 className="text-lg font-medium text-gray-900 mb-2">
            No se encontraron registros
          </h3>
        </CardContent>
      </Card>
    );
  }

  return (
    <div className="space-y-4">
      <Card>
        <CardContent className="p-0">
          <div className="rounded-lg border">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead className="w-[180px]">
                    <div className="flex items-center gap-2">
                      <Calendar className="h-4 w-4" />
                      Fecha y Hora
                    </div>
                  </TableHead>
                  <TableHead className="w-[120px]">
                    <div className="flex items-center gap-2">
                      <Activity className="h-4 w-4" />
                      Acción
                    </div>
                  </TableHead>
                  <TableHead className="w-[200px]">
                    <div className="flex items-center gap-2">
                      <User className="h-4 w-4" />
                      Email
                    </div>
                  </TableHead>
                  <TableHead className="w-[200px]">Nombre Completo</TableHead>
                  <TableHead>Descripción</TableHead>
                  <TableHead className="w-[80px]">Detalles</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {logs.map((log) => (
                  <TableRow key={log.id || log._id} className="hover:bg-gray-50">
                    <TableCell className="font-mono text-sm">
                      {formatCostaRicaTime(log.timestamp || log.createdAt)}
                    </TableCell>
                    <TableCell>
                      <Badge 
                        variant="outline" 
                        className={`${getActionColor(log.action)} flex items-center gap-1 w-fit`}
                      >
                        {getActionIcon(log.action)}
                        {getActionText(log.action)}
                      </Badge>
                    </TableCell>
                    <TableCell className="font-medium">
                      {getUserEmail(log)}
                    </TableCell>
                    <TableCell className="font-medium">
                      {getUserFullName(log)}
                    </TableCell>
                    <TableCell className="max-w-[300px]">
                      <div className="truncate" title={log.description}>
                        {log.description || 'Sin descripción'}
                      </div>
                    </TableCell>
                    <TableCell>
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => showLogDetails(log)}
                        className="h-8 w-8 p-0"
                      >
                        <Eye className="h-4 w-4" />
                      </Button>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </div>

          {/* Paginación */}
          {pagination?.totalPages > 1 && (
            <div className="flex items-center justify-between px-6 py-4 border-t">
              <div className="text-sm text-gray-500">
                Página {pagination.currentPage} de {pagination.totalPages} 
                ({pagination.total} registros total)
              </div>
              <div className="flex items-center gap-2">
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => onPageChange(pagination.currentPage - 1)}
                  disabled={pagination.currentPage <= 1}
                >
                  <ChevronLeft className="h-4 w-4" />
                  Anterior
                </Button>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => onPageChange(pagination.currentPage + 1)}
                  disabled={pagination.currentPage >= pagination.totalPages}
                >
                  Siguiente
                  <ChevronRight className="h-4 w-4" />
                </Button>
              </div>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Modal de detalles */}
      <Dialog open={showDetailsModal} onOpenChange={setShowDetailsModal}>
        <DialogContent className="max-w-4xl max-h-[80vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <Info className="h-5 w-5" />
              Detalles del Log de Auditoría
            </DialogTitle>
          </DialogHeader>
          
          {selectedLog && (
            <div className="space-y-6">
              {/* Información básica */}
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="text-sm font-medium text-gray-500">Fecha y Hora</label>
                  <p className="mt-1 font-mono text-sm">
                    {formatCostaRicaTime(selectedLog.timestamp || selectedLog.createdAt)}
                  </p>
                </div>
                <div>
                  <label className="text-sm font-medium text-gray-500">Acción</label>
                  <div className="mt-1">
                    <Badge 
                      variant="outline" 
                      className={`${getActionColor(selectedLog.action)} flex items-center gap-1 w-fit`}
                    >
                      {getActionIcon(selectedLog.action)}
                      {getActionText(selectedLog.action)}
                    </Badge>
                  </div>
                </div>
                <div>
                  <label className="text-sm font-medium text-gray-500">Email</label>
                  <p className="mt-1 font-medium">{getUserEmail(selectedLog)}</p>
                </div>
                <div>
                  <label className="text-sm font-medium text-gray-500">Nombre Completo</label>
                  <p className="mt-1 font-medium">{getUserFullName(selectedLog)}</p>
                </div>
              </div>

              {/* Descripción */}
              <div>
                <label className="text-sm font-medium text-gray-500">Descripción</label>
                <p className="mt-1">{selectedLog.description || 'Sin descripción'}</p>
              </div>

              {/* Entidad afectada */}
              {(selectedLog.entity || selectedLog.entityId) && (
                <div className="grid grid-cols-2 gap-4">
                  {selectedLog.entity && (
                    <div>
                      <label className="text-sm font-medium text-gray-500">Entidad</label>
                      <p className="mt-1 capitalize">{selectedLog.entity}</p>
                    </div>
                  )}
                  {selectedLog.entityId && (
                    <div>
                      <label className="text-sm font-medium text-gray-500">ID de Entidad</label>
                      <p className="mt-1 font-mono text-sm">{selectedLog.entityId}</p>
                    </div>
                  )}
                </div>
              )}

              {/* Cambios realizados */}
              {selectedLog.changes && (
                <div>
                  <label className="text-sm font-medium text-gray-500">Cambios Realizados</label>
                  <div className="mt-2 space-y-2">
                    {selectedLog.changes.before && (
                      <div className="p-3 bg-red-50 border border-red-200 rounded-lg">
                        <h4 className="text-sm font-medium text-red-800 mb-2">Antes:</h4>
                        <pre className="text-xs text-red-700 whitespace-pre-wrap">
                          {JSON.stringify(selectedLog.changes.before, null, 2)}
                        </pre>
                      </div>
                    )}
                    {selectedLog.changes.after && (
                      <div className="p-3 bg-green-50 border border-green-200 rounded-lg">
                        <h4 className="text-sm font-medium text-green-800 mb-2">Después:</h4>
                        <pre className="text-xs text-green-700 whitespace-pre-wrap">
                          {JSON.stringify(selectedLog.changes.after, null, 2)}
                        </pre>
                      </div>
                    )}
                  </div>
                </div>
              )}

              {/* Metadatos */}
              {selectedLog.metadata && (
                <div>
                  <label className="text-sm font-medium text-gray-500">Metadatos</label>
                  <div className="mt-2 p-3 bg-gray-50 border rounded-lg">
                    <pre className="text-xs text-gray-700 whitespace-pre-wrap">
                      {JSON.stringify(selectedLog.metadata, null, 2)}
                    </pre>
                  </div>
                </div>
              )}
            </div>
          )}
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default AuditTable;