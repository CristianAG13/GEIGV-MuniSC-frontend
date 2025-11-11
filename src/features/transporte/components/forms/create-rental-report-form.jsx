"use client";

import { useMemo, useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { useToast } from "@/hooks/use-toast";

import {
  confirmAction,
  confirmDelete,
  showValidationError,
  showSuccess,
  showError,
  showLoading,
  closeLoading,
  showToast,
} from "@/utils/sweetAlert";

import machineryService from "@/services/machineryService";
import operatorsService from "@/services/operatorsService";
import sourceService from "@/services/sourceService";

import {
  rentalSourceOptions,
  districts as districtList,
  materialTypes, // (Escombros, Desechos, Tierra, Arena, Base, Subbase, Lastre, Alcantarilla)
} from "@/utils/districts";

/* ---------- Catálogos ---------- */
const TIPOS_MAQUINARIA = [
  "Vagoneta",
  "Cisterna",
  "Cabezal",
  "Excavadora",
  "Niveladora",
  "Compactadora",
  "Backhoe",
  "Cargador",
  "Tractor",
];

/** Fuente y Cantidad aplican a vagoneta/cisterna/cabezal */
const TIPOS_CON_FUENTE = new Set(["vagoneta", "cisterna", "cabezal"]);
const TIPOS_CON_CANTIDAD = new Set(["vagoneta", "cisterna", "cabezal"]);
/** tipos que usan ESTACIÓN N+M */
const TIPOS_CON_ESTACION = new Set(["niveladora", "excavadora", "compactadora", "backhoe", "tractor"]);
/** tipos que usan BOLETA (solo estos) */
const TIPOS_CON_BOLETA = new Set(["vagoneta", "cabezal"]);

const ACTIVIDADES_POR_TIPO = {
  vagoneta: ["Acarreo de material", "Riego de agua"],
  cabezal: ["Acarreo de material", "Riego de agua"],
  cisterna: ["Riego de agua", "Transporte de agua"],
  excavadora: ["Extracción y cargo de material", "Colocación de alcantarillas", "Limpieza"],
  tractor: ["Extracción y cargo de material", "Colocación de alcantarillas", "Limpieza"],
  niveladora: ["Limpieza", "Conformación", "Lastreado"],
  backhoe: [
    "Limpieza",
    "Colocación de alcantarillas",
    "Extensión de material",
    "Carga de material",
    "Excavación",
    "Extracción de material",
    "Demolición",
  ],
  compactadora: ["Compactación"],
  cargador: ["Cargar"],
};

const firstActivityFor = (tipo) =>
  (ACTIVIDADES_POR_TIPO?.[tipo] && ACTIVIDADES_POR_TIPO[tipo][0]) || "";

const ROW2 = "grid grid-cols-1 md:grid-cols-2 gap-4";

/* ---------- helpers ---------- */
const onlyDigitsMax = (v, max) => String(v || "").replace(/\D/g, "").slice(0, max);

const clampHoras = (raw) => {
  const digits = String(raw || "").replace(/\D/g, "");
  if (!digits) return "";
  const n = Math.max(0, Math.min(18, Number(digits)));
  return String(n);
};

/** número positivo con un solo punto decimal */
const sanitizeCantidad = (raw) =>
  String(raw || "").replace(/[^\d.]/g, "").replace(/(\..*)\./g, "$1");

/** Fecha local YYYY-MM-DD */
function todayLocalISO() {
  const now = new Date();
  const tz = now.getTimezoneOffset() * 60000;
  return new Date(now.getTime() - tz).toISOString().slice(0, 10);
}

const COLS = { 1: "md:grid-cols-1", 2: "md:grid-cols-2", 3: "md:grid-cols-3" };

/* Normaliza string de fuente a “Ríos|Tajo|KYLCSA” o deja texto */
function normalizeFuenteRental(raw = "") {
  const s = String(raw).trim();
  if (!s) return { fuente: null, sub: null };
  if (/^r[ií]o\b/i.test(s)) return { fuente: "Ríos", sub: s.replace(/^r[ií]o\b/i, "").trim() || null };
  if (/^r[ií]os\b/i.test(s)) return { fuente: "Ríos", sub: null };
  if (/^tajo\b/i.test(s)) return { fuente: "Tajo", sub: null };
  if (/^kylcsa$/i.test(s)) return { fuente: "KYLCSA", sub: null };
  return { fuente: s, sub: null };
}

/* =============================================================== */
/*                          COMPONENTE                             */
/* =============================================================== */
export default function CreateRentalReportForm({ onGoToCatalog }) {
  const { toast } = useToast();
  const [loading, setLoading] = useState(false);
  const [operatorsList, setOperatorsList] = useState([]);

  // Catálogos dinámicos de subfuentes
  const [riosList, setRiosList] = useState([]);
  const [tajosList, setTajosList] = useState([]);

  /* ---------- estado del formulario ---------- */
  const [formData, setFormData] = useState({
    fecha: todayLocalISO(),
    operadorId: "",
    tipoMaquinaria: "",
    placa: "",
    actividad: "",
    horas: "",
    cantidad: "",
    fuente: "",
    boleta: "", // municipal (6)
    boletaK: "", // KYLCSA (6)
    codigoCamino: "",
    distrito: "",
    estacion: "",
    /* Sección “boletas del día” para vagoneta/cabezal material */
    boletas: [],
  });

  /* ===== Derivados ===== */
  const actividadOptions = useMemo(
    () => (formData.tipoMaquinaria ? ACTIVIDADES_POR_TIPO[formData.tipoMaquinaria] ?? [] : []),
    [formData.tipoMaquinaria]
  );

  /* Fuente depende del tipo/actividad (solo vagoneta/cisterna/cabezal) */
  const fuenteOptions = useMemo(() => {
    const tipo = formData.tipoMaquinaria; // ya guardamos en minúscula
    if (!tipo || !TIPOS_CON_FUENTE.has(tipo)) return [];

    const act = (formData.actividad || "").toLowerCase();
    const cfg = rentalSourceOptions?.[tipo] ?? null;

    const asArray = (x) => (Array.isArray(x) ? x : x && typeof x === "string" ? [x] : []);
    if (Array.isArray(cfg)) return cfg;
    if (!cfg) return asArray(rentalSourceOptions?.default) ?? [];

    if (tipo === "cisterna") {
      return asArray(cfg.cisterna ?? cfg.agua ?? cfg.default ?? rentalSourceOptions?.default);
    }
    if (act.includes("material")) {
      return asArray(cfg.material ?? rentalSourceOptions?.default);
    }
    if (act.includes("agua") || act.includes("riego") || act.includes("cisterna")) {
      return asArray(cfg.cisterna ?? cfg.agua ?? rentalSourceOptions?.default);
    }
    return asArray(cfg.material ?? cfg.cisterna ?? rentalSourceOptions?.default);
  }, [formData.tipoMaquinaria, formData.actividad]);

  const showFuente = TIPOS_CON_FUENTE.has(formData.tipoMaquinaria) && fuenteOptions.length > 0;
  const showCantidad = TIPOS_CON_CANTIDAD.has(formData.tipoMaquinaria);
  const showEstacion = TIPOS_CON_ESTACION.has(formData.tipoMaquinaria);
  const showHoras = true;

  const isAcarreoMaterial = (formData.actividad || "").toLowerCase().includes("material");
  const boletaMode =
    TIPOS_CON_BOLETA.has(formData.tipoMaquinaria) && isAcarreoMaterial
      ? (String(formData.fuente || "").toUpperCase() === "KYLCSA" ? "kylcsa" : "municipal")
      : "disabled";

  /* Multi-boletas (Vagoneta/Cabezal + Acarreo de material) */
  const isMaterialFlow =
    (formData.tipoMaquinaria === "vagoneta" || formData.tipoMaquinaria === "cabezal") &&
    (formData.actividad || "").toLowerCase().includes("material");
  const isMaterialActivity = (formData.actividad || "").toLowerCase().includes("material");

  /* Totales por material (de boletas) */
  const materialBreakdown = useMemo(() => {
    const out = {};
    if (!isMaterialFlow) return out;
    for (const b of formData.boletas || []) {
      const key = b.tipoMaterial || "—";
      const qty = Number(b.m3 || 0) || 0;
      out[key] = (out[key] || 0) + qty;
    }
    return out;
  }, [formData.boletas, isMaterialFlow]);

  const totalFromBoletas = Object.values(materialBreakdown).reduce((a, b) => a + b, 0);

  /* ---------- efectos ---------- */
  useEffect(() => {
    (async () => {
      try {
        const operators = await operatorsService.getAllOperators();
        setOperatorsList(Array.isArray(operators) ? operators : []);
      } catch (error) {
        console.error(error);
        toast({ title: "Error", description: "No se pudieron cargar los operadores.", variant: "destructive" });
      }
    })();
  }, [toast]);

  // Prefetch ríos y tajos (para subfuente)
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
        console.error("[CreateRentalReportForm] load sources:", e);
      }
    })();
  }, []);

  useEffect(() => {
    if (!formData.tipoMaquinaria) return;
    const ops = ACTIVIDADES_POR_TIPO[formData.tipoMaquinaria] || [];
    if (!ops.includes(formData.actividad)) {
      setFormData((p) => ({ ...p, actividad: ops[0] || "" }));
    }
  }, [formData.tipoMaquinaria]); // eslint-disable-line

  const handleChangeTipo = (value) => {
    const tipo = String(value || "").toLowerCase(); // guardamos en minúscula
    const firstAct = firstActivityFor(tipo);
    setFormData((p) => ({
      ...p,
      tipoMaquinaria: tipo,
      actividad: firstAct,
      fuente: "",
      boleta: "",
      boletaK: "",
      estacion: TIPOS_CON_ESTACION.has(tipo) ? p.estacion : "",
      ...(TIPOS_CON_CANTIDAD.has(tipo) ? {} : { cantidad: "" }),
      boletas: [],
    }));
  };

  /* ---------- handlers simples ---------- */
  const handleChange = (e) => {
    const { name, value } = e.target;
    if (name === "fecha") {
      const hoy = todayLocalISO();
      setFormData((p) => ({ ...p, fecha: value > hoy ? hoy : value }));
      return;
    }
    if (name === "horas") return setFormData((p) => ({ ...p, horas: clampHoras(value) }));
    if (name === "boleta") return setFormData((p) => ({ ...p, boleta: onlyDigitsMax(value, 6) }));
    if (name === "boletaK") return setFormData((p) => ({ ...p, boletaK: onlyDigitsMax(value, 6) }));
    if (name === "cantidad") return setFormData((p) => ({ ...p, cantidad: sanitizeCantidad(value) }));
    if (name === "codigoCamino") return setFormData((p) => ({ ...p, codigoCamino: onlyDigitsMax(value, 3) }));
    setFormData((p) => ({ ...p, [name]: value }));
  };

  const handleFuenteChange = (v) => {
    setFormData((p) => ({
      ...p,
      fuente: v,
      boleta: v === "KYLCSA" ? "" : p.boleta,
      boletaK: v === "KYLCSA" ? p.boletaK : "",
    }));
  };
  const handleDistritoChange = (v) => setFormData((p) => ({ ...p, distrito: v }));

  /* ---------- Sección “boletas del día” ---------- */
  const addBoleta = () => {
    const nextLen = (formData.boletas?.length || 0) + 1;
    setFormData((p) => ({
      ...p,
      boletas: [
        ...(p.boletas || []),
        { tipoMaterial: "", fuente: "", subFuente: "", boleta: "", boletaK: "", m3: "", distrito: "", codigoCamino: "" },
      ],
    }));
    showToast(`Boleta #${nextLen} agregada`, "success");
  };

  const removeBoleta = async (idx) => {
    const r = await confirmDelete(`la boleta #${idx + 1}`);
    if (!r.isConfirmed) return;
    setFormData((p) => {
      const copy = [...(p.boletas || [])];
      copy.splice(idx, 1);
      return { ...p, boletas: copy };
    });
  };

  const updateBoleta = (idx, patch) => {
    setFormData((p) => {
      const copy = [...(p.boletas || [])];
      copy[idx] = { ...copy[idx], ...patch };
      return { ...p, boletas: copy };
    });
  };

  const renderBoletaCard = (b, idx) => {
    const upperFuente = String(b.fuente || "").toUpperCase();
    const isK = upperFuente === "KYLCSA";
    const isRio = upperFuente === "RÍOS" || upperFuente === "RIOS";
    const isTajo = upperFuente === "TAJO";

    return (
      <div key={idx} className="rounded-xl border p-4 bg-white relative">
        <div className="flex items-center justify-between mb-3">
          <div className="font-semibold">Boleta #{idx + 1}</div>
          <Button type="button" className="bg-red-600 hover:bg-red-700 text-white" onClick={() => removeBoleta(idx)}>
            Eliminar
          </Button>
        </div>

        <div className={`grid grid-cols-1 ${COLS[2]} gap-4`}>
          {/* 1) Tipo de material */}
          <div>
            <Label>Tipo de material</Label>
            <Select value={b.tipoMaterial || ""} onValueChange={(v) => updateBoleta(idx, { tipoMaterial: v })}>
              <SelectTrigger>
                <SelectValue placeholder="Seleccionar material" />
              </SelectTrigger>
              <SelectContent>
                {materialTypes.map((m) => (
                  <SelectItem key={m} value={m}>
                    {m}
                  </SelectItem>
                ))}
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
                  boleta: v === "KYLCSA" ? "" : b.boleta || "",
                  boletaK: v === "KYLCSA" ? b.boletaK || "" : "",
                  subFuente: "",
                })
              }
            >
              <SelectTrigger>
                <SelectValue placeholder="Seleccionar fuente" />
              </SelectTrigger>
              <SelectContent>
                {fuenteOptions.map((f) => (
                  <SelectItem key={f} value={f}>
                    {f}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          {/* 2.1) Subfuente desde Catálogo (Río/Tajo) */}
          {(isRio || isTajo) && (
            <div className="md:col-span-2">
              <Label>{isRio ? "Río" : "Tajo"}</Label>
              <Select value={b.subFuente || ""} onValueChange={(v) => updateBoleta(idx, { subFuente: v })}>
                <SelectTrigger>
                  <SelectValue placeholder={`Seleccionar ${isRio ? "río" : "tajo"}`} />
                </SelectTrigger>
                <SelectContent>
                  {(isRio ? riosList : tajosList).map((name) => (
                    <SelectItem key={name} value={name}>
                      {name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
              {!!onGoToCatalog && (
                <button type="button" className="mt-1 text-sm text-blue-600 underline" onClick={onGoToCatalog}>
                  Administrar {isRio ? "ríos" : "tajos"} en Catálogo
                </button>
              )}
            </div>
          )}

          {/* 3) N.º de boleta */}
          <div>
            <Label>{isK ? "Boleta KYLCSA (6 dígitos)" : "Boleta (6 dígitos)"}</Label>
            {isK ? (
              <Input
                inputMode="numeric"
                maxLength={6}
                value={b.boletaK || ""}
                onChange={(e) => updateBoleta(idx, { boletaK: onlyDigitsMax(e.target.value, 6) })}
                placeholder="000000"
              />
            ) : (
              <Input
                inputMode="numeric"
                maxLength={6}
                value={b.boleta || ""}
                onChange={(e) => updateBoleta(idx, { boleta: onlyDigitsMax(e.target.value, 6) })}
                placeholder="000000"
              />
            )}
          </div>

          {/* 4) m³ del viaje */}
          <div>
            <Label>m³ del viaje</Label>
            <Input
              inputMode="decimal"
              value={b.m3 || ""}
              onChange={(e) => updateBoleta(idx, { m3: sanitizeCantidad(e.target.value) })}
              placeholder="0.00"
            />
          </div>

          {/* 5) Distrito */}
          <div>
            <Label>Distrito</Label>
            <Select value={b.distrito || ""} onValueChange={(v) => updateBoleta(idx, { distrito: v })}>
              <SelectTrigger>
                <SelectValue placeholder="Seleccionar distrito" />
              </SelectTrigger>
              <SelectContent>
                {districtList.map((d) => (
                  <SelectItem key={d} value={d}>
                    {d}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          {/* 6) Código Camino */}
          <div>
            <Label>Código Camino (3 dígitos)</Label>
            <Input
              inputMode="numeric"
              maxLength={3}
              value={b.codigoCamino || ""}
              onChange={(e) => updateBoleta(idx, { codigoCamino: onlyDigitsMax(e.target.value, 3) })}
              placeholder="000"
            />
          </div>
        </div>
      </div>
    );
  };

  /* ---------- Validación central ---------- */
  const validateBeforeSubmit = () => {
    const errs = [];

    if (!formData.operadorId) errs.push("Selecciona el encargado.");
    if (!formData.tipoMaquinaria) errs.push("Selecciona el tipo de maquinaria.");
    if (!formData.actividad) errs.push("Selecciona la actividad.");

    if (formData.horas === "" || !/^\d+$/.test(formData.horas) || Number(formData.horas) > 18) {
      errs.push("Horas: ingresa un entero entre 0 y 18.");
    }

    const hoy = todayLocalISO();
    if (formData.fecha > hoy) errs.push("Fecha: solo hoy o pasado.");

    if (isMaterialFlow) {
      if ((formData.boletas || []).length === 0) {
        errs.push("Agrega al menos una boleta del día.");
      } else {
        (formData.boletas || []).forEach((b, i) => {
          const idx = `Boleta #${i + 1}`;
          if (!b.tipoMaterial) errs.push(`${idx}: selecciona el tipo de material.`);
          if (!b.fuente) errs.push(`${idx}: selecciona la fuente.`);

          const upper = String(b.fuente || "").toUpperCase();
          const isK = upper === "KYLCSA";
          const isRio = upper === "RÍOS" || upper === "RIOS";
          const isTajo = upper === "TAJO";

          if ((isRio || isTajo) && !b.subFuente) errs.push(`${idx}: selecciona ${isRio ? "río" : "tajo"}.`);
          if (isK && !/^\d{6}$/.test(b.boletaK || "")) errs.push(`${idx}: boleta KYLCSA debe tener 6 dígitos.`);
          if (!isK && b.boleta && !/^\d{6}$/.test(b.boleta)) errs.push(`${idx}: boleta municipal debe tener 6 dígitos.`);
          if (!/^\d{3}$/.test(String(b.codigoCamino || ""))) errs.push(`${idx}: código de camino debe tener 3 dígitos.`);
          if (!b.distrito) errs.push(`${idx}: selecciona el distrito.`);
          const cant = Number(b.m3);
          if (!Number.isFinite(cant) || cant <= 0) errs.push(`${idx}: m³ del viaje debe ser > 0.`);
        });
      }
    } else {
      if (!/^\d{3}$/.test(String(formData.codigoCamino || ""))) errs.push("Código de camino: 3 dígitos (ej. 015).");
      if (!formData.distrito) errs.push("Selecciona un distrito.");

      if (boletaMode !== "disabled") {
        if (formData.fuente === "KYLCSA") {
          if (!/^\d{6}$/.test(formData.boletaK || "")) errs.push("Boleta KYLCSA: ingresa exactamente 6 dígitos.");
        } else if (formData.boleta && !/^\d{6}$/.test(formData.boleta)) {
          errs.push("Boleta municipal: 6 dígitos o déjala vacía.");
        }
      }

      if (showCantidad) {
        const cant = Number(formData.cantidad);
        if (!Number.isFinite(cant) || cant <= 0) errs.push("m³ del viaje debe ser mayor a 0.");
      }
    }

    return errs;
  };

  /* ---------- submit ---------- */
  const handleSubmit = async (e) => {
    e.preventDefault();
    if (loading) return;

    // 1) Validar
    const errors = validateBeforeSubmit();
    if (errors.length) {
      await showValidationError(errors);
      return;
    }

    const isMulti = isMaterialFlow && (formData.boletas?.length || 0) > 0;

    // 2) Confirmar
    const confirma = await confirmAction(
      isMulti ? "¿Crear reporte de alquiler con varias boletas?" : "¿Crear boleta de alquiler?",
      isMulti
        ? `Se enviará 1 reporte con ${formData.boletas.length} boleta(s) embebidas.`
        : "Se enviará un reporte de alquiler."
    );
    if (!confirma.isConfirmed) return;

    // 3) Construir payload
    let payload;
    if (isMulti) {
      const boletasDet = formData.boletas.map((b) => {
        const isK = String(b.fuente || "").toUpperCase() === "KYLCSA";
        return {
          tipoMaterial: b.tipoMaterial || null,
          fuente: b.fuente || null,
          subFuente: b.subFuente || null,
          m3: Number(b.m3) || 0,
          distrito: b.distrito || null,
          codigoCamino: b.codigoCamino || null,
          boleta: isK ? null : b.boleta || null,
          boletaKylcsa: isK ? b.boletaK || null : null,
        };
      });
      const totalM3 = boletasDet.reduce((a, b) => a + (Number(b.m3) || 0), 0);
      const first = formData.boletas[0] || {};

      payload = {
        fecha: formData.fecha,
        operadorId: Number(formData.operadorId),
        tipoMaquinaria: formData.tipoMaquinaria, // vagoneta|cabezal
        placa: formData.placa || null,
        actividad: formData.actividad, // "Acarreo de material"
        horas: Number(formData.horas),
        cantidad: totalM3,
        codigoCamino: first.codigoCamino || null,
        distrito: first.distrito || null,
        fuente: null,
        boleta: null,
        boletaKylcsa: null,
        detalles: { variante: "material", boletas: boletasDet },
      };
    } else {
      const { fuente: fuenteNorm } = normalizeFuenteRental(formData.fuente);
      payload = {
        fecha: formData.fecha,
        operadorId: Number(formData.operadorId),
        tipoMaquinaria: formData.tipoMaquinaria,
        placa: formData.placa || null,
        actividad: formData.actividad,
        horas: Number(formData.horas),
        cantidad: showCantidad ? Number(formData.cantidad) : null,
        fuente: showFuente ? fuenteNorm || null : null,
        boleta: TIPOS_CON_BOLETA.has(formData.tipoMaquinaria)
          ? formData.fuente === "KYLCSA"
            ? null
            : formData.boleta || null
          : null,
        boletaKylcsa: TIPOS_CON_BOLETA.has(formData.tipoMaquinaria)
          ? formData.fuente === "KYLCSA"
            ? formData.boletaK || null
            : null
          : null,
        codigoCamino: formData.codigoCamino,
        distrito: formData.distrito,
        estacion: showEstacion ? formData.estacion || null : null,
      };
    }

    // 4) Guardar con loader + alertas
    try {
      setLoading(true);
      showLoading("Guardando...", "Por favor, espere");
      await machineryService.createRentalReport(payload);
      closeLoading();
      await showSuccess("Registro creado", "Se guardó correctamente.");

      // Reset
      setFormData({
        fecha: todayLocalISO(),
        operadorId: "",
        tipoMaquinaria: "",
        placa: "",
        actividad: "",
        horas: "",
        cantidad: "",
        fuente: "",
        boleta: "",
        boletaK: "",
        codigoCamino: "",
        distrito: "",
        estacion: "",
        boletas: [],
      });
    } catch (err) {
      console.error("CREATE rental error ->", err?.response?.data || err);
      closeLoading();
      await showError("Error al crear", err?.response?.data?.message || "No se pudo guardar el registro.");
    } finally {
      setLoading(false);
    }
  };

  /* ---------- layout ---------- */
  const rowTopCols = 3;
  const showAnyBoleta = boletaMode !== "disabled" && isMaterialActivity;

  return (
    <Card className="w-full max-w-4xl mx-auto">
      <CardHeader>
        <CardTitle>Boleta de alquiler</CardTitle>
        <CardDescription>Registra el alquiler de maquinaria externa</CardDescription>
      </CardHeader>

      <CardContent>
        <form onSubmit={handleSubmit} className="space-y-6">
          {/* ---------- Bloque superior ---------- */}
          <div className={`grid grid-cols-1 ${COLS[rowTopCols]} gap-4`}>
            {/* Encargado */}
            <div className="space-y-2">
              <Label>Encargado</Label>
              <Select value={formData.operadorId} onValueChange={(v) => setFormData((p) => ({ ...p, operadorId: v }))}>
                <SelectTrigger>
                  <SelectValue placeholder="Seleccionar encargado" />
                </SelectTrigger>
                <SelectContent>
                  {operatorsList.map((op) => (
                    <SelectItem key={op.id} value={String(op.id)}>
                      {op.name} {op.last} {op.identification ? `(${op.identification})` : ""}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            {/* Fecha */}
            <div className="space-y-2">
              <Label htmlFor="fecha">Fecha</Label>
              <Input id="fecha" name="fecha" type="date" value={formData.fecha} onChange={handleChange} max={todayLocalISO()} required />
            </div>

            {/* Tipo de maquinaria */}
            <div className="space-y-2">
              <Label>Tipo de maquinaria</Label>
              <Select value={formData.tipoMaquinaria} onValueChange={handleChangeTipo}>
                <SelectTrigger>
                  <SelectValue placeholder="Seleccionar tipo" />
                </SelectTrigger>
                <SelectContent>
                  {TIPOS_MAQUINARIA.map((t) => (
                    <SelectItem key={t} value={t.toLowerCase()}>
                      {t}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            {/* Tipo de actividad */}
            <div className="space-y-2">
              <Label>Tipo de actividad</Label>
              <Select
                value={formData.actividad}
                onValueChange={(v) => setFormData((p) => ({ ...p, actividad: v }))}
                disabled={!formData.tipoMaquinaria}
              >
                <SelectTrigger>
                  <SelectValue placeholder={formData.tipoMaquinaria ? "Seleccionar actividad" : "Elige un tipo primero"} />
                </SelectTrigger>
                <SelectContent>
                  {actividadOptions.map((a) => (
                    <SelectItem key={a} value={a}>
                      {a}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            {/* Placa */}
            <div className="space-y-2">
              <Label htmlFor="placa">Placa</Label>
              <Input id="placa" name="placa" value={formData.placa} onChange={handleChange} placeholder="SM 1234" />
            </div>

            {/* Horas */}
            {showHoras && (
              <div className="space-y-2">
                <Label htmlFor="horas">Horas laboradas</Label>
                <Input id="horas" name="horas" inputMode="numeric" pattern="[0-9]*" placeholder="0" value={formData.horas} onChange={handleChange} />
                <p className="text-xs text-muted-foreground">Solo enteros 0–18.</p>
              </div>
            )}
          </div>

          {/* ---------- Boletas del día ---------- */}
          {isMaterialFlow && (
            <div className="space-y-3">
              <div className="flex items-center justify-between">
                <h3 className="text-lg font-semibold">Boletas del día</h3>
                <Button
                  type="button"
                  className="bg-blue-700 hover:bg-blue-800 active:bg-blue-900 text-white font-semibold px-4 py-2 rounded"
                  onClick={addBoleta}
                >
                  + Agregar boleta
                </Button>
              </div>

              {(formData.boletas || []).map(renderBoletaCard)}

              {/* Totales por material */}
              <div className="mt-1 p-3 border rounded-lg bg-gray-50">
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
            </div>
          )}

          {/* ---------- Campos específicos (resto de flujos) ---------- */}
          {!isMaterialFlow && (
            <>
              <h3 className="text-base font-semibold">Campos específicos</h3>

              {/* Caso especial: vagoneta/cabezal/cisterna + riego */}
              {["vagoneta", "cabezal", "cisterna"].includes(formData.tipoMaquinaria) &&
                (formData.actividad || "").toLowerCase().includes("riego") && (
                  <>
                    <div className={ROW2}>
                      {showFuente && (
                        <div className="space-y-2">
                          <Label>Fuente</Label>
                          <Select value={formData.fuente} onValueChange={handleFuenteChange}>
                            <SelectTrigger>
                              <SelectValue placeholder="Seleccionar fuente" />
                            </SelectTrigger>
                            <SelectContent>
                              {fuenteOptions.map((f) => (
                                <SelectItem key={f} value={f}>
                                  {f}
                                </SelectItem>
                              ))}
                            </SelectContent>
                          </Select>
                        </div>
                      )}

                      {showCantidad && (
                        <div className="space-y-2">
                          <Label htmlFor="cantidad">m³ del viaje</Label>
                          <Input id="cantidad" name="cantidad" inputMode="decimal" placeholder="0.00" value={formData.cantidad} onChange={handleChange} />
                        </div>
                      )}
                    </div>

                    <div className={ROW2}>
                      <div className="space-y-2">
                        <Label>Distrito</Label>
                        <Select value={formData.distrito} onValueChange={handleDistritoChange}>
                          <SelectTrigger>
                            <SelectValue placeholder="Seleccionar distrito" />
                          </SelectTrigger>
                          <SelectContent>
                            {districtList.map((d) => (
                              <SelectItem key={d} value={d}>
                                {d}
                              </SelectItem>
                            ))}
                          </SelectContent>
                        </Select>
                      </div>

                      <div className="space-y-2">
                        <Label htmlFor="codigoCamino">Código de camino (3 dígitos)</Label>
                        <Input id="codigoCamino" name="codigoCamino" inputMode="numeric" pattern="[0-9]{3}" maxLength={3} placeholder="000" value={formData.codigoCamino} onChange={handleChange} />
                      </div>
                    </div>
                  </>
                )}

              {/* Caso general */}
              {!(
                ["vagoneta", "cabezal", "cisterna"].includes(formData.tipoMaquinaria) &&
                (formData.actividad || "").toLowerCase().includes("riego")
              ) && (
                <>
                  <div className={ROW2}>
                    {showFuente && (
                      <div className="space-y-2">
                        <Label>Fuente</Label>
                        <Select value={formData.fuente} onValueChange={handleFuenteChange}>
                          <SelectTrigger>
                            <SelectValue placeholder="Seleccionar fuente" />
                          </SelectTrigger>
                          <SelectContent>
                            {fuenteOptions.map((f) => (
                              <SelectItem key={f} value={f}>
                                {f}
                              </SelectItem>
                            ))}
                          </SelectContent>
                        </Select>
                      </div>
                    )}

                    {/* Boleta cuando aplique */}
                    {boletaMode !== "disabled" && (
                      <div className="space-y-2">
                        <Label>{boletaMode === "kylcsa" ? "N.º de boleta KYLCSA" : "N.º de boleta"}</Label>
                        {boletaMode === "kylcsa" ? (
                          <Input id="boletaK" name="boletaK" inputMode="numeric" pattern="[0-9]{6}" maxLength={6} placeholder="000000" value={formData.boletaK} onChange={handleChange} />
                        ) : (
                          <Input id="boleta" name="boleta" inputMode="numeric" pattern="[0-9]{6}" maxLength={6} placeholder="000000" value={formData.boleta} onChange={handleChange} />
                        )}
                      </div>
                    )}

                    {showCantidad && boletaMode === "disabled" && (
                      <div className="space-y-2">
                        <Label htmlFor="cantidad">m³ del viaje</Label>
                        <Input id="cantidad" name="cantidad" inputMode="decimal" placeholder="0.00" value={formData.cantidad} onChange={handleChange} />
                      </div>
                    )}
                  </div>

                  {/* Estación si aplica */}
                  {showEstacion && (
                    <div className="grid grid-cols-1 gap-4">
                      <div className="space-y-2">
                        <Label htmlFor="estacion">Estación (N+M)</Label>
                        <Input id="estacion" name="estacion" placeholder="Ej: 12+500" value={formData.estacion} onChange={handleChange} />
                        <p className="text-xs text-gray-500 mt-1">Formato N+M, p. ej. 12+500.</p>
                      </div>
                    </div>
                  )}

                  <div className={ROW2}>
                    <div className="space-y-2">
                      <Label>Distrito</Label>
                      <Select value={formData.distrito} onValueChange={handleDistritoChange}>
                        <SelectTrigger>
                          <SelectValue placeholder="Seleccionar distrito" />
                        </SelectTrigger>
                        <SelectContent>
                          {districtList.map((d) => (
                            <SelectItem key={d} value={d}>
                              {d}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    </div>

                    <div className="space-y-2">
                      <Label htmlFor="codigoCamino">Código de camino (3 dígitos)</Label>
                      <Input id="codigoCamino" name="codigoCamino" inputMode="numeric" pattern="[0-9]{3}" maxLength={3} placeholder="000" value={formData.codigoCamino} onChange={handleChange} />
                    </div>
                  </div>
                </>
              )}
            </>
          )}

          {/* Submit */}
          <div className="flex items-center justify-center gap-2 pt-2">
            <Button
              type="submit"
              disabled={loading}
              className={[
                "flex items-center justify-center",
                "px-6 py-2.5 min-w-[14rem] w-fit",
                "text-white font-semibold text-sm",
                "border-2 border-green-700",
                "ring-1 ring-inset ring-green-900/25",
                "bg-gradient-to-b from-green-600 to-green-500",
                "hover:from-green-600 hover:to-green-400",
                "rounded-lg shadow-md hover:shadow-lg",
                "disabled:opacity-60 disabled:cursor-not-allowed",
              ].join(" ")}
            >
              {loading ? "Guardando..." : "Crear reporte"}
            </Button>
          </div>
        </form>
      </CardContent>
    </Card>
  );
}
