import React from 'react';
import { 
  showSuccess, 
  showError, 
  showWarning, 
  showInfo, 
  confirmDelete, 
  confirmAction,
  promptText,
  promptTextarea,
  showLoading,
  closeLoading,
  showToast,
  showProcessSuccess,
  confirmImportantAction,
  showValidationError
} from '../utils/sweetAlert';

/**
 * Componente de demostración para todas las funcionalidades de SweetAlert
 * Este componente muestra ejemplos de uso de todas las alertas disponibles
 */
const SweetAlertDemo = () => {
  
  const handleSuccessDemo = () => {
    showSuccess('¡Operación exitosa!', 'Los datos se guardaron correctamente');
  };

  const handleErrorDemo = () => {
    showError('Error en el proceso', 'No se pudo completar la operación');
  };

  const handleWarningDemo = () => {
    showWarning('Advertencia', 'Esta acción puede tener consecuencias');
  };

  const handleInfoDemo = () => {
    showInfo('Información', 'Este es un mensaje informativo');
  };

  const handleDeleteDemo = async () => {
    const result = await confirmDelete('este elemento de prueba');
    if (result.isConfirmed) {
      showToast('Elemento eliminado', 'success');
    }
  };

  const handleConfirmDemo = async () => {
    const result = await confirmAction(
      '¿Continuar con la operación?',
      'Esta acción cambiará los datos del sistema'
    );
    if (result.isConfirmed) {
      showToast('Operación confirmada', 'success');
    }
  };

  const handlePromptDemo = async () => {
    const result = await promptText(
      'Ingrese su nombre',
      'Por favor, escriba su nombre completo:',
      'Nombre completo...'
    );
    if (result.isConfirmed && result.value) {
      showSuccess('Datos recibidos', `Hola, ${result.value}!`);
    }
  };

  const handleTextareaDemo = async () => {
    const result = await promptTextarea(
      'Comentarios',
      'Escriba sus comentarios o sugerencias:',
      'Sus comentarios aquí...'
    );
    if (result.isConfirmed && result.value) {
      showSuccess('Comentarios recibidos', 'Gracias por su retroalimentación');
    }
  };

  const handleLoadingDemo = async () => {
    showLoading('Procesando datos...', 'Por favor espere mientras procesamos su solicitud');
    
    // Simular proceso de carga
    setTimeout(() => {
      closeLoading();
      showSuccess('Proceso completado', 'Los datos se procesaron exitosamente');
    }, 3000);
  };

  const handleToastDemo = () => {
    showToast('Notificación toast', 'success');
  };

  const handleProcessSuccessDemo = () => {
    showProcessSuccess(
      'Proceso completado exitosamente',
      'Todos los datos se guardaron correctamente',
      {
        text: 'Ir al dashboard',
        callback: () => {
          showToast('Navegando al dashboard...', 'info');
        }
      }
    );
  };

  const handleImportantActionDemo = async () => {
    const result = await confirmImportantAction(
      'Cambio crítico del sistema',
      'Esta acción modificará la configuración principal del sistema',
      'configuración'
    );
    if (result.isConfirmed) {
      showToast('Configuración actualizada', 'warning');
    }
  };

  const handleLogoutDemo = async () => {
    const result = await confirmAction(
      '¿Cerrar sesión?',
      '¿Está seguro que desea cerrar su sesión actual?',
      {
        confirmButtonText: 'Sí, cerrar sesión',
        cancelButtonText: 'Cancelar',
        icon: 'question'
      }
    );
    
    if (result.isConfirmed) {
      showSuccess(
        'Sesión cerrada',
        'Ha cerrado sesión exitosamente',
        {
          timer: 2000,
          showConfirmButton: false
        }
      );
    }
  };

  const handleValidationDemo = () => {
    const errors = [
      'El nombre es requerido',
      'El email debe tener un formato válido',
      'La contraseña debe tener al menos 8 caracteres',
      'Los términos y condiciones deben ser aceptados'
    ];
    showValidationError(errors);
  };

  const demoButtons = [
    { label: 'Éxito', handler: handleSuccessDemo, color: 'bg-green-600 hover:bg-green-700' },
    { label: 'Error', handler: handleErrorDemo, color: 'bg-red-600 hover:bg-red-700' },
    { label: 'Advertencia', handler: handleWarningDemo, color: 'bg-yellow-600 hover:bg-yellow-700' },
    { label: 'Información', handler: handleInfoDemo, color: 'bg-blue-600 hover:bg-blue-700' },
    { label: 'Confirmar Eliminación', handler: handleDeleteDemo, color: 'bg-red-500 hover:bg-red-600' },
    { label: 'Confirmar Acción', handler: handleConfirmDemo, color: 'bg-purple-600 hover:bg-purple-700' },
    { label: 'Prompt Texto', handler: handlePromptDemo, color: 'bg-indigo-600 hover:bg-indigo-700' },
    { label: 'Prompt Textarea', handler: handleTextareaDemo, color: 'bg-indigo-500 hover:bg-indigo-600' },
    { label: 'Loading', handler: handleLoadingDemo, color: 'bg-gray-600 hover:bg-gray-700' },
    { label: 'Toast', handler: handleToastDemo, color: 'bg-emerald-600 hover:bg-emerald-700' },
    { label: 'Proceso Exitoso', handler: handleProcessSuccessDemo, color: 'bg-green-500 hover:bg-green-600' },
    { label: 'Acción Importante', handler: handleImportantActionDemo, color: 'bg-orange-600 hover:bg-orange-700' },
    { label: 'Cerrar Sesión', handler: handleLogoutDemo, color: 'bg-red-600 hover:bg-red-700' },
    { label: 'Errores de Validación', handler: handleValidationDemo, color: 'bg-pink-600 hover:bg-pink-700' }
  ];

  return (
    <div className="p-6 bg-white rounded-lg shadow-lg">
      <h2 className="text-2xl font-bold text-gray-900 mb-6">
        Demostración de SweetAlert
      </h2>
      
      <p className="text-gray-600 mb-6">
        Haz clic en cualquier botón para ver las diferentes tipos de alertas disponibles en el sistema.
      </p>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {demoButtons.map((button, index) => (
          <button
            key={index}
            onClick={button.handler}
            className={`px-4 py-3 text-white font-medium rounded-lg transition-all duration-200 transform hover:scale-105 ${button.color}`}
          >
            {button.label}
          </button>
        ))}
      </div>

      <div className="mt-8 p-4 bg-gray-50 rounded-lg">
        <h3 className="text-lg font-semibold text-gray-900 mb-3">
          Implementaciones en el proyecto:
        </h3>
        <ul className="text-sm text-gray-700 space-y-2">
          <li>• <strong>Dashboard.jsx:</strong> Confirmaciones de eliminación de usuarios, éxito en operaciones, cerrar sesión</li>
          <li>• <strong>TransporteModule.jsx:</strong> Confirmaciones de eliminación, éxito al guardar boletas</li>
          <li>• <strong>RequestRoleComponent.jsx:</strong> Éxito al enviar solicitudes, confirmación de cancelación</li>
          <li>• <strong>RoleRequestsManagement.jsx:</strong> Confirmación de aprobación/rechazo con prompt para motivos</li>
          <li>• <strong>RoleRequestNotifications.jsx:</strong> Notificaciones de éxito y prompts para motivos</li>
          <li>• <strong>Register.jsx:</strong> Validación de errores múltiples, éxito en registro</li>
          <li>• <strong>ForgotPassword.jsx:</strong> Éxito al enviar email, errores de conexión</li>
          <li>• <strong>ResetPassword.jsx:</strong> Validaciones múltiples, éxito al cambiar contraseña</li>
          <li>• <strong>TokenExpirationWarning.jsx:</strong> Confirmación de cerrar sesión y extender tiempo</li>
        </ul>
      </div>

      <div className="mt-6 p-4 bg-blue-50 rounded-lg">
        <h3 className="text-lg font-semibold text-blue-900 mb-3">
          Configuración personalizada:
        </h3>
        <ul className="text-sm text-blue-800 space-y-1">
          <li>• Colores corporativos (azul principal, grises secundarios)</li>
          <li>• Textos en español</li>
          <li>• Animaciones suaves</li>
          <li>• Timers automáticos para notificaciones</li>
          <li>• Validación de formularios con múltiples errores</li>
          <li>• Prompts para inputs de texto y textarea</li>
        </ul>
      </div>
    </div>
  );
};

export default SweetAlertDemo;
