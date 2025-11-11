"use client";

import { useEffect, useMemo, useState } from "react";
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectTrigger,
  SelectContent,
  SelectItem,
  SelectValue,
} from "@/components/ui/select";
import { Edit, Trash2, Check, X, Filter as FilterIcon, RefreshCcw, ChevronDown, ChevronUp, } from "lucide-react";
import trailersService from "@/services/trailersService";
import {
  confirmAction,
  confirmDelete,
  showError,
  showSuccess,
} from "@/utils/sweetAlert";
import CatalogDialog from "@/features/catalog/CatalogDialog";


function useDebounced(value, delay = 350) {
  const [debounced, setDebounced] = useState(value);
  useEffect(() => {
    const h = setTimeout(() => setDebounced(value), delay);
    return () => clearTimeout(h);
  }, [value, delay]);
  return debounced;
}

export default function TrailersAdmin() {
  const [rows, setRows] = useState([]);
  const [loading, setLoading] = useState(false);

  // Modal “vista paginada”
  const [openDialog, setOpenDialog] = useState(false);

  // Tabs
  const [tm, setTm] = useState("vagoneta"); // vagoneta | cabezal
  const [categoria, setCategoria] = useState("carreta"); // para cabezal: carreta | material
  const [materialTipo, setMaterialTipo] = useState("desecho"); // si categoria=material

  // Crear
  const [placa, setPlaca] = useState("");

  // Editar inline
  const [editingId, setEditingId] = useState(null);
  const [edit, setEdit] = useState({
    placa: "",
    tipoMaquinaria: "vagoneta",
    categoria: "carreta",
    materialTipo: null,
  });

  // totales para el contador del panel de filtros
const [total, setTotal] = useState(0);

// barra de filtros (toggle + texto)
const [showFilters, setShowFilters] = useState(false);
const [q, setQ] = useState("");            // texto del “Buscar por placa”
const debouncedQ = useDebounced(q, 350);   // versión con retardo para llamadas

  // Garantiza que VAGONETA siempre quede en categoría "carreta"
  useEffect(() => {
    if (tm === "vagoneta" && categoria !== "carreta") {
      setCategoria("carreta");
    }
  }, [tm, categoria]);

  const listParams = useMemo(() => {
  const p = { tipoMaquinaria: tm, categoria };
  if (tm === "cabezal" && categoria === "material") p.materialTipo = materialTipo;

  // ⬇️ NUEVO: si hay texto, va como filtro de placa
  if (debouncedQ.trim()) p.q = debouncedQ.trim();

  return p;
}, [tm, categoria, materialTipo, debouncedQ]);


  const load = async () => {
  setLoading(true);
  try {
    const data = await trailersService.list(listParams);

    const items = Array.isArray(data?.items)
      ? data.items
      : Array.isArray(data)
      ? data
      : [];

    setRows(items);

    // ⬇️ NUEVO: usar total del backend si viene; si no, usar length local
    const t =
      typeof data?.total === "number"
        ? data.total
        : Array.isArray(data)
        ? data.length
        : items.length;

    setTotal(t);
  } catch (e) {
    console.error("[TrailersAdmin] list error:", e?.response?.data || e);
    setRows([]);
    setTotal(0);
  } finally {
    setLoading(false);
  }
};

  useEffect(() => {
    load();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [listParams]);

  useEffect(() => {
  setQ("");
  setShowFilters(false);
}, [tm, categoria, materialTipo]);

  // Crear
  const handleCreate = async (e) => {
    e.preventDefault();
    const p = placa.trim().toUpperCase();
    if (!p) return;

    try {
      const payload = {
         placa: p,
         tipoMaquinaria: tm, 
   // en carretas, vagoneta siempre es "carreta"; en cabezal respeta la UI
   categoria: tm === "vagoneta" ? "carreta" : categoria,
   // normaliza materialTipo solo si la categoría es material
   ...(tm === "cabezal" && categoria === "material"
     ? { materialTipo: materialTipo === "fino" ? "plataforma" : materialTipo }
     : {}),

      };
      await trailersService.create(payload);
      setPlaca("");
      await load();
      await showSuccess("Agregado", "Placa registrada.");
    } catch (e) {
      await showError("No se pudo crear la placa");
    }
  };

    const handleCancelCreate = async () => {
    const res = await confirmAction("¿Cancelar?", "Se limpiará el formulario.");
    if (!res.isConfirmed) return;
    //setNombre("");
    setPlaca("");
  };
  
  // Edit
  const startEdit = (r) => {
    setEditingId(r.id);
    setEdit({
      placa: r.placa,
      tipoMaquinaria: r.tipoMaquinaria ?? tm,
      categoria: r.categoria ?? "carreta",
      materialTipo: r.materialTipo ?? null,
    });
  };
  const cancelEdit = () => {
    setEditingId(null);
    setEdit({
      placa: "",
      tipoMaquinaria: "vagoneta",
      categoria: "carreta",
      materialTipo: null,
    });
  };
  const saveEdit = async () => {
    const ok = await confirmAction("¿Guardar cambios?", "");
    if (!ok.isConfirmed) return;

    const payload = {
      placa: (edit.placa || "").trim().toUpperCase(),
      categoria: tm === "vagoneta" ? "carreta" : edit.categoria,
      ...(tm === "cabezal" &&
      (edit.categoria || categoria) === "material"
     ? { materialTipo: (edit.materialTipo ?? "desecho") === "fino" ? "plataforma" : (edit.materialTipo ?? "desecho") }
     : {}),
    };

    try {
      await trailersService.update(editingId, payload);
      await showSuccess("Actualizado", "Cambios guardados.");
      cancelEdit();
      await load();
    } catch (e) {
      await showError("No se pudo actualizar la placa");
    }
  };

  // Delete
  const onDelete = async (id) => {
    const res = await confirmDelete("la placa");
    if (!res.isConfirmed) return;
    await trailersService.remove(id);
    await showSuccess("Eliminada", "Placa eliminada.");
    await load();
  };

  // helpers de estilo para “segmented tabs”
// --- SEGMENTED TABS (look pro) ---
const segWrap =
  "inline-flex gap-2 p-1 rounded-2xl bg-slate-100/70 ring-1 ring-slate-200 backdrop-blur";

const segBase =
  "px-4 py-2 rounded-xl text-sm font-medium transition-all " +
  "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-offset-1 focus-visible:ring-slate-300 " +
  "disabled:opacity-60 disabled:cursor-not-allowed active:scale-[.99]";

// Indigo elegante
const segOn =
  "text-white shadow-sm ring-1 ring-emerald-800/60 " +
  "bg-gradient-to-b from-emerald-600 to-emerald-500 hover:from-emerald-500 hover:to-emerald-400";



const segOff =
  "text-slate-700 bg-white ring-1 ring-slate-200 " +
  "hover:bg-slate-50 hover:ring-slate-300";


  return (
    <Card className="w-full border border-slate-200 shadow-sm rounded-2xl">
      <CardHeader className="pb-3">
        <div className="flex items-center justify-between">
          <CardTitle className="text-xl font-semibold text-slate-800">
            Catálogo de carretas
          </CardTitle>
        </div>
      </CardHeader>

      <CardContent className="space-y-6">
        {/* === Controles por pasos (1-2-3) con ocultar pasos que no aplican === */}
<div className="rounded-2xl border border-slate-200 bg-white/70 backdrop-blur p-4 space-y-4">
  {/* Paso 1: Tipo */}
  <div>
    <div className="flex items-center gap-2 mb-2">
      <span className="inline-flex h-6 w-6 items-center justify-center rounded-full bg-amber-600 text-white text-xs font-bold">1</span>
      <p className="text-[12px] font-semibold tracking-wide text-amber-800">Selecciona el TIPO</p>
    </div>

    <div className="inline-flex gap-2 p-1 rounded-2xl bg-slate-100/70 ring-1 ring-slate-200">
      <button
        type="button"
        className={`px-4 py-2 rounded-xl text-sm font-medium transition-all focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-offset-1
          ${tm === "vagoneta"
            ? "text-white shadow-sm ring-1 ring-indigo-800/60 bg-amber-500 hover:bg-amber-600"
            : "text-slate-700 bg-white ring-1 ring-slate-200 hover:bg-slate-50 hover:ring-slate-300"}`}
        onClick={() => { setTm("vagoneta"); setCategoria("carreta"); }}
      >
        Vagoneta
      </button>

      <button
        type="button"
        className={`px-4 py-2 rounded-xl text-sm font-medium transition-all focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-offset-1
          ${tm === "cabezal"
            ? "text-white shadow-sm ring-1 ring-indigo-800/60 bg-amber-500 hover:bg-amber-600"
            : "text-slate-700 bg-white ring-1 ring-slate-200 hover:bg-slate-50 hover:ring-slate-300"}`}
        onClick={() => { setTm("cabezal"); setCategoria("carreta"); }}
      >
        Cabezal
      </button>
    </div>
  </div>

  {/* Paso 2 y 3: SOLO si es cabezal */}
  {tm === "cabezal" && (
    <>
      {/* Paso 2: Subtipo */}
      <div>
        <div className="flex items-center gap-2 mb-2">
          <span className="inline-flex h-6 w-6 items-center justify-center rounded-full bg-emerald-600 text-white text-xs font-bold">2</span>
          <p className="text-[12px] font-semibold tracking-wide text-emerald-700">Elige SUBTIPO</p>
        </div>

        <div className="inline-flex gap-2 p-1 rounded-2xl bg-slate-100/70 ring-1 ring-slate-200">
          <button
            type="button"
            className={`px-4 py-2 rounded-xl text-sm font-medium transition-all focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-offset-1
              ${categoria === "carreta"
                ? "text-white shadow-sm ring-1 ring-emerald-800/60 bg-gradient-to-b from-emerald-600 to-emerald-500 hover:from-emerald-500 hover:to-emerald-400"
                : "text-slate-700 bg-white ring-1 ring-slate-200 hover:bg-slate-50 hover:ring-slate-300"}`}
            onClick={() => setCategoria("carreta")}
          >
            Carreta
          </button>

          <button
            type="button"
            className={`px-4 py-2 rounded-xl text-sm font-medium transition-all focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-offset-1
              ${categoria === "material"
                ? "text-white shadow-sm ring-1 ring-emerald-800/60 bg-gradient-to-b from-emerald-600 to-emerald-500 hover:from-emerald-500 hover:to-emerald-400"
                : "text-slate-700 bg-white ring-1 ring-slate-200 hover:bg-slate-50 hover:ring-slate-300"}`}
            onClick={() => setCategoria("material")}
          >
            Material
          </button>
        </div>
      </div>

      {/* Paso 3: Tipo de material (solo si subtipo = material) */}
      {categoria === "material" && (
        <div>
          <div className="flex items-center gap-2 mb-2">
            <span className="inline-flex h-6 w-6 items-center justify-center rounded-full bg-slate-700 text-white text-xs font-bold">3</span>
            <p className="text-[12px] font-semibold tracking-wide text-slate-700">Selecciona MATERIAL</p>
          </div>

          <Select value={materialTipo} onValueChange={setMaterialTipo}>
            <SelectTrigger className="h-9 w-[280px] rounded-xl border-slate-300">
              <SelectValue placeholder="Tipo de material" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="desecho">Material desecho (arena/tierra..)</SelectItem>
              <SelectItem value="plataforma">Material fino (cemento/block..)</SelectItem>
            </SelectContent>
          </Select>
        </div>
      )}
    </>
  )}

  {/* Resumen */}
  <div className="pt-3 border-t border-slate-200 flex justify-between items-center">
    <span className="text-xs text-slate-500">
      {tm === "cabezal"
        ? "Sigue los pasos en orden."
        : "Para Vagoneta solo se registra la placa de la carreta."}
    </span>
    <span className="text-xs px-2 py-1 rounded-lg bg-slate-100 text-slate-700">
      {tm === "cabezal"
        ? `Vista: Cabezal → ${categoria === "material" ? `Material (${materialTipo})` : "Carreta"}`
        : "Vista: Vagoneta → carreta"}
    </span>
  </div>
</div>

{/* ----- FILTROS (barra de control) ----- */}
<div className="rounded-2xl border bg-white/60 backdrop-blur px-4 py-3 flex items-center justify-between">
  <div className="flex items-center gap-2">
    <FilterIcon className="h-5 w-5 text-gray-500" />
    <div className="font-medium">
      Filtros del catálogo
      <span className="ml-2 text-sm text-gray-500">
        ({total} {total === 1 ? "registro" : "registros"})
      </span>
    </div>
  </div>

  <div className="flex items-center gap-2">
    <Button
      variant="secondary"
      onClick={() => setShowFilters((v) => !v)}
      className="bg-gray-100 hover:bg-gray-200 text-gray-900"
    >
      {showFilters ? "Ocultar filtros" : "Mostrar filtros"}
      {showFilters ? <ChevronUp className="ml-2 h-4 w-4" /> : <ChevronDown className="ml-2 h-4 w-4" />}
    </Button>

    <Button
      type="button"
      variant="secondary"
      onClick={load}
      title="Recargar catálogo"
      className="p-2 h-9 w-9 rounded-xl bg-gray-100 hover:bg-gray-200"
    >
      <RefreshCcw className="h-4 w-4" />
    </Button>
  </div>
</div>

{showFilters && (
  <div className="mt-4 rounded-2xl border bg-white p-4">
    <div className="flex flex-wrap items-end gap-3">
      <div className="w-64">
        <Label>Buscar por placa</Label>
        <Input
          value={q}
          onChange={(e) => setQ(e.target.value)}
          placeholder="Ej.: SM 1234…"
        />
      </div>

      <Button variant="ghost" onClick={() => setQ("")}>
        Limpiar
      </Button>
    </div>
  </div>
)}

        {/* Formulario crear */}
        <form
          onSubmit={handleCreate}
          className="grid grid-cols-1 md:grid-cols-3 gap-4 items-end bg-white/70 backdrop-blur rounded-2xl border border-slate-200 p-4"
        >
          <div className="md:col-span-2">
            <Label className="text-slate-700">Placa</Label>
            <Input
              value={placa}
              onChange={(e) => setPlaca(e.target.value)}
              placeholder="SM 0000"
              className="mt-1 h-10 rounded-xl border-slate-300"
              required
            />
          </div>
          <div className="ml-auto flex items-center gap-2 shrink-0">
          <Button
              type="button"
              onClick={handleCancelCreate}
              variant="secondary"
              className="bg-gray-200 text-gray-900 hover:bg-gray-300"
            >
              Cancelar
            </Button>
            <Button type="submit" disabled={loading} className="bg-blue-600 hover:bg-blue-700 text-white">
              {loading ? "Guardando..." : "Agregar"}
            </Button>
          </div>
        </form>

        {/* Tabla */}
        <div className="rounded-2xl border border-slate-200 overflow-hidden">
          <div className="overflow-auto max-h-[52vh]">
            <table className="w-full text-sm">
              <thead className="bg-slate-50 sticky top-0 z-10">
                <tr className="text-left text-slate-600">
                  <th className="py-3 px-4">ID</th>
                  <th className="py-3 px-4">Placa</th>
                  {tm === "cabezal" && <th className="py-3 px-4">Categoría</th>}
                  {tm === "cabezal" && categoria === "material" && (
                    <th className="py-3 px-4">Material</th>
                  )}
                  <th className="py-3 px-4 text-right">Acciones</th>
                </tr>
              </thead>
              <tbody className="[&>tr:nth-child(odd)]:bg-white [&>tr:nth-child(even)]:bg-slate-50">
                {rows.map((r) => {
                  const editing = editingId === r.id;
                  return (
                    <tr key={r.id} className="border-t border-slate-200">
                      <td className="py-2 px-4">{r.id}</td>

                      <td className="py-2 px-4">
                        {editing ? (
                          <Input
                            className="h-9 w-48 rounded-xl border-slate-300"
                            value={edit.placa}
                            onChange={(e) =>
                              setEdit((p) => ({ ...p, placa: e.target.value }))
                            }
                          />
                        ) : (
                          <span className="font-medium text-slate-800">
                            {r.placa}
                          </span>
                        )}
                      </td>

                      {tm === "cabezal" && (
                        <td className="py-2 px-4">
                          {editing ? (
                            <Select
                              value={edit.categoria}
                              onValueChange={(v) =>
                                setEdit((p) => ({ ...p, categoria: v }))
                              }
                            >
                              <SelectTrigger className="h-9 w-36 rounded-xl border-slate-300">
                                <SelectValue />
                              </SelectTrigger>
                              <SelectContent>
                                <SelectItem value="carreta">carreta</SelectItem>
                                <SelectItem value="material">material</SelectItem>
                              </SelectContent>
                            </Select>
                          ) : (
                            <span className="text-slate-700">{r.categoria}</span>
                          )}
                        </td>
                      )}

                      {tm === "cabezal" && categoria === "material" && (
                        <td className="py-2 px-4">
                          {editing ? (
                            <Select
                              value={edit.materialTipo ?? "desecho"}
                              onValueChange={(v) =>
                                setEdit((p) => ({ ...p, materialTipo: v }))
                              }
                            >
                              <SelectTrigger className="h-9 w-44 rounded-xl border-slate-300">
                                <SelectValue />
                              </SelectTrigger>
                              <SelectContent>
                                <SelectItem value="desecho">
                                  desecho
                                </SelectItem>
                                <SelectItem value="plataforma">plataforma</SelectItem>
                              </SelectContent>
                            </Select>
                          ) : (
                            <span className="text-slate-700">
                              {r.materialTipo || "—"}
                            </span>
                          )}
                        </td>
                      )}

                      <td className="py-2 px-4">
                        {editing ? (
                          <div className="flex gap-2 justify-end">
                            <button
                              type="button"
                              onClick={saveEdit}
                              className="h-9 w-9 rounded-xl border border-emerald-200 bg-emerald-50 text-emerald-700 hover:bg-emerald-100 flex items-center justify-center"
                            >
                              <Check className="h-4 w-4" />
                            </button>
                            <button
                              type="button"
                              onClick={cancelEdit}
                              className="h-9 w-9 rounded-xl border border-slate-200 bg-white text-slate-700 hover:bg-slate-100 flex items-center justify-center"
                            >
                              <X className="h-4 w-4" />
                            </button>
                          </div>
                        ) : (
                          <div className="flex gap-2 justify-end">
                            <button
                              type="button"
                              onClick={() => startEdit(r)}
                              className="h-9 w-9 rounded-xl text-sky-700 hover:bg-sky-100 flex items-center justify-center"
                              title="Editar"
                            >
                              <Edit className="h-4 w-4" />
                            </button>
                            <button
                              type="button"
                              onClick={() => onDelete(r.id)}
                              className="h-9 w-9 rounded-xl text-red-600 hover:bg-red-50 flex items-center justify-center"
                              title="Eliminar"
                            >
                              <Trash2 className="h-4 w-4" />
                            </button>
                          </div>
                        )}
                      </td>
                    </tr>
                  );
                })}

                {rows.length === 0 && (
                  <tr>
                    <td className="py-8 text-center text-slate-500" colSpan={5}>
                      {loading ? (
                        <div className="flex items-center justify-center gap-2">
                          <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-slate-600" />
                          <span>Cargando catálogo…</span>
                        </div>
                      ) : (
                        <div className="space-y-1">
                          <p className="font-medium">No hay registros</p>
                          <p className="text-xs text-slate-400">
                            {tm === "cabezal" && categoria === "material"
                              ? `Cabezal / material (${materialTipo})`
                              : `${tm} / ${categoria}`}
                          </p>
                        </div>
                      )}
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </div>
      </CardContent>

      {/* Modal paginado (tu componente) */}
      {/*<CatalogDialog open={openDialog} onOpenChange={setOpenDialog} tipoMaquinaria={tm} />*/}
    </Card>
  );
}
