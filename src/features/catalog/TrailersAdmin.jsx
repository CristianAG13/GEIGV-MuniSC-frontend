"use client";
import { useEffect, useMemo, useState } from "react";
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectTrigger, SelectContent, SelectItem, SelectValue } from "@/components/ui/select";
import { Edit, Trash2, Check, X } from "lucide-react";
import trailersService from "@/services/trailersService";
import { confirmAction, confirmDelete, showError, showSuccess } from "@/utils/sweetAlert";

const TM_OPTS = ["vagoneta","cabezal"];
const CATEG_OPTS = ["carreta","material"];
const MAT_OPTS = ["desecho","plataforma"]; // solo cuando cabezal/material

export default function TrailersAdmin() {
  const [rows, setRows] = useState([]);
  const [loading, setLoading] = useState(false);

  // Filtros “tabs”
  const [tm, setTm] = useState("vagoneta");                  // vagoneta | cabezal
  const [categoria, setCategoria] = useState("carreta");     // en cabezal: carreta | material
  const [materialTipo, setMaterialTipo] = useState("desecho");// si categoria=material

  // Crear
  const [placa, setPlaca] = useState("");

  // Editar inline
  const [editingId, setEditingId] = useState(null);
  const [edit, setEdit] = useState({ placa:"", tipoMaquinaria:"vagoneta", categoria:"carreta", materialTipo:null });

  const listParams = useMemo(() => {
    const p = { tipoMaquinaria: tm, categoria };
    if (tm === "cabezal" && categoria === "material") p.materialTipo = materialTipo;
    return p;
  }, [tm, categoria, materialTipo]);

  const load = async () => {
    setLoading(true);
    try {
      const data = await trailersService.list(listParams);
      setRows(Array.isArray(data.items) ? data.items : Array.isArray(data) ? data : []);
    } catch (e) {
      await showError("No se pudo cargar Carretas");
    } finally {
      setLoading(false);
    }
  };
  useEffect(() => { load(); }, [listParams]);

  // Crear
  const handleCreate = async (e) => {
    e.preventDefault();
    if (!placa.trim()) return;
    try {
      const payload = {
        placa: placa.trim().toUpperCase(),
        tipoMaquinaria: tm,
        categoria,
        materialTipo: (tm === "cabezal" && categoria === "material") ? materialTipo : undefined,
      };
      await trailersService.create(payload);
      setPlaca("");
      await load();
      await showSuccess("Agregado", "Placa registrada.");
    } catch (e) {
      await showError("No se pudo crear la carreta");
    }
  };

  // Edit
  const startEdit = (r) => {
    setEditingId(r.id);
    setEdit({
      placa: r.placa,
      tipoMaquinaria: r.tipoMaquinaria,
      categoria: r.categoria,
      materialTipo: r.materialTipo ?? null,
    });
  };
  const cancelEdit = () => { setEditingId(null); setEdit({ placa:"", tipoMaquinaria:"vagoneta", categoria:"carreta", materialTipo:null }); };
  const saveEdit = async () => {
    const ok = await confirmAction("¿Guardar cambios?", "");
    if (!ok.isConfirmed) return;
    await trailersService.update(editingId, edit);
    await showSuccess("Actualizado","Cambios guardados");
    cancelEdit();
    await load();
  };

  // Delete
  const onDelete = async (id) => {
    const res = await confirmDelete("la carreta");
    if (!res.isConfirmed) return;
    await trailersService.remove(id);
    await showSuccess("Eliminada","Placa eliminada");
    await load();
  };

  return (
    <Card className="w-full">
      <CardHeader><CardTitle>Catálogo de Carretas</CardTitle></CardHeader>
      <CardContent className="space-y-6">

        {/* Tabs de alto nivel */}
        <div className="flex flex-wrap gap-2">
          <Button variant={tm==='vagoneta'?'default':'secondary'} onClick={()=>{setTm('vagoneta'); setCategoria('carreta')}}>Vagoneta</Button>
          <Button variant={tm==='cabezal'?'default':'secondary'} onClick={()=>{setTm('cabezal'); setCategoria('carreta')}}>Cabezal</Button>

          {tm==='cabezal' && (
            <>
              <Button variant={categoria==='carreta'?'default':'secondary'} onClick={()=>setCategoria('carreta')}>Carreta</Button>
              <Button variant={categoria==='material'?'default':'secondary'} onClick={()=>setCategoria('material')}>Material</Button>
              {categoria==='material' && (
                <div className="ml-2">
                  <Select value={materialTipo} onValueChange={setMaterialTipo}>
                    <SelectTrigger className="h-9 w-44"><SelectValue placeholder="Tipo material" /></SelectTrigger>
                    <SelectContent>
                      <SelectItem value="desecho">Desecho (boletas)</SelectItem>
                      <SelectItem value="plataforma">Plataforma (cemento/blocks)</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              )}
            </>
          )}
        </div>

        {/* Crear */}
        <form onSubmit={handleCreate} className="flex flex-wrap items-end gap-3">
          <div className="w-64">
            <Label>Placa</Label>
            <Input value={placa} onChange={(e)=>setPlaca(e.target.value)} placeholder="SM 0000" required />
          </div>
          <div className="ml-auto flex gap-2">
            <Button type="submit">Agregar</Button>
          </div>
        </form>

        {/* Tabla simple */}
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead><tr className="border-b">
              <th className="py-2 pr-4">ID</th>
              <th className="py-2 pr-4">Placa</th>
              {tm==='cabezal' && <th className="py-2 pr-4">Categoría</th>}
              {tm==='cabezal' && categoria==='material' && <th className="py-2 pr-4">Material</th>}
              <th className="py-2 pr-4 text-right">Acciones</th>
            </tr></thead>
            <tbody>
              {rows.map(r=>{
                const editing = editingId===r.id;
                return (
                  <tr key={r.id} className="border-b">
                    <td className="py-2 pr-4">{r.id}</td>
                    <td className="py-2 pr-4">
                      {editing ? (
                        <Input className="h-8" value={edit.placa} onChange={(e)=>setEdit(p=>({...p, placa:e.target.value}))}/>
                      ) : r.placa}
                    </td>
                    {tm==='cabezal' && (
                      <td className="py-2 pr-4">
                        {editing ? (
                          <Select value={edit.categoria} onValueChange={(v)=>setEdit(p=>({...p, categoria:v}))}>
                            <SelectTrigger className="h-8"><SelectValue /></SelectTrigger>
                            <SelectContent>
                              <SelectItem value="carreta">carreta</SelectItem>
                              <SelectItem value="material">material</SelectItem>
                            </SelectContent>
                          </Select>
                        ) : r.categoria}
                      </td>
                    )}
                    {tm==='cabezal' && categoria==='material' && (
                      <td className="py-2 pr-4">
                        {editing ? (
                          <Select value={edit.materialTipo ?? 'desecho'} onValueChange={(v)=>setEdit(p=>({...p, materialTipo:v}))}>
                            <SelectTrigger className="h-8"><SelectValue /></SelectTrigger>
                            <SelectContent>
                              <SelectItem value="desecho">desecho</SelectItem>
                              <SelectItem value="plataforma">plataforma</SelectItem>
                            </SelectContent>
                          </Select>
                        ) : (r.materialTipo || '—')}
                      </td>
                    )}
                    <td className="py-2 pr-4 text-right">
                      {editing ? (
                        <div className="flex gap-2 justify-end">
                          <button type="button" onClick={saveEdit} className="h-9 w-9 rounded-xl border bg-green-50 text-green-700 flex items-center justify-center"><Check className="h-4 w-4"/></button>
                          <button type="button" onClick={cancelEdit} className="h-9 w-9 rounded-xl border bg-gray-50 text-gray-700 flex items-center justify-center"><X className="h-4 w-4"/></button>
                        </div>
                      ) : (
                        <div className="flex gap-3 justify-end">
                          <button type="button" onClick={()=>startEdit(r)} className="h-9 w-9 rounded-xl text-blue-700 hover:bg-blue-100 flex items-center justify-center"><Edit className="h-4 w-4"/></button>
                          <button type="button" onClick={()=>onDelete(r.id)} className="h-9 w-9 rounded-xl text-red-600 hover:bg-red-50 flex items-center justify-center"><Trash2 className="h-4 w-4"/></button>
                        </div>
                      )}
                    </td>
                  </tr>
                );
              })}
              {rows.length===0 && (
                <tr><td className="py-4 text-center text-gray-500" colSpan={5}>{loading?'Cargando…':'Sin registros'}</td></tr>
              )}
            </tbody>
          </table>
        </div>
      </CardContent>
    </Card>
  );
}
