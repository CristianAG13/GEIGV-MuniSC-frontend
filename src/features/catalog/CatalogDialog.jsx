"use client";

import { useEffect, useMemo, useState } from "react";
import {
  Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription
} from "@/components/ui/dialog";
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectTrigger, SelectValue, SelectContent, SelectItem } from "@/components/ui/select";
import { Edit, Trash2, Check, X, RefreshCcw, ChevronLeft, ChevronRight } from "lucide-react";
import trailersService from "@/services/trailersService";
import { confirmAction, confirmDelete, showError, showSuccess } from "@/utils/sweetAlert";

/* debounce simple */
function useDebounced(value, delay = 350) {
  const [debounced, setDebounced] = useState(value);
  useEffect(() => {
    const h = setTimeout(() => setDebounced(value), delay);
    return () => clearTimeout(h);
  }, [value, delay]);
  return debounced;
}

/**
 * Dialog paginado para catálogo de placas.
 * Soporta:
 *  - tipoMaquinaria = "vagoneta" (solo categoria "carreta")
 *  - tipoMaquinaria = "cabezal"  (categorias "carreta" | "material", y si "material" => materialTipo)
 */
export default function CatalogDialog({ open, onOpenChange, tipoMaquinaria }) {
  const TAKE = 12;

  // reglas por tipo
  const isCabezal = tipoMaquinaria === "cabezal";
  const supportsMaterial = isCabezal; // vagoneta NO usa material

  // estado de filtros
  const [categoria, setCategoria] = useState("carreta");       // para vagoneta es fijo "carreta"
  const [materialTipo, setMaterialTipo] = useState("desecho"); // solo si categoria === "material"
  const [q, setQ] = useState("");
  const debouncedQ = useDebounced(q, 350);

  // data/paginación
  const [loading, setLoading] = useState(false);
  const [rows, setRows] = useState([]);
  const [total, setTotal] = useState(0);
  const [skip, setSkip] = useState(0);

  // crear
  const [placa, setPlaca] = useState("");

  // editar
  const [editingId, setEditingId] = useState(null);
  const [edit, setEdit] = useState({ placa: "", categoria: "carreta", materialTipo: null });

  // bloquear categoría a "carreta" cuando es vagoneta
  useEffect(() => {
    if (!supportsMaterial) setCategoria("carreta");
  }, [supportsMaterial]);

  const listParams = useMemo(() => {
    const p = {
      tipoMaquinaria,
      categoria,
      skip,
      take: TAKE,
    };
    if (supportsMaterial && categoria === "material") p.materialTipo = materialTipo;
    if (debouncedQ?.trim()) p.q = debouncedQ.trim();
    return p;
  }, [tipoMaquinaria, categoria, materialTipo, debouncedQ, skip, supportsMaterial]);

  async function load() {
    setLoading(true);
    try {
      const data = await trailersService.list(listParams);
      const items = Array.isArray(data?.items) ? data.items : (Array.isArray(data) ? data : []);
      const count = Number.isFinite(data?.total) ? data.total : items.length;
      setRows(items);
      setTotal(count);
    } catch (e) {
      console.error("[CatalogDialog] list error:", e?.response?.data || e);
      setRows([]);
      setTotal(0);
      // opcional: await showError("No se pudo cargar el catálogo");
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => { load(); /* eslint-disable-next-line */}, [listParams]);
  useEffect(() => { setSkip(0); }, [tipoMaquinaria, categoria, materialTipo, debouncedQ]);

  const page = Math.floor(skip / TAKE) + 1;
  const totalPages = Math.max(1, Math.ceil(total / TAKE));

  // crear
  async function handleCreate(e) {
    e.preventDefault();
    if (!placa.trim()) return;
    try {
      const payload = {
        placa: placa.trim().toUpperCase(),
        categoria,
        materialTipo: supportsMaterial && categoria === "material" ? materialTipo : undefined,
      };
      await trailersService.create(payload);
      setPlaca("");
      setSkip(0);
      await load();
      await showSuccess("Agregado", "Placa registrada.");
    } catch (err) {
      await showError("No se pudo crear la placa");
    }
  }

  // editar
  function startEdit(r) {
    setEditingId(r.id);
    setEdit({
      placa: r.placa,
      categoria: r.categoria || "carreta",
      materialTipo: r.materialTipo ?? null,
    });
  }
  function cancelEdit() {
    setEditingId(null);
    setEdit({ placa: "", categoria: "carreta", materialTipo: null });
  }
  async function saveEdit() {
    const ok = await confirmAction("¿Guardar cambios?", "");
    if (!ok.isConfirmed) return;
    await trailersService.update(editingId, {
      placa: edit.placa,
      categoria: supportsMaterial ? edit.categoria : "carreta",
      materialTipo: supportsMaterial && edit.categoria === "material" ? edit.materialTipo : undefined,
    });
    await showSuccess("Actualizado", "Cambios guardados");
    cancelEdit();
    await load();
  }

  // eliminar
  async function onDelete(id) {
    const res = await confirmDelete("la placa");
    if (!res.isConfirmed) return;
    await trailersService.remove(id);
    await showSuccess("Eliminada", "Placa eliminada");
    const willBeEmpty = rows.length === 1 && skip > 0;
    if (willBeEmpty) setSkip(Math.max(0, skip - TAKE));
    await load();
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-6xl p-0 overflow-hidden">
        <DialogHeader className="px-6 pt-6">
          <DialogTitle className="text-xl capitalize">
            {tipoMaquinaria} — Catálogo de placas
          </DialogTitle>
          <DialogDescription>
            Gestiona placas con vista paginada, filtros y edición.
          </DialogDescription>
        </DialogHeader>

        <div className="px-6 pb-6">
          {/* Tabs: si es vagoneta solo muestro Carreta */}
          <Tabs value={categoria} onValueChange={setCategoria} className="space-y-4">
            <TabsList className="grid w-full grid-cols-2 rounded-2xl bg-gray-100 p-1">
              <TabsTrigger
                value="carreta"
                className="rounded-xl data-[state=active]:bg-white data-[state=active]:shadow"
              >
                Carreta
              </TabsTrigger>

              {/* Solo cabezal tiene "Material" */}
              {supportsMaterial && (
                <TabsTrigger
                  value="material"
                  className="rounded-xl data-[state=active]:bg-white data-[state=active]:shadow"
                >
                  Material
                </TabsTrigger>
              )}
            </TabsList>

            <div className="grid grid-cols-1 lg:grid-cols-12 gap-4">
              {/* Lateral: filtros/crear */}
              <Card className="lg:col-span-4 border-0 shadow-sm bg-white/70 backdrop-blur">
                <CardHeader><CardTitle className="text-base">Filtros y creación</CardTitle></CardHeader>
                <CardContent className="space-y-4">
                  {supportsMaterial && categoria === "material" && (
                    <div>
                      <Label>Tipo de material</Label>
                      <Select value={materialTipo} onValueChange={setMaterialTipo}>
                        <SelectTrigger><SelectValue placeholder="Seleccione" /></SelectTrigger>
                        <SelectContent>
                          <SelectItem value="desecho">Desecho (boletas)</SelectItem>
                          <SelectItem value="plataforma">Plataforma (cemento/blocks)</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                  )}

                  <div>
                    <Label>Buscar</Label>
                    <Input
                      value={q}
                      onChange={(e) => setQ(e.target.value)}
                      placeholder="Filtrar por placa…"
                    />
                  </div>

                  <div className="flex items-center gap-2">
                    <Button
                      type="button"
                      variant="secondary"
                      onClick={() => { setQ(""); setSkip(0); }}
                      className="bg-gray-100 hover:bg-gray-200"
                    >
                      Limpiar
                    </Button>
                    <Button variant="secondary" onClick={load} className="gap-2">
                      <RefreshCcw className="h-4 w-4" /> Recargar
                    </Button>
                  </div>

                  <form onSubmit={handleCreate} className="space-y-2 pt-2 border-t">
                    <Label>Nueva placa</Label>
                    <Input
                      value={placa}
                      onChange={(e) => setPlaca(e.target.value)}
                      placeholder="SM 0000"
                      required
                    />
                    <Button type="submit" className="w-full">Agregar</Button>
                  </form>
                </CardContent>
              </Card>

              {/* Derecha: grilla + paginación */}
              <div className="lg:col-span-8 space-y-3">
                <div className="flex items-center justify-between">
                  <div className="text-sm text-gray-600">
                    {loading ? "Cargando…" : `Página ${page} de ${totalPages} (${total} total)`}
                  </div>
                  <div className="flex gap-2">
                    <Button
                      variant="secondary"
                      disabled={skip <= 0}
                      onClick={() => setSkip(Math.max(0, skip - TAKE))}
                      className="gap-1"
                    >
                      <ChevronLeft className="h-4 w-4" /> Anterior
                    </Button>
                    <Button
                      variant="secondary"
                      disabled={skip + TAKE >= total}
                      onClick={() => setSkip(skip + TAKE)}
                      className="gap-1"
                    >
                      Siguiente <ChevronRight className="h-4 w-4" />
                    </Button>
                  </div>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-3">
                  {rows.map((r) => {
                    const editing = editingId === r.id;
                    return (
                      <Card key={r.id} className="border-0 shadow-sm hover:shadow-md transition">
                        <CardHeader className="pb-2">
                          <CardTitle className="text-sm flex items-center justify-between">
                            <span className="font-semibold tracking-wide">{r.placa}</span>
                            <span className="text-xs rounded-full px-2 py-0.5 bg-gray-100 text-gray-700">
                              {r.categoria}{r.materialTipo ? ` • ${r.materialTipo}` : ""}
                            </span>
                          </CardTitle>
                        </CardHeader>
                        <CardContent className="space-y-2">
                          {editing ? (
                            <div className="space-y-2">
                              <Label>Placa</Label>
                              <Input
                                className="h-8"
                                value={edit.placa}
                                onChange={(e) => setEdit((p) => ({ ...p, placa: e.target.value }))}
                              />

                              {/* Si es cabezal, permitir cambiar categoria/material */}
                              {supportsMaterial && (
                                <>
                                  <Label>Categoría</Label>
                                  <Select
                                    value={edit.categoria}
                                    onValueChange={(v) => setEdit((p) => ({ ...p, categoria: v }))}
                                  >
                                    <SelectTrigger className="h-8"><SelectValue /></SelectTrigger>
                                    <SelectContent>
                                      <SelectItem value="carreta">carreta</SelectItem>
                                      <SelectItem value="material">material</SelectItem>
                                    </SelectContent>
                                  </Select>

                                  {edit.categoria === "material" && (
                                    <>
                                      <Label>Material</Label>
                                      <Select
                                        value={edit.materialTipo ?? "desecho"}
                                        onValueChange={(v) => setEdit((p) => ({ ...p, materialTipo: v }))}
                                      >
                                        <SelectTrigger className="h-8"><SelectValue /></SelectTrigger>
                                        <SelectContent>
                                          <SelectItem value="desecho">desecho</SelectItem>
                                          <SelectItem value="plataforma">plataforma</SelectItem>
                                        </SelectContent>
                                      </Select>
                                    </>
                                  )}
                                </>
                              )}

                              <div className="flex gap-2 pt-1">
                                <Button className="gap-1" onClick={saveEdit}><Check className="h-4 w-4" /> Guardar</Button>
                                <Button variant="secondary" onClick={cancelEdit}><X className="h-4 w-4" /> Cancelar</Button>
                              </div>
                            </div>
                          ) : (
                            <div className="flex items-center justify-end gap-3">
                              <button
                                type="button"
                                onClick={() => startEdit(r)}
                                className="h-9 w-9 rounded-xl text-blue-700 hover:bg-blue-100 flex items-center justify-center"
                              >
                                <Edit className="h-4 w-4" />
                              </button>
                              <button
                                type="button"
                                onClick={() => onDelete(r.id)}
                                className="h-9 w-9 rounded-xl text-red-600 hover:bg-red-50 flex items-center justify-center"
                              >
                                <Trash2 className="h-4 w-4" />
                              </button>
                            </div>
                          )}
                        </CardContent>
                      </Card>
                    );
                  })}

                  {!loading && rows.length === 0 && (
                    <div className="col-span-full text-center text-gray-500 py-10">
                      Sin registros
                    </div>
                  )}
                </div>
              </div>
            </div>
          </Tabs>
        </div>
      </DialogContent>
    </Dialog>
  );
}
