"use client";

import React, { useMemo, useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Input } from "@/components/ui/input";
import * as XLSX from "xlsx";
import { Eye, Trash2 } from "lucide-react";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from "@/components/ui/dialog";

import machineryService from "@/services/machineryService";

/* ---------- variantes disponibles por tipo (para filtros) ---------- */
const VARIANT_OPTIONS_BY_TYPE = {
  vagoneta: ["material", "carreta", "cisterna"],
  cabezal: ["material", "carreta", "cisterna"],
};

/* ---------------- helpers genéricos ---------------- */
const fmtDate = (d) => {
  try {
    return d ? new Date(d).toLocaleDateString() : "—";
  } catch {
    return "—";
  }
};
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

/* ---------------- detectores de tipo/variante ---------------- */
const getType = (r) => {
  if (!r) return "";
  const t1 =
    r.tipoMaquinaria && typeof r.tipoMaquinaria === "string"
      ? r.tipoMaquinaria
      : pick(get(r, "maquinaria.tipo"), r.tipo, "");
  return String(t1 || "").toLowerCase();
};

const getVar = (r) => {
  if (!r) return "";
  const raw = pick(
    get(r, "variant"),
    get(r, "variante"),
    get(r, "detalles.variante"),
    get(r, "maquinaria.variant")
  );
  if (raw) return String(raw).toLowerCase();

  const hasCarreta =
    get(r, "placaCarreta") != null ||
    get(r, "detalles.placaCarreta") != null ||
    get(r, "tipoCarga") != null ||
    get(r, "detalles.tipoCarga") != null ||
    get(r, "destino") != null ||
    get(r, "detalles.destino") != null;
  if (hasCarreta) return "carreta";

  const hasCisterna =
    get(r, "cantidadLiquido") != null || get(r, "detalles.cantidadLiquido") != null;
  if (hasCisterna) return "cisterna";

  const hasBoletas =
    Array.isArray(get(r, "boletas")) || Array.isArray(get(r, "detalles.boletas"));
  const hasTotalM3 =
    get(r, "totalCantidadMaterial") != null ||
    get(r, "detalles.totalCantidadMaterial") != null;
  if (hasBoletas || hasTotalM3) return "material";

  const hasMaterial =
    get(r, "tipoMaterial") != null ||
    get(r, "detalles.tipoMaterial") != null ||
    get(r, "cantidadMaterial") != null ||
    get(r, "detalles.cantidadMaterial") != null ||
    get(r, "boleta") != null ||
    get(r, "detalles.boleta") != null;
  if (hasMaterial) return "material";

  return "";
};

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

// Texto de estación "desde+hasta" o "—"
const toEstacionTxt = (r) => {
  const d = r?.estacionDesde ?? r?.detalles?.estacionDesde;
  const h = r?.estacionHasta ?? r?.detalles?.estacionHasta;
  if (d != null || h != null) {
    const L = showNum(d);
    const R = showNum(h);
    if (L !== "—" || R !== "—") return `${L}+${R}`;
  }
  return "—";
};


// Tipos que NO usan estación
const KM_TYPES = ["vagoneta", "cabezal", "cisterna"];

// ¿Esta fila usa columna Estación?
const usesStation = (r) => !KM_TYPES.includes(getType(r));

// Formatea "estación" (desde+hasta)
const estacionText = (r) => {
  const d = r?.estacionDesde ?? get(r, "detalles.estacionDesde");
  const h = r?.estacionHasta ?? get(r, "detalles.estacionHasta");
  if (d != null || h != null) {
    const L = showNum(d);
    const R = showNum(h);
    if (L !== "—" || R !== "—") return `${L}+${R}`;
  }
  return "—";
};


// Construye una fila completa MUNICIPAL (por fila decide si es km o hr)
// Construye una fila completa MUNICIPAL (por fila decide si es km o hr)
// Construye una fila completa MUNICIPAL. Si withStation=false no mete la columna.
function buildMunicipalExportRow(r, withStation) {
  const t = getType(r);
  const isKm = KM_TYPES.includes(t);

  const operadorTxt = r?.operador
    ? `${r.operador?.name ?? ""} ${r.operador?.last ?? ""}${
        r.operador?.identification ? ` (${r.operador.identification})` : ""
      }`
    : r?.operadorId ?? "—";

  const maquinariaTxt = r?.maquinaria
    ? `${r.maquinaria?.tipo ?? ""}${
        r.maquinaria?.placa ? ` - ${r.maquinaria.placa}` : ""
      }`
    : r?.maquinariaId ?? "—";

  const horasTxt = `${showNum(pick(r?.horasOrd, r?.horas_or))} / ${showNum(
    pick(r?.horasExt, r?.horas_ext)
  )}`;

  const metricVal = isKm
    ? showNum(pick(r?.kilometraje, get(r, "detalles.kilometraje")))
    : showNum(pick(r?.horimetro, get(r, "detalles.horimetro")));

  const tipoActividad = showText(pick(r.tipoActividad, r.actividad));

  const hi = pick(r.horaInicio, get(r, "detalles.horaInicio"));
  const hf = pick(r.horaFin, get(r, "detalles.horaFin"));
  const horario = hi || hf ? `${showText(hi)} – ${showText(hf)}` : "—";

  const row = [
    "Municipal",
    r.id,
    operadorTxt,
    maquinariaTxt,
    metricVal,                                // Medidor (km u hr)
    showNum(pick(r?.diesel, r?.combustible)), // Diésel
    horasTxt,                                 // Horas (Ord/Ext)
  ];

  // Solo inserta la columna Estación si se decidió incluirla en el export
  if (withStation) row.push(usesStation(r) ? estacionText(r) : "—");

  row.push(
    tipoActividad,
    horario,
    showText(r?.distrito),
    showText(r?.codigoCamino),
    showNum(r?.viaticos),
    fmtDate(r?.fecha),
  );

  return row;
}


// ===== Exportación COMPLETA (todas las columnas importantes) =====

// Headers completos (independientes de lo que se ve en pantalla)
const EXPORT_HEADERS_MUNICIPAL = [
  "Tipo",          // Municipal
  "ID",
  "Operador",
  "Maquinaria",
  "Kilometraje",       // (Kilometraje u Horímetro según el tipo de esa fila)
  "Diésel",
  "Horas (Ord/Ext)",
  "Estación",
  "Tipo actividad",
  "Horario",
  "Distrito",
  "Código Camino",
  "Viáticos",
  "Fecha",
];

const EXPORT_HEADERS_RENTAL = [
  "Tipo",              // Alquiler
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


// Construye una fila completa ALQUILER
function buildRentalExportRow(r) {
  const operadorTxt = r?.operador
    ? `${r.operador?.name ?? ""} ${r.operador?.last ?? ""}${r.operador?.identification ? ` (${r.operador.identification})` : ""}`
    : r?.operadorId ?? "—";

  return [
    "Alquiler",
    r.id,
    operadorTxt,
    showText(r?.tipoMaquinaria),
    showText(r?.placa),
    showText(r?.actividad),
    showNum(r?.cantidad),
    showNum(r?.horas),
    showText(r?.estacion),
    showText(r?.boleta),
    showText(r?.fuente),
    fmtDate(r?.fecha),
  ];
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

  useEffect(() => {
    setRowsMunicipal(municipalReports);
  }, [municipalReports]);
  useEffect(() => {
    setRowsRental(rentalReports);
  }, [rentalReports]);

  /* eliminar */
  const [confirmDeleteId, setConfirmDeleteId] = useState(null);
  const [deleteReason, setDeleteReason] = useState("");
  const [deleteOpen, setDeleteOpen] = useState(false);

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

  const today = new Date().toISOString().slice(0, 10);
  const [startDate, setStartDate] = useState("");
  const [endDate, setEndDate] = useState("");
  const [codigoFilter, setCodigoFilter] = useState("");
  const [distritoFilter, setDistritoFilter] = useState("");

  const [typeFilter, setTypeFilter] = useState("");
  const [variantFilter, setVariantFilter] = useState("");
  const [actividadFilter, setActividadFilter] = useState("");

  const [page, setPage] = useState(1);

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
    const takeDate = (r) =>
      r?.fecha ? new Date(r.fecha).toISOString().slice(0, 10) : "";
    if (startDate) rows = rows.filter((r) => takeDate(r) && takeDate(r) >= startDate);
    if (endDate) rows = rows.filter((r) => takeDate(r) && takeDate(r) <= endDate);
    if (isMunicipal) {
      if (distritoFilter)
        rows = rows.filter((r) => (r?.distrito || "").trim() === distritoFilter);
      if (codigoFilter)
        rows = rows.filter(
          (r) => String(r?.codigoCamino ?? "").trim() === String(codigoFilter).trim()
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
    return Array.from(set).sort((a, b) => a.localeCompare(b));
  }, [rowsScope]);

  useEffect(() => {
    if (typeFilter && !tiposDisponibles.includes(typeFilter)) {
      setTypeFilter("");
      setVariantFilter("");
      setPage(1);
    }
  }, [tiposDisponibles, typeFilter]);

  const variantesDisponibles = useMemo(() => {
    if (!isMunicipal) return [];
    const t = (typeFilter || "").toLowerCase();
    return VARIANT_OPTIONS_BY_TYPE[t] ?? [];
  }, [typeFilter, isMunicipal]);

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
      if (isMunicipal && VARIANT_OPTIONS_BY_TYPE[t] && variantFilter)
        rows = rows.filter((r) => getVar(r) === variantFilter);
    }
    if (isRental && actividadFilter)
      rows = rows.filter((r) => r?.actividad === actividadFilter);
    return rows;
  }, [rowsScope, typeFilter, variantFilter, actividadFilter, isMunicipal, isRental]);

  /* columnas compactas */
  const COLUMNS_MUNICIPAL = [
    "ID",
    "Operador",
    "Maquinaria",
    "Variante",
    "Distrito",
    "Código Camino",
    "Fecha",
  ];
  const COLUMNS_RENTAL = [
    "ID",
    "Operador",
    "Tipo Maquinaria",
    "Placa",
    "Actividad",
    "Fecha",
  ];
  const columns = isMunicipal ? COLUMNS_MUNICIPAL : COLUMNS_RENTAL;

  /* celdas según columna */
  function cellValueMunicipal(r, col) {
    switch (col) {
      case "ID":
        return r.id;
      case "Operador":
        return r?.operador
          ? `${r.operador?.name ?? ""} ${r.operador?.last ?? ""}${
              r.operador?.identification ? ` (${r.operador.identification})` : ""
            }`
          : r?.operadorId ?? "—";
      case "Maquinaria":
        if (r?.maquinaria) {
          const tipo = r.maquinaria?.tipo ?? "";
          const placa = r.maquinaria?.placa ? ` - ${r.maquinaria.placa}` : "";
          return `${tipo}${placa}`;
        }
        return r?.maquinariaId ?? "—";
      case "Variante":
        return getVar(r) || "—";
      case "Distrito":
        return showText(r?.distrito);
      case "Código Camino":
        return showText(r?.codigoCamino);
      case "Fecha":
        return fmtDate(r?.fecha);
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
          ? `${r.operador?.name ?? ""} ${r.operador?.last ?? ""}${
              r.operador?.identification ? ` (${r.operador.identification})` : ""
            }`
          : r?.operadorId ?? "—";
      case "Tipo Maquinaria":
        return showText(r?.tipoMaquinaria);
      case "Placa":
        return showText(r?.placa);
      case "Actividad":
        return showText(r?.actividad);
      case "Fecha":
        return fmtDate(r?.fecha);
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

  /* -------- export -------- */
  const exportPDF = () => {
    const win = window.open("", "_blank");
    const head = `<style>body{font-family:system-ui,-apple-system,"Segoe UI",Roboto,"Helvetica Neue",Arial;padding:16px}table{width:100%;border-collapse:collapse;font-size:12px}thead th{text-align:left;background:#f6f7f9;padding:8px;border-bottom:1px solid #e5e7eb}tbody td{padding:8px;border-bottom:1px solid #f1f5f9}h1{font-size:18px;margin-bottom:12px}</style>`;
    const headers = ["Tipo", ...columns, "Acciones"];
    const rowsHtml = filtered
      .map((r) => {
        const cells = columns
          .map((c) =>
            isMunicipal ? cellValueMunicipal(r, c) : cellValueRental(r, c)
          )
          .map((v) => `<td>${v}</td>`)
          .join("");
        return `<tr><td>${isMunicipal ? "Municipal" : "Alquiler"}</td>${cells}<td></td></tr>`;
      })
      .join("");
    const thead = headers.map((h) => `<th>${h}</th>`).join("");
    win.document.write(
      `<html><head><title>Reportes</title>${head}</head><body><h1>Reportes</h1><table><thead><tr>${thead}</tr></thead><tbody>${rowsHtml}</tbody></table></body></html>`
    );
    win.document.close();
    win.focus();
    win.print();
  };

  /* ---------------- render ---------------- */
  return (
    <div className="space-y-4">
      {/* Pestañas */}
      <div className="flex border-b border-gray-200">
        <button
          onClick={() => {
            setActiveReportTab("municipal");
            setTypeFilter("");
            setVariantFilter("");
            setActividadFilter("");
            setPage(1);
          }}
          className={`px-6 py-3 text-sm font-medium border-b-2 transition-colors ${
            isMunicipal
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
          className={`px-6 py-3 text-sm font-medium border-b-2 transition-colors ${
            isRental
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

      {/* Ámbito / filtros rápidos */}
      <div className="flex flex-wrap items-center gap-3">
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
        <span className="text-gray-400">→</span>
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
            setTypeFilter("");
            setVariantFilter("");
            setActividadFilter("");
            setPage(1);
          }}
        >
          Limpiar
        </Button>

        <div className="ml-auto flex gap-2">
          {/* Exportar a Excel (TODO completo, no solo visibles) */}
<Button
  className="bg-green-500 hover:bg-green-600 text-white"
  onClick={() => {
    // ¿Hay alguna fila que use Estación?
    const withStation = filtered.some(usesStation);

    const headersBase = [
      "Tipo","ID","Operador","Maquinaria","Medidor","Diésel","Horas (Ord/Ext)"
    ];
    const headersTail = [
      "Tipo actividad","Horario","Distrito","Código Camino","Viáticos","Fecha"
    ];
    const headers = withStation
      ? [...headersBase, "Estación", ...headersTail]
      : [...headersBase, ...headersTail];

    const rows = filtered.map((r) => buildMunicipalExportRow(r, withStation));

    const ws = XLSX.utils.aoa_to_sheet([headers, ...rows]);
    const wb = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(wb, ws, "Reportes");
    XLSX.writeFile(
      wb,
      `reportes_${isMunicipal ? "municipales" : "alquiler"}_${new Date()
        .toISOString()
        .slice(0, 10)}.xlsx`
    );
  }}
>
  Exportar a Excel
</Button>


{/* Exportar a PDF (TODO completo, no solo visibles) */}
<Button
  className="bg-red-500 hover:bg-red-600 text-white"
  onClick={() => {
    const withStation = filtered.some(usesStation);

    const headersBase = [
      "Tipo","ID","Operador","Maquinaria","Medidor","Diésel","Horas (Ord/Ext)"
    ];
    const headersTail = [
      "Tipo actividad","Horario","Distrito","Código Camino","Viáticos","Fecha"
    ];
    const headers = withStation
      ? [...headersBase, "Estación", ...headersTail]
      : [...headersBase, ...headersTail];

    const rows = filtered.map((r) => buildMunicipalExportRow(r, withStation));

    const win = window.open("", "_blank");
    const head = `
      <style>
        body{font-family:system-ui,-apple-system,"Segoe UI",Roboto,"Helvetica Neue",Arial;padding:16px}
        table{width:100%;border-collapse:collapse;font-size:12px}
        thead th{text-align:left;background:#f6f7f9;padding:8px;border-bottom:1px solid #e5e7eb}
        tbody td{padding:8px;border-bottom:1px solid #f1f5f9}
        h1{font-size:18px;margin-bottom:12px}
      </style>
    `;
    const thead = `<tr>${headers.map(h => `<th>${h}</th>`).join("")}</tr>`;
    const tbody = rows
      .map(row => `<tr>${row.map(v => `<td>${v ?? ""}</td>`).join("")}</tr>`)
      .join("");

    win.document.write(`
      <html>
        <head><title>Reportes</title>${head}</head>
        <body>
          <h1>Reportes</h1>
          <table>
            <thead>${thead}</thead>
            <tbody>${tbody}</tbody>
          </table>
        </body>
      </html>
    `);
    win.document.close();
    win.focus();
    win.print();
  }}
>
  Exportar a PDF
</Button>


          <Button variant="secondary" onClick={openDeleted}>
            Ver reportes eliminados
          </Button>
        </div>
      </div>

      {/* Selectores adicionales */}
      <div className="flex flex-wrap items-center gap-3">
        <div className="w-64">
          <Select
            value={typeFilter}
            onValueChange={(v) => {
              setTypeFilter(v);
              setVariantFilter("");
              setActividadFilter("");
              setPage(1);
            }}
            disabled={tiposDisponibles.length === 0}
          >
            <SelectTrigger>
              <SelectValue
                placeholder={
                  tiposDisponibles.length ? "Seleccionar tipo" : "No hay tipos en el ámbito"
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
          (VARIANT_OPTIONS_BY_TYPE[(typeFilter || "").toLowerCase()] || []).length >
            0 && (
            <div className="w-52">
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
                  {(VARIANT_OPTIONS_BY_TYPE[(typeFilter || "").toLowerCase()] || []).map(
                    (v) => (
                      <SelectItem key={v} value={v}>
                        {v}
                      </SelectItem>
                    )
                  )}
                </SelectContent>
              </Select>
            </div>
          )}

        {isRental && (
          <div className="w-64">
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

        <span className="text-sm text-gray-600">
          {filtered.length} resultado{filtered.length === 1 ? "" : "s"}
        </span>
      </div>

      {/* Tabla */}
      <div className="rounded-2xl border bg-white overflow-hidden">
        <table className="w-full table-fixed text-sm">
          {/* anchos fijos */}
          <colgroup>
            <col className="w-28" /> {/* badge Tipo */}
            {isMunicipal ? (
              <>
                <col className="w-16" /> {/* ID */}
                <col className="w-64" /> {/* Operador */}
                <col className="w-56" /> {/* Maquinaria */}
                <col className="w-24" /> {/* Variante */}
                <col className="w-40" /> {/* Distrito */}
                <col className="w-32" /> {/* Código Camino */}
                <col className="w-28" /> {/* Fecha */}
              </>
            ) : (
              <>
                <col className="w-16" /> {/* ID */}
                <col className="w-64" /> {/* Operador */}
                <col className="w-40" /> {/* Tipo Maquinaria */}
                <col className="w-40" /> {/* Placa */}
                <col className="w-40" /> {/* Actividad */}
                <col className="w-28" /> {/* Fecha */}
              </>
            )}
            <col className="w-28" /> {/* Acciones */}
          </colgroup>

          <thead className="bg-gray-50 text-gray-700">
            <tr>
              <th className="px-4 py-3 text-left font-medium">Tipo</th>
              {columns.map((c) => (
                <th key={c} className="px-4 py-3 text-left font-medium">
                  {c}
                </th>
              ))}
              <th className="px-4 py-3 text-right font-medium">Acciones</th>
            </tr>
          </thead>

          <tbody>
            {pageRows.map((r) => (
              <tr key={r.id} className="border-t hover:bg-gray-50">
                {/* badge */}
                <td className="px-4 py-3">
                  <span
                    className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${
                      isMunicipal
                        ? "bg-blue-100 text-blue-800"
                        : "bg-green-100 text-green-800"
                    }`}
                  >
                    {isMunicipal ? "🏛️ Municipal" : "🚛 Alquiler"}
                  </span>
                </td>

                {/* celdas compactas */}
                {columns.map((c) => (
                  <td
                    key={c}
                    className="px-4 py-3 whitespace-nowrap overflow-hidden text-ellipsis"
                    title={
                      isMunicipal
                        ? String(cellValueMunicipal(r, c))
                        : String(cellValueRental(r, c))
                    }
                  >
                    {isMunicipal ? cellValueMunicipal(r, c) : cellValueRental(r, c)}
                  </td>
                ))}

                {/* acciones */}
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

      {/* Modal VER (tu bloque completo, sin cambios funcionales) */}
      {/* ... ⬇️ tu modal tal como lo tenías, incluido el render condicional de Subfuente/Boleta ... */}
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

          {selectedRow && (() => {
  const r = selectedRow;
  const t = getType(r);               // "vagoneta", "cabezal", "niveladora", etc.
  const v = getVar(r);
  const d = r.detalles || {};
  const kmType = ["vagoneta","cabezal","cisterna"].includes(t);

  // ✨ Reglas por tipo
  const typesWithBoletas   = ["vagoneta","cabezal"];
  const typesWithEstacion  = ["niveladora"];            // agrega aquí otros que usen estación
  const typesWithVariante  = ["vagoneta","cabezal","cisterna"]; // niveladora NO lleva variante

  const showBoletas  = typesWithBoletas.includes(t);
  const showEstacion = typesWithEstacion.includes(t);
  const showVariante = typesWithVariante.includes(t);

  const KV = ({label, value}) => (
    <div className="bg-white border rounded-lg p-3">
      <div className="text-xs text-gray-500">{label}</div>
      <div className="font-medium break-words">{(value ?? value === 0) ? value : "—"}</div>
    </div>
  );

  // ✨ Campos base (solo se agregan los que aplican)
  const base = [
    { label: "Operador", value: r?.operador
        ? `${r.operador?.name ?? ""} ${r.operador?.last ?? ""}${r.operador?.identification ? ` (${r.operador.identification})` : ""}`
        : r?.operadorId },

    { label: "Maquinaria", value: r?.maquinaria
        ? `${r.maquinaria?.tipo ?? ""}${r.maquinaria?.placa ? ` - ${r.maquinaria.placa}` : ""}`
        : r?.maquinariaId },

    { label: kmType ? "Kilometraje" : "Horímetro",
      value: kmType
        ? (r?.kilometraje ?? d?.kilometraje)
        : (r?.horimetro ?? d?.horimetro) },

    { label: "Tipo actividad", value: r?.tipoActividad ?? r?.actividad },

    { label: "Horario", value: (() => {
        const ini = r?.horaInicio ?? d?.horaInicio;
        const fin = r?.horaFin   ?? d?.horaFin;
        return (ini || fin) ? `${ini ?? "—"} – ${fin ?? "—"}` : null;
      })()
    },

    { label: "Diésel", value: r?.diesel ?? r?.combustible },

    { label: "Horas (Ord/Ext)", value:
        (r?.horasOrd ?? r?.horas_or ?? null) !== null ||
        (r?.horasExt ?? r?.horas_ext ?? null) !== null
          ? `${r?.horasOrd ?? r?.horas_or ?? "—"} / ${r?.horasExt ?? r?.horas_ext ?? "—"}`
          : null },

    { label: "Distrito", value: r?.distrito },
    { label: "Código Camino", value: r?.codigoCamino },
    { label: "Viáticos", value: r?.viaticos },
    { label: "Fecha", value: fmtDate(r?.fecha) },
  ];

  // Variante SOLO si aplica
  if (showVariante) base.push({ label: "Variante", value: v || null });

  // Estación SOLO si aplica (niveladora, etc.)
  if (showEstacion) base.push({ label: "Estación", value: toEstacionTxt(r) });

  // Placa extra si la necesitas como campo aparte (opcional)
  // base.push({ label: "Placa", value: r?.maquinaria?.placa ?? r?.placa ?? d?.placa ?? null });

  // --- Render ---
  const boletas = getBoletasArr(r);
  const totalM3 = getTotalM3(r);
  const isRioOTajo = (f) => f === "Ríos" || f === "Tajo";
  const showSubfuenteCol = boletas.some((b) => isRioOTajo(b?.fuente));
  const showBoletaCol    = boletas.some((b) => !isRioOTajo(b?.fuente));

  return (
    <div className="space-y-4">
      {/* Grid de campos */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
        {base.map((k, i) => <KV key={`b-${i}`} {...k} />)}
      </div>

      {/* Detalle de boleta SOLO si aplica (vagoneta/cabezal) */}
      {showBoletas && (
        <div className="border rounded-lg p-3">
          <div className="text-sm font-semibold mb-2">Detalles de Boleta</div>

          <div className="mb-3">
            <div className="bg-white border rounded-lg p-3">
              <div className="text-xs text-gray-500">Total m<sup>3</sup> del día</div>
              <div className="font-medium">{showNum(totalM3)}</div>
            </div>
          </div>

          {Array.isArray(boletas) && boletas.length > 0 ? (
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead className="bg-gray-50">
                  <tr>
                    <th className="text-left px-3 py-2">#</th>
                    <th className="text-left px-3 py-2">Tipo material</th>
                    <th className="text-left px-3 py-2">Fuente</th>
                    {showSubfuenteCol && <th className="text-left px-3 py-2">Subfuente</th>}
                    {showBoletaCol    && <th className="text-left px-3 py-2">Boleta</th>}
                  </tr>
                </thead>
                <tbody>
                  {boletas.map((b, i) => {
                    const rioOTajo = isRioOTajo(b?.fuente);
                    return (
                      <tr key={i} className="border-t">
                        <td className="px-3 py-2">{i + 1}</td>
                        <td className="px-3 py-2">{showText(b?.tipoMaterial)}</td>
                        <td className="px-3 py-2">{showText(b?.fuente)}</td>
                        {showSubfuenteCol && (
                          <td className="px-3 py-2">{rioOTajo ? showText(b?.subFuente) : "—"}</td>
                        )}
                        {showBoletaCol && (
                          <td className="px-3 py-2">{rioOTajo ? "—" : showText(b?.boleta)}</td>
                        )}
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          ) : (
            <div className="text-sm text-gray-500">Sin boletas registradas.</div>
          )}
        </div>
      )}
    </div>
  );
})()}

        </DialogContent>
      </Dialog>

      {/* Diálogo ELIMINAR */}
      <Dialog
        open={deleteOpen}
        onOpenChange={(v) => {
          setDeleteOpen(v);
          if (!v) {
            setConfirmDeleteId(null);
            setDeleteReason("");
          }
        }}
      >
        <DialogContent className="max-w-lg">
          <DialogHeader>
            <DialogTitle>Eliminar reporte #{confirmDeleteId}</DialogTitle>
            <DialogDescription>
              Indica la justificación de la eliminación. Esta quedará registrada.
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-2">
            <label className="text-sm">Motivo</label>
            <textarea
              className="w-full border rounded-md p-2 min-h-[100px]"
              value={deleteReason}
              onChange={(e) => setDeleteReason(e.target.value)}
              placeholder="Ej.: Boleta duplicada / error de digitación / etc."
            />
          </div>
          <div className="flex justify-end gap-2 mt-4">
            <Button variant="secondary" onClick={() => setDeleteOpen(false)}>
              Cancelar
            </Button>
            <Button
              variant="destructive"
              disabled={!deleteReason.trim()}
              onClick={async () => {
                await confirmDelete();
                setDeleteOpen(false);
              }}
            >
              Eliminar
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
                      <td className="px-3 py-2">{r.deletedBy?.name ?? r.deletedById ?? "—"}</td>
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
                                setRowsMunicipal((prev) =>
                                  [restored, ...prev.filter((x) => x.id !== restored.id)]
                                );
                              } else {
                                restored = await machineryService.restoreRentalReport(r.id);
                                setRowsRental((prev) =>
                                  [restored, ...prev.filter((x) => x.id !== restored.id)]
                                );
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
