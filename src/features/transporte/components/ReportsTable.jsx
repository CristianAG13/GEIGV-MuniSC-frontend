
"use client";

import React, { useMemo, useState, useEffect, useRef } from "react";
import { Button } from "@/components/ui/button";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Input } from "@/components/ui/input";
import * as XLSX from "xlsx";
import { Eye, Trash2, Filter as FilterIcon, RefreshCcw } from "lucide-react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from "@/components/ui/dialog";

import headerUrl from "@/assets/header.png";
import footerUrl from "@/assets/footer.png";

import machineryService from "@/services/machineryService";
import { fmtDMY, toISODateOnly, todayLocalISO } from "@/utils/date";

/*-------------------Logos exportar pdf------------------*/
const HEADER_URL = headerUrl;
const FOOTER_URL = footerUrl;

/* ---------- variantes disponibles por tipo (para filtros) ---------- */
const VARIANT_OPTIONS_BY_TYPE = {
  vagoneta: ["material", "carreta", "cisterna"],
  cabezal: ["material", "carreta", "cisterna"],
};

/* ---------- órdenes para autoselección ---------- */
const TYPE_ORDER = ["vagoneta", "cabezal", "cisterna"]; // prioridad de tipos
const VARIANT_ORDER = ["material", "carreta", "cisterna"]; // prioridad de variantes

// Tipos que usan Estación (se pinta en columna/exports)
const STATION_TYPES = new Set([
  "niveladora",
  "excavadora",
  "compactadora",
  "backhoe",
]);

// Tipos que muestran "Variante" (coinciden con los de km)
const VARIANT_TYPES = new Set(["vagoneta", "cabezal"]);

// Tipos que usan Kilometraje (no horímetro)
const KM_TYPES = ["vagoneta", "cabezal", "cisterna"];
const isKmType = (t) => KM_TYPES.includes((t || "").toLowerCase());
const medidorLabelFor = (t) =>
  t ? (isKmType(t) ? "Kilometraje" : "Horímetro") : "Medidor";

/* ---------------- helpers genéricos ---------------- */
const showText = (v) =>
  v === null || v === undefined || (typeof v === "string" && v.trim() === "")
    ? "—"
    : String(v);
const showNum = (v) => {
  if (v === 0) return 0;
  const n = typeof v === "string" ? Number(v) : v;
  return Number.isFinite(n) ? n : "—";
};

const get = (obj, path) =>
  String(path)
    .split(".")
    .reduce((acc, k) => (acc && acc[k] !== undefined ? acc[k] : undefined), obj);
const pick = (...vals) => vals.find((v) => v !== undefined && v !== null);

// Helpers pequeñitos
const _hasVal = (x) =>
  x !== undefined && x !== null && String(x).trim() !== "";
const _first = (...vals) => vals.find((v) => _hasVal(v));
const _numOrUndef = (v) => {
  if (v === 0) return 0;
  if (!_hasVal(v)) return undefined;
  const n = Number(v);
  return Number.isFinite(n) ? n : undefined;
};


// texto compacto para una boleta
function fmtBoletaCompact(b = {}) {
  const num = b?.boleta ? `#${b.boleta}` : "—";
  const tipo = showText(b?.tipoMaterial);
  const fuente = showText(b?.fuente);
  const sub = (b?.fuente === "Ríos" || b?.fuente === "Tajo") && _hasVal(b?.subFuente)
    ? ` | ${b.subFuente}`
    : "";
  return `${num} | ${tipo} | ${fuente}${sub}`;
}

// armar una "boleta" a partir de los campos simples del reporte (cuando no hay arreglo)
function buildSimpleBoletaFromReport(r) {
  const d = r?.detalles || {};
  const b = d?.boleta ?? r?.boleta ?? null;
  if (!b) return null; // si no hay boleta simple, nada

  return {
    boleta: b,
    tipoMaterial: d?.tipoMaterial ?? r?.tipoMaterial ?? "",
    fuente: readFuente(r) ?? "",
    subFuente: "", // subfuente solo aplica a ríos/tajo en tus boletas de arreglo
  };
}

/* ---------- Fuente (cisterna/material) ---------- */
function readFuente(r) {
  const d = r?.detalles || {};

  const f = _first(
    d.fuente,
    r?.fuente,
    get(r, "detalles.fuenteAgua"),
    get(r, "fuenteAgua"),
    get(r, "detalles.origenAgua"),
    get(r, "origenAgua"),
    get(r, "detalles.rio"),
    get(r, "rio"),
    // por si vino anidado en material
    get(r, "detalles.material.fuente"),
    get(r, "material.fuente")
  );

  const sub = _first(
    d.subFuente,
    r?.subFuente,
    get(r, "detalles.subFuenteAgua"),
    get(r, "subFuenteAgua"),
    get(r, "detalles.subfuente"),
    get(r, "subfuente")
  );

  if (!_hasVal(f)) return null;
  if ((f === "Ríos" || f === "Tajo") && _hasVal(sub)) return `${f} – ${sub}`;
  return f;
}

/* ---------- Estación helpers ---------- */
function _readStationPair(r) {
  const d = _first(
    get(r, "estacionDesde"),
    get(r, "estacion_desde"),
    get(r, "detalles.estacionDesde"),
    get(r, "detalles.estacion_desde"),
    get(r, "estacion.desde"),
    get(r, "detalles.estacion.desde")
  );
  const h = _first(
    get(r, "estacionHasta"),
    get(r, "estacion_hasta"),
    get(r, "detalles.estacionHasta"),
    get(r, "detalles.estacion_hasta"),
    get(r, "estacion.hasta"),
    get(r, "detalles.estacion.hasta")
  );
  return { d, h };
}
function _hasStationData(r) {
  const pre = _first(get(r, "estacion"), get(r, "detalles.estacion"));
  if (_hasVal(pre)) return true;
  const { d, h } = _readStationPair(r);
  return _hasVal(d) || _hasVal(h);
}

/* ---------------- detectores de tipo/variante ---------------- */
const getType = (r) => {
  if (!r) return "";
  const t1 =
    r.tipoMaquinaria && typeof r.tipoMaquinaria === "string"
      ? r.tipoMaquinaria
      : pick(get(r, "maquinaria.tipo"), r.tipo, "");
  return String(t1 || "").toLowerCase().trim();
};

const getVar = (r) => {
  if (!r) return "";

  // 1) campos directos
  const raw = pick(
    get(r, "variant"),
    get(r, "variante"),
    get(r, "detalles.variante"),
    get(r, "maquinaria.variant"),
    get(r, "detalles.cisterna.variante"),
    get(r, "detalles.carreta.variante"),
    get(r, "detalles.vagoneta.variante")
  );
  if (raw) return String(raw).toLowerCase().trim();

  // 2) heurísticas "list-safe" (sin detalles.*)
  const actividad = String(r?.tipoActividad ?? r?.actividad ?? "").toLowerCase();

  // a) cisterna: actividad con "agua"
  if (/(riego|transporte).*agua/.test(actividad) || actividad.includes("agua")) {
    return "cisterna";
  }

  // b) carreta: campos superficiales y keywords
  const hasCarretaShallow =
    r?.placaCarreta != null ||
    r?.tipoCarga != null ||
    r?.destino != null ||
    r?.placa_carreta != null ||
    r?.tipo_carga != null ||
    r?.destino_carga != null;

  const actividadCarreta =
    actividad.includes("carreta") ||
    actividad.includes("remolque") ||
    actividad.includes("tráiler") ||
    actividad.includes("trailer") ||
    // muchas veces ponen "transporte" solo cuando es carreta
    (actividad.includes("transporte") && !actividad.includes("agua"));

  if (hasCarretaShallow || actividadCarreta) {
    return "carreta";
  }

  // c) material (señales superficiales)
  const hasMaterialShallow =
    r?.tipoMaterial != null ||
    r?.cantidadMaterial != null ||
    r?.boleta != null ||
    r?.totalCantidadMaterial != null;
  if (hasMaterialShallow) return "material";

  // 3) heurísticas con detalles (por si viene el objeto completo)
  const hasCisternaDeep =
    get(r, "detalles.cisterna") != null ||
    get(r, "cisterna") != null ||
    get(r, "detalles.cantidadLiquido") != null ||
    get(r, "cantidadLiquido") != null ||
    get(r, "detalles.cantidad_agua") != null ||
    get(r, "cantidad_agua") != null ||
    get(r, "detalles.fuenteAgua") != null ||
    get(r, "fuenteAgua") != null;
  if (hasCisternaDeep) return "cisterna";

  const hasCarretaDeep =
    get(r, "detalles.carreta") != null ||
    get(r, "carreta") != null ||
    get(r, "detalles.placaCarreta") != null ||
    get(r, "placaCarreta") != null ||
    get(r, "detalles.tipoCarga") != null ||
    get(r, "tipoCarga") != null ||
    get(r, "detalles.destino") != null ||
    get(r, "destino") != null ||
    get(r, "detalles.placa_carreta") != null ||
    get(r, "placa_carreta") != null;
  if (hasCarretaDeep) return "carreta";

  const hasMaterialDeep =
    Array.isArray(get(r, "boletas")) ||
    Array.isArray(get(r, "detalles.boletas")) ||
    Array.isArray(get(r, "detalles.material.boletas")) ||
    get(r, "totalCantidadMaterial") != null ||
    get(r, "detalles.totalCantidadMaterial") != null ||
    get(r, "totalM3") != null ||
    get(r, "detalles.totalM3") != null ||
    get(r, "total_m3") != null ||
    get(r, "detalles.total_m3") != null ||
    get(r, "tipoMaterial") != null ||
    get(r, "detalles.tipoMaterial") != null ||
    get(r, "cantidadMaterial") != null ||
    get(r, "detalles.cantidadMaterial") != null ||
    get(r, "boleta") != null ||
    get(r, "detalles.boleta") != null;
  if (hasMaterialDeep) return "material";

  return "";
};

function flattenMunicipalReport(r) {
  const d = r && r.detalles ? r.detalles : {};
  const t = getType(r);          // vagoneta, cabezal, cisterna, …
  const v = getVar(r);           // material, carreta, cisterna, …

  const read = (...paths) => {
    for (const p of paths) {
      const val = get(r, p);
      if (val !== undefined && val !== null && String(val) !== "") return val;
    }
    return null;
  };

  const operadorTxt = r && r.operador
    ? `${r.operador.name ?? ""} ${r.operador.last ?? ""}${r.operador.identification ? ` (${r.operador.identification})` : ""}`
    : (r && r.operadorId) || "—";

  const maquinariaTxt = r && r.maquinaria
    ? `${r.maquinaria.tipo ?? ""}${r.maquinaria.placa ? ` - ${r.maquinaria.placa}` : ""}`
    : (r && r.maquinariaId) || "—";

  const flat = {
    Tipo: "Municipal",
    ID: r.id,
    Operador: operadorTxt,
    Maquinaria: maquinariaTxt,
    TipoMaquinaria: t || null,
    Variante: v || null,

    // medidores / horas
    Kilometraje: read("kilometraje", "detalles.kilometraje"),
    Horimetro: read("horimetro", "detalles.horimetro"),
    Diesel: read("diesel", "combustible"),
    HorasOrd: read("horasOrd", "horas_or"),
    HorasExt: read("horasExt", "horas_ext"),

    // actividad / horario
    TipoActividad: read("tipoActividad", "actividad"),
    HoraInicio: read("horaInicio", "detalles.horaInicio"),
    HoraFin: read("horaFin", "detalles.horaFin"),

    // admin
    Distrito: r.distrito ?? null,
    CodigoCamino: r.codigoCamino ?? null,
    Viaticos: r.viaticos ?? null,
    Fecha: r.fecha ?? null,

    // Estación unificada
    Estacion: (() => {
      const txt = toEstacionTxt(r);
      return txt === "—" ? null : txt;
    })(),
  };

  // —— VARIANTE CARRETA ——
  if ((t === "vagoneta" || t === "cabezal") && v === "carreta") {
    flat.PlacaCarreta = read(
      "placaCarreta", "detalles.placaCarreta", "detalles.carreta.placa",
      "placa_carreta", "detalles.placa_carreta"
    );
    flat.TipoCarga = read(
      "tipoCarga", "detalles.tipoCarga", "detalles.carreta.tipoCarga",
      "tipo_carga", "detalles.tipo_carga"
    );
    flat.Destino = read(
      "destino", "detalles.destino", "detalles.carreta.destino",
      "destino_carga", "detalles.destino_carga"
    );
  }

  // —— CISTERNA (tipo o variante) ——
  const isCisternaTipo = t === "cisterna";
  const isCisternaVar = (t === "vagoneta" || t === "cabezal") && v === "cisterna";
  if (isCisternaTipo || isCisternaVar) {
    flat.CantidadAgua_m3 = read(
      "cantidadLiquido", "detalles.cantidadLiquido",
      "cantidad_agua", "detalles.cantidad_agua",
      "detalles.cisterna.cantidad", "detalles.cisterna.cantidadLiquido"
    );
    flat.Fuente = readFuente(r) ?? read(
      "detalles.cisterna.fuenteAgua", "fuenteAgua", "detalles.fuenteAgua"
    );
    flat.PlacaCisterna = read(
      "placaCisterna", "detalles.placaCisterna",
      "cisternaPlaca", "placa_cisterna", "detalles.placa_cisterna",
      "detalles.cisterna.placa"
    );
  }

  // —— MATERIAL (además de boletas) ——
  if ((t === "vagoneta" || t === "cabezal") && v === "material") {
    // 1) Lee campos "simples" (si el backend los sigue enviando)
    flat.TipoMaterial = get(r, "detalles.tipoMaterial") ?? r?.tipoMaterial ?? "";
    flat.CantidadMaterial_m3 =
      get(r, "detalles.cantidadMaterial") ?? r?.cantidadMaterial ?? "";
    flat.BoletaSimple =
      get(r, "detalles.boleta") ?? r?.boleta ?? "";
    flat.Fuente = flat.Fuente ?? readFuente(r);

    flat.TotalDia_m3 =
      get(r, "detalles.totalCantidadMaterial") ??
      r?.totalCantidadMaterial ??
      get(r, "detalles.totalM3") ??
      r?.totalM3 ??
      get(r, "detalles.total_m3") ??
      r?.total_m3 ??
      "";

    // 2) Resumen por material (m³) a partir de boletas
    const breakdown = getMaterialBreakdown(r);
    const mats = Object.keys(breakdown);

    // Mostrar "Materiales_m3" cuando hay MÁS de 1 material.
    if (mats.length > 1) {
      flat.TipoMaterial = "";           // ocultar columna (la deja vacía)
      flat.CantidadMaterial_m3 = "";    // ocultar columna (la deja vacía)
      flat.Materiales_m3 = materialSummaryStr(breakdown); // ➜ Nueva columna compacta
    } else if (mats.length === 1) {
      // Si solo hay 1 material, asegúralo en las columnas clásicas
      const mat = mats[0];
      if (!flat.TipoMaterial) flat.TipoMaterial = mat;
      if (!flat.CantidadMaterial_m3) flat.CantidadMaterial_m3 = breakdown[mat];
    }

    // 3) “Boletas”: una sola columna multilínea (limpio y sin columnas vacías)
    const boletas = getBoletasArr(r) || [];
    const boletaToText = (b = {}) => {
      const num = b?.boleta ? `#${b.boleta}` : "—";
      const tipo = b?.tipoMaterial ? String(b.tipoMaterial) : "—";
      const fuente = b?.fuente ? String(b.fuente) : "—";
      const sub = (fuente === "Ríos" || fuente === "Tajo") && b?.subFuente
        ? ` | ${b.subFuente}`
        : "";
      // intenta agregar m³ por boleta, si existe
      const qRaw = b?.m3 ?? b?.cantidad ?? b?.metros3 ?? b?.volumen;
      const qStr = Number.isFinite(Number(qRaw)) ? ` | ${Number(qRaw)} m³` : "";
      return `${num} | ${tipo} | ${fuente}${sub}${qStr}`;
    };

    // Si no hay arreglo de boletas pero sí una boleta simple, arma una de una
    let list = boletas;
    if (!Array.isArray(list) || list.length === 0) {
      const simple = buildSimpleBoletaFromReport(r);
      list = simple ? [simple] : [];
    }

    // Flag: si quisieras "Boleta 1/2/3" en columnas separadas, pon true
    const MULTICOLUMN_MATERIAL = false;

    if (!MULTICOLUMN_MATERIAL) {
      flat.Boletas = list.map(boletaToText).join("\n");
    } else {
      list.forEach((b, i) => {
        flat[`Boleta ${i + 1}`] = boletaToText(b);
      });
    }
  }

  // común extra
  flat.PlacaMaquinariaLlevada = read(
    "placaMaquinariaLlevada", "detalles.placaMaquinariaLlevada",
    "placa_maquinaria_llevada", "detalles.placa_maquinaria_llevada"
  );

  return flat;
}


/* --- helpers de boletas y totales (para el modal) --- */
function getBoletasArr(r) {
  const paths = [
    "detalles.boletas",
    "boletas",
    "detalles.material.boletas",
    "material.boletas",
    "detalles.boletasDia",
    "boletasDia",
  ];
  for (const p of paths) {
    const v = get(r, p);
    if (Array.isArray(v)) return v;
  }
  return [];
}

function getTotalM3(r) {
  const paths = [
    "detalles.totalCantidadMaterial",
    "totalCantidadMaterial",
    "detalles.totalM3",
    "totalM3",
    "detalles.total_m3",
    "total_m3",
  ];
  for (const p of paths) {
    const v = get(r, p);
    if (v !== undefined && v !== null && v !== "") return v;
  }
  return null;
}

// Texto de estación "desde+hasta"
const toEstacionTxt = (r) => {
  const pre = _first(get(r, "estacion"), get(r, "detalles.estacion"));
  if (_hasVal(pre)) return String(pre);

  const { d, h } = _readStationPair(r);
  const L = _numOrUndef(d);
  const R = _numOrUndef(h);
  if (L !== undefined || R !== undefined) {
    const ltxt = L !== undefined ? L : "—";
    const rtxt = R !== undefined ? R : "—";
    return `${ltxt}+${rtxt}`;
  }
  return "—";
};

// ¿Esta fila usa columna Estación?
const usesStation = (r) => {
  const t = getType(r);
  return STATION_TYPES.has(t) || _hasStationData(r);
};

/* --------- filas para export --------- */
function buildMunicipalExportRow(r) {
  const t = getType(r);
  const operadorTxt = r?.operador
    ? `${r.operador?.name ?? ""} ${r.operador?.last ?? ""}${r.operador?.identification ? ` (${r.operador.identification})` : ""
    }`
    : r?.operadorId ?? "—";

  const maquinariaTxt = r?.maquinaria
    ? `${r.maquinaria?.tipo ?? ""}${r.maquinaria?.placa ? ` - ${r.maquinaria.placa}` : ""
    }`
    : r?.maquinariaId ?? "—";

  const horasTxt = `${showNum(pick(r?.horasOrd, r?.horas_or))} / ${showNum(
    pick(r?.horasExt, r?.horas_ext)
  )}`;

  const metricVal = isKmType(t)
    ? showNum(pick(r?.kilometraje, get(r, "detalles.kilometraje")))
    : showNum(pick(r?.horimetro, get(r, "detalles.horimetro")));

  const tipoActividad = showText(pick(r.tipoActividad, r.actividad));
  const hi = pick(r.horaInicio, get(r, "detalles.horaInicio"));
  const hf = pick(r.horaFin, get(r, "detalles.horaFin"));
  const horario = hi || hf ? `${showText(hi)} – ${showText(hf)}` : "—";

  const estacionTxt = STATION_TYPES.has(t) ? toEstacionTxt(r) : "—";

  return [
    "Municipal",
    r.id,
    operadorTxt,
    maquinariaTxt,
    metricVal,
    showNum(pick(r?.diesel, r?.combustible)),
    horasTxt,
    estacionTxt,
    tipoActividad,
    horario,
    showText(r?.distrito),
    showText(r?.codigoCamino),
    showNum(r?.viaticos),
    fmtDMY(r?.fecha),
  ];
}

const EXPORT_HEADERS_RENTAL = [
  "Tipo",
  "ID",
  "Operador",
  "Tipo Maquinaria",
  "Placa",
  "Actividad",
  "Cantidad",
  "Horas",
  "Estación",
  "Boleta",
  "Fuente",
  "Fecha",
];

function saveXlsx(wb, base) {
  const name = `${base}_${todayLocalISO()}.xlsx`;
  XLSX.writeFile(wb, name);
}


// Etiquetas bonitas para headers (opcional)
function pretty(key) {
  return String(key)
    .replaceAll("_", " ")
    .replace(/([a-z])([A-Z])/g, "$1 $2")
    .replace(/\b(m3)\b/gi, "m³")
    .trim();
}

// ¿Está vacío para exportar?
function isEmptyVal(v) {
  return v === undefined || v === null || v === "" || (typeof v === "number" && Number.isNaN(v));
}

// Quita columnas donde TODAS las filas están vacías
function pruneEmptyColumns(rows, headers) {
  return headers.filter((h) => rows.some((r) => !isEmptyVal(r[h])));
}

// Suma m³ por tipo de material a partir de boletas (tolera varios nombres)
function getMaterialBreakdown(r) {
  const boletas = getBoletasArr(r) || [];
  const map = new Map();

  for (const b of boletas) {
    const mat = (b?.tipoMaterial || "").trim();
    const qRaw = b?.m3 ?? b?.cantidad ?? b?.metros3 ?? b?.volumen ?? 0;
    const q = Number(qRaw);
    if (!mat || !Number.isFinite(q) || q <= 0) continue;
    map.set(mat, (map.get(mat) || 0) + q);
  }

  // Fallback si vino “simple”
  if (map.size === 0) {
    const mat = get(r, "detalles.tipoMaterial") ?? r?.tipoMaterial;
    const q = Number(get(r, "detalles.cantidadMaterial") ?? r?.cantidadMaterial);
    if (mat && Number.isFinite(q)) map.set(String(mat), q);
  }

  return Object.fromEntries(map);
}

// Texto multilínea "Material: m³"
function materialSummaryStr(breakdown) {
  const entries = Object.entries(breakdown);
  return entries.length ? entries.map(([k, v]) => `${k}: ${v} m³`).join("\n") : "";
}


/* ==================== componente principal ==================== */
export default function ReportsTable({
  municipalReports = [],
  rentalReports = [],
  districts: districtsProp,
}) {
  /* estado base */
  const [rowsMunicipal, setRowsMunicipal] = useState(municipalReports);
  const [rowsRental, setRowsRental] = useState(rentalReports);

  useEffect(() => setRowsMunicipal(municipalReports), [municipalReports]);
  useEffect(() => setRowsRental(rentalReports), [rentalReports]);

  /* eliminar */
  const [confirmDeleteId, setConfirmDeleteId] = useState(null);
  const [deleteReason, setDeleteReason] = useState("");
  const [deleteOpen, setDeleteOpen] = useState(false);
  const [deleting, setDeleting] = useState(false); // <-- opcional para loading

  /* ver */
  const [detailsOpen, setDetailsOpen] = useState(false);
  const [selectedRow, setSelectedRow] = useState(null);

  /* eliminados */
  const [deletedOpen, setDeletedOpen] = useState(false);
  const [deletedRows, setDeletedRows] = useState([]);
  const [loadingDeleted, setLoadingDeleted] = useState(false);

  /* pestañas / filtros */
  const [activeReportTab, setActiveReportTab] = useState("municipal");
  const isMunicipal = activeReportTab === "municipal";
  const isRental = activeReportTab === "alquiler";

  const today = todayLocalISO();
  const [startDate, setStartDate] = useState("");
  const [endDate, setEndDate] = useState("");
  const [codigoFilter, setCodigoFilter] = useState("");
  const [distritoFilter, setDistritoFilter] = useState("");

  const [typeFilter, setTypeFilter] = useState("");
  const [variantFilter, setVariantFilter] = useState("");
  const [actividadFilter, setActividadFilter] = useState("");

  const [page, setPage] = useState(1);

  /* flags para autoselección */
  const appliedDefaultType = useRef(false);
  const appliedDefaultVariant = useRef(false);

  /* ámbito */
  const activeReports = useMemo(
    () => (isMunicipal ? rowsMunicipal : rowsRental),
    [isMunicipal, rowsMunicipal, rowsRental]
  );

  const districts = useMemo(() => {
    if (Array.isArray(districtsProp) && districtsProp.length) return districtsProp;
    const set = new Set();
    [...rowsMunicipal, ...rowsRental].forEach((r) => {
      const d = (r?.distrito || "").trim();
      if (d) set.add(d);
    });
    return Array.from(set).sort((a, b) => a.localeCompare(b));
  }, [rowsMunicipal, rowsRental, districtsProp]);

  const rowsScope = useMemo(() => {
    let rows = Array.isArray(activeReports) ? activeReports.slice() : [];
    const takeDate = (r) => toISODateOnly(r?.fecha || "");

    if (startDate || endDate) {
      rows = rows.filter((r) => {
        const d = takeDate(r);
        if (!d) return false;
        if (startDate && d < startDate) return false;
        if (endDate && d > endDate) return false;
        return true;
      });
    }
    if (isMunicipal) {
      if (distritoFilter)
        rows = rows.filter((r) => (r?.distrito || "").trim() === distritoFilter);
      if (codigoFilter)
        rows = rows.filter(
          (r) =>
            String(r?.codigoCamino ?? "").trim() ===
            String(codigoFilter).trim()
        );
    }
    return rows;
  }, [activeReports, startDate, endDate, distritoFilter, codigoFilter, isMunicipal]);

  const tiposDisponibles = useMemo(() => {
    const set = new Set();
    rowsScope.forEach((r) => {
      const t = getType(r);
      if (t) set.add(t);
    });
    // ordenar por prioridad definida
    const arr = Array.from(set);
    arr.sort((a, b) => {
      const ia = TYPE_ORDER.indexOf(a);
      const ib = TYPE_ORDER.indexOf(b);
      const A = ia === -1 ? 999 : ia;
      const B = ib === -1 ? 999 : ib;
      return A - B || a.localeCompare(b);
    });
    return arr;
  }, [rowsScope]);

  /* ---------- autoselección de TIPO al entrar en Municipales ---------- */
  useEffect(() => {
    if (!isMunicipal) return;
    if (!typeFilter && tiposDisponibles.length && !appliedDefaultType.current) {
      setTypeFilter(tiposDisponibles[0]);
      setPage(1);
      appliedDefaultType.current = true;
    }
  }, [isMunicipal, typeFilter, tiposDisponibles]);

  /* si desaparece el tipo seleccionado, limpiar y permitir re-aplicar */
  useEffect(() => {
    if (typeFilter && !tiposDisponibles.includes(typeFilter)) {
      setTypeFilter("");
      setVariantFilter("");
      setPage(1);
      appliedDefaultType.current = false;
      appliedDefaultVariant.current = false;
    }
  }, [tiposDisponibles, typeFilter]);

  /* ---------- autoselección de VARIANTE cuando el tipo es vagoneta / cabezal ---------- */
  const variantesDisponibles = useMemo(() => {
    if (!isMunicipal) return [];
    const t = (typeFilter || "").toLowerCase();
    return VARIANT_OPTIONS_BY_TYPE[t] ?? [];
  }, [typeFilter, isMunicipal]);

  useEffect(() => {
    if (!isMunicipal) return;

    const t = (typeFilter || "").toLowerCase();
    const options = VARIANT_OPTIONS_BY_TYPE[t] || [];

    if (!VARIANT_TYPES.has(t)) {
      // tipos sin variantes
      if (variantFilter) setVariantFilter("");
      appliedDefaultVariant.current = false;
      return;
    }

    // si no hay variante aplicada o no es válida -> elegir por orden
    if (!options.includes(variantFilter) && options.length) {
      const candidate =
        VARIANT_ORDER.find((v) => options.includes(v)) || options[0];
      setVariantFilter(candidate);
      setPage(1);
      appliedDefaultVariant.current = true;
    }
  }, [isMunicipal, typeFilter, variantesDisponibles]); // eslint-disable-line

  const actividadesDisponibles = useMemo(() => {
    if (isMunicipal) return [];
    const set = new Set();
    rowsScope.forEach((r) => {
      if (r?.actividad && typeof r.actividad === "string") set.add(r.actividad);
    });
    return Array.from(set).sort((a, b) => a.localeCompare(b));
  }, [rowsScope, isMunicipal]);

  const filtered = useMemo(() => {
    let rows = rowsScope;

    if (typeFilter) {
      const t = typeFilter.toLowerCase();
      rows = rows.filter((r) => getType(r) === t);

      if (isMunicipal && VARIANT_TYPES.has(t)) {
        // aplicar SIEMPRE la variante elegida/autoelegida
        rows = rows.filter((r) => getVar(r) === variantFilter);
      }
    }

    if (isRental && actividadFilter)
      rows = rows.filter((r) => r?.actividad === actividadFilter);
    return rows;
  }, [
    rowsScope,
    typeFilter,
    variantFilter,
    actividadFilter,
    isMunicipal,
    isRental,
  ]);

  /* columnas compactas */
  const COLUMNS_MUNICIPAL_BASE = [
    "ID",
    "Operador",
    "Maquinaria",
    "Distrito",
    "Código Camino",
    "Fecha",
  ];

  const columns = useMemo(() => {
    if (!isMunicipal)
      return ["ID", "Operador", "Tipo Maquinaria", "Placa", "Actividad", "Fecha"];
    if (!typeFilter) return COLUMNS_MUNICIPAL_BASE;
    const t = (typeFilter || "").toLowerCase();
    const cols = [...COLUMNS_MUNICIPAL_BASE];

    const insertAfter = (arr, after, label) => {
      const i = arr.indexOf(after);
      if (i >= 0) arr.splice(i + 1, 0, label);
      else arr.push(label);
    };

    if (VARIANT_TYPES.has(t)) insertAfter(cols, "Maquinaria", "Variante");
    if (STATION_TYPES.has(t)) insertAfter(cols, "Maquinaria", "Estación");
    if (VARIANT_TYPES.has(t) && (variantFilter || "").toLowerCase() === "cisterna") {
      insertAfter(cols, "Maquinaria", "Placa cisterna");
    }

    return cols;
  }, [isMunicipal, typeFilter, variantFilter]);

  /* celdas según columna */
  function cellValueMunicipal(r, col) {
    switch (col) {
      case "ID":
        return r.id;
      case "Operador":
        return r?.operador
          ? `${r.operador?.name ?? ""} ${r.operador?.last ?? ""}${r.operador?.identification
            ? ` (${r.operador.identification})`
            : ""
          }`
          : r?.operadorId ?? "—";
      case "Maquinaria":
        if (r?.maquinaria) {
          const tipo = r.maquinaria?.tipo ?? "";
          const placa = r.maquinaria?.placa ? ` - ${r.maquinaria.placa}` : "";
          return `${tipo}${placa}`;
        }
        return r?.maquinariaId ?? "—";

      case "Placa cisterna":
        return showText(
          get(r, "detalles.placaCisterna") ||
          get(r, "placaCisterna") ||
          get(r, "detalles.cisterna.placa") ||
          get(r, "placa_cisterna") ||
          get(r, "detalles.placa_cisterna")
        );

      case "Variante":
        return getVar(r) || "—";
      case "Estación":
        return toEstacionTxt(r);
      case "Distrito":
        return showText(r?.distrito);
      case "Código Camino":
        return showText(r?.codigoCamino);
      case "Fecha":
        return fmtDMY(r?.fecha);
      default:
        return "—";
    }
  }
  function cellValueRental(r, col) {
    switch (col) {
      case "ID":
        return r.id;
      case "Operador":
        return r?.operador
          ? `${r.operador?.name ?? ""} ${r.operador?.last ?? ""}${r.operador?.identification
            ? ` (${r.operador.identification})`
            : ""
          }`
          : r?.operadorId ?? "—";
      case "Tipo Maquinaria":
        return showText(r?.tipoMaquinaria);
      case "Placa":
        return showText(r?.placa);
      case "Actividad":
        return showText(r?.actividad);
      case "Fecha":
        return fmtDMY(r?.fecha);
      default:
        return "—";
    }
  }

  /* paginación */
  const totalPages = Math.max(1, Math.ceil(filtered.length / 10));
  useEffect(() => {
    if (page > totalPages) setPage(1);
  }, [totalPages, page]);
  const pageRows = useMemo(
    () => filtered.slice((page - 1) * 10, (page - 1) * 10 + 10),
    [filtered, page]
  );

  /* -------- Ver (trae full antes de abrir) -------- */
  const openView = async (row) => {
    try {
      const full = isMunicipal
        ? await machineryService.getReportById(row.id)
        : await machineryService.getRentalReportById(row.id);

      console.log("FULL REPORT", full); // 👈 mira aquí las rutas reales
      setSelectedRow(full);
      setDetailsOpen(true);
    } catch (e) {
      console.error("GET detalle ->", e?.response || e);
    }
  };


  /* -------- eliminar -------- */
  const askDelete = (row) => {
    setConfirmDeleteId(row.id);
    setDeleteOpen(true);
  };
  const confirmDelete = async () => {
    const id = confirmDeleteId;
    if (!id) return;
    try {
      if (isMunicipal) {
        await machineryService.deleteReport(id, deleteReason.trim());
        setRowsMunicipal((prev) => prev.filter((r) => r.id !== id));
      } else {
        await machineryService.deleteRentalReport(id, deleteReason.trim());
        setRowsRental((prev) => prev.filter((r) => r.id !== id));
      }
      setDeleteOpen(false);
    } catch (err) {
      console.error("DELETE report ->", err?.response || err);
      alert("No se pudo eliminar el reporte");
    } finally {
      setConfirmDeleteId(null);
      setDeleteReason("");
    }
  };

  /* -------- eliminados -------- */
  const openDeleted = async () => {
    try {
      setLoadingDeleted(true);
      const rows = isMunicipal
        ? await machineryService.getDeletedMunicipal()
        : await machineryService.getDeletedRental();
      setDeletedRows(rows);
      setDeletedOpen(true);
    } catch (err) {
      console.error("GET deleted ->", err?.response || err);
    } finally {
      setLoadingDeleted(false);
    }
  };

  const anyCisternaVar = filtered.some(
    r => (["vagoneta", "cabezal"].includes(getType(r)) && getVar(r) === "cisterna")
  );

  function buildFlatRowMunicipal(r) {
    const d = r?.detalles || {};
    const t = getType(r);
    const v = getVar(r);
    const kmType = isKmType(t);

    const operadorTxt = r?.operador
      ? `${r.operador?.name ?? ""} ${r.operador?.last ?? ""}${r.operador?.identification ? ` (${r.operador.identification})` : ""}`
      : r?.operadorId ?? "";

    const maquinariaTxt = r?.maquinaria
      ? `${r.maquinaria?.tipo ?? ""}${r.maquinaria?.placa ? ` - ${r.maquinaria.placa}` : ""}`
      : r?.maquinariaId ?? "";

    const flat = {
      Tipo: "Municipal",
      ID: r.id,
      Operador: operadorTxt,
      Maquinaria: maquinariaTxt,
      TipoMaquinaria: t || "",
      Variante: v || "",
      Kilometraje: kmType ? (r?.kilometraje ?? d?.kilometraje ?? "") : "",
      Horimetro: !kmType ? (r?.horimetro ?? d?.horimetro ?? "") : "",
      Diesel: pick(r?.diesel, r?.combustible) ?? "",
      HorasOrd: pick(r?.horasOrd, r?.horas_or) ?? "",
      HorasExt: pick(r?.horasExt, r?.horas_ext) ?? "",
      TipoActividad: pick(r?.tipoActividad, r?.actividad) ?? "",
      HoraInicio: pick(r?.horaInicio, d?.horaInicio) ?? "",
      HoraFin: pick(r?.horaFin, d?.horaFin) ?? "",
      Distrito: r?.distrito ?? "",
      CodigoCamino: r?.codigoCamino ?? "",
      Fecha: fmtDMY(r?.fecha),
      Estacion: usesStation(r) ? toEstacionTxt(r) : "",
      PlacaMaquinariaLlevada: d?.placaMaquinariaLlevada ?? r?.placaMaquinariaLlevada ?? "",
      // “simples” (se ocultarán si hay >1 material)
      TipoMaterial: d?.tipoMaterial ?? r?.tipoMaterial ?? "",
      CantidadMaterial_m3: d?.cantidadMaterial ?? r?.cantidadMaterial ?? "",
      BoletaSimple: d?.boleta ?? r?.boleta ?? "",
      Fuente: readFuente(r) ?? "",
      TotalDia_m3: getTotalM3(r) ?? "",
    };

    // ==== Material: decidir entre columnas clásicas VS resumen por material ====
    const isMaterialVar = (t === "vagoneta" || t === "cabezal") && v === "material";
    if (isMaterialVar) {
      const breakdown = getMaterialBreakdown(r);
      const mats = Object.keys(breakdown);
      if (mats.length > 1) {
        // hay varios materiales -> oculta columnas clásicas y crea “Materiales (m³)”
        flat.TipoMaterial = "";
        flat.CantidadMaterial_m3 = "";
        flat.Materiales_m3 = materialSummaryStr(breakdown); // NUEVA columna compacta
      } else if (mats.length === 1) {
        // un solo material -> asegura las clásicas
        const mat = mats[0];
        if (!flat.TipoMaterial) flat.TipoMaterial = mat;
        if (!flat.CantidadMaterial_m3) flat.CantidadMaterial_m3 = breakdown[mat];
      }

      // Boletas compactas: Boleta 1/2/3 ... o una sola columna “Boletas”
      let list = getBoletasArr(r);
      if (!Array.isArray(list) || list.length === 0) {
        const simple = {
          boleta: flat.BoletaSimple || "",
          tipoMaterial: flat.TipoMaterial || "",
          fuente: flat.Fuente || "",
          subFuente: "",
        };
        list = simple.boleta || simple.tipoMaterial || simple.fuente ? [simple] : [];
      }

      if (list.length <= 1) {
        const b = list[0] || null;
        flat["Boletas"] = b
          ? `#${b.boleta || "—"} | ${b.tipoMaterial || "—"} | ${b.fuente || "—"}${(b.fuente === "Ríos" || b.fuente === "Tajo") && b.subFuente ? ` | ${b.subFuente}` : ""}`
          : "";
      } else {
        list.forEach((b, i) => {
          const sub = (b.fuente === "Ríos" || b.fuente === "Tajo") && b.subFuente ? ` | ${b.subFuente}` : "";
          flat[`Boleta ${i + 1}`] = `#${b.boleta || "—"} | ${b.tipoMaterial || "—"} | ${b.fuente || "—"}${sub}`;
        });
      }
    }

    // Carreta
    if ((t === "vagoneta" || t === "cabezal") && v === "carreta") {
      flat.PlacaCarreta = d?.placaCarreta ?? d?.carreta?.placa ?? r?.placaCarreta ?? r?.placa_carreta ?? "";
      flat.TipoCarga = d?.tipoCarga ?? r?.tipoCarga ?? "";
      flat.Destino = d?.destino ?? r?.destino ?? "";
    }

    // Cisterna (tipo o variante)
    const isCisternaTipo = t === "cisterna";
    const isCisternaVar = (t === "vagoneta" || t === "cabezal") && v === "cisterna";
    if (isCisternaTipo || isCisternaVar) {
      flat.CantidadAgua_m3 = d?.cantidadLiquido ?? r?.cantidadLiquido ?? d?.cantidad_agua ?? r?.cantidad_agua ?? "";
      flat.Fuente = flat.Fuente || readFuente(r) || "";
      flat.PlacaCisterna = d?.placaCisterna ?? r?.placaCisterna ?? d?.cisterna?.placa ?? r?.placa_cisterna ?? d?.placa_cisterna ?? "";
    }

    return flat;
  }

  function buildFlatRowRental(r) {
    const operadorTxt = r?.operador
      ? `${r.operador?.name ?? ""} ${r.operador?.last ?? ""}${r.operador?.identification ? ` (${r.operador.identification})` : ""}`
      : r?.operadorId ?? "";

    return {
      Tipo: "Alquiler",
      ID: r.id,
      Operador: operadorTxt,
      TipoMaquinaria: r?.tipoMaquinaria ?? "",
      Placa: r?.placa ?? "",
      Actividad: r?.actividad ?? "",
      Cantidad: r?.cantidad ?? "",
      Horas: r?.horas ?? "",
      Estacion: r?.estacion ?? "",
      Boleta: r?.boleta ?? "",
      Fuente: readFuente(r) ?? "",
      Fecha: fmtDMY(r?.fecha),
    };
  }

  const exportExcel = () => {
    // 1) Aplana reportes
    let rows = isMunicipal
      ? filtered.map(buildFlatRowMunicipal)
      : filtered.map(buildFlatRowRental);

    // 2) Normalización global de boletas:
    //    - Si alguna fila tiene 2+ boletas => eliminar la columna "Boletas" para todas
    //    - Si ninguna tiene 2+ => eliminar "Boleta 1/2/3" si quedaron
    const maxBoletas = rows.reduce((m, r) => {
      const n = Object.keys(r).filter(k => /^Boleta \d+$/.test(k)).length;
      return Math.max(m, n);
    }, 0);

    if (maxBoletas > 0) {
      rows = rows.map(r => {
        const { Boletas, ...rest } = r; // quita "Boletas"
        return rest;
      });
    } else {
      rows = rows.map(r => {
        const clean = { ...r };
        Object.keys(clean).forEach(k => {
          if (/^Boleta \d+$/.test(k)) delete clean[k];
        });
        return clean;
      });
    }

    // 3) Headers dinámicos y prune de columnas 100% vacías
    let headers = Array.from(new Set(rows.flatMap(r => Object.keys(r))));
    headers = pruneEmptyColumns(rows, headers);

    // 4) AOA -> XLSX
    const aoa = [
      headers.map(pretty),
      ...rows.map(row => headers.map(h => (isEmptyVal(row[h]) ? "" : row[h]))),
    ];

    const ws = XLSX.utils.aoa_to_sheet(aoa);
    const wb = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(wb, ws, "Reportes completos");
    saveXlsx(
      wb,
      isMunicipal ? "reportes_municipales_completos" : "reportes_alquiler_completos"
    );
  };


  const exportPDF = () => {
    // 1) Aplana reportes
    let rows = isMunicipal
      ? filtered.map(buildFlatRowMunicipal)
      : filtered.map(buildFlatRowRental);

    // 2) Normalización global de boletas (mismo criterio que Excel)
    const maxBoletas = rows.reduce((m, r) => {
      const n = Object.keys(r).filter(k => /^Boleta \d+$/.test(k)).length;
      return Math.max(m, n);
    }, 0);

    if (maxBoletas > 0) {
      rows = rows.map(r => {
        const { Boletas, ...rest } = r; // quita "Boletas"
        return rest;
      });
    } else {
      rows = rows.map(r => {
        const clean = { ...r };
        Object.keys(clean).forEach(k => {
          if (/^Boleta \d+$/.test(k)) delete clean[k];
        });
        return clean;
      });
    }

    // 3) Headers y prune
    let headers = Array.from(new Set(rows.flatMap(r => Object.keys(r))));
    headers = pruneEmptyColumns(rows, headers);

    // 4) helper para saltos de línea
    const toHTML = (v) => (isEmptyVal(v) ? "—" : String(v).replace(/\n/g, "<br>"));

    // 5) Tabla
    const thead = `<tr>${headers.map(h => `<th><div class="th">${pretty(h)}</div></th>`).join("")}</tr>`;
    const tbody = rows
      .map(row => `<tr>${headers.map(h => `<td>${toHTML(row[h])}</td>`).join("")}</tr>`)
      .join("");

    // 6) Rutas absolutas de header/footer
    const headerAbs = new URL(HEADER_URL, window.location.origin).toString();
    const footerAbs = new URL(FOOTER_URL, window.location.origin).toString();

    // 7) HTML y estilos
    const head = `
  <style>
    @page { size: A4 landscape; margin: 100px 22px 70px 22px; }
    html, body { margin:0; padding:0; font-family: system-ui,-apple-system,"Segoe UI",Roboto,Arial,sans-serif; }
    header { height:72px; position:fixed; top:0; left:0; right:0; display:flex; align-items:center; justify-content:center; }
    footer { position:fixed; bottom:0; left:0; right:0; height:40px; display:flex; align-items:center; justify-content:center; }
    header img, footer img { max-height:100%; width:auto; object-fit:contain; }
    main { padding-top:60px; }
    h1 { font-size:16px; margin:0 0 10px; }
    table { width:100%; border-collapse:collapse; table-layout:fixed; font-size:10px; }
    thead { display:table-header-group; }
    thead th { background:#f3f4f6; border:1px solid #e5e7eb; padding:6px 5px; vertical-align:bottom; }
    thead .th { line-height:1.1; hyphens:auto; word-break:break-word; }
    tbody td { border:1px solid #f1f5f9; padding:5px 6px; vertical-align:top; word-break:break-word; hyphens:auto; }
    tbody tr:nth-child(even) td { background:#fafafa; }
    tr { page-break-inside: avoid; }
    .meta { margin:6px 0 12px; font-size:11px; color:#374151; }
  </style>`;

    const html = `
  <html>
    <head><title>Reportes completos</title>${head}</head>
    <body>
      <header><img src="${headerAbs}" alt="Encabezado" /></header>
      <footer><img src="${footerAbs}" alt="Pie de página" /></footer>
      <main>
        <h1>Reportes completos</h1>
        <div class="meta">${isMunicipal ? "Municipales" : "Alquiler"} — ${rows.length} registro(s)</div>
        <table>
          <thead>${thead}</thead>
          <tbody>${tbody}</tbody>
        </table>
      </main>
    </body>
  </html>`;

    const win = window.open("", "_blank");
    win.document.open(); win.document.write(html); win.document.close();

    const waitImages = () =>
      Promise.all(Array.from(win.document.images).map(img => new Promise(res => {
        if (img.complete) return res(); img.onload = res; img.onerror = res;
      })));

    waitImages().then(() => { win.focus(); win.print(); });
    win.onafterprint = () => { try { win.close(); } catch { } };
  };


  const [filtersOpen, setFiltersOpen] = useState(false);

  /* ---------------- render ---------------- */
  return (
    <div className="space-y-4 max-w-[1500px] mx-auto px-4">
      {/* Pestañas */}
      <div className="flex border-b border-gray-200">
        <button
          onClick={() => {
            setActiveReportTab("municipal");
            setVariantFilter("");
            setActividadFilter("");
            setPage(1);
            appliedDefaultType.current = false;
            appliedDefaultVariant.current = false;
          }}
          className={`px-6 py-3 text-sm font-medium border-b-2 transition-colors ${isMunicipal
            ? "border-blue-500 text-blue-600 bg-blue-50"
            : "border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300"
            }`}
        >
          <span className="flex items-center gap-2">
            🏛️ Reportes Municipales
            <span className="bg-blue-100 text-blue-800 text-xs px-2 py-1 rounded-full">
              {rowsMunicipal.length}
            </span>
          </span>
        </button>
        <button
          onClick={() => {
            setActiveReportTab("alquiler");
            setTypeFilter("");
            setVariantFilter("");
            setActividadFilter("");
            setPage(1);
          }}
          className={`px-6 py-3 text-sm font-medium border-b-2 transition-colors ${isRental
            ? "border-green-500 text-green-600 bg-green-50"
            : "border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300"
            }`}
        >
          <span className="flex items-center gap-2">
            🚛 Reportes de Alquiler
            <span className="bg-green-100 text-green-800 text-xs px-2 py-1 rounded-full">
              {rowsRental.length}
            </span>
          </span>
        </button>
      </div>

      {/* === Panel de Filtros (colapsable) === */}
      <div className="rounded-2xl border bg-white">
        {/* Header del panel */}
        <div className="flex items-center justify-between px-4 py-3">
          <div className="flex items-center gap-3">
            <FilterIcon className="h-5 w-5 text-gray-700" />
            <div className="flex items-baseline gap-2">
              <h3 className="font-semibold text-gray-800">Filtros de reportes</h3>
              <span className="text-sm text-gray-500">
                ({filtered.length} registro{filtered.length === 1 ? "" : "s"})
              </span>
            </div>
          </div>

          {/* Acciones derecha */}
          <div className="flex items-center gap-2 flex-wrap justify-end">
            <Button
              variant="secondary"
              onClick={() => setFiltersOpen((v) => !v)}
              className="whitespace-nowrap"
            >
              {filtersOpen ? "Ocultar filtros" : "Mostrar filtros"}
            </Button>

            <Button
              variant="secondary"
              onClick={() => {
                setStartDate("");
                setEndDate("");
                setCodigoFilter("");
                setDistritoFilter("");
                setTypeFilter("");
                setVariantFilter("");
                setActividadFilter("");
                setPage(1);
                appliedDefaultType.current = false;
                appliedDefaultVariant.current = false;
              }}
              className="px-3"
              title="Reiniciar filtros"
            >
              <RefreshCcw className="h-4 w-4" />
            </Button>

            <div className="flex items-center gap-2 pl-3 border-l md:flex hidden">
              <Button
                className="bg-green-500 hover:bg-green-600 text-white whitespace-nowrap"
                onClick={exportExcel}
              >
                Exp a Excel
              </Button>
              <Button
                className="bg-red-500 hover:bg-red-600 text-white whitespace-nowrap"
                onClick={exportPDF}
              >
                Exp a PDF
              </Button>
              <Button
                variant="secondary"
                className="whitespace-nowrap"
                onClick={openDeleted}
              >
                Ver reportes eliminados
              </Button>
            </div>
          </div>
        </div>
      </div>

      {/* Cuerpo colapsable */}
      {filtersOpen && (
        <div className="px-4 pb-4">
          <div className="flex flex-wrap md:flex-nowrap items-center gap-3">
            <div className="w-40">
              <Input
                type="date"
                value={startDate}
                max={today}
                onChange={(e) => {
                  const v = e.target.value;
                  setStartDate(v);
                  if (endDate && v && endDate < v) setEndDate(v);
                  setPage(1);
                }}
              />
            </div>
            <span className="text-gray-400 hidden md:inline">→</span>
            <div className="w-40">
              <Input
                type="date"
                value={endDate}
                min={startDate || undefined}
                max={today}
                onChange={(e) => {
                  setEndDate(e.target.value);
                  setPage(1);
                }}
              />
            </div>

            {/* Solo municipal: código + distrito */}
            {isMunicipal && (
              <>
                <div className="w-28">
                  <Input
                    placeholder="Cód."
                    value={codigoFilter}
                    onChange={(e) => {
                      const digits = e.target.value.replace(/\D/g, "").slice(0, 3);
                      setCodigoFilter(digits);
                      setPage(1);
                    }}
                  />
                </div>
                <div className="w-56">
                  <Select
                    value={distritoFilter}
                    onValueChange={(v) => {
                      setDistritoFilter(v);
                      setPage(1);
                    }}
                  >
                    <SelectTrigger>
                      <SelectValue placeholder="Distrito" />
                    </SelectTrigger>
                    <SelectContent>
                      {districts.map((d) => (
                        <SelectItem key={d} value={d}>
                          {d}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
              </>
            )}

            <Button
              variant="ghost"
              onClick={() => {
                setStartDate("");
                setEndDate("");
                setCodigoFilter("");
                setDistritoFilter("");
                setTypeFilter("");
                setVariantFilter("");
                setActividadFilter("");
                setPage(1);
                appliedDefaultType.current = false;
                appliedDefaultVariant.current = false;
              }}
              className="whitespace-nowrap"
            >
              Limpiar
            </Button>
          </div>

          <div className="my-3 border-t" />

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <div className="text-sm font-medium text-gray-700 mb-1">Tipo</div>
              <Select
                value={typeFilter}
                onValueChange={(v) => {
                  setTypeFilter(v);
                  setVariantFilter("");
                  setActividadFilter("");
                  setPage(1);
                  appliedDefaultVariant.current = false;
                }}
                disabled={tiposDisponibles.length === 0}
              >
                <SelectTrigger>
                  <SelectValue
                    placeholder={
                      tiposDisponibles.length
                        ? "Seleccionar tipo"
                        : "No hay tipos en el ámbito"
                    }
                  />
                </SelectTrigger>
                <SelectContent>
                  {tiposDisponibles.map((t) => (
                    <SelectItem key={t} value={t}>
                      {t}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            {isMunicipal &&
              typeFilter &&
              (VARIANT_OPTIONS_BY_TYPE[(typeFilter || "").toLowerCase()] || [])
                .length > 0 && (
                <div>
                  <div className="text-sm font-medium text-gray-700 mb-1">
                    Variante
                  </div>
                  <Select
                    value={variantFilter}
                    onValueChange={(v) => {
                      setVariantFilter(v);
                      setPage(1);
                    }}
                  >
                    <SelectTrigger>
                      <SelectValue placeholder="Variante" />
                    </SelectTrigger>
                    <SelectContent>
                      {(
                        VARIANT_OPTIONS_BY_TYPE[(typeFilter || "").toLowerCase()] ||
                        []
                      ).map((v) => (
                        <SelectItem key={v} value={v}>
                          {v}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
              )}

            {isRental && (
              <div>
                <div className="text-sm font-medium text-gray-700 mb-1">
                  Actividad
                </div>
                <Select
                  value={actividadFilter}
                  onValueChange={(v) => {
                    setActividadFilter(v);
                    setPage(1);
                  }}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Filtrar por actividad" />
                  </SelectTrigger>
                  <SelectContent>
                    {actividadesDisponibles.map((a) => (
                      <SelectItem key={a} value={a}>
                        {a}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            )}
          </div>
        </div>
      )}

      {/* Tabla */}
      <div className="rounded-2xl border bg-white">
        <table className="w-full table-auto text-sm">
          <colgroup>
            <col className="w-28" />
            {isMunicipal
              ? columns.map((c) => {
                const w =
                  {
                    ID: "w-14",
                    Operador: "w-[220px]",
                    Maquinaria: "w-[220px]",
                    Variante: "w-20",
                    Estación: "w-24",
                    Distrito: "w-28",
                    "Código Camino": "w-24",
                    Fecha: "w-28",
                  }[c] || "w-24";
                return <col key={c} className={w} />;
              })
              : columns.map((c) => {
                const w =
                  {
                    ID: "w-14",
                    Operador: "w-[220px]",
                    "Tipo Maquinaria": "w-[200px]",
                    Placa: "w-28",
                    Actividad: "w-[160px]",
                    Fecha: "w-28",
                  }[c] || "w-24";
                return <col key={c} className={w} />;
              })}
            <col className="w-28" />
          </colgroup>

          <thead className="bg-gray-50 text-gray-700">
            <tr>
              <th className="px-3 py-2 text-left font-medium">Tipo</th>
              {columns.map((c) => (
                <th key={c} className="px-3 py-2 text-left font-medium">
                  {c}
                </th>
              ))}
              <th className="px-3 py-2 text-right font-medium">Acciones</th>
            </tr>
          </thead>

          <tbody>
            {pageRows.map((r) => (
              <tr key={r.id} className="border-t hover:bg-gray-50">
                <td className="px-3 py-2">
                  <span
                    className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${isMunicipal
                      ? "bg-blue-100 text-blue-800"
                      : "bg-green-100 text-green-800"
                      }`}
                  >
                    {isMunicipal ? "🏛️ Municipal" : "🚛 Alquiler"}
                  </span>
                </td>

                {columns.map((c) => (
                  <td
                    key={c}
                    className="px-3 py-3 whitespace-nowrap overflow-hidden text-ellipsis"
                    title={
                      isMunicipal
                        ? String(cellValueMunicipal(r, c))
                        : String(cellValueRental(r, c))
                    }
                  >
                    {isMunicipal
                      ? cellValueMunicipal(r, c)
                      : cellValueRental(r, c)}
                  </td>
                ))}

                <td className="px-4 py-3">
                  <div className="flex items-center justify-end gap-2">
                    <button
                      type="button"
                      onClick={() => openView(r)}
                      className="p-2 rounded-lg text-blue-600 hover:bg-blue-50"
                      title="Ver"
                      aria-label="Ver"
                    >
                      <Eye size={18} />
                    </button>
                    <button
                      type="button"
                      onClick={() => askDelete(r)}
                      className="p-2 rounded-lg text-red-600 hover:bg-red-50"
                      title="Eliminar"
                      aria-label="Eliminar"
                    >
                      <Trash2 size={18} />
                    </button>
                  </div>
                </td>
              </tr>
            ))}

            {filtered.length === 0 && (
              <tr>
                <td
                  className="px-4 py-6 text-center text-gray-500"
                  colSpan={columns.length + 2}
                >
                  No hay reportes {isMunicipal ? "municipales" : "de alquiler"} con
                  ese filtro.
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>

      {/* Paginación */}
      <div className="flex items-center justify-between">
        <span className="text-sm text-gray-600">
          Página {page} de {totalPages}
        </span>
        <div className="flex gap-2">
          <Button
            variant="secondary"
            disabled={page <= 1}
            onClick={() => setPage((p) => Math.max(1, p - 1))}
          >
            Anterior
          </Button>
          <Button
            variant="secondary"
            disabled={page >= totalPages}
            onClick={() => setPage((p) => Math.min(totalPages, p + 1))}
          >
            Siguiente
          </Button>
        </div>
      </div>

      {/* Modal VER */}
      <Dialog open={detailsOpen} onOpenChange={setDetailsOpen}>
        <DialogContent className="max-w-3xl max-h-[80vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>
              Detalles del reporte {selectedRow?.id ? `#${selectedRow.id}` : ""}
            </DialogTitle>
            <DialogDescription>
              Información completa del registro seleccionado.
            </DialogDescription>
          </DialogHeader>

          {selectedRow &&
  (() => {
    const r = selectedRow;
    const t = getType(r);
    const v = getVar(r);
    const d = r.detalles || {};
    const kmType = isKmType(t);

    // banderas
    const showVariante = t === "vagoneta" || t === "cabezal";
    const showEstacion = STATION_TYPES.has(t) || _hasStationData(r);

    // fuente si cisterna (tipo/variante)
    const fuenteTxt =
      t === "cisterna" || ((t === "vagoneta" || t === "cabezal") && v === "cisterna")
        ? readFuente(r)
        : null;

    const KV = ({ label, value }) => (
      <div className="bg-white border rounded-lg p-3">
        <div className="text-xs text-gray-500">{label}</div>
        <div className="font-medium break-words">{value || value === 0 ? value : "—"}</div>
      </div>
    );

    const base = [
      {
        label: "Operador",
        value: r?.operador
          ? `${r.operador?.name ?? ""} ${r.operador?.last ?? ""}${r.operador?.identification ? ` (${r.operador.identification})` : ""}`
          : r?.operadorId,
      },
      {
        label: "Maquinaria",
        value: r?.maquinaria
          ? `${r.maquinaria?.tipo ?? ""}${r.maquinaria?.placa ? ` - ${r.maquinaria.placa}` : ""}`
          : r?.maquinariaId,
      },
      {
        label: kmType ? "Kilometraje" : "Horímetro",
        value: kmType ? (r?.kilometraje ?? d?.kilometraje) : (r?.horimetro ?? d?.horimetro),
      },
      { label: "Tipo actividad", value: r?.tipoActividad ?? r?.actividad },
      {
        label: "Horario",
        value: (() => {
          const ini = r?.horaInicio ?? d?.horaInicio;
          const fin = r?.horaFin ?? d?.horaFin;
          return ini || fin ? `${ini ?? "—"} – ${fin ?? "—"}` : null;
        })(),
      },
      { label: "Diésel", value: r?.diesel ?? r?.combustible },
      {
        label: "Horas (Ord/Ext)",
        value:
          (r?.horasOrd ?? r?.horas_or ?? null) !== null ||
          (r?.horasExt ?? r?.horas_ext ?? null) !== null
            ? `${r?.horasOrd ?? r?.horas_or ?? "—"} / ${r?.horasExt ?? r?.horas_ext ?? "—"}`
            : null,
      },
      { label: "Distrito", value: r?.distrito },
      { label: "Código Camino", value: r?.codigoCamino },
      { label: "Viáticos", value: r?.viaticos },
      { label: "Fecha", value: fmtDMY(r?.fecha) },
    ];

    if (fuenteTxt !== null) base.push({ label: "Fuente", value: fuenteTxt });
    if (showVariante) base.push({ label: "Variante", value: v || null });
    if (showEstacion) base.push({ label: "Estación", value: toEstacionTxt(r) });

    // helper de lectura múltiple
    const read = (...paths) => {
      for (const p of paths) {
        const val = get(r, p);
        if (val !== undefined && val !== null && String(val) !== "") return val;
      }
      return null;
    };

    // placa maquinaria llevada
    const placaMaqLlevada = read(
      "placaMaquinariaLlevada",
      "detalles.placaMaquinariaLlevada",
      "placa_maquinaria_llevada",
      "detalles.placa_maquinaria_llevada"
    );
    if (placaMaqLlevada) base.push({ label: "Placa maq. llevada", value: placaMaqLlevada });

    // carreta
    if ((t === "vagoneta" || t === "cabezal") && v === "carreta") {
      base.push({ label: "Placa carreta", value: read("placaCarreta","detalles.placaCarreta","placa_carreta","detalles.placa_carreta") ?? "—" });
      base.push({ label: "Tipo de carga", value: read("tipoCarga","detalles.tipoCarga","tipo_carga","detalles.tipo_carga") ?? "—" });
      base.push({ label: "Destino", value: read("destino","detalles.destino","destino_carga","detalles.destino_carga") ?? "—" });
    }

    // cisterna (tipo/variante)
    const isCisternaTipo = t === "cisterna";
    const isCisternaVar = (t === "vagoneta" || t === "cabezal") && v === "cisterna";
    if (isCisternaTipo || isCisternaVar) {
      const cantidadAgua = read(
        "cantidadLiquido","detalles.cantidadLiquido",
        "cantidad_agua","detalles.cantidad_agua",
        "detalles.cisterna.cantidad","detalles.cisterna.cantidadLiquido"
      );
      const fuenteAgua =
        readFuente(r) ??
        read("detalles.cisterna.fuenteAgua","fuenteAgua","detalles.fuenteAgua");
      const placaCisterna = read(
        "placaCisterna","detalles.placaCisterna",
        "placa_cisterna","detalles.placa_cisterna",
        "detalles.cisterna.placa"
      );
      base.push({ label: "Cantidad agua (m³)", value: cantidadAgua ?? "—" });
      base.push({ label: "Fuente", value: fuenteAgua ?? "—" });
      if (placaCisterna) base.push({ label: "Placa cisterna", value: placaCisterna });
    }

    // material (campos simples)
    if ((t === "vagoneta" || t === "cabezal") && v === "material") {
      const tipoMaterial = read("tipoMaterial","detalles.tipoMaterial");
      const cantidadMaterial = read("cantidadMaterial","detalles.cantidadMaterial");
      const boletaSimple = read("boleta","detalles.boleta");
      if (tipoMaterial) base.push({ label: "Tipo material", value: tipoMaterial });
      if (cantidadMaterial) base.push({ label: "Cantidad (m³)", value: cantidadMaterial });
      if (boletaSimple) base.push({ label: "Boleta", value: boletaSimple });
      const fuenteMaterial = readFuente(r);
      if (fuenteMaterial) base.push({ label: "Fuente", value: fuenteMaterial });
    }

    // helpers boletas/tabla
    const isRioOTajo = (f) => f === "Ríos" || f === "Tajo";
    const showBoletas = showVariante && v === "material";
    const fmtFuente = (b = {}) =>
      isRioOTajo(b?.fuente) ? `${b.fuente}${b?.subFuente ? ` – ${b.subFuente}` : ""}` : (b?.fuente || "—");

    // 👇 claves que te faltaban:
    const boletas = getBoletasArr(r);
    const totalM3 = getTotalM3(r);

    return (
      <div className="space-y-4">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
          {base.map((k, i) => (
            <KV key={`b-${i}`} {...k} />
          ))}
        </div>

        {showBoletas && (
          <div className="border rounded-lg p-3">
            <div className="text-sm font-semibold mb-2">Detalles de Boleta</div>

            {/* total del día
            <div className="mb-3">
              <div className="bg-white border rounded-lg p-3">
                <div className="text-xs text-gray-500">
                  Total m<sup>3</sup> del día
                </div>
                <div className="font-medium">{showNum(totalM3)}</div>
              </div>
            </div> */}

            {/* tabla de boletas */}
            {Array.isArray(boletas) && boletas.length > 0 ? (
              <div className="overflow-x-auto">
                <table className="w-full text-sm">
                  <thead className="bg-gray-50">
                    <tr>
                      <th className="text-left px-3 py-2">#</th>
                      <th className="text-left px-3 py-2">Tipo material</th>
                      <th className="text-left px-3 py-2">Fuente</th>
                      <th className="text-left px-3 py-2">Boleta</th>
                    </tr>
                  </thead>
                  <tbody>
                    {boletas.map((b, i) => (
                      <tr key={i} className="border-t">
                        <td className="px-3 py-2">{i + 1}</td>
                        <td className="px-3 py-2">{showText(b?.tipoMaterial)}</td>
                        <td className="px-3 py-2">{fmtFuente(b)}</td>
                        <td className="px-3 py-2">{showText(b?.boleta)}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            ) : (
              <div className="text-sm text-gray-500">Sin boletas registradas.</div>
            )}

            {/* totales por material */}
            {(() => {
              const breakdown = getMaterialBreakdown(r);
              const entries = Object.entries(breakdown);
              if (!entries.length) return null;
              const total = entries.reduce((acc, [, v]) => acc + Number(v || 0), 0);
              return (
                <div className="mt-3 p-3 border rounded-lg bg-gray-50">
                  <div className="text-sm font-semibold mb-2">Totales por material</div>
                  {entries.map(([mat, qty]) => (
                    <div key={mat} className="flex justify-between text-sm py-0.5">
                      <span>{mat}</span>
                      <span>{qty} m³</span>
                    </div>
                  ))}
                  <div className="border-t mt-2 pt-2 flex justify-between text-sm font-medium">
                    <span>Total m³</span>
                    <span>{total} m³</span>
                  </div>
                </div>
              );
            })()}
          </div>
        )}
      </div>
    );
  })()}

        </DialogContent>
      </Dialog>

      {/* Confirmar eliminación */}
      <Dialog open={deleteOpen} onOpenChange={setDeleteOpen}>
        <DialogContent className="max-w-md">
          <DialogHeader>
            <DialogTitle>Eliminar reporte #{confirmDeleteId}</DialogTitle>
            <DialogDescription>
              Esta acción marcará el reporte como eliminado. Puedes escribir un motivo (opcional).
            </DialogDescription>
          </DialogHeader>

          <div className="space-y-2">
            <label className="text-sm font-medium text-gray-700">Motivo</label>
            <textarea
              className="w-full min-h-[90px] rounded-md border p-2 text-sm"
              placeholder="Motivo de eliminación (opcional)"
              value={deleteReason}
              onChange={(e) => setDeleteReason(e.target.value)}
            />
          </div>

          <div className="flex justify-end gap-2 pt-2">
            <Button
              variant="secondary"
              onClick={() => {
                setDeleteOpen(false);
                setDeleteReason("");
                setConfirmDeleteId(null);
              }}
            >
              Cancelar
            </Button>
            <Button
              className="bg-red-600 hover:bg-red-700 text-white"
              disabled={deleting}
              onClick={async () => {
                const id = confirmDeleteId;
                if (!id) return;
                try {
                  setDeleting(true);
                  if (isMunicipal) {
                    await machineryService.deleteReport(id, deleteReason.trim());
                    setRowsMunicipal((prev) => prev.filter((r) => r.id !== id));
                  } else {
                    await machineryService.deleteRentalReport(id, deleteReason.trim());
                    setRowsRental((prev) => prev.filter((r) => r.id !== id));
                  }
                  setDeleteOpen(false);
                  setDeleteReason("");
                  setConfirmDeleteId(null);
                } catch (err) {
                  console.error("DELETE report ->", err?.response || err);
                  alert("No se pudo eliminar el reporte");
                } finally {
                  setDeleting(false);
                }
              }}
            >
              {deleting ? "Eliminando..." : "Eliminar"}
            </Button>
          </div>
        </DialogContent>
      </Dialog>


      {/* Eliminados */}
      <Dialog open={deletedOpen} onOpenChange={setDeletedOpen}>
        <DialogContent className="max-w-4xl">
          <DialogHeader>
            <DialogTitle>
              Reportes eliminados ({isMunicipal ? "Municipales" : "Alquiler"})
            </DialogTitle>
            <DialogDescription>
              Motivo, fecha de eliminación y quién lo realizó.
            </DialogDescription>
          </DialogHeader>
          {loadingDeleted ? (
            <div className="p-6 text-center text-sm text-gray-500">Cargando…</div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead className="bg-gray-50">
                  <tr>
                    <th className="px-3 py-2 text-left">ID</th>
                    <th className="px-3 py-2 text-left">Eliminado por</th>
                    <th className="px-3 py-2 text-left">Fecha eliminación</th>
                    <th className="px-3 py-2 text-left">Motivo</th>
                    <th className="px-3 py-2 text-right">Acciones</th>
                  </tr>
                </thead>
                <tbody>
                  {deletedRows.map((r) => (
                    <tr key={r.id} className="border-t">
                      <td className="px-3 py-2">#{r.id}</td>
                      <td className="px-3 py-2">
                        {r.deletedBy?.name ?? r.deletedById ?? "—"}
                      </td>
                      <td className="px-3 py-2">
                        {r.deletedAt ? new Date(r.deletedAt).toLocaleString() : "—"}
                      </td>
                      <td className="px-3 py-2 whitespace-pre-wrap">
                        {r.deleteReason ?? "—"}
                      </td>
                      <td className="px-3 py-2 text-right">
                        <Button
                          variant="secondary"
                          onClick={async () => {
                            try {
                              let restored;
                              if (isMunicipal) {
                                restored = await machineryService.restoreReport(r.id);
                                setRowsMunicipal((prev) => [
                                  restored,
                                  ...prev.filter((x) => x.id !== restored.id),
                                ]);
                              } else {
                                restored = await machineryService.restoreRentalReport(r.id);
                                setRowsRental((prev) => [
                                  restored,
                                  ...prev.filter((x) => x.id !== restored.id),
                                ]);
                              }
                              setDeletedRows((prev) => prev.filter((x) => x.id !== r.id));
                            } catch {
                              alert("No se pudo restaurar.");
                            }
                          }}
                        >
                          Restaurar
                        </Button>
                      </td>
                    </tr>
                  ))}
                  {deletedRows.length === 0 && (
                    <tr>
                      <td className="px-3 py-6 text-center text-gray-500" colSpan={5}>
                        No hay eliminados.
                      </td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>
          )}
        </DialogContent>
      </Dialog>
    </div>
  );
}
