
// // services/machineryService.js
// import apiClient from "../config/api";

// class MachineryService {
//   // ——— Reports (municipales) ———
//   buildReportPayload(formData) {
//     return {
//       fecha: formData.fecha ?? null,
//       horaInicio: formData.horaInicio ?? null,
//       horaFin: formData.horaFin ?? null,
//       actividad: formData.actividades ?? formData.tipoActividad ?? null,
//       estacion: formData.estacion ?? null,
//       codigoCamino: formData.codigoCamino ?? null,
//       distrito: formData.distrito ?? null,
//       horimetro: Number(formData.horimetro) || 0,
//       kilometraje: Number(formData.kilometraje) || 0,
//       diesel: Number(formData.combustible) || 0,
//       horasOrd: Number(formData.horasOrd) || 0,
//       horasExt: Number(formData.horasExt) || 0,
//       viaticos: Number(formData.viaticos) || 0,
//       detalles: {
//         observaciones: formData.observaciones ?? "",
//         tipoMaterial: formData.tipoMaterial ?? "",
//         cantidadMaterial: Number(formData.cantidadMaterial) || 0,
//         fuente: formData.fuente ?? "",
//         boleta: formData.boleta ?? "",
//         cantidadLiquido: Number(formData.cantidadLiquido) || 0,
//         placaCarreta: formData.placaCarreta ?? "",
//         destino: formData.destino ?? "",
//         tipoCarga: formData.tipoCarga ?? "",
//         tipoMaquinaria: formData.tipoMaquinaria ?? "",
//         placa: formData.placa ?? "",
//       },
//       operadorId: Number(formData.operadorId) || null,
//       maquinariaId: Number(formData.maquinariaId) || null,
//     };
//   }

//   async createReport(formData) {
//     const data = this.buildReportPayload(formData);
//     if (!data.operadorId || !data.maquinariaId) {
//       throw new Error("Debes especificar operadorId y maquinariaId.");
//     }
//     const res = await apiClient.post("/machinery/report", data); // ← singular
//     return res.data;
//   }

//   async getAllReports() {
//     const res = await apiClient.get("/machinery/report"); // ← singular, sin page/limit
//     return res.data;
//   }

//   async getReportsByOperatorAndDate({ operadorId, start, end }) {
//     const params = {
//       operadorId: String(operadorId), // si usas class-validator con @IsNumberString
//       start,
//       end,
//     };
//     const res = await apiClient.get("/machinery/report/by-operator", { params });
//     return res.data;
//   }

//   async getReportsByType(tipo) {
//     const res = await apiClient.get("/machinery/report/by-type", { params: { tipo } });
//     return res.data;
//   }

//   async getCisternaReports() {
//     const res = await apiClient.get("/machinery/report/cisterna");
//     return res.data;
//   }

//   // ——— Rental & Material ———
//   async createRentalReport(dto) {
//     const res = await apiClient.post("/machinery/rental-report", dto);
//     return res.data;
//   }
//   async getAllRentalReports() {
//     const res = await apiClient.get("/machinery/rental-report");
//     return res.data;
//   }
//   async createMaterialReport(dto) {
//     const res = await apiClient.post("/machinery/material-report", dto);
//     return res.data;
//   }
//   async getAllMaterialReports() {
//     const res = await apiClient.get("/machinery/material-report");
//     return res.data;
//   }

//   // ——— Maquinaria ———
//   async getAllMachinery() {
//     const res = await apiClient.get("/machinery");
//     return res.data;
//   }
//   async createMachinery(dto) {
//     const res = await apiClient.post("/machinery", dto);
//     return res.data;
//   }
//   async getMachineryById(id) {
//     const res = await apiClient.get(`/machinery/${id}`);
//     return res.data;
//   }
//   async updateMachinery(id, dto) {
//     const res = await apiClient.patch(`/machinery/${id}`, dto);
//     return res.data;
//   }
//   async deleteMachinery(id) {
//     const res = await apiClient.delete(`/machinery/${id}`);
//     return res.data;
//   }

// }


// const machineryService = new MachineryService();
// export default machineryService;

// services/machineryService.js
import apiClient from "../config/api";

class MachineryService {
  // Utilidad simple de log
  static log(tag, data) {
    // eslint-disable-next-line no-console
    console.log(`[machineryService] ${tag}:`, data);
  }

  // ========= REPORTES (municipales) =========
  buildReportPayload(formData) {
    return {
      fecha: formData.fecha ?? null,
      horaInicio: formData.horaInicio ?? null,
      horaFin: formData.horaFin ?? null,
      actividad: formData.actividades ?? formData.tipoActividad ?? null,
      estacion: formData.estacion ?? null,
      codigoCamino: formData.codigoCamino ?? null,
      distrito: formData.distrito ?? null,
      horimetro: Number(formData.horimetro) || 0,
      kilometraje: Number(formData.kilometraje) || 0,
      diesel: Number(formData.combustible) || 0,
      horasOrd: Number(formData.horasOrd) || 0,
      horasExt: Number(formData.horasExt) || 0,
      viaticos: Number(formData.viaticos) || 0,
      detalles: {
        observaciones: formData.observaciones ?? "",
        tipoMaterial: formData.tipoMaterial ?? "",
        cantidadMaterial: Number(formData.cantidadMaterial) || 0,
        fuente: formData.fuente ?? "",
        boleta: formData.boleta ?? "",
        cantidadLiquido: Number(formData.cantidadLiquido) || 0,
        placaCarreta: formData.placaCarreta ?? "",
        destino: formData.destino ?? "",
        tipoCarga: formData.tipoCarga ?? "",
        tipoMaquinaria: formData.tipoMaquinaria ?? "",
        placa: formData.placa ?? "",
      },
      operadorId: Number(formData.operadorId) || null,
      maquinariaId: Number(formData.maquinariaId) || null,
    };
  }

  async createReport(formData) {
    const data = this.buildReportPayload(formData);
    if (!data.operadorId || !data.maquinariaId) {
      throw new Error("Debes especificar operadorId y maquinariaId.");
    }
    try {
      const res = await apiClient.post("/machinery/report", data); // singular
      return res.data;
    } catch (err) {
      MachineryService.log("createReport -> error", err?.response?.data || err);
      throw err;
    }
  }

  async getAllReports() {
    try {
      const res = await apiClient.get("/machinery/report"); // singular, sin paginación
      return res.data;
    } catch (err) {
      MachineryService.log("getAllReports -> error", err?.response?.data || err);
      throw err;
    }
  }

  async getReportsByOperatorAndDate({ operadorId, start, end }) {
    try {
      const params = {
        operadorId: String(operadorId), // evita el 400 "numeric string is expected"
        start,
        end,
      };
      const res = await apiClient.get("/machinery/report/by-operator", { params });
      return res.data;
    } catch (err) {
      MachineryService.log("getReportsByOperatorAndDate -> error", err?.response?.data || err);
      throw err;
    }
  }

  async getReportsByType(tipo) {
    try {
      const res = await apiClient.get("/machinery/report/by-type", { params: { tipo } });
      return res.data;
    } catch (err) {
      MachineryService.log("getReportsByType -> error", err?.response?.data || err);
      throw err;
    }
  }

  async getCisternaReports() {
    try {
      const res = await apiClient.get("/machinery/report/cisterna");
      return res.data;
    } catch (err) {
      MachineryService.log("getCisternaReports -> error", err?.response?.data || err);
      throw err;
    }
  }

  // ========= REPORTES (rental / material) =========
  async createRentalReport(dto) {
    try {
      const res = await apiClient.post("/machinery/rental-report", dto);
      return res.data;
    } catch (err) {
      MachineryService.log("createRentalReport -> error", err?.response?.data || err);
      throw err;
    }
  }

  async getAllRentalReports() {
    try {
      const res = await apiClient.get("/machinery/rental-report");
      return res.data;
    } catch (err) {
      MachineryService.log("getAllRentalReports -> error", err?.response?.data || err);
      throw err;
    }
  }

  async createMaterialReport(dto) {
    try {
      const res = await apiClient.post("/machinery/material-report", dto);
      return res.data;
    } catch (err) {
      MachineryService.log("createMaterialReport -> error", err?.response?.data || err);
      throw err;
    }
  }

  async getAllMaterialReports() {
    try {
      const res = await apiClient.get("/machinery/material-report");
      return res.data;
    } catch (err) {
      MachineryService.log("getAllMaterialReports -> error", err?.response?.data || err);
      throw err;
    }
  }

  // ========= MAQUINARIA =========
  /**
   * Devuelve lista normalizada:
   * { id, tipo, placa, esPropietaria, roles: string[] }
   * Acepta filtros opcionales (server-side si los implementaste):
   *   getAllMachinery({ tipo: 'vagoneta', rol: 'carreta' })
   */
  async getAllMachinery(filter = {}) {
    try {
      const params = {};
      if (filter.tipo) params.tipo = filter.tipo;
      if (filter.rol) params.rol = filter.rol;

      const res = await apiClient.get("/machinery", { params });
      const raw = Array.isArray(res.data) ? res.data : [];

      // normaliza roles en todos los casos
      const norm = raw.map((m) => {
        const id =
          m.id ?? m.machineryId ?? m._id ?? null;

        const tipo =
          m.tipo ?? m.type ?? "";

        const placa =
          m.placa ?? m.plate ?? "";

        const esPropietaria = Boolean(m.esPropietaria);

        let roles = [];
        if (Array.isArray(m.roles)) {
          // puede venir como ['material','carreta'] o [{rol:'material'}, {rol:'carreta'}]
          roles = m.roles
            .map((r) => (typeof r === "string" ? r : (r?.rol ?? r?.role)))
            .filter(Boolean);
        } else if (m.rol) {
          roles = [m.rol];
        }

        // únicos, en minúscula (opcional)
        roles = Array.from(new Set(roles.map((r) => String(r).toLowerCase())));

        return { id, tipo, placa, esPropietaria, roles };
      });

      return norm;
    } catch (err) {
      MachineryService.log("getAllMachinery -> error", err?.response?.data || err);
      throw err;
    }
  }

  async createMachinery(dto) {
    try {
      // dto esperado: { tipo, placa, esPropietaria?, rol? }
      const res = await apiClient.post("/machinery", dto);
      return res.data;
    } catch (err) {
      MachineryService.log("createMachinery -> error", err?.response?.data || err);
      throw err;
    }
  }

  async getMachineryById(id) {
    try {
      const res = await apiClient.get(`/machinery/${id}`);
      return res.data;
    } catch (err) {
      MachineryService.log("getMachineryById -> error", err?.response?.data || err);
      throw err;
    }
  }

  async updateMachinery(id, dto) {
    try {
      // dto: { tipo?, placa?, esPropietaria?, rol? }
      const res = await apiClient.patch(`/machinery/${id}`, dto);
      return res.data;
    } catch (err) {
      MachineryService.log("updateMachinery -> error", err?.response?.data || err);
      throw err;
    }
  }

  async deleteMachinery(id) {
    try {
      const res = await apiClient.delete(`/machinery/${id}`);
      return res.data;
    } catch (err) {
      MachineryService.log("deleteMachinery -> error", err?.response?.data || err);
      throw err;
    }
  }
}

const machineryService = new MachineryService();
export default machineryService;

