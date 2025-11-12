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
import { Eye, Trash2, Filter as FilterIcon, RefreshCcw, Download, Edit2 } from "lucide-react";
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
import { useAuth } from "@/context/AuthContext";
import {
  confirmDelete as swalConfirmDelete,
  confirmAction as swalConfirmAction,
  showSuccess,
  showError,
} from "@/utils/sweetAlert";

import {
  canEditReports,
  canDeleteReports,
  canViewDeletedReports,
  canRestoreReports,
  filterReportsByPermission
} from "@/utils/permissions";

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
  "tractor",
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

// Normaliza "N+M" para estación (mismo formato que en machineryService)
function normalizeEstacion(raw) {
  if (raw == null || raw === "") return null;
  let s = String(raw).trim();
  s = s.replace(/[^\d+]/g, ""); // deja solo dígitos y '+'
  const m = s.match(/^(\d+)\+(\d+)$/);
  if (m) return `${Number(m[1])}+${Number(m[2])}`;
  return null;
}

// ================= Helpers para payloads =================
const toNull = (v) => (v === "" || v === undefined ? null : v);
const toNumOrNull = (v) => {
  if (v === "" || v === undefined || v === null) return null;
  const n = Number(String(v).replace(",", "."));
  return Number.isFinite(n) ? n : null;
};
const only3digitsOrNull = (v) => {
  const s = String(v || "").replace(/\D/g, "").slice(0, 3);
  return s.length === 3 ? s : (s.length ? s : null);
};

// normaliza boletas del form (nombres y números)
function normalizeBoletas(arr = []) {
  return (Array.isArray(arr) ? arr : []).map((b) => ({
    boleta: toNull(b?.boleta),
    tipoMaterial: toNull(b?.tipoMaterial),
    fuente: toNull(b?.fuente),
    subFuente: toNull(b?.subFuente),
    m3: toNumOrNull(b?.m3 ?? b?.cantidad ?? b?.metros3 ?? b?.volumen),
    distrito: toNull(b?.distrito ?? b?.District),
    codigoCamino: only3digitsOrNull(b?.codigoCamino ?? b?.codigo ?? b?.codigo_camino),
  }));
}

function sumM3(boletas = []) {
  return (boletas || []).reduce((acc, b) => acc + (Number(b?.m3) || 0), 0) || null;
}

const _numOrUndef = (v) => {
  if (v === 0) return 0;
  if (!_hasVal(v)) return undefined;
  const n = Number(v);
  return Number.isFinite(n) ? n : undefined;
};

// Capitaliza sencillo
const cap = (s) => (s ? s.charAt(0).toUpperCase() + s.slice(1) : s);

// ¿Es flujo de “material” (vagoneta/cabezal + variante material)?
const isMaterialFlow = (r) =>
  ["vagoneta", "cabezal"].includes(String(getType(r))) &&
  String(getVar(r)) === "material";

// ¿Es plataforma SM 8803? (no muestra boletas)
const isFlatbed8803 = (r) =>
  isMaterialFlow(r) &&
  String((r && r.detalles && r.detalles.placaCarreta) ?? r?.placaCarreta ?? "") === "SM 8803";

// Une fuente + subfuente
function fuseFuente(b = {}) {
  const fuente = String(
    b?.fuente ?? b?.fuenteAgua ?? b?.origenAgua ?? b?.rio ?? ""
  ).trim();

  const sub = String(
    b?.subFuente ?? b?.subfuente ?? b?.subFuenteAgua ?? b?.sub_fuente ?? ""
  ).trim();

  if (!fuente && !sub) return "—";
  if (!sub) return fuente;

  const isRioOTajo = /^r[ií]os?$/i.test(fuente) || /^tajo$/i.test(fuente);
  return isRioOTajo ? `${fuente} – ${sub}` : `${fuente} / ${sub}`;
}

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

// armar una "boleta" simple a partir del reporte
function buildSimpleBoletaFromReport(r) {
  const d = r?.detalles || {};
  const b = d?.boleta ?? r?.boleta ?? null;
  if (!b) return null;
  return {
    boleta: b,
    tipoMaterial: d?.tipoMaterial ?? r?.tipoMaterial ?? "",
    fuente: readFuente(r) ?? "",
    subFuente: "",
  };
}

/* ---------- Fuente (cisterna/material) ---------- */
function readFuente(r) {
  const d = r?.detalles || {};

  const f = _first(
    d.fuente, r?.fuente,
    get(r, "detalles.fuenteAgua"), get(r, "fuenteAgua"),
    get(r, "detalles.origenAgua"), get(r, "origenAgua"),
    get(r, "detalles.rio"), get(r, "rio"),
    get(r, "detalles.material.fuente"), get(r, "material.fuente")
  );

  const sub = _first(
    d.subFuente, r?.subFuente,
    get(r, "detalles.subFuenteAgua"), get(r, "subFuenteAgua"),
    get(r, "detalles.subfuente"), get(r, "subfuente")
  );

  if (!_hasVal(f)) return null;
  if ((f === "Ríos" || f === "Tajo") && _hasVal(sub)) return `${f} – ${sub}`;
  return f;
}

function readPlacaCarreta(r) {
  const d = r?.detalles || {};
  return (
    d.placaCarreta ?? d?.carreta?.placa ?? r?.placaCarreta ?? r?.placa_carreta ?? d?.placa_carreta ?? null
  );
}

function readPlacaCisterna(r) {
  const d = r?.detalles || {};
  return (
    d.placaCisterna ?? r?.placaCisterna ??
    d.cisternaPlaca ?? r?.cisternaPlaca ??
    d?.cisterna?.placa ?? r?.placa_cisterna ?? d?.placa_cisterna ??
    d.placaCarreta ?? r?.placaCarreta ?? d?.carreta?.placa ?? r?.placa_carreta ?? d?.placa_carreta ?? null
  );
}

/* ---------- Estación helpers ---------- */
function _readStationPair(r) {
  const d = _first(
    get(r, "estacionDesde"), get(r, "estacion_desde"),
    get(r, "detalles.estacionDesde"), get(r, "detalles.estacion_desde"),
    get(r, "estacion.desde"), get(r, "detalles.estacion.desde")
  );
  const h = _first(
    get(r, "estacionHasta"), get(r, "estacion_hasta"),
    get(r, "detalles.estacionHasta"), get(r, "detalles.estacion_hasta"),
    get(r, "estacion.hasta"), get(r, "detalles.estacion.hasta")
  );
  return { d, h };
}

const _norm = (s) => String(s ?? "").trim();

function getDistritosForSearch(r) {
  const top = _norm(r?.distrito);
  const out = new Set();
  if (top) out.add(top);

  const boletas = getBoletasArr(r) || [];
  for (const b of boletas) {
    const d = _norm(b?.distrito ?? b?.District);
    if (d) out.add(d);
  }
  return Array.from(out);
}

function getCodigosForSearch(r) {
  const normDigits = (x) => _norm(x).replace(/\D/g, "");
  const top = normDigits(r?.codigoCamino);
  const out = new Set();
  if (top) out.add(top);

  const boletas = getBoletasArr(r) || [];
  for (const b of boletas) {
    const raw = b?.codigoCamino ?? b?.codigo ?? b?.codigo_camino;
    const v = normDigits(raw);
    if (v) out.add(v);
  }
  return Array.from(out);
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

  const actividad = String(r?.tipoActividad ?? r?.actividad ?? "").toLowerCase();

  if (/(riego|transporte).*agua/.test(actividad) || actividad.includes("agua")) {
    return "cisterna";
  }

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
    (actividad.includes("transporte") && !actividad.includes("agua"));

  if (hasCarretaShallow || actividadCarreta) {
    return "carreta";
  }

  const hasMaterialShallow =
    r?.tipoMaterial != null ||
    r?.cantidadMaterial != null ||
    r?.boleta != null ||
    r?.totalCantidadMaterial != null;
  if (hasMaterialShallow) return "material";

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
  const t = getType(r);
  const v = getVar(r);

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
    Kilometraje: read("kilometraje", "detalles.kilometraje"),
    Horimetro: read("horimetro", "detalles.horimetro"),
    Diesel: read("diesel", "combustible"),
    HorasOrd: read("horasOrd", "horas_or"),
    HorasExt: read("horasExt", "horas_ext"),
    TipoActividad: read("tipoActividad", "actividad"),
    HoraInicio: read("horaInicio", "detalles.horaInicio"),
    HoraFin: read("horaFin", "detalles.horaFin"),
    Distrito: r.distrito ?? null,
    CodigoCamino: r.codigoCamino ?? null,
    Fecha: r.fecha ?? null,
    Estacion: (() => {
      const txt = toEstacionTxt(r);
      return txt === "—" ? null : txt;
    })(),
  };

  if ((t === "vagoneta" || t === "cabezal") && v === "carreta") {
    flat.PlacaCarreta = read("placaCarreta", "detalles.placaCarreta", "detalles.carreta.placa", "placa_carreta", "detalles.placa_carreta");
    flat.TipoCarga = read("tipoCarga", "detalles.tipoCarga", "detalles.carreta.tipoCarga", "tipo_carga", "detalles.tipo_carga");
    flat.Destino = read("destino", "detalles.destino", "detalles.carreta.destino", "destino_carga", "detalles.destino_carga");
  }

  const isCisternaTipo = t === "cisterna";
  const isCisternaVar = (t === "vagoneta" || t === "cabezal") && v === "cisterna";
  if (isCisternaTipo || isCisternaVar) {
    flat.CantidadAgua_m3 = read(
      "cantidadLiquido", "detalles.cantidadLiquido",
      "cantidad_agua", "detalles.cantidad_agua",
      "detalles.cisterna.cantidad", "detalles.cisterna.cantidadLiquido"
    );
    flat.Fuente = readFuente(r) ?? read("detalles.cisterna.fuenteAgua", "fuenteAgua", "detalles.fuenteAgua");
    flat.PlacaCisterna = read(
      "placaCisterna", "detalles.placaCisterna",
      "cisternaPlaca", "placa_cisterna", "detalles.placa_cisterna",
      "detalles.cisterna.placa",
      "placaCarreta", "detalles.placaCarreta",
      "placa_carreta", "detalles.placa_carreta",
      "detalles.carreta.placa"
    );
  }

  if ((t === "vagoneta" || t === "cabezal") && v === "material") {
    flat.TipoMaterial = get(r, "detalles.tipoMaterial") ?? r?.tipoMaterial ?? "";
    flat.CantidadMaterial_m3 = get(r, "detalles.cantidadMaterial") ?? r?.cantidadMaterial ?? "";
    flat.BoletaSimple = get(r, "detalles.boleta") ?? r?.boleta ?? "";
    flat.Fuente = flat.Fuente ?? readFuente(r);

    flat.TotalDia_m3 =
      get(r, "detalles.totalCantidadMaterial") ?? r?.totalCantidadMaterial ??
      get(r, "detalles.totalM3") ?? r?.totalM3 ??
      get(r, "detalles.total_m3") ?? r?.total_m3 ?? "";

    const breakdown = getMaterialBreakdown(r);
    const mats = Object.keys(breakdown);

    if (mats.length > 1) {
      flat.TipoMaterial = "";
      flat.CantidadMaterial_m3 = "";
      flat.Materiales_m3 = materialSummaryStr(breakdown);
    } else if (mats.length === 1) {
      const mat = mats[0];
      if (!flat.TipoMaterial) flat.TipoMaterial = mat;
      if (!flat.CantidadMaterial_m3) flat.CantidadMaterial_m3 = breakdown[mat];
    }

    const boletas = getBoletasArr(r) || [];
    const boletaToText = (b = {}) => {
      const num = b?.boleta ? `#${b.boleta}` : "—";
      const tipo = b?.tipoMaterial ? String(b.tipoMaterial) : "—";
      const fuente = b?.fuente ? String(b.fuente) : "—";
      const sub = (fuente === "Ríos" || fuente === "Tajo") && b?.subFuente ? ` | ${b.subFuente}` : "";
      const qRaw = b?.m3 ?? b?.cantidad ?? b?.metros3 ?? b?.volumen;
      const qStr = Number.isFinite(Number(qRaw)) ? ` | ${Number(qRaw)} m³` : "";
      return `${num} | ${tipo} | ${fuente}${sub}${qStr}`;
    };

    let list = boletas;
    if (!Array.isArray(list) || list.length === 0) {
      const simple = buildSimpleBoletaFromReport(r);
      list = simple ? [simple] : [];
    }

    const MULTICOLUMN_MATERIAL = false;
    if (!MULTICOLUMN_MATERIAL) {
      flat.Boletas = list.map(boletaToText).join("\n");
    } else {
      list.forEach((b, i) => {
        flat[`Boleta ${i + 1}`] = boletaToText(b);
      });
    }
  }

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
    ? `${r.operador?.name ?? ""} ${r.operador?.last ?? ""}${r.operador?.identification ? ` (${r.operador.identification})` : ""}`
    : r?.operadorId ?? "—";

  const maquinariaTxt = r?.maquinaria
    ? `${r.maquinaria?.tipo ?? ""}${r.maquinaria?.placa ? ` - ${r.maquinaria.placa}` : ""}`
    : r?.maquinariaId ?? "—";

  const horasTxt = `${showNum(pick(r?.horasOrd, r?.horas_or))} / ${showNum(pick(r?.horasExt, r?.horas_ext))}`;

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
    fmtDMY(r?.fecha),
  ];
}

const EXPORT_HEADERS_RENTAL = [
  "Tipo",
  "ID",
  "Encargado",
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

// ====== Solo para RENTAL (JS puro) ======
const RENTAL_TIPOS_CON_CANTIDAD = new Set(["vagoneta", "cisterna", "cabezal"]);
const RENTAL_TIPOS_CON_ESTACION = new Set(["excavadora", "niveladora", "compactadora", "backhoe", "cargador", "tractor"]);

const showCantidadRental = (tipo) =>
  RENTAL_TIPOS_CON_CANTIDAD.has(String(tipo || "").toLowerCase());
const showEstacionRental = (tipo) =>
  RENTAL_TIPOS_CON_ESTACION.has(String(tipo || "").toLowerCase());

function saveXlsx(wb, base) {
  const name = `${base}_${todayLocalISO()}.xlsx`;
  XLSX.writeFile(wb, name);
}

function pretty(key) {
  return String(key)
    .replaceAll("_", " ")
    .replace(/([a-z])([A-Z])/g, "$1 $2")
    .replace(/\b(m3)\b/gi, "m³")
    .trim();
}

function isEmptyVal(v) {
  return v === undefined || v === null || v === "" || (typeof v === "number" && Number.isNaN(v));
}

function pruneEmptyColumns(rows, headers) {
  return headers.filter((h) => rows.some((r) => !isEmptyVal(r[h])));
}

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

  if (map.size === 0) {
    const mat = get(r, "detalles.tipoMaterial") ?? r?.tipoMaterial;
    const q = Number(get(r, "detalles.cantidadMaterial") ?? r?.cantidadMaterial);
    if (mat && Number.isFinite(q)) map.set(String(mat), q);
  }

  return Object.fromEntries(map);
}

function materialSummaryStr(breakdown) {
  const entries = Object.entries(breakdown);
  return entries.length ? entries.map(([k, v]) => `${k}: ${v} m³`).join("\n") : "";
}

// Caja simple
const CardField = ({ label, children }) => (
  <div className="bg-white border rounded-lg p-3">
    <div className="text-xs text-gray-500">{label}</div>
    <div className="mt-1 font-medium break-words">{children}</div>
  </div>
);

// --- Tarjeta "KV" editable ---
function EditKV({
  label,
  value,
  onChange,
  placeholder,
  type = "text",
  disabled = false,
  step,
  inputProps = {},
}) {
  return (
    <div className="bg-white border rounded-lg p-3">
      <div className="text-xs text-gray-500">{label}</div>
      <Input
        type={type}
        value={value ?? ""}
        onChange={(e) => onChange?.(e.target.value)}
        placeholder={placeholder}
        disabled={disabled}
        step={step}
        {...inputProps}
      />
    </div>
  );
}

function RentalEditForm({ initialValues, setInitialValues, districts = [] }) {
  const setIV = (patch) => setInitialValues((prev) => ({ ...prev, ...patch }));
  const setDet = (patch) =>
    setInitialValues((prev) => ({ ...prev, detalles: { ...(prev?.detalles || {}), ...patch } }));

  const numero = (x) => (x === null || x === undefined ? "" : x);

  const tipo = (initialValues?.tipoMaquinaria || "").toLowerCase();
  const variante = (initialValues?.variante || initialValues?.detalles?.variante || "").toLowerCase();

  const isMaterialLike =
    (tipo === "vagoneta" || tipo === "cabezal") &&
    (variante === "material" ||
      Array.isArray(initialValues?.detalles?.boletas) && initialValues.detalles.boletas.length > 0 ||
      /material/i.test(String(initialValues?.actividad || "")));

  const muestraCantidad = showCantidadRental(tipo);
  const muestraEstacion = showEstacionRental(tipo);

  const showFuente = ["vagoneta", "cabezal", "cisterna"].includes(tipo);
  const showBoletaSimple = ["vagoneta", "cabezal"].includes(tipo) && !isMaterialLike;

  const flatInput = "h-9 w-full border-none bg-transparent shadow-none px-0 focus-visible:ring-0 focus:outline-none";

  const onCodigoChange = (e) => {
    const digits = e.target.value.replace(/\D/g, "").slice(0, 3);
    setIV({ codigoCamino: digits });
  };

  // editor boletas
  const boletas = Array.isArray(initialValues?.detalles?.boletas) ? initialValues.detalles.boletas : [];
  const numberOrBlank = (x) => (x === null || x === undefined ? "" : x);

  const updateBoleta = (idx, key, val) => {
    setDet({ boletas: boletas.map((b, i) => (i === idx ? { ...b, [key]: val } : b)) });
  };
  const addBoleta = () =>
    setDet({
      boletas: [
        ...boletas,
        { boleta: "", tipoMaterial: "", fuente: "", subFuente: "", m3: "", distrito: "", codigoCamino: "" },
      ],
    });
  const removeBoleta = (idx) => setDet({ boletas: boletas.filter((_, i) => i !== idx) });

  return (
    <div className="space-y-4">
      <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
        <div className="bg-white border rounded-lg p-3">
          <div className="text-xs text-gray-500">Operador</div>
          <div className="mt-1">{initialValues?.operadorId || "—"}</div>
        </div>

        <div className="bg-white border rounded-lg p-3">
          <div className="text-xs text-gray-500">Tipo maquinaria</div>
          <Input
            className={flatInput}
            value={initialValues?.tipoMaquinaria || ""}
            onChange={(e) => setIV({ tipoMaquinaria: e.target.value })}
          />
        </div>

        <div className="bg-white border rounded-lg p-3">
          <div className="text-xs text-gray-500">Placa</div>
          <Input
            className={flatInput}
            value={initialValues?.placa || ""}
            onChange={(e) => setIV({ placa: e.target.value })}
          />
        </div>

        <div className="bg-white border rounded-lg p-3">
          <div className="text-xs text-gray-500">Actividad</div>
          <Input
            className={flatInput}
            value={initialValues?.actividad || ""}
            onChange={(e) => setIV({ actividad: e.target.value })}
          />
        </div>

        {muestraCantidad && (
          <div className="bg-white border rounded-lg p-3">
            <div className="text-xs text-gray-500">Cantidad</div>
            <Input
              type="number"
              step="0.01"
              className={flatInput}
              value={numero(initialValues?.cantidad)}
              onChange={(e) => setIV({ cantidad: e.target.value })}
            />
          </div>
        )}

        <div className="bg-white border rounded-lg p-3">
          <div className="text-xs text-gray-500">Horas (cantidad de horas)</div>
          <Input
            type="number"
            step="0.01"
            className={flatInput}
            value={numero(initialValues?.horas)}
            onChange={(e) => setIV({ horas: e.target.value })}
          />
        </div>

        {muestraEstacion && (
          <div className="bg-white border rounded-lg p-3">
            <div className="text-xs text-gray-500">Estación (N+M)</div>
            <Input
              className={flatInput}
              placeholder="Ej: 12+500"
              value={initialValues?.estacion || ""}
              onChange={(e) => setIV({ estacion: e.target.value })}
            />
          </div>
        )}

        {/* Fuente + Boleta (solo si NO es material-like) */}
        {showFuente && !isMaterialLike && (
          <>
            <div className="bg-white border rounded-lg p-3">
              <div className="text-xs text-gray-500">Fuente</div>
              <Input
                className={flatInput}
                value={initialValues?.fuente || ""}
                onChange={(e) => setIV({ fuente: e.target.value })}
              />
            </div>

            {showBoletaSimple && (
              (initialValues?.fuente || "").toUpperCase() === "KYLCSA" ? (
                <div className="bg-white border rounded-lg p-3">
                  <div className="text-xs text-gray-500">Boleta KYLCSA</div>
                  <Input
                    className={flatInput}
                    value={initialValues?.boletaK || initialValues?.boletaKylcsa || ""}
                    onChange={(e) => setIV({ boletaK: e.target.value })}
                  />
                </div>
              ) : (
                <div className="bg-white border rounded-lg p-3">
                  <div className="text-xs text-gray-500">Boleta</div>
                  <Input
                    className={flatInput}
                    value={initialValues?.boleta || ""}
                    onChange={(e) => setIV({ boleta: e.target.value })}
                  />
                </div>
              )
            )}
          </>
        )}

        {/* Distrito y Código Camino */}
        <div className="bg-white border rounded-lg p-3">
          <div className="text-xs text-gray-500">Distrito</div>
          <Select
            value={initialValues?.distrito || ""}
            onValueChange={(v) => setIV({ distrito: v })}
          >
            <SelectTrigger className="h-9 px-0 border-none shadow-none">
              <SelectValue placeholder="Seleccionar distrito" />
            </SelectTrigger>
            <SelectContent>
              {districts.map((d) => (
                <SelectItem key={d} value={d}>{d}</SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>

        <div className="bg-white border rounded-lg p-3">
          <div className="text-xs text-gray-500">Código Camino</div>
          <Input
            inputMode="numeric"
            pattern="\d{3}"
            placeholder="3 dígitos"
            className={flatInput}
            value={initialValues?.codigoCamino || ""}
            onChange={onCodigoChange}
          />
        </div>

        <div className="bg-white border rounded-lg p-3 md:col-span-2">
          <div className="text-xs text-gray-500">Fecha</div>
          <Input className={flatInput} value={initialValues?.fecha || ""} disabled />
        </div>
      </div>

      {/* === Editor de boletas (solo material-like) === */}
      {isMaterialLike && (
        <div className="border rounded-lg">
          <div className="flex items-center justify-between px-3 py-2">
            <div className="text-sm font-semibold">Detalles de Boleta</div>
            <Button variant="secondary" onClick={addBoleta}>Agregar boleta</Button>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead className="bg-gray-50">
                <tr>
                  <th className="text-left px-3 py-2">#</th>
                  <th className="text-left px-3 py-2">Tipo material</th>
                  <th className="text-left px-3 py-2">Fuente</th>
                  <th className="text-left px-3 py-2">Sub-fuente</th>
                  <th className="text-left px-3 py-2">m³</th>
                  <th className="text-left px-3 py-2">Distrito</th>
                  <th className="text-left px-3 py-2">Código Camino</th>
                  <th className="text-left px-3 py-2">Boleta</th>
                  <th className="text-right px-3 py-2">Acciones</th>
                </tr>
              </thead>
              <tbody>
                {boletas.length === 0 && (
                  <tr>
                    <td className="px-3 py-4 text-gray-500" colSpan={9}>Sin boletas.</td>
                  </tr>
                )}
                {boletas.map((b, i) => (
                  <tr key={i} className="border-t">
                    <td className="px-3 py-2">{i + 1}</td>
                    <td className="px-3 py-2">
                      <Input
                        className={flatInput}
                        value={b?.tipoMaterial || ""}
                        onChange={(e) => updateBoleta(i, "tipoMaterial", e.target.value)}
                      />
                    </td>
                    <td className="px-3 py-2">
                      <Input
                        className={flatInput}
                        value={b?.fuente || ""}
                        onChange={(e) => updateBoleta(i, "fuente", e.target.value)}
                      />
                    </td>
                    <td className="px-3 py-2">
                      <Input
                        className={flatInput}
                        value={b?.subFuente || ""}
                        onChange={(e) => updateBoleta(i, "subFuente", e.target.value)}
                      />
                    </td>
                    <td className="px-3 py-2">
                      <Input
                        type="number"
                        step="0.01"
                        className={flatInput}
                        value={numberOrBlank(b?.m3 ?? b?.cantidad ?? b?.metros3 ?? b?.volumen)}
                        onChange={(e) => updateBoleta(i, "m3", e.target.value)}
                      />
                    </td>
                    <td className="px-3 py-2">
                      <Input
                        className={flatInput}
                        value={b?.distrito || b?.District || ""}
                        onChange={(e) => updateBoleta(i, "distrito", e.target.value)}
                      />
                    </td>
                    <td className="px-3 py-2">
                      <Input
                        className={flatInput}
                        value={b?.codigoCamino || b?.codigo || b?.codigo_camino || ""}
                        onChange={(e) => updateBoleta(i, "codigoCamino", e.target.value)}
                      />
                    </td>
                    <td className="px-3 py-2">
                      <Input
                        className={flatInput}
                        value={b?.boleta || ""}
                        onChange={(e) => updateBoleta(i, "boleta", e.target.value)}
                      />
                    </td>
                    <td className="px-3 py-2 text-right">
                      <Button variant="secondary" onClick={() => removeBoleta(i)}>Quitar</Button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}
    </div>
  );
}


/* ==================== componente principal ==================== */
export default function ReportsTable({
  municipalReports = [],
  rentalReports = [],
  districts: districtsProp,
  rows,
  onEdit,
}) {
  const { user } = useAuth();

  const KV = ({ label, value }) => (
    <div className="bg-white border rounded-lg p-3">
      <div className="text-xs text-gray-500">{label}</div>
      <div className="font-medium break-words">
        {value || value === 0 ? value : "—"}
      </div>
    </div>
  );

  function RentalDetails({ r }) {
    const tipo = (r?.tipoMaquinaria || "").toLowerCase();
    const variante = (r?.variante || r?.detalles?.variante || "").toLowerCase();
    const isMaterialLike =
      (tipo === "vagoneta" || tipo === "cabezal") &&
      (variante === "material" ||
        Array.isArray(getBoletasArr(r)) && getBoletasArr(r).length > 0 ||
        /material/i.test(String(r?.actividad || "")));

    const muestraCantidad = showCantidadRental(tipo);
    const muestraEstacion = showEstacionRental(tipo);
    const showFuente = ["vagoneta", "cabezal", "cisterna"].includes(tipo);
    const showBoletaSimple = ["vagoneta", "cabezal"].includes(tipo) && !isMaterialLike;

    const fuente = _first(r?.fuente, r?.detalles?.fuente);
    const boleta = readBoletaAny(r);

    const KV = ({ label, value }) =>
      value === undefined || value === null || String(value).trim() === "" ? null : (
        <div className="bg-white border rounded-lg p-3">
          <div className="text-xs text-gray-500">{label}</div>
          <div className="mt-1 font-medium break-words">{value}</div>
        </div>
      );

    // helpers de boletas
    const boletas = getBoletasArr(r);
    const breakdown = getMaterialBreakdown(r);
    const entries = Object.entries(breakdown);
    const total = entries.reduce((acc, [, v]) => acc + Number(v || 0), 0);

    return (
      <div className="space-y-4">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
          <KV
            label="Encargado"
            value={
              r?.instructorIngeniero
                ? `${r.instructorIngeniero?.name ?? ""} ${r.instructorIngeniero?.last ?? ""}${r.instructorIngeniero?.identification ? ` (${r.instructorIngeniero.identification})` : ""}`
                : (r?.usuario || r?.user)
                ? `${(r.usuario || r.user)?.name ?? ""} ${(r.usuario || r.user)?.last ?? ""}${(r.usuario || r.user)?.email ? ` (${(r.usuario || r.user).email})` : ""}`
                : r?.instructorIngenieroId ? `ID: ${r.instructorIngenieroId}` : "—"
            }
          />
          <KV label="Tipo maquinaria" value={r?.tipoMaquinaria} />
          <KV label="Placa" value={r?.placa} />
          <KV label="Actividad" value={r?.actividad} />
          {muestraCantidad && <KV label="Cantidad" value={r?.cantidad} />}
          <KV label="Horas" value={r?.horas} />
          {muestraEstacion && <KV label="Estación" value={r?.estacion} />}
          <KV label="Distrito" value={r?.distrito} />
          <KV label="Código Camino" value={r?.codigoCamino} />
          <KV label="Fecha" value={fmtDMY(r?.fecha)} />
          {/* fuente y boleta simple (solo si NO es material) */}
          {showFuente && fuente && !isMaterialLike && <KV label="Fuente" value={fuente} />}
          {showBoletaSimple && boleta && !isMaterialLike && <KV label="Boleta" value={boleta} />}
        </div>

        {/* === Material: tabla de boletas + totales === */}
        {isMaterialLike && (
          <div className="border rounded-lg p-3">
            <div className="text-sm font-semibold mb-2">Detalles de Boleta</div>

            {Array.isArray(boletas) && boletas.length > 0 ? (
              <div className="overflow-x-auto">
                <table className="w-full text-sm">
                  <thead className="bg-gray-50">
                    <tr>
                      <th className="text-left px-3 py-2">#</th>
                      <th className="text-left px-3 py-2">Tipo material</th>
                      <th className="text-left px-3 py-2">Fuente / Sub-fuente</th>
                      <th className="text-left px-3 py-2">m³</th>
                      <th className="text-left px-3 py-2">Distrito</th>
                      <th className="text-left px-3 py-2">Código Camino</th>
                      <th className="text-left px-3 py-2">Boleta</th>
                    </tr>
                  </thead>
                  <tbody>
                    {boletas.map((b, i) => {
                      const m3 = b?.m3 ?? b?.cantidad ?? b?.metros3 ?? b?.volumen ?? "";
                      const distrito = b?.distrito ?? b?.District ?? "";
                      const codigo = b?.codigoCamino ?? b?.CodigoCamino ?? b?.codigo_camino ?? "";
                      return (
                        <tr key={i} className="border-t">
                          <td className="px-3 py-2">{i + 1}</td>
                          <td className="px-3 py-2">{showText(b?.tipoMaterial)}</td>
                          <td className="px-3 py-2">{fuseFuente(b)}</td>
                          <td className="px-3 py-2">{showNum(m3)}</td>
                          <td className="px-3 py-2">{showText(distrito)}</td>
                          <td className="px-3 py-2">{showText(codigo)}</td>
                          <td className="px-3 py-2">{showText(b?.boleta)}</td>
                        </tr>
                      );
                    })}
                  </tbody>
                </table>
              </div>
            ) : (
              <div className="text-sm text-gray-500">Sin boletas registradas.</div>
            )}

            {/* Totales por material */}
            {entries.length > 0 && (
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
            )}
          </div>
        )}
      </div>
    );
  }

  /* estado base */
  const [rowsMunicipal, setRowsMunicipal] = useState(municipalReports);
  const [rowsRental, setRowsRental] = useState(rentalReports);

  useEffect(() => setRowsMunicipal(municipalReports), [municipalReports]);
  useEffect(() => setRowsRental(rentalReports), [rentalReports]);

  /* eliminar */
  const [confirmDeleteId, setConfirmDeleteId] = useState(null);
  const [deleteReason, setDeleteReason] = useState("");
  const [deleteOpen, setDeleteOpen] = useState(false);
  const [deleting, setDeleting] = useState(false);

  /* ver */
  const [detailsOpen, setDetailsOpen] = useState(false);
  const [selectedRow, setSelectedRow] = useState(null);

  /*editar*/
  const [editOpen, setEditOpen] = useState(false);
  const [editingId, setEditingId] = useState(null);
  const [initialValues, setInitialValues] = useState(null);
  const [saving, setSaving] = useState(false);

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
  const [operadorFilter, setOperadorFilter] = useState("");

  const [typeFilter, setTypeFilter] = useState("");
  const [variantFilter, setVariantFilter] = useState("");
  const [actividadFilter, setActividadFilter] = useState("");

  const [page, setPage] = useState(1);

  const [adminAdvanced, setAdminAdvanced] = useState(false);

  const appliedDefaultType = useRef(false);
  const appliedDefaultVariant = useRef(false);

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
    
    // Filtro por operador (aplica a ambos tipos de reportes)
    if (operadorFilter) {
      rows = rows.filter((r) => {
        // Para reportes de alquiler usa instructorIngenieroId, para municipales usa operadorId
        const operadorId = isMunicipal 
          ? (r?.operadorId || r?.operador?.id)
          : (r?.instructorIngenieroId || r?.instructorIngeniero?.id);
        return operadorId && String(operadorId) === String(operadorFilter);
      });
    }
    
    if (isMunicipal) {
      if (distritoFilter) {
        const target = _norm(distritoFilter);
        rows = rows.filter((r) => {
          const list = getDistritosForSearch(r).map(_norm);
          return list.includes(target);
        });
      }

      if (codigoFilter) {
        const target = String(codigoFilter).replace(/\D/g, "");
        rows = rows.filter((r) => {
          const list = getCodigosForSearch(r);
          return list.includes(target);
        });
      }
    }

    return rows;
  }, [activeReports, startDate, endDate, distritoFilter, codigoFilter, operadorFilter, isMunicipal]);

  /* ========= TIPOS DISPONIBLES ========= */
  const tiposDisponiblesRental = useMemo(() => {
    if (!isRental) return [];
    const set = new Set();
    rowsScope.forEach(r => {
      const t = String(r?.tipoMaquinaria || "").toLowerCase();
      if (t) set.add(t);
    });
    return Array.from(set).sort((a, b) => a.localeCompare(b));
  }, [rowsScope, isRental]);

  const tiposDisponibles = useMemo(() => {
    if (isRental) return tiposDisponiblesRental;

    // MUNICIPAL
    const set = new Set();
    rowsScope.forEach((r) => {
      const t = getType(r);
      if (t) set.add(t);
    });
    const arr = Array.from(set);
    arr.sort((a, b) => {
      const ia = TYPE_ORDER.indexOf(a);
      const ib = TYPE_ORDER.indexOf(b);
      const A = ia === -1 ? 999 : ia;
      const B = ib === -1 ? 999 : ib;
      return A - B || a.localeCompare(b);
    });
    return arr;
  }, [rowsScope, isRental, tiposDisponiblesRental]);

  /* ========= VARIANTES (MUNICIPAL) ========= */
  const variantesDisponibles = useMemo(() => {
    if (!isMunicipal) return [];
    const t = (typeFilter || "").toLowerCase();
    return VARIANT_OPTIONS_BY_TYPE[t] ?? [];
  }, [typeFilter, isMunicipal]);

  /* ========= ACTIVIDADES (ALQUILER) ========= */
  const actividadesPorTipoRental = useMemo(() => {
    if (!isRental) return {};
    const map = new Map();
    rowsScope.forEach(r => {
      const t = String(r?.tipoMaquinaria || "").toLowerCase();
      const a = String(r?.actividad || "").trim();
      if (!t || !a) return;
      if (!map.has(t)) map.set(t, new Set());
      map.get(t).add(a);
    });
    const out = {};
    map.forEach((set, k) => (out[k] = Array.from(set).sort((a, b) => a.localeCompare(b))));
    return out;
  }, [rowsScope, isRental]);

  const actividadesDisponibles = useMemo(() => {
    if (!isRental) return [];
    const t = String(typeFilter || "").toLowerCase();
    return actividadesPorTipoRental[t] ?? [];
  }, [isRental, typeFilter, actividadesPorTipoRental]);

  /* ========= OPERADORES DISPONIBLES ========= */
  const operadoresDisponibles = useMemo(() => {
    const map = new Map();
    activeReports.forEach(r => {
      // Para reportes de alquiler usa instructorIngenieroId, para municipales usa operadorId
      const id = isMunicipal 
        ? (r?.operadorId || r?.operador?.id)
        : (r?.instructorIngenieroId || r?.instructorIngeniero?.id);
      if (!id) return;
      
      // Para reportes de alquiler usa instructorIngeniero, para municipales usa operador
      const operadorObj = isMunicipal ? r?.operador : r?.instructorIngeniero;
      const name = operadorObj?.name || "";
      const last = operadorObj?.last || "";
      const identification = operadorObj?.identification || "";
      
      if (!map.has(id)) {
        map.set(id, {
          id,
          name,
          last,
          identification,
          displayName: `${name} ${last}${identification ? ` (${identification})` : ""}`.trim()
        });
      }
    });
    
    return Array.from(map.values()).sort((a, b) => 
      a.displayName.localeCompare(b.displayName)
    );
  }, [activeReports, isMunicipal]);

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

  /* ---------- autoselección de VARIANTE (municipal) ---------- */
  useEffect(() => {
    if (!isMunicipal) return;

    const t = (typeFilter || "").toLowerCase();
    const options = VARIANT_OPTIONS_BY_TYPE[t] || [];

    if (!VARIANT_TYPES.has(t)) {
      if (variantFilter) setVariantFilter("");
      appliedDefaultVariant.current = false;
      return;
    }

    if (!options.includes(variantFilter) && options.length) {
      const candidate = VARIANT_ORDER.find((v) => options.includes(v)) || options[0];
      setVariantFilter(candidate);
      setPage(1);
      appliedDefaultVariant.current = true;
    }
  }, [isMunicipal, typeFilter, variantesDisponibles]); // eslint-disable-line

  /* ---------- autoselección en ALQUILER ---------- */
  useEffect(() => {
    if (!isRental) return;
    if (!typeFilter && tiposDisponiblesRental.length) {
      setTypeFilter(tiposDisponiblesRental[0]);
      setPage(1);
    }
  }, [isRental, typeFilter, tiposDisponiblesRental]);

  useEffect(() => {
    if (!isRental) return;
    const acts = actividadesPorTipoRental[String(typeFilter || "").toLowerCase()] || [];
    if (!acts.length) {
      if (actividadFilter) setActividadFilter("");
      return;
    }
    if (!actividadFilter || !acts.includes(actividadFilter)) {
      setActividadFilter(acts[0]);
      setPage(1);
    }
  }, [isRental, typeFilter, actividadesPorTipoRental]);

  const filtered = useMemo(() => {
    let rows = rowsScope;

    if (typeFilter) {
      const t = typeFilter.toLowerCase();
      if (isMunicipal) {
        rows = rows.filter((r) => getType(r) === t);
        if (VARIANT_TYPES.has(t)) rows = rows.filter((r) => getVar(r) === variantFilter);
      } else {
        rows = rows.filter((r) => String(r?.tipoMaquinaria || "").toLowerCase() === t);
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

  /* columnas */
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
      return ["ID", "Encargado", "Tipo Maquinaria", "Placa", "Actividad", "Fecha"];
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

    // *** Cambio clave: solo cabezal + variante cisterna ***
    if (t === "cabezal" && (variantFilter || "").toLowerCase() === "cisterna") {
      insertAfter(cols, "Maquinaria", "Placa cisterna");
    }

    return cols;
  }, [isMunicipal, typeFilter, variantFilter]);

  function cellValueMunicipal(r, col) {
    switch (col) {
      case "ID":
        return r.id;
      case "Operador":
        return r?.operador
          ? `${r.operador?.name ?? ""} ${r.operador?.last ?? ""}${r.operador?.identification ? ` (${r.operador.identification})` : ""}`
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
          get(r, "detalles.cisternaPlaca") ||
          get(r, "cisternaPlaca") ||
          get(r, "detalles.cisterna.placa") ||
          get(r, "placa_cisterna") ||
          get(r, "detalles.placa_cisterna") ||
          get(r, "detalles.placaCarreta") ||
          get(r, "placaCarreta") ||
          get(r, "detalles.carreta.placa") ||
          get(r, "placa_carreta") ||
          get(r, "detalles.placa_carreta")
        );
      case "Variante":
        return getVar(r) || "—";
      case "Estación":
        return toEstacionTxt(r);
      case "Distrito": {
        const list = getDistritosForSearch(r);
        return list.length ? list.join(" · ") : "—";
      }
      case "Código Camino": {
        const list = getCodigosForSearch(r);
        return list.length ? list.join(", ") : "—";
      }
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
      case "Encargado":
        // Primero intenta con instructorIngeniero
        if (r?.instructorIngeniero) {
          return `${r.instructorIngeniero?.name ?? ""} ${r.instructorIngeniero?.last ?? ""}${r.instructorIngeniero?.identification ? ` (${r.instructorIngeniero.identification})` : ""}`;
        }
        // Si no hay instructorIngeniero, intenta con usuario
        if (r?.usuario || r?.user) {
          const usr = r.usuario || r.user;
          return `${usr?.name ?? ""} ${usr?.last ?? ""}${usr?.email ? ` (${usr.email})` : ""}`;
        }
        // Último recurso: mostrar el ID
        return r?.instructorIngenieroId ? `ID: ${r.instructorIngenieroId}` : "—";
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

      setSelectedRow(full);
      setDetailsOpen(true);
    } catch (e) {
      console.error("GET detalle ->", e?.response || e);
    }
  };

  async function handleOpenEdit(row) {
    try {
      let rep, initial;
      if (isMunicipal) {
        rep = await machineryService.getReportById(row.id);
        initial = mapReportToForm(rep);
      } else {
        rep = await machineryService.getRentalReportById(row.id);
        initial = mapRentalToForm(rep);
      }
      setSelectedRow(rep);
      setEditingId(row.id);
      setInitialValues(initial);
      setEditOpen(true);
    } catch (e) {
      console.error("GET detalle (editar) ->", e?.response || e);
      alert("No se pudo abrir el reporte para editar.");
    }
  }

  /* -------- eliminar -------- */
  const askDelete = (row) => {
    setConfirmDeleteId(row.id);
    setDeleteOpen(true);
  };
  const confirmDeleteDialog = async () => {
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

  function mapReportToForm(rep) {
    const d = (rep && rep.detalles) || {};
    return {
      actividad: rep?.tipoActividad ?? rep?.actividad ?? "",
      horasOrd: rep?.horasOrd ?? rep?.horas_or ?? "",
      horasExt: rep?.horasExt ?? rep?.horas_ext ?? "",
      horaInicio: d?.horaInicio ?? rep?.horaInicio ?? "",
      horaFin: d?.horaFin ?? rep?.horaFin ?? "",
      fecha: rep?.fecha ?? "",
      kilometraje: rep?.kilometraje ?? d?.kilometraje ?? "",
      horimetro: rep?.horimetro ?? d?.horimetro ?? "",
      diesel: rep?.diesel ?? rep?.combustible ?? "",
      codigoCamino: rep?.codigoCamino ?? "",
      distrito: rep?.distrito ?? "",
      estacion: rep?.estacion ?? "",
      placaCarreta: rep?.placaCarreta ?? d?.placaCarreta ?? "",
      detalles: d,
    };
  }

  // Mapea RENTAL al formulario
  function mapRentalToForm(rep) {
    return {
      operadorId: rep?.instructorIngenieroId ?? rep?.instructorIngeniero?.id ?? "",
      tipoMaquinaria: rep?.tipoMaquinaria ?? "",
      placa: rep?.placa ?? "",
      actividad: rep?.actividad ?? "",
      cantidad: rep?.cantidad ?? "",
      horas: rep?.horas ?? "",
      estacion: rep?.estacion ?? "",
      fuente: rep?.fuente ?? rep?.detalles?.fuente ?? "",
      boleta: readBoletaAny(rep) ?? "",
      boletaK: rep?.boletaKylcsa ?? rep?.detalles?.boletaKylcsa ?? "",
      fecha: rep?.fecha ?? "",
      codigoCamino: rep?.codigoCamino ?? rep?.codigo_camino ?? rep?.detalles?.codigoCamino ?? "",
      distrito: rep?.distrito ?? rep?.detalles?.distrito ?? "",
      // 👇 importante para el editor
      detalles: {
        ...(rep?.detalles || {}),
        boletas: getBoletasArr(rep) || [],
        variante: rep?.variante ?? rep?.detalles?.variante ?? "",
      },
      variante: rep?.variante ?? rep?.detalles?.variante ?? "",
    };
  }

  // Helpers ALQUILER
  const readBoletaRental = (r) =>
    _first(
      r?.boleta, r?.detalles?.boleta,
      r?.boletaNumero, r?.detalles?.boletaNumero,
      r?.boleta_numero, r?.detalles?.boleta_numero
    );

  const readBoletaAny = (r) =>
    _first(
      r?.boleta, r?.detalles?.boleta,
      r?.boletaNumero, r?.detalles?.boletaNumero,
      r?.boleta_numero, r?.detalles?.boleta_numero,
      r?.boletaKylcsa, r?.boletaK,
      r?.detalles?.boletaKylcsa, r?.detalles?.boletaK
    );

  // ELIMINAR con SweetAlert
  const handleDeleteWithSwal = async (row) => {
    const res = await swalConfirmDelete(`el reporte #${row.id}`);
    if (!res.isConfirmed) return;

    try {
      if (isMunicipal) {
        await machineryService.deleteReport(row.id, "");
        setRowsMunicipal(prev => prev.filter(r => r.id !== row.id));
      } else {
        await machineryService.deleteRentalReport(row.id, "");
        setRowsRental(prev => prev.filter(r => r.id !== row.id));
      }
      await showSuccess("Eliminado", "El reporte se envió a la papelera.");
    } catch (e) {
      console.error(e);
      await showError("No se pudo eliminar", "Intenta nuevamente.");
    }
  };

  // RESTAURAR con SweetAlert
  const handleRestoreWithSwal = async (row) => {
    const res = await swalConfirmAction(
      "¿Restaurar reporte?",
      `El reporte #${row.id} volverá a la lista.`
    );
    if (!res.isConfirmed) return;

    try {
      let restored;
      if (isMunicipal) {
        restored = await machineryService.restoreReport(row.id);
        setRowsMunicipal(prev => [restored, ...prev.filter(x => x.id !== restored.id)]);
      } else {
        restored = await machineryService.restoreRentalReport(row.id);
        setRowsRental(prev => [restored, ...prev.filter(x => x.id !== restored.id)]);
      }
      setDeletedRows(prev => prev.filter(x => x.id !== row.id));
      await showSuccess("Restaurado", "El reporte se restauró correctamente.");
    } catch (e) {
      console.error(e);
      await showError("No se pudo restaurar", "Intenta nuevamente.");
    }
  };

  // ====== Construir payload MUNICIPAL (versión completa, única) ======
  function buildMunicipalPayload(iv, selectedRow) {
    const r = selectedRow || {};
    const t = getType(r);
    const v = getVar(r);

    const isCarretaVar = (t === "vagoneta" || t === "cabezal") && v === "carreta";
    const isMaterialVar = (t === "vagoneta" || t === "cabezal") && v === "material";
    const isCisterna = t === "cisterna" || ((t === "vagoneta" || t === "cabezal") && v === "cisterna");

    const detallesPrev = (r && r.detalles) || {};
    const detalles = { ...detallesPrev };

    detalles.horaInicio = toNull(iv.horaInicio);
    detalles.horaFin = toNull(iv.horaFin);

    if (isCisterna) {
      if (iv?.detalles?.cantidadLiquido !== undefined)
        detalles.cantidadLiquido = toNumOrNull(iv.detalles.cantidadLiquido);
      if (iv?.detalles?.fuente !== undefined)
        detalles.fuente = toNull(iv.detalles.fuente);

      if (t === "cabezal" && v === "cisterna") {
        const placaCis = iv?.detalles?.placaCisterna ?? iv?.detalles?.cisternaPlaca;
        detalles.placaCisterna = toNull(placaCis);
      }
    }

    if (isCarretaVar) {
      if (iv?.placaCarreta !== undefined)
        detalles.placaCarreta = toNull(iv.placaCarreta);
      if (iv?.detalles?.tipoCarga !== undefined)
        detalles.tipoCarga = toNull(iv.detalles.tipoCarga);
      if (iv?.detalles?.destino !== undefined)
        detalles.destino = toNull(iv.detalles.destino);
    }

    if (isMaterialVar) {
      const boletas = normalizeBoletas(iv?.detalles?.boletas);
      detalles.boletas = boletas;
      detalles.totalCantidadMaterial = sumM3(boletas);
    }

    const payload = {
      tipoActividad: toNull(iv.actividad),
      actividad: toNull(iv.actividad),
      horasOrd: toNumOrNull(iv.horasOrd),
      horasExt: toNumOrNull(iv.horasExt),
      kilometraje: toNumOrNull(iv.kilometraje),
      horimetro: toNumOrNull(iv.horimetro),
      diesel: toNumOrNull(iv.diesel),
      fecha: toNull(iv.fecha),
      codigoCamino: only3digitsOrNull(iv.codigoCamino),
      distrito: toNull(iv.distrito),
      estacion: normalizeEstacion(toNull(iv.estacion)),
      detalles,
    };

    // espejos para compatibilidad en listados antiguos
    payload.horaInicio = detalles.horaInicio ?? iv.horaInicio ?? null;
    payload.horaFin = detalles.horaFin ?? iv.horaFin ?? null;

    if (detalles.kilometraje != null) payload.kilometraje = detalles.kilometraje;
    if (detalles.horimetro != null) payload.horimetro = detalles.horimetro;

    if (payload.horasOrd != null) payload.horas_or = payload.horasOrd;
    if (payload.horasExt != null) payload.horas_ext = payload.horasExt;
    if (payload.diesel != null) payload.combustible = payload.diesel;

    return payload;
  }

  async function handleSaveEdit() {
    if (!editingId || !initialValues) return;
    try {
      setSaving(true);

      if (isMunicipal) {
        const payload = buildMunicipalPayload(initialValues, selectedRow);
        const updated = await machineryService.updateReport(editingId, payload);
        setRowsMunicipal(prev => prev.map(r => (r.id === updated.id ? updated : r)));
      } else {
        const dig3 = (s) => /^\d{3}$/.test(String(s || ""));
        if (initialValues.codigoCamino && !dig3(initialValues.codigoCamino)) {
          await showError("Código de camino inválido", "Debes ingresar exactamente 3 dígitos (ej. 015).");
          setSaving(false);
          return;
        }
        const showCantidad = showCantidadRental(initialValues.tipoMaquinaria);
        const showEstacion = showEstacionRental(initialValues.tipoMaquinaria);

        const isK = (initialValues.fuente || "").toUpperCase() === "KYLCSA";
        const isMaterialLike =
          (String(initialValues.tipoMaquinaria).toLowerCase() === "vagoneta" ||
            String(initialValues.tipoMaquinaria).toLowerCase() === "cabezal") &&
          (
            String(initialValues?.variante || initialValues?.detalles?.variante || "").toLowerCase() === "material" ||
            (Array.isArray(initialValues?.detalles?.boletas) && initialValues.detalles.boletas.length > 0) ||
            /material/i.test(String(initialValues?.actividad || ""))
          );

        const boletasNorm = isMaterialLike ? normalizeBoletas(initialValues?.detalles?.boletas) : [];
        const totalM3Day = isMaterialLike ? sumM3(boletasNorm) : null;

        const payload = {
          operadorId: initialValues.operadorId ? Number(initialValues.operadorId) : null,
          tipoMaquinaria: toNull(initialValues.tipoMaquinaria),
          placa: toNull(initialValues.placa),
          actividad: toNull(initialValues.actividad),
          cantidad: showCantidad ? toNumOrNull(initialValues.cantidad) : null,
          horas: toNumOrNull(initialValues.horas),
          estacion: showEstacion ? normalizeEstacion(toNull(initialValues.estacion)) : null,
          fuente: !isMaterialLike ? toNull(initialValues.fuente) : null,
          boleta: (!isMaterialLike && !isK) ? toNull(initialValues.boleta) : null,
          boletaKylcsa: (!isMaterialLike && isK) ? toNull(initialValues.boletaK || initialValues.boletaKylcsa) : null,
          fecha: toNull(initialValues.fecha),
          codigoCamino: only3digitsOrNull(initialValues.codigoCamino),
          distrito: toNull(initialValues.distrito),
          // 👇 mandar arreglo y total dentro de detalles cuando material
          detalles: isMaterialLike ? { ...(initialValues.detalles || {}), boletas: boletasNorm, totalCantidadMaterial: totalM3Day, variante: "material" } : (initialValues.detalles || undefined),
        };

        const updated = await machineryService.updateRentalReport(editingId, payload);
        setRowsRental((prev) => prev.map((r) => (r.id === updated.id ? updated : r)));
      }

      setEditOpen(false);
      setEditingId(null);
      setInitialValues(null);
    } catch (e) {
      console.error("UPDATE report ->", e?.response || e);
      alert("No se pudo guardar los cambios.");
    } finally {
      setSaving(false);
    }
  }

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
      Fecha: fmtDMY(r?.fecha),
      Estacion: usesStation(r) ? toEstacionTxt(r) : "",
      PlacaMaquinariaLlevada: d?.placaMaquinariaLlevada ?? r?.placaMaquinariaLlevada ?? "",
      TipoMaterial: d?.tipoMaterial ?? r?.tipoMaterial ?? "",
      CantidadMaterial_m3: d?.cantidadMaterial ?? r?.cantidadMaterial ?? "",
      BoletaSimple: d?.boleta ?? r?.boleta ?? "",
      Fuente: readFuente(r) ?? "",
      TotalDia_m3: getTotalM3(r) ?? "",
      Distrito: getDistritosForSearch(r).join(" · ") || "",
      CodigoCamino: getCodigosForSearch(r).join(", ") || "",
    };

    if ((t === "vagoneta" || t === "cabezal") && v === "material") {
      const placaCarretaMat = readPlacaCarreta(r);
      if (placaCarretaMat) flat.PlacaCarreta = placaCarretaMat;
      const breakdown = getMaterialBreakdown(r);
      const mats = Object.keys(breakdown);
      if (mats.length > 1) {
        flat.TipoMaterial = "";
        flat.CantidadMaterial_m3 = "";
        flat.Materiales_m3 = materialSummaryStr(breakdown);
      } else if (mats.length === 1) {
        const mat = mats[0];
        if (!flat.TipoMaterial) flat.TipoMaterial = mat;
        if (!flat.CantidadMaterial_m3) flat.CantidadMaterial_m3 = breakdown[mat];
      }

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

    if ((t === "vagoneta" || t === "cabezal") && v === "carreta") {
      flat.PlacaCarreta = d?.placaCarreta ?? d?.carreta?.placa ?? r?.placaCarreta ?? r?.placa_carreta ?? "";
      flat.TipoCarga = d?.tipoCarga ?? r?.tipoCarga ?? "";
      flat.Destino = d?.destino ?? r?.destino ?? "";
    }

    const isCisternaTipo = t === "cisterna";
    const isCisternaVar = (t === "vagoneta" || t === "cabezal") && v === "cisterna";
    if (isCisternaTipo || isCisternaVar) {
      flat.CantidadAgua_m3 =
        d?.cantidadLiquido ?? r?.cantidadLiquido ??
        d?.cantidad_agua ?? r?.cantidad_agua ?? "";
      flat.Fuente = flat.Fuente || readFuente(r) || "";
    }

    if (t === "cabezal" && v === "cisterna") {
      const placaCis = (
        d?.placaCisterna ?? r?.placaCisterna ??
        d?.cisternaPlaca ?? r?.cisternaPlaca ??
        d?.cisterna?.placa ??
        r?.placa_cisterna ?? d?.placa_cisterna ??
        d?.placaCarreta ?? r?.placaCarreta ??
        d?.carreta?.placa ?? r?.placa_carreta ?? d?.placa_carreta ?? null
      );
      flat.PlacaCisterna = placaCis ?? "";
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
      Encargado: operadorTxt,
      TipoMaquinaria: r?.tipoMaquinaria ?? "",
      Placa: r?.placa ?? "",
      Actividad: r?.actividad ?? "",
      Cantidad: r?.cantidad ?? "",
      Horas: r?.horas ?? "",
      Estacion: r?.estacion ?? "",
      Boleta: readBoletaAny(r) ?? "",
      Fuente: readFuente(r) ?? "",
      Distrito: r?.distrito ?? "",
      CodigoCamino: r?.codigoCamino ?? "",
      Fecha: fmtDMY(r?.fecha),
    };
  }

  const exportExcel = () => {
    let rows = isMunicipal
      ? filtered.map(buildFlatRowMunicipal)
      : filtered.map(buildFlatRowRental);

    const maxBoletas = rows.reduce((m, r) => {
      const n = Object.keys(r).filter(k => /^Boleta \d+$/.test(k)).length;
      return Math.max(m, n);
    }, 0);

    if (maxBoletas > 0) {
      rows = rows.map(r => {
        const { Boletas, ...rest } = r;
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

    let headers = Array.from(new Set(rows.flatMap(r => Object.keys(r))));
    headers = pruneEmptyColumns(rows, headers);
    headers = headers.filter(h => h !== "TipoMaterial" && h !== "CantidadMaterial_m3");

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
    let rows = isMunicipal
      ? filtered.map(buildFlatRowMunicipal)
      : filtered.map(buildFlatRowRental);

    const maxBoletas = rows.reduce((m, r) => {
      const n = Object.keys(r).filter(k => /^Boleta \d+$/.test(k)).length;
      return Math.max(m, n);
    }, 0);

    if (maxBoletas > 0) {
      rows = rows.map(r => {
        const { Boletas, ...rest } = r;
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

    let headers = Array.from(new Set(rows.flatMap(r => Object.keys(r))));
    headers = pruneEmptyColumns(rows, headers);
    headers = headers.filter(h => h !== "TipoMaterial" && h !== "CantidadMaterial_m3");

    const toHTML = (v) => (isEmptyVal(v) ? "—" : String(v).replace(/\n/g, "<br>"));
    const headerAbs = new URL(HEADER_URL, window.location.origin).toString();
    const footerAbs = new URL(FOOTER_URL, window.location.origin).toString();

    const ROWS_PER_PAGE = 9;

    const COL_WIDTHS = {
      "Tipo": "54px",
      "ID": "30px",
      "Operador": "70px",
      "Maquinaria": "70px",
      "Tipo Maquinaria": "75px",
      "Variante": "50px",
      "Kilometraje": "64px",
      "Horímetro": "50px",
      "Diesel": "42px",
      "Horas Ord": "46px",
      "Horas Ext": "46px",
      "Tipo Actividad": "98px",
      "Hora Inicio": "55px",
      "Hora Fin": "46px",
      "Distrito": "65px",
      "Código Camino": "55px",
      "Codigo Camino": "48px",
      "Fecha": "65px",
      "Total Dia m³": "40px",
      "Materiales m³": "83px",
      "Placa cisterna": "86px",
      "Boleta 1": "88px",
      "Boleta 2": "88px",
      "Boleta 3": "88px",
      "Boleta 4": "88px",
      "Boleta 5": "88px",
      "Cantidad Agua m³": "100px",
      "Fuente": "80px",
      "Estacion": "50px",
      "Horimetro": "60px",
      "Placa Cisterna": "80px",
      "Placa Carreta": "60px",
      "Placa Maquinaria Llevada": "65px",
      "Tipo Carga": "60px",
      "Destino": "60px"
    };

    const NUMERIC_COLS = new Set([
      "ID", "Kilometraje", "Horímetro", "Horimetro", "Diesel",
      "Horas Ord", "Horas Ext", "Código Camino", "Codigo Camino",
      "Fecha", "Total Día m³", "Total Dia m³"
    ]);

    const head = `
<style>
  :root{ --footer-h: 30px; --gap-bottom: 8px; --margin-x: 18mm; }
  @page{ size: A4 landscape; margin: 14mm var(--margin-x) calc(var(--footer-h) + var(--gap-bottom)) var(--margin-x); }
  html,body{ margin:0; padding:0; font-family: system-ui, -apple-system, "Segoe UI", Roboto, Arial, sans-serif; -webkit-print-color-adjust: exact; print-color-adjust: exact; }
  footer{ position: fixed; left: var(--margin-x); right: var(--margin-x); bottom: 0; height: var(--footer-h); display:flex; align-items:center; justify-content:center; background:#fff; z-index:5; transform: translateZ(0); }
  footer img{ height: calc(var(--footer-h) - 2px); width:auto; object-fit:contain; display:block; }
  main{ padding-bottom: calc(var(--footer-h) + var(--gap-bottom)); }
  table{ width:100%; border-collapse:collapse; table-layout:fixed; font-size:10px; }
  thead{ display: table-header-group; }
  .logo-row td{ border:none; padding:0 0 10px; background:#fff; }
  .logo-wrap{ display:flex; align-items:center; justify-content:center; }
  .logo-wrap img{ height:80px; object-fit:contain; }
  thead .cols th{ background:#f3f4f6; border:1px solid #e5e7eb; padding:4px 4px; line-height:1.1; vertical-align:bottom; }
  thead .cols .th{ white-space:normal; word-break:normal; overflow-wrap:break-word; hyphens:auto; }
  tbody td{ border:1px solid #eef2f7; padding:4px 4px; line-height:1.80; vertical-align:top; word-break:break-word; white-space:normal; hyphens:auto; }
  tbody tr:nth-child(even) td{ background:#fafafa; }
  .num{ text-align:center; }
  .break-row{ page-break-after: always; }
  .break-row td{ border:none; padding:0; height:0; }
  thead tr, thead th{ break-inside:avoid; page-break-inside:avoid; }
  tbody tr{ break-inside:auto; page-break-inside:auto; }
  .pdf-wrap{ display:flex; justify-content:center; }
</style>`;

    const headersRaw = headers.slice();
    const headersPretty = headersRaw.map(h => pretty(h));

    const thead = `
  <tr class="logo-row">
    <td colspan="${headersRaw.length}">
      <div class="logo-wrap"><img src="${headerAbs}" alt="Header"></div>
    </td>
  </tr>
  <tr class="cols">
    ${headersRaw.map((hRaw, i) => {
      const hNice = headersPretty[i];
      const cls = NUMERIC_COLS.has(hNice) || NUMERIC_COLS.has(hRaw) ? ' class="num"' : '';
      return `<th${cls}><div class="th">${hNice}</div></th>`;
    }).join("")}
  </tr>`;

    const tbody = (() => {
      const out = [];
      rows.forEach((rowObj, idx) => {
        out.push(
          `<tr>${headersRaw.map((hRaw, i) => {
            const v = isEmptyVal(rowObj[hRaw]) ? "" : toHTML(rowObj[hRaw]);
            const hNice = headersPretty[i];
            const cls = NUMERIC_COLS.has(hNice) || NUMERIC_COLS.has(hRaw) ? ' class="num"' : '';
            return `<td${cls}>${v}</td>`;
          }).join("")
          }</tr>`
        );
        if ((idx + 1) % ROWS_PER_PAGE === 0) {
          out.push(`<tr class="break-row"><td colspan="${headersRaw.length}"></td></tr>`);
        }
      });
      return out.join("");
    })();

    const html = `
<html>
  <head>${head}</head>
  <body>
    <main>
      <table>
        <thead>${thead}</thead>
        <tbody>${tbody}</tbody>
      </table>
    </main>
    <footer><img src="${footerAbs}" alt="Pie de página"></footer>
  </body>
</html>`;

    const win = window.open("", "_blank");
    if (!win) { alert("Bloqueado por el navegador. Habilita pop-ups para exportar."); return; }
    win.document.open(); win.document.write(html); win.document.close();

    const waitImages = () =>
      Promise.all(Array.from(win.document.images).map(img => new Promise(res => {
        if (img.complete) return res(); img.onload = res; img.onerror = res;
      })));

    waitImages().then(() => { win.focus(); win.print(); });
    win.onafterprint = () => { try { win.close(); } catch { } };
  };

  const [filtersOpen, setFiltersOpen] = useState(false);

  return (
    <div className="space-y-4 max-w-[1500px] mx-auto px-4">
      {/* Pestañas */}
      <div className="flex border-b border-gray-200">
        <button
          onClick={() => {
            setActiveReportTab("municipal");
            setVariantFilter("");
            setActividadFilter("");
            setOperadorFilter("");
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
            🏛️ Reportes municipales
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
            setOperadorFilter("");
            setPage(1);
          }}
          className={`px-6 py-3 text-sm font-medium border-b-2 transition-colors ${isRental
            ? "border-green-500 text-green-600 bg-green-50"
            : "border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300"
            }`}
        >
          <span className="flex items-center gap-2">
            🚛 Reportes de alquiler
            <span className="bg-green-100 text-green-800 text-xs px-2 py-1 rounded-full">
              {rowsRental.length}
            </span>
          </span>
        </button>
      </div>

      {/* Panel Filtros */}
      <div className="rounded-2xl border bg-white">
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
                setOperadorFilter("");
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

            <div className="hidden md:flex items-center gap-2 pl-3 border-l">
              <Button
                className="bg-green-500 hover:bg-green-600 text-white whitespace-nowrap"
                onClick={exportExcel}
              >
                <Download className="w-4 h-4" />
                Excel
              </Button>
              <Button
                className="bg-red-500 hover:bg-red-600 text-white whitespace-nowrap"
                onClick={exportPDF}
              >
                <Download className="w-4 h-4" />
                PDF
              </Button>

              {canViewDeletedReports(user) && (
                <Button
                  variant="secondary"
                  className="whitespace-nowrap"
                  onClick={openDeleted}
                >
                  Ver reportes eliminados
                </Button>
              )}
            </div>
          </div>
        </div>
      </div>

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
                setOperadorFilter("");
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
            {/* Selector de operador (inspector/ingeniero) */}
            <div>
              <div className="text-sm font-medium text-gray-700 mb-1">
                Inspector/Ingeniero
              </div>
              <Select
                value={operadorFilter}
                onValueChange={(v) => {
                  setOperadorFilter(v);
                  setPage(1);
                }}
              >
                <SelectTrigger>
                  <SelectValue placeholder="Todos los inspectores" />
                </SelectTrigger>
                <SelectContent>
                  {operadoresDisponibles.map((op) => (
                    <SelectItem key={op.id} value={String(op.id)}>
                      {op.displayName}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            
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
                      {(VARIANT_OPTIONS_BY_TYPE[(typeFilter || "").toLowerCase()] || [])
                        .map((v) => (
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
                    Encargado: "w-[220px]",
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

                    {canEditReports(user, r) && (
                      <button
                        className="p-2 rounded hover:bg-blue-50 text-blue-800"
                        title="Editar reporte"
                        onClick={() => handleOpenEdit(r)}
                      >
                        <Edit2 className="w-4 h-4" />
                      </button>
                    )}

                    {canDeleteReports(user, r) && (
                      <button
                        type="button"
                        onClick={() => handleDeleteWithSwal(r)}
                        className="p-2 rounded-lg text-red-600 hover:bg-red-50"
                        title="Eliminar"
                        aria-label="Eliminar"
                      >
                        <Trash2 size={18} />
                      </button>
                    )}
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

          {selectedRow && (
            isRental
              ? <RentalDetails r={selectedRow} />
              : (() => {
                const r = selectedRow;
                const t = getType(r);
                const v = getVar(r);
                const d = r.detalles || {};
                const kmType = isKmType(t);
                const showVariante = t === "vagoneta" || t === "cabezal";
                const showEstacion = STATION_TYPES.has(t) || _hasStationData(r);

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

                let addedFuente = false;
                const pushFuente = (v) => {
                  if (addedFuente) return;
                  if (v !== null && v !== undefined && String(v).trim() !== "") {
                    base.push({ label: "Fuente", value: v });
                    addedFuente = true;
                  }
                };

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
                    value: kmType ? (d?.kilometraje ?? r?.kilometraje) : (d?.horimetro ?? r?.horimetro),
                  },
                  { label: "Tipo actividad", value: r?.tipoActividad ?? r?.actividad },
                  {
                    label: "Horario",
                    value: (() => {
                      const ini = d?.horaInicio ?? r?.horaInicio;
                      const fin = d?.horaFin ?? r?.horaFin;
                      return ini || fin ? `${ini ?? "—"} – ${fin ?? "—"}` : null;
                    })(),
                  },
                  { label: "Diésel", value: (d?.diesel ?? r?.diesel ?? r?.combustible) },
                  {
                    label: "Horas (Ord/Ext)",
                    value:
                      (d?.horasOrd ?? r?.horasOrd ?? r?.horas_or ?? null) !== null ||
                        (d?.horasExt ?? r?.horasExt ?? r?.horas_ext ?? null) !== null
                        ? `${(d?.horasOrd ?? r?.horasOrd ?? r?.horas_or ?? "—")} / ${(d?.horasExt ?? r?.horasExt ?? r?.horas_ext ?? "—")}`
                        : null,
                  },
                  { label: "Distrito", value: r?.distrito },
                  { label: "Código Camino", value: r?.codigoCamino },
                  { label: "Fecha", value: fmtDMY(r?.fecha) },
                ];

                if (showVariante) base.push({ label: "Variante", value: v || null });
                if (showEstacion) base.push({ label: "Estación", value: toEstacionTxt(r) });

                const read = (...paths) => {
                  for (const p of paths) {
                    const val = get(r, p);
                    if (val !== undefined && val !== null && String(val) !== "") return val;
                  }
                  return null;
                };

                const placaMaqLlevada = read(
                  "placaMaquinariaLlevada",
                  "detalles.placaMaquinariaLlevada",
                  "placa_maquinaria_llevada",
                  "detalles.placa_maquinaria_llevada"
                );
                if (placaMaqLlevada) base.push({ label: "Placa maq. llevada", value: placaMaqLlevada });

                if ((t === "vagoneta" || t === "cabezal") && v === "carreta") {
                  base.push({ label: "Placa carreta", value: read("placaCarreta", "detalles.placaCarreta", "placa_carreta", "detalles.placa_carreta") ?? "—" });
                  base.push({ label: "Tipo de carga", value: read("tipoCarga", "detalles.tipoCarga", "tipo_carga", "detalles.tipo_carga") ?? "—" });
                  base.push({ label: "Destino", value: read("destino", "detalles.destino", "destino_carga", "detalles.destino_carga") ?? "—" });
                }

                if ((t === "vagoneta" || t === "cabezal") && v === "material") {
                  const placaCarretaMat = readPlacaCarreta(r);
                  if (placaCarretaMat) {
                    base.push({ label: "Placa carreta", value: placaCarretaMat });
                  }
                }

                if (t === "cabezal" && v === "cisterna") {
                  const placaCisterna = read(
                    "placaCisterna", "detalles.placaCisterna",
                    "placa_cisterna", "detalles.placa_cisterna",
                    "detalles.cisterna.placa",
                    "placaCarreta", "detalles.placaCarreta",
                    "placa_carreta", "detalles.placa_carreta",
                    "detalles.carreta.placa"
                  );
                  if (placaCisterna) base.push({ label: "Placa cisterna", value: placaCisterna });
                }

                const isCisternaTipo = t === "cisterna";
                const isCisternaVar = (t === "vagoneta" || t === "cabezal") && v === "cisterna";
                if (isCisternaTipo || isCisternaVar) {
                  const cantidadAgua = read(
                    "cantidadLiquido", "detalles.cantidadLiquido",
                    "cantidad_agua", "detalles.cantidad_agua",
                    "detalles.cisterna.cantidad", "detalles.cisterna.cantidadLiquido"
                  );
                  const fuenteAgua =
                    readFuente(r) ??
                    read("detalles.cisterna.fuenteAgua", "fuenteAgua", "detalles.fuenteAgua");
                  base.push({ label: "Cantidad agua (m³)", value: cantidadAgua ?? "—" });
                  pushFuente(fuenteAgua);
                }

                const isMaterialVar =
                  (t === "vagoneta" || t === "cabezal") && v === "material";

                const hasVal = (x) => x !== undefined && x !== null && String(x).trim() !== "";
                let baseFiltered = base.filter(k => hasVal(k.value) || k.value === 0);

                if (isMaterialVar) {
                  baseFiltered = baseFiltered.filter(k => {
                    if (k.label === "Distrito") return false;
                    if (k.label === "Código Camino") return false;
                    return true;
                  });
                }

                const isRioOTajo = (f) => f === "Ríos" || f === "Tajo";
                const showBoletas = showVariante && v === "material" && !isFlatbed8803(r);
                const fmtFuente = (b = {}) =>
                  isRioOTajo(b?.fuente) ? `${b.fuente}${b?.subFuente ? ` – ${b.subFuente}` : ""}` : (b?.fuente || "—");

                const boletas = getBoletasArr(r);
                const totalM3 = getTotalM3(r);

                return (
                  <div className="space-y-4">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                      {baseFiltered.map((k, i) => (
                        <KV key={`b-${i}`} {...k} />
                      ))}
                    </div>

                    {showBoletas && (
                      <div className="border rounded-lg p-3">
                        <div className="text-sm font-semibold mb-2">Detalles de Boleta</div>

                        {Array.isArray(boletas) && boletas.length > 0 ? (
                          <div className="overflow-x-auto">
                            <table className="w-full text-sm">
                              <thead className="bg-gray-50">
                                <tr>
                                  <th className="text-left px-3 py-2">#</th>
                                  <th className="text-left px-3 py-2">Tipo material</th>
                                  <th className="text-left px-3 py-2">Fuente / Sub-fuente</th>
                                  <th className="text-left px-3 py-2">m³</th>
                                  <th className="text-left px-3 py-2">Distrito</th>
                                  <th className="text-left px-3 py-2">Código Camino</th>
                                  <th className="text-left px-3 py-2">Boleta</th>
                                </tr>
                              </thead>

                              <tbody>
                                {boletas.map((b, i) => {
                                  const m3 = b?.m3 ?? b?.cantidad ?? b?.metros3 ?? b?.volumen ?? "";
                                  const distrito = b?.distrito ?? b?.Distrito ?? "";
                                  const codigo = b?.codigoCamino ?? b?.CodigoCamino ?? b?.codigo_camino ?? "";

                                  return (
                                    <tr key={i} className="border-t">
                                      <td className="px-3 py-2">{i + 1}</td>
                                      <td className="px-3 py-2">{showText(b?.tipoMaterial)}</td>
                                      <td className="px-3 py-2">{fuseFuente(b)}</td>
                                      <td className="px-3 py-2">{showNum(m3)}</td>
                                      <td className="px-3 py-2">{showText(distrito)}</td>
                                      <td className="px-3 py-2">{showText(codigo)}</td>
                                      <td className="px-3 py-2">{showText(b?.boleta)}</td>
                                    </tr>
                                  );
                                })}
                              </tbody>
                            </table>
                          </div>
                        ) : (
                          <div className="text-sm text-gray-500">Sin boletas registradas.</div>
                        )}

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

                    {isFlatbed8803(r) && (
                      <div className="mt-4 space-y-2">
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                          <div className="bg-white border rounded-lg p-3">
                            <div className="text-xs text-gray-500">Distrito</div>
                            <div className="font-medium">{r?.distrito || "—"}</div>
                          </div>
                          <div className="bg-white border rounded-lg p-3">
                            <div className="text-xs text-gray-500">Código Camino</div>
                            <div className="font-medium">{r?.codigoCamino || "—"}</div>
                          </div>
                        </div>
                        <br />
                        <div className="text-sm font-semibold">Material(es) transportados</div>
                        <div className="border rounded-md p-3">
                          <div className="text-sm">
                            {(r?.detalles?.plataforma?.materiales || []).length
                              ? r.detalles.plataforma.materiales.join(", ")
                              : "—"}
                          </div>
                          {r?.detalles?.plataforma?.materiales?.includes("Otros") && (
                            <div className="mt-2 text-sm">
                              <span className="text-muted-foreground">Detalle (Otros): </span>
                              <span className="font-medium">
                                {r?.detalles?.plataforma?.materialesOtros || "—"}
                              </span>
                            </div>
                          )}
                        </div>
                      </div>
                    )}

                  </div>
                );
              })()
          )}
        </DialogContent>
      </Dialog>

      {/* ===== Modal EDITAR ===== */}
      <Dialog open={editOpen} onOpenChange={setEditOpen}>
        <DialogContent className="max-w-4xl max-h-[80vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>Editar reporte {editingId ? `#${editingId}` : ""}</DialogTitle>
            <DialogDescription>Modifica los campos necesarios.</DialogDescription>

            {canEditReports(user, selectedRow) && (
              <div className="mt-2 flex items-center justify-between">
                <div className="text-sm text-gray-600">
                  {adminAdvanced ? "Modo avanzado (admin) activado" : "Modo normal"}
                </div>
                <Button
                  variant="secondary"
                  onClick={() => setAdminAdvanced(v => !v)}
                  className="h-8"
                >
                  {adminAdvanced ? "Desactivar avanzado" : "Activar avanzado"}
                </Button>
              </div>
            )}
          </DialogHeader>

          {initialValues && (
            isRental ? (
              <>
                <RentalEditForm
                  initialValues={initialValues}
                  setInitialValues={setInitialValues}
                  districts={districts}
                />

                <div className="flex justify-end gap-2 pt-4">
                  <Button
                    variant="secondary"
                    onClick={() => {
                      setEditOpen(false);
                      setEditingId(null);
                      setInitialValues(null);
                    }}
                  >
                    Cancelar
                  </Button>
                  <Button
                    className="bg-blue-600 hover:bg-blue-700 text-white"
                    disabled={saving}
                    onClick={handleSaveEdit}
                  >
                    {saving ? "Guardando..." : "Guardar cambios"}
                  </Button>
                </div>
              </>
            ) : (() => {
              const r = selectedRow || {};
              const t = getType(r);
              const v = getVar(r);

              const isCarretaVar = (t === "vagoneta" || t === "cabezal") && v === "carreta";
              const isMaterialVar = (t === "vagoneta" || t === "cabezal") && v === "material";
              const isCisterna = t === "cisterna" || ((t === "vagoneta" || t === "cabezal") && v === "cisterna");
              const showStation = STATION_TYPES.has(t) || _hasStationData(r);

              const setIV = (patch) => setInitialValues((prev) => ({ ...prev, ...patch }));
              const setDet = (patch) =>
                setInitialValues((prev) => ({ ...prev, detalles: { ...(prev?.detalles || {}), ...patch } }));
              const numberOrBlank = (x) => (x === null || x === undefined ? "" : x);

              const FieldBox = ({ label, children, className = "" }) => (
                <div className={`bg-white border rounded-lg p-3 ${className}`}>
                  <div className="text-xs text-gray-500">{label}</div>
                  <div className="mt-1">{children}</div>
                </div>
              );

              const flatInputClass =
                "h-8 w-full border-none bg-transparent shadow-none px-0 focus-visible:ring-0 focus:outline-none";

              const boletas = Array.isArray(initialValues?.detalles?.boletas)
                ? initialValues.detalles.boletas
                : [];

              const updateBoleta = (idx, key, val) => {
                setDet({ boletas: boletas.map((b, i) => (i === idx ? { ...b, [key]: val } : b)) });
              };
              const addBoleta = () =>
                setDet({ boletas: [...boletas, { boleta: "", tipoMaterial: "", fuente: "", subFuente: "", m3: "", distrito: "", codigoCamino: "" }] });
              const removeBoleta = (idx) => setDet({ boletas: boletas.filter((_, i) => i !== idx) });

              return (
                <div className="space-y-5">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                    <FieldBox label="Encargado">
                      {r?.instructorIngeniero
                        ? `${r.instructorIngeniero?.name ?? ""} ${r.instructorIngeniero?.last ?? ""}${r.instructorIngeniero?.identification ? ` (${r.instructorIngeniero.identification})` : ""}`
                        : (r?.usuario || r?.user)
                        ? `${(r.usuario || r.user)?.name ?? ""} ${(r.usuario || r.user)?.last ?? ""}${(r.usuario || r.user)?.email ? ` (${(r.usuario || r.user).email})` : ""}`
                        : r?.instructorIngenieroId || "—"}
                    </FieldBox>

                    <FieldBox label="Tipo maquinaria (texto)">
                      <Input
                        className={flatInputClass}
                        value={initialValues?.tipoMaquinaria ?? selectedRow?.tipoMaquinaria ?? selectedRow?.maquinaria?.tipo ?? ""}
                        onChange={(e) => setIV({ tipoMaquinaria: e.target.value })}
                        placeholder="Ej: vagoneta, cabezal, cisterna, excavadora..."
                      />
                    </FieldBox>

                    <FieldBox label="Maquinaria">
                      {r?.maquinaria
                        ? `${r.maquinaria?.tipo ?? ""}${r.maquinaria?.placa ? ` - ${r.maquinaria.placa}` : ""}`
                        : r?.maquinariaId || "—"}
                    </FieldBox>

                    <FieldBox label={isKmType(t) ? "Kilometraje" : "Horímetro"}>
                      <Input
                        type="number"
                        step="0.01"
                        value={isKmType(t) ? numberOrBlank(initialValues?.kilometraje ?? initialValues?.detalles?.kilometraje) : numberOrBlank(initialValues?.horimetro ?? initialValues?.detalles?.horimetro)}
                        onChange={(e) => {
                          if (isKmType(t)) setIV({ kilometraje: e.target.value });
                          else setIV({ horimetro: e.target.value });
                        }}
                        className={flatInputClass}
                      />
                    </FieldBox>

                    <FieldBox label="Tipo actividad">
                      <Input
                        value={initialValues.actividad || ""}
                        onChange={(e) => setIV({ actividad: e.target.value })}
                        className={flatInputClass}
                      />
                    </FieldBox>

                    <FieldBox label="Horario">
                      <div className="flex items-center gap-3">
                        <Input
                          type="time"
                          className={`${flatInputClass} w-[120px]`}
                          value={initialValues.horaInicio || ""}
                          onChange={(e) => setIV({ horaInicio: e.target.value })}
                        />
                        <span className="text-gray-400">–</span>
                        <Input
                          type="time"
                          className={`${flatInputClass} w-[120px]`}
                          value={initialValues.horaFin || ""}
                          onChange={(e) => setIV({ horaFin: e.target.value })}
                        />
                      </div>
                    </FieldBox>

                    {(t === "vagoneta" || t === "cabezal" || t === "cisterna") && (
                      <FieldBox label="Diésel">
                        <Input
                          type="number"
                          step="0.01"
                          value={numberOrBlank(initialValues?.diesel ?? initialValues?.combustible)}
                          onChange={(e) => setIV({ diesel: e.target.value })}
                          className="h-9 w-28"
                        />
                      </FieldBox>
                    )}

                    <FieldBox label="Horas (Ord/Ext)">
                      <div className="flex items-center gap-2">
                        <Input
                          type="number"
                          step="0.01"
                          value={numberOrBlank(initialValues.horasOrd)}
                          onChange={(e) => setIV({ horasOrd: e.target.value })}
                          className={flatInputClass}
                        />
                        <span className="text-gray-400">/</span>
                        <Input
                          type="number"
                          step="0.01"
                          value={numberOrBlank(initialValues.horasExt)}
                          onChange={(e) => setIV({ horasExt: e.target.value })}
                          className={flatInputClass}
                        />
                      </div>
                    </FieldBox>

                    <FieldBox label="Fecha">
                      <Input value={initialValues.fecha || ""} disabled className={flatInputClass} />
                    </FieldBox>

                    {(t === "vagoneta" || t === "cabezal") && (<FieldBox label="Variante">{getVar(r) || "—"}</FieldBox>)}

                    {showStation && (
                      <FieldBox label="Estación (N+M)">
                        <Input
                          value={initialValues.estacion || ""}
                          onChange={(e) => setIV({ estacion: e.target.value })}
                          className={flatInputClass}
                          placeholder="Ej: 12+500"
                        />
                      </FieldBox>
                    )}

                    {!isMaterialVar && (
                      <>
                        <FieldBox label="Código Camino">
                          <Input
                            value={initialValues.codigoCamino || ""}
                            onChange={(e) => setIV({ codigoCamino: e.target.value.replace(/\D/g, "").slice(0, 3) })}
                            className={flatInputClass}
                            placeholder="3 dígitos"
                          />
                        </FieldBox>
                        <FieldBox label="Distrito">
                          <Input
                            value={initialValues.distrito || ""}
                            onChange={(e) => setIV({ distrito: e.target.value })}
                            className={flatInputClass}
                          />
                        </FieldBox>
                      </>
                    )}

                    {isCarretaVar && (
                      <FieldBox label="Placa carreta" className="md:col-span-2">
                        <Input
                          value={initialValues.placaCarreta || ""}
                          onChange={(e) => setIV({ placaCarreta: e.target.value })}
                          className={flatInputClass}
                          placeholder="Opcional"
                        />
                      </FieldBox>
                    )}

                    {isCisterna && (
                      <FieldBox label="Cisterna" className="md:col-span-2">
                        <div className="grid grid-cols-1 md:grid-cols-3 gap-2">
                          <Input
                            type="number"
                            step="0.01"
                            className="h-9"
                            placeholder="Cantidad agua (m³)"
                            value={numberOrBlank(initialValues?.detalles?.cantidadLiquido)}
                            onChange={(e) => setDet({ cantidadLiquido: e.target.value })}
                          />
                          <Input
                            className="h-9"
                            placeholder="Fuente (Ríos / Tajo / …)"
                            value={initialValues?.detalles?.fuente || ""}
                            onChange={(e) => setDet({ fuente: e.target.value })}
                          />
                          {(t === "cabezal" && v === "cisterna") && (
                            <Input
                              className="h-9"
                              placeholder="Placa cisterna"
                              value={
                                initialValues?.detalles?.placaCisterna ||
                                initialValues?.detalles?.cisternaPlaca || ""
                              }
                              onChange={(e) => setDet({ placaCisterna: e.target.value })}
                            />
                          )}
                        </div>
                      </FieldBox>
                    )}
                  </div>

                  {isMaterialVar && !isFlatbed8803(r) && (
                    <div className="border rounded-lg">
                      <div className="flex items-center justify-between px-3 py-2">
                        <div className="text-sm font-semibold">Detalles de Boleta</div>
                        <Button variant="secondary" onClick={addBoleta}>Agregar boleta</Button>
                      </div>

                      <div className="overflow-x-auto">
                        <table className="w-full text-sm">
                          <thead className="bg-gray-50">
                            <tr>
                              <th className="text-left px-3 py-2">#</th>
                              <th className="text-left px-3 py-2">Tipo material</th>
                              <th className="text-left px-3 py-2">Fuente</th>
                              <th className="text-left px-3 py-2">Sub-fuente</th>
                              <th className="text-left px-3 py-2">m³</th>
                              <th className="text-left px-3 py-2">Distrito</th>
                              <th className="text-left px-3 py-2">Código Camino</th>
                              <th className="text-left px-3 py-2">Boleta</th>
                              <th className="text-right px-3 py-2">Acciones</th>
                            </tr>
                          </thead>
                          <tbody>
                            {boletas.length === 0 && (
                              <tr>
                                <td className="px-3 py-4 text-gray-500" colSpan={9}>Sin boletas.</td>
                              </tr>
                            )}
                            {boletas.map((b, i) => (
                              <tr key={i} className="border-t">
                                <td className="px-3 py-2">{i + 1}</td>
                                <td className="px-3 py-2">
                                  <Input
                                    className={flatInputClass}
                                    value={b?.tipoMaterial || ""}
                                    onChange={(e) => updateBoleta(i, "tipoMaterial", e.target.value)}
                                  />
                                </td>
                                <td className="px-3 py-2">
                                  <Input
                                    className={flatInputClass}
                                    value={b?.fuente || ""}
                                    onChange={(e) => updateBoleta(i, "fuente", e.target.value)}
                                  />
                                </td>
                                <td className="px-3 py-2">
                                  <Input
                                    className={flatInputClass}
                                    value={b?.subFuente || ""}
                                    onChange={(e) => updateBoleta(i, "subFuente", e.target.value)}
                                  />
                                </td>
                                <td className="px-3 py-2">
                                  <Input
                                    type="number"
                                    step="0.01"
                                    className={flatInputClass}
                                    value={numberOrBlank(b?.m3 ?? b?.cantidad ?? b?.metros3 ?? b?.volumen)}
                                    onChange={(e) => updateBoleta(i, "m3", e.target.value)}
                                  />
                                </td>
                                <td className="px-3 py-2">
                                  <Input
                                    className={flatInputClass}
                                    value={b?.distrito || b?.District || ""}
                                    onChange={(e) => updateBoleta(i, "distrito", e.target.value)}
                                  />
                                </td>
                                <td className="px-3 py-2">
                                  <Input
                                    className={flatInputClass}
                                    value={b?.codigoCamino || b?.codigo || b?.codigo_camino || ""}
                                    onChange={(e) => updateBoleta(i, "codigoCamino", e.target.value)}
                                  />
                                </td>
                                <td className="px-3 py-2">
                                  <Input
                                    className={flatInputClass}
                                    value={b?.boleta || ""}
                                    onChange={(e) => updateBoleta(i, "boleta", e.target.value)}
                                  />
                                </td>
                                <td className="px-3 py-2 text-right">
                                  <Button variant="secondary" onClick={() => removeBoleta(i)}>Quitar</Button>
                                </td>
                              </tr>
                            ))}
                          </tbody>
                        </table>
                      </div>
                    </div>
                  )}

                  <div className="flex justify-end gap-2 pt-2">
                    <Button
                      variant="secondary"
                      onClick={() => { setEditOpen(false); setEditingId(null); setInitialValues(null); }}
                    >
                      Cancelar
                    </Button>
                    <Button
                      className="bg-blue-600 hover:bg-blue-700 text-white"
                      disabled={saving}
                      onClick={handleSaveEdit}
                    >
                      {saving ? "Guardando..." : "Guardar cambios"}
                    </Button>
                  </div>
                </div>
              )
            })()
          )}
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
                        {canRestoreReports(user) && (
                          <Button variant="secondary" onClick={() => handleRestoreWithSwal(r)}>
                            Restaurar
                          </Button>
                        )}
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
