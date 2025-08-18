// import React, { createContext, useContext, useState, useEffect } from 'react';

// export interface Machinery {
//   id: string;
//   name: string;
//   type: string;
//   plate: string;
//   status: 'disponible' | 'en_uso' | 'mantenimiento' | 'fuera_servicio';
//   hoursWorked: number;
//   lastMaintenance: string;
//   currentDriver?: string;
//   currentRoute?: string;
// }

// export interface FieldReport {
//   id: string;
//   driverId: string;
//   driverName: string;
//   machineryId: string;
//   machineryName: string;
//   route: string;
//   workType: string;
//   startTime: string;
//   endTime?: string;
//   materialsUsed: Array<{ name: string; quantity: number; unit: string }>;
//   observations: string;
//   status: 'pendiente' | 'aprobado' | 'rechazado';
//   images?: string[];
//   location: { lat: number; lng: number };
//   reviewedBy?: string;
//   reviewDate?: string;
//   reviewComments?: string;
// }

// export interface AuditLog {
//   id: string;
//   userId: string;
//   userName: string;
//   action: string;
//   resourceType: string;
//   resourceId: string;
//   timestamp: string;
//   details: string;
//   beforeData?: any;
//   afterData?: any;
// }

// interface DataContextType {
//   machinery: Machinery[];
//   fieldReports: FieldReport[];
//   auditLogs: AuditLog[];
//   addFieldReport: (report: Omit<FieldReport, 'id'>) => void;
//   updateFieldReport: (id: string, updates: Partial<FieldReport>) => void;
//   updateMachinery: (id: string, updates: Partial<Machinery>) => void;
//   addAuditLog: (log: Omit<AuditLog, 'id' | 'timestamp'>) => void;
// }

// const DataContext = createContext<DataContextType | undefined>(undefined);

// // Mock data
// const mockMachinery: Machinery[] = [
//   {
//     id: '1',
//     name: 'Retroexcavadora CAT 320',
//     type: 'Retroexcavadora',
//     plate: 'M-001-SC',
//     status: 'en_uso',
//     hoursWorked: 1247,
//     lastMaintenance: '2024-01-15',
//     currentDriver: 'Juan Pérez',
//     currentRoute: 'Ruta Nacional 21'
//   },
//   {
//     id: '2',
//     name: 'Motoniveladora Komatsu GD555',
//     type: 'Motoniveladora',
//     plate: 'M-002-SC',
//     status: 'disponible',
//     hoursWorked: 892,
//     lastMaintenance: '2024-01-10'
//   },
//   {
//     id: '3',
//     name: 'Compactadora Hamm HD12',
//     type: 'Compactadora',
//     plate: 'M-003-SC',
//     status: 'mantenimiento',
//     hoursWorked: 1534,
//     lastMaintenance: '2024-01-05'
//   }
// ];

// const mockFieldReports: FieldReport[] = [
//   {
//     id: '1',
//     driverId: '1',
//     driverName: 'Juan Pérez',
//     machineryId: '1',
//     machineryName: 'Retroexcavadora CAT 320',
//     route: 'Ruta Nacional 21, km 15-20',
//     workType: 'Reparación de baches',
//     startTime: '2024-01-20T07:00:00',
//     endTime: '2024-01-20T11:30:00',
//     materialsUsed: [
//       { name: 'Mezcla asfáltica', quantity: 2.5, unit: 'toneladas' },
//       { name: 'Sellador', quantity: 15, unit: 'litros' }
//     ],
//     observations: 'Reparados 12 baches en el tramo. Condiciones de tráfico normales.',
//     status: 'pendiente',
//     location: { lat: 10.2640, lng: -85.6087 }
//   },
//   {
//     id: '2',
//     driverId: '1',
//     driverName: 'Juan Pérez',
//     machineryId: '2',
//     machineryName: 'Motoniveladora Komatsu GD555',
//     route: 'Camino Rural Los Ángeles',
//     workType: 'Nivelación de vía',
//     startTime: '2024-01-19T06:30:00',
//     endTime: '2024-01-19T10:00:00',
//     materialsUsed: [
//       { name: 'Lastre', quantity: 5, unit: 'metros cúbicos' }
//     ],
//     observations: 'Nivelación completa de 3 km. Vía en buen estado después del trabajo.',
//     status: 'aprobado',
//     location: { lat: 10.2701, lng: -85.6234 },
//     reviewedBy: 'María Rodríguez',
//     reviewDate: '2024-01-19T14:30:00',
//     reviewComments: 'Trabajo realizado correctamente según estándares.'
//   }
// ];

// export const DataProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
//   const [machinery, setMachinery] = useState<Machinery[]>(mockMachinery);
//   const [fieldReports, setFieldReports] = useState<FieldReport[]>(mockFieldReports);
//   const [auditLogs, setAuditLogs] = useState<AuditLog[]>([]);

//   const addFieldReport = (report: Omit<FieldReport, 'id'>) => {
//     const newReport = {
//       ...report,
//       id: Date.now().toString()
//     };
//     setFieldReports(prev => [newReport, ...prev]);
//   };

//   const updateFieldReport = (id: string, updates: Partial<FieldReport>) => {
//     setFieldReports(prev => 
//       prev.map(report => 
//         report.id === id ? { ...report, ...updates } : report
//       )
//     );
//   };

//   const updateMachinery = (id: string, updates: Partial<Machinery>) => {
//     setMachinery(prev => 
//       prev.map(machine => 
//         machine.id === id ? { ...machine, ...updates } : machine
//       )
//     );
//   };

//   const addAuditLog = (log: Omit<AuditLog, 'id' | 'timestamp'>) => {
//     const newLog = {
//       ...log,
//       id: Date.now().toString(),
//       timestamp: new Date().toISOString()
//     };
//     setAuditLogs(prev => [newLog, ...prev]);
//   };

//   return (
//     <DataContext.Provider value={{
//       machinery,
//       fieldReports,
//       auditLogs,
//       addFieldReport,
//       updateFieldReport,
//       updateMachinery,
//       addAuditLog
//     }}>
//       {children}
//     </DataContext.Provider>
//   );
// };

// export const useData = () => {
//   const context = useContext(DataContext);
//   if (context === undefined) {
//     throw new Error('useData must be used within a DataProvider');
//   }
//   return context;
// };

import React, { createContext, useContext, useState, useEffect } from 'react';
import { machineryService, Machinery as APIMachinery } from '../services/machineryService';
import { fieldReportsService, FieldReport as APIFieldReport } from '../services/fieldReportsService';
import { auditService, AuditLog as APIAuditLog } from '../services/auditService';

// Mantener interfaces locales para compatibilidad
export interface Machinery extends Omit<APIMachinery, 'createdAt' | 'updatedAt'> {
  // Campos adicionales para compatibilidad con el frontend existente
}

export interface FieldReport {
  id: string;
  driverName: string;
  machineryName: string;
  route: string;
  workType: string;
  startTime: string;
  endTime?: string;
  materialsUsed: Array<{ name: string; quantity: number; unit: string }>;
  observations: string;
  status: 'pendiente' | 'aprobado' | 'rechazado';
  images?: string[];
  location: { lat: number; lng: number };
  driverId: string;
  machineryId: string;
  reviewedBy?: string;
  reviewDate?: string;
  reviewComments?: string;
}

export interface AuditLog extends Omit<APIAuditLog, 'user'> {
  userName: string;
}

interface DataContextType {
  machinery: Machinery[];
  fieldReports: FieldReport[];
  auditLogs: AuditLog[];
  addFieldReport: (report: Omit<FieldReport, 'id'>) => void;
  updateFieldReport: (id: string, updates: Partial<FieldReport>) => void;
  updateMachinery: (id: string, updates: Partial<Machinery>) => void;
  addAuditLog: (log: Omit<AuditLog, 'id' | 'timestamp'>) => void;
  loading: boolean;
}

const DataContext = createContext<DataContextType | undefined>(undefined);

export const DataProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [machinery, setMachinery] = useState<Machinery[]>([]);
  const [fieldReports, setFieldReports] = useState<FieldReport[]>([]);
  const [auditLogs, setAuditLogs] = useState<AuditLog[]>([]);
  const [loading, setLoading] = useState(true);

  
// Cargar datos iniciales
useEffect(() => {
  const token = localStorage.getItem('token');
  if (!token) {
    setLoading(false);
    return;
  }

  const t = setTimeout(() => {
    loadInitialData();
  }, 0);

  return () => clearTimeout(t);
}, []);


  const loadInitialData = async () => {
    try {
      setLoading(true);
      
      // Cargar maquinaria
      const machineryData = await machineryService.getAll();
      setMachinery(machineryData);

      // Cargar reportes de campo
      const reportsData = await fieldReportsService.getAll();
      const formattedReports = reportsData.map(report => ({
        ...report,
        driverName: report.driver?.name ?? 'N/A',
        machineryName: report.machinery?.name ?? 'N/A',
        materialsUsed: report.materialsUsed ?? [],
        location: {
          lat: report.locationLat || 0,
          lng: report.locationLng || 0
        }
      }));
      setFieldReports(formattedReports);

      // Cargar logs de auditoría
      const auditData = await auditService.getAll();
      const formattedAudit = auditData.map(log => ({
        ...log,
        userName: log.user?.name || 'N/A'
      }));
      setAuditLogs(formattedAudit);

    } catch (error) {
      console.error('Error cargando datos iniciales:', error);
    } finally {
      setLoading(false);
    }
  };

  const addFieldReport = (report: Omit<FieldReport, 'id'>) => {
    // Implementar con API
    fieldReportsService.create({
      route: report.route,
      workType: report.workType,
      startTime: report.startTime,
      endTime: report.endTime,
      materialsUsed: report.materialsUsed,
      observations: report.observations,
      locationLat: report.location.lat,
      locationLng: report.location.lng,
      driverId: report.driverId,
      machineryId: report.machineryId
    }).then(() => {
      loadInitialData(); // Recargar datos
    }).catch(error => {
      console.error('Error creando reporte:', error);
    });
  };

 const updateFieldReport = async (id: string, updates: Partial<FieldReport>) => {
  try {
    // Tipo local que amplía lo que acepta el servicio
    type UpdateFieldReportRequest =
      Partial<Parameters<typeof fieldReportsService.update>[1]> & {
        status?: FieldReport['status'];      // 'pendiente' | 'aprobado' | 'rechazado'
        reviewedBy?: string;
        reviewDate?: string;
        reviewComments?: string;
      };

    const payload: UpdateFieldReportRequest = {
      route: updates.route,
      workType: updates.workType,
      startTime: updates.startTime,
      endTime: updates.endTime,
      materialsUsed: updates.materialsUsed,
      observations: updates.observations,
      status: updates.status,
      reviewedBy: updates.reviewedBy,
      reviewDate: updates.reviewDate,
      reviewComments: updates.reviewComments,
    };

    await fieldReportsService.update(id, payload);

    // Mantén esta parte tal cual (actualiza el estado local)
    setFieldReports(prev =>
      prev.map(report => (report.id === id ? { ...report, ...updates } : report))
    );
  } catch (error) {
    console.error('Error actualizando reporte:', error);
  }
};

  const updateMachinery = async (id: string, updates: Partial<Machinery>) => {
    try {
      await machineryService.update(id, updates);
      
      // Actualizar estado local
      setMachinery(prev => 
        prev.map(machine => 
          machine.id === id ? { ...machine, ...updates } : machine
        )
      );
    } catch (error) {
      console.error('Error actualizando maquinaria:', error);
    }
  };

  const addAuditLog = (log: Omit<AuditLog, 'id' | 'timestamp'>) => {
    const newLog = {
      ...log,
      id: Date.now().toString(),
      timestamp: new Date().toISOString()
    };
    setAuditLogs(prev => [newLog, ...prev]);
  };

  return (
    <DataContext.Provider value={{
      machinery,
      fieldReports,
      auditLogs,
      loading,
      addFieldReport,
      updateFieldReport,
      updateMachinery,
      addAuditLog
    }}>
      {children}
    </DataContext.Provider>
  );
};

export const useData = () => {
  const context = useContext(DataContext);
  if (context === undefined) {
    throw new Error('useData must be used within a DataProvider');
  }
  return context;
};