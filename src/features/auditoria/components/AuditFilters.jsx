// features/auditoria/components/AuditFilters.jsx
import React, { useState, useEffect } from 'react';
import { Filter, RefreshCw, Search, X } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card';

const AuditFilters = ({ 
  onFiltersChange, 
  onRefresh, 
  isLoading = false,
  totalRecords = 0 
}) => {
  const [filters, setFilters] = useState({
    page: 1,
    limit: 50,
    entity: 'all',
    action: 'all',
    search: '',
    email: '',
    fullName: '',
    startDate: '',
    endDate: ''
  });
  const [isExpanded, setIsExpanded] = useState(false);

  // Opciones para los filtros
  const entityOptions = [
    { value: 'all', label: 'Todas las entidades' },
    { value: 'usuarios', label: 'Usuarios' },
    { value: 'transporte', label: 'Transporte' },
    { value: 'operadores', label: 'Operadores' },
    { value: 'reportes', label: 'Reportes' },
    { value: 'roles', label: 'Roles' },
    { value: 'solicitudes', label: 'Solicitudes' },
    { value: 'system', label: 'Sistema' },
    { value: 'authentication', label: 'Autenticación' }
  ];

  const actionOptions = [
    { value: 'all', label: 'Todas las acciones' },
    { value: 'CREATE', label: 'Crear' },
    { value: 'UPDATE', label: 'Actualizar' },
    { value: 'DELETE', label: 'Eliminar' },
    { value: 'RESTORE', label: 'Restaurar' },
    { value: 'AUTH', label: 'Autenticación' },
    { value: 'ROLE_CHANGE', label: 'Cambio de rol' },
    { value: 'SYSTEM', label: 'Sistema' }
  ];

  const limitOptions = [
    { value: 25, label: '25 registros' },
    { value: 50, label: '50 registros' },
    { value: 100, label: '100 registros' },
    { value: 250, label: '250 registros' }
  ];

  // Efecto para notificar cambios en los filtros
  useEffect(() => {
    const debounceTimer = setTimeout(() => {
      // Preparar filtros para enviar - siempre incluir paginación
      const filtersToSend = {
        page: filters.page || 1,
        limit: filters.limit || 50
      };
      
      // Solo agregar filtros que tengan valor significativo
      if (filters.entity && filters.entity !== 'all' && filters.entity.trim() !== '') {
        filtersToSend.entity = filters.entity.trim();
      }
      
      if (filters.action && filters.action !== 'all' && filters.action.trim() !== '') {
        filtersToSend.action = filters.action.trim();
      }
      
      if (filters.search && filters.search.trim() !== '') {
        filtersToSend.search = filters.search.trim();
      }
      
      if (filters.email && filters.email.trim() !== '') {
        filtersToSend.email = filters.email.trim();
      }
      
      if (filters.fullName && filters.fullName.trim() !== '') {
        filtersToSend.fullName = filters.fullName.trim();
        // También enviar como userName para compatibilidad con el backend
        filtersToSend.userName = filters.fullName.trim();
      }
      
      // Filtros de fecha - validar formato y que sean fechas válidas
      if (filters.startDate && filters.startDate.trim() !== '') {
        const startDate = new Date(filters.startDate + 'T00:00:00');
        if (!isNaN(startDate.getTime())) {
          // Enviar en formato ISO para el backend
          filtersToSend.startDate = startDate.toISOString();
          console.log('✅ Fecha inicio válida:', {
            original: filters.startDate,
            formatted: filtersToSend.startDate,
            readable: startDate.toLocaleString('es-CR')
          });
        } else {
          console.warn('❌ Fecha inicio inválida:', filters.startDate);
        }
      }
      
      if (filters.endDate && filters.endDate.trim() !== '') {
        const endDate = new Date(filters.endDate + 'T23:59:59');
        if (!isNaN(endDate.getTime())) {
          // Enviar en formato ISO para el backend
          filtersToSend.endDate = endDate.toISOString();
          console.log('✅ Fecha fin válida:', {
            original: filters.endDate,
            formatted: filtersToSend.endDate,
            readable: endDate.toLocaleString('es-CR')
          });
        } else {
          console.warn('❌ Fecha fin inválida:', filters.endDate);
        }
      }
      
      console.log('🔧 AuditFilters - Enviando filtros:', {
        original: filters,
        cleaned: filtersToSend,
        hasFullNameFilter: !!(filtersToSend.fullName || filtersToSend.userName),
        fullNameValue: filtersToSend.fullName,
        userNameValue: filtersToSend.userName,
        emailValue: filtersToSend.email,
        dateDetails: {
          startDate: filtersToSend.startDate,
          endDate: filtersToSend.endDate,
          startDateParsed: filtersToSend.startDate ? new Date(filtersToSend.startDate).toISOString() : null,
          endDateParsed: filtersToSend.endDate ? new Date(filtersToSend.endDate).toISOString() : null
        }
      });
      onFiltersChange(filtersToSend);
    }, 300);

    return () => clearTimeout(debounceTimer);
  }, [filters, onFiltersChange]);

  const handleFilterChange = (key, value) => {
    setFilters(prev => ({
      ...prev,
      [key]: value,
      page: 1 // Resetear página cuando cambian los filtros
    }));
  };

  const handleDateRangePreset = (preset) => {
    const now = new Date();
    let startDate = new Date();
    
    // Función helper para formatear fechas
    const formatDate = (date) => {
      const year = date.getFullYear();
      const month = String(date.getMonth() + 1).padStart(2, '0');
      const day = String(date.getDate()).padStart(2, '0');
      return `${year}-${month}-${day}`;
    };
    
    switch (preset) {
      case 'today':
        // Desde el inicio del día actual
        startDate = new Date(now.getFullYear(), now.getMonth(), now.getDate());
        break;
      case 'week':
        // Últimos 7 días
        startDate = new Date(now);
        startDate.setDate(now.getDate() - 7);
        break;
      case 'month':
        // Desde el primer día del mes actual
        startDate = new Date(now.getFullYear(), now.getMonth(), 1);
        break;
      case 'quarter':
        // Desde el primer día del trimestre actual
        const quarterStartMonth = Math.floor(now.getMonth() / 3) * 3;
        startDate = new Date(now.getFullYear(), quarterStartMonth, 1);
        break;
      case 'all':
        // Limpiar filtros de fecha para mostrar todos los datos
        console.log('🧹 Limpiando filtros de fecha - mostrando todos los datos');
        setFilters(prev => ({
          ...prev,
          startDate: '',
          endDate: '',
          page: 1
        }));
        return;
      default:
        return;
    }
    
    const startDateStr = formatDate(startDate);
    const endDateStr = formatDate(now);
    
    console.log('📅 Aplicando filtro de fecha:', {
      preset,
      startDate: startDateStr,
      endDate: endDateStr,
      startDateObj: startDate.toISOString(),
      endDateObj: now.toISOString()
    });
    
    setFilters(prev => ({
      ...prev,
      startDate: startDateStr,
      endDate: endDateStr,
      page: 1
    }));
  };



  const clearFilters = () => {
    console.log('🧹 Limpiando todos los filtros...');
    const clearedFilters = {
      page: 1,
      limit: 50,
      entity: 'all',
      action: 'all',
      search: '',
      email: '',
      fullName: '',
      startDate: '',
      endDate: ''
    };
    console.log('✨ Filtros restablecidos a:', clearedFilters);
    setFilters(clearedFilters);
  };

  const hasActiveFilters = Object.entries(filters).some(([key, value]) => {
    if (key === 'page' || key === 'limit') return false;
    if (key === 'entity' && value === 'all') return false;
    if (key === 'action' && value === 'all') return false;
    return value !== '' && value !== null && value !== undefined;
  });

  const hasDateFilters = (filters.startDate && filters.startDate !== '') || 
                        (filters.endDate && filters.endDate !== '');
  
  const hasNameFilter = filters.fullName && filters.fullName.trim() !== '';

  return (
    <Card className="mb-6">
      <CardHeader>
        <div className="flex items-center justify-between">
          <CardTitle className="flex items-center gap-2">
            <Filter className="h-5 w-5" />
            Filtros de Auditoría
            {hasDateFilters && (
              <span className="text-xs bg-blue-100 text-blue-800 px-2 py-1 rounded-full ml-2">
                📅 Filtros de fecha activos
              </span>
            )}
            {hasNameFilter && (
              <span className="text-xs bg-green-100 text-green-800 px-2 py-1 rounded-full ml-2">
                👤 Filtro por nombre: {filters.fullName}
              </span>
            )}
            {totalRecords > 0 && (
              <span className="text-sm font-normal text-gray-500">
                ({totalRecords} registros)
              </span>
            )}
          </CardTitle>
          <div className="flex items-center gap-2">
            <Button
              variant="outline"
              size="sm"
              onClick={() => setIsExpanded(!isExpanded)}
            >
              {isExpanded ? 'Ocultar' : 'Mostrar'} filtros
            </Button>
            <Button
              variant="outline"
              size="sm"
              onClick={onRefresh}
              disabled={isLoading}
            >
              <RefreshCw className={`h-4 w-4 ${isLoading ? 'animate-spin' : ''}`} />
            </Button>
          </div>
        </div>
      </CardHeader>

      {isExpanded && (
        <CardContent className="space-y-4">
          {/* Búsqueda general */}
          <div className="flex items-center gap-2">
            <div className="relative flex-1">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
              <Input
                placeholder="Buscar por usuario, nombre, descripción, entidad o acción..."
                value={filters.search || ''}
                onChange={(e) => handleFilterChange('search', e.target.value)}
                className="pl-10"
              />
            </div>
            {hasActiveFilters && (
              <Button
                variant="outline"
                size="sm"
                onClick={clearFilters}
                className="flex items-center gap-1"
              >
                <X className="h-4 w-4" />
                Limpiar
              </Button>
            )}
          </div>

          {/* Filtros principales */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="text-sm font-medium mb-2 block">Entidad</label>
              <Select
                value={filters.entity || 'all'}
                onValueChange={(value) => handleFilterChange('entity', value)}
              >
                <SelectTrigger>
                  <SelectValue placeholder="Seleccionar entidad" />
                </SelectTrigger>
                <SelectContent>
                  {entityOptions.map(option => (
                    <SelectItem key={option.value} value={option.value}>
                      {option.label}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div>
              <label className="text-sm font-medium mb-2 block">Acción</label>
              <Select
                value={filters.action || 'all'}
                onValueChange={(value) => handleFilterChange('action', value)}
              >
                <SelectTrigger>
                  <SelectValue placeholder="Seleccionar acción" />
                </SelectTrigger>
                <SelectContent>
                  {actionOptions.map(option => (
                    <SelectItem key={option.value} value={option.value}>
                      {option.label}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </div>

          {/* Filtros de fecha manuales */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 pt-4 border-t">
            <div>
              <label className="text-sm font-medium mb-2 block">Fecha desde</label>
              <Input
                type="date"
                value={filters.startDate || ''}
                onChange={(e) => handleFilterChange('startDate', e.target.value)}
                className="w-full"
              />
            </div>
            <div>
              <label className="text-sm font-medium mb-2 block">Fecha hasta</label>
              <Input
                type="date"
                value={filters.endDate || ''}
                onChange={(e) => handleFilterChange('endDate', e.target.value)}
                className="w-full"
              />
            </div>
          </div>

          {/* Presets de fecha y configuración */}
          <div className="flex flex-wrap items-center justify-between gap-4 pt-4 border-t">
            <div className="flex items-center gap-2">
              <span className="text-sm font-medium">Filtros rápidos:</span>
              <Button
                variant="outline"
                size="sm"
                onClick={() => handleDateRangePreset('today')}
              >
                Hoy
              </Button>
              <Button
                variant="outline"
                size="sm"
                onClick={() => handleDateRangePreset('week')}
              >
                Última semana
              </Button>
              <Button
                variant="outline"
                size="sm"
                onClick={() => handleDateRangePreset('month')}
              >
                Este mes
              </Button>
              <Button
                variant="outline"
                size="sm"
                onClick={() => handleDateRangePreset('quarter')}
              >
                Este trimestre
              </Button>
              <Button
                variant="outline"
                size="sm"
                onClick={() => handleDateRangePreset('all')}
                className="text-green-600 border-green-600 hover:bg-green-50"
              >
                Todos los datos
              </Button>
            </div>

            <div className="flex items-center gap-2">
              <span className="text-sm font-medium">Mostrar:</span>
              <Select
                value={(filters.limit || 50).toString()}
                onValueChange={(value) => handleFilterChange('limit', parseInt(value))}
              >
                <SelectTrigger className="w-32">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {limitOptions.map(option => (
                    <SelectItem key={option.value} value={option.value.toString()}>
                      {option.label}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </div>

          {/* Filtros avanzados */}
          <div className="border-t pt-4 space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="text-sm font-medium mb-2 block">Email</label>
                <Input
                  placeholder="Filtrar por email de usuario"
                  value={filters.email || ''}
                  onChange={(e) => handleFilterChange('email', e.target.value)}
                  className="w-full"
                />
              </div>
              <div>
                <label className="text-sm font-medium mb-2 block">
                  Nombre y Apellido
                  <span className="text-xs text-gray-500 ml-1">(busca en name y lastname)</span>
                </label>
                <Input
                  placeholder="Filtrar por nombre o apellido (ej: Juan, Pérez, Juan Pérez)"
                  value={filters.fullName || ''}
                  onChange={(e) => handleFilterChange('fullName', e.target.value)}
                  className="w-full"
                  maxLength="100"
                />
              </div>
            </div>
          </div>
        </CardContent>
      )}
    </Card>
  );
};

export default AuditFilters;