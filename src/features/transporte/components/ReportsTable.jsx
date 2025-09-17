
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

// // -------- utils --------
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

// // variantes permitidas por tipo
// const VARIANT_OPTIONS_BY_TYPE = {
//   vagoneta: ["material", "carreta", "cisterna"],
//   cabezal: ["material", "carreta", "cisterna"],
// };

// export default function ReportsTable({ reports = [] }) {
//   // tipo desde varios campos posibles
//   const getType = (r) =>
//     String(pick(get(r, "maquinaria.tipo"), r.tipoMaquinaria, r.tipo) || "").toLowerCase();

//   // variante (explícita si existe; si no, heurística)
//   const getVar = (r) => {
//     const raw = pick(
//       get(r, "variant"),
//       get(r, "variante"),
//       get(r, "detalles.variante"),
//       get(r, "maquinaria.variant"),
//     );
//     if (raw) return String(raw).toLowerCase();

//     // Heurística
//     const hasCarreta =
//       get(r, "placaCarreta") != null || get(r, "detalles.placaCarreta") != null ||
//       get(r, "tipoCarga") != null     || get(r, "detalles.tipoCarga") != null ||
//       get(r, "destino") != null       || get(r, "detalles.destino") != null;
//     if (hasCarreta) return "carreta";

//     const hasCisterna =
//       get(r, "cantidadLiquido") != null || get(r, "detalles.cantidadLiquido") != null;
//     if (hasCisterna) return "cisterna";

//     const hasMaterial =
//       get(r, "tipoMaterial") != null     || get(r, "detalles.tipoMaterial") != null ||
//       get(r, "cantidadMaterial") != null || get(r, "detalles.cantidadMaterial") != null ||
//       get(r, "boleta") != null           || get(r, "detalles.boleta") != null;
//     if (hasMaterial) return "material";

//     return "";
//   };

//   // tipos disponibles
//   const tiposDisponibles = useMemo(() => {
//     const set = new Set();
//     (Array.isArray(reports) ? reports : []).forEach((r) => {
//       const t = getType(r);
//       if (t) set.add(t);
//     });
//     return Array.from(set).sort((a, b) => a.localeCompare(b));
//   }, [reports]);

//   const [typeFilter, setTypeFilter] = useState("");
//   useEffect(() => {
//     if (!typeFilter && tiposDisponibles.length) setTypeFilter(tiposDisponibles[0]);
//   }, [tiposDisponibles, typeFilter]);

//   // variante
//   const [variantFilter, setVariantFilter] = useState("");
//   const variantesDisponibles = useMemo(() => {
//     const t = (typeFilter || "").toLowerCase();
//     return VARIANT_OPTIONS_BY_TYPE[t] ?? [];
//   }, [typeFilter]);

//   // por defecto variante 1 (si aplica)
//   useEffect(() => {
//     const t = (typeFilter || "").toLowerCase();
//     const opts = VARIANT_OPTIONS_BY_TYPE[t];
//     if (!opts) {
//       setVariantFilter("");
//     } else if (!variantFilter || !opts.includes(variantFilter)) {
//       setVariantFilter(opts[0]);
//     }
//     // eslint-disable-next-line react-hooks/exhaustive-deps
//   }, [typeFilter]);

//   // filtro final
//   const filtered = useMemo(() => {
//     if (!typeFilter) return [];
//     const t = typeFilter.toLowerCase();

//     let rows = (reports || []).filter((r) => getType(r) === t);
//     const hasVariants = !!VARIANT_OPTIONS_BY_TYPE[t];
//     if (hasVariants && variantFilter) {
//       rows = rows.filter((r) => getVar(r) === variantFilter);
//     }
//     return rows;
//   }, [reports, typeFilter, variantFilter]);

//   // columnas dinámicas
//   const tLower = (typeFilter || "").toLowerCase();
//   const isKmType = ["vagoneta", "cabezal", "cisterna"].includes(tLower);
//   const showEstacion = !isKmType; // excavadora, niveladora, compactadora, backhoe, cargador

//   const metricHeader = isKmType ? "Kilometraje" : "Horímetro";

//   const isMaterial = variantFilter === "material" && (VARIANT_OPTIONS_BY_TYPE[tLower] || []).length > 0;
//   const isCarreta = variantFilter === "carreta" && (VARIANT_OPTIONS_BY_TYPE[tLower] || []).length > 0;
//   const isCisterna = variantFilter === "cisterna" && (VARIANT_OPTIONS_BY_TYPE[tLower] || []).length > 0;

//   // Mostrar Placa carreta en:
//   // - cabezal/material
//   // - cabezal/cisterna
//   // - (ya se muestra en carreta)
//   const showPlacaCarretaForHead = tLower === "cabezal" && (isMaterial || isCisterna || isCarreta);

//   // Mostrar placa maquinaria llevada cuando la variante es carreta (vagoneta/cabezal)
//   const showPlacaMaquinariaLlevada = isCarreta;

//   // -------- export CSV --------
//   const exportExcel = () => {
//     const headers = [
//       "ID",
//       "Operador",
//       "Maquinaria",
//       metricHeader,
//       "Diésel",
//       "Horas (Ord/Ext)",
//       ...(showEstacion ? ["Estación"] : []),
//      "Tipo actividad",
//      "Horario",
//      "Distrito",
//      "Código Camino",
//      "Viáticos",
//      "Fecha",
//       // "Tipo actividad",     // nuevo
//       // "Horario",
//       // "Distrito",
//       // "Código Camino",
//       // "Viáticos",
//       // "Fecha",
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

//       // extras
//       const tipoMaterial = pick(r.tipoMaterial, get(r, "detalles.tipoMaterial"));
//       const cantidadMaterial = pick(r.cantidadMaterial, get(r, "detalles.cantidadMaterial"));
//       const fuente = pick(r.fuente, get(r, "detalles.fuente"));
//       const boleta = pick(r.boleta, get(r, "detalles.boleta"));

//       const tipoCarga = pick(r.tipoCarga, get(r, "detalles.tipoCarga"));
//       const destino = pick(r.destino, get(r, "detalles.destino"));
//       const placaCarreta = pick(r.placaCarreta, get(r, "detalles.placaCarreta"));
//       const placaMaquinariaLlevada = pick(r.placaMaquinariaLlevada, get(r, "detalles.placaMaquinariaLlevada"));
//       const cantidadLiquido = pick(r.cantidadLiquido, get(r, "detalles.cantidadLiquido"));

//       const tipoActividad = pick(r.tipoActividad, r.actividad);

//       const base = [
//         r?.id ?? "",
//         operadorTxt,
//         maquinariaTxt,
//         metricValue,
//         showNum(pick(r?.diesel, r?.combustible)),
//         horas,
//         ...(showEstacion ? [estacionTxt] : []),
//         showText(tipoActividad),   // nuevo
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

//     const csv = [headers, ...rows]
//       .map((arr) =>
//         arr
//           .map((cell) => {
//             const s = String(cell ?? "");
//             return /[",\n;]/.test(s) ? `"${s.replace(/"/g, '""')}"` : s;
//           })
//           .join(",")
//       )
//       .join("\n");

//     const blob = new Blob(["\ufeff" + csv], { type: "text/csv;charset=utf-8;" });
//     const url = URL.createObjectURL(blob);
//     const a = document.createElement("a");
//     a.href = url;
//     a.download = "reportes.csv";
//     a.click();
//     URL.revokeObjectURL(url);
//   };

//   // -------- export PDF --------
//   const exportPDF = () => {
//     const extraThead =
//       isMaterial
//         ? `<th>Tipo material</th><th>Cantidad (m³)</th><th>Fuente</th><th>Boleta</th><th>Horario</th>`
//         : isCarreta
//         ? `<th>Placa carreta</th><th>Tipo carga</th><th>Destino</th><th>Placa maquinaria llevada</th><th>Horario</th>`
//         : isCisterna
//         ? `<th>Placa carreta</th><th>Cantidad líquido (L)</th><th>Fuente</th><th>Horario</th>`
//         //: (tLower === "cabezal" ? `<th>Placa carreta</th><th>Horario</th>` : `<th>Horario</th>`);
//         : (tLower === "cabezal"
//          ? `<th>Placa carreta</th><th>Horario</th>`
//          : `<th>${showEstacion ? "Estación" : ""}</th><th>Horario</th>`);

//     const htmlRows = filtered
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

//         const tipoActividad = pick(r.tipoActividad, r.actividad);

//         // horario
//         const horaInicio = pick(r.horaInicio, get(r, "detalles.horaInicio"));
//         const horaFin = pick(r.horaFin, get(r, "detalles.horaFin"));
//         const horario = (horaInicio || horaFin) ? `${showText(horaInicio)} – ${showText(horaFin)}` : "—";

//         // extras
//         const tipoMaterial = pick(r.tipoMaterial, get(r, "detalles.tipoMaterial"));
//         const cantidadMaterial = pick(r.cantidadMaterial, get(r, "detalles.cantidadMaterial"));
//         const fuente = pick(r.fuente, get(r, "detalles.fuente"));
//         const boleta = pick(r.boleta, get(r, "detalles.boleta"));
//         const tipoCarga = pick(r.tipoCarga, get(r, "detalles.tipoCarga"));
//         const destino = pick(r.destino, get(r, "detalles.destino"));
//         const placaCarreta = pick(r.placaCarreta, get(r, "detalles.placaCarreta"));
//         const placaMaquinariaLlevada = pick(r.placaMaquinariaLlevada, get(r, "detalles.placaMaquinariaLlevada"));
//         const cantidadLiquido = pick(r.cantidadLiquido, get(r, "detalles.cantidadLiquido"));

//         let extraTds = "";
//         if (isMaterial) {
//           extraTds = `<td>${showText(tipoMaterial)}</td><td>${showNum(cantidadMaterial)}</td><td>${showText(fuente)}</td><td>${showText(boleta)}</td><td>${horario}</td>`;
//         } else if (isCarreta) {
//           extraTds = `<td>${showText(placaCarreta)}</td><td>${showText(tipoCarga)}</td><td>${showText(destino)}</td><td>${showText(placaMaquinariaLlevada)}</td><td>${horario}</td>`;
//         } else if (isCisterna) {
//           extraTds = `<td>${showText(placaCarreta)}</td><td>${showNum(cantidadLiquido)}</td><td>${showText(fuente)}</td><td>${horario}</td>`;
//         } else if (tLower === "cabezal") {
//           // cabezal + material/cisterna ya viene en los casos, aquí cubrimos cualquier otro caso
//           extraTds = `<td>${showText(placaCarreta)}</td><td>${horario}</td>`;
//         } else {
//           extraTds = `<td>${horario}</td>`;
//         }

//         return `
//           <tr>
//             <td>${r?.id ?? ""}</td>
//             <td>${operadorTxt}</td>
//             <td>${maquinariaTxt}</td>
//             <td>${metricValue}</td>
//             <td>${showNum(pick(r?.diesel, r?.combustible))}</td>
//             <td>${horas}</td>
//             ${showEstacion ? `<td>${estacionTxt}</td>` : ""}
//             <td>${showText(tipoActividad)}</td>
//             <td>${showText(r?.distrito)}</td>
//             <td>${showText(r?.codigoCamino)}</td>
//             <td>${showNum(r?.viaticos)}</td>
//             <td>${fmtDate(r?.fecha)}</td>
//             ${extraTds}
//           </tr>`;
//       })
//       .join("");

//     const win = window.open("", "_blank");
//     win.document.write(`
//       <html>
//       <head>
//         <title>Reportes</title>
//         <style>
//           body { font-family: system-ui, -apple-system, "Segoe UI", Roboto, "Helvetica Neue", Arial; padding: 16px; }
//           table { width: 100%; border-collapse: collapse; font-size: 12px; }
//           thead th { text-align: left; background:#f6f7f9; padding: 8px; border-bottom:1px solid #e5e7eb; }
//           tbody td { padding: 8px; border-bottom:1px solid #f1f5f9; }
//           h1 { font-size: 18px; margin-bottom: 12px; }
//         </style>
//       </head>
//       <body>
//         <h1>Reportes</h1>
//         <table>
//           <thead>
//             <tr>
//               <th>ID</th><th>Operador</th><th>Maquinaria</th><th>${metricHeader}</th>
//               <th>Diésel</th><th>Horas (Ord/Ext)</th>
//               {showEstacion && (
//               <th className="px-4 py-3 text-left font-medium">Estación</th>
//               )}
//               <th>Tipo actividad</th><th>Distrito</th>
//               <th>Código Camino</th><th>Viáticos</th><th>Fecha</th>
//               ${extraThead}
//             </tr>
//           </thead>
//           <tbody>${htmlRows}</tbody>
//         </table>
//       </body>
//       </html>
//     `);
//     win.document.close();
//     win.focus();
//     win.print();
//   };

//   // -------- render --------
//   return (
//     <div className="space-y-4">
//       {/* Toolbar */}
//       <div className="flex flex-wrap items-center gap-3">
//         <div className="w-64">
//           <Select value={typeFilter} onValueChange={setTypeFilter}>
//             <SelectTrigger>
//               <SelectValue placeholder="Filtrar por tipo" />
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

//         {["vagoneta", "cabezal"].includes((typeFilter || "").toLowerCase()) &&
//           variantesDisponibles.length > 0 && (
//             <div className="w-52">
//               <Select value={variantFilter} onValueChange={setVariantFilter}>
//                 <SelectTrigger>
//                   <SelectValue placeholder="Variante" />
//                 </SelectTrigger>
//                 <SelectContent>
//                   {variantesDisponibles.map((v) => (
//                     <SelectItem key={v} value={v}>
//                       {v}
//                     </SelectItem>
//                   ))}
//                 </SelectContent>
//               </Select>
//             </div>
//           )}

//         <span className="text-sm text-gray-600">
//           {filtered.length} resultado{filtered.length === 1 ? "" : "s"}
//         </span>

//         <div className="ml-auto flex gap-2">
//           <Button className="bg-green-500 hover:bg-green-600 text-white" onClick={exportExcel}>
//             Exportar a Excel
//           </Button>
//           <Button className="bg-red-500 hover:bg-red-600 text-white" onClick={exportPDF}>
//             Exportar a PDF
//           </Button>
//         </div>
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
//               <th className="px-4 py-3 text-left font-medium">Tipo actividad</th>
//               <th className="px-4 py-3 text-left font-medium">Distrito</th>
//               <th className="px-4 py-3 text-left font-medium">Código Camino</th>
//               <th className="px-4 py-3 text-left font-medium">Viáticos</th>
//               <th className="px-4 py-3 text-left font-medium">Fecha</th>

//               {/* material */}
//               {isMaterial && (
//                 <>
//                   <th className="px-4 py-3 text-left font-medium">Tipo material</th>
//                   <th className="px-4 py-3 text-left font-medium">Cantidad (m³)</th>
//                   <th className="px-4 py-3 text-left font-medium">Fuente</th>
//                   <th className="px-4 py-3 text-left font-medium">Boleta</th>
//                 </>
//               )}

//               {/* placa carreta para cabezal (material/cisterna/carreta) y para cualquier carreta */}
//               {(showPlacaCarretaForHead || isCarreta) && (
//                 <th className="px-4 py-3 text-left font-medium">Placa carreta</th>
//               )}

//               {/* carreta */}
//               {isCarreta && (
//                 <>
//                   <th className="px-4 py-3 text-left font-medium">Tipo carga</th>
//                   <th className="px-4 py-3 text-left font-medium">Destino</th>
//                   <th className="px-4 py-3 text-left font-medium">Placa maquinaria llevada</th>
//                 </>
//               )}

//               {/* cisterna */}
//               {isCisterna && (
//                 <>
//                   <th className="px-4 py-3 text-left font-medium">Cantidad líquido (L)</th>
//                   <th className="px-4 py-3 text-left font-medium">Fuente</th>
//                 </>
//               )}
//             </tr>
//           </thead>

//           <tbody>
//             {filtered.map((r) => {
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

//                 const estDesde = pick(r.estacionDesde, get(r, "detalles.estacionDesde"));
//                const estHasta = pick(r.estacionHasta, get(r, "detalles.estacionHasta"));
//                const estacionTxt =
//               estDesde != null || estHasta != null
//              ? `${showNum(estDesde)} – ${showNum(estHasta)}`
//              : "—";

//               const tipoActividad = showText(pick(r.tipoActividad, r.actividad));

//               // extras
//               const tipoMaterial = pick(r.tipoMaterial, get(r, "detalles.tipoMaterial"));
//               const cantidadMaterial = pick(r.cantidadMaterial, get(r, "detalles.cantidadMaterial"));
//               const fuente = pick(r.fuente, get(r, "detalles.fuente"));
//               const boleta = pick(r.boleta, get(r, "detalles.boleta"));

//               const tipoCarga = pick(r.tipoCarga, get(r, "detalles.tipoCarga"));
//               const destino = pick(r.destino, get(r, "detalles.destino"));
//               const placaCarreta = pick(r.placaCarreta, get(r, "detalles.placaCarreta"));
//               const placaMaquinariaLlevada = pick(r.placaMaquinariaLlevada, get(r, "detalles.placaMaquinariaLlevada"));

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
//     </div>
//   );
// }













"use client";

import React, { useMemo, useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";

/* ---------- utils ---------- */
const fmtDate = (d) => {
  try {
    return d ? new Date(d).toLocaleDateString() : "—";
  } catch {
    return "—";
  }
};
const showText = (v) => {
  if (v === null || v === undefined) return "—";
  if (typeof v === "string" && v.trim() === "") return "—";
  return String(v);
};
const showNum = (v) => {
  if (v === 0) return 0;
  const n = typeof v === "string" ? Number(v) : v;
  return Number.isFinite(n) ? n : "—";
};
const get = (obj, path) =>
  path.split(".").reduce((acc, k) => (acc && acc[k] !== undefined ? acc[k] : undefined), obj);
const pick = (...vals) => vals.find((v) => v !== undefined && v !== null);

/* variantes permitidas por tipo */
const VARIANT_OPTIONS_BY_TYPE = {
  vagoneta: ["material", "carreta", "cisterna"],
  cabezal: ["material", "carreta", "cisterna"],
};

const toEstacionTxt = (r) => {
  // 1) si viene el string nuevo, úsalo tal cual
  if (r?.estacion) return String(r.estacion);

  // 2) compat: si existieran campos antiguos en datos viejos
  const estDesde = (r?.estacionDesde ?? r?.detalles?.estacionDesde);
  const estHasta = (r?.estacionHasta ?? r?.detalles?.estacionHasta);

  if (estDesde != null || estHasta != null) {
    const left = showNum(estDesde);
    const right = showNum(estHasta);
    if (left !== "—" || right !== "—") return `${left}+${right}`;
  }
  return "—";
};

export default function ReportsTable({ reports = [] }) {
  /* --- inferir tipo y variante de cada fila --- */
  const getType = (r) =>
    String(pick(get(r, "maquinaria.tipo"), r.tipoMaquinaria, r.tipo) || "").toLowerCase();

  const getVar = (r) => {
    const raw = pick(
      get(r, "variant"),
      get(r, "variante"),
      get(r, "detalles.variante"),
      get(r, "maquinaria.variant")
    );
    if (raw) return String(raw).toLowerCase();

    // Heurística si no está explícita
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

  /* tipos disponibles para el filtro */
  const tiposDisponibles = useMemo(() => {
    const set = new Set();
    (Array.isArray(reports) ? reports : []).forEach((r) => {
      const t = getType(r);
      if (t) set.add(t);
    });
    return Array.from(set).sort((a, b) => a.localeCompare(b));
  }, [reports]);

  const [typeFilter, setTypeFilter] = useState("");
  useEffect(() => {
    if (!typeFilter && tiposDisponibles.length) setTypeFilter(tiposDisponibles[0]);
  }, [tiposDisponibles, typeFilter]);

  /* variantes disponibles para el tipo elegido */
  const [variantFilter, setVariantFilter] = useState("");
  const variantesDisponibles = useMemo(() => {
    const t = (typeFilter || "").toLowerCase();
    return VARIANT_OPTIONS_BY_TYPE[t] ?? [];
  }, [typeFilter]);

  useEffect(() => {
    const t = (typeFilter || "").toLowerCase();
    const opts = VARIANT_OPTIONS_BY_TYPE[t];
    if (!opts) {
      setVariantFilter("");
    } else if (!variantFilter || !opts.includes(variantFilter)) {
      setVariantFilter(opts[0]);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [typeFilter]);

  /* filas filtradas */
  const filtered = useMemo(() => {
    if (!typeFilter) return [];
    const t = typeFilter.toLowerCase();

    let rows = (reports || []).filter((r) => getType(r) === t);
    const hasVariants = !!VARIANT_OPTIONS_BY_TYPE[t];
    if (hasVariants && variantFilter) rows = rows.filter((r) => getVar(r) === variantFilter);
    return rows;
  }, [reports, typeFilter, variantFilter]);

  /* columnas dinámicas */
  const tLower = (typeFilter || "").toLowerCase();
  const isKmType = ["vagoneta", "cabezal", "cisterna"].includes(tLower);
  const showEstacion = !isKmType; // excavadora, niveladora, compactadora, backhoe, cargador
  const metricHeader = isKmType ? "Kilometraje" : "Horímetro";

  const isMaterial = variantFilter === "material" && (VARIANT_OPTIONS_BY_TYPE[tLower] || []).length > 0;
  const isCarreta = variantFilter === "carreta" && (VARIANT_OPTIONS_BY_TYPE[tLower] || []).length > 0;
  const isCisterna = variantFilter === "cisterna" && (VARIANT_OPTIONS_BY_TYPE[tLower] || []).length > 0;

  const showPlacaCarretaForHead = tLower === "cabezal" && (isMaterial || isCisterna || isCarreta);

  /* ---------- export CSV ---------- */
  const exportExcel = () => {
    const headers = [
      "ID",
      "Operador",
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
      "Fecha",
    ];
    if (isMaterial) headers.push("Tipo material", "Cantidad (m³)", "Fuente", "Boleta");
    if (showPlacaCarretaForHead || isCarreta) headers.push("Placa carreta");
    if (isCarreta) headers.push("Tipo carga", "Destino", "Placa maquinaria llevada");
    if (isCisterna) headers.push("Cantidad líquido (L)", "Fuente");

    const rows = filtered.map((r) => {
      const operadorTxt = r?.operador
        ? `${r.operador?.nombre ?? ""}${r.operador?.identificacion ? ` (${r.operador.identificacion})` : ""}`
        : r?.operadorId ?? "";

      const maquinariaTxt = r?.maquinaria
        ? `${r.maquinaria?.tipo ?? ""}${r.maquinaria?.placa ? ` - ${r.maquinaria.placa}` : ""}`
        : r?.maquinariaId ?? "";

      const horas = `${showNum(pick(r?.horasOrd, r?.horas_or))} / ${showNum(pick(r?.horasExt, r?.horas_ext))}`;
      const horaInicio = pick(r.horaInicio, get(r, "detalles.horaInicio"));
      const horaFin = pick(r.horaFin, get(r, "detalles.horaFin"));
      const horario = (horaInicio || horaFin) ? `${showText(horaInicio)} – ${showText(horaFin)}` : "—";
    
      const metricValue = isKmType
        ? showNum(pick(r?.kilometraje, get(r, "detalles.kilometraje")))
        : showNum(pick(r?.horimetro, get(r, "detalles.horimetro")));

      
      const estacionTxt = toEstacionTxt(r);


      const tipoMaterial = pick(r.tipoMaterial, get(r, "detalles.tipoMaterial"));
      const cantidadMaterial = pick(r.cantidadMaterial, get(r, "detalles.cantidadMaterial"));
      const fuente = pick(r.fuente, get(r, "detalles.fuente"));
      const boleta = pick(r.boleta, get(r, "detalles.boleta"));

      const tipoCarga = pick(r.tipoCarga, get(r, "detalles.tipoCarga"));
      const destino = pick(r.destino, get(r, "detalles.destino"));
      const placaCarreta = pick(r.placaCarreta, get(r, "detalles.placaCarreta"));
      const placaMaquinariaLlevada = pick(r.placaMaquinariaLlevada, get(r, "detalles.placaMaquinariaLlevada"));
      const cantidadLiquido = pick(r.cantidadLiquido, get(r, "detalles.cantidadLiquido"));

      const tipoActividad = pick(r.tipoActividad, r.actividad);

      const base = [
        r?.id ?? "",
        operadorTxt,
        maquinariaTxt,
        metricValue,
        showNum(pick(r?.diesel, r?.combustible)),
        horas,
        ...(showEstacion ? [estacionTxt] : []),
        showText(tipoActividad),
        horario,
        showText(r?.distrito),
        showText(r?.codigoCamino),
        showNum(r?.viaticos),
        fmtDate(r?.fecha),
      ];

      if (isMaterial) base.push(showText(tipoMaterial), showNum(cantidadMaterial), showText(fuente), showText(boleta));
      if (showPlacaCarretaForHead || isCarreta) base.push(showText(placaCarreta));
      if (isCarreta) base.push(showText(tipoCarga), showText(destino), showText(placaMaquinariaLlevada));
      if (isCisterna) base.push(showNum(cantidadLiquido), showText(fuente));

      return base;
    });

    const csv = [headers, ...rows]
      .map((arr) =>
        arr
          .map((cell) => {
            const s = String(cell ?? "");
            return /[",\n;]/.test(s) ? `"${s.replace(/"/g, '""')}"` : s;
          })
          .join(",")
      )
      .join("\n");

    const blob = new Blob(["\ufeff" + csv], { type: "text/csv;charset=utf-8;" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = "reportes.csv";
    a.click();
    URL.revokeObjectURL(url);
  };

  /* ---------- export PDF ---------- */
  const exportPDF = () => {
    const baseThead = `
      <th>ID</th><th>Operador</th><th>Maquinaria</th><th>${metricHeader}</th>
      <th>Diésel</th><th>Horas (Ord/Ext)</th>
      ${showEstacion ? "<th>Estación</th>" : ""}
      <th>Tipo actividad</th><th>Horario</th><th>Distrito</th>
      <th>Código Camino</th><th>Viáticos</th><th>Fecha</th>
    `;

    const extraThead =
      isMaterial
        ? `<th>Tipo material</th><th>Cantidad (m³)</th><th>Fuente</th><th>Boleta</th>`
        : isCarreta
        ? `<th>Placa carreta</th><th>Tipo carga</th><th>Destino</th><th>Placa maquinaria llevada</th>`
        : isCisterna
        ? `<th>Placa carreta</th><th>Cantidad líquido (L)</th><th>Fuente</th>`
        : `${showPlacaCarretaForHead ? "<th>Placa carreta</th>" : ""}`;

    const htmlRows = filtered
      .map((r) => {
        const operadorTxt = r?.operador
          ? `${r.operador?.nombre ?? ""}${r.operador?.identificacion ? ` (${r.operador.identificacion})` : ""}`
          : r?.operadorId ?? "—";

        const maquinariaTxt = r?.maquinaria
          ? `${r.maquinaria?.tipo ?? ""}${r.maquinaria?.placa ? ` - ${r.maquinaria.placa}` : ""}`
          : r?.maquinariaId ?? "—";

        const horas = `${showNum(pick(r?.horasOrd, r?.horas_or))} / ${showNum(pick(r?.horasExt, r?.horas_ext))}`;

        const metricValue = isKmType
          ? showNum(pick(r?.kilometraje, get(r, "detalles.kilometraje")))
          : showNum(pick(r?.horimetro, get(r, "detalles.horimetro")));

        const tipoActividad = pick(r.tipoActividad, r.actividad);

        const horaInicio = pick(r.horaInicio, get(r, "detalles.horaInicio"));
        const horaFin = pick(r.horaFin, get(r, "detalles.horaFin"));
        const horario = (horaInicio || horaFin) ? `${showText(horaInicio)} – ${showText(horaFin)}` : "—";

        

          const estacionTxt = toEstacionTxt(r); 

        const tipoMaterial = pick(r.tipoMaterial, get(r, "detalles.tipoMaterial"));
        const cantidadMaterial = pick(r.cantidadMaterial, get(r, "detalles.cantidadMaterial"));
        const fuente = pick(r.fuente, get(r, "detalles.fuente"));
        const boleta = pick(r.boleta, get(r, "detalles.boleta"));
        const tipoCarga = pick(r.tipoCarga, get(r, "detalles.tipoCarga"));
        const destino = pick(r.destino, get(r, "detalles.destino"));
        const placaCarreta = pick(r.placaCarreta, get(r, "detalles.placaCarreta"));
        const placaMaquinariaLlevada = pick(r.placaMaquinariaLlevada, get(r, "detalles.placaMaquinariaLlevada"));
        const cantidadLiquido = pick(r.cantidadLiquido, get(r, "detalles.cantidadLiquido"));

        let extraTds = "";
        if (isMaterial) {
          extraTds = `<td>${showText(tipoMaterial)}</td><td>${showNum(cantidadMaterial)}</td><td>${showText(fuente)}</td><td>${showText(boleta)}</td>`;
        } else if (isCarreta) {
          extraTds = `<td>${showText(placaCarreta)}</td><td>${showText(tipoCarga)}</td><td>${showText(destino)}</td><td>${showText(placaMaquinariaLlevada)}</td>`;
        } else if (isCisterna) {
          extraTds = `<td>${showText(placaCarreta)}</td><td>${showNum(cantidadLiquido)}</td><td>${showText(fuente)}</td>`;
        } else if (showPlacaCarretaForHead) {
          extraTds = `<td>${showText(placaCarreta)}</td>`;
        }

        return `
          <tr>
            <td>${r?.id ?? ""}</td>
            <td>${operadorTxt}</td>
            <td>${maquinariaTxt}</td>
            <td>${metricValue}</td>
            <td>${showNum(pick(r?.diesel, r?.combustible))}</td>
            <td>${horas}</td>
            ${showEstacion ? `<td>${estacionTxt}</td>` : ""}
            <td>${showText(tipoActividad)}</td>
            <td>${horario}</td>
            <td>${showText(r?.distrito)}</td>
            <td>${showText(r?.codigoCamino)}</td>
            <td>${showNum(r?.viaticos)}</td>
            <td>${fmtDate(r?.fecha)}</td>
            ${extraTds}
          </tr>`;
      })
      .join("");

    const win = window.open("", "_blank");
    win.document.write(`
      <html>
      <head>
        <title>Reportes</title>
        <style>
          body { font-family: system-ui, -apple-system, "Segoe UI", Roboto, "Helvetica Neue", Arial; padding: 16px; }
          table { width: 100%; border-collapse: collapse; font-size: 12px; }
          thead th { text-align: left; background:#f6f7f9; padding: 8px; border-bottom:1px solid #e5e7eb; }
          tbody td { padding: 8px; border-bottom:1px solid #f1f5f9; }
          h1 { font-size: 18px; margin-bottom: 12px; }
        </style>
      </head>
      <body>
        <h1>Reportes</h1>
        <table>
          <thead>
            <tr>
              ${baseThead}
              ${extraThead}
            </tr>
          </thead>
          <tbody>${htmlRows}</tbody>
        </table>
      </body>
      </html>
    `);
    win.document.close();
    win.focus();
    win.print();
  };

  /* ---------- render ---------- */
  return (
    <div className="space-y-4">
      {/* Toolbar */}
      <div className="flex flex-wrap items-center gap-3">
        <div className="w-64">
          <Select value={typeFilter} onValueChange={setTypeFilter}>
            <SelectTrigger>
              <SelectValue placeholder="Filtrar por tipo" />
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

        {["vagoneta", "cabezal"].includes((typeFilter || "").toLowerCase()) &&
          variantesDisponibles.length > 0 && (
            <div className="w-52">
              <Select value={variantFilter} onValueChange={setVariantFilter}>
                <SelectTrigger>
                  <SelectValue placeholder="Variante" />
                </SelectTrigger>
                <SelectContent>
                  {variantesDisponibles.map((v) => (
                    <SelectItem key={v} value={v}>
                      {v}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          )}

        <span className="text-sm text-gray-600">
          {filtered.length} resultado{filtered.length === 1 ? "" : "s"}
        </span>

        <div className="ml-auto flex gap-2">
          <Button className="bg-green-500 hover:bg-green-600 text-white" onClick={exportExcel}>
            Exportar a Excel
          </Button>
          <Button className="bg-red-500 hover:bg-red-600 text-white" onClick={exportPDF}>
            Exportar a PDF
          </Button>
        </div>
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

              {isMaterial && (
                <>
                  <th className="px-4 py-3 text-left font-medium">Tipo material</th>
                  <th className="px-4 py-3 text-left font-medium">Cantidad (m³)</th>
                  <th className="px-4 py-3 text-left font-medium">Fuente</th>
                  <th className="px-4 py-3 text-left font-medium">Boleta</th>
                </>
              )}

              {(showPlacaCarretaForHead || isCarreta) && (
                <th className="px-4 py-3 text-left font-medium">Placa carreta</th>
              )}

              {isCarreta && (
                <>
                  <th className="px-4 py-3 text-left font-medium">Tipo carga</th>
                  <th className="px-4 py-3 text-left font-medium">Destino</th>
                  <th className="px-4 py-3 text-left font-medium">Placa maquinaria llevada</th>
                </>
              )}

              {isCisterna && (
                <>
                  <th className="px-4 py-3 text-left font-medium">Cantidad líquido (L)</th>
                  <th className="px-4 py-3 text-left font-medium">Fuente</th>
                </>
              )}
            </tr>
          </thead>

          <tbody>
            {filtered.map((r) => {
              const operadorTxt = r?.operador
                ? `${r.operador?.nombre ?? ""}${r.operador?.identificacion ? ` (${r.operador.identificacion})` : ""}`
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

              const horaInicio = pick(r.horaInicio, get(r, "detalles.horaInicio"));
              const horaFin = pick(r.horaFin, get(r, "detalles.horaFin"));
              const horario = (horaInicio || horaFin) ? `${showText(horaInicio)} – ${showText(horaFin)}` : "—";

              const tipoMaterial = pick(r.tipoMaterial, get(r, "detalles.tipoMaterial"));
              const cantidadMaterial = pick(r.cantidadMaterial, get(r, "detalles.cantidadMaterial"));
              const fuente = pick(r.fuente, get(r, "detalles.fuente"));
              const boleta = pick(r.boleta, get(r, "detalles.boleta"));

              const tipoCarga = pick(r.tipoCarga, get(r, "detalles.tipoCarga"));
              const destino = pick(r.destino, get(r, "detalles.destino"));
              const placaCarreta = pick(r.placaCarreta, get(r, "detalles.placaCarreta"));
              const placaMaquinariaLlevada = pick(r.placaMaquinariaLlevada, get(r, "detalles.placaMaquinariaLlevada"));

              const cantidadLiquido = pick(r.cantidadLiquido, get(r, "detalles.cantidadLiquido"));

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

                  {isMaterial && (
                    <>
                      <td className="px-4 py-3">{showText(tipoMaterial)}</td>
                      <td className="px-4 py-3">{showNum(cantidadMaterial)}</td>
                      <td className="px-4 py-3">{showText(fuente)}</td>
                      <td className="px-4 py-3">{showText(boleta)}</td>
                    </>
                  )}

                  {(showPlacaCarretaForHead || isCarreta) && (
                    <td className="px-4 py-3">{showText(placaCarreta)}</td>
                  )}

                  {isCarreta && (
                    <>
                      <td className="px-4 py-3">{showText(tipoCarga)}</td>
                      <td className="px-4 py-3">{showText(destino)}</td>
                      <td className="px-4 py-3">{showText(placaMaquinariaLlevada)}</td>
                    </>
                  )}

                  {isCisterna && (
                    <>
                      <td className="px-4 py-3">{showNum(cantidadLiquido)}</td>
                      <td className="px-4 py-3">{showText(fuente)}</td>
                    </>
                  )}
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
    </div>
  );
}
