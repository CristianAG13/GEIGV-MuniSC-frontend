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
  hasActiveFilters = false 
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
      ROLE_CHANGE: User,
      SYSTEM: Settings,
      CREAR: Plus,
      ACTUALIZAR: Edit3,
      ELIMINAR: Trash2,
      RESTAURAR: RefreshCw,
      AUTENTICACION: Shield
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
      ROLE_CHANGE: 'bg-orange-100 text-orange-800 border-orange-200',
      SYSTEM: 'bg-gray-100 text-gray-800 border-gray-200',
      CREAR: 'bg-green-100 text-green-800 border-green-200',
      ACTUALIZAR: 'bg-blue-100 text-blue-800 border-blue-200',
      ELIMINAR: 'bg-red-100 text-red-800 border-red-200',
      RESTAURAR: 'bg-yellow-100 text-yellow-800 border-yellow-200',
      AUTENTICACION: 'bg-purple-100 text-purple-800 border-purple-200'
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
      AUTH: 'AUTENTICACION',
      ROLE_CHANGE: 'CAMBIO DE ROL',
      SYSTEM: 'SISTEMA',
      // Las acciones ya en español se mantienen igual
      CREAR: 'CREAR',
      ACTUALIZAR: 'ACTUALIZAR',
      ELIMINAR: 'ELIMINAR',
      RESTAURAR: 'RESTAURAR',
      AUTENTICACION: 'AUTENTICACION'
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