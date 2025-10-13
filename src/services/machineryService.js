import apiClient from "../config/api";

/* ================= Helpers de estación ================= */
function normalizeEstacion(raw) {
  if (raw == null || raw === "") return null;
  let s = String(raw).trim();
  s = s.replace(/[^\d+]/g, ""); // deja solo dígitos y '+'
  const m = s.match(/^(\d+)\+(\d+)$/);
  if (m) return `${Number(m[1])}+${Number(m[2])}`;
  return null; // si no cumple el formato, que el backend lo valide
}

function coalesceEstacionFromPairs(fd) {
  const desde =
    fd?.estacionDesde ?? fd?.estacionDesdeStr ?? fd?.detalles?.estacionDesde;
  const hasta =
    fd?.estacionHasta ?? fd?.estacionHastaStr ?? fd?.detalles?.estacionHasta;
  if (desde != null && desde !== "" && hasta != null && hasta !== "") {
    return normalizeEstacion(`${desde}+${hasta}`);
  }
  return null;
}

/* ================= Service ================= */
class MachineryService {
  static log(tag, data) {
    // eslint-disable-next-line no-console
    console.log(`[machineryService] ${tag}:`, data);
  }

  // Convierte el form plano a lo que espera el backend
  // Convierte el form plano a lo que espera el backend
buildReportPayload(formData = {}) {
  const toNumOrNull = (v) => (v === "" || v == null ? null : Number(v));
  const dIn = (formData && typeof formData.detalles === "object") ? formData.detalles : {};
  const dCar = (dIn.carreta && typeof dIn.carreta === "object") ? dIn.carreta : {};
  const dCis = (dIn.cisterna && typeof dIn.cisterna === "object") ? dIn.cisterna : {};
  const dMat = (dIn.material && typeof dIn.material === "object") ? dIn.material : {};

  const detallesFromForm = {
    // comunes
    observaciones: formData.observaciones ?? dIn.observaciones ?? "",
    variante: formData.variant ?? formData.variante ?? dIn.variante ?? null,
    tipoMaquinaria: formData.tipoMaquinaria ?? dIn.tipoMaquinaria ?? null,
    placa: formData.placa ?? dIn.placa ?? null,

    // === MATERIAL === (plano o anidado en detalles/material)
    tipoMaterial: formData.tipoMaterial ?? formData.materialTipo ?? dIn.tipoMaterial ?? dMat.tipoMaterial ?? null,
    cantidadMaterial: toNumOrNull(
      formData.cantidadMaterial ?? formData.materialCantidad ?? dIn.cantidadMaterial ?? dMat.cantidad
    ),
    fuente:
      formData.fuente ??
      formData.fuenteAgua ??
      formData.origenAgua ??
      formData.rio ??
      dIn.fuente ?? dMat.fuente ?? null,
    subFuente:
      formData.subFuente ??
      formData.subFuenteAgua ??
      formData.subfuente ??
      dIn.subFuente ?? dMat.subFuente ?? null,
    boleta: formData.boleta ?? dIn.boleta ?? dMat.boleta ?? null,

    // === CISTERNA === (plano o anidado en detalles/cisterna)
    cantidadLiquido: toNumOrNull(
      formData.cantidadLiquido ??
      formData.cantidadAgua ??
      formData.cantidad_agua ??
      dIn.cantidadLiquido ?? dCis.cantidadLiquido ?? dCis.cantidad
    ),

    placaCisterna:
     formData.placaCisterna ??
     formData.cisternaPlaca ??
     formData.placa_cisterna ??
     dIn.placaCisterna ??
     dCis.placa ??
     null,
    // OJO: la "fuente" ya se está mapeando arriba (sirve para material/cisterna)

    // === CARRETA === (plano o anidado en detalles/carreta)
    placaCarreta:
      formData.placaCarreta ??
      formData.carretaPlaca ??
      formData.placa_carreta ??
      dIn.placaCarreta ?? dCar.placa ?? null,
    destino:
      formData.destino ??
      formData.destino_carga ??
      dIn.destino ?? dCar.destino ?? null,
    tipoCarga:
      formData.tipoCarga ??
      formData.tipo_carga ??
      dIn.tipoCarga ?? dCar.tipoCarga ?? null,

    // comunes extra
    placaMaquinariaLlevada: formData.placaMaquinariaLlevada ?? dIn.placaMaquinariaLlevada ?? null,
    horaInicio: formData.horaInicio ?? dIn.horaInicio ?? null,
    horaFin: formData.horaFin ?? dIn.horaFin ?? null,
  };

  // merge: preserva cualquier cosa que ya viniera en detalles
  const detalles = {
   ...dIn,
   ...Object.fromEntries(
     Object.entries(detallesFromForm).filter(([, v]) => v !== undefined && v !== "")
   ),
 };

  return {
    // ROOT
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

    estacion:
      normalizeEstacion(formData.estacion ?? formData.estacionStr) ??
      coalesceEstacionFromPairs(formData),

    operadorId: toNumOrNull(formData.operadorId),
    maquinariaId: toNumOrNull(formData.maquinariaId),

    detalles,
  };
}

  /* ============== Reports (Municipal) ============== */
async createReport(formData) {
  const data = this.buildReportPayload(formData);
  MachineryService.log("POST /machinery/report payload", data);
  const res = await apiClient.post("/machinery/report", data);
  return res.data;
}

  async updateReport(id, formData) {
    const data = this.buildReportPayload(formData);
    MachineryService.log("PATCH /machinery/report payload", data);
    const res = await apiClient.patch(`/machinery/report/${id}`, data);
    return res.data;
  }

  async getReportById(id) {
    const res = await apiClient.get(`/machinery/report/${id}`);
    return res.data;
  }

  async getAllReports() {
    const res = await apiClient.get("/machinery/report");
    return res.data;
  }

  async getReportsByOperatorAndDate({ operadorId, start, end }) {
    const params = { operadorId: String(operadorId), start, end };
    const res = await apiClient.get("/machinery/report/by-operator", { params });
    return res.data;
  }

  async getReportsByType(tipo) {
    const res = await apiClient.get("/machinery/report/by-type", {
      params: { tipo },
    });
    return res.data;
  }

  async getCisternaReports() {
    const res = await apiClient.get("/machinery/report/cisterna");
    return res.data;
  }

  async getReportsFiltered({ tipo, start, end } = {}) {
    const params = {};
    if (tipo) params.tipo = tipo;
    if (start) params.start = start;
    if (end) params.end = end;
    const res = await apiClient.get("/machinery/report/search", { params });
    return res.data;
  }

  async deleteReport(id, reason = "") {
    const res = await apiClient.delete(`/machinery/report/${id}`, {
      data: { reason },
    });
    return res.data;
  }

  async getDeletedMunicipal() {
    const res = await apiClient.get("/machinery/report/deleted");
    return res.data;
  }

  async restoreReport(id) {
    const res = await apiClient.patch(`/machinery/report/${id}/restore`);
    return res.data;
  }

  /* ============== Reports (Rental) ============== */
  async createRentalReport(formData) {
    const payload = {
      fecha: formData.fecha,
      operadorId: formData.operadorId,
      tipoMaquinaria: formData.tipoMaquinaria, // vagoneta/cabezal/...
      placa: formData.placa || null,
      actividad: formData.actividad || null,
      cantidad: formData.cantidad || null,
      horas: Number(formData.horas) || null,
      estacion: formData.estacion || null,
      
      // boletas según fuente:
      boleta:
        !["Ríos", "Tajo"].includes(formData.fuente) &&
        formData.fuente !== "KYLCSA"
          ? formData.boleta || null
          : null,
      boletaKylcsa:
        formData.fuente === "KYLCSA" ? formData.boletaKylcsa || null : null,
      fuente: formData.fuente || null,

      // espejo municipal en `detalles`
      detalles: {
        codigoCamino: formData.codigoCamino || null,
        distrito: formData.distrito || null,
        tipoMaterial: formData.tipoMaterial || null,
        cantidadMaterial: formData.cantidadMaterial
          ? Number(formData.cantidadMaterial)
          : null,

        destino: formData.destino || null,
        tipoCarga: formData.tipoCarga || null,
        placaCarreta: formData.placaCarreta || null,
        placaMaquinariaLlevada: formData.placaMaquinariaLlevada || null,

        horaInicio: formData.horaInicio || null,
        horaFin: formData.horaFin || null,
      },
    };

    MachineryService.log("POST /machinery/rental-report payload", payload);
    const res = await apiClient.post("/machinery/rental-report", payload);
    return res.data;
  }

  async updateRentalReport(id, dto) {
    const res = await apiClient.patch(`/machinery/rental-report/${id}`, dto);
    return res.data;
  }

  async getRentalReportById(id) {
    const res = await apiClient.get(`/machinery/rental-report/${id}`);
    return res.data;
  }

  async getAllRentalReports() {
    const res = await apiClient.get("/machinery/rental-report");
    return res.data;
  }

  async getRentalReportsFiltered({ tipo, start, end } = {}) {
    const params = {};
    if (tipo) params.tipo = tipo;
    if (start) params.start = start; // 'YYYY-MM-DD'
    if (end) params.end = end; // 'YYYY-MM-DD'
    const res = await apiClient.get("/machinery/rental-report/search", {
      params,
    });
    return res.data;
  }

  async deleteRentalReport(id, reason = "") {
    const res = await apiClient.delete(`/machinery/rental-report/${id}`, {
      data: { reason },
    });
    return res.data;
  }

  async getDeletedRental() {
    const res = await apiClient.get("/machinery/rental-report/deleted");
    return res.data;
  }

  async restoreRentalReport(id) {
    const res = await apiClient.patch(`/machinery/rental-report/${id}/restore`);
    return res.data;
  }

  /* ============== Maquinaria ============== */
  async getAllMachinery(filter = {}) {
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
          .map((r) => (typeof r === "string" ? r : r?.rol ?? r?.role))
          .filter(Boolean);
      } else if (m.rol) {
        roles = [m.rol];
      }
      roles = Array.from(new Set(roles.map((r) => String(r).toLowerCase())));
      return { id, tipo, placa, esPropietaria, roles };
    });

    return norm;
  }

  async createMachinery(dto) {
    const res = await apiClient.post("/machinery", dto);
    return res.data;
  }

  async getMachineryById(id) {
    const res = await apiClient.get(`/machinery/${id}`);
    return res.data;
  }

  async updateMachinery(id, dto) {
    const res = await apiClient.patch(`/machinery/${id}`, dto);
    return res.data;
  }

  async deleteMachinery(id) {
    const res = await apiClient.delete(`/machinery/${id}`);
    return res.data;
  }

  async getLastCounters(maquinariaId, codigoCamino) {
    if (!maquinariaId) throw new Error("maquinariaId es requerido");
    const res = await apiClient.get(`/machinery/${maquinariaId}/last-counters`, {
      params: codigoCamino ? { codigoCamino } : undefined,
    });
    return res.data || {};
  }
}

const machineryService = new MachineryService();
export default machineryService;
