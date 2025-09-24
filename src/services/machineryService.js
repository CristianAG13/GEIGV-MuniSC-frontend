import apiClient from "../config/api";

// --- Helpers de estación (solo aquí arriba, no los dupliques) ---
function normalizeEstacion(raw) {
  if (raw == null || raw === "") return null;
  let s = String(raw).trim();
  // deja solo dígitos y '+'
  s = s.replace(/[^\d+]/g, "");
  const m = s.match(/^(\d+)\+(\d+)$/);
  if (m) return `${Number(m[1])}+${Number(m[2])}`;
  return null; // si no cumple el formato, que el backend lo valide y rechace
}

function coalesceEstacionFromPairs(fd) {
  const desde = fd?.estacionDesde ?? fd?.estacionDesdeStr ?? fd?.detalles?.estacionDesde;
  const hasta = fd?.estacionHasta ?? fd?.estacionHastaStr ?? fd?.detalles?.estacionHasta;
  if (desde != null && desde !== "" && hasta != null && hasta !== "") {
    return normalizeEstacion(`${desde}+${hasta}`);
  }
  return null;
}

class MachineryService {
  static log(tag, data) {
    // eslint-disable-next-line no-console
    console.log(`[machineryService] ${tag}:`, data);
  }

  // Convierte el form plano a lo que espera el backend
  buildReportPayload(formData = {}) {
    const toNumOrNull = (v) => (v === "" || v == null ? null : Number(v));

    const detalles = {
      observaciones: formData.observaciones ?? "",
      variante: formData.variant ?? formData.variante ?? null,
      tipoMaquinaria: formData.tipoMaquinaria ?? null,
      placa: formData.placa ?? null,

      // por variante
      tipoMaterial: formData.tipoMaterial ?? null,
      cantidadMaterial: toNumOrNull(formData.cantidadMaterial),
      fuente: formData.fuente ?? null,
      boleta: formData.boleta ?? null,

      cantidadLiquido: toNumOrNull(formData.cantidadLiquido),

      placaCarreta: formData.placaCarreta ?? null,
      destino: formData.destino ?? null,
      tipoCarga: formData.tipoCarga ?? null,

      placaMaquinariaLlevada: formData.placaMaquinariaLlevada ?? null,
      horaInicio: formData.horaInicio ?? null,
      horaFin: formData.horaFin ?? null,
    };

    return {
      // ROOT (solo lo que el backend acepta)
      fecha: formData.fecha ?? null,
      actividad: formData.tipoActividad ?? formData.actividad ?? null,
      codigoCamino: formData.codigoCamino ?? null,
      distrito: formData.distrito ?? null,

      horimetro: toNumOrNull(formData.horimetro),
      kilometraje: toNumOrNull(formData.kilometraje),
      diesel: toNumOrNull(formData.combustible ?? formData.diesel),
      horasOrd: toNumOrNull(formData.horasOrd),
      horasExt: toNumOrNull(formData.horasExt),
      viaticos: toNumOrNull(formData.viaticos),

      // ⬇️ aquí tomamos estacion (único campo) o combinamos los 2 viejos
      estacion:
        normalizeEstacion(formData.estacion ?? formData.estacionStr) ??
        coalesceEstacionFromPairs(formData),

      operadorId: toNumOrNull(formData.operadorId),
      maquinariaId: toNumOrNull(formData.maquinariaId),

      // el resto va encapsulado
      detalles,
    };
  }

  async createReport(formData) {
    // normaliza siempre
    const data = this.buildReportPayload(formData || {});
    if (!data.operadorId || !data.maquinariaId) {
      throw new Error("Debes especificar operadorId y maquinariaId.");
    }
    try {
      // logs útiles para depurar
      MachineryService.log("estacion (raw)", {
        estacion: formData?.estacion,
        estacionStr: formData?.estacionStr,
        estacionDesde: formData?.estacionDesde,
        estacionHasta: formData?.estacionHasta,
      });
      MachineryService.log("estacion (payload)", data.estacion);
      MachineryService.log("POST /machinery/report payload", data);

      const res = await apiClient.post("/machinery/report", data);
      return res.data;
    } catch (err) {
      MachineryService.log("createReport -> error", err?.response?.data || err);
      throw err;
    }
  }

  async getAllReports() {
    try {
      const res = await apiClient.get("/machinery/report");
      return res.data;
    } catch (err) {
      MachineryService.log("getAllReports -> error", err?.response?.data || err);
      throw err;
    }
  }

  async getReportsByOperatorAndDate({ operadorId, start, end }) {
    try {
      const params = { operadorId: String(operadorId), start, end };
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

  // ========= Maquinaria =========
  async getAllMachinery(filter = {}) {
    try {
      const params = {};
      if (filter.tipo) params.tipo = filter.tipo;
      if (filter.rol) params.rol = filter.rol;

      const res = await apiClient.get("/machinery", { params });
      const raw = Array.isArray(res.data) ? res.data : [];

      const norm = raw.map((m) => {
        const id = m.id ?? m.machineryId ?? m._id ?? null;
        const tipo = m.tipo ?? m.type ?? "";
        const placa = m.placa ?? m.plate ?? "";
        const esPropietaria = Boolean(m.esPropietaria);

        let roles = [];
        if (Array.isArray(m.roles)) {
          roles = m.roles
            .map((r) => (typeof r === "string" ? r : (r?.rol ?? r?.role)))
            .filter(Boolean);
        } else if (m.rol) {
          roles = [m.rol];
        }
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

  async getLastCounters(maquinariaId) {
    if (!maquinariaId) throw new Error("maquinariaId es requerido");
    try {
      const res = await apiClient.get(`/machinery/${maquinariaId}/last-counters`);
      return res.data || {};
    } catch (err) {
      MachineryService.log("getLastCounters -> error", err?.response?.data || err);
      throw err;
    }
  }

  // ========= Rental Reports =========
  async createRentalReport(formData) {
    try {
      const payload = {
        fecha: formData.fecha,
        tipoMaquinaria: formData.tipoMaquinaria,
        placa: formData.placa || null,
        actividad: formData.actividad,
        cantidad: formData.cantidad || null,
        horas: Number(formData.horas),
        estacion: formData.estacion || null,
        boleta: formData.boleta || null,
        fuente: formData.fuente || null,
        esAlquiler: true, // Flag to indicate this is a rental report
      };

      MachineryService.log("POST /machinery/rental-report payload", payload);
      const res = await apiClient.post("/machinery/rental-report", payload);
      return res.data;
    } catch (err) {
      MachineryService.log("createRentalReport -> error", err?.response?.data || err);
      throw err;
    }
  }


  async getReportsFiltered({ tipo, start, end } = {}) {
  try {
    const params = {};
    if (tipo) params.tipo = tipo;
    if (start) params.start = start; // 'YYYY-MM-DD'
    if (end) params.end = end;       // 'YYYY-MM-DD'
    const res = await apiClient.get('/machinery/report/search', { params });
    return res.data;
  } catch (err) {
    MachineryService.log('getReportsFiltered -> error', err?.response?.data || err);
    throw err;
  }
}

}

const machineryService = new MachineryService();
export default machineryService;
