import Swal from 'sweetalert2';

/**
 * Configuración personalizada para SweetAlert2
 */
const defaultConfig = {
  confirmButtonColor: '#3b82f6',
  cancelButtonColor: '#6b7280',
  confirmButtonText: 'Aceptar',
  cancelButtonText: 'Cancelar',
  showClass: {
    popup: 'animate__animated animate__fadeInDown'
  },
  hideClass: {
    popup: 'animate__animated animate__fadeOutUp'
  }
};

/**
 * Alerta de éxito
 */
export const showSuccess = (title, text = '', options = {}) => {
  return Swal.fire({
    ...defaultConfig,
    icon: 'success',
    title,
    text,
    confirmButtonText: 'Entendido',
    timer: 3000,
    timerProgressBar: true,
    ...options
  });
};

/**
 * Alerta de error
 */
export const showError = (title, text = '', options = {}) => {
  return Swal.fire({
    ...defaultConfig,
    icon: 'error',
    title,
    text,
    confirmButtonText: 'Entendido',
    ...options
  });
};

/**
 * Alerta de advertencia
 */
export const showWarning = (title, text = '', options = {}) => {
  return Swal.fire({
    ...defaultConfig,
    icon: 'warning',
    title,
    text,
    confirmButtonText: 'Entendido',
    ...options
  });
};

/**
 * Alerta de información
 */
export const showInfo = (title, text = '', options = {}) => {
  return Swal.fire({
    ...defaultConfig,
    icon: 'info',
    title,
    text,
    confirmButtonText: 'Entendido',
    ...options
  });
};

/**
 * Confirmación de eliminación
 */
export const confirmDelete = (itemName = 'este elemento', options = {}) => {
  return Swal.fire({
    ...defaultConfig,
    icon: 'warning',
    title: '¿Está seguro?',
    text: `¿Realmente desea eliminar ${itemName}? Esta acción no se puede deshacer.`,
    showCancelButton: true,
    confirmButtonColor: '#dc2626',
    confirmButtonText: 'Sí, eliminar',
    cancelButtonText: 'Cancelar',
    reverseButtons: true,
    ...options
  });
};

/**
 * Confirmación genérica
 */
export const confirmAction = (title, text = '', options = {}) => {
  return Swal.fire({
    ...defaultConfig,
    icon: 'question',
    title,
    text,
    showCancelButton: true,
    confirmButtonText: 'Sí, continuar',
    cancelButtonText: 'Cancelar',
    reverseButtons: true,
    ...options
  });
};

/**
 * Alerta con input de texto
 */
export const promptText = (title, text = '', placeholder = '', options = {}) => {
  return Swal.fire({
    ...defaultConfig,
    title,
    text,
    input: 'text',
    inputPlaceholder: placeholder,
    showCancelButton: true,
    confirmButtonText: 'Aceptar',
    cancelButtonText: 'Cancelar',
    inputValidator: (value) => {
      if (!value && options.required !== false) {
        return 'Este campo es requerido';
      }
    },
    ...options
  });
};

/**
 * Alerta con textarea
 */
export const promptTextarea = (title, text = '', placeholder = '', options = {}) => {
  return Swal.fire({
    ...defaultConfig,
    title,
    text,
    input: 'textarea',
    inputPlaceholder: placeholder,
    showCancelButton: true,
    confirmButtonText: 'Aceptar',
    cancelButtonText: 'Cancelar',
    inputValidator: (value) => {
      if (!value && options.required !== false) {
        return 'Este campo es requerido';
      }
    },
    ...options
  });
};

/**
 * Alerta de carga/loading
 */
export const showLoading = (title = 'Procesando...', text = 'Por favor, espere') => {
  return Swal.fire({
    title,
    text,
    allowOutsideClick: false,
    allowEscapeKey: false,
    showConfirmButton: false,
    didOpen: () => {
      Swal.showLoading();
    }
  });
};

/**
 * Cerrar alerta de carga
 */
export const closeLoading = () => {
  Swal.close();
};

/**
 * Toast notification (notificación pequeña)
 */
export const showToast = (title, icon = 'success', position = 'top-end') => {
  const Toast = Swal.mixin({
    toast: true,
    position,
    showConfirmButton: false,
    timer: 3000,
    timerProgressBar: true,
    didOpen: (toast) => {
      toast.addEventListener('mouseenter', Swal.stopTimer);
      toast.addEventListener('mouseleave', Swal.resumeTimer);
    }
  });

  return Toast.fire({
    icon,
    title
  });
};

/**
 * Alerta de proceso completado con éxito
 */
export const showProcessSuccess = (title, details = '', nextAction = null) => {
  const config = {
    ...defaultConfig,
    icon: 'success',
    title,
    text: details,
    confirmButtonText: nextAction ? nextAction.text : 'Continuar',
    timer: nextAction ? undefined : 3000,
    timerProgressBar: !nextAction
  };

  return Swal.fire(config).then((result) => {
    if (result.isConfirmed && nextAction && nextAction.callback) {
      nextAction.callback();
    }
  });
};

/**
 * Alerta de confirmación para cambios importantes
 */
export const confirmImportantAction = (title, details = '', actionType = 'cambio') => {
  return Swal.fire({
    ...defaultConfig,
    icon: 'warning',
    title,
    html: `
      <p class="mb-3">${details}</p>
      <div class="bg-yellow-50 border border-yellow-200 rounded-lg p-3 text-left">
        <p class="text-sm text-yellow-800">
          <strong>⚠️ Importante:</strong> Este ${actionType} puede afectar el funcionamiento del sistema.
        </p>
      </div>
    `,
    showCancelButton: true,
    confirmButtonColor: '#f59e0b',
    confirmButtonText: 'Sí, continuar',
    cancelButtonText: 'Cancelar',
    reverseButtons: true,
    focusCancel: true
  });
};

/**
 * Alerta de validación de formulario
 */
export const showValidationError = (errors = []) => {
  const errorList = errors.map(error => `• ${error}`).join('<br>');
  
  return Swal.fire({
    ...defaultConfig,
    icon: 'error',
    title: 'Errores de validación',
    html: `
      <div class="text-left">
        <p class="mb-3">Por favor, corrija los siguientes errores:</p>
        <div class="bg-red-50 border border-red-200 rounded-lg p-3">
          <div class="text-sm text-red-800">${errorList}</div>
        </div>
      </div>
    `,
    confirmButtonText: 'Entendido'
  });
};

export default {
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
};
