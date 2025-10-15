// features/auditoria/components/AuditFilters.jsx
import React, { useState, useEffect } from 'react';
import { Filter, RefreshCw, Search, X, FileText } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card';

const AuditFilters = ({ 
  onFiltersChange, 
  onRefresh, 
  onExportPDF,
  isLoading = false,
  totalRecords = 0 
}) => {
  const [filters, setFilters] = useState({
    page: 1,
    limit: 50,
    userEmail: '',
    action: 'all',
    startDate: '',
    endDate: ''
  });
  const [isExpanded, setIsExpanded] = useState(false);

  // Opciones de acciones disponibles (según endpoints del backend)
  const actionOptions = [
    { value: 'all', label: 'Todas las acciones' },
    { value: 'CREATE', label: 'Crear' },
    { value: 'UPDATE', label: 'Actualizar' },
    { value: 'DELETE', label: 'Eliminar' },
    { value: 'AUTH', label: 'Autenticación' },
    { value: 'RESTORE', label: 'Restaurar' },
    { value: 'ROLE_CHANGE', label: 'Cambio de rol' }
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
      // Preparar filtros según la API del backend
      const filtersToSend = {
        page: filters.page || 1,
        limit: filters.limit || 50
      };
      
      // Filtros según endpoints disponibles del backend
      
      // Filtro por email: GET /audit/logs?userEmail=martin@gmail.com  
      if (filters.userEmail && filters.userEmail.trim() !== '') {
        filtersToSend.userEmail = filters.userEmail.trim();
      }
      
      // Filtro por acción: GET /audit/logs?action=CREATE
      if (filters.action && filters.action !== 'all') {
        filtersToSend.action = filters.action;
      }
      
      // Filtros de fecha: GET /audit/logs?userName=Cristian&startDate=2025-10-15&action=CREATE
      if (filters.startDate) {
        filtersToSend.startDate = filters.startDate;
      }
      if (filters.endDate) {
        filtersToSend.endDate = filters.endDate;
      }
      

      
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

  const clearFilters = () => {
    const clearedFilters = {
      page: 1,
      limit: 50,
      userEmail: '',
      action: 'all',
      startDate: '',
      endDate: ''
    };
    setFilters(clearedFilters);
  };

  const hasActiveFilters = Object.entries(filters).some(([key, value]) => {
    if (key === 'page' || key === 'limit') return false;
    if (key === 'action') return value !== 'all';
    return value !== '' && value !== null && value !== undefined;
  });

  const hasEmailFilter = filters.userEmail && filters.userEmail.trim() !== '';
  const hasActionFilter = filters.action && filters.action !== 'all';
  const hasDateFilter = (filters.startDate && filters.startDate !== '') || (filters.endDate && filters.endDate !== '');

  return (
    <Card className="mb-6">
      <CardHeader>
        <div className="flex items-center justify-between">
          <CardTitle className="flex items-center gap-2">
            <Filter className="h-5 w-5" />
            Filtros de Auditoría
            {hasActionFilter && (
              <span className="text-xs bg-purple-100 text-purple-800 px-2 py-1 rounded-full ml-2">
                ⚡ Acción: {filters.action}
              </span>
            )}
            {hasEmailFilter && (
              <span className="text-xs bg-green-100 text-green-800 px-2 py-1 rounded-full ml-2">
                📧 Email: {filters.userEmail}
              </span>
            )}
            {hasDateFilter && (
              <span className="text-xs bg-red-100 text-red-800 px-2 py-1 rounded-full ml-2">
                📅 Fecha filtrada
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
              className="bg-red-500 hover:bg-red-600 text-white"
              size="sm"
              onClick={onExportPDF}
              disabled={isLoading || totalRecords === 0}
              title={totalRecords === 0 ? 'No hay datos para exportar' : 'Exportar a PDF'}
            >
              <FileText className="h-4 w-4 mr-1" />
              Exportar PDF
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
          <div className="space-y-4">
            
            {/* Filtro principal por acción */}
            <div className="grid grid-cols-1 md:grid-cols-1 gap-4">
              <div>
                <label className="text-sm font-medium mb-2 block">
                  Tipo de acción
                  <span className="text-xs text-gray-500 ml-1">(CREATE, UPDATE, DELETE, etc.)</span>
                </label>
                <Select
                  value={filters.action || 'all'}
                  onValueChange={(value) => handleFilterChange('action', value)}
                >
                  <SelectTrigger className="w-full">
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

            {/* Búsqueda de usuario por email */}
            <div className="grid grid-cols-1 md:grid-cols-1 gap-4">
              <div>
                <label className="text-sm font-medium mb-2 block">
                  Email del usuario
                  <span className="text-xs text-gray-500 ml-1">(ej: martin@gmail.com)</span>
                </label>
                <Input
                  placeholder="Buscar por email específico"
                  type="email"
                  value={filters.userEmail || ''}
                  onChange={(e) => handleFilterChange('userEmail', e.target.value)}
                  className="w-full"
                />
              </div>
            </div>

            {/* Filtros de fecha */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div>
                <label className="text-sm font-medium mb-2 block">
                  Fecha desde
                  <span className="text-xs text-gray-500 ml-1">(incluir desde esta fecha)</span>
                </label>
                <Input
                  type="date"
                  value={filters.startDate || ''}
                  onChange={(e) => handleFilterChange('startDate', e.target.value)}
                  className="w-full"
                />
              </div>
              <div>
                <label className="text-sm font-medium mb-2 block">
                  Fecha hasta
                  <span className="text-xs text-gray-500 ml-1">(incluir hasta esta fecha)</span>
                </label>
                <Input
                  type="date"
                  value={filters.endDate || ''}
                  onChange={(e) => handleFilterChange('endDate', e.target.value)}
                  className="w-full"
                />
              </div>
              <div className="flex items-end">
                <Select
                  value={(filters.limit || 50).toString()}
                  onValueChange={(value) => handleFilterChange('limit', parseInt(value))}
                >
                  <SelectTrigger className="w-full">
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

            {hasActiveFilters && (
              <div className="flex justify-end">
                <Button
                  variant="outline"
                  size="sm"
                  onClick={clearFilters}
                  className="flex items-center gap-1"
                >
                  <X className="h-4 w-4" />
                  Limpiar todos los filtros
                </Button>
              </div>
            )}
          </div>
        </CardContent>
      )}
    </Card>
  );
};

export default AuditFilters;