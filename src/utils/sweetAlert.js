// /src/utils/sweetAlert.js
import Swal from 'sweetalert2';

/** Config por defecto */
const defaultConfig = {
  confirmButtonColor: '#3b82f6',
  cancelButtonColor: '#6b7280',
  confirmButtonText: 'Aceptar',
  cancelButtonText: 'Cancelar',
  showClass: { popup: 'animate__animated animate__fadeInDown' },
  hideClass: { popup: 'animate__animated animate__fadeOutUp' },
};

/** Básicas */
export const showSuccess = (title, text = '', options = {}) =>
  Swal.fire({ ...defaultConfig, icon: 'success', title, text, confirmButtonText: 'Entendido', timer: 3000, timerProgressBar: true, ...options });

export const showError = (title, text = '', options = {}) =>
  Swal.fire({ ...defaultConfig, icon: 'error', title, text, confirmButtonText: 'Entendido', ...options });

export const showWarning = (title, text = '', options = {}) =>
  Swal.fire({ ...defaultConfig, icon: 'warning', title, text, confirmButtonText: 'Entendido', ...options });

export const showInfo = (title, text = '', options = {}) =>
  Swal.fire({ ...defaultConfig, icon: 'info', title, text, confirmButtonText: 'Entendido', ...options });

/** Confirms genéricos */
export const confirmDelete = (itemName = 'este elemento', options = {}) =>
  Swal.fire({
    ...defaultConfig,
    icon: 'warning',
    title: '¿Está seguro?',
    text: `¿Realmente desea eliminar ${itemName}? Esta acción no se puede deshacer.`,
    showCancelButton: true,
    confirmButtonColor: '#dc2626',
    confirmButtonText: 'Sí, eliminar',
    cancelButtonText: 'Cancelar',
    reverseButtons: true,
    ...options,
  });

export const confirmAction = (title, text = '', options = {}) =>
  Swal.fire({
    ...defaultConfig,
    icon: 'question',
    title,
    text,
    showCancelButton: true,
    confirmButtonText: 'Sí, continuar',
    cancelButtonText: 'Cancelar',
    reverseButtons: true,
    ...options,
  });

/** Prompts */
export const promptText = (title, text = '', placeholder = '', options = {}) =>
  Swal.fire({
    ...defaultConfig,
    title,
    text,
    input: 'text',
    inputPlaceholder: placeholder,
    showCancelButton: true,
    confirmButtonText: 'Aceptar',
    cancelButtonText: 'Cancelar',
    inputValidator: (value) => {
      if (!value && options.required !== false) return 'Este campo es requerido';
    },
    ...options,
  });

export const promptTextarea = (title, text = '', placeholder = '', options = {}) =>
  Swal.fire({
    ...defaultConfig,
    title,
    text,
    input: 'textarea',
    inputPlaceholder: placeholder,
    showCancelButton: true,
    confirmButtonText: 'Aceptar',
    cancelButtonText: 'Cancelar',
    inputValidator: (value) => {
      if (!value && options.required !== false) return 'Este campo es requerido';
    },
    ...options,
  });

/** Loading */
export const showLoading = (title = 'Procesando...', text = 'Por favor, espere') =>
  Swal.fire({ title, text, allowOutsideClick: false, allowEscapeKey: false, showConfirmButton: false, didOpen: () => Swal.showLoading() });

export const closeLoading = () => Swal.close();

/** Toast */
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
    },
  });
  return Toast.fire({ icon, title });
};

/** Extra */
export const showProcessSuccess = (title, details = '', nextAction = null) =>
  Swal.fire({
    ...defaultConfig,
    icon: 'success',
    title,
    text: details,
    confirmButtonText: nextAction ? nextAction.text : 'Continuar',
    timer: nextAction ? undefined : 3000,
    timerProgressBar: !nextAction,
  }).then((result) => {
    if (result.isConfirmed && nextAction?.callback) nextAction.callback();
  });

export const confirmImportantAction = (title, details = '', actionType = 'cambio') =>
  Swal.fire({
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
    focusCancel: true,
  });

export const showValidationError = (errors = []) =>
  Swal.fire({
    ...defaultConfig,
    icon: 'error',
    title: 'Errores de validación',
    html: `
      <div class="text-left">
        <p class="mb-3">Por favor, corrija los siguientes errores:</p>
        <div class="bg-red-50 border border-red-200 rounded-lg p-3">
          <div class="text-sm text-red-800">${errors.map(e => `• ${e}`).join('<br>')}</div>
        </div>
      </div>
    `,
    confirmButtonText: 'Entendido',
  });

/** Export default agrupado (opcional) */
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
  showValidationError,
};
