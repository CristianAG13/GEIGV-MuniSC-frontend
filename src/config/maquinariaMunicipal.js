// config/maquinariaMunicipal.js
export const MAQUINARIA_MUNICIPAL = {
  NIVELADORA: [
    { id: 'niv-1', placa: 'SM-1234', codigo: 'NIV-001' },
    { id: 'niv-2', placa: 'SM-1235', codigo: 'NIV-002' },
    { id: 'niv-3', placa: 'SM-1236', codigo: 'NIV-003' }
  ],
  VAGONETA: [
    { id: 'vag-1', placa: 'SM-3234', codigo: 'VAG-001' },
    { id: 'vag-2', placa: 'SM-3235', codigo: 'VAG-002' },
    { id: 'vag-3', placa: 'SM-3236', codigo: 'VAG-003' },
    { id: 'vag-4', placa: 'SM-3237', codigo: 'VAG-004' },
    { id: 'vag-5', placa: 'SM-3238', codigo: 'VAG-005' },
    { id: 'vag-6', placa: 'SM-3239', codigo: 'VAG-006' },
    { id: 'vag-7', placa: 'SM-3240', codigo: 'VAG-007' },
    { id: 'vag-8', placa: 'SM-3241', codigo: 'VAG-008' },
    { id: 'vag-9', placa: 'SM-3242', codigo: 'VAG-009' },
    { id: 'vag-10', placa: 'SM-3243', codigo: 'VAG-010' },
    { id: 'vag-11', placa: 'SM-3244', codigo: 'VAG-011' }
  ],
  COMPACTADORA: [
    { id: 'com-1', placa: 'SM-2234', codigo: 'COM-001' },
    { id: 'com-2', placa: 'SM-2235', codigo: 'COM-002' },
    { id: 'com-3', placa: 'SM-2236', codigo: 'COM-003' },
    { id: 'com-4', placa: 'SM-2237', codigo: 'COM-004' },
    { id: 'com-5', placa: 'SM-2238', codigo: 'COM-005' }
  ]
};

export const ACTIVIDADES_POR_TIPO = {
  NIVELADORA: [
    'Nivelación de camino',
    'Conformación de superficie',
    'Escarificación',
    'Mantenimiento rutinario',
    'Apertura de camino'
  ],
  VAGONETA: [
    'Acarreo de material',
    'Transporte de lastre',
    'Transporte de base',
    'Transporte de subbase',
    'Transporte de piedra',
    'Transporte de arena',
    'Recolección de escombros'
  ],
  COMPACTADORA: [
    'Compactación de base',
    'Compactación de subbase',
    'Compactación de superficie',
    'Compactación de asfalto',
    'Sellado de superficie'
  ]
};