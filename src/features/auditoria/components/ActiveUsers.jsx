// features/auditoria/components/ActiveUsers.jsx
import React from 'react';
import { Users, Clock, LogIn, Activity } from 'lucide-react';
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';

const ActiveUsers = ({ logs = [], isLoading = false }) => {
  // Filtrar solo eventos de autenticación (login)
  const loginEvents = logs.filter(log => 
    log.action === 'AUTH' && 
    (log.description?.toLowerCase().includes('inició sesión') || 
     log.description?.toLowerCase().includes('login') ||
     log.description?.toLowerCase().includes('login_success'))
  );

  // Obtener usuarios únicos con su último login
  const uniqueUsers = loginEvents.reduce((acc, log) => {
    const userId = log.userId;
    if (!acc[userId] || new Date(log.timestamp) > new Date(acc[userId].timestamp)) {
      acc[userId] = log;
    }
    return acc;
  }, {});

  const activeUsersList = Object.values(uniqueUsers)
    .sort((a, b) => new Date(b.timestamp) - new Date(a.timestamp))
    .slice(0, 10); // Mostrar los últimos 10 usuarios

  // Función para obtener el nombre del usuario desde diferentes fuentes
  const getUserName = (log) => {
    if (log.userName) return log.userName;
    if (log.user) {
      const name = log.user.name || '';
      const lastname = log.user.lastname || '';
      return `${name} ${lastname}`.trim();
    }
    if (log.userEmail) return log.userEmail;
    return 'Usuario Desconocido';
  };

  // Calcular tiempo desde el último login
  const getTimeAgo = (timestamp) => {
    const now = new Date();
    const loginTime = new Date(timestamp);
    const diffMs = now - loginTime;
    const diffMins = Math.floor(diffMs / 60000);
    const diffHours = Math.floor(diffMs / 3600000);
    const diffDays = Math.floor(diffMs / 86400000);

    if (diffMins < 1) return 'Justo ahora';
    if (diffMins < 60) return `Hace ${diffMins} min`;
    if (diffHours < 24) return `Hace ${diffHours} h`;
    return `Hace ${diffDays} días`;
  };

  // Determinar si el usuario está "activo" (login en las últimas 24 horas)
  const isRecentlyActive = (timestamp) => {
    const now = new Date();
    const loginTime = new Date(timestamp);
    const diffHours = (now - loginTime) / 3600000;
    return diffHours < 24;
  };

  if (isLoading) {
    return (
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Users className="h-5 w-5" />
            Usuarios Conectados
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex items-center justify-center py-8">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card>
      <CardHeader>
        <div className="flex items-center justify-between">
          <CardTitle className="flex items-center gap-2">
            <Users className="h-5 w-5" />
            Usuarios Conectados
          </CardTitle>
          <Badge variant="secondary" className="flex items-center gap-1">
            <Activity className="h-3 w-3" />
            {activeUsersList.filter(u => isRecentlyActive(u.timestamp)).length} activos
          </Badge>
        </div>
      </CardHeader>
      <CardContent>
        {activeUsersList.length === 0 ? (
          <div className="text-center py-8 text-gray-500">
            <Users className="h-12 w-12 mx-auto mb-2 opacity-50" />
            <p>No hay registros de conexiones recientes</p>
          </div>
        ) : (
          <div className="space-y-3">
            {activeUsersList.map((log, index) => {
              const isActive = isRecentlyActive(log.timestamp);
              
              return (
                <div 
                  key={`${log.userId}-${index}`}
                  className="flex items-center gap-3 p-3 rounded-lg hover:bg-gray-50 transition-colors border border-gray-100"
                >
                  {/* Avatar con indicador de estado */}
                  <div className="relative">
                    <div className="w-10 h-10 rounded-full bg-gradient-to-br from-blue-500 to-purple-500 flex items-center justify-center text-white font-semibold">
                      {getUserName(log).charAt(0).toUpperCase()}
                    </div>
                    {isActive && (
                      <div className="absolute bottom-0 right-0 w-3 h-3 bg-green-500 rounded-full border-2 border-white"></div>
                    )}
                  </div>

                  {/* Información del usuario */}
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2">
                      <p className="font-medium text-gray-900 truncate">
                        {getUserName(log)}
                      </p>
                      {isActive && (
                        <Badge variant="success" className="text-xs bg-green-100 text-green-700">
                          Activo
                        </Badge>
                      )}
                    </div>
                    <div className="flex items-center gap-2 text-sm text-gray-500 mt-1">
                      <Clock className="h-3 w-3" />
                      <span>{getTimeAgo(log.timestamp)}</span>
                    </div>
                  </div>

                  {/* Ícono de login */}
                  <div className={`p-2 rounded-full ${isActive ? 'bg-green-100' : 'bg-gray-100'}`}>
                    <LogIn className={`h-4 w-4 ${isActive ? 'text-green-600' : 'text-gray-400'}`} />
                  </div>
                </div>
              );
            })}
          </div>
        )}

        {/* Resumen estadístico */}
        {activeUsersList.length > 0 && (
          <div className="mt-4 pt-4 border-t border-gray-200">
            <div className="grid grid-cols-3 gap-4 text-center">
              <div>
                <div className="text-2xl font-bold text-blue-600">
                  {activeUsersList.filter(u => isRecentlyActive(u.timestamp)).length}
                </div>
                <div className="text-xs text-gray-500">Últimas 24h</div>
              </div>
              <div>
                <div className="text-2xl font-bold text-purple-600">
                  {activeUsersList.length}
                </div>
                <div className="text-xs text-gray-500">Total recientes</div>
              </div>
              <div>
                <div className="text-2xl font-bold text-green-600">
                  {loginEvents.length}
                </div>
                <div className="text-xs text-gray-500">Conexiones totales</div>
              </div>
            </div>
          </div>
        )}
      </CardContent>
    </Card>
  );
};

export default ActiveUsers;
