
// src/features/machinery/machineryFields.js

export const machineryFields = {
  Vagoneta: {
    variantes: {
      material: [
        "Tipo actividad",
        "Tipo material",
        "Cantidad material",
        "Fuente",
        "Boleta",
        "Codigo camino",
        "Distrito",
        "Kilometraje",
        "Litros diesel",
        "Hora inicio",
        "Hora fin",
      ],
      cisterna: [
        "Tipo actividad",
        "Cantidad liquido",
        "Fuente",
        "Codigo camino",
        "Distrito",
        "Kilometraje",
        "Litros diesel",
        "Hora inicio",
        "Hora fin",
      ],
      carreta: [
        "Tipo actividad",
        "Placa carreta",
        "Destino",
        "Tipo carga",
        "Placa maquinaria llevada",   // <-- NUEVO
        "Codigo camino",
        "Distrito",
        "Kilometraje",
        "Litros diesel",
        "Hora inicio",
        "Hora fin",
      ],
    },
    placas: [
      { codigo: "SM 3186", roles: ["material", "carreta"] },
      { codigo: "SM 3187", roles: ["material", "carreta"] },
      { codigo: "SM 6009", roles: ["material", "carreta"] },
      { codigo: "SM 8424", roles: ["material", "carreta"] },
      { codigo: "SM 8466", roles: ["material", "carreta"] },
      { codigo: "SM 8467", roles: ["material", "carreta"] },
      { codigo: "SM 8474", roles: ["material", "carreta"] },
      { codigo: "SM 8492", roles: ["material", "carreta"] },
      { codigo: "SM 8513", roles: ["material", "carreta"] },
      { codigo: "SM 8488", roles: ["material", "carreta"] },
      { codigo: "SM 5711", roles: ["material", "carreta", "cisterna"] }, // especial
    ],
  },

  Cisterna: {
    campos: [
      "Tipo actividad",
      "Cantidad liquido",
      "Fuente",
      "Codigo camino",
      "Distrito",
      "Kilometraje",
      "Litros diesel",
      "Hora inicio",
      "Hora fin",
    ],
    placas: ["SM 7842", "SM 8553"],
  },

  Cabezal: {
    variantes: {
      material: [
        "Tipo actividad",
        "Tipo material",
        "Cantidad material",
        "Fuente",
        "Boleta",
        "Codigo camino",
        "Distrito",
        "Kilometraje",
        "Litros diesel",
        "Hora inicio",
        "Hora fin",
        "Placa carreta",
      ],
      cisterna: [
        "Tipo actividad",
        "Cantidad liquido",
        "Fuente",
        "Codigo camino",
        "Distrito",
        "Kilometraje",
        "Litros diesel",
        "Hora inicio",
        "Hora fin",
        "Placa carreta",
      ],
      carreta: [
        "Tipo actividad",
        "Placa carreta",
        "Destino",
        "Tipo carga",
        "Placa maquinaria llevada",   // <-- NUEVO
        "Estación",
        "Codigo camino",
        "Distrito",
        "Kilometraje",
        "Litros diesel",
        "Hora inicio",
        "Hora fin",
      ],
    },
    placas: ["SM 7843", "SM 8772"],
  },

  Excavadora: {
    campos: [
      "Tipo actividad",
      "Estación",
      "Codigo camino",
      "Distrito",
      "Horimetro",
      "Litros diesel",
      "Hora inicio",
      "Hora fin",
    ],
    placas: ["SM 8423"],
  },

  Niveladora: {
    campos: [
      "Tipo actividad",
      "Estación",
      "Codigo camino",
      "Distrito",
      "Horimetro",
      "Litros diesel",
      "Hora inicio",
      "Hora fin",
    ],
    placas: ["SM 8462", "SM 8684"],
  },

  Compactadora: {
    campos: [
      "Tipo actividad",
      "Estación",
      "Codigo camino",
      "Distrito",
      "Horimetro",
      "Litros diesel",
      "Hora inicio",
      "Hora fin",
    ],
    placas: ["SM 5256", "SM 8434"],
  },

  Backhoe: {
    campos: [
      "Tipo actividad",
      "Estación",
      "Codigo camino",
      "Distrito",
      "Horimetro",
      "Litros diesel",
      "Hora inicio",
      "Hora fin",
    ],
    placas: ["SM 4509", "SM 7724", "SM 8425"],
  },

  Cargador: {
    campos: [
      "Tipo actividad",
      "Tipo carga",
      "Estación",
      "Codigo camino",
      "Distrito",
      "Horimetro",
      "Litros diesel",
      "Hora inicio",
      "Hora fin",
    ],
    placas: ["SM 2954"],
  },
};
