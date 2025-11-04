"use client";

import { useState, useEffect, useMemo, useCallback } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import machineryService from "@/services/machineryService";
import operatorsService from "@/services/operatorsService";
import { machineryFields } from "@/utils/machinery-fields";
import { districts, materialTypes, activityTypes, cargoTypes, activityOptions, sourceOptions, rivers } from "@/utils/districts";
import sourceService from "@/services/sourceService";
import { useToast } from "@/hooks/use-toast";
import { useAuditLogger } from "@/hooks/useAuditLogger";
import HourAmPmPickerDialog from "@/features/transporte/components/HourAmPmPickerDialog";
import { confirmAction, showSuccess, showError, showLoading, closeLoading } from "@/utils/sweetAlert";
import { todayLocalISO, toISODateOnly } from "@/utils/date";
import trailersService from "@/services/trailersService";
import { Badge } from "@/components/ui/badge";


/* ====== Helpers de tiempo/horas (JS) ====== */
const minutesSinceMidnight = (hhmm = "") => {
  if (!hhmm) return null;
  const [HH, MM = "0"] = String(hhmm).split(":");
  const h = parseInt(HH, 10), m = parseInt(MM, 10);
  if (Number.isNaN(h) || Number.isNaN(m)) return null;
  return h * 60 + m;
};

// Diferencia en horas mismo día (clamp 0..18)
const computeWorkedHours = (startHHMM, endHHMM) => {
  const s = minutesSinceMidnight(startHHMM);
  const e = minutesSinceMidnight(endHHMM);
  if (s == null || e == null) return 0;
  if (e <= s) return 0;
  const minutes = e - s;
  const hours = Math.round((minutes / 60) * 100) / 100;
  return Math.min(18, Math.max(0, hours));
};

const splitOrdExt = (total) => {
  const ord = Math.min(total, 8);
  const ext = Math.max(0, total - ord);
  return { ord, ext };
};


const THIRTY_DAYS = 30 * 24 * 60 * 60 * 1000;

// Agrupa y suma m³ por tipo de material a partir de las boletas del formulario.
function getMaterialBreakdownFromForm(boletas = []) {
  const map = new Map();
  for (const b of boletas) {
    const mat = (b?.tipoMaterial || "").trim();
    const qtyRaw = b?.m3 ?? b?.cantidad ?? b?.metros3 ?? b?.volumen ?? 0;
    const qty = Number(qtyRaw);
    if (!mat || !Number.isFinite(qty) || qty <= 0) continue;
    map.set(mat, (map.get(mat) || 0) + qty);
  }
  return Object.fromEntries(map);
}

export default function CreateReportForm({
  onGoToCatalog,
  mode = "create",                 // "create" | "edit"
  reportId = null,                 // id cuando es edición
  initialValues = null,            // datos prellenados
  submitLabel,                     // texto del botón si quieres sobrescribir
  onCancel,                        // callback para cerrar modal
  onSaved,                         // callback tras guardar (refrescar tabla)
}) {

  const { toast } = useToast();
  const { logCreate } = useAuditLogger();

  // ====== ESTADO ======
  const [loading, setLoading] = useState(false);
  const [machineryList, setMachineryList] = useState([]);
  const [operatorsList, setOperatorsList] = useState([]);
  const [selectedMachineryType, setSelectedMachineryType] = useState("");
  const [selectedVariant, setSelectedVariant] = useState("");
  // Placas de carreta desde catálogo (cada item: { id, placa, tipoMaquinaria, categoria, materialTipo })
  const [trailerOptions, setTrailerOptions] = useState([]);

  // Catálogos dinámicos
  const [riosList, setRiosList] = useState([]);
  const [tajosList, setTajosList] = useState([]);

  const normKey = (s = "") =>
    String(s).toLowerCase().normalize("NFD").replace(/[\u0300-\u036f]/g, "").trim();

  const [lastCounters, setLastCounters] = useState({
    horimetro: null,
    kilometraje: null,
    estacionHasta: null,
    estacionUpdatedAt: null,
    estacionDesde: null,
    estacionAvance: null,
  });

  const TODAY = todayLocalISO(); // "YYYY-MM-DD" en zona local

  const INITIAL_FORM = {
    operadorId: "",
    maquinariaId: 0,
    fecha: todayLocalISO(),
    horasOrd: "",
    horasExt: "",
    diesel: "",
    actividades: "",
    tipoMaquinaria: "",
    variant: "",
    placa: "",
    distrito: "",                // (ya no se usa en material; quedará en boleta)
    codigoCamino: "",
    kilometraje: "",
    horimetro: "",
    tipoMaterial: "",
    cantidadMaterial: "",
    fuente: "",
    subFuente: "",
    boleta: "",
    cantidadLiquido: "",
    placaCisterna: "",
    placaCarreta: "",
    destino: "",
    tipoCarga: "",
    estacionDesde: "",
    estacionHasta: "",
    tipoActividad: "",
    horaInicio: "",
    horaFin: "",
    placaMaquinariaLlevada: "",
    totalCantidadMaterial: "",
    boletas: [
    { boleta: "", tipoMaterial: "", fuente: "", subFuente: "", m3: "", codigoCamino: "", distrito: "" },
  ],
    // Modo plataforma (SM 8803)
    materialesTransportados: [],
    materialesOtros: "",
  };
  const [formData, setFormData] = useState(INITIAL_FORM);

  // ====== DERIVADOS ======
  const isMaterialFlow = useMemo(() => {
    const t = (selectedMachineryType || "").toLowerCase();
    const v = (selectedVariant || "").toLowerCase();
    return ["cabezal", "vagoneta"].includes(t) && v === "material";
  }, [selectedMachineryType, selectedVariant]);

  const isFlatbedMaterial = useMemo(() => {
  const t = (selectedMachineryType || "").toLowerCase();
  const v = (selectedVariant || "").toLowerCase();
  if (t !== "cabezal" || v !== "material") return false;
  const match = trailerOptions.find((it) => it.placa === formData.placaCarreta);
  // 'plataforma' = materiales como cemento/blocks/etc.  'desecho' = arena/base/subbase/tierra...
  return match?.materialTipo === "plataforma";
}, [selectedMachineryType, selectedVariant, trailerOptions, formData.placaCarreta]);

  const isCisternaFlow = useMemo(() => {
  const t = (selectedMachineryType || "").toLowerCase();
  const v = (selectedVariant || "").toLowerCase();
  return t === "cisterna" || (["vagoneta", "cabezal"].includes(t) && v === "cisterna");
}, [selectedMachineryType, selectedVariant]);


  // ====== HELPERS ======
  const onlyDigitsMax = (v, max) => String(v || "").replace(/\D/g, "").slice(0, max);
  const rolesOf = (m) => {
    if (Array.isArray(m?.roles)) return m.roles.map((r) => String(r).toLowerCase());
    const legacy = m?.rol ?? m?.role;
    return legacy ? [String(legacy).toLowerCase()] : [];
  };

  const showBoletaField = useCallback(() => {
    const t = (selectedMachineryType || "").toLowerCase();
    const v = (selectedVariant || "").toLowerCase();
    return (t === "vagoneta" || t === "cabezal") && v === "material";
  }, [selectedMachineryType, selectedVariant]);

  // Mapea la selección a la query del catálogo de carretas
const computeTrailerQuery = useCallback(() => {
  const t = (selectedMachineryType || "").toLowerCase();   // vagoneta | cabezal
  const v = (selectedVariant || "").toLowerCase();         // material | carreta | cisterna ...

  if (t === "vagoneta" && v === "carreta") {
    return { tipoMaquinaria: "vagoneta", categoria: "carreta" };
  }
  if (t === "cabezal" && v === "carreta") {
    return { tipoMaquinaria: "cabezal", categoria: "carreta" };
  }
  if (t === "cabezal" && v === "material") {
    // Para material en cabezal traemos TODAS (desecho + plataforma). El flujo se decide por la placa elegida.
    return { tipoMaquinaria: "cabezal", categoria: "material" };
  }
  return null;
}, [selectedMachineryType, selectedVariant]);


  const getPlacaById = useCallback(
    (id) => {
      const m = machineryList.find((x) => String(x.id) === String(id));
      return m ? String(m.placa ?? m.plate ?? "") : "";
    },
    [machineryList]
  );

  const placasOptions = useMemo(() => {
    let list = Array.isArray(machineryList) ? machineryList : [];
    if (selectedMachineryType) {
      const t = selectedMachineryType.toLowerCase();
      list = list.filter((m) => String(m.tipo || "").toLowerCase() === t);
    }
    if (selectedVariant) {
      const v = selectedVariant.toLowerCase();
      list = list.filter((m) => rolesOf(m).includes(v));
    }
    return list
      .filter((m) => m.placa || m.plate)
      .map((m) => ({ id: String(m.id), placa: String(m.placa ?? m.plate) }));
  }, [machineryList, selectedMachineryType, selectedVariant]);

  const activityChoices = useMemo(() => {
    const t = (selectedMachineryType || "").toLowerCase();
    const v = (selectedVariant || "").toLowerCase();
    if (t && activityOptions[t]) {
      const byVariant = activityOptions[t][v];
      if (byVariant && byVariant.length) return byVariant;
      const def = activityOptions[t].default;
      if (def && def.length) return def;
    }
    return activityTypes;
  }, [selectedMachineryType, selectedVariant]);

const getFuenteOptions = useCallback(() => {
  // Para cisterna, la fuente siempre es la lista fija de ríos (donde se toma el agua)
  if (isCisternaFlow) return rivers;

  // Para el resto, usa tu mapeo por tipo/variante
  const t = String(selectedMachineryType || "").toLowerCase();
  const v = String(selectedVariant || "").toLowerCase();
  const entry = sourceOptions[t];
  if (Array.isArray(entry)) return entry;        // p.ej. t === "cisterna" -> rivers
  if (entry && Array.isArray(entry[v])) return entry[v]; // p.ej. vagoneta/cabezal + material/cisterna
  return sourceOptions.default;
}, [isCisternaFlow, rivers, selectedMachineryType, selectedVariant]);

  // Totales desde boletas (solo cuando hay boletas)
  const materialBreakdown = useMemo(
    () => getMaterialBreakdownFromForm(formData.boletas || []),
    [formData.boletas]
  );
  const totalFromBoletas = useMemo(
    () => Object.values(materialBreakdown).reduce((a, b) => a + b, 0),
    [materialBreakdown]
  );

  // ====== EFECTOS ======
  useEffect(() => {
    (async () => {
      try {
        const list = await machineryService.getAllMachinery();
        setMachineryList(Array.isArray(list) ? list : []);
      } catch (e) {
        console.error("[CreateReportForm] getAllMachinery error:", e);
        toast({
          title: "No se pudieron cargar las maquinarias",
          description: "Verifica tu conexión.",
          variant: "destructive",
        });
      }
    })();
  }, [toast]);

  useEffect(() => {
    (async () => {
      try {
        const operators = await operatorsService.getAllOperators();
        setOperatorsList(Array.isArray(operators) ? operators : []);
      } catch (e) {
        console.error("[CreateReportForm] getAllOperators error:", e);
        toast({
          title: "No se pudieron cargar los operadores",
          description: "Verifica tu conexión.",
          variant: "destructive",
        });
      }
    })();
  }, [toast]);

  // limpiar fuente si ya no es válida para el tipo/variante
  useEffect(() => {
    const opts = getFuenteOptions();
    if (formData.fuente && !opts.includes(formData.fuente)) {
      setFormData((p) => ({ ...p, fuente: "", subFuente: "" }));
    }
  }, [getFuenteOptions, formData.fuente]);

  // Prefetch catálogos
  useEffect(() => {
    (async () => {
      try {
        const [{ items: rios }, { items: tajos }] = await Promise.all([
          sourceService.list({ tipo: "rio", take: 500 }),
          sourceService.list({ tipo: "tajo", take: 500 }),
        ]);
        setRiosList((rios || []).map((x) => x.nombre));
        setTajosList((tajos || []).map((x) => x.nombre));
      } catch (e) {
        console.error("[CreateReportForm] load sources:", e);
      }
    })();
  }, []);

  // Autollenar Total m³ del día (solo cuando hay boletas visibles)
  useEffect(() => {
    if (!(isMaterialFlow && !isFlatbedMaterial)) return;
    const next = totalFromBoletas ? String(totalFromBoletas) : "";
    setFormData(p => (p.totalCantidadMaterial === next ? p : { ...p, totalCantidadMaterial: next }));
  }, [isMaterialFlow, isFlatbedMaterial, totalFromBoletas]);

  // Horas automáticas + viáticos dependientes del horario
  useEffect(() => {
    if (!formData.horaInicio || !formData.horaFin) {
      setFormData((p) => ({ ...p, horasOrd: "", horasExt: "" }));
      return;
    }
    const total = computeWorkedHours(formData.horaInicio, formData.horaFin);
    const parts = splitOrdExt(total);
    setFormData((p) => ({ ...p, horasOrd: total ? parts.ord : "", horasExt: total ? parts.ext : "" }));
  }, [formData.horaInicio, formData.horaFin]);


    // Precargar cuando modo edición
  useEffect(() => {
    if (!initialValues) return;
    // Merge con tus defaults
    setFormData((p) => ({ ...p, ...initialValues }));
    // Setear selects derivados
    if (initialValues.tipoMaquinaria) {
      setSelectedMachineryType(String(initialValues.tipoMaquinaria));
    }
    if (initialValues.variant) {
      setSelectedVariant(String(initialValues.variant));
    }
  }, [initialValues]);


  useEffect(() => {
  (async () => {
    const q = computeTrailerQuery();
    if (!q) {
      setTrailerOptions([]);
      // limpiar placa carreta si ya no aplica
      setFormData((p) => (p.placaCarreta ? { ...p, placaCarreta: "" } : p));
      return;
    }
    try {
      const data = await trailersService.list(q);      // espera { items, total } o [] (según tu service)
      const items = Array.isArray(data?.items) ? data.items : (Array.isArray(data) ? data : []);
      setTrailerOptions(items);                        // cada item debería traer al menos { placa, materialTipo? }

      setFormData((p) => {
        // si la seleccionada ya no existe, escoger la primera
        const exists = items.some((it) => it.placa === p.placaCarreta);
        if (!items.length) {
          return p.placaCarreta ? { ...p, placaCarreta: "" } : p;
        }
        if (!exists) {
          return { ...p, placaCarreta: items[0].placa };
        }
        return p;
      });
    } catch (e) {
      console.error("[CreateReportForm] trailersService.list error:", e);
      setTrailerOptions([]);
      setFormData((p) => (p.placaCarreta ? { ...p, placaCarreta: "" } : p));
    }
  })();
}, [computeTrailerQuery]);


  // ====== BOLETAS HELPERS ======
  const addBoleta = () => {
  setFormData((p) => ({
    ...p,
    boletas: [
      ...(p.boletas || []),
      { boleta: "", tipoMaterial: "", fuente: "", subFuente: "", m3: "", codigoCamino: "", distrito: "" },
    ],
  }));
};

 const removeBoleta = (idx) => {
  setFormData((p) => {
    const next = [...(p.boletas || [])];
    next.splice(idx, 1);
    return {
      ...p,
      boletas: next.length
        ? next
        : [{ boleta: "", tipoMaterial: "", fuente: "", subFuente: "", m3: "", codigoCamino: "", distrito: "" }],
    };
  });
};

const updateBoleta = (idx, patch) => {
  setFormData((p) => {
    const next = [...(p.boletas || [])];
    const cur =
      next[idx] ||
      { boleta: "", tipoMaterial: "", fuente: "", subFuente: "", m3: "", codigoCamino: "", distrito: "" };
    next[idx] = { ...cur, ...patch };
    return { ...p, boletas: next };
  });
};

  // ====== RENDER DE CADA BOLETA (orden solicitado) ======
  const renderBoletaCard = (b, idx) => {
    const isRio = b.fuente === "Ríos";
    const isTajo = b.fuente === "Tajo";

    return (
      <div key={idx} className="border rounded-xl p-3 space-y-3 bg-white">
        <div className="flex items-center justify-between">
          <div className="text-sm font-medium">Boleta #{idx + 1}</div>
          <Button type="button" variant="secondary" onClick={() => removeBoleta(idx)}>
            Eliminar
          </Button>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
          {/* 1) Tipo de material */}
          <div>
            <Label>Tipo de material</Label>
            <Select value={b.tipoMaterial || ""} onValueChange={(v) => updateBoleta(idx, { tipoMaterial: v })}>
              <SelectTrigger><SelectValue placeholder="Seleccionar material" /></SelectTrigger>
              <SelectContent>
                {materialTypes.map((m) => (<SelectItem key={m} value={m}>{m}</SelectItem>))}
              </SelectContent>
            </Select>
          </div>

          {/* 2) Fuente */}
          <div>
            <Label>Fuente</Label>
            <Select
              value={b.fuente || ""}
              onValueChange={(v) =>
                updateBoleta(idx, {
                  fuente: v,
                  subFuente: "",
                  boleta: v === "Ríos" || v === "Tajo" ? "" : (b.boleta || ""),
                })
              }
            >
              <SelectTrigger><SelectValue placeholder="Seleccionar fuente" /></SelectTrigger>
              <SelectContent>
                {(getFuenteOptions() || ["Palo de Arco", "Ríos", "Tajo"]).map((f) => (
                  <SelectItem key={f} value={f}>{f}</SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          {/* Sub-fuente si aplica */}
          {(isRio || isTajo) && (
            <div className="md:col-span-2">
              <Label>{isRio ? "Río" : "Tajo"}</Label>
              <Select value={b.subFuente || ""} onValueChange={(v) => updateBoleta(idx, { subFuente: v })}>
                <SelectTrigger><SelectValue placeholder={`Seleccionar ${isRio ? "río" : "tajo"}`} /></SelectTrigger>
                <SelectContent>
                  {(isRio ? riosList : tajosList).map((name) => (<SelectItem key={name} value={name}>{name}</SelectItem>))}
                </SelectContent>
              </Select>
              <button type="button" className="mt-1 text-sm text-blue-600 underline" onClick={onGoToCatalog}>
                Administrar {isRio ? "ríos" : "tajos"} en Catálogo
              </button>
            </div>
          )}

          {/* 3) Boleta */}
          <div>
            <Label>Boleta (6 dígitos)</Label>
            <Input
              inputMode="numeric"
              pattern="\d{6}"
              maxLength={6}
              placeholder="000000"
              value={b.boleta || ""}
              onChange={(e) => updateBoleta(idx, { boleta: (e.target.value || "").replace(/\D/g, "").slice(0, 6) })}
            />
          </div>

          {/* 4) m³ del viaje */}
          <div>
            <Label>m³ del viaje</Label>
            <Input
              inputMode="numeric"
              pattern="\d*"
              maxLength={4}
              placeholder="00"
              value={b.m3 || ""}
              onChange={(e) => updateBoleta(idx, { m3: (e.target.value || "").replace(/\D/g, "").slice(0, 4) })}
            />
          </div>

          {/* 5) Distrito (nuevo, por boleta) */}
          <div>
            <Label>Distrito</Label>
            <Select value={b.distrito || ""} onValueChange={(v) => updateBoleta(idx, { distrito: v })}>
              <SelectTrigger><SelectValue placeholder="Seleccionar distrito" /></SelectTrigger>
              <SelectContent>
                {districts.map((d) => (<SelectItem key={d} value={d}>{d}</SelectItem>))}
              </SelectContent>
            </Select>
          </div>

          {/* 6) Código Camino */}
          <div>
            <Label>Código Camino (3 dígitos)</Label>
            <Input
              inputMode="numeric"
              pattern="\d{3}"
              maxLength={3}
              placeholder="000"
              value={b.codigoCamino || ""}
              onChange={(e) => updateBoleta(idx, { codigoCamino: (e.target.value || "").replace(/\D/g, "").slice(0, 3) })}
            />
          </div>
        </div>
      </div>
    );
  };

  // ====== HANDLERS ======
  const handleInputChange = async (e) => {
    const { name, value } = e.target;

    if (name === "fecha") {
    const v = toISODateOnly(value || "");
    const today = TODAY;
    setFormData((p) => ({ ...p, fecha: v && v > today ? today : v }));
    return;
  }

    if (name === "codigoCamino") {
      const codigo = onlyDigitsMax(value, 3);
      setFormData((p) => ({ ...p, codigoCamino: codigo }));

      // Solo aplica a maquinarias con Estación
      if (formData.maquinariaId && requiresField("Estacion")) {
        try {
          const c = await machineryService.getLastCounters(formData.maquinariaId, codigo);
          setLastCounters({
            horimetro: c?.horimetro ?? null,
            kilometraje: c?.kilometraje ?? null,
            estacionHasta: c?.estacionHasta ?? null,
            estacionUpdatedAt: c?.estacionUpdatedAt ?? null,
            estacionDesde: c?.estacionDesde ?? null,
            estacionAvance: c?.estacionAvance ?? null,
          });
          const isStale = c?.estacionUpdatedAt && Date.now() - new Date(c.estacionUpdatedAt).getTime() > THIRTY_DAYS;
          setFormData((p) => ({
            ...p,
            estacionDesde: c?.estacionHasta != null ? (isStale ? "0" : String(c.estacionHasta)) : p.estacionDesde,
          }));
        } catch {}
      }
      return;
    }

    if (name === "kilometraje") return setFormData((p) => ({ ...p, kilometraje: onlyDigitsMax(value, 6) }));
    if (name === "cantidadMaterial") return setFormData((p) => ({ ...p, cantidadMaterial: onlyDigitsMax(value, 2) }));
    if (name === "combustible") return setFormData((p) => ({ ...p, combustible: onlyDigitsMax(value, 2) }));
    if (name === "boleta") return setFormData((p) => ({ ...p, boleta: onlyDigitsMax(value, 6) }));
    if (name === "horimetro") return setFormData((p) => ({ ...p, horimetro: onlyDigitsMax(value, 5) }));
    if (name === "estacionDesde" || name === "estacionHasta") return setFormData((p) => ({ ...p, [name]: onlyDigitsMax(value, 6) }));
    if (name === "cantidadLiquido") return setFormData((p) => ({ ...p, cantidadLiquido: onlyDigitsMax(value, 4) }));

    setFormData((p) => ({ ...p, [name]: value }));
  };

  const handleSelectChange = async (name, value) => {
    setFormData((prev) => ({ ...prev, [name]: value }));

    const clearVariantSpecific = (p = {}) => ({
      ...p,
      tipoMaterial: "",
      cantidadMaterial: "",
      fuente: "",
      subFuente: "",
      boleta: "",
      cantidadLiquido: "",
      placaCarreta: "",
      tipoCarga: "",
      destino: "",
      estacionDesde: "",
      estacionHasta: "",
      placaMaquinariaLlevada: "",
      // limpiar modo plataforma
      materialesTransportados: [],
      materialesOtros: "",
      // limpiar boletas
      boletas: [{ boleta: "", tipoMaterial: "", fuente: "", subFuente: "", m3: "", distrito: "", codigoCamino: "" }],
    });

    if (name === "tipoMaquinaria") {
      setSelectedMachineryType(value);
      setSelectedVariant("");
      setFormData((prev) => clearVariantSpecific({ ...prev, placa: "", maquinariaId: 0, tipoActividad: "" }));
      setLastCounters({ horimetro: null, kilometraje: null, estacionHasta: null, estacionUpdatedAt: null });
      setFormData((p) => (requiresField("Estacion") ? p : { ...p, estacionDesde: "", estacionHasta: "" }));
      return;
    }

    if (name === "variant") {
      setSelectedVariant(value);
      setFormData((prev) => clearVariantSpecific({ ...prev, variant: value, placa: "", maquinariaId: 0, tipoActividad: "" }));
      setLastCounters({ horimetro: null, kilometraje: null, estacionHasta: null, estacionUpdatedAt: null });
      setFormData((p) => (requiresField("Estacion") ? p : { ...p, estacionDesde: "", estacionHasta: "" }));
      return;
    }

    if (name === "placaId") {
      const id = Number(value);
      setFormData((prev) => ({ ...prev, maquinariaId: id, placa: getPlacaById(id) }));

      try {
        const caminoArg = requiresField("Estacion") ? (formData.codigoCamino || undefined) : undefined;
        const c = await machineryService.getLastCounters(id, caminoArg);

        setLastCounters({
          horimetro: c?.horimetro ?? null,
          kilometraje: c?.kilometraje ?? null,
          estacionHasta: c?.estacionHasta ?? null,
          estacionUpdatedAt: c?.estacionUpdatedAt ?? null,
          estacionDesde: c?.estacionDesde ?? null,
          estacionAvance: c?.estacionAvance ?? null,
        });

        const isStale = c?.estacionUpdatedAt && Date.now() - new Date(c.estacionUpdatedAt).getTime() > THIRTY_DAYS;

        setFormData((p) => ({
          ...p,
          estacionDesde:
            requiresField("Estacion") && c?.estacionHasta != null ? (isStale ? "0" : String(c.estacionHasta)) : (p.estacionDesde || ""),
          horimetro: p.horimetro ?? "",
        }));
      } catch (e) {
        setLastCounters({
          horimetro: null, kilometraje: null, estacionHasta: null, estacionUpdatedAt: null, estacionDesde: null, estacionAvance: null,
        });
      }
      return;
    }
  };

  const TYPES_WITH_ROAD = new Set([
  "vagoneta","cabezal","cisterna","niveladora","compactadora","excavadora","backhoe","cargador"
]);

function enforceDistrictThenRoadOrder(fields, t) {
  const hasDistrict = fields.some(f => normKey(f) === "distrito");
  const hasRoad    = fields.some(f => normKey(f) === "codigo camino");

  // si falta y el tipo lo requiere, los agregamos
  if (!hasDistrict) fields.push("Distrito");
  if (TYPES_WITH_ROAD.has(t) && !hasRoad) fields.push("Código Camino");

  // reordenar relativo: primero distrito, luego código
  const rest = fields.filter(f => {
    const k = normKey(f);
    return k !== "distrito" && k !== "codigo camino";
  });
  const ordered = [...rest, "Distrito", "Código Camino"];
  // quitar duplicados por si ya estaban
  const seen = new Set();
  return ordered.filter(f => {
    const k = normKey(f);
    if (seen.has(k)) return false;
    seen.add(k);
    return true;
  });
}

function getDynamicFields() {
  if (!selectedMachineryType) return [];
  const mach = machineryFields[selectedMachineryType];
  if (!mach) return [];

  let fields = [];
  if (mach.variantes && selectedVariant) fields = [...(mach.variantes[selectedVariant] || [])];
  else fields = [...(mach.campos || [])];

  const t = (selectedMachineryType || "").toLowerCase();
  const v = (selectedVariant || "").toLowerCase();
  const matFlow = (t === "vagoneta" || t === "cabezal") && v === "material";

  // ---- Flujo MATERIAL (vagoneta/cabezal + variante material) ----
  if (matFlow) {
    fields = fields.filter((f) => {
      const k = normKey(f);

      // Siempre los maneja "Boletas" o no deben ir aquí
      if (k === "boleta" || k === "cantidad material" || k === "tipo material" || k === "fuente") {
        return false;
      }

      // En material NORMAL (NO SM 8803) distrito y código camino viven en Boletas -> quitarlos
      if (!isFlatbedMaterial && (k === "distrito" || k === "codigo camino")) {
        return false;
      }

      // En plana SM 8803 sí queremos conservar Distrito y Código Camino en Campos Específicos
      return true;
    });

    // En SM 8803 forzar que existan ambos campos en Campos Específicos
    if (isFlatbedMaterial) {
      if (!fields.some((f) => normKey(f) === "distrito")) fields.push("Distrito");
      if (!fields.some((f) => normKey(f) === "codigo camino")) fields.push("Código Camino");
    }
  }

  // ---- Limpieza de campos que no deben renderizarse aquí ----
  fields = fields.filter((f) => {
    const k = normKey(f);
    if (k === "hora inicio" || k === "hora fin") return false; // horas se renderizan arriba

    // En material NORMAL (no 8803) ocultar estos de Campos Específicos (van en Boletas)
    if (matFlow && !isFlatbedMaterial && (k === "distrito" || k === "codigo camino" || k === "fuente")) {
      return false;
    }

    // En SM 8803 igual ocultamos "fuente" aquí
    if (matFlow && isFlatbedMaterial && k === "fuente") return false;

    return true;
  });

  // ---- Quitar placas hoisteadas en vagoneta/cabezal ----
  const hoist = t === "vagoneta" || t === "cabezal";
  if (hoist) {
    fields = fields.filter((f) => {
      const k = normKey(f);
      if (k === "placa maquinaria llevada") return false;
      if (k.includes("placa") && (k.includes("carreta") || k.includes("cisterna"))) return false;
      return true;
    });
  }

  if (!hoist && v === "carreta" && !fields.some((f) => normKey(f) === "placa maquinaria llevada")) {
    fields.push("Placa maquinaria llevada");
  }

  // Deduplicación
  const seen = new Set();
  fields = fields.filter((f) => {
    const k = normKey(f);
    if (seen.has(k)) return false;
    seen.add(k);
    return true;
  });

  // Forzar orden "Distrito" -> "Código Camino" sólo cuando se renderizan en Campos Específicos
  if (!matFlow || isFlatbedMaterial) {
    fields = enforceDistrictThenRoadOrder(fields, t);
  }

  return fields;
}

  const requiresField = (name) => getDynamicFields().some((f) => normKey(f) === normKey(name));

  const renderDynamicField = (fieldName) => {
    const key = normKey(fieldName);
    switch (key) {
      case "distrito":
        // En material normal (vagoneta/cabezal+material) va dentro de Boletas,
       // pero en plataforma SM 8803 SÍ debe mostrarse en Campos Específicos.
      if (isMaterialFlow && !isFlatbedMaterial) return null;
        return (
          <div className="space-y-2" key={fieldName}>
            <Label>Distrito</Label>
            <Select onValueChange={(value) => handleSelectChange("distrito", value)} value={formData.distrito || ""}>
              <SelectTrigger><SelectValue placeholder="Seleccionar distrito" /></SelectTrigger>
              <SelectContent>
                {districts.map((d) => (<SelectItem key={d} value={d}>{d}</SelectItem>))}
              </SelectContent>
            </Select>
          </div>
        );

      case "destino":
        return (
          <div className="space-y-2" key={fieldName}>
            <Label htmlFor="destino">Destino</Label>
            <Input id="destino" name="destino" placeholder="Punto de descarga / obra"
              value={formData.destino || ""} onChange={handleInputChange} />
          </div>
        );

      case "cantidad liquido":
        return (
          <div className="space-y-2" key={fieldName}>
            <Label htmlFor="cantidadLiquido">Cantidad (L)</Label>
            <div className="flex gap-2 items-center">
              <Input id="cantidadLiquido" name="cantidadLiquido" inputMode="numeric" pattern="\d*"
                placeholder="0000" maxLength={4} value={formData.cantidadLiquido ?? ""} onChange={handleInputChange} />
              <span className="text-sm text-muted-foreground">L</span>
            </div>
          </div>
        );

      case "litros diesel":
        return (
          <div className="space-y-2" key={fieldName}>
            <Label htmlFor="combustible">Litros diésel</Label>
            <Input id="combustible" name="combustible" inputMode="numeric" pattern="\d*"
              maxLength={2} placeholder="00" value={formData.combustible ?? ""} onChange={handleInputChange} />
            <p className="text-xs text-muted-foreground">Máximo 2 dígitos (0–99)</p>
          </div>
        );

      case "boleta":
        if (!showBoletaField()) return null;
        return (
          <div className="space-y-2" key={fieldName}>
            <Label htmlFor="boleta">Boleta (6 dígitos)</Label>
            <Input id="boleta" name="boleta" inputMode="numeric" pattern="\d{6}" maxLength={6}
              placeholder="000000" value={formData.boleta ?? ""} onChange={handleInputChange} />
          </div>
        );

      case "horimetro":
        return (
          <div className="space-y-2" key={fieldName}>
            <Label htmlFor="horimetro">
              Horímetro{" "}
              {lastCounters.horimetro !== null && (
                <span className="text-xs text-muted-foreground">(último: {lastCounters.horimetro})</span>
              )}
            </Label>
            <Input id="horimetro" name="horimetro" inputMode="numeric" pattern="\d*" maxLength={5}
              placeholder="00000" value={formData.horimetro ?? ""} onChange={handleInputChange} />
            <p className="text-xs text-muted-foreground">Máximo 5 dígitos, no menor al último valor.</p>
          </div>
        );

      case "kilometraje":
        return (
          <div className="space-y-2" key={fieldName}>
            <Label htmlFor="kilometraje">
              Kilometraje{" "}
              {lastCounters.kilometraje !== null && (
                <span className="text-xs text-muted-foreground">(último: {lastCounters.kilometraje})</span>
              )}
            </Label>
            <Input id="kilometraje" name="kilometraje" inputMode="numeric" pattern="\d*" maxLength={6}
              placeholder="000000" value={formData.kilometraje ?? ""} onChange={handleInputChange} />
            <p className="text-xs text-muted-foreground">Máximo 6 dígitos, no menor al último valor.</p>
          </div>
        );

      case "estacion": {
        if (!requiresField("Estacion")) return null;

        const ultimoHasta = lastCounters.estacionHasta;
        const ultimoDesde = lastCounters.estacionDesde ?? null;
        const ultimoAvance =
          lastCounters.estacionAvance ??
          (Number.isFinite(ultimoHasta) && Number.isFinite(ultimoDesde)
            ? Math.max(0, Number(ultimoHasta) - Number(ultimoDesde))
            : null);

        return (
          <div className="space-y-2" key={fieldName}>
            <Label>
              Estación{" "}
              {Number.isFinite(ultimoHasta) && (
                <span className="text-xs text-muted-foreground">
                  (último hasta: {ultimoHasta}{Number.isFinite(ultimoAvance) ? `, avance: ${ultimoAvance} m` : ""})
                </span>
              )}
            </Label>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-2">
              <Input name="estacionDesde" inputMode="numeric" pattern="\d*" maxLength={6}
                placeholder="Desde (m)" value={formData.estacionDesde} onChange={handleInputChange} />
              <Input name="estacionHasta" inputMode="numeric" pattern="\d*" maxLength={6}
                placeholder="Hasta (m)" value={formData.estacionHasta} onChange={handleInputChange} />
              <div className="flex items-center text-sm text-muted-foreground">
                Avance:&nbsp;
                {formData.estacionDesde && formData.estacionHasta
                  ? Math.max(0, Number(formData.estacionHasta) - Number(formData.estacionDesde))
                  : 0}{" "}
                m
              </div>
            </div>

            {ultimoHasta !== null && (
              <p className="text-xs text-muted-foreground">Continuidad: el “Desde” de hoy debe ser ≥ {ultimoHasta}.</p>
            )}
          </div>
        );
      }

      case "codigo camino":
        // Mostrarlo si NO es flujo material, o si es plataforma SM 8803
        if (isMaterialFlow && !isFlatbedMaterial) return null;
        return (
          <div className="space-y-2" key={fieldName}>
            <Label>Código Camino (3 dígitos)</Label>
            <Input id="codigoCamino" name="codigoCamino" value={formData.codigoCamino}
              onChange={handleInputChange} placeholder="000" maxLength={3} />
          </div>
        );

      case "tipo material":
        if (isMaterialFlow) return null;
        return (
          <div className="space-y-2" key={fieldName}>
            <Label>Tipo de Material</Label>
            <Select onValueChange={(value) => handleSelectChange("tipoMaterial", value)} value={formData.tipoMaterial || ""}>
              <SelectTrigger><SelectValue placeholder="Seleccionar material" /></SelectTrigger>
              <SelectContent>
                {materialTypes.map((m) => (<SelectItem key={m} value={m}>{m}</SelectItem>))}
              </SelectContent>
            </Select>
          </div>
        );

      case "tipo actividad":
        return (
          <div className="space-y-2" key={fieldName}>
            <Label>Tipo de Actividad</Label>
            <Select onValueChange={(value) => handleSelectChange("tipoActividad", value)}
              value={formData.tipoActividad || ""} disabled={!selectedMachineryType}>
              <SelectTrigger><SelectValue placeholder="Seleccionar actividad" /></SelectTrigger>
              <SelectContent>
                {activityChoices.map((act) => (<SelectItem key={act} value={act}>{act}</SelectItem>))}
              </SelectContent>
            </Select>
          </div>
        );

      case "tipo carga":
        return (
          <div className="space-y-2" key={fieldName}>
            <Label>Tipo de Carga</Label>
            <Select onValueChange={(value) => handleSelectChange("tipoCarga", value)} value={formData.tipoCarga || ""}>
              <SelectTrigger><SelectValue placeholder="Seleccionar carga" /></SelectTrigger>
              <SelectContent>
                {cargoTypes.map((c) => (<SelectItem key={c} value={c}>{c}</SelectItem>))}
              </SelectContent>
            </Select>
          </div>
        );

      case "fuente": {
       // En flujo material (vagoneta/cabezal+material) se oculta de Campos Específicos;
      // para cisterna sí se muestra y usa la lista 'rivers'
  if (isMaterialFlow && !isFlatbedMaterial) return null;
  const opciones = getFuenteOptions();
  return (
    <div className="space-y-2" key={fieldName}>
      <Label>Fuente</Label>
      <Select
        value={formData.fuente || ""}
        onValueChange={(value) => handleSelectChange("fuente", value)}
      >
       
          <SelectTrigger><SelectValue placeholder="Seleccionar fuente" /></SelectTrigger>
        
        <SelectContent>
          {(opciones || []).map((opt) => (
            <SelectItem key={opt} value={opt}>{opt}</SelectItem>
          ))}
        </SelectContent>
      </Select>
    </div>
  );
}

      default:
        return (
          <div className="space-y-2" key={fieldName}>
            <Label>{fieldName}</Label>
            <Input onChange={handleInputChange} name={normKey(fieldName).replace(/\s+/g, "")} />
          </div>
        );
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (loading) return;

    if (!formData.operadorId) { await showError("Operador requerido", "Debe seleccionar un operador."); return; }
    if (!formData.maquinariaId) { await showError("Placa requerida", "Debe seleccionar una placa de maquinaria."); return; }

    // Dentro de handleSubmit, después de validar operador/maquinaria:
const tSel = (selectedMachineryType || "").toLowerCase();
const vSel = (selectedVariant || "").toLowerCase();
const needsTrailer =
  (tSel === "vagoneta" && vSel === "carreta") ||
  (tSel === "cabezal" && (vSel === "carreta" || vSel === "material"));

if (needsTrailer && !formData.placaCarreta) {
  await showError("Placa de carreta requerida", "Seleccione una placa de carreta.");
  return;
}

    // Validaciones específicas
    if (isMaterialFlow && !isFlatbedMaterial) {
      for (const [i, b] of (formData.boletas || []).entries()) {
        if (!/^\d{3}$/.test(String(b.codigoCamino || ""))) {
          await showError(`Boleta #${i + 1}: Código de camino`, "Ingrese exactamente 3 dígitos."); return;
        }
      }
    }

    const selectedOperator = operatorsList.find((op) => op.id === Number(formData.operadorId));
    const operatorName = selectedOperator ? `${selectedOperator.name} ${selectedOperator.last}` : `ID: ${formData.operadorId}`;

    const res = await confirmAction(
      mode === "edit" ? "¿Guardar cambios del reporte?" : "¿Crear reporte?",
      "",
      {
      html: `<div style="text-align:left">
        <div><b>Operador:</b> ${operatorName || "—"}</div>
        <div><b>Tipo:</b> ${selectedMachineryType || formData.tipoMaquinaria || "—"}</div>
        <div><b>Placa:</b> ${formData.placa || "—"}</div>
      </div>`,
      confirmButtonText: "Guardar",
      cancelButtonText: "Revisar",
    });
    if (!res.isConfirmed) return;

    setLoading(true);
    showLoading("Guardando...", "Por favor, espere");

    try {
      if (requiresField("Horimetro") && lastCounters.horimetro != null) {
        if (Number(formData.horimetro) < Number(lastCounters.horimetro)) {
          closeLoading(); await showError("Horímetro inválido", "Debe ser igual o mayor al último."); setLoading(false); return;
        }
      }
      if (requiresField("Kilometraje") && lastCounters.kilometraje != null) {
        if (Number(formData.kilometraje) < Number(lastCounters.kilometraje)) {
          closeLoading(); await showError("Kilometraje inválido", "Debe ser igual o mayor al último."); setLoading(false); return;
        }
      }

      if (requiresField("Estacion")) {
        const d = Number(formData.estacionDesde || 0);
        const h = Number(formData.estacionHasta || 0);
        if (Number.isFinite(d) && Number.isFinite(h) && h < d) {
          closeLoading(); await showError("Estación inválida", "'Hasta' no puede ser menor que 'Desde'."); setLoading(false); return;
        }
        if (lastCounters.estacionHasta != null) {
          const stale = lastCounters.estacionUpdatedAt && Date.now() - new Date(lastCounters.estacionUpdatedAt).getTime() > THIRTY_DAYS;
          if (stale && d !== Number(lastCounters.estacionHasta)) {
            closeLoading(); await showError("Continuidad requerida", `Debe iniciar en ${lastCounters.estacionHasta} m (último avance en este camino).`);
            setLoading(false); return;
          }
          if (!stale && d < Number(lastCounters.estacionHasta)) {
            closeLoading(); await showError("Continuidad requerida", `El 'Desde' debe ser ≥ ${lastCounters.estacionHasta} m.`);
            setLoading(false); return;
          }
        }
      }

      if (isMaterialFlow && !isFlatbedMaterial) {
        const totalM3 = Number(formData.totalCantidadMaterial || 0);
        if (!(Number.isFinite(totalM3) && totalM3 > 0)) {
          closeLoading(); await showError("Total m³ requerido", "Ingrese el total de material del día (> 0).");
          setLoading(false); return;
        }

        for (const [i, b] of (formData.boletas || []).entries()) {
          const isRiverOrTajo = b.fuente === "Ríos" || b.fuente === "Tajo";
          if (isRiverOrTajo && !b.subFuente) {
            closeLoading(); await showError(`Seleccione el ${b.fuente === "Ríos" ? "Río" : "Tajo"} en boleta #${i + 1}`, "Elija la sub-fuente.");
            setLoading(false); return;
          }
          if (!(b.tipoMaterial && Number(b.m3) > 0)) {
            closeLoading(); await showError(`Boleta #${i + 1} incompleta`, "Debe seleccionar el tipo de material e ingresar m³ del viaje (> 0).");
            setLoading(false); return;
          }
          const sumBoletas = (formData.boletas || []).map(b => Number(b.m3) || 0).reduce((a, b) => a + b, 0);
          if (sumBoletas !== totalM3) {
            closeLoading(); await showError("Total inconsistente", `La suma de boletas (${sumBoletas} m³) no coincide con el Total m³ del día (${totalM3}).`);
            setLoading(false); return;
          }
          if (!/^\d{6}$/.test(String(b.boleta || ""))) {
            closeLoading(); await showError(`Boleta #${i + 1} inválida`, "Ingrese exactamente 6 dígitos.");
            setLoading(false); return;
          }
          if (!/^\d{3}$/.test(String(b.codigoCamino || ""))) {
            closeLoading(); await showError(`Boleta #${i + 1}: Código de camino`, "Ingrese exactamente 3 dígitos.");
            setLoading(false); return;
          }
        }
      }

      // Validaciones para modo plataforma (SM 8803)
      if (isFlatbedMaterial) {
        const anyMat = (formData.materialesTransportados || []).length > 0;
        if (!anyMat) { closeLoading(); await showError("Material requerido", "Seleccione al menos un material transportado."); setLoading(false); return; }
        if ((formData.materialesTransportados || []).includes("Otros") && !formData.materialesOtros.trim()) {
          closeLoading(); await showError("Detalle requerido", "Describa los materiales en 'Otros'."); setLoading(false); return;
        }
        if (!/^\d{3}$/.test(String(formData.codigoCamino || ""))) {
          closeLoading(); await showError("Código de camino", "Ingrese exactamente 3 dígitos."); setLoading(false); return;
        }
      }

      // Validaciones específicas para variante CARRETA
      const isCarretaVariant = (selectedVariant || "").toLowerCase() === "carreta";
      if (isCarretaVariant) {
        if (!formData.placaCarreta) {
          closeLoading();
          await showError("Placa carreta requerida", "Debe seleccionar la placa de la carreta.");
          setLoading(false);
          return;
        }
        if (!formData.distrito) {
          closeLoading();
          await showError("Distrito requerido", "Debe seleccionar el distrito.");
          setLoading(false);
          return;
        }
        if (!/^\d{3}$/.test(String(formData.codigoCamino || ""))) {
          closeLoading();
          await showError("Código de camino requerido", "Ingrese exactamente 3 dígitos para el código de camino.");
          setLoading(false);
          return;
        }
      }

      const isMat = isMaterialFlow;

      const base = {
        operadorId: Number(formData.operadorId),
        maquinariaId: Number(formData.maquinariaId),
        fecha: toISODateOnly(formData.fecha),
        horasOrd: formData.horasOrd === "" ? null : Number(formData.horasOrd),
        horasExt: formData.horasExt === "" ? null : Number(formData.horasExt),
        diesel: formData.combustible === "" ? null : Number(formData.combustible),
        // En material normal, el global se ignora; en plataforma SM 8803 sí enviamos el global
        codigoCamino: (isMaterialFlow && !isFlatbedMaterial) ? null : (formData.codigoCamino || null),
        distrito: (isMaterialFlow && !isFlatbedMaterial) ? null : (formData.distrito || null),
        tipoActividad: formData.tipoActividad || null,
        horaInicio: formData.horaInicio || null,
        horaFin: formData.horaFin || null,
        horimetro: formData.horimetro === "" ? null : Number(formData.horimetro),
        kilometraje: formData.kilometraje === "" ? null : Number(formData.kilometraje),
      };

      const detalles = {
        variante: selectedVariant || formData.variant || null,
        tipoMaquinaria: selectedMachineryType || formData.tipoMaquinaria || null,
        placa: formData.placa || null,
        ...(formData.estacionDesde || formData.estacionHasta
          ? { estacionDesde: formData.estacionDesde || "", estacionHasta: formData.estacionHasta || "" }
          : {}),
        placaCarreta: formData.placaCarreta || null,
        tipoCarga: formData.tipoCarga || null,
        destino: formData.destino || null,
        placaMaquinariaLlevada: formData.placaMaquinariaLlevada || null,
        cantidadLiquido: formData.cantidadLiquido || null,
        placaCisterna: formData.placaCisterna || null,
        tipoMaterial: formData.tipoMaterial || null,
        cantidadMaterial: formData.cantidadMaterial || null,
        boleta: formData.boleta || null,
        fuente: formData.fuente || null,
        subFuente: formData.subFuente || null,

        ...(isMat && !isFlatbedMaterial
          ? {
              totalCantidadMaterial:
                formData.totalCantidadMaterial === "" ? null : Number(formData.totalCantidadMaterial),
              boletas: Array.isArray(formData.boletas)
                ? formData.boletas.map(b => ({
                    boleta: b.boleta || null,
                    tipoMaterial: b.tipoMaterial || null,
                    fuente: b.fuente || null,
                    subFuente: b.subFuente || null,
                    m3: b.m3 === "" ? null : Number(b.m3),
                    distrito: b.distrito || null,
                    codigoCamino: b.codigoCamino || null,
                  }))
                : [],
            }
          : {}),

        ...(isFlatbedMaterial
          ? {
              plataforma: {
                materiales: formData.materialesTransportados || [],
                materialesOtros: formData.materialesOtros || "",
              },
            }
          : {}),
      };

      // Construir el payload completo
      const payload = {
        ...base,
        detalles,
      };

      console.log("=== PAYLOAD PARA CARRETA ===", JSON.stringify(payload, null, 2));

      let result;
      if (mode === "edit" && reportId) {
        result = await machineryService.updateReport(reportId, payload);
      } else {
        result = await machineryService.createReport(payload);
      }

      if (result && result.success) {
        await logCreate(
          "reportes",
          result.data,
          `Se creó reporte de ${selectedMachineryType || formData.tipoMaquinaria} - Placa: ${formData.placa} - Operador: ${operatorName}`
        );
      }

      if (isFlatbedMaterial && !formData.distrito) {
      closeLoading();
      await showError("Distrito requerido", "Seleccione el distrito.");
      setLoading(false);
      return;
     }

     closeLoading();
      await showSuccess(
        mode === "edit" ? "Cambios guardados" : "Reporte guardado",
        mode === "edit" ? "El reporte fue actualizado correctamente." : "El reporte ha sido enviado al administrador."
      );
      if (mode === "edit") {
        onSaved?.();         // refresca tabla
        onCancel?.();        // cierra modal
      } else {
        setFormData({ ...INITIAL_FORM, fecha: todayLocalISO() });
        setSelectedMachineryType("");
        setSelectedVariant("");
        setLastCounters({ horimetro: null, kilometraje: null, estacionHasta: null, estacionUpdatedAt: null });
      }
    } catch (err) {
      console.error("=== ERROR AL CREAR REPORTE ===");
      console.error("Error completo:", err);
      console.error("Response data:", err?.response?.data);
      console.error("Response status:", err?.response?.status);
      console.error("Error message:", err?.message);
      
      closeLoading();
      
      const errorMsg = err?.response?.data?.message 
        || err?.response?.data?.error 
        || err?.message 
        || "No se pudo guardar el reporte.";
      
      await showError("Error al crear", errorMsg);
    } finally {
      setLoading(false);
    }
  };

  // ====== RENDER ======
  const computedTotalHours =
    formData.horaInicio && formData.horaFin ? computeWorkedHours(formData.horaInicio, formData.horaFin) : "";

    const selectedTrailer = useMemo(
  () => trailerOptions.find((it) => it.placa === formData.placaCarreta),
  [trailerOptions, formData.placaCarreta]
);

  return (
    <Card className="w-full max-w-4xl mx-auto">
      <CardHeader>
        <CardTitle>Boleta municipal</CardTitle>
        <CardDescription>Completa la información del reporte diario de operación</CardDescription>
      </CardHeader>

      <CardContent>
        <form onSubmit={handleSubmit} className="space-y-6">
          {/* Operador / Fecha */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label>Operador</Label>
              <Select
                value={formData.operadorId ? String(formData.operadorId) : ""}
                onValueChange={(v) => setFormData((p) => ({ ...p, operadorId: Number(v) }))}
              >
                <SelectTrigger><SelectValue placeholder="Seleccionar operador" /></SelectTrigger>
                <SelectContent>
                  {operatorsList.map((operator) => (
                    <SelectItem key={operator.id} value={String(operator.id)}>
                      {operator.name} {operator.last} (ID: {operator.id})
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-2">
        <Label>Fecha</Label>
          <Input
          id="fecha"
          name="fecha"
          type="date"
          value={formData.fecha}
          max={TODAY}                 // ← bloquea días futuros en el date-picker
          onChange={handleInputChange}
          required
         />
       </div>

          </div>

          {/* Tipo / Variante */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label>Tipo de Maquinaria</Label>
              <Select value={selectedMachineryType} onValueChange={(v) => handleSelectChange("tipoMaquinaria", v)}>
                <SelectTrigger><SelectValue placeholder="Seleccionar tipo de maquinaria" /></SelectTrigger>
                <SelectContent>
                  {Object.keys(machineryFields).map((type) => (<SelectItem key={type} value={type}>{type}</SelectItem>))}
                </SelectContent>
              </Select>
            </div>

            {selectedMachineryType && machineryFields[selectedMachineryType]?.variantes && (
              <div className="space-y-2">
                <Label>Variante</Label>
                <Select value={selectedVariant} onValueChange={(v) => handleSelectChange("variant", v)}>
                  <SelectTrigger><SelectValue placeholder="Seleccionar variante" /></SelectTrigger>
                  <SelectContent>
                    {Object.keys(machineryFields[selectedMachineryType].variantes).map((variant) => (
                      <SelectItem key={variant} value={variant}>{variant}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            )}
          </div>

          {/* Fila de 3: Placa / Placa carreta / Placa maquinaria llevada */}
          {selectedMachineryType && (
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              {/* Placa */}
              <div className="space-y-2">
                <Label>Placa</Label>
                <Select
                  value={formData.maquinariaId ? String(formData.maquinariaId) : ""}
                  onValueChange={(id) => handleSelectChange("placaId", id)}
                  disabled={placasOptions.length === 0}
                >
                  <SelectTrigger>
                    <SelectValue placeholder={placasOptions.length ? "Seleccionar placa" : "No hay placas disponibles"} />
                  </SelectTrigger>
                  <SelectContent>
                    {placasOptions.map((opt) => (<SelectItem key={opt.id} value={opt.id}>{opt.placa}</SelectItem>))}
                  </SelectContent>
                </Select>
                {placasOptions.length === 0 && (
                  <div className="text-sm text-muted-foreground">
                    No hay placas disponibles para este tipo/variante{" "}
                    <button type="button" onClick={onGoToCatalog} className="text-blue-600 underline">
                      Ir a Catálogo
                    </button>
                  </div>
                )}
              </div>

{/* Placa carreta (si aplica) */}
{trailerOptions.length > 0 && (
  <div className="space-y-2">
    <Label>Placa carreta</Label>
    <Select
      value={formData.placaCarreta || ""}
      onValueChange={(v) => setFormData((p) => ({ ...p, placaCarreta: v }))}
    >
      <SelectTrigger>
        <SelectValue placeholder="Seleccionar placa" />
      </SelectTrigger>
      <SelectContent>
        {trailerOptions.map((it) => (
          <SelectItem key={it.placa} value={it.placa}>
            <div className="flex items-center justify-between w-full">
              <span className="mr-3">{it.placa}</span>
              {it.materialTipo && (
                <span
                  className={[
                    "text-[10px] px-2 py-0.5 rounded-full",
                    it.materialTipo === "plataforma"
                      ? "bg-blue-100 text-blue-700"
                      : "bg-amber-100 text-amber-700"
                  ].join(" ")}
                >
                  {it.materialTipo}
                </span>
              )}
            </div>
          </SelectItem>
        ))}
      </SelectContent>
    </Select>

    {/* Hint según subtipo seleccionado */}
    {selectedTrailer && (
      <p className="text-xs text-muted-foreground">
        Subtipo: <b>{selectedTrailer.materialTipo ?? "—"}</b>
        {selectedTrailer.materialTipo === "plataforma"
          ? " — usará lista de «Material(es) transportados» (sin boletas)."
          : " — usará boletas por viaje (m³, fuente, distrito y código camino por boleta)."}
      </p>
    )}
  </div>
)}
                  

              {/* Placa maquinaria llevada (solo variante carreta) */}
              {((selectedVariant || "").toLowerCase() === "carreta") && (
                <div className="space-y-2">
                  <Label htmlFor="placaMaquinariaLlevada">Placa maquinaria llevada</Label>
                  <Input
                    id="placaMaquinariaLlevada"
                    name="placaMaquinariaLlevada"
                    placeholder="SM 0000"
                    value={formData.placaMaquinariaLlevada || ""}
                    onChange={handleInputChange}
                  />
                </div>
              )}
            </div>
          )}

          {/* Horas (auto) */}
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
            <div className="space-y-2">
              <HourAmPmPickerDialog label="Hora inicio" value={formData.horaInicio} onChange={(v) => setFormData((p) => ({ ...p, horaInicio: v }))} />
            </div>
            <div className="space-y-2">
              <HourAmPmPickerDialog label="Hora fin" value={formData.horaFin} onChange={(v) => setFormData((p) => ({ ...p, horaFin: v }))} />
            </div>
            <div className="space-y-2">
              <Label>Total horas (auto, máx. 18)</Label>
              <Input readOnly className="bg-gray-50" value={computedTotalHours} />
            </div>
            <div className="space-y-2">
              <Label>Ordinarias / Extra</Label>
              <div className="flex gap-2">
                <Input readOnly className="bg-gray-50" value={formData.horasOrd} placeholder="Ord" />
                <Input readOnly className="bg-gray-50" value={formData.horasExt} placeholder="Ext" />
              </div>
            </div>
          </div>

          {/* Campos específicos */}
          {selectedMachineryType && (
            <div className="space-y-4">
              <h3 className="text-lg font-semibold">Campos Específicos</h3>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {/* Modo plataforma (SM 8803): lista multi-select con Otros */}
                {isFlatbedMaterial && (
                  <div className="col-span-1 md:col-span-2 space-y-2">
                    <Label>Material(es) transportados</Label>
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-2 border rounded-md p-3">
                      {["Cemento", "Varilla", "Blocks", "Alcantarillas", "Madera", "Otros"].map(opt => {
                        const checked = (formData.materialesTransportados || []).includes(opt);
                        return (
                          <label key={opt} className="flex items-center gap-2">
                            <input
                              type="checkbox"
                              checked={checked}
                              onChange={(e) => {
                                setFormData(p => {
                                  const set = new Set(p.materialesTransportados || []);
                                  e.target.checked ? set.add(opt) : set.delete(opt);
                                  const next = Array.from(set);
                                  return {
                                    ...p,
                                    materialesTransportados: next,
                                    materialesOtros: (opt === "Otros" && !e.target.checked) ? "" : p.materialesOtros
                                  };
                                });
                              }}
                            />
                            <span>{opt}</span>
                          </label>
                        );
                      })}
                    </div>
                    {(formData.materialesTransportados || []).includes("Otros") && (
                      <div className="mt-2">
                        <Label>Detalle de otros materiales</Label>
                        <Input
                          placeholder="Describa los materiales"
                          value={formData.materialesOtros || ""}
                          onChange={(e) => setFormData(p => ({ ...p, materialesOtros: e.target.value }))}
                        />
                      </div>
                    )}
                  </div>
                )}

                {getDynamicFields().map((field) => renderDynamicField(field))}
              </div>
            </div>
          )}

          {/* Sección BOLETAS (solo material Y no plataforma) */}
          {isMaterialFlow && !isFlatbedMaterial && (
            <div className="space-y-3">
              <div className="flex items-center justify-between">
                <h3 className="text-lg font-semibold">Boletas del día</h3>
                <Button type="button" onClick={addBoleta}>+ Agregar boleta</Button>
              </div>
              {(formData.boletas || []).map(renderBoletaCard)}
            </div>
          )}

          {/* Totales por material (solo cuando hay boletas) */}
          {isMaterialFlow && !isFlatbedMaterial && (
            <div className="mt-3 p-3 border rounded-lg bg-gray-50">
              <div className="text-sm font-semibold mb-2">Totales por material</div>
              {Object.keys(materialBreakdown).length === 0 ? (
                <div className="text-sm text-gray-500">Aún sin cantidades.</div>
              ) : (
                <>
                  {Object.entries(materialBreakdown).map(([mat, qty]) => (
                    <div key={mat} className="flex justify-between text-sm py-0.5">
                      <span>{mat}</span>
                      <span>{qty} m³</span>
                    </div>
                  ))}
                  <div className="border-t mt-2 pt-2 flex justify-between text-sm font-medium">
                    <span>Total m³</span>
                    <span>{totalFromBoletas} m³</span>
                  </div>
                </>
              )}
            </div>
          )}

          {/* <Button type="submit" disabled={loading} className="w-full">
            {loading ? "Enviando..." : "Crear Reporte"}
          </Button> */}
<div className="flex items-center justify-end gap-2 pt-2">
  {mode === "edit" && (
    <Button type="button" variant="outline" onClick={onCancel}>
      Cancelar
    </Button>
  )}
          <Button
  type="submit"
  disabled={loading}
  className={[
    // centrar y tamaño
    "flex items-center justify-center ",
    mode === "edit" ? "" : "mx-auto", 
    "px-6 py-2.5 min-w-[14rem] w-fit",    // ← un poco más largo

    // tipografía
    "text-white font-semibold text-sm",

    // borde + halo
    "border-2 border-green-700",
    "ring-1 ring-inset ring-green-900/25",

    // color con gradiente (centro más claro)
    "bg-gradient-to-b from-green-600 to-green-500",
    "hover:from-green-600 hover:to-green-400",

    // forma/sombra
    "rounded-lg shadow-md hover:shadow-lg",

    // estados
    "disabled:opacity-60 disabled:cursor-not-allowed"
  ].join(" ")}
>
  {loading ? "Guardando..." : (submitLabel || (mode === "edit" ? "Guardar cambios" : "Crear reporte"))}
  </Button>
</div>


        </form>
      </CardContent>
    </Card>
  );
}
