// "use client";

// import React, { useMemo, useState, useEffect } from "react";
// import { Button } from "@/components/ui/button";
// import {
//   Select,
//   SelectContent,
//   SelectItem,
//   SelectTrigger,
//   SelectValue,
// } from "@/components/ui/select";
// import { Input } from "@/components/ui/input";
// import * as XLSX from "xlsx";
// import { Eye, Pencil, Trash2 } from "lucide-react";
// import {
//   Dialog,
//   DialogContent,
//   DialogHeader,
//   DialogTitle,
//   DialogDescription,
// } from "@/components/ui/dialog";

// /* ====================== helpers ====================== */
// const fmtDate = (d) => {
//   try {
//     return d ? new Date(d).toLocaleDateString() : "—";
//   } catch {
//     return "—";
//   }
// };
// const showText = (v) => {
//   if (v === null || v === undefined) return "—";
//   if (typeof v === "string" && v.trim() === "") return "—";
//   return String(v);
// };
// const showNum = (v) => {
//   if (v === 0) return 0;
//   const n = typeof v === "string" ? Number(v) : v;
//   return Number.isFinite(n) ? n : "—";
// };
// const get = (obj, path) =>
//   path.split(".").reduce((acc, k) => (acc && acc[k] !== undefined ? acc[k] : undefined), obj);
// const pick = (...vals) => vals.find((v) => v !== undefined && v !== null);

// /* variantes permitidas por tipo */
// const VARIANT_OPTIONS_BY_TYPE = {
//   vagoneta: ["material", "carreta", "cisterna"],
//   cabezal: ["material", "carreta", "cisterna"],
// };

// const toEstacionTxt = (r) => {
//   if (r?.estacion) return String(r.estacion);
//   const estDesde = r?.estacionDesde ?? r?.detalles?.estacionDesde;
//   const estHasta = r?.estacionHasta ?? r?.detalles?.estacionHasta;
//   if (estDesde != null || estHasta != null) {
//     const left = showNum(estDesde);
//     const right = showNum(estHasta);
//     if (left !== "—" || right !== "—") return `${left}+${right}`;
//   }
//   return "—";
// };

// // infiere tipo y variante (mismo criterio que tenías)
// const getType = (r) =>
//   String(pick(get(r, "maquinaria.tipo"), r.tipoMaquinaria, r.tipo) || "").toLowerCase();

// const getVar = (r) => {
//   const raw = pick(
//     get(r, "variant"),
//     get(r, "variante"),
//     get(r, "detalles.variante"),
//     get(r, "maquinaria.variant")
//   );
//   if (raw) return String(raw).toLowerCase();

//   const hasCarreta =
//     get(r, "placaCarreta") != null ||
//     get(r, "detalles.placaCarreta") != null ||
//     get(r, "tipoCarga") != null ||
//     get(r, "detalles.tipoCarga") != null ||
//     get(r, "destino") != null ||
//     get(r, "detalles.destino") != null;
//   if (hasCarreta) return "carreta";

//   const hasCisterna =
//     get(r, "cantidadLiquido") != null || get(r, "detalles.cantidadLiquido") != null;
//   if (hasCisterna) return "cisterna";

//   const hasMaterial =
//     get(r, "tipoMaterial") != null ||
//     get(r, "detalles.tipoMaterial") != null ||
//     get(r, "cantidadMaterial") != null ||
//     get(r, "detalles.cantidadMaterial") != null ||
//     get(r, "boleta") != null ||
//     get(r, "detalles.boleta") != null;
//   if (hasMaterial) return "material";

//   return "";
// };

// /* ====================== componente ====================== */
// export default function ReportsTable({
//   reports = [],
//   districts: districtsProp, // opcional: si no viene, se infiere
// }) {
//   /* --------- filtros de ÁMBITO --------- */
//   const today = new Date().toISOString().slice(0, 10); // YYYY-MM-DD
//   const [startDate, setStartDate] = useState(""); // YYYY-MM-DD
//   const [endDate, setEndDate] = useState("");
//   const [codigoFilter, setCodigoFilter] = useState("");
//   const [distritoFilter, setDistritoFilter] = useState("");

//   /* --------- filtros de selección --------- */
//   const [typeFilter, setTypeFilter] = useState("");
//   const [variantFilter, setVariantFilter] = useState("");

//   /* --------- paginación --------- */
//   const [page, setPage] = useState(1);
//   const PAGE_SIZE = 10;

//   /* --------- distritos --------- */
//   const districts = useMemo(() => {
//     if (Array.isArray(districtsProp) && districtsProp.length) return districtsProp;
//     const set = new Set();
//     (Array.isArray(reports) ? reports : []).forEach((r) => {
//       const d = (r?.distrito || "").trim();
//       if (d) set.add(d);
//     });
//     return Array.from(set).sort((a, b) => a.localeCompare(b));
//   }, [reports, districtsProp]);

//   /* --------- ÁMBITO: subconjunto por fecha + distrito + código --------- */
//   const rowsScope = useMemo(() => {
//     let rows = Array.isArray(reports) ? [...reports] : [];

//     // normaliza fecha del registro a YYYY-MM-DD para comparar como string
//     const takeDate = (r) => (r?.fecha ? new Date(r.fecha).toISOString().slice(0, 10) : "");

//     if (startDate) {
//       rows = rows.filter((r) => {
//         const d = takeDate(r);
//         return d && d >= startDate;
//       });
//     }
//     if (endDate) {
//       rows = rows.filter((r) => {
//         const d = takeDate(r);
//         return d && d <= endDate;
//       });
//     }

//     if (distritoFilter) {
//       rows = rows.filter((r) => (r?.distrito || "").trim() === distritoFilter);
//     }

//     if (codigoFilter) {
//       rows = rows.filter(
//         (r) => String(r?.codigoCamino ?? "").trim() === String(codigoFilter).trim()
//       );
//     }

//     return rows;
//   }, [reports, startDate, endDate, distritoFilter, codigoFilter]);

//   /* --------- Tipos disponibles SOLO dentro del ámbito --------- */
//   const tiposDisponibles = useMemo(() => {
//     const set = new Set();
//     rowsScope.forEach((r) => {
//       const t = getType(r);
//       if (t) set.add(t);
//     });
//     return Array.from(set).sort((a, b) => a.localeCompare(b));
//   }, [rowsScope]);

//   /* --------- reset selecciones si el ámbito las invalida --------- */
//   useEffect(() => {
//     if (typeFilter && !tiposDisponibles.includes(typeFilter)) {
//       setTypeFilter("");
//       setVariantFilter("");
//       setPage(1);
//     }
//   }, [tiposDisponibles, typeFilter]);

//   /* --------- variantes disponibles según tipo elegido --------- */
//   const variantesDisponibles = useMemo(() => {
//     const t = (typeFilter || "").toLowerCase();
//     return VARIANT_OPTIONS_BY_TYPE[t] ?? [];
//   }, [typeFilter]);

//   /* --------- filas visibles = ÁMBITO + (tipo/variante) --------- */
//   const filtered = useMemo(() => {
//     let rows = rowsScope;

//     if (typeFilter) {
//       const t = typeFilter.toLowerCase();
//       rows = rows.filter((r) => getType(r) === t);

//       if (VARIANT_OPTIONS_BY_TYPE[t] && variantFilter) {
//         rows = rows.filter((r) => getVar(r) === variantFilter);
//       }
//     }

//     return rows;
//   }, [rowsScope, typeFilter, variantFilter]);


//   // Modal "ver"
// const [detailsOpen, setDetailsOpen] = useState(false);
// const [selectedRow, setSelectedRow] = useState<any | null>(null);

// const openView = (row: any) => {
//   setSelectedRow(row);
//   setDetailsOpen(true);
// };

// const closeView = () => {
//   setDetailsOpen(false);
//   setSelectedRow(null);
// };

// // Callbacks opcionales para editar/eliminar desde el padre.
// // Si no los pasas, aquí hago un fallback simple.
// const handleEdit = (row: any) => {
//   if (typeof (props as any)?.onEdit === "function") (props as any).onEdit(row);
//   else alert(`Editar ID ${row?.id}`);
// };

// const handleDelete = async (row: any) => {
//   if (typeof (props as any)?.onDelete === "function") return (props as any).onDelete(row);
//   const ok = window.confirm(`¿Eliminar reporte #${row?.id}?`);
//   if (ok) alert(`Eliminado ID ${row?.id} (implementa onDelete en el padre)`);
// };


//   /* --------- columnas dinámicas --------- */
//   const tLower = (typeFilter || "").toLowerCase();
//   const isKmType = ["vagoneta", "cabezal", "cisterna"].includes(tLower);
//   const showEstacion = !isKmType;
//   const metricHeader = isKmType ? "Kilometraje" : "Horímetro";

//   const isMaterial =
//     variantFilter === "material" && (VARIANT_OPTIONS_BY_TYPE[tLower] || []).length > 0;
//   const isCarreta =
//     variantFilter === "carreta" && (VARIANT_OPTIONS_BY_TYPE[tLower] || []).length > 0;
//   const isCisterna =
//     variantFilter === "cisterna" && (VARIANT_OPTIONS_BY_TYPE[tLower] || []).length > 0;

//   const showPlacaCarretaForHead = tLower === "cabezal" && (isMaterial || isCisterna || isCarreta);

//   /* --------- paginado --------- */
//   const totalPages = Math.max(1, Math.ceil(filtered.length / PAGE_SIZE));
//   useEffect(() => {
//     if (page > totalPages) setPage(1);
//   }, [totalPages, page]);
//   const pageRows = useMemo(() => {
//     const start = (page - 1) * PAGE_SIZE;
//     return filtered.slice(start, start + PAGE_SIZE);
//   }, [filtered, page]);

// const exportExcel = async () => {
//   try {
//     // importa la versión con estilos
//     const XLSX =
//       (await import("xlsx-js-style")).default || (await import("xlsx-js-style"));

//     // ----- Cabeceras y filas (exactamente igual que ya lo tienes) -----
//     const headers = [
//       "ID",
//       "Operador",
//       "Maquinaria",
//       (isKmType ? "Kilometraje" : "Horímetro"),
//       "Diésel",
//       "Horas (Ord/Ext)",
//       ...(showEstacion ? ["Estación"] : []),
//       "Tipo actividad",
//       "Horario",
//       "Distrito",
//       "Código Camino",
//       "Viáticos",
//       "Fecha",
//     ];
//     if (isMaterial) headers.push("Tipo material", "Cantidad (m³)", "Fuente", "Boleta");
//     if (showPlacaCarretaForHead || isCarreta) headers.push("Placa carreta");
//     if (isCarreta) headers.push("Tipo carga", "Destino", "Placa maquinaria llevada");
//     if (isCisterna) headers.push("Cantidad líquido (L)", "Fuente");

//     const rows = filtered.map((r) => {
//       const operadorTxt = r?.operador
//         ? `${r.operador?.nombre ?? ""}${r.operador?.identificacion ? ` (${r.operador.identificacion})` : ""}`
//         : r?.operadorId ?? "";

//       const maquinariaTxt = r?.maquinaria
//         ? `${r.maquinaria?.tipo ?? ""}${r.maquinaria?.placa ? ` - ${r.maquinaria.placa}` : ""}`
//         : r?.maquinariaId ?? "";

//       const horas = `${showNum(pick(r?.horasOrd, r?.horas_or))} / ${showNum(pick(r?.horasExt, r?.horas_ext))}`;

//       const horaInicio = pick(r.horaInicio, get(r, "detalles.horaInicio"));
//       const horaFin = pick(r.horaFin, get(r, "detalles.horaFin"));
//       const horario = (horaInicio || horaFin) ? `${showText(horaInicio)} – ${showText(horaFin)}` : "—";

//       const metricValue = isKmType
//         ? showNum(pick(r?.kilometraje, get(r, "detalles.kilometraje")))
//         : showNum(pick(r?.horimetro, get(r, "detalles.horimetro")));

//       const estacionTxt = toEstacionTxt(r);
//       const tipoActividad = showText(pick(r.tipoActividad, r.actividad));

//       const tipoMaterial = pick(r.tipoMaterial, get(r, "detalles.tipoMaterial"));
//       const cantidadMaterial = pick(r.cantidadMaterial, get(r, "detalles.cantidadMaterial"));
//       const fuente = pick(r.fuente, get(r, "detalles.fuente"));
//       const boleta = pick(r.boleta, get(r, "detalles.boleta"));

//       const tipoCarga = pick(r.tipoCarga, get(r, "detalles.tipoCarga"));
//       const destino = pick(r.destino, get(r, "detalles.destino"));
//       const placaCarreta = pick(r.placaCarreta, get(r, "detalles.placaCarreta"));
//       const placaMaquinariaLlevada = pick(r.placaMaquinariaLlevada, get(r, "detalles.placaMaquinariaLlevada"));

//       const cantidadLiquido = pick(r.cantidadLiquido, get(r, "detalles.cantidadLiquido"));

//       const base = [
//         r?.id ?? "",
//         operadorTxt,
//         maquinariaTxt,
//         metricValue,
//         showNum(pick(r?.diesel, r?.combustible)),
//         horas,
//         ...(showEstacion ? [estacionTxt] : []),
//         tipoActividad,
//         horario,
//         showText(r?.distrito),
//         showText(r?.codigoCamino),
//         showNum(r?.viaticos),
//         fmtDate(r?.fecha),
//       ];

//       if (isMaterial) base.push(showText(tipoMaterial), showNum(cantidadMaterial), showText(fuente), showText(boleta));
//       if (showPlacaCarretaForHead || isCarreta) base.push(showText(placaCarreta));
//       if (isCarreta) base.push(showText(tipoCarga), showText(destino), showText(placaMaquinariaLlevada));
//       if (isCisterna) base.push(showNum(cantidadLiquido), showText(fuente));

//       return base;
//     });

//     // ----- Construcción de hoja -----
//     const aoa = [headers, ...rows];
//     const ws = XLSX.utils.aoa_to_sheet(aoa);

//     // Ancho de columnas
//     ws["!cols"] = headers.map((h) => ({ wch: Math.max(12, String(h).length + 2) }));

//     // Alinear todo a la izquierda + cabecera en negrita
//     const range = XLSX.utils.decode_range(ws["!ref"]);
//     for (let R = range.s.r; R <= range.e.r; R++) {
//       for (let C = range.s.c; C <= range.e.c; C++) {
//         const ref = XLSX.utils.encode_cell({ r: R, c: C });
//         if (R === 0) {
//           ws[ref].s = {
//           alignment: { horizontal: "left", vertical: "center" },
//           font: { bold: true, color: { rgb: "000000" } },
//           fill: { fgColor: { rgb: "F2F4F7" } },
//           border: {
//           top:    { style: "thin", color: { rgb: "D0D5DD" } },
//           bottom: { style: "thin", color: { rgb: "D0D5DD" } },
//        },
//      };
//     }
//   }
// }

//     // Libro y descarga
//     const wb = XLSX.utils.book_new();
//     XLSX.utils.book_append_sheet(wb, ws, "Reportes");
//     const filename = `reportes_${new Date().toISOString().slice(0, 10)}.xlsx`;
//     XLSX.writeFile(wb, filename);
//   } catch (e) {
//     console.error("[exportExcel] error:", e);
//     alert("No se pudo generar el Excel. Revisa la consola para más detalles.");
//   }
// };



//   const exportPDF = () => {
//     const win = window.open("", "_blank");
//     const head = `
//       <style>
//         body { font-family: system-ui,-apple-system,"Segoe UI",Roboto,"Helvetica Neue",Arial; padding:16px;}
//         table { width:100%; border-collapse:collapse; font-size:12px; }
//         thead th { text-align:left; background:#f6f7f9; padding:8px; border-bottom:1px solid #e5e7eb;}
//         tbody td { padding:8px; border-bottom:1px solid #f1f5f9;}
//         h1 { font-size:18px; margin-bottom:12px; }
//       </style>`;
//     const rowsHtml = filtered
//       .map((r) => {
//         const operadorTxt = r?.operador
//           ? `${r.operador?.nombre ?? ""}${r.operador?.identificacion ? ` (${r.operador.identificacion})` : ""}`
//           : r?.operadorId ?? "—";

//         const maquinariaTxt = r?.maquinaria
//           ? `${r.maquinaria?.tipo ?? ""}${r.maquinaria?.placa ? ` - ${r.maquinaria.placa}` : ""}`
//           : r?.maquinariaId ?? "—";

//         const horas = `${showNum(pick(r?.horasOrd, r?.horas_or))} / ${showNum(pick(r?.horasExt, r?.horas_ext))}`;
//         const metricValue = isKmType
//           ? showNum(pick(r?.kilometraje, get(r, "detalles.kilometraje")))
//           : showNum(pick(r?.horimetro, get(r, "detalles.horimetro")));

//         const tipoActividad = showText(pick(r.tipoActividad, r.actividad));
//         const hi = pick(r.horaInicio, get(r, "detalles.horaInicio"));
//         const hf = pick(r.horaFin, get(r, "detalles.horaFin"));
//         const horario = (hi || hf) ? `${showText(hi)} – ${showText(hf)}` : "—";
//         const estacionTxt = toEstacionTxt(r);

//         return `<tr>
//           <td>${r?.id ?? ""}</td>
//           <td>${operadorTxt}</td>
//           <td>${maquinariaTxt}</td>
//           <td>${metricValue}</td>
//           <td>${showNum(pick(r?.diesel, r?.combustible))}</td>
//           <td>${horas}</td>
//           ${showEstacion ? `<td>${estacionTxt}</td>` : ""}
//           <td>${tipoActividad}</td>
//           <td>${horario}</td>
//           <td>${showText(r?.distrito)}</td>
//           <td>${showText(r?.codigoCamino)}</td>
//           <td>${showNum(r?.viaticos)}</td>
//           <td>${fmtDate(r?.fecha)}</td>
//         </tr>`;
//       })
//       .join("");

//     const baseThead = `
//       <th>ID</th><th>Operador</th><th>Maquinaria</th><th>${metricHeader}</th>
//       <th>Diésel</th><th>Horas (Ord/Ext)</th>
//       ${showEstacion ? "<th>Estación</th>" : ""}
//       <th>Tipo actividad</th><th>Horario</th><th>Distrito</th>
//       <th>Código Camino</th><th>Viáticos</th><th>Fecha</th>
//     `;

//     win.document.write(`
//       <html><head><title>Reportes</title>${head}</head>
//       <body>
//         <h1>Reportes</h1>
//         <table>
//           <thead><tr>${baseThead}</tr></thead>
//           <tbody>${rowsHtml}</tbody>
//         </table>
//       </body>
//       </html>
//     `);
//     win.document.close();
//     win.focus();
//     win.print();
//   };

//   /* ====================== RENDER ====================== */
//   return (
//     <div className="space-y-4">
//       {/* Fila 1: ÁMBITO */}
//       <div className="flex flex-wrap items-center gap-3">
//         {/* Fecha inicio */}
//         <div className="w-40">
//           <Input
//             type="date"
//             value={startDate}
//             max={today}
//             onChange={(e) => {
//               const v = e.target.value;
//               setStartDate(v);
//               // si endDate quedó antes que start, lo subimos
//               if (endDate && v && endDate < v) setEndDate(v);
//               setPage(1);
//             }}
//           />
//         </div>
//         <span className="text-gray-400">→</span>
//         {/* Fecha fin */}
//         <div className="w-40">
//           <Input
//             type="date"
//             value={endDate}
//             min={startDate || undefined}
//             max={today}
//             onChange={(e) => {
//               const v = e.target.value;
//               setEndDate(v);
//               setPage(1);
//             }}
//           />
//         </div>

//         {/* Código camino */}
//         <div className="w-28">
//           <Input
//             placeholder="Cód."
//             value={codigoFilter}
//             onChange={(e) => {
//               const digits = e.target.value.replace(/\D/g, "").slice(0, 3);
//               setCodigoFilter(digits);
//               setPage(1);
//             }}
//           />
//         </div>

//         {/* Distrito */}
//         <div className="w-56">
//           <Select
//             value={distritoFilter}
//             onValueChange={(v) => {
//               setDistritoFilter(v);
//               setPage(1);
//             }}
//           >
//             <SelectTrigger>
//               <SelectValue placeholder="Distrito" />
//             </SelectTrigger>
//             <SelectContent>
//               {districts.map((d) => (
//                 <SelectItem key={d} value={d}>
//                   {d}
//                 </SelectItem>
//               ))}
//             </SelectContent>
//           </Select>
//         </div>

//         <Button
//           variant="ghost"
//           onClick={() => {
//             setStartDate("");
//             setEndDate("");
//             setCodigoFilter("");
//             setDistritoFilter("");
//             setTypeFilter("");
//             setVariantFilter("");
//             setPage(1);
//           }}
//         >
//           Limpiar
//         </Button>

//         <div className="ml-auto flex gap-2">
//           <Button className="bg-green-500 hover:bg-green-600 text-white" onClick={exportExcel}>
//             Exportar a Excel
//           </Button>
//           <Button className="bg-red-500 hover:bg-red-600 text-white" onClick={exportPDF}>
//             Exportar a PDF
//           </Button>
//         </div>
//       </div>

//       {/* Fila 2: Selección (Tipo / Variante) */}
//       <div className="flex flex-wrap items-center gap-3">
//         <div className="w-64">
//           <Select
//             value={typeFilter}
//             onValueChange={(v) => {
//               setTypeFilter(v);
//               setVariantFilter("");
//               setPage(1);
//             }}
//             disabled={tiposDisponibles.length === 0}
//           >
//             <SelectTrigger>
//               <SelectValue
//                 placeholder={
//                   tiposDisponibles.length ? "Seleccionar tipo" : "No hay tipos en el ámbito"
//                 }
//               />
//             </SelectTrigger>
//             <SelectContent>
//               {tiposDisponibles.map((t) => (
//                 <SelectItem key={t} value={t}>
//                   {t}
//                 </SelectItem>
//               ))}
//             </SelectContent>
//           </Select>
//         </div>

//         {typeFilter && variantesDisponibles.length > 0 && (
//           <div className="w-52">
//             <Select
//               value={variantFilter}
//               onValueChange={(v) => {
//                 setVariantFilter(v);
//                 setPage(1);
//               }}
//             >
//               <SelectTrigger>
//                 <SelectValue placeholder="Variante" />
//               </SelectTrigger>
//               <SelectContent>
//                 {variantesDisponibles.map((v) => (
//                   <SelectItem key={v} value={v}>
//                     {v}
//                   </SelectItem>
//                 ))}
//               </SelectContent>
//             </Select>
//           </div>
//         )}

//         <span className="text-sm text-gray-600">
//           {filtered.length} resultado{filtered.length === 1 ? "" : "s"}
//         </span>
//       </div>

//       {/* Tabla */}
//       <div className="rounded-2xl border bg-white overflow-hidden">
//         <table className="w-full text-sm">
//           <thead className="bg-gray-50 text-gray-700">
//             <tr>
//               <th className="px-4 py-3 text-left font-medium">ID</th>
//               <th className="px-4 py-3 text-left font-medium">Operador</th>
//               <th className="px-4 py-3 text-left font-medium">Maquinaria</th>
//               <th className="px-4 py-3 text-left font-medium">{metricHeader}</th>
//               <th className="px-4 py-3 text-left font-medium">Diésel</th>
//               <th className="px-4 py-3 text-left font-medium">Horas (Ord/Ext)</th>
//               {showEstacion && <th className="px-4 py-3 text-left font-medium">Estación</th>}
//               <th className="px-4 py-3 text-left font-medium">Tipo actividad</th>
//               <th className="px-4 py-3 text-left font-medium">Horario</th>
//               <th className="px-4 py-3 text-left font-medium">Distrito</th>
//               <th className="px-4 py-3 text-left font-medium">Código Camino</th>
//               <th className="px-4 py-3 text-left font-medium">Viáticos</th>
//               <th className="px-4 py-3 text-left font-medium">Fecha</th>
//               <th className="px-4 py-3 text-right font-medium">Acciones</th>


//               {isMaterial && (
//                 <>
//                   <th className="px-4 py-3 text-left font-medium">Tipo material</th>
//                   <th className="px-4 py-3 text-left font-medium">Cantidad (m³)</th>
//                   <th className="px-4 py-3 text-left font-medium">Fuente</th>
//                   <th className="px-4 py-3 text-left font-medium">Boleta</th>
//                 </>
//               )}

//               {(showPlacaCarretaForHead || isCarreta) && (
//                 <th className="px-4 py-3 text-left font-medium">Placa carreta</th>
//               )}

//               {isCarreta && (
//                 <>
//                   <th className="px-4 py-3 text-left font-medium">Tipo carga</th>
//                   <th className="px-4 py-3 text-left font-medium">Destino</th>
//                   <th className="px-4 py-3 text-left font-medium">Placa maquinaria llevada</th>
//                 </>
//               )}

//               {isCisterna && (
//                 <>
//                   <th className="px-4 py-3 text-left font-medium">Cantidad líquido (L)</th>
//                   <th className="px-4 py-3 text-left font-medium">Fuente</th>
//                 </>
//               )}
//             </tr>
//           </thead>

//           <tbody>
//             {pageRows.map((r) => {
//               const operadorTxt = r?.operador
//                 ? `${r.operador?.nombre ?? ""}${r.operador?.identificacion ? ` (${r.operador.identificacion})` : ""}`
//                 : r?.operadorId ?? "—";

//               const maquinariaTxt = r?.maquinaria
//                 ? `${r.maquinaria?.tipo ?? ""}${r.maquinaria?.placa ? ` - ${r.maquinaria.placa}` : ""}`
//                 : r?.maquinariaId ?? "—";

//               const horas = `${showNum(pick(r?.horasOrd, r?.horas_or))} / ${showNum(pick(r?.horasExt, r?.horas_ext))}`;

//               const metricValue = isKmType
//                 ? showNum(pick(r?.kilometraje, get(r, "detalles.kilometraje")))
//                 : showNum(pick(r?.horimetro, get(r, "detalles.horimetro")));

//               const estacionTxt = toEstacionTxt(r);
//               const tipoActividad = showText(pick(r.tipoActividad, r.actividad));

//               const hi = pick(r.horaInicio, get(r, "detalles.horaInicio"));
//               const hf = pick(r.horaFin, get(r, "detalles.horaFin"));
//               const horario = (hi || hf) ? `${showText(hi)} – ${showText(hf)}` : "—";

//               const tipoMaterial = pick(r.tipoMaterial, get(r, "detalles.tipoMaterial"));
//               const cantidadMaterial = pick(r.cantidadMaterial, get(r, "detalles.cantidadMaterial"));
//               const fuente = pick(r.fuente, get(r, "detalles.fuente"));
//               const boleta = pick(r.boleta, get(r, "detalles.boleta"));

//               const tipoCarga = pick(r.tipoCarga, get(r, "detalles.tipoCarga"));
//               const destino = pick(r.destino, get(r, "detalles.destino"));
//               const placaCarreta = pick(r.placaCarreta, get(r, "detalles.placaCarreta"));
//               const placaMaquinariaLlevada = pick(
//                 r.placaMaquinariaLlevada,
//                 get(r, "detalles.placaMaquinariaLlevada")
//               );
//               const cantidadLiquido = pick(r.cantidadLiquido, get(r, "detalles.cantidadLiquido"));

//               return (
//                 <tr key={r.id} className="border-t hover:bg-gray-50">
//                   <td className="px-4 py-3">{r.id}</td>
//                   <td className="px-4 py-3">{operadorTxt}</td>
//                   <td className="px-4 py-3">{maquinariaTxt}</td>
//                   <td className="px-4 py-3">{metricValue}</td>
//                   <td className="px-4 py-3">{showNum(pick(r?.diesel, r?.combustible))}</td>
//                   <td className="px-4 py-3">{horas}</td>
//                   {showEstacion && <td className="px-4 py-3">{estacionTxt}</td>}
//                   <td className="px-4 py-3">{tipoActividad}</td>
//                   <td className="px-4 py-3">{horario}</td>
//                   <td className="px-4 py-3">{showText(r?.distrito)}</td>
//                   <td className="px-4 py-3">{showText(r?.codigoCamino)}</td>
//                   <td className="px-4 py-3">{showNum(r?.viaticos)}</td>
//                   <td className="px-4 py-3">{fmtDate(r?.fecha)}</td>

//                   {isMaterial && (
//                     <>
//                       <td className="px-4 py-3">{showText(tipoMaterial)}</td>
//                       <td className="px-4 py-3">{showNum(cantidadMaterial)}</td>
//                       <td className="px-4 py-3">{showText(fuente)}</td>
//                       <td className="px-4 py-3">{showText(boleta)}</td>
//                     </>
//                   )}

//                   {(showPlacaCarretaForHead || isCarreta) && (
//                     <td className="px-4 py-3">{showText(placaCarreta)}</td>
//                   )}

//                   {isCarreta && (
//                     <>
//                       <td className="px-4 py-3">{showText(tipoCarga)}</td>
//                       <td className="px-4 py-3">{showText(destino)}</td>
//                       <td className="px-4 py-3">{showText(placaMaquinariaLlevada)}</td>
//                     </>
//                   )}

//                   {isCisterna && (
//                     <>
//                       <td className="px-4 py-3">{showNum(cantidadLiquido)}</td>
//                       <td className="px-4 py-3">{showText(fuente)}</td>
//                     </>
//                   )}
//                 </tr>
//               );
//             })}

//             <td className="px-4 py-3">
//   <div className="flex items-center justify-end gap-2">
//     {/* Ver */}
//     <button
//       type="button"
//       onClick={() => openView(r)}
//       className="p-2 rounded-lg text-blue-600 hover:bg-blue-50"
//       title="Ver"
//       aria-label="Ver"
//     >
//       <Eye size={18} />
//     </button>

//     {/* Editar */}
//     <button
//       type="button"
//       onClick={() => handleEdit(r)}
//       className="p-2 rounded-lg text-blue-600 hover:bg-blue-50"
//       title="Editar"
//       aria-label="Editar"
//     >
//       <Pencil size={18} />
//     </button>

//     {/* Eliminar */}
//     <button
//       type="button"
//       onClick={() => handleDelete(r)}
//       className="p-2 rounded-lg text-red-600 hover:bg-red-50"
//       title="Eliminar"
//       aria-label="Eliminar"
//     >
//       <Trash2 size={18} />
//     </button>
//   </div>
// </td>


//             {filtered.length === 0 && (
//               <tr>
//                 <td className="px-4 py-6 text-center text-gray-500" colSpan={20}>
//                   No hay reportes con ese filtro.
//                 </td>
//               </tr>
//             )}
//           </tbody>
//         </table>
//       </div>

//       {/* Paginación */}
//       <div className="flex items-center justify-between">
//         <span className="text-sm text-gray-600">
//           Página {page} de {totalPages}
//         </span>
//         <div className="flex gap-2">
//           <Button
//             variant="secondary"
//             disabled={page <= 1}
//             onClick={() => setPage((p) => Math.max(1, p - 1))}
//           >
//             Anterior
//           </Button>
//           <Button
//             variant="secondary"
//             disabled={page >= totalPages}
//             onClick={() => setPage((p) => Math.min(totalPages, p + 1))}
//           >
//             Siguiente
//           </Button>
//         </div>
//       </div>
//     </div>
//   );
// }






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

// inferir tipo/variante
const getType = (r) => String(pick(get(r, "maquinaria.tipo"), r.tipoMaquinaria, r.tipo) || "").toLowerCase();
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
  reports = [],
  districts: districtsProp,      // opcional
  onEdit,                        // opcional
  onDelete,                      // opcional
}) {
  /* --------- filtros de ÁMBITO --------- */
  const today = new Date().toISOString().slice(0, 10); // YYYY-MM-DD
  const [startDate, setStartDate] = useState(""); // YYYY-MM-DD
  const [endDate, setEndDate] = useState("");
  const [codigoFilter, setCodigoFilter] = useState("");
  const [distritoFilter, setDistritoFilter] = useState("");

  /* --------- filtros de selección --------- */
  const [typeFilter, setTypeFilter] = useState("");
  const [variantFilter, setVariantFilter] = useState("");

  /* --------- paginación --------- */
  const [page, setPage] = useState(1);
  const PAGE_SIZE = 10;

  /* --------- distritos --------- */
  const districts = useMemo(() => {
    if (Array.isArray(districtsProp) && districtsProp.length) return districtsProp;
    const set = new Set();
    (Array.isArray(reports) ? reports : []).forEach((r) => {
      const d = (r?.distrito || "").trim();
      if (d) set.add(d);
    });
    return Array.from(set).sort((a, b) => a.localeCompare(b));
  }, [reports, districtsProp]);

  /* --------- ÁMBITO: fecha + distrito + código --------- */
  const rowsScope = useMemo(() => {
    let rows = Array.isArray(reports) ? [...reports] : [];
    const takeDate = (r) => (r?.fecha ? new Date(r.fecha).toISOString().slice(0, 10) : "");

    if (startDate) rows = rows.filter((r) => { const d = takeDate(r); return d && d >= startDate; });
    if (endDate)   rows = rows.filter((r) => { const d = takeDate(r); return d && d <= endDate; });

    if (distritoFilter) rows = rows.filter((r) => (r?.distrito || "").trim() === distritoFilter);
    if (codigoFilter)   rows = rows.filter((r) => String(r?.codigoCamino ?? "").trim() === String(codigoFilter).trim());

    return rows;
  }, [reports, startDate, endDate, distritoFilter, codigoFilter]);

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

  /* --------- variantes disponibles según tipo elegido --------- */
  const variantesDisponibles = useMemo(() => {
    const t = (typeFilter || "").toLowerCase();
    return VARIANT_OPTIONS_BY_TYPE[t] ?? [];
  }, [typeFilter]);

  /* --------- filas visibles = ÁMBITO + (tipo/variante) --------- */
  const filtered = useMemo(() => {
    let rows = rowsScope;
    if (typeFilter) {
      const t = typeFilter.toLowerCase();
      rows = rows.filter((r) => getType(r) === t);
      if (VARIANT_OPTIONS_BY_TYPE[t] && variantFilter) rows = rows.filter((r) => getVar(r) === variantFilter);
    }
    return rows;
  }, [rowsScope, typeFilter, variantFilter]);

  /* --------- columnas dinámicas --------- */
  const tLower = (typeFilter || "").toLowerCase();
  const isKmType = ["vagoneta", "cabezal", "cisterna"].includes(tLower);
  const showEstacion = !isKmType;
  const metricHeader = isKmType ? "Kilometraje" : "Horímetro";
  const isMaterial = variantFilter === "material" && (VARIANT_OPTIONS_BY_TYPE[tLower] || []).length > 0;
  const isCarreta  = variantFilter === "carreta"  && (VARIANT_OPTIONS_BY_TYPE[tLower] || []).length > 0;
  const isCisterna = variantFilter === "cisterna" && (VARIANT_OPTIONS_BY_TYPE[tLower] || []).length > 0;
  const showPlacaCarretaForHead = tLower === "cabezal" && (isMaterial || isCisterna || isCarreta);

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
      const tipoActividad = showText(pick(r.tipoActividad, r.actividad));
      const hi = pick(r.horaInicio, get(r, "detalles.horaInicio"));
      const hf = pick(r.horaFin, get(r, "detalles.horaFin"));
      const horario = (hi || hf) ? `${showText(hi)} – ${showText(hf)}` : "—";
      const estacionTxt = toEstacionTxt(r);

      return `<tr>
        <td>${r?.id ?? ""}</td>
        <td>${operadorTxt}</td>
        <td>${maquinariaTxt}</td>
        <td>${metricValue}</td>
        <td>${showNum(pick(r?.diesel, r?.combustible))}</td>
        <td>${horas}</td>
        ${showEstacion ? `<td>${estacionTxt}</td>` : ""}
        <td>${tipoActividad}</td>
        <td>${horario}</td>
        <td>${showText(r?.distrito)}</td>
        <td>${showText(r?.codigoCamino)}</td>
        <td>${showNum(r?.viaticos)}</td>
        <td>${fmtDate(r?.fecha)}</td>
      </tr>`;
    }).join("");

    const baseThead = `
      <th>ID</th><th>Operador</th><th>Maquinaria</th><th>${metricHeader}</th>
      <th>Diésel</th><th>Horas (Ord/Ext)</th>
      ${showEstacion ? "<th>Estación</th>" : ""}
      <th>Tipo actividad</th><th>Horario</th><th>Distrito</th>
      <th>Código Camino</th><th>Viáticos</th><th>Fecha</th>
    `;

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

        {/* Código camino */}
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

        {/* Distrito */}
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

        <Button
          variant="ghost"
          onClick={() => {
            setStartDate(""); setEndDate(""); setCodigoFilter(""); setDistritoFilter("");
            setTypeFilter(""); setVariantFilter(""); setPage(1);
          }}
        >
          Limpiar
        </Button>

        <div className="ml-auto flex gap-2">
          <Button className="bg-green-500 hover:bg-green-600 text-white"
            onClick={() => {
              // Excel simple (sin estilos extra) — deja tu versión con estilos si ya la tienes funcionando
              const headers = [
                "ID","Operador","Maquinaria",(isKmType?"Kilometraje":"Horímetro"),
                "Diésel","Horas (Ord/Ext)", ...(showEstacion?["Estación"]:[]),
                "Tipo actividad","Horario","Distrito","Código Camino","Viáticos","Fecha",
              ];
              const rows = filtered.map((r) => {
                const operadorTxt = r?.operador
                  ? `${r.operador?.name ?? ""} ${r.operador?.last ?? ""}${r.operador?.identification ? ` (${r.operador.identification})` : ""}`
                  : r?.operadorId ?? "";
                const maquinariaTxt = r?.maquinaria
                  ? `${r.maquinaria?.tipo ?? ""}${r.maquinaria?.placa ? ` - ${r.maquinaria.placa}` : ""}`
                  : r?.maquinariaId ?? "";
                const horas = `${showNum(pick(r?.horasOrd, r?.horas_or))} / ${showNum(pick(r?.horasExt, r?.horas_ext))}`;
                const hi = pick(r.horaInicio, get(r, "detalles.horaInicio"));
                const hf = pick(r.horaFin, get(r, "detalles.horaFin"));
                const horario = (hi || hf) ? `${showText(hi)} – ${showText(hf)}` : "—";
                const metricValue = isKmType
                  ? showNum(pick(r?.kilometraje, get(r, "detalles.kilometraje")))
                  : showNum(pick(r?.horimetro, get(r, "detalles.horimetro")));
                const estacionTxt = toEstacionTxt(r);
                const base = [
                  r?.id ?? "", operadorTxt, maquinariaTxt, metricValue,
                  showNum(pick(r?.diesel, r?.combustible)), horas,
                  ...(showEstacion ? [estacionTxt] : []),
                  showText(pick(r.tipoActividad, r.actividad)), horario,
                  showText(r?.distrito), showText(r?.codigoCamino),
                  showNum(r?.viaticos), fmtDate(r?.fecha),
                ];
                return base;
              });
              const ws = XLSX.utils.aoa_to_sheet([headers, ...rows]);
              const wb = XLSX.utils.book_new();
              XLSX.utils.book_append_sheet(wb, ws, "Reportes");
              XLSX.writeFile(wb, `reportes_${new Date().toISOString().slice(0,10)}.xlsx`);
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
            onValueChange={(v) => { setTypeFilter(v); setVariantFilter(""); setPage(1); }}
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

        {typeFilter && variantesDisponibles.length > 0 && (
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

        <span className="text-sm text-gray-600">
          {filtered.length} resultado{filtered.length === 1 ? "" : "s"}
        </span>
      </div>

      {/* Tabla */}
      <div className="rounded-2xl border bg-white overflow-hidden">
        <table className="w-full text-sm">
          <thead className="bg-gray-50 text-gray-700">
            <tr>
              <th className="px-4 py-3 text-left font-medium">ID</th>
              <th className="px-4 py-3 text-left font-medium">Operador</th>
              <th className="px-4 py-3 text-left font-medium">Maquinaria</th>
              <th className="px-4 py-3 text-left font-medium">{metricHeader}</th>
              <th className="px-4 py-3 text-left font-medium">Diésel</th>
              <th className="px-4 py-3 text-left font-medium">Horas (Ord/Ext)</th>
              {showEstacion && <th className="px-4 py-3 text-left font-medium">Estación</th>}
              <th className="px-4 py-3 text-left font-medium">Tipo actividad</th>
              <th className="px-4 py-3 text-left font-medium">Horario</th>
              <th className="px-4 py-3 text-left font-medium">Distrito</th>
              <th className="px-4 py-3 text-left font-medium">Código Camino</th>
              <th className="px-4 py-3 text-left font-medium">Viáticos</th>
              <th className="px-4 py-3 text-left font-medium">Fecha</th>
              <th className="px-4 py-3 text-right font-medium">Acciones</th>
            </tr>
          </thead>

          <tbody>
            {pageRows.map((r) => {
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

              return (
                <tr key={r.id} className="border-t hover:bg-gray-50">
                  <td className="px-4 py-3">{r.id}</td>
                  <td className="px-4 py-3">{operadorTxt}</td>
                  <td className="px-4 py-3">{maquinariaTxt}</td>
                  <td className="px-4 py-3">{metricValue}</td>
                  <td className="px-4 py-3">{showNum(pick(r?.diesel, r?.combustible))}</td>
                  <td className="px-4 py-3">{horas}</td>
                  {showEstacion && <td className="px-4 py-3">{estacionTxt}</td>}
                  <td className="px-4 py-3">{tipoActividad}</td>
                  <td className="px-4 py-3">{horario}</td>
                  <td className="px-4 py-3">{showText(r?.distrito)}</td>
                  <td className="px-4 py-3">{showText(r?.codigoCamino)}</td>
                  <td className="px-4 py-3">{showNum(r?.viaticos)}</td>
                  <td className="px-4 py-3">{fmtDate(r?.fecha)}</td>

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
                <td className="px-4 py-6 text-center text-gray-500" colSpan={20}>
                  No hay reportes con ese filtro.
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
