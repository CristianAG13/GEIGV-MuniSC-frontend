"use client";

import { useState, useEffect, useMemo, useCallback } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import machineryService from "@/services/machineryService";
import operatorsService from "@/services/operatorsService";
import { machineryFields } from "@/utils/machinery-fields";
import { districts, materialTypes, activityTypes, cargoTypes, activityOptions, sourceOptions } from "@/utils/districts";
import { useToast } from "@/hooks/use-toast";
import HourAmPmPickerDialog from "@/features/transporte/components/HourAmPmPickerDialog";
import { confirmAction, showSuccess, showError, showLoading, closeLoading } from "@/utils/sweetAlert";

export default function CreateReportForm({ onGoToCatalog }) {
  const { toast } = useToast();

  // ====== ESTADO ======
  const [loading, setLoading] = useState(false);
  const [machineryList, setMachineryList] = useState([]);
  const [operatorsList, setOperatorsList] = useState([]);
  const [selectedMachineryType, setSelectedMachineryType] = useState("");
  const [selectedVariant, setSelectedVariant] = useState("");
  const [totalHours, setTotalHours] = useState("");
  const normKey = (s = "") =>
  String(s).toLowerCase().normalize("NFD").replace(/[\u0300-\u036f]/g, "").trim();

  const [lastCounters, setLastCounters] = useState({
    horimetro: null,
    estacionHasta: null,
  });

  const INITIAL_FORM = {
    operadorId: "",
    maquinariaId: 0,
    fecha: new Date().toISOString().split("T")[0],
    horasOrd: "",
    horasExt: "",
    diesel: "",
    actividades: "",
    tipoMaquinaria: "",
    variant: "",
    placa: "",
    distrito: "",
    codigoCamino: "",
    kilometraje: "",
    horimetro: "",
    viaticos: "",
    tipoMaterial: "",
    cantidadMaterial: "",
    fuente: "",
    boleta: "",
    cantidadLiquido: "",
    placaCarreta: "",
    destino: "",
    tipoCarga: "",
    estacionDesde: "",
    estacionHasta: "",
    tipoActividad: "",
    horaInicio: "",
    horaFin: "",
    // NUEVO:
    placaMaquinariaLlevada: "",
  };
  const [formData, setFormData] = useState(INITIAL_FORM);

  // ====== HELPERS ======
  const clamp = (n, min, max) => Math.min(Math.max(n, min), max);
  const onlyDigitsMax = (v, max) => String(v || "").replace(/\D/g, "").slice(0, max);

  const rolesOf = (m) => {
    if (Array.isArray(m?.roles)) return m.roles.map((r) => String(r).toLowerCase());
    const legacy = m?.rol ?? m?.role;
    return legacy ? [String(legacy).toLowerCase()] : [];
  };

  const TRAILER_PLATES = {
    vagoneta: { carreta: ["SM 5765"] },
    cabezal: {
      material: ["SM 8803", "SM 8844"],
      cisterna: ["SM 8678"],
      carreta: ["SM 8753"],
    },
  };

   const requiresField = (name) =>
   getDynamicFields().some((f) => normKey(f) === normKey(name));

  // Mostrar campo Boleta en vagoneta/material y cabezal/material
  const showBoletaField = useCallback(() => {
    const t = (selectedMachineryType || "").toLowerCase();
    const v = (selectedVariant || "").toLowerCase();
    return (t === "vagoneta" && v === "material") || (t === "cabezal" && v === "material");
  }, [selectedMachineryType, selectedVariant]);

  // Requerir boleta solo para vagoneta/material con diésel > 0
  const mustRequireBoleta = useCallback(() => {
    const t = (selectedMachineryType || "").toLowerCase();
    const v = (selectedVariant || "").toLowerCase();
    return t === "vagoneta" && v === "material" && Number(formData.combustible) > 0;
  }, [selectedMachineryType, selectedVariant, formData.combustible]);

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
    (async () => {
      try {
        const operators = await operatorsService.getAllOperators();
        setOperatorsList(Array.isArray(operators) ? operators : []);
      } catch (e) {
        console.error("[CreateReportForm] getAllOperators error:", e);
        toast({
          title: "No se pudieron cargar los operadores",
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

  useEffect(() => {
    const opts = getTrailerOptions();
    setFormData((p) => {
      if (!opts.length) return p.placaCarreta ? { ...p, placaCarreta: "" } : p;
      if (!p.placaCarreta || !opts.includes(p.placaCarreta)) return { ...p, placaCarreta: opts[0] };
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

    if (name === "codigoCamino") return setFormData((p) => ({ ...p, codigoCamino: onlyDigitsMax(value, 3) }));
    if (name === "kilometraje") return setFormData((p) => ({ ...p, kilometraje: onlyDigitsMax(value, 6) }));
    if (name === "viaticos") return setFormData((p) => ({ ...p, viaticos: onlyDigitsMax(value, 5) }));
    if (name === "cantidadMaterial") return setFormData((p) => ({ ...p, cantidadMaterial: onlyDigitsMax(value, 2) }));
    if (name === "combustible") return setFormData((p) => ({ ...p, combustible: onlyDigitsMax(value, 2) }));
    if (name === "boleta") return setFormData((p) => ({ ...p, boleta: onlyDigitsMax(value, 6) }));
    if (name === "horimetro") return setFormData((p) => ({ ...p, horimetro: onlyDigitsMax(value, 5) }));
    if (name === "estacionDesde" || name === "estacionHasta")
      return setFormData((p) => ({ ...p, [name]: onlyDigitsMax(value, 6) }));
    if (name === "cantidadLiquido")
      return setFormData((p) => ({ ...p, cantidadLiquido: onlyDigitsMax(value, 4) }));

    setFormData((p) => ({ ...p, [name]: value }));
  };

  const handleSelectChange = async (name, value) => {
    setFormData((prev) => ({ ...prev, [name]: value }));

    const clearVariantSpecific = (p = {}) => ({
      ...p,
      tipoMaterial: "",
      cantidadMaterial: "",
      fuente: "",
      boleta: "",
      cantidadLiquido: "",
      placaCarreta: "",
      tipoCarga: "",
      destino: "",
      estacionDesde: "",
      estacionHasta: "",
      placaMaquinariaLlevada: "",
    });

    if (name === "tipoMaquinaria") {
      setSelectedMachineryType(value);
      setSelectedVariant("");
      //setFormData((prev) => clearVariantSpecific({ ...prev, placa: "", maquinariaId: 0 }));
      setFormData((prev) => clearVariantSpecific({ ...prev, placa: "", maquinariaId: 0, tipoActividad: "" }));
      setLastCounters({ horimetro: null, estacionHasta: null });
      return;
    }

    if (name === "variant") {
      setSelectedVariant(value);
      //setFormData((prev) => clearVariantSpecific({ ...prev, variant: value, placa: "", maquinariaId: 0 }));
      setFormData((prev) => clearVariantSpecific({ ...prev, variant: value, placa: "", maquinariaId: 0, tipoActividad: "" }));
      setLastCounters({ horimetro: null, estacionHasta: null });
      return;
    }

    if (name === "placaId") {
      setFormData((prev) => ({
        ...prev,
        maquinariaId: Number(value),
        placa: getPlacaById(value),
      }));

      try {
        const counters = await machineryService.getLastCounters(Number(value));
        const h = counters?.horimetro ?? null;
        const est = counters?.estacionHasta ?? null;

        setLastCounters({ horimetro: h, estacionHasta: est });

        setFormData((p) => ({
          ...p,
          estacionDesde: requiresField("Estacion") && est != null ? String(est) : p.estacionDesde ?? "",
          horimetro: p.horimetro ?? "",
        }));
      } catch {
        setLastCounters({ horimetro: null, estacionHasta: null });
      }
    }
  };

  const getDynamicFields = () => {
    if (!selectedMachineryType) return [];
    const mach = machineryFields[selectedMachineryType];
    if (!mach) return [];

    let fields = [];
    if (mach.variantes && selectedVariant) {
      fields = [...(mach.variantes[selectedVariant] || [])];
    } else {
      fields = [...(mach.campos || [])];
    }

    const t = (selectedMachineryType || "").toLowerCase();
    const v = (selectedVariant || "").toLowerCase();
    const needsTrailer = !!TRAILER_PLATES[t]?.[v];

    if (needsTrailer) {
      const hasPlaca = fields.some((f) => f?.toLowerCase().trim() === "placa carreta");
      if (!hasPlaca) fields.push("Placa carreta");
    }

    // Para carreta, agregamos “Placa maquinaria llevada” si no está
    if (v === "carreta") {
      const hasCarry = fields.some((f) => f?.toLowerCase().includes("placa maquinaria llevada"));
      if (!hasCarry) fields.push("Placa maquinaria llevada");
    }

    const seen = new Set();
    fields = fields.filter((f) => {
      const k = normKey(f);
      if (seen.has(k)) return false;
      seen.add(k);
      return true;
    });

    return fields;
  };

   const renderDynamicField = (fieldName) => {
   const key = normKey(fieldName);
   switch (key) {
      case "distrito":
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

      case "destino":
        return (
          <div className="space-y-2" key={fieldName}>
            <Label htmlFor="destino">Destino</Label>
            <Input
              id="destino"
              name="destino"
              placeholder="Punto de descarga / obra"
              value={formData.destino || ""}
              onChange={handleInputChange}
            />
          </div>
        );

      case "cantidad liquido":
        return (
          <div className="space-y-2" key={fieldName}>
            <Label htmlFor="cantidadLiquido">Cantidad (L)</Label>
            <div className="flex gap-2 items-center">
              <Input
                id="cantidadLiquido"
                name="cantidadLiquido"
                inputMode="numeric"
                pattern="\d*"
                placeholder="0000"
                maxLength={4}
                value={formData.cantidadLiquido ?? ""}
                onChange={handleInputChange}
              />
              <span className="text-sm text-muted-foreground">L</span>
            </div>
          </div>
        );

      case "litros diesel":
        return (
          <div className="space-y-2" key={fieldName}>
            <Label htmlFor="combustible">Litros diésel</Label>
            <Input
              id="combustible"
              name="combustible"
              inputMode="numeric"
              pattern="\d*"
              maxLength={2}
              placeholder="00"
              value={formData.combustible ?? ""}
              onChange={handleInputChange}
            />
            <p className="text-xs text-muted-foreground">Máximo 2 dígitos (0–99)</p>
          </div>
        );

      case "boleta":
        if (!showBoletaField()) return null;
        return (
          <div className="space-y-2" key={fieldName}>
            <Label htmlFor="boleta">Boleta (6 dígitos)</Label>
            <Input
              id="boleta"
              name="boleta"
              inputMode="numeric"
              pattern="\d{6}"
              maxLength={6}
              placeholder="000000"
              value={formData.boleta ?? ""}
              onChange={handleInputChange}
            />
          </div>
        );

      case "horimetro":
        return (
          <div className="space-y-2" key={fieldName}>
            <Label htmlFor="horimetro">
              Horímetro{" "}
              {lastCounters.horimetro !== null && (
                <span className="text-xs text-muted-foreground">(último: {lastCounters.horimetro})</span>
              )}
            </Label>
            <Input
              id="horimetro"
              name="horimetro"
              inputMode="numeric"
              pattern="\d*"
              maxLength={5}
              placeholder="00000"
              value={formData.horimetro ?? ""}
              onChange={handleInputChange}
            />
            <p className="text-xs text-muted-foreground">Máximo 5 dígitos, no menor al último valor.</p>
          </div>
        );

      case "estacion":                // 👈 ahora matchea “Estación” y “Estacion”
      return (
        <div className="space-y-2" key={fieldName}>
          <Label>Estación</Label>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-2">
            <Input
              name="estacionDesde"
              inputMode="numeric"
              pattern="\d*"
              maxLength={6}
              placeholder="Desde (m)"
              value={formData.estacionDesde}
              onChange={handleInputChange}
            />
            <Input
              name="estacionHasta"
              inputMode="numeric"
              pattern="\d*"
              maxLength={6}
              placeholder="Hasta (m)"
              value={formData.estacionHasta}
              onChange={handleInputChange}
            />
            <div className="flex items-center text-sm text-muted-foreground">
              Avance:&nbsp;
              {formData.estacionDesde && formData.estacionHasta
                ? Math.max(0, Number(formData.estacionHasta) - Number(formData.estacionDesde))
                : 0}{" "}
              m
            </div>
          </div>
          {lastCounters.estacionHasta !== null && (
            <p className="text-xs text-muted-foreground">
              Continuidad: el “desde” de hoy debe ser ≥ {lastCounters.estacionHasta}
            </p>
          )}
        </div>
      );

      case "placa carreta": {
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

      // NUEVO: placa de la maquinaria que va sobre la carreta
      case "placa maquinaria llevada":
        return (
          <div className="space-y-2" key={fieldName}>
            <Label htmlFor="placaMaquinariaLlevada">Placa maquinaria llevada</Label>
            <Input
              id="placaMaquinariaLlevada"
              name="placaMaquinariaLlevada"
              placeholder="SM 0000"
              value={formData.placaMaquinariaLlevada || ""}
              onChange={handleInputChange}
            />
          </div>
        );

      case "cantidad material":
        return (
          <div className="space-y-2" key={fieldName}>
            <Label htmlFor="cantidadMaterial">Cantidad (m³)</Label>
            <div className="flex gap-2 items-center">
              <Input
                id="cantidadMaterial"
                name="cantidadMaterial"
                inputMode="numeric"
                pattern="\d*"
                placeholder="00"
                maxLength={2}
                value={formData.cantidadMaterial ?? ""}
                onChange={handleInputChange}
              />
              <span className="text-sm text-muted-foreground">m³</span>
            </div>
          </div>
        );

      case "tipo material":
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

      case "tipo actividad":
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

      case "tipo carga":
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

      case "viaticos":
        return (
          <div className="space-y-2" key={fieldName}>
            <Label htmlFor="viaticos">Viáticos</Label>
            <Input
              id="viaticos"
              name="viaticos"
              inputMode="numeric"
              pattern="\d*"
              maxLength={5}
              placeholder="00000"
              value={formData.viaticos ?? ""}
              onChange={handleInputChange}
            />
          </div>
        );

      case "hora inicio":
        return (
          <div className="space-y-2" key={fieldName}>
            <HourAmPmPickerDialog
              label="Hora inicio"
              value={formData.horaInicio}
              onChange={(v) => setFormData((p) => ({ ...p, horaInicio: v }))}
            />
          </div>
        );

      case "hora fin":
        return (
          <div className="space-y-2" key={fieldName}>
            <HourAmPmPickerDialog
              label="Hora fin"
              value={formData.horaFin}
              onChange={(v) => setFormData((p) => ({ ...p, horaFin: v }))}
            />
          </div>
        );

      case "fuente": {
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

      case "codigo camino":
        return (
          <div className="space-y-2" key={fieldName}>
            <Label>Código Camino (3 dígitos)</Label>
            <Input
              id="codigoCamino"
              name="codigoCamino"
              value={formData.codigoCamino}
              onChange={handleInputChange}
              placeholder="000"
              maxLength={3}
            />
          </div>
        );

      default:
        return (
          <div className="space-y-2" key={fieldName}>
            <Label>{fieldName}</Label>
            
            <Input onChange={handleInputChange} name={normKey(fieldName).replace(/\s+/g, "")} />
          </div>
        );
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (loading) return;

    // Buscar el nombre del operador para mostrarlo en la confirmación
    const selectedOperator = operatorsList.find(op => op.id === Number(formData.operadorId));
    const operatorName = selectedOperator ? `${selectedOperator.name} ${selectedOperator.last}` : `ID: ${formData.operadorId}`;

    const res = await confirmAction("¿Crear reporte?", "", {
      html: `
        <div style="text-align:left">
          <div><b>Operador:</b> ${operatorName || "—"}</div>
          <div><b>Tipo:</b> ${selectedMachineryType || formData.tipoMaquinaria || "—"}</div>
          <div><b>Placa:</b> ${formData.placa || "—"}</div>
        </div>
      `,
      confirmButtonText: "Guardar",
      cancelButtonText: "Revisar",
    });
    if (!res.isConfirmed) return;

    setLoading(true);
    showLoading("Guardando...", "Por favor, espere");

    try {
      // Validar operador seleccionado
      if (!formData.operadorId) {
        closeLoading(); await showError("Operador requerido", "Debe seleccionar un operador."); setLoading(false); return;
      }

      if (requiresField("Cantidad material")) {
        if (formData.cantidadMaterial !== "" && !/^\d{1,2}$/.test(String(formData.cantidadMaterial))) {
          closeLoading(); await showError("Cantidad de m³ inválida", "Solo enteros de 1 o 2 dígitos."); setLoading(false); return;
        }
      }
      if (requiresField("Litros diesel")) {
        if (formData.combustible !== "" && !/^\d{1,2}$/.test(String(formData.combustible))) {
          closeLoading(); await showError("Litros de diésel inválidos", "Solo enteros de 1 o 2 dígitos."); setLoading(false); return;
        }
      }

      if (mustRequireBoleta()) {
        if (!/^\d{6}$/.test(String(formData.boleta))) {
          closeLoading(); await showError("Boleta requerida", "Ingrese exactamente 6 dígitos."); setLoading(false); return;
        }
      } else if (!showBoletaField() && formData.boleta) {
        setFormData((p) => ({ ...p, boleta: "" }));
      }

      await machineryService.createReport({
        ...formData,
        tipoMaquinaria: selectedMachineryType || formData.tipoMaquinaria,
        variant: selectedVariant || formData.variant,
      });

      closeLoading();
      await showSuccess("Reporte guardado", "El reporte ha sido enviado al administrador.");

      setFormData({ ...INITIAL_FORM, fecha: new Date().toISOString().split("T")[0] });
      setSelectedMachineryType("");
      setSelectedVariant("");
      setTotalHours("");
      setLastCounters({ horimetro: null, estacionHasta: null });
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
        <CardTitle>Boleta Municipal</CardTitle>
        <CardDescription>Completa la información del reporte diario de operación</CardDescription>
      </CardHeader>

      <CardContent>
        <form onSubmit={handleSubmit} className="space-y-6">
          {/* Operador / Fecha */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label>Operador</Label>
              <Select 
                value={formData.operadorId ? String(formData.operadorId) : ""} 
                onValueChange={(v) => setFormData((p) => ({ ...p, operadorId: Number(v) }))}
              >
                <SelectTrigger>
                  <SelectValue placeholder="Seleccionar operador" />
                </SelectTrigger>
                <SelectContent>
                  {operatorsList.map((operator) => (
                    <SelectItem key={operator.id} value={String(operator.id)}>
                      {operator.name} {operator.last} (ID: {operator.id})
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
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
