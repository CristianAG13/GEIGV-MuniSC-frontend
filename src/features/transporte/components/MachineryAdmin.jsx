
"use client";

import { useEffect, useMemo, useState } from "react";
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Label } from "@/components/ui/label";
import { useToast } from "@/hooks/use-toast";
import machineryService from "@/services/machineryService";
import { machineryFields } from "@/utils/machinery-fields";
 import {
   confirmDelete,
   confirmAction,
   showSuccess,
   showError,
 } from "@/utils/sweetAlert";

export default function MachineryAdmin() {
  const ALL_ROLES = "__ALL_ROLES__";
  const { toast } = useToast();

  // -------- Lista ----------
  const [loading, setLoading] = useState(false);
  const [list, setList] = useState([]);

  // -------- Crear (independiente) ----------
  const [tipo, setTipo] = useState("");
  const [rol, setRol] = useState("");
  const [placa, setPlaca] = useState("");
  const [esPropietaria, setEsPropietaria] = useState(false);

  // -------- Filtros (independientes del crear) ----------
  const [viewTipo, setViewTipo] = useState(""); // ya NO existe "Todos"
  const [viewRol, setViewRol] = useState("");   // "" = todas
  const [searchPlaca, setSearchPlaca] = useState("");

  // Opciones maestras desde machineryFields
  const TIPOS = useMemo(() => Object.keys(machineryFields), []);
  const VARIANTES = useMemo(() => {
    const map = {};
    for (const t of Object.keys(machineryFields)) {
      map[t] = Object.keys(machineryFields[t]?.variantes || {});
    }
    return map;
  }, []);

  // edición inline
  const [editingId, setEditingId] = useState(null);
  const [editForm, setEditForm] = useState({ tipo: "", rol: "", placa: "", esPropietaria: false });

  const hasVariantCreate = useMemo(
    () => Boolean(machineryFields[tipo]?.variantes),
    [tipo]
  );

  const hasVariantEdit = useMemo(
    () => Boolean(machineryFields[editForm.tipo]?.variantes),
    [editForm.tipo]
  );

  const rolOptionsEdit = useMemo(
    () =>
      machineryFields[editForm.tipo]?.variantes
        ? Object.keys(machineryFields[editForm.tipo].variantes)
        : [],
    [editForm.tipo]
  );

  // opciones de rol para el filtro, dependen del tipo elegido
  const rolOptionsFilter = useMemo(
    () =>
      viewTipo && machineryFields[viewTipo]?.variantes
        ? Object.keys(machineryFields[viewTipo].variantes)
        : [],
    [viewTipo]
  );

  // lista filtrada + ordenada
  const filtered = useMemo(() => {
    let data = Array.isArray(list) ? [...list] : [];

    if (viewTipo) {
      data = data.filter((r) => (r.tipo || "").toLowerCase() === viewTipo.toLowerCase());
    }
    if (viewRol) {
      const wanted = viewRol.toLowerCase();
      data = data.filter((r) => {
        const arr = Array.isArray(r.roles) ? r.roles.map((x) => String(x).toLowerCase()) : [];
        const legacy = (r.rol || r.role || "").toLowerCase();
        return arr.includes(wanted) || legacy === wanted;
      });
    }
    if (searchPlaca.trim()) {
      const q = searchPlaca.trim().toLowerCase();
      data = data.filter((r) => String(r.placa || r.plate || "").toLowerCase().includes(q));
    }

    // ordenar por tipo y luego placa
    data.sort(
      (a, b) =>
        (a.tipo || "").localeCompare(b.tipo || "") ||
        String(a.placa || a.plate || "").localeCompare(String(b.placa || b.plate || ""))
    );
    return data;
  }, [list, viewTipo, viewRol, searchPlaca]);

  // Mostrar columna "Rol" solo cuando aplica
  const showRoleCol = useMemo(() => {
    if (viewTipo && machineryFields[viewTipo]?.variantes) return true; // p.ej. vagoneta, cabezal
    return filtered.some((m) => Array.isArray(m.roles) && m.roles.length > 0);
  }, [viewTipo, filtered]);

  const load = async () => {
    try {
      setLoading(true);
      const data = await machineryService.getAllMachinery();
      setList(Array.isArray(data) ? data : []);
    } catch (e) {
      console.error("[MachineryAdmin] getAllMachinery error:", e?.response?.data || e);
      toast({
        title: "No se pudo cargar el catálogo",
        description: "Verifica tu conexión o el inicio de sesión.",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    load();
  }, []);

  // Al montar (o si cambia TIPOS) elegir el primer tipo por defecto
  useEffect(() => {
    if (!viewTipo && TIPOS.length) {
      setViewTipo(TIPOS[0]);
    }
  }, [TIPOS, viewTipo]);

  // ------- helpers reset -------
  const resetCreateForm = () => {
    setTipo("");
    setRol("");
    setPlaca("");
    setEsPropietaria(false);
  };

  // Ya no cambiamos el tipo; solo limpiamos rol/búsqueda
  const resetFilters = () => {
    setViewRol("");
    setSearchPlaca("");
  };

  // ---------- Crear ----------
  const handleCreate = async (e) => {
    e.preventDefault();
    try {
      if (!tipo || !placa) {
        toast({
          title: "Campos requeridos",
          description: "Tipo y placa son obligatorios.",
          variant: "destructive",
        });
        return;
      }
      // Mantener compatibilidad: `rol` string (no array)
      const payload = {
        tipo,
        placa,
        ...(machineryFields[tipo]?.variantes ? { rol: rol || null } : {}),
        esPropietaria: Boolean(esPropietaria),
      };

      const created = await machineryService.createMachinery(payload);
      setList((prev) => [created, ...prev]);
      toast({ title: "Maquinaria agregada", description: "Se creó correctamente." });

      // después de agregar: resetear crear + filtros
      resetCreateForm();
      resetFilters();
    } catch (e) {
      console.error("[MachineryAdmin] createMachinery error:", e?.response?.data || e);
      const msg = e?.response?.data?.message || e?.response?.data?.error || "No se pudo crear la maquinaria.";
      toast({ title: "Error", description: String(msg), variant: "destructive" });
    }
  };

  // ---------- Cancelar creación ----------
  // const handleCancelCreate = () => {
  //   resetCreateForm();
  //   resetFilters();
  // };

  const handleCancelCreate = async () => {
  const res = await confirmAction(
    "¿Cancelar?",
    "Se perderán los cambios no guardados.",
    { icon: "warning", confirmButtonText: "Sí, cancelar" }
  );
  if (!res.isConfirmed) return;
  resetCreateForm();
  resetFilters();
};


  // ---------- Editar ----------
  const startEdit = (row) => {
    setEditingId(row.id);
    setEditForm({
      tipo: row.tipo ?? "",
      rol: row.rol ?? row.role ?? "",
      placa: row.placa ?? row.plate ?? "",
      esPropietaria: Boolean(row.esPropietaria),
    });
  };

  const cancelEdit = () => {
    setEditingId(null);
    setEditForm({ tipo: "", rol: "", placa: "", esPropietaria: false });
  };

  const saveEdit = async () => {
  const res = await confirmAction("¿Guardar cambios?", "", { confirmButtonText: "Guardar" });
  if (!res.isConfirmed) return;

  try {
    // … tu payload/llamada existente …
    await showSuccess("Actualizado", "Cambios guardados correctamente.");
    cancelEdit();
  } catch (e) {
    console.error("[MachineryAdmin] updateMachinery error:", e?.response?.data || e);
    await showError("Error al actualizar", e?.response?.data?.message || "No se pudo actualizar.");
  }
};

  const handleDelete = async (id) => {
  const res = await confirmDelete("la maquinaria seleccionada");
  if (!res.isConfirmed) return;

  try {
    await machineryService.deleteMachinery(id);
    setList((prev) => prev.filter((it) => it.id !== id));
    await showSuccess("Eliminada", "La maquinaria fue eliminada.");
  } catch (e) {
    console.error("[MachineryAdmin] deleteMachinery error:", e?.response?.data || e);
    await showError("Error al eliminar", e?.response?.data?.message || "No se pudo eliminar.");
  }
};


  const roleCellContent = (row, isEditing) => {
    if (isEditing) {
      return hasVariantEdit ? (
        <Select value={editForm.rol} onValueChange={(v) => setEditForm((p) => ({ ...p, rol: v }))}>
          <SelectTrigger className="h-8">
            <SelectValue placeholder="Rol/variante" />
          </SelectTrigger>
          <SelectContent>
            {rolOptionsEdit.map((r) => (
              <SelectItem key={r} value={r}>
                {r}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      ) : (
        <span className="text-gray-400">—</span>
      );
    }
    if (Array.isArray(row.roles) && row.roles.length) return row.roles.join(", ");
    return row.rol ? row.rol : <span className="text-gray-400">—</span>;
  };

  const colSpan = showRoleCol ? 6 : 5;

  return (
    <Card className="w-full">
      <CardHeader>
        <CardTitle>Catálogo de Maquinaria</CardTitle>
      </CardHeader>

      <CardContent className="space-y-6">
        {/* ----------- CREAR (independiente) ----------- */}
        <form onSubmit={handleCreate} className="grid grid-cols-1 md:grid-cols-4 gap-4 items-end">
          <div>
            <Label>Tipo</Label>
            <Select
              value={tipo}
              onValueChange={(v) => {
                setTipo(v);
                setRol("");
              }}
            >
              <SelectTrigger>
                <SelectValue placeholder="Seleccionar tipo" />
              </SelectTrigger>
              <SelectContent>
                {TIPOS.map((t) => (
                  <SelectItem key={t} value={t}>
                    {t}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          {hasVariantCreate && (
            <div>
              <Label>Variante</Label>
              <Select value={rol} onValueChange={setRol}>
                <SelectTrigger>
                  <SelectValue placeholder="Seleccionar variante" />
                </SelectTrigger>
                <SelectContent>
                  {VARIANTES[tipo].map((r) => (
                    <SelectItem key={r} value={r}>
                      {r}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          )}

          <div>
            <Label>Placa</Label>
            <Input value={placa} onChange={(e) => setPlaca(e.target.value)} placeholder="SM 8772" required />
          </div>


          <div className="flex gap-2 items-center md:justify-end">
  <label className="flex items-center gap-2 text-sm">
    <input
      type="checkbox"
      checked={esPropietaria}
      onChange={(e) => setEsPropietaria(e.target.checked)}
    />
    Es propietaria
  </label>

  {/* Cancelar gris */}
  <Button
    type="button"
    onClick={handleCancelCreate}
    variant="secondary"
    className="bg-gray-200 text-gray-900 hover:bg-gray-300"
  >
    Cancelar
  </Button>

  {/* Agregar azul */}
  <Button
    type="submit"
    disabled={loading}
    className="bg-blue-600 hover:bg-blue-700 text-white"
  >
    {loading ? "Guardando..." : "Agregar"}
  </Button>
</div>

        </form>

        {/* ----------- FILTROS (independientes) ----------- */}
        <div className="flex flex-wrap items-end gap-3">
          <div className="w-40">
            <Label>Tipo (vista)</Label>
            <Select
              value={viewTipo}
              onValueChange={(v) => {
                setViewTipo(v);
                setViewRol("");
              }}
            >
              <SelectTrigger>
                <SelectValue placeholder="Seleccionar tipo" />
              </SelectTrigger>
              <SelectContent>
                {TIPOS.map((t) => (
                  <SelectItem key={t} value={t}>
                    {t}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          {viewTipo && rolOptionsFilter.length > 0 && (
  <div className="w-40">
    <Label>Variante</Label>
    <Select
      value={viewRol ? viewRol : ALL_ROLES}
      onValueChange={(v) => setViewRol(v === ALL_ROLES ? "" : v)}
    >
      <SelectTrigger>
        <SelectValue placeholder="Todas" />
      </SelectTrigger>
      <SelectContent>
        <SelectItem value={ALL_ROLES}>Todas</SelectItem>
        {rolOptionsFilter.map((r) => (
          <SelectItem key={r} value={r}>
            {r}
          </SelectItem>
        ))}
      </SelectContent>
    </Select>
  </div>
)}

          <div className="w-48">
            <Label>Buscar placa</Label>
            <Input value={searchPlaca} onChange={(e) => setSearchPlaca(e.target.value)} placeholder="SM 8772…" />
          </div>

          <Button variant="ghost" onClick={resetFilters}>
            Limpiar filtros
          </Button>
        </div>

        {/* ----------- TABLA ----------- */}
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="text-left border-b">
                <th className="py-2 pr-4">ID</th>
                <th className="py-2 pr-4">Tipo</th>
                {showRoleCol && <th className="py-2 pr-4">Rol</th>}
                <th className="py-2 pr-4">Placa</th>
                <th className="py-2 pr-4">Propietaria</th>
                <th className="py-2 pr-4" />
              </tr>
            </thead>
            <tbody>
              {filtered.map((row) => {
                const isEditing = editingId === row.id;
                return (
                  <tr key={row.id} className="border-b">
                    <td className="py-2 pr-4">{row.id}</td>

                    {/* tipo */}
                    <td className="py-2 pr-4">
                      {isEditing ? (
                        <Select
                          value={editForm.tipo}
                          onValueChange={(v) =>
                            setEditForm((p) => ({
                              ...p,
                              tipo: v,
                              rol: machineryFields[v]?.variantes ? p.rol : "",
                            }))
                          }
                        >
                          <SelectTrigger className="h-8">
                            <SelectValue placeholder="Tipo" />
                          </SelectTrigger>
                          <SelectContent>
                            {TIPOS.map((t) => (
                              <SelectItem key={t} value={t}>
                                {t}
                              </SelectItem>
                            ))}
                          </SelectContent>
                        </Select>
                      ) : (
                        row.tipo
                      )}
                    </td>

                    {/* rol (solo si aplica) */}
                    {showRoleCol && <td className="py-2 pr-4">{roleCellContent(row, isEditing)}</td>}

                    {/* placa */}
                    <td className="py-2 pr-4">
                      {isEditing ? (
                        <Input
                          className="h-8"
                          value={editForm.placa}
                          onChange={(e) => setEditForm((p) => ({ ...p, placa: e.target.value }))}
                        />
                      ) : (
                        row.placa ?? row.plate
                      )}
                    </td>

                    {/* propietaria */}
                    <td className="py-2 pr-4">
                      {isEditing ? (
                        <label className="flex items-center gap-2">
                          <input
                            type="checkbox"
                            checked={Boolean(editForm.esPropietaria)}
                            onChange={(e) =>
                              setEditForm((p) => ({ ...p, esPropietaria: e.target.checked }))
                            }
                          />
                          <span className="text-xs">Es propietaria</span>
                        </label>
                      ) : row.esPropietaria ? (
                        "Sí"
                      ) : (
                        "No"
                      )}
                    </td>

                    {/* acciones */}
                    <td className="py-2 pr-4 text-right">
                      {isEditing ? (
                        <div className="flex gap-2 justify-end">
  {/* Guardar azul */}
  <Button
    size="sm"
    onClick={saveEdit}
    className="bg-blue-600 hover:bg-blue-700 text-white"
  >
    Guardar
  </Button>

  {/* Cancelar gris */}
  <Button
    size="sm"
    onClick={cancelEdit}
    variant="secondary"
    className="bg-gray-200 text-gray-900 hover:bg-gray-300"
  >
    Cancelar
  </Button>
</div>

                      ) : (
                        <div className="flex gap-2 justify-end">
                          <Button size="sm" variant="secondary" onClick={() => startEdit(row)}>
                            Editar
                          </Button>
                          <Button size="sm" variant="destructive" onClick={() => handleDelete(row.id)}>
                            Eliminar
                          </Button>
                        </div>
                      )}
                    </td>
                  </tr>
                );
              })}

              {filtered.length === 0 && (
                <tr>
                  <td className="py-4 text-center text-gray-500" colSpan={colSpan}>
                    {list.length === 0 ? "Sin maquinarias" : "No hay resultados con los filtros aplicados"}
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </CardContent>
    </Card>
  );
}
