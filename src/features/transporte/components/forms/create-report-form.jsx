
"use client";

import { useState, useEffect, useMemo, useCallback } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import machineryService from "@/services/machineryService";
import { machineryFields } from "@/utils/machinery-fields";
import { districts, materialTypes, activityTypes, cargoTypes, activityOptions, sourceOptions } from "@/utils/districts";
import { useToast } from "@/hooks/use-toast";
import HourAmPmPickerDialog from "@/features/transporte/components/HourAmPmPickerDialog";
import {
   confirmAction,
   showSuccess,
   showError,
   showLoading,
   closeLoading,
 } from "@/utils/sweetAlert";

export function CreateReportForm({ onGoToCatalog }) {
  const { toast } = useToast();

  // ====== ESTADO ======
  const [loading, setLoading] = useState(false);
  const [machineryList, setMachineryList] = useState([]);
  const [selectedMachineryType, setSelectedMachineryType] = useState("");
  const [selectedVariant, setSelectedVariant] = useState("");
  const [totalHours, setTotalHours] = useState("");
 

  const TODAY = new Date().toISOString().split("T")[0];
  
  const INITIAL_FORM = {
    operadorId: 0,
    maquinariaId: 0,
    fecha: new Date().toISOString().split("T")[0],
    horasOrd: "",
    horasExt: "",
    diesel: "",
    actividades: "",
    tipoMaquinaria: "",
    placa: "",
    distrito: "",
    codigoCamino: "",
    kilometraje: "",
    horimetro: 0,
    viaticos: "",
    tipoMaterial: "",
    cantidadMaterial: "",
    fuente: "",
    boleta: "",
    cantidadLiquido: "",
    placaCarreta: "",
    destino: "",
    tipoCarga: "",
    estacion: "",
    tipoActividad: "",
    horaInicio: "",
    horaFin: "",
  };

const [formData, setFormData] = useState(INITIAL_FORM);

  // ====== HELPERS ======
  const clamp = (n, min, max) => Math.min(Math.max(n, min), max);
  const toNumberOrEmpty = (v) => {
    if (v === "" || v === null || v === undefined) return "";
    const n = parseFloat(String(v).replace(",", "."));
    return Number.isFinite(n) ? n : "";
  };

  const rolesOf = (m) => {
    if (Array.isArray(m?.roles)) return m.roles.map((r) => String(r).toLowerCase());
    const legacy = m?.rol ?? m?.role;
    return legacy ? [String(legacy).toLowerCase()] : [];
  };

  // ====== CONSTANTES ======
  const TRAILER_PLATES = {
    vagoneta: { carreta: ["SM 5765"] },
    cabezal: {
      material: ["SM 8803", "SM 8844"],
      cisterna: ["SM 8678"],
      carreta: ["SM 8753"],
    },
  };

const norm = (v) => (typeof v === "string" ? v.trim() : v);

const orNull = (v) => {
  if (v === undefined || v === null) return null;
  if (typeof v === "string" && v.trim() === "") return null;
  return v;
};

  // ====== DERIVADOS / CALLBACKS ======
  const getPlacaById = useCallback(
    (id) => {
      const m = machineryList.find((x) => String(x.id) === String(id));
      return m ? String(m.placa ?? m.plate ?? "") : "";
    },
    [machineryList]
  );

  const getTrailerOptions = useCallback(() => {
    const t = (selectedMachineryType || "").toLowerCase();
    const v = (selectedVariant || "").toLowerCase();
    return TRAILER_PLATES[t]?.[v] ?? [];
  }, [selectedMachineryType, selectedVariant]);

  const placasOptions = useMemo(() => {
    let list = Array.isArray(machineryList) ? machineryList : [];

    if (selectedMachineryType) {
      const t = selectedMachineryType.toLowerCase();
      list = list.filter((m) => String(m.tipo || "").toLowerCase() === t);
    }

    if (selectedVariant) {
      const v = selectedVariant.toLowerCase();
      list = list.filter((m) => rolesOf(m).includes(v));
    }

    return list
      .filter((m) => m.placa || m.plate)
      .map((m) => ({ id: String(m.id), placa: String(m.placa ?? m.plate) }));
  }, [machineryList, selectedMachineryType, selectedVariant]);

  const activityChoices = useMemo(() => {
    const t = (selectedMachineryType || "").toLowerCase();
    const v = (selectedVariant || "").toLowerCase();

    if (t && activityOptions[t]) {
      const byVariant = activityOptions[t][v];
      if (byVariant && byVariant.length) return byVariant;

      const def = activityOptions[t].default;
      if (def && def.length) return def;
    }
    return activityTypes;
  }, [selectedMachineryType, selectedVariant]);

  const getFuenteOptions = useCallback(() => {
    const t = String(selectedMachineryType || "").toLowerCase();
    const v = String(selectedVariant || "").toLowerCase();

    const entry = sourceOptions[t];
    if (Array.isArray(entry)) return entry; // tipo sin variantes
    if (entry && Array.isArray(entry[v])) return entry[v]; // tipo con variantes
    return sourceOptions.default; // fallback
  }, [selectedMachineryType, selectedVariant]);

  // ====== EFECTOS ======
  useEffect(() => {
    (async () => {
      try {
        const list = await machineryService.getAllMachinery();
        setMachineryList(Array.isArray(list) ? list : []);
      } catch (e) {
        console.error("[CreateReportForm] getAllMachinery error:", e);
        toast({
          title: "No se pudieron cargar las maquinarias",
          description: "Verifica tu conexión o el inicio de sesión.",
          variant: "destructive",
        });
      }
    })();
  }, [toast]);

  useEffect(() => {
    const opts = getFuenteOptions();
    if (formData.fuente && !opts.includes(formData.fuente)) {
      setFormData((p) => ({ ...p, fuente: "" }));
    }
  }, [getFuenteOptions, formData.fuente]);

  // Mantener/limpiar "placaCarreta" según tipo/variante
  useEffect(() => {
    const opts = getTrailerOptions();
    setFormData((p) => {
      if (!opts.length) {
        return p.placaCarreta ? { ...p, placaCarreta: "" } : p;
      }
      if (!p.placaCarreta || !opts.includes(p.placaCarreta)) {
        return { ...p, placaCarreta: opts[0] };
      }
      return p;
    });
  }, [getTrailerOptions]);

  // ====== HANDLERS ======
  const handleTotalHoursChange = (e) => {
    const raw = e.target.value;
    if (raw === "") {
      setTotalHours("");
      setFormData((p) => ({ ...p, horasOrd: "", horasExt: "" }));
      return;
    }
    const h = clamp(parseFloat(String(raw).replace(",", ".")) || 0, 0, 18);
    setTotalHours(h);
    const ord = Math.min(h, 8);
    const ext = clamp(h - ord, 0, 10);
    setFormData((p) => ({ ...p, horasOrd: ord, horasExt: ext }));
  };

  const handleInputChange = (e) => {
    const { name, value } = e.target;

    if (name === "codigoCamino") {
      const only = value.replace(/\D/g, "").slice(0, 3);
      setFormData((p) => ({ ...p, codigoCamino: only }));
      return;
    }

    if (name === "kilometraje") {
      const only = value.replace(/\D/g, "").slice(0, 6);
      setFormData((p) => ({ ...p, kilometraje: only }));
      return;
    }

    if (name === "combustible") {
      const only = value.replace(/\D/g, "");
      setFormData((p) => ({ ...p, combustible: only }));
      return;
    }

    if (name === "viaticos") {
      const only = value.replace(/\D/g, "").slice(0, 5);
      setFormData((p) => ({ ...p, viaticos: only }));
      return;
    }

    if (name === "cantidadMaterial") {
      const norm = value.replace(",", ".");
      const valid = norm.replace(/[^0-9.]/g, "").replace(/(\..*)\./g, "$1");
      setFormData((p) => ({ ...p, cantidadMaterial: valid }));
      return;
    }

    const localNumericKeys = new Set(["horasOrd", "horasExt", "horimetro", "cantidadLiquido"]);
    setFormData((p) => ({
      ...p,
      [name]: localNumericKeys.has(name) ? toNumberOrEmpty(value) : value,
    }));
  };

  const handleSelectChange = (name, value) => {
    setFormData((prev) => ({ ...prev, [name]: value }));

    if (name === "tipoMaquinaria") {
      setSelectedMachineryType(value);
      setSelectedVariant("");
      setFormData((prev) => ({ ...prev, placa: "", maquinariaId: 0 }));
      return;
    }

    if (name === "variant") {
      setSelectedVariant(value);
      setFormData((prev) => ({ ...prev, placa: "", maquinariaId: 0 }));
      return;
    }

    if (name === "placaId") {
      setFormData((prev) => ({
        ...prev,
        maquinariaId: Number(value),
        placa: getPlacaById(value),
      }));
      return;
    }
  };

  const getDynamicFields = () => {
  if (!selectedMachineryType) return [];
  const mach = machineryFields[selectedMachineryType];
  if (!mach) return [];

  // copia defensiva
  let fields = [];
  if (mach.variantes && selectedVariant) {
    fields = [...(mach.variantes[selectedVariant] || [])];
  } else {
    fields = [...(mach.campos || [])];
  }

  // ¿esta combinación usa carreta?
  const t = (selectedMachineryType || "").toLowerCase();
  const v = (selectedVariant || "").toLowerCase();
  const needsTrailer = !!(TRAILER_PLATES[t]?.[v]);

  if (needsTrailer) {
    const hasPlaca =
      fields.some(f => f?.toLowerCase().trim() === "placa carreta");
    if (!hasPlaca) {
      // si no existe, la agregamos (quedará una sola)
      fields.push("Placa carreta");
    }
  }

  // dedupe final por si llegó duplicada desde múltiples fuentes
  const seen = new Set();
  fields = fields.filter(f => {
    const k = String(f).toLowerCase().trim();
    if (seen.has(k)) return false;
    seen.add(k);
    return true;
  });

  return fields;
};

  const renderDynamicField = (fieldName) => {
    const key = fieldName.toLowerCase().replace(/\s+/g, "");
    switch (fieldName) {
      case "Distrito":
        return (
          <div className="space-y-2" key={fieldName}>
            <Label>Distrito</Label>
            <Select onValueChange={(value) => handleSelectChange("distrito", value)}>
              <SelectTrigger>
                <SelectValue placeholder="Seleccionar distrito" />
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
        );

      case "Placa carreta": {
        const opciones = getTrailerOptions();
        if (!opciones.length) return null;
        return (
          <div className="space-y-2" key={fieldName}>
            <Label>Placa carreta</Label>
            <Select
              value={formData.placaCarreta || ""}
              onValueChange={(value) => setFormData((p) => ({ ...p, placaCarreta: value }))}
            >
              <SelectTrigger>
                <SelectValue placeholder="Seleccionar placa" />
              </SelectTrigger>
              <SelectContent>
                {opciones.map((p) => (
                  <SelectItem key={p} value={p}>
                    {p}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
        );
      }

      case "Cantidad material":
        return (
          <div className="space-y-2" key={fieldName}>
            <Label htmlFor="cantidadMaterial">Cantidad (m³)</Label>
            <div className="flex gap-2 items-center">
              <Input
                id="cantidadMaterial"
                name="cantidadMaterial"
                type="text"
                inputMode="decimal"
                placeholder="0.0"
                value={formData.cantidadMaterial ?? ""}
                onChange={handleInputChange}
              />
              <span className="text-sm text-muted-foreground">m³</span>
            </div>
          </div>
        );

      case "Tipo material":
        return (
          <div className="space-y-2" key={fieldName}>
            <Label>Tipo de Material</Label>
            <Select onValueChange={(value) => handleSelectChange("tipoMaterial", value)}>
              <SelectTrigger>
                <SelectValue placeholder="Seleccionar material" />
              </SelectTrigger>
              <SelectContent>
                {materialTypes.map((m) => (
                  <SelectItem key={m} value={m}>
                    {m}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
        );

      case "Tipo actividad":
        return (
          <div className="space-y-2" key={fieldName}>
            <Label>Tipo de Actividad</Label>
            <Select
              onValueChange={(value) => handleSelectChange("tipoActividad", value)}
              value={formData.tipoActividad || ""}
              disabled={!selectedMachineryType}
            >
              <SelectTrigger>
                <SelectValue placeholder="Seleccionar actividad" />
              </SelectTrigger>
              <SelectContent>
                {activityChoices.map((act) => (
                  <SelectItem key={act} value={act}>
                    {act}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
        );

      case "Tipo carga":
        return (
          <div className="space-y-2" key={fieldName}>
            <Label>Tipo de Carga</Label>
            <Select onValueChange={(value) => handleSelectChange("tipoCarga", value)}>
              <SelectTrigger>
                <SelectValue placeholder="Seleccionar carga" />
              </SelectTrigger>
              <SelectContent>
                {cargoTypes.map((c) => (
                  <SelectItem key={c} value={c}>
                    {c}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
        );

      case "Viaticos":
        return (
          <div className="space-y-2" key={fieldName}>
            <Label htmlFor="viaticos">Viáticos</Label>
            <Input
              id="viaticos"
              name="viaticos"
              type="text"
              inputMode="numeric"
              pattern="\d*"
              maxLength={5}
              placeholder="00000"
              value={formData.viaticos ?? ""}
              onChange={handleInputChange}
            />
          </div>
        );

      case "Hora inicio":
        return (
          <div className="space-y-2" key={fieldName}>
            <HourAmPmPickerDialog
              label="Hora inicio"
              value={formData.horaInicio}
              onChange={(v) => setFormData((p) => ({ ...p, horaInicio: v }))}
            />
          </div>
        );

      case "Hora fin":
        return (
          <div className="space-y-2" key={fieldName}>
            <HourAmPmPickerDialog
              label="Hora fin"
              value={formData.horaFin}
              onChange={(v) => setFormData((p) => ({ ...p, horaFin: v }))}
            />
          </div>
        );

      case "Fuente": {
        const opciones = getFuenteOptions();
        if (!opciones.length) return null;
        return (
          <div className="space-y-2" key={fieldName}>
            <Label>Fuente</Label>
            <Select onValueChange={(value) => handleSelectChange("fuente", value)}>
              <SelectTrigger>
                <SelectValue placeholder="Seleccionar fuente" />
              </SelectTrigger>
              <SelectContent>
                {opciones.map((s) => (
                  <SelectItem key={s} value={s}>
                    {s}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
        );
      }

      case "Codigo camino":
        return (
          <div className="space-y-2" key={fieldName}>
            <Label>Código Camino (3 dígitos)</Label>
            <Input
              id="codigoCamino"
              name="codigoCamino"
              type="text"
              value={formData.codigoCamino}
              onChange={handleInputChange}
              placeholder="000"
              maxLength={3}
            />
          </div>
        );

      default: {
        const numericFieldNames = ["Cantidad material", "Cantidad liquido", "Kilometraje", "Litros diesel", "Horimetro", "Viaticos"];
        if (numericFieldNames.includes(fieldName)) {
          const fieldKey = fieldName.toLowerCase().replace(/\s+/g, "").replace("litrosdiesel", "combustible");
          return (
            <div className="space-y-2" key={fieldName}>
              <Label htmlFor={fieldKey}>{fieldName}</Label>
              <Input
                id={fieldKey}
                name={fieldKey}
                type="number"
                step="1"
                min="0"
                value={formData[fieldKey] ?? ""}
                onChange={handleInputChange}
              />
            </div>
          );
        }
        return (
          <div className="space-y-2" key={fieldName}>
            <Label htmlFor={key}>{fieldName}</Label>
            <Input id={key} name={key} type="text" value={formData[key] ?? ""} onChange={handleInputChange} />
          </div>
        );
      }
    }
  };

//   const handleSubmit = async (e) => {
//   e.preventDefault();
//   if (loading) return;

//   // Confirmación con SweetAlert
//   const ok = await confirmAction({
//     title: "¿Crear reporte?",
//     html: `Operador: <b>${formData.operadorId || "—"}</b><br>
//            Tipo: <b>${selectedMachineryType || "—"}</b><br>
//            Placa: <b>${formData.placa || "—"}</b>`,
//     icon: "question",
//     confirmButtonText: "Guardar",
//     cancelButtonText: "Cancelar",
//   });
//   if (!ok) return;

//   setLoading(true);
//   try {
//     const { operadorId, maquinariaId } = formData;
//     if (!operadorId || !maquinariaId) {
//       await errorAlert("Faltan datos", "Debes indicar Operador y seleccionar una Placa válida.");
//       return;
//     }

//     // ← payload “bueno” que ya te funcionaba
//     const payload = {
//       ...formData,
//       kilometraje: formData.kilometraje === "" ? null : Number(formData.kilometraje),
//       combustible: formData.combustible === "" ? null : Number(formData.combustible),
//       viaticos: formData.viaticos === "" ? null : Number(formData.viaticos),
//       cantidadMaterial:
//         formData.cantidadMaterial === ""
//           ? null
//           : Number(String(formData.cantidadMaterial).replace(",", ".")),
//     };

//     await machineryService.createReport(payload);
//     await swalSuccess("Reporte guardado", "El reporte ha sido enviado al administrador.");

//     // reset UI
//     setFormData({ ...INITIAL_FORM, fecha: new Date().toISOString().split("T")[0] });
//     setSelectedMachineryType("");
//     setSelectedVariant("");
//     setTotalHours("");
//   } catch (err) {
//     console.error("createReport error", err?.response?.data || err);
//     const msg = err?.response?.data?.message || err?.message || "Hubo un problema al enviar el reporte.";
//     await errorAlert("Error al crear reporte", String(msg));
//   } finally {
//     setLoading(false);
//   }
// };

const handleSubmit = async (e) => {
  e.preventDefault();
  if (loading) return;

  // CONFIRMAR (usa title, text y luego options para HTML si quieres)
  const res = await confirmAction(
    "¿Crear reporte?",
    "",
    {
      html: `
        <div style="text-align:left">
          <div><b>Operador:</b> ${formData.operadorId || "—"}</div>
          <div><b>Tipo:</b> ${selectedMachineryType || "—"}</div>
          <div><b>Placa:</b> ${formData.placa || "—"}</div>
        </div>
      `,
      confirmButtonText: "Guardar",
      cancelButtonText: "Revisar",
    }
  );
  if (!res.isConfirmed) return;

  setLoading(true);
  showLoading("Guardando...", "Por favor, espere");

  try {
    const payload = {
      ...formData,
      kilometraje: formData.kilometraje === "" ? null : Number(formData.kilometraje),
      combustible: formData.combustible === "" ? null : Number(formData.combustible),
      viaticos: formData.viaticos === "" ? null : Number(formData.viaticos),
      cantidadMaterial:
        formData.cantidadMaterial === ""
          ? null
          : Number(String(formData.cantidadMaterial).replace(",", ".")),
      // (si quieres normalizar textos vacíos a null, hazlo aquí)
    };

    await machineryService.createReport(payload);

    closeLoading();
    await showSuccess("Reporte guardado", "El reporte ha sido enviado al administrador.");
    // … aquí tu reset del formulario …
  } catch (err) {
    console.error("createReport error", err?.response?.data || err);
    closeLoading();
    await showError("Error al crear", err?.response?.data?.message || "No se pudo guardar el reporte.");
  } finally {
    setLoading(false);
  }
};


  // ====== RENDER ======
  return (
    <Card className="w-full max-w-4xl mx-auto">
      <CardHeader>
        <CardTitle>Crear Reporte de Maquinaria</CardTitle>
        <CardDescription>Completa la información del reporte diario de operación de maquinaria</CardDescription>
      </CardHeader>
      <CardContent>
        <form onSubmit={handleSubmit} className="space-y-6">
          {/* Operador / Fecha */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="operadorId">ID del Operador</Label>
              <Input id="operadorId" name="operadorId" type="number" value={formData.operadorId} onChange={handleInputChange} required min="1" />
            </div>
            <div className="space-y-2">
              <Label>Fecha</Label>
              <Input id="fecha" name="fecha" type="date" value={formData.fecha} onChange={handleInputChange} required />
            </div>
          </div>

          {/* Tipo / Variante / Placa */}
          <div className="space-y-4">
            <div className="space-y-2">
              <Label>Tipo de Maquinaria</Label>
              <Select value={selectedMachineryType} onValueChange={(v) => handleSelectChange("tipoMaquinaria", v)}>
                <SelectTrigger>
                  <SelectValue placeholder="Seleccionar tipo de maquinaria" />
                </SelectTrigger>
                <SelectContent>
                  {Object.keys(machineryFields).map((type) => (
                    <SelectItem key={type} value={type}>
                      {type}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            {selectedMachineryType && machineryFields[selectedMachineryType]?.variantes && (
              <div className="space-y-2">
                <Label>Variante</Label>
                <Select value={selectedVariant} onValueChange={(v) => handleSelectChange("variant", v)}>
                  <SelectTrigger>
                    <SelectValue placeholder="Seleccionar variante" />
                  </SelectTrigger>
                  <SelectContent>
                    {Object.keys(machineryFields[selectedMachineryType].variantes).map((variant) => (
                      <SelectItem key={variant} value={variant}>
                        {variant}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            )}

            {selectedMachineryType && (
              <div className="space-y-2">
                <Label>Placa</Label>
                <Select
                  value={formData.maquinariaId ? String(formData.maquinariaId) : ""}
                  onValueChange={(id) => handleSelectChange("placaId", id)}
                  disabled={placasOptions.length === 0}
                >
                  <SelectTrigger>
                    <SelectValue placeholder={placasOptions.length ? "Seleccionar placa" : "No hay placas disponibles"} />
                  </SelectTrigger>
                  <SelectContent>
                    {placasOptions.map((opt) => (
                      <SelectItem key={opt.id} value={opt.id}>
                        {opt.placa}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>

                {placasOptions.length === 0 && (
                  <div className="text-sm text-muted-foreground">
                    No hay placas disponibles para este tipo/variante.{" "}
                    <button type="button" onClick={onGoToCatalog} className="text-blue-600 underline">
                      Ir a Catálogo
                    </button>
                  </div>
                )}
              </div>
            )}
          </div>

          {/* Horas */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="space-y-2">
              <Label htmlFor="totalHours">Total de Horas Trabajadas</Label>
              <Input
                id="totalHours"
                name="totalHours"
                type="number"
                step="1"
                min="0"
                max="18"
                value={totalHours}
                onChange={handleTotalHoursChange}
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="horasOrd">Horas Ordinarias (máx. 8)</Label>
              <Input id="horasOrd" name="horasOrd" type="number" step="0.1" value={formData.horasOrd} readOnly className="bg-gray-50" />
            </div>
            <div className="space-y-2">
              <Label htmlFor="horasExt">Horas Extraordinarias</Label>
              <Input id="horasExt" name="horasExt" type="number" step="0.1" value={formData.horasExt} readOnly className="bg-gray-50" />
            </div>
          </div>

          {/* Campos dinámicos */}
          {selectedMachineryType && (
            <div className="space-y-4">
              <h3 className="text-lg font-semibold">Campos Específicos</h3>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {getDynamicFields().map((field) => renderDynamicField(field))}
              </div>
            </div>
          )}

          <Button type="submit" disabled={loading} className="w-full">
            {loading ? "Enviando..." : "Crear Reporte"}
          </Button>
        </form>
      </CardContent>
    </Card>
  );
}

export default CreateReportForm;
