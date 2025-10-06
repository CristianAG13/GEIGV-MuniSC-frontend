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
import auditService from '@/services/auditService';

/**
 * Función para formatear timestamp a hora de Costa Rica
 */
const formatCostaRicaTime = (timestamp) => {
  if (!timestamp) return 'N/A';
  
  try {
    // Si el timestamp ya viene en hora de Costa Rica, usamos getUTC* para evitar conversión
    const date = new Date(timestamp);
    
    // Usar getUTC* para tratar la fecha como si fuera UTC (sin convertir)
    const day = String(date.getUTCDate()).padStart(2, '0');
    const month = String(date.getUTCMonth() + 1).padStart(2, '0');
    const year = date.getUTCFullYear();
    const hours = String(date.getUTCHours()).padStart(2, '0');
    const minutes = String(date.getUTCMinutes()).padStart(2, '0');
    const seconds = String(date.getUTCSeconds()).padStart(2, '0');
    
    const formatted = `${day}/${month}/${year}, ${hours}:${minutes}:${seconds}`;
    
    console.log('🇨🇷 Formateando fecha:', {
      original: timestamp,
      dateObj: date.toString(),
      formatted: formatted
    });
    
    return formatted;
  } catch (error) {
    console.error('Error formateando fecha:', error);
    return timestamp;
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
      SYSTEM: Settings
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
      SYSTEM: 'bg-gray-100 text-gray-800 border-gray-200'
    };
    return colors[action] || 'bg-gray-100 text-gray-800 border-gray-200';
  };

  // Función para formatear fecha (REEMPLAZADA por formatCostaRicaTime)
  const formatDate = (dateString) => {
    const formattedTime = formatCostaRicaTime(dateString);
    if (formattedTime === 'N/A') return { date: 'N/A', time: 'N/A' };
    
    // Separar fecha y hora del formato "DD/MM/YYYY, HH:MM:SS"
    const [datePart, timePart] = formattedTime.split(', ');
    return {
      date: datePart || 'N/A',
      time: timePart || 'N/A'
    };
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
    <div style={{ 
      border: '5px solid red', 
      padding: '20px', 
      backgroundColor: '#fff3cd',
      margin: '20px'
    }}>
      <h2 style={{ 
        color: 'red', 
        fontSize: '24px', 
        fontWeight: 'bold',
        textAlign: 'center',
        marginBottom: '20px'
      }}>
        🚨 DEBUG: TABLA DE AUDITORÍA - {logs.length} REGISTROS 🚨
      </h2>

      {logs.length === 0 && (
        <div style={{
          backgroundColor: '#fef3c7',
          border: '2px solid #f59e0b',
          padding: '15px',
          marginBottom: '20px',
          borderRadius: '8px'
        }}>
          <h3 style={{ color: '#92400e', fontSize: '18px', fontWeight: 'bold' }}>
            ⚠️ No hay datos - Posible problema de filtros
          </h3>
          <p style={{ color: '#92400e', margin: '10px 0' }}>
            Los datos se están cargando pero los filtros los están ocultando. 
            <br />
            <strong>Ve a la parte superior y haz clic en "Limpiar filtros"</strong>
          </p>
        </div>
      )}

      {/* Tabla HTML básica sin componentes UI */}
      <table style={{
        width: '100%',
        border: '2px solid black',
        borderCollapse: 'collapse',
        backgroundColor: 'white'
      }}>
        <thead style={{ backgroundColor: '#e3f2fd' }}>
          <tr>
            <th style={{ border: '1px solid black', padding: '10px' }}>
              Fecha 🇨🇷 (Hora Costa Rica)
            </th>
            <th style={{ border: '1px solid black', padding: '10px' }}>Acción</th>
            <th style={{ border: '1px solid black', padding: '10px' }}>Usuario</th>
            <th style={{ border: '1px solid black', padding: '10px' }}>Nombre y Apellido</th>
            <th style={{ border: '1px solid black', padding: '10px' }}>Descripción</th>
          </tr>
        </thead>
        <tbody>
          {logs.map((log, index) => {
            const datetime = formatDate(log.timestamp || log.createdAt);
            
            return (
              <tr 
                key={log.id || log._id}
                style={{
                  backgroundColor: index % 2 === 0 ? '#f5f5f5' : 'white',
                  border: '1px solid black'
                }}
              >
                <td style={{ border: '1px solid black', padding: '8px' }}>
                  {datetime.date} {datetime.time}
                </td>
                <td style={{ border: '1px solid black', padding: '8px', fontWeight: 'bold', color: 'blue' }}>
                  {log.action}
                </td>
                <td style={{ border: '1px solid black', padding: '8px' }}>
                  {log.userEmail || 'No email'}
                </td>
                <td style={{ border: '1px solid black', padding: '8px', fontWeight: 'bold', color: '#059669' }}>
                  {(() => {
                    if (log.name && log.lastname) {
                      return `${log.name} ${log.lastname}`;
                    } else if (log.userFullName) {
                      return log.userFullName;
                    } else if (log.fullName) {
                      return log.fullName;
                    } else if (log.userName) {
                      return log.userName;
                    } else {
                      // Log solo cuando no hay nombre disponible
                      console.warn('⚠️ Log sin nombre:', {
                        id: log.id,
                        availableFields: Object.keys(log).filter(key => key.includes('name') || key.includes('Name'))
                      });
                      return 'Sin nombre';
                    }
                  })()}
                </td>
                <td style={{ border: '1px solid black', padding: '8px' }}>
                  {log.description || 'Sin descripción'}
                </td>
              </tr>
            );
          })}
        </tbody>
      </table>
      
      <div style={{ marginTop: '20px', textAlign: 'center' }}>
        <p style={{ fontSize: '16px', fontWeight: 'bold' }}>
          Total de registros: {logs.length}
        </p>
      </div>
    </div>
  );
};

export default AuditTable;