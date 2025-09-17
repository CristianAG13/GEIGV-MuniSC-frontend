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
import MultiSelect from "@/features/transporte/components/MultiSelect";
import { confirmDelete, confirmAction, showSuccess, showError } from "@/utils/sweetAlert";

export default function MachineryAdmin() {
  const ALL_ROLES = "__ALL_ROLES__";
  const { toast } = useToast();

  // catálogo
  const [loading, setLoading] = useState(false);
  const [list, setList] = useState([]);

  // crear
  const [tipo, setTipo] = useState("");
  const [rolesSel, setRolesSel] = useState([]);
  const [placa, setPlaca] = useState("");
  const [esPropietaria, setEsPropietaria] = useState(false);

  // filtros
  const [viewTipo, setViewTipo] = useState("");
  const [viewRol, setViewRol] = useState("");
  const [searchPlaca, setSearchPlaca] = useState("");

  // edición
  const [editingId, setEditingId] = useState(null);
  const [editForm, setEditForm] = useState({ tipo: "", roles: [], placa: "", esPropietaria: false });

  // opciones maestras
  const TIPOS = useMemo(() => Object.keys(machineryFields), []);
  const VARIANTES = useMemo(() => {
    const map = {};
    for (const t of Object.keys(machineryFields)) {
      map[t] = Object.keys(machineryFields[t]?.variantes || {});
    }
    return map;
  }, []);

  const hasVariantCreate = useMemo(() => Boolean(machineryFields[tipo]?.variantes), [tipo]);
  const hasVariantEdit = useMemo(() => Boolean(machineryFields[editForm.tipo]?.variantes), [editForm.tipo]);

  const rolOptionsEdit = useMemo(
    () => (machineryFields[editForm.tipo]?.variantes ? Object.keys(machineryFields[editForm.tipo].variantes) : []),
    [editForm.tipo]
  );

  const rolOptionsFilter = useMemo(
    () => (viewTipo && machineryFields[viewTipo]?.variantes ? Object.keys(machineryFields[viewTipo].variantes) : []),
    [viewTipo]
  );

  // helpers normalización
  const toStringRoles = (roles) =>
    Array.isArray(roles)
      ? roles.map((x) => (typeof x === "string" ? x : x?.rol)).filter(Boolean)
      : [];

  const normalizeRow = (row) => ({ ...row, roles: toStringRoles(row?.roles) });

  // cargar catálogo
  const load = async () => {
    try {
      setLoading(true);
      const data = await machineryService.getAllMachinery();
      const normalized = Array.isArray(data) ? data.map(normalizeRow) : [];
      setList(normalized);
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

  useEffect(() => {
    if (!viewTipo && TIPOS.length) setViewTipo(TIPOS[0]);
  }, [TIPOS, viewTipo]);

  const resetCreateForm = () => {
    setTipo("");
    setRolesSel([]);
    setPlaca("");
    setEsPropietaria(false);
  };

  const resetFilters = () => {
    setViewRol("");
    setSearchPlaca("");
  };

  // crear
  const handleCreate = async (e) => {
    e.preventDefault();
    try {
      if (!tipo || !placa.trim()) {
        toast({ title: "Campos requeridos", description: "Tipo y placa son obligatorios.", variant: "destructive" });
        return;
      }

      const payload = {
        tipo,
        placa: placa.trim().toUpperCase(),
        esPropietaria: !!esPropietaria,
      };
      if (machineryFields[tipo]?.variantes && rolesSel.length) payload.roles = rolesSel;

      setLoading(true);
      const created = await machineryService.createMachinery(payload);
      const createdNormalized = normalizeRow(created);

      setList((prev) => [createdNormalized, ...prev]);
      setViewTipo(tipo);
      toast({ title: "Maquinaria agregada", description: "Se creó correctamente." });
      resetCreateForm();
      resetFilters();
    } catch (e) {
      console.error("[MachineryAdmin] createMachinery error:", e?.response?.data || e);
      const msg = e?.response?.data?.message || e?.response?.data?.error || "No se pudo crear la maquinaria.";
      toast({ title: "Error", description: Array.isArray(msg) ? msg.join(", ") : String(msg), variant: "destructive" });
    } finally {
      setLoading(false);
    }
  };

  const handleCancelCreate = async () => {
    const res = await confirmAction("¿Cancelar?", "Se perderán los cambios no guardados.", {
      icon: "warning",
      confirmButtonText: "Sí, cancelar",
    });
    if (!res.isConfirmed) return;
    resetCreateForm();
    resetFilters();
  };

  // editar
  const startEdit = (row) => {
    setEditingId(row.id);
    setEditForm({
      tipo: row.tipo ?? "",
      roles: toStringRoles(row.roles),
      placa: row.placa ?? row.plate ?? "",
      esPropietaria: !!row.esPropietaria,
    });
  };

  const cancelEdit = () => {
    setEditingId(null);
    setEditForm({ tipo: "", roles: [], placa: "", esPropietaria: false });
  };

  const saveEdit = async () => {
    const res = await confirmAction("¿Guardar cambios?", "", { confirmButtonText: "Guardar" });
    if (!res.isConfirmed) return;

    try {
      setLoading(true);
      const payload = {
        tipo: editForm.tipo,
        placa: editForm.placa.trim().toUpperCase(),
        esPropietaria: !!editForm.esPropietaria,
        roles: machineryFields[editForm.tipo]?.variantes ? editForm.roles || [] : [],
      };
      const updated = await machineryService.updateMachinery(editingId, payload);
      const normalized = normalizeRow(updated);
      setList((prev) => prev.map((r) => (r.id === editingId ? normalized : r)));
      await showSuccess("Actualizado", "Cambios guardados correctamente.");
      cancelEdit();
    } catch (e) {
      console.error("[MachineryAdmin] updateMachinery error:", e?.response?.data || e);
      await showError("Error al actualizar", e?.response?.data?.message || "No se pudo actualizar.");
    } finally {
      setLoading(false);
    }
  };

  // eliminar
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

  // render roles en celda
  const roleCellContent = (row, isEditing) => {
    if (isEditing) {
      return hasVariantEdit ? (
        <MultiSelect
          placeholder="Seleccionar variantes"
          options={rolOptionsEdit}
          value={editForm.roles || []}
          onChange={(v) => setEditForm((p) => ({ ...p, roles: v }))}
        />
      ) : (
        <span className="text-gray-400">—</span>
      );
    }
    if (Array.isArray(row.roles) && row.roles.length) {
      const arr = row.roles.map((x) => (typeof x === "string" ? x : x?.rol)).filter(Boolean);
      return arr.length ? arr.join(", ") : <span className="text-gray-400">—</span>;
    }
    return row.rol ? row.rol : <span className="text-gray-400">—</span>;
  };

  // lista filtrada + ordenada
  const filtered = useMemo(() => {
    let data = Array.isArray(list) ? [...list] : [];
    if (viewTipo) data = data.filter((r) => (r.tipo || "").toLowerCase() === viewTipo.toLowerCase());
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
    data.sort(
      (a, b) =>
        (a.tipo || "").localeCompare(b.tipo || "") ||
        String(a.placa || a.plate || "").localeCompare(String(b.placa || b.plate || ""))
    );
    return data;
  }, [list, viewTipo, viewRol, searchPlaca]);

  const showRoleCol = useMemo(() => {
    if (viewTipo && machineryFields[viewTipo]?.variantes) return true;
    return filtered.some((m) => Array.isArray(m.roles) && m.roles.length > 0);
  }, [viewTipo, filtered]);

  const colSpan = showRoleCol ? 6 : 5;

  return (
    <Card className="w-full">
      <CardHeader>
        <CardTitle>Catálogo de Maquinaria</CardTitle>
      </CardHeader>

      <CardContent className="space-y-6">
        {/* ---------- CREAR (1 sola fila, botones siempre a la derecha) ---------- */}
<form
  onSubmit={handleCreate}
  className="flex flex-col gap-3 md:flex-row md:items-end md:gap-4 md:flex-nowrap"
>
  {/* Tipo (ancho mínimo fijo) */}
  <div className="md:min-w-[14rem]">
    <Label>Tipo</Label>
    <Select
      value={tipo}
      onValueChange={(v) => {
        setTipo(v);
        setRolesSel([]); // limpiar variantes al cambiar tipo
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

  {/* Variantes (flex-1). Si el tipo no tiene variantes, no se renderiza */}
  {hasVariantCreate && (
    <div className="flex-1 min-w-[18rem]">
      <Label>Variantes (puedes elegir varias)</Label>
      <div className="mt-1">
        <MultiSelect
          placeholder="Seleccionar variantes"
          options={VARIANTES[tipo] || []}
          value={rolesSel}
          onChange={setRolesSel}
        />
      </div>
    </div>
  )}

  {/* Placa (si no hay variantes, este bloque ocupa más) */}
  <div className={`${hasVariantCreate ? "md:min-w-[12rem]" : "md:flex-1 md:min-w-[16rem]"}`}>
    <Label>Placa</Label>
    <Input
      value={placa}
      onChange={(e) => setPlaca(e.target.value)}
      placeholder="SM 8772"
      required
    />
  </div>

  {/* Checkbox (no se encoge, queda alineado) */}
  <label className="flex items-center gap-2 md:ml-2 md:mb-[2px] shrink-0">
    <input
      type="checkbox"
      className="h-4 w-4"
      checked={esPropietaria}
      onChange={(e) => setEsPropietaria(e.target.checked)}
    />
    <span className="text-sm whitespace-nowrap">Es propietaria</span>
  </label>

  {/* Acciones a la derecha (no se encogen) */}
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


        {/* Filtros */}
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
              <Select value={viewRol ? viewRol : ALL_ROLES} onValueChange={(v) => setViewRol(v === ALL_ROLES ? "" : v)}>
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

        {/* Tabla */}
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="text-left border-b">
                <th className="py-2 pr-4">ID</th>
                <th className="py-2 pr-4">Tipo</th>
                {showRoleCol && <th className="py-2 pr-4">Rol</th>}
                <th className="py-2 pr-4">Placa</th>
                <th className="py-2 pr-4">Propietaria</th>
                <th className="py-2 pr-4">Acciones</th>
                <th className="py-2 pr-4" />
              </tr>
            </thead>
            <tbody>
              {filtered.map((row) => {
                const isEditing = editingId === row.id;
                return (
                  <tr key={row.id} className="border-b">
                    <td className="py-2 pr-4">{row.id}</td>

                    <td className="py-2 pr-4">
                      {isEditing ? (
                        <Select
                          value={editForm.tipo}
                          onValueChange={(v) =>
                            setEditForm((p) => ({
                              ...p,
                              tipo: v,
                              roles: machineryFields[v]?.variantes ? p.roles : [], // limpia si no tiene variantes
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

                    {showRoleCol && <td className="py-2 pr-4">{roleCellContent(row, isEditing)}</td>}

                    <td className="py-2 pr-4">
                      {isEditing ? (
                        <Input className="h-8" value={editForm.placa} onChange={(e) => setEditForm((p) => ({ ...p, placa: e.target.value }))} />
                      ) : (
                        row.placa ?? row.plate
                      )}
                    </td>

                    <td className="py-2 pr-4">
                      {isEditing ? (
                        <label className="flex items-center gap-2">
                          <input
                            type="checkbox"
                            checked={!!editForm.esPropietaria}
                            onChange={(e) => setEditForm((p) => ({ ...p, esPropietaria: e.target.checked }))}
                          />
                          <span className="text-xs">Es propietaria</span>
                        </label>
                      ) : row.esPropietaria ? (
                        "Sí"
                      ) : (
                        "No"
                      )}
                    </td>

                    <td className="py-2 pr-4 text-right">
                      {isEditing ? (
                        <div className="flex gap-2 justify-end">
                          <Button size="sm" onClick={saveEdit} className="bg-blue-600 hover:bg-blue-700 text-white">
                            Guardar
                          </Button>
                          <Button size="sm" onClick={cancelEdit} variant="secondary" className="bg-gray-200 text-gray-900 hover:bg-gray-300">
                            Cancelar
                          </Button>
                        </div>
                      ) : (
                        <div className="flex gap-2 justify-end">
                          <Button size="sm" variant="secondary" onClick={() => startEdit(row)} className="bg-yellow-500 hover:bg-yellow-400">
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
