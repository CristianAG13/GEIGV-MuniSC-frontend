import React, { useState } from 'react';
import { useAuth } from '../contexts/AuthContext';
import {
  Users,
  Plus,
  Search,
  Phone,
  Mail,
  MapPin,
  Calendar,
  Clock,
  Star,
  Shield,
  UserCheck
} from 'lucide-react';

interface PersonnelMember {
  id: string;
  name: string;
  position: string;
  department: string;
  email: string;
  phone: string;
  status: 'active' | 'inactive' | 'vacation' | 'sick_leave';
  hireDate: string;
  experience: string;
  certifications: string[];
  currentAssignment?: string;
  rating: number;
}

const mockPersonnel: PersonnelMember[] = [
  {
    id: '1',
    name: 'Juan Carlos Pérez',
    position: 'Operador de Maquinaria',
    department: 'Gestión Vial',
    email: 'juan.perez@santacruz.go.cr',
    phone: '+506 2680-1234',
    status: 'active',
    hireDate: '2020-03-15',
    experience: '8 años',
    certifications: ['Operación de Retroexcavadora', 'Seguridad Vial', 'Primeros Auxilios'],
    currentAssignment: 'Ruta Nacional 21',
    rating: 4.8
  },
  {
    id: '2',
    name: 'María Elena Rodríguez',
    position: 'Supervisora de Campo',
    department: 'Gestión Vial',
    email: 'maria.rodriguez@santacruz.go.cr',
    phone: '+506 2680-1235',
    status: 'active',
    hireDate: '2018-07-20',
    experience: '12 años',
    certifications: ['Supervisión de Obras', 'Control de Calidad', 'Gestión de Proyectos'],
    currentAssignment: 'Zona Norte',
    rating: 4.9
  },
  {
    id: '3',
    name: 'Roberto Jiménez',
    position: 'Técnico en Mantenimiento',
    department: 'Gestión Vial',
    email: 'roberto.jimenez@santacruz.go.cr',
    phone: '+506 2680-1236',
    status: 'vacation',
    hireDate: '2019-11-10',
    experience: '6 años',
    certifications: ['Mantenimiento de Maquinaria', 'Mecánica Diesel'],
    rating: 4.6
  },
  {
    id: '4',
    name: 'Ana Patricia González',
    position: 'Analista de Datos',
    department: 'Gestión Vial',
    email: 'ana.gonzalez@santacruz.go.cr',
    phone: '+506 2680-1237',
    status: 'active',
    hireDate: '2021-01-08',
    experience: '4 años',
    certifications: ['Análisis de Datos', 'GIS', 'Excel Avanzado'],
    currentAssignment: 'Oficina Central',
    rating: 4.7
  }
];

const Personnel: React.FC = () => {
  const { user } = useAuth();
  const [personnel] = useState<PersonnelMember[]>(mockPersonnel);
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState('all');
  const [selectedPerson, setSelectedPerson] = useState<PersonnelMember | null>(null);

  const filteredPersonnel = personnel.filter(person => {
    const matchesSearch = person.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         person.position.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesStatus = statusFilter === 'all' || person.status === statusFilter;
    return matchesSearch && matchesStatus;
  });

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'active':
        return 'bg-green-100 text-green-800';
      case 'inactive':
        return 'bg-gray-100 text-gray-800';
      case 'vacation':
        return 'bg-blue-100 text-blue-800';
      case 'sick_leave':
        return 'bg-yellow-100 text-yellow-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };

  const getStatusText = (status: string) => {
    switch (status) {
      case 'active':
        return 'Activo';
      case 'inactive':
        return 'Inactivo';
      case 'vacation':
        return 'Vacaciones';
      case 'sick_leave':
        return 'Incapacidad';
      default:
        return status;
    }
  };

  const getRatingStars = (rating: number) => {
    return Array.from({ length: 5 }, (_, i) => (
      <Star
        key={i}
        className={`w-4 h-4 ${
          i < Math.floor(rating) ? 'text-yellow-400 fill-current' : 'text-gray-300'
        }`}
      />
    ));
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Gestión de Personal</h1>
          <p className="text-gray-600 mt-1">Control y seguimiento del personal del departamento vial</p>
        </div>
        {(user?.role === 'supervisor' || user?.role === 'administrador') && (
          <button className="mt-4 sm:mt-0 inline-flex items-center space-x-2 bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 transition-colors">
            <Plus className="w-4 h-4" />
            <span>Agregar Personal</span>
          </button>
        )}
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
        <div className="bg-white rounded-lg shadow-sm p-6 border-l-4 border-green-500">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-600">Personal Activo</p>
              <p className="text-2xl font-bold text-gray-900 mt-1">
                {personnel.filter(p => p.status === 'active').length}
              </p>
            </div>
            <UserCheck className="w-8 h-8 text-green-500" />
          </div>
        </div>
        <div className="bg-white rounded-lg shadow-sm p-6 border-l-4 border-blue-500">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-600">En Vacaciones</p>
              <p className="text-2xl font-bold text-gray-900 mt-1">
                {personnel.filter(p => p.status === 'vacation').length}
              </p>
            </div>
            <Calendar className="w-8 h-8 text-blue-500" />
          </div>
        </div>
        <div className="bg-white rounded-lg shadow-sm p-6 border-l-4 border-yellow-500">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-600">Incapacidades</p>
              <p className="text-2xl font-bold text-gray-900 mt-1">
                {personnel.filter(p => p.status === 'sick_leave').length}
              </p>
            </div>
            <Shield className="w-8 h-8 text-yellow-500" />
          </div>
        </div>
        <div className="bg-white rounded-lg shadow-sm p-6 border-l-4 border-purple-500">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-600">Total Personal</p>
              <p className="text-2xl font-bold text-gray-900 mt-1">{personnel.length}</p>
            </div>
            <Users className="w-8 h-8 text-purple-500" />
          </div>
        </div>
      </div>

      {/* Filters */}
      <div className="bg-white rounded-lg shadow-sm p-6">
        <div className="flex flex-col sm:flex-row space-y-4 sm:space-y-0 sm:space-x-4">
          <div className="flex-1">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-gray-400" />
              <input
                type="text"
                placeholder="Buscar personal..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              />
            </div>
          </div>
          <div className="sm:w-48">
            <select
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            >
              <option value="all">Todos los estados</option>
              <option value="active">Activo</option>
              <option value="vacation">Vacaciones</option>
              <option value="sick_leave">Incapacidad</option>
              <option value="inactive">Inactivo</option>
            </select>
          </div>
        </div>
      </div>

      {/* Personnel Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {filteredPersonnel.map((person) => (
          <div key={person.id} className="bg-white rounded-lg shadow-sm border hover:shadow-md transition-shadow">
            <div className="p-6">
              <div className="flex items-start justify-between mb-4">
                <div className="flex items-center space-x-3">
                  <div className="w-12 h-12 bg-blue-100 rounded-full flex items-center justify-center">
                    <span className="text-lg font-medium text-blue-600">
                      {person.name.split(' ').map(n => n.charAt(0)).slice(0, 2).join('')}
                    </span>
                  </div>
                  <div>
                    <h3 className="font-medium text-gray-900">{person.name}</h3>
                    <p className="text-sm text-gray-600">{person.position}</p>
                  </div>
                </div>
                <span className={`px-2 py-1 rounded-full text-xs font-medium ${getStatusColor(person.status)}`}>
                  {getStatusText(person.status)}
                </span>
              </div>

              <div className="space-y-3">
                <div className="flex items-center space-x-2 text-sm text-gray-600">
                  <Mail className="w-4 h-4" />
                  <span className="truncate">{person.email}</span>
                </div>
                <div className="flex items-center space-x-2 text-sm text-gray-600">
                  <Phone className="w-4 h-4" />
                  <span>{person.phone}</span>
                </div>
                <div className="flex items-center space-x-2 text-sm text-gray-600">
                  <Clock className="w-4 h-4" />
                  <span>Experiencia: {person.experience}</span>
                </div>
                {person.currentAssignment && (
                  <div className="flex items-center space-x-2 text-sm text-gray-600">
                    <MapPin className="w-4 h-4" />
                    <span className="truncate">{person.currentAssignment}</span>
                  </div>
                )}
                <div className="flex items-center space-x-2">
                  <span className="text-sm text-gray-600">Calificación:</span>
                  <div className="flex items-center space-x-1">
                    {getRatingStars(person.rating)}
                    <span className="text-sm text-gray-600 ml-1">{person.rating}</span>
                  </div>
                </div>
              </div>

              <div className="mt-4 pt-4 border-t">
                <button
                  onClick={() => setSelectedPerson(person)}
                  className="w-full text-center text-sm text-blue-600 hover:text-blue-800 font-medium"
                >
                  Ver Detalles
                </button>
              </div>
            </div>
          </div>
        ))}
      </div>

      {/* Person Detail Modal */}
      {selectedPerson && (
        <div className="fixed inset-0 bg-gray-600 bg-opacity-50 overflow-y-auto h-full w-full z-50">
          <div className="relative top-20 mx-auto p-5 border w-11/12 md:w-3/4 lg:w-1/2 shadow-lg rounded-md bg-white">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-lg font-medium text-gray-900">Información del Personal</h3>
              <button
                onClick={() => setSelectedPerson(null)}
                className="text-gray-400 hover:text-gray-600"
              >
                ✕
              </button>
            </div>
            <div className="space-y-6">
              <div className="flex items-center space-x-4">
                <div className="w-16 h-16 bg-blue-100 rounded-full flex items-center justify-center">
                  <span className="text-xl font-medium text-blue-600">
                    {selectedPerson.name.split(' ').map(n => n.charAt(0)).slice(0, 2).join('')}
                  </span>
                </div>
                <div>
                  <h4 className="text-xl font-semibold text-gray-900">{selectedPerson.name}</h4>
                  <p className="text-gray-600">{selectedPerson.position}</p>
                  <div className="flex items-center space-x-1 mt-1">
                    {getRatingStars(selectedPerson.rating)}
                    <span className="text-sm text-gray-600 ml-1">{selectedPerson.rating}</span>
                  </div>
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <h5 className="font-medium text-gray-900 mb-3">Información de Contacto</h5>
                  <div className="space-y-2">
                    <div className="flex items-center space-x-2 text-sm">
                      <Mail className="w-4 h-4 text-gray-400" />
                      <span>{selectedPerson.email}</span>
                    </div>
                    <div className="flex items-center space-x-2 text-sm">
                      <Phone className="w-4 h-4 text-gray-400" />
                      <span>{selectedPerson.phone}</span>
                    </div>
                  </div>
                </div>

                <div>
                  <h5 className="font-medium text-gray-900 mb-3">Información Laboral</h5>
                  <div className="space-y-2 text-sm">
                    <p><span className="font-medium">Departamento:</span> {selectedPerson.department}</p>
                    <p><span className="font-medium">Fecha de Ingreso:</span> {new Date(selectedPerson.hireDate).toLocaleDateString('es-CR')}</p>
                    <p><span className="font-medium">Experiencia:</span> {selectedPerson.experience}</p>
                    {selectedPerson.currentAssignment && (
                      <p><span className="font-medium">Asignación Actual:</span> {selectedPerson.currentAssignment}</p>
                    )}
                  </div>
                </div>
              </div>

              <div>
                <h5 className="font-medium text-gray-900 mb-3">Certificaciones</h5>
                <div className="flex flex-wrap gap-2">
                  {selectedPerson.certifications.map((cert, index) => (
                    <span
                      key={index}
                      className="inline-flex items-center px-3 py-1 rounded-full text-xs font-medium bg-blue-100 text-blue-800"
                    >
                      {cert}
                    </span>
                  ))}
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

      {filteredPersonnel.length === 0 && (
        <div className="text-center py-12">
          <Users className="w-12 h-12 text-gray-400 mx-auto mb-4" />
          <h3 className="text-lg font-medium text-gray-900 mb-2">No se encontró personal</h3>
          <p className="text-gray-600">
            {searchTerm || statusFilter !== 'all' 
              ? 'Intenta ajustar los filtros de búsqueda' 
              : 'No hay personal registrado en el sistema'
            }
          </p>
        </div>
      )}
    </div>
  );
};

export default Personnel;