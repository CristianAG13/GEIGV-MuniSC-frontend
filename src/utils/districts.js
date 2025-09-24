

// --- Listas base (SIN depender de otras) ---
export const districts = [
  "Santa Cruz",
  "Bolsón",
  "Veintisiete de Abril",
  "Tempate",
  "Cartagena",
  "Cuajiniquil",
  "Diriá",
  "Cabo Velas",
  "Tamarindo",
];

export const materialTypes = [
  "Escombros",
  "Desechos",
  "Tierra",
  "Arena",
  "Base",
  "Subbase",
  "Lastre",
  "Alcantarilla",
];

export const activityTypes = [
  "Excavación",
  "Nivelación",
  "Compactación",
  "Carga",
  "Descarga",
  "Transporte",
  "Mantenimiento",
  "Limpieza",
];

export const cargoTypes = ["Backhoe", "Cargador", "Compactadora", "Cisterna", "Vagoneta", "Cabezal", "Excavadora", "Niveladora", "Recolector", "Alcantarillas"];

export const liquidSources = [
  "Río Diriá",
  "Río Santa Barbara",
  "Río Charco",
  "Río Tabaco",
  "Río Montaña",
  "Río Cañas",
];

export const materialSources = ["Palo de Arco"];

export const rentalSources = ["Palo de Arco"];

// --- Derivados (PUEDEN usar lo anterior) ---
export const sourceOptions = {
  default: liquidSources, // fallback

  vagoneta: {
    material: materialSources, // solo estas 2
    cisterna: liquidSources,
    carreta: [],               // sin fuentes
  },

  cabezal: {
    material: materialSources,
    cisterna: liquidSources,
    carreta: [],
  },

  // tipos sin variantes
  cisterna: liquidSources,
};

// Options for rental sources (alquiler)
export const rentalSourceOptions = {
  default: rentalSources, // fallback for rental reports

  vagoneta: {
    material: rentalSources,
    cisterna: liquidSources,
    carreta: [],
  },

  cabezal: {
    material: rentalSources,
    cisterna: liquidSources,
    carreta: [],
  },

  // tipos sin variantes
  cisterna: liquidSources,
};

// Actividades por tipo/variante
export const activityOptions = {
  vagoneta: {
    material: ["Acarreo de material"],
    cisterna: ["Riego de agua", "Transporte de agua"],
    carreta: ["Transporte"],
  },
  cabezal: {
    material: ["Acarreo de material"],
    cisterna: ["Riego de agua", "Transporte de agua"],
    carreta: ["Transporte"],
  },
  cisterna: { default: ["Riego de agua", "Transporte de agua"] },
  excavadora: { default: ["Extracción y cargo de material", "Colocación de alcantarillas", "Limpieza"] },
  niveladora: { default: ["Limpieza", "Conformación", "Lastreado"] },
  backhoe: {
    default: [
      "Limpieza",
      "Colocación de alcantarillas",
      "Extensión de material",
      "Carga de material",
      "Excavación",
      "Extracción de material",
      "Demolición",
    ],
  },
  compactadora: { default: ["Compactación"] },
  cargador: { default: ["Cargar"] },
};
