


// --- Listas base ---
export const districts = [
  "Santa Cruz","Bolsón","Veintisiete de Abril","Tempate","Cartagena",
  "Cuajiniquil","Diriá","Cabo Velas","Tamarindo",
];

// Material general
export const materialTypes = [
  "Escombros","Desechos","Tierra","Arena","Base","Subbase","Lastre","Alcantarilla",
];

// Actividades genéricas
export const activityTypes = [
  "Excavación","Nivelación","Compactación","Carga","Descarga","Transporte","Mantenimiento","Limpieza",
];

export const cargoTypes = [
  "Backhoe","Cargador","Compactadora","Cisterna","Vagoneta","Cabezal",
  "Excavadora","Niveladora","Recolector","Alcantarillas",
];

// Listas de fuentes
export const rivers = [
  "Río Diriá","Río Santa Barbara","Río Charco","Río Tabaco","Río Montaña","Río Cañas",
];

export const tajosBase = ["Tajo Diriá","Tajo Meridiana"];
export const materialFromRivers = ["Arena","Lastre","Grava","Cantos rodados"];

// Para municipales (por tipo/variante)
export const sourceOptions = {
  default: rivers, // fallback

  vagoneta: {
    material: ["Palo de Arco", "Ríos", "Tajo"],
    cisterna: rivers,
    carreta: [],
  },
  cabezal: {
    material: ["Palo de Arco", "Ríos", "Tajo"],
    cisterna: rivers,
    carreta: [],
  },

  // tipos sin variantes
  cisterna: rivers,
};

// Para alquiler (mismas + KYLCSA)
export const rentalSourceOptions = {
  default: ["Palo de Arco"],

  vagoneta: { material: ["Palo de Arco", "Ríos", "Tajo", "KYLCSA"], cisterna: rivers, carreta: [] },
  cabezal:  { material: ["Palo de Arco", "Ríos", "Tajo", "KYLCSA"], cisterna: rivers, carreta: [] },

  cisterna: rivers,
};

// Actividades por tipo/variante
export const activityOptions = {
  vagoneta: { material: ["Acarreo de material"], cisterna: ["Riego de agua","Transporte de agua"], carreta: ["Transporte"] },
  cabezal:  { material: ["Acarreo de material"], cisterna: ["Riego de agua","Transporte de agua"], carreta: ["Transporte"] },
  cisterna: { default: ["Riego de agua","Transporte de agua"] },
  excavadora: { default: ["Extracción y cargo de material","Colocación de alcantarillas","Limpieza"] },
  niveladora: { default: ["Limpieza","Conformación","Lastreado"] },
  backhoe: { default: ["Limpieza","Colocación de alcantarillas","Extensión de material","Carga de material","Excavación","Extracción de material","Demolición"] },
  compactadora: { default: ["Compactación"] },
  cargador: { default: ["Cargar"] },
};

