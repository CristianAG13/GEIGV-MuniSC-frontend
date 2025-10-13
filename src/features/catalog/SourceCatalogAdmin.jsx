
"use client";

import { useEffect, useState } from "react";
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Edit, Trash2, Check, X, Filter as FilterIcon, RefreshCcw, ChevronDown, ChevronUp } from "lucide-react";
import sourceService from "@/services/sourceService";
import { confirmDelete, confirmAction, showSuccess, showError } from "@/utils/sweetAlert";

/* ---------- pequeño hook de debounce ---------- */
function useDebounced(value, delay = 350) {
  const [debounced, setDebounced] = useState(value);
  useEffect(() => {
    const h = setTimeout(() => setDebounced(value), delay);
    return () => clearTimeout(h);
  }, [value, delay]);
  return debounced;
}

export default function SourceCatalogAdmin({ tipo, title }) {
  const TAKE = 15;

  const [loading, setLoading] = useState(false);
  const [rows, setRows] = useState([]);
  const [total, setTotal] = useState(0);
  const [skip, setSkip] = useState(0);

  // crear
  const [nombre, setNombre] = useState("");

  // filtros UI
  const [showFilters, setShowFilters] = useState(false);
  const [q, setQ] = useState("");
  const debouncedQ = useDebounced(q, 350); // <- usamos la versión debounced

  // edición inline
  const [editingId, setEditingId] = useState(null);
  const [editNombre, setEditNombre] = useState("");

  const page = Math.floor(skip / TAKE) + 1;
  const totalPages = Math.max(1, Math.ceil(total / TAKE));

  const load = async () => {
    setLoading(true);
    try {
      const { items, total } = await sourceService.list({
        tipo,
        q: debouncedQ.trim() || undefined,   // <- filtra con el texto debounced
        skip,
        take: TAKE,
      });
      setRows(Array.isArray(items) ? items : []);
      setTotal(total || 0);
    } catch (e) {
      console.error("[SourceCatalogAdmin] list error:", e?.response?.data || e);
      await showError("No se pudo cargar el catálogo");
    } finally {
      setLoading(false);
    }
  };

  // si cambia el tipo, vuelve a la primera página
  useEffect(() => {
    setSkip(0);
  }, [tipo]);

  // recarga cuando cambie tipo, página o el texto (debounced)
  useEffect(() => {
    load();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [tipo, skip, debouncedQ]);

  // ===== crear =====
  const handleCreate = async (e) => {
    e.preventDefault();
    if (!nombre.trim()) return;
    try {
      setLoading(true);
      await sourceService.create({ tipo, nombre: nombre.trim() });
      setNombre("");
      setSkip(0);
      await load();
      await showSuccess("Agregado", "Registro creado correctamente");
    } catch (e) {
      console.error("[SourceCatalogAdmin] create error:", e?.response?.data || e);
      await showError("No se pudo crear");
    } finally {
      setLoading(false);
    }
  };

  const handleCancelCreate = async () => {
    const res = await confirmAction("¿Cancelar?", "Se limpiará el formulario.");
    if (!res.isConfirmed) return;
    setNombre("");
  };

  // ===== editar =====
  const startEdit = (row) => {
    setEditingId(row.id);
    setEditNombre(row.nombre || "");
  };
  const cancelEdit = () => {
    setEditingId(null);
    setEditNombre("");
  };
  const saveEdit = async () => {
    const res = await confirmAction("¿Guardar cambios?", "", { confirmButtonText: "Guardar" });
    if (!res.isConfirmed) return;
    try {
      setLoading(true);
      await sourceService.update(editingId, { nombre: editNombre.trim() });
      cancelEdit();
      await load();
      await showSuccess("Actualizado", "Cambios guardados correctamente.");
    } catch (e) {
      console.error("[SourceCatalogAdmin] update error:", e?.response?.data || e);
      await showError("No se pudo actualizar");
    } finally {
      setLoading(false);
    }
  };

  // ===== eliminar =====
  const handleDelete = async (row) => {
    const res = await confirmDelete(`el registro "${row?.nombre ?? ""}"`);
    if (!res.isConfirmed) return;
    try {
      setLoading(true);
      await sourceService.remove(row.id);
      const willBeEmpty = rows.length === 1 && skip > 0;
      if (willBeEmpty) setSkip(Math.max(0, skip - TAKE));
      await load();
      await showSuccess("Eliminado", "Registro eliminado.");
    } catch (e) {
      console.error("[SourceCatalogAdmin] delete error:", e?.response?.data || e);
      await showError("No se pudo eliminar");
    } finally {
      setLoading(false);
    }
  };

  // ===== render =====
  return (
    <Card className="w-full">
      <CardHeader>
        <CardTitle>{title}</CardTitle>
      </CardHeader>

      <CardContent className="space-y-6">
        {/* ----- CREAR ----- */}
        <form
          onSubmit={handleCreate}
          className="flex flex-col gap-3 md:flex-row md:items-end md:gap-4 md:flex-nowrap"
        >
          <div className="md:flex-1 md:min-w-[22rem]">
            <Label>Nombre</Label>
            <Input
              value={nombre}
              onChange={(e) => setNombre(e.target.value)}
              placeholder={tipo === "rio" ? "Ej.: Río Blanco" : "Ej.: Tajo La Esperanza"}
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

        {/* ----- FILTROS ----- */}
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
                <Label>Buscar por nombre</Label>
                <Input
                  value={q}
                  onChange={(e) => {
                    setQ(e.target.value);
                    setSkip(0); // vuelve a la primera página al escribir
                  }}
                  placeholder="Ej.: Río Blanco..."
                />
              </div>

              {/* Ya no hay botón “Aplicar filtros” */}
              <Button
                variant="ghost"
                onClick={() => {
                  setQ("");
                  setSkip(0);
                }}
              >
                Limpiar
              </Button>
            </div>
          </div>
        )}

        {/* ----- TABLA ----- */}
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="text-left border-b">
                <th className="py-2 pr-4 w-16">ID</th>
                <th className="py-2 pr-4">Nombre</th>
                <th className="py-2 pr-4 text-right w-24">Acciones</th>
                <th className="py-2 pr-4" />
              </tr>
            </thead>
            <tbody>
              {rows.map((r) => {
                const isEditing = editingId === r.id;
                return (
                  <tr key={r.id} className="border-b">
                    <td className="py-2 pr-4">{r.id}</td>

                    <td className="py-2 pr-4">
                      {isEditing ? (
                        <Input
                          className="h-8"
                          value={editNombre}
                          onChange={(e) => setEditNombre(e.target.value)}
                        />
                      ) : (
                        r.nombre
                      )}
                    </td>

                    <td className="py-2 pr-4 text-right">
                      {isEditing ? (
                        <div className="flex gap-2 justify-end">
                          <button
                            type="button"
                            onClick={saveEdit}
                            className="h-9 w-9 rounded-xl border border-green-100 bg-green-50 text-green-700 hover:bg-green-100 flex items-center justify-center"
                          >
                            <Check className="h-4 w-4" />
                          </button>
                          <button
                            type="button"
                            onClick={cancelEdit}
                            className="h-9 w-9 rounded-xl border border-gray-200 bg-gray-50 text-gray-700 hover:bg-gray-100 flex items-center justify-center"
                          >
                            <X className="h-4 w-4" />
                          </button>
                        </div>
                      ) : (
                        <div className="flex gap-3 justify-end">
                          <button
                            type="button"
                            onClick={() => startEdit(r)}
                            className="h-9 w-9 rounded-xl text-blue-700 hover:bg-blue-100 flex items-center justify-center"
                          >
                            <Edit className="h-4 w-4" />
                          </button>
                          <button
                            type="button"
                            onClick={() => handleDelete(r)}
                            className="h-9 w-9 rounded-xl text-red-600 hover:text-red-700 hover:bg-red-50 flex items-center justify-center"
                          >
                            <Trash2 className="h-4 w-4" />
                          </button>
                        </div>
                      )}
                    </td>
                    <td className="py-2 pr-4" />
                  </tr>
                );
              })}

              {rows.length === 0 && (
                <tr>
                  <td className="py-4 text-center text-gray-500" colSpan={4}>
                    {loading ? "Cargando…" : "Sin registros"}
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>

        {/* ----- Paginación ----- */}
        <div className="flex items-center justify-between">
          <span className="text-sm text-gray-600">
            Página {page} de {totalPages}
          </span>
          <div className="flex gap-2">
            <Button
              variant="secondary"
              disabled={skip <= 0}
              onClick={() => setSkip(Math.max(0, skip - TAKE))}
            >
              Anterior
            </Button>
            <Button
              variant="secondary"
              disabled={skip + TAKE >= total}
              onClick={() => setSkip(skip + TAKE)}
            >
              Siguiente
            </Button>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
