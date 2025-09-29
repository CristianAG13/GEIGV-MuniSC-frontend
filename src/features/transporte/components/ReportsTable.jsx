"use client";

import React, { useMemo, useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import {
  Select, SelectContent, SelectItem, SelectTrigger, SelectValue,
} from "@/components/ui/select";
import { Input } from "@/components/ui/input";
import * as XLSX from "xlsx";
import { Eye, Pencil, Trash2 } from "lucide-react";
import {
  Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription,
} from "@/components/ui/dialog";

/* ====================== helpers ====================== */
const fmtDate = (d) => {
  try { return d ? new Date(d).toLocaleDateString() : "—"; } catch { return "—"; }
};
const showText = (v) => (v === null || v === undefined || (typeof v === "string" && v.trim() === "") ? "—" : String(v));
const showNum = (v) => {
  if (v === 0) return 0;
  const n = typeof v === "string" ? Number(v) : v;
  return Number.isFinite(n) ? n : "—";
};
const get = (obj, path) => path.split(".").reduce((acc, k) => (acc && acc[k] !== undefined ? acc[k] : undefined), obj);
const pick = (...vals) => vals.find((v) => v !== undefined && v !== null);

/* ====================== helpers específicos por tipo de reporte ====================== */
const getMunicipalRowData = (r, showEstacion, isKmType) => {
  const operadorTxt = r?.operador
    ? `${r.operador?.name ?? ""} ${r.operador?.last ?? ""}${r.operador?.identification ? ` (${r.operador.identification})` : ""}`
    : r?.operadorId ?? "—";
  const maquinariaTxt = r?.maquinaria
    ? `${r.maquinaria?.tipo ?? ""}${r.maquinaria?.placa ? ` - ${r.maquinaria.placa}` : ""}`
    : r?.maquinariaId ?? "—";
  const horas = `${showNum(pick(r?.horasOrd, r?.horas_or))} / ${showNum(pick(r?.horasExt, r?.horas_ext))}`;
  const metricValue = isKmType
    ? showNum(pick(r?.kilometraje, get(r, "detalles.kilometraje")))
    : showNum(pick(r?.horimetro, get(r, "detalles.horimetro")));
  const estacionTxt = toEstacionTxt(r);
  const tipoActividad = showText(pick(r.tipoActividad, r.actividad));
  const hi = pick(r.horaInicio, get(r, "detalles.horaInicio"));
  const hf = pick(r.horaFin, get(r, "detalles.horaFin"));
  const horario = (hi || hf) ? `${showText(hi)} – ${showText(hf)}` : "—";

  return [
    r.id,
    operadorTxt,
    maquinariaTxt,
    metricValue,
    showNum(pick(r?.diesel, r?.combustible)),
    horas,
    ...(showEstacion ? [estacionTxt] : []),
    tipoActividad,
    horario,
    showText(r?.distrito),
    showText(r?.codigoCamino),
    showNum(r?.viaticos),
    fmtDate(r?.fecha)
  ];
};

const getRentalRowData = (r) => {
  const operadorTxt = r?.operador
    ? `${r.operador?.name ?? ""} ${r.operador?.last ?? ""}${r.operador?.identification ? ` (${r.operador.identification})` : ""}`
    : r?.operadorId ?? "—";

  return [
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
    fmtDate(r?.fecha)
  ];
};

/* variantes permitidas por tipo */
const VARIANT_OPTIONS_BY_TYPE = {
  vagoneta: ["material", "carreta", "cisterna"],
  cabezal: ["material", "carreta", "cisterna"],
};

const toEstacionTxt = (r) => {
  if (r?.estacion) return String(r.estacion);
  const estDesde = r?.estacionDesde ?? r?.detalles?.estacionDesde;
  const estHasta = r?.estacionHasta ?? r?.detalles?.estacionHasta;
  if (estDesde != null || estHasta != null) {
    const left = showNum(estDesde);
    const right = showNum(estHasta);
    if (left !== "—" || right !== "—") return `${left}+${right}`;
  }
  return "—";
};

// inferir tipo/variante - adaptado para ambos tipos de reportes
const getType = (r) => {
  // Para reportes de alquiler, el tipo está directamente en tipoMaquinaria
  if (r?.tipoMaquinaria && typeof r.tipoMaquinaria === 'string') {
    return r.tipoMaquinaria.toLowerCase();
  }
  // Para reportes municipales, buscar en maquinaria.tipo
  return String(pick(get(r, "maquinaria.tipo"), r.tipo) || "").toLowerCase();
};
const getVar = (r) => {
  const raw = pick(get(r, "variant"), get(r, "variante"), get(r, "detalles.variante"), get(r, "maquinaria.variant"));
  if (raw) return String(raw).toLowerCase();

  const hasCarreta =
    get(r, "placaCarreta") != null || get(r, "detalles.placaCarreta") != null ||
    get(r, "tipoCarga") != null     || get(r, "detalles.tipoCarga") != null     ||
    get(r, "destino") != null       || get(r, "detalles.destino") != null;
  if (hasCarreta) return "carreta";

  const hasCisterna = get(r, "cantidadLiquido") != null || get(r, "detalles.cantidadLiquido") != null;
  if (hasCisterna) return "cisterna";

  const hasMaterial =
    get(r, "tipoMaterial") != null || get(r, "detalles.tipoMaterial") != null ||
    get(r, "cantidadMaterial") != null || get(r, "detalles.cantidadMaterial") != null ||
    get(r, "boleta") != null || get(r, "detalles.boleta") != null;
  if (hasMaterial) return "material";

  return "";
};

/* ================ mini componente para el modal ================ */
function Field({ label, value }) {
  return (
    <div className="bg-white border rounded-lg p-3">
      <div className="text-xs text-gray-500">{label}</div>
      <div className="font-medium break-words">{value ?? "—"}</div>
    </div>
  );
}

/* ====================== componente ====================== */
export default function ReportsTable({
  municipalReports = [],         // reportes municipales
  rentalReports = [],           // reportes de alquiler
  districts: districtsProp,      // opcional
  onEdit,                        // opcional
  onDelete,                      // opcional
}) {
  /* --------- pestañas para tipos de reportes --------- */
  const [activeReportTab, setActiveReportTab] = useState("municipal");

  /* --------- filtros de ÁMBITO --------- */
  const today = new Date().toISOString().slice(0, 10); // YYYY-MM-DD
  const [startDate, setStartDate] = useState(""); // YYYY-MM-DD
  const [endDate, setEndDate] = useState("");
  const [codigoFilter, setCodigoFilter] = useState("");
  const [distritoFilter, setDistritoFilter] = useState("");

  /* --------- filtros de selección --------- */
  const [typeFilter, setTypeFilter] = useState("");
  const [variantFilter, setVariantFilter] = useState("");
  
  /* --------- filtros específicos para alquiler --------- */
  const [actividadFilter, setActividadFilter] = useState("");

  /* --------- paginación --------- */
  const [page, setPage] = useState(1);
  const PAGE_SIZE = 10;

  /* --------- variables derivadas del tipo de reporte --------- */
  const isMunicipal = activeReportTab === "municipal";
  const isRental = activeReportTab === "alquiler";

  /* --------- reportes activos según la pestaña --------- */
  const activeReports = useMemo(() => {
    return activeReportTab === "municipal" ? municipalReports : rentalReports;
  }, [activeReportTab, municipalReports, rentalReports]);

  /* --------- distritos --------- */
  const districts = useMemo(() => {
    if (Array.isArray(districtsProp) && districtsProp.length) return districtsProp;
    const set = new Set();
    const allReports = [...municipalReports, ...rentalReports];
    allReports.forEach((r) => {
      const d = (r?.distrito || "").trim();
      if (d) set.add(d);
    });
    return Array.from(set).sort((a, b) => a.localeCompare(b));
  }, [municipalReports, rentalReports, districtsProp]);

  /* --------- ÁMBITO: fecha + campos específicos por tipo --------- */
  const rowsScope = useMemo(() => {
    let rows = Array.isArray(activeReports) ? [...activeReports] : [];
    const takeDate = (r) => (r?.fecha ? new Date(r.fecha).toISOString().slice(0, 10) : "");

    // Filtros de fecha (aplican a ambos tipos)
    if (startDate) rows = rows.filter((r) => { const d = takeDate(r); return d && d >= startDate; });
    if (endDate)   rows = rows.filter((r) => { const d = takeDate(r); return d && d <= endDate; });

    // Filtros específicos solo para reportes municipales
    if (isMunicipal) {
      if (distritoFilter) rows = rows.filter((r) => (r?.distrito || "").trim() === distritoFilter);
      if (codigoFilter)   rows = rows.filter((r) => String(r?.codigoCamino ?? "").trim() === String(codigoFilter).trim());
    }

    return rows;
  }, [activeReports, startDate, endDate, distritoFilter, codigoFilter, isMunicipal]);

  /* --------- Tipos disponibles dentro del ámbito --------- */
  const tiposDisponibles = useMemo(() => {
    const set = new Set();
    rowsScope.forEach((r) => {
      const t = getType(r);
      if (t) set.add(t);
    });
    return Array.from(set).sort((a, b) => a.localeCompare(b));
  }, [rowsScope]);

  /* --------- reset selecciones si el ámbito las invalida --------- */
  useEffect(() => {
    if (typeFilter && !tiposDisponibles.includes(typeFilter)) {
      setTypeFilter("");
      setVariantFilter("");
      setPage(1);
    }
  }, [tiposDisponibles, typeFilter]);

  /* --------- variantes disponibles según tipo elegido (solo municipales) --------- */
  const variantesDisponibles = useMemo(() => {
    if (!isMunicipal) return [];
    const t = (typeFilter || "").toLowerCase();
    return VARIANT_OPTIONS_BY_TYPE[t] ?? [];
  }, [typeFilter, isMunicipal]);

  /* --------- actividades disponibles para reportes de alquiler --------- */
  const actividadesDisponibles = useMemo(() => {
    if (isMunicipal) return [];
    const set = new Set();
    rowsScope.forEach((r) => {
      if (r?.actividad && typeof r.actividad === 'string') {
        set.add(r.actividad);
      }
    });
    return Array.from(set).sort((a, b) => a.localeCompare(b));
  }, [rowsScope, isMunicipal]);

  /* --------- filas visibles = ÁMBITO + filtros específicos por tipo --------- */
  const filtered = useMemo(() => {
    let rows = rowsScope;
    
    if (typeFilter) {
      const t = typeFilter.toLowerCase();
      rows = rows.filter((r) => getType(r) === t);
      
      // Solo aplicar filtro de variantes para reportes municipales
      if (isMunicipal && VARIANT_OPTIONS_BY_TYPE[t] && variantFilter) {
        rows = rows.filter((r) => getVar(r) === variantFilter);
      }
    }

    // Filtro de actividad solo para reportes de alquiler
    if (isRental && actividadFilter) {
      rows = rows.filter((r) => r?.actividad === actividadFilter);
    }

    return rows;
  }, [rowsScope, typeFilter, variantFilter, actividadFilter, isMunicipal, isRental]);

  /* --------- columnas dinámicas por tipo de reporte --------- */
  // Para reportes municipales: lógica original
  const tLower = (typeFilter || "").toLowerCase();
  const isKmType = ["vagoneta", "cabezal", "cisterna"].includes(tLower);
  const showEstacion = isMunicipal && !isKmType;
  const metricHeader = isMunicipal 
    ? (isKmType ? "Kilometraje" : "Horímetro")
    : null; // Los reportes de alquiler no tienen métrica específica

  const isMaterial = variantFilter === "material" && (VARIANT_OPTIONS_BY_TYPE[tLower] || []).length > 0;
  const isCarreta  = variantFilter === "carreta"  && (VARIANT_OPTIONS_BY_TYPE[tLower] || []).length > 0;
  const isCisterna = variantFilter === "cisterna" && (VARIANT_OPTIONS_BY_TYPE[tLower] || []).length > 0;

  // Determinar qué columnas mostrar según el tipo de reporte
  const getColumns = () => {
    const baseColumns = ["Tipo", "ID", "Operador"];
    
    if (isMunicipal) {
      return [
        ...baseColumns,
        "Maquinaria",
        metricHeader,
        "Diésel",
        "Horas (Ord/Ext)",
        ...(showEstacion ? ["Estación"] : []),
        "Tipo actividad",
        "Horario",
        "Distrito",
        "Código Camino",
        "Viáticos",
        "Fecha"
      ];
    } else {
      // Reportes de alquiler: estructura más simple
      return [
        ...baseColumns,
        "Tipo Maquinaria",
        "Placa",
        "Actividad",
        "Cantidad",
        "Horas",
        "Estación",
        "Boleta",
        "Fuente",
        "Fecha"
      ];
    }
  };

  const columns = getColumns();

  /* --------- paginado --------- */
  const totalPages = Math.max(1, Math.ceil(filtered.length / 10));
  useEffect(() => { if (page > totalPages) setPage(1); }, [totalPages, page]);
  const pageRows = useMemo(() => filtered.slice((page - 1) * 10, (page - 1) * 10 + 10), [filtered, page]);

  /* --------- modal "ver" y acciones --------- */
  const [detailsOpen, setDetailsOpen] = useState(false);
  const [selectedRow, setSelectedRow] = useState(null);

  const openView = (row) => { setSelectedRow(row); setDetailsOpen(true); };
  const handleEditClick = (row) => alert(`Editar ID ${row?.id}`);
  const handleDeleteClick = (row) => {
  const ok = window.confirm(`¿Eliminar reporte #${row?.id}?`);
  if (ok) alert(`Eliminado ID ${row?.id}`);
};


  /* --------- export PDF (tal como lo tenías) --------- */
  const exportPDF = () => {
    const win = window.open("", "_blank");
    const head = `
      <style>
        body { font-family: system-ui,-apple-system,"Segoe UI",Roboto,"Helvetica Neue",Arial; padding:16px;}
        table { width:100%; border-collapse:collapse; font-size:12px; }
        thead th { text-align:left; background:#f6f7f9; padding:8px; border-bottom:1px solid #e5e7eb;}
        tbody td { padding:8px; border-bottom:1px solid #f1f5f9;}
        h1 { font-size:18px; margin-bottom:12px; }
      </style>`;
    const rowsHtml = filtered.map((r) => {
      const tipoReporte = activeReportTab === "municipal" ? "Municipal" : "Alquiler";
      const rowData = isMunicipal 
        ? getMunicipalRowData(r, showEstacion, isKmType)
        : getRentalRowData(r);
      
      const cellsHtml = rowData.map(value => `<td>${value}</td>`).join("");
      
      return `<tr>
        <td>${tipoReporte}</td>
        ${cellsHtml}
      </tr>`;
    }).join("");

    const baseThead = columns.map(col => `<th>${col}</th>`).join("");

    win.document.write(`
      <html><head><title>Reportes</title>${head}</head>
      <body>
        <h1>Reportes</h1>
        <table>
          <thead><tr>${baseThead}</tr></thead>
          <tbody>${rowsHtml}</tbody>
        </table>
      </body></html>
    `);
    win.document.close(); win.focus(); win.print();
  };

  /* ====================== RENDER ====================== */
  return (
    <div className="space-y-4">
      {/* Pestañas para tipos de reportes */}
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
            activeReportTab === "municipal"
              ? "border-blue-500 text-blue-600 bg-blue-50"
              : "border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300"
          }`}
        >
          <span className="flex items-center gap-2">
            🏛️ Reportes Municipales
            <span className="bg-blue-100 text-blue-800 text-xs px-2 py-1 rounded-full">
              {municipalReports.length}
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
            activeReportTab === "alquiler"
              ? "border-green-500 text-green-600 bg-green-50"
              : "border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300"
          }`}
        >
          <span className="flex items-center gap-2">
            🚛 Reportes de Alquiler
            <span className="bg-green-100 text-green-800 text-xs px-2 py-1 rounded-full">
              {rentalReports.length}
            </span>
          </span>
        </button>
      </div>

      {/* Fila 1: ÁMBITO */}
      <div className="flex flex-wrap items-center gap-3">
        {/* Fecha inicio */}
        <div className="w-40">
          <Input
            type="date"
            value={startDate}
            max={today}
            onChange={(e) => {
              const v = e.target.value;
              setStartDate(v);
              if (endDate && v && endDate < v) setEndDate(v); // forzar coherencia
              setPage(1);
            }}
          />
        </div>
        <span className="text-gray-400">→</span>
        {/* Fecha fin */}
        <div className="w-40">
          <Input
            type="date"
            value={endDate}
            min={startDate || undefined}
            max={today}
            onChange={(e) => { setEndDate(e.target.value); setPage(1); }}
          />
        </div>

        {/* Código camino - Solo para reportes municipales */}
        {isMunicipal && (
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
        )}

        {/* Distrito - Solo para reportes municipales */}
        {isMunicipal && (
          <div className="w-56">
            <Select
              value={distritoFilter}
              onValueChange={(v) => { setDistritoFilter(v); setPage(1); }}
            >
              <SelectTrigger><SelectValue placeholder="Distrito" /></SelectTrigger>
              <SelectContent>
                {districts.map((d) => (<SelectItem key={d} value={d}>{d}</SelectItem>))}
              </SelectContent>
            </Select>
          </div>
        )}

        <Button
          variant="ghost"
          onClick={() => {
            setStartDate(""); setEndDate(""); setCodigoFilter(""); setDistritoFilter("");
            setTypeFilter(""); setVariantFilter(""); setActividadFilter(""); setPage(1);
          }}
        >
          Limpiar
        </Button>

        <div className="ml-auto flex gap-2">
          <Button className="bg-green-500 hover:bg-green-600 text-white"
            onClick={() => {
              // Excel simple (sin estilos extra) — deja tu versión con estilos si ya la tienes funcionando
              const headers = columns;
              const rows = filtered.map((r) => {
                const tipoReporte = activeReportTab === "municipal" ? "Municipal" : "Alquiler";
                const rowData = isMunicipal 
                  ? getMunicipalRowData(r, showEstacion, isKmType)
                  : getRentalRowData(r);
                
                return [tipoReporte, ...rowData];
              });
              const ws = XLSX.utils.aoa_to_sheet([headers, ...rows]);
              const wb = XLSX.utils.book_new();
              XLSX.utils.book_append_sheet(wb, ws, "Reportes");
              const tipoArchivo = activeReportTab === "municipal" ? "municipales" : "alquiler";
              XLSX.writeFile(wb, `reportes_${tipoArchivo}_${new Date().toISOString().slice(0,10)}.xlsx`);
            }}>
            Exportar a Excel
          </Button>
          <Button className="bg-red-500 hover:bg-red-600 text-white" onClick={exportPDF}>
            Exportar a PDF
          </Button>
        </div>
      </div>

      {/* Fila 2: Selección (Tipo / Variante) */}
      <div className="flex flex-wrap items-center gap-3">
        <div className="w-64">
          <Select
            value={typeFilter}
            onValueChange={(v) => { setTypeFilter(v); setVariantFilter(""); setActividadFilter(""); setPage(1); }}
            disabled={tiposDisponibles.length === 0}
          >
            <SelectTrigger>
              <SelectValue placeholder={tiposDisponibles.length ? "Seleccionar tipo" : "No hay tipos en el ámbito"} />
            </SelectTrigger>
            <SelectContent>
              {tiposDisponibles.map((t) => (<SelectItem key={t} value={t}>{t}</SelectItem>))}
            </SelectContent>
          </Select>
        </div>

        {/* Variante - Solo para reportes municipales */}
        {isMunicipal && typeFilter && variantesDisponibles.length > 0 && (
          <div className="w-52">
            <Select
              value={variantFilter}
              onValueChange={(v) => { setVariantFilter(v); setPage(1); }}
            >
              <SelectTrigger><SelectValue placeholder="Variante" /></SelectTrigger>
              <SelectContent>
                {variantesDisponibles.map((v) => (<SelectItem key={v} value={v}>{v}</SelectItem>))}
              </SelectContent>
            </Select>
          </div>
        )}

        {/* Actividad - Solo para reportes de alquiler */}
        {isRental && actividadesDisponibles.length > 0 && (
          <div className="w-64">
            <Select
              value={actividadFilter}
              onValueChange={(v) => { setActividadFilter(v); setPage(1); }}
            >
              <SelectTrigger><SelectValue placeholder="Filtrar por actividad" /></SelectTrigger>
              <SelectContent>
                {actividadesDisponibles.map((a) => (<SelectItem key={a} value={a}>{a}</SelectItem>))}
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
        <table className="w-full text-sm">
          <thead className="bg-gray-50 text-gray-700">
            <tr>
              {columns.map((column) => (
                <th key={column} className="px-4 py-3 text-left font-medium">
                  {column}
                </th>
              ))}
              <th className="px-4 py-3 text-right font-medium">Acciones</th>
            </tr>
          </thead>

          <tbody>
            {pageRows.map((r) => {
              const rowData = isMunicipal 
                ? getMunicipalRowData(r, showEstacion, isKmType)
                : getRentalRowData(r);

              return (
                <tr key={r.id} className="border-t hover:bg-gray-50">
                  {/* Badge de tipo */}
                  <td className="px-4 py-3">
                    <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${
                      activeReportTab === "municipal" 
                        ? "bg-blue-100 text-blue-800" 
                        : "bg-green-100 text-green-800"
                    }`}>
                      {activeReportTab === "municipal" ? "🏛️ Municipal" : "🚛 Alquiler"}
                    </span>
                  </td>
                  
                  {/* Datos dinámicos */}
                  {rowData.map((value, index) => (
                    <td key={index} className="px-4 py-3">{value}</td>
                  ))}

                  {/* Acciones */}
                  <td className="px-4 py-3">
                    <div className="flex items-center justify-end gap-2">
                      <button
                        type="button"
                        onClick={() => openView(r)}
                        className="p-2 rounded-lg text-blue-600 hover:bg-blue-50"
                        title="Ver" aria-label="Ver"
                      >
                        <Eye size={18} />
                      </button>
                      <button
                        type="button"
                        onClick={() => handleEditClick(r)}
                        className="p-2 rounded-lg text-blue-600 hover:bg-blue-50"
                        title="Editar" aria-label="Editar"
                      >
                        <Pencil size={18} />
                      </button>
                      <button
                        type="button"
                        onClick={() => handleDeleteClick(r)}
                        className="p-2 rounded-lg text-red-600 hover:bg-red-50"
                        title="Eliminar" aria-label="Eliminar"
                      >
                        <Trash2 size={18} />
                      </button>
                    </div>
                  </td>
                </tr>
              );
            })}

            {filtered.length === 0 && (
              <tr>
                <td className="px-4 py-6 text-center text-gray-500" colSpan={columns.length + 1}>
                  No hay reportes {activeReportTab === "municipal" ? "municipales" : "de alquiler"} con ese filtro.
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>

      {/* Paginación */}
      <div className="flex items-center justify-between">
        <span className="text-sm text-gray-600">Página {page} de {totalPages}</span>
        <div className="flex gap-2">
          <Button variant="secondary" disabled={page <= 1} onClick={() => setPage((p) => Math.max(1, p - 1))}>
            Anterior
          </Button>
          <Button variant="secondary" disabled={page >= totalPages} onClick={() => setPage((p) => Math.min(totalPages, p + 1))}>
            Siguiente
          </Button>
        </div>
      </div>

      {/* Modal VER */}
      <Dialog open={detailsOpen} onOpenChange={setDetailsOpen}>
          <DialogContent className="max-w-3xl max-h-[80vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>Detalles del reporte {selectedRow?.id ? `#${selectedRow.id}` : ""}</DialogTitle>
            <DialogDescription>Información completa del registro seleccionado.</DialogDescription>
          </DialogHeader>

          {selectedRow && (
            <div className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                <Field
                  label="Operador"
                  value={
                    selectedRow?.operador
                      ? `${selectedRow.operador?.name ?? ""} ${selectedRow.operador?.last ?? ""}${selectedRow.operador?.identification ? ` (${selectedRow.operador.identification})` : ""}`
                      : selectedRow?.operadorId ?? "—"
                  }
                />
                <Field
                  label="Maquinaria"
                  value={
                    selectedRow?.maquinaria
                      ? `${selectedRow.maquinaria?.tipo ?? ""}${selectedRow.maquinaria?.placa ? ` - ${selectedRow.maquinaria.placa}` : ""}`
                      : selectedRow?.maquinariaId ?? "—"
                  }
                />
                <Field
                  label={["vagoneta","cabezal","cisterna"].includes(String(selectedRow?.maquinaria?.tipo || "").toLowerCase()) ? "Kilometraje" : "Horímetro"}
                  value={
                    ["vagoneta","cabezal","cisterna"].includes(String(selectedRow?.maquinaria?.tipo || "").toLowerCase())
                      ? (selectedRow?.kilometraje ?? selectedRow?.detalles?.kilometraje ?? "—")
                      : (selectedRow?.horimetro ?? selectedRow?.detalles?.horimetro ?? "—")
                  }
                />
                <Field
                  label="Estación"
                  value={(() => {
                    if (selectedRow?.estacion) return String(selectedRow.estacion);
                    const d = selectedRow?.estacionDesde ?? selectedRow?.detalles?.estacionDesde;
                    const h = selectedRow?.estacionHasta ?? selectedRow?.detalles?.estacionHasta;
                    if (d != null || h != null) return `${d ?? "—"}+${h ?? "—"}`;
                    return "—";
                  })()}
                />
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                <Field label="Tipo actividad" value={selectedRow?.tipoActividad ?? selectedRow?.actividad ?? "—"} />
                <Field
                  label="Horario"
                  value={(() => {
                    const ini = selectedRow?.horaInicio ?? selectedRow?.detalles?.horaInicio;
                    const fin = selectedRow?.horaFin ?? selectedRow?.detalles?.horaFin;
                    return (ini || fin) ? `${ini ?? "—"} – ${fin ?? "—"}` : "—";
                  })()}
                />
                <Field label="Diésel" value={selectedRow?.diesel ?? selectedRow?.combustible ?? "—"} />
                <Field label="Horas (Ord/Ext)" value={`${selectedRow?.horasOrd ?? "—"} / ${selectedRow?.horasExt ?? "—"}`} />
                <Field label="Distrito" value={selectedRow?.distrito ?? "—"} />
                <Field label="Código Camino" value={selectedRow?.codigoCamino ?? "—"} />
                <Field label="Viáticos" value={selectedRow?.viaticos ?? "—"} />
                <Field label="Fecha" value={fmtDate(selectedRow?.fecha)} />
              </div>

              <div className="border rounded-lg p-3">
                <div className="text-sm font-semibold mb-2">Detalles</div>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                  {(selectedRow?.detalles?.tipoMaterial ||
                    selectedRow?.detalles?.cantidadMaterial != null ||
                    selectedRow?.detalles?.fuente ||
                    selectedRow?.detalles?.boleta) && (
                    <>
                      <Field label="Tipo material" value={selectedRow?.detalles?.tipoMaterial ?? "—"} />
                      <Field label="Cantidad (m³)" value={selectedRow?.detalles?.cantidadMaterial ?? "—"} />
                      <Field label="Fuente" value={selectedRow?.detalles?.fuente ?? "—"} />
                      <Field label="Boleta" value={selectedRow?.detalles?.boleta ?? "—"} />
                    </>
                  )}

                  {(selectedRow?.detalles?.placaCarreta ||
                    selectedRow?.detalles?.tipoCarga ||
                    selectedRow?.detalles?.destino ||
                    selectedRow?.detalles?.placaMaquinariaLlevada) && (
                    <>
                      <Field label="Placa carreta" value={selectedRow?.detalles?.placaCarreta ?? "—"} />
                      <Field label="Tipo carga" value={selectedRow?.detalles?.tipoCarga ?? "—"} />
                      <Field label="Destino" value={selectedRow?.detalles?.destino ?? "—"} />
                      <Field label="Placa maquinaria llevada" value={selectedRow?.detalles?.placaMaquinariaLlevada ?? "—"} />
                    </>
                  )}

                  {(selectedRow?.detalles?.cantidadLiquido != null || selectedRow?.detalles?.fuente) && (
                    <>
                      <Field label="Cantidad líquido (L)" value={selectedRow?.detalles?.cantidadLiquido ?? "—"} />
                      <Field label="Fuente" value={selectedRow?.detalles?.fuente ?? "—"} />
                    </>
                  )}
                </div>
              </div>
            </div>
          )}
        </DialogContent>
      </Dialog>
    </div>
  );
}
