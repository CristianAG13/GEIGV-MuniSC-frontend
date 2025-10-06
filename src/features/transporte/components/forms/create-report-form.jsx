

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
import {
  districts,
  materialTypes,
  activityTypes,
  cargoTypes,
  activityOptions,
  sourceOptions,
  rivers,
  tajosBase,
} from "@/utils/districts";
import { useToast } from "@/hooks/use-toast";
import { useAuditLogger } from "@/hooks/useAuditLogger";
import HourAmPmPickerDialog from "@/features/transporte/components/HourAmPmPickerDialog";
import { confirmAction, showSuccess, showError, showLoading, closeLoading } from "@/utils/sweetAlert";

const THIRTY_DAYS = 30 * 24 * 60 * 60 * 1000;

export default function CreateReportForm({ onGoToCatalog }) {
  const { toast } = useToast();
  const { logCreate } = useAuditLogger();

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
    kilometraje: null,
    estacionHasta: null,
    estacionUpdatedAt: null,
    // opcionales si tu API los devuelve:
    estacionDesde: null,
    estacionAvance: null,
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
    subFuente: "",
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
    placaMaquinariaLlevada: "",

    _tajos: tajosBase,
    _nuevoTajo: "",

    // flujo material
    totalCantidadMaterial: "",
    boletas: [{ boleta: "", tipoMaterial: "", fuente: "", subFuente: "" }],
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
    cabezal: { material: ["SM 8803", "SM 8844"], cisterna: ["SM 8678"], carreta: ["SM 8753"] },
  };

  // Mostrar boleta global solo en vagoneta/cabezal material y cuando la fuente NO sea Río/Tajo
  const showBoletaField = useCallback(() => {
    const t = (selectedMachineryType || "").toLowerCase();
    const v = (selectedVariant || "").toLowerCase();
    const byType = (t === "vagoneta" && v === "material") || (t === "cabezal" && v === "material");
    const hideByFuente = formData.fuente === "Ríos" || formData.fuente === "Tajo";
    return byType && !hideByFuente;
  }, [selectedMachineryType, selectedVariant, formData.fuente]);

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
    if (Array.isArray(entry)) return entry;
    if (entry && Array.isArray(entry[v])) return entry[v];
    return sourceOptions.default;
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
          description: "Verifica tu conexión.",
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
          description: "Verifica tu conexión.",
          variant: "destructive",
        });
      }
    })();
  }, [toast]);

  // Si la fuente cambia a una que no está disponible, limpiar
  useEffect(() => {
    const opts = getFuenteOptions();
    if (formData.fuente && !opts.includes(formData.fuente)) {
      setFormData((p) => ({ ...p, fuente: "", subFuente: "" }));
    }
  }, [getFuenteOptions, formData.fuente]);

  // Sugerir/validar placa de carreta
  useEffect(() => {
    const opts = getTrailerOptions();
    setFormData((p) => {
      if (!opts.length) return p.placaCarreta ? { ...p, placaCarreta: "" } : p;
      if (!p.placaCarreta || !opts.includes(p.placaCarreta)) return { ...p, placaCarreta: opts[0] };
      return p;
    });
  }, [getTrailerOptions]);

  // ====== BOLETAS HELPERS ======
  const addBoleta = () => {
    setFormData((p) => ({
      ...p,
      boletas: [...(p.boletas || []), { boleta: "", tipoMaterial: "", fuente: "", subFuente: "" }],
    }));
  };

  const removeBoleta = (idx) => {
    setFormData((p) => {
      const next = [...(p.boletas || [])];
      next.splice(idx, 1);
      return {
        ...p,
        boletas: next.length ? next : [{ boleta: "", tipoMaterial: "", fuente: "", subFuente: "" }],
      };
    });
  };

  const updateBoleta = (idx, patch) => {
    setFormData((p) => {
      const next = [...(p.boletas || [])];
      const cur = next[idx] || { boleta: "", tipoMaterial: "", fuente: "", subFuente: "" };
      next[idx] = { ...cur, ...patch };
      return { ...p, boletas: next };
    });
  };

  // Útil para saber si estamos en material (vagoneta/cabezal)
 function isMaterialFlow() {
  const t = (selectedMachineryType || "").toLowerCase();
  const v = (selectedVariant || "").toLowerCase();
  return ["vagoneta", "cabezal"].includes(t) && v === "material";
}


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

  const handleEditMunicipal = async (row) => {
  try {
    const data = await machineryService.getReportById(row.id);
    // normaliza detalles
    if (!data.detalles) data.detalles = {};
    if (!Array.isArray(data.detalles.boletas)) data.detalles.boletas = [];
    setEditingRow({ ...data, _kind: "municipal" });
    setEditOpen(true);
  } catch (err) {
    console.error("GET /machinery/report/:id ->", err?.response || err);
  }
};

  const handleInputChange = async (e) => {
    const { name, value } = e.target;

    if (name === "codigoCamino") {
      const codigo = onlyDigitsMax(value, 3);
      setFormData((p) => ({ ...p, codigoCamino: codigo }));
      if (formData.maquinariaId) {
        try {
          const c = await machineryService.getLastCounters(formData.maquinariaId, codigo);
          setLastCounters({
            horimetro: c?.horimetro ?? null,
            kilometraje: c?.kilometraje ?? null,
            estacionHasta: c?.estacionHasta ?? null,
            estacionUpdatedAt: c?.estacionUpdatedAt ?? null,
            estacionDesde: c?.estacionDesde ?? null,
            estacionAvance: c?.estacionAvance ?? null,
          });
          const isStale =
            c?.estacionUpdatedAt &&
            Date.now() - new Date(c.estacionUpdatedAt).getTime() > THIRTY_DAYS;
          setFormData((p) => ({
            ...p,
            estacionDesde:
              requiresField("Estacion") && c?.estacionHasta != null
                ? isStale
                  ? "0"
                  : String(c.estacionHasta)
                : p.estacionDesde,
          }));
        } catch {}
      }
      return;
    }

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
      subFuente: "",
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
      setFormData((prev) => clearVariantSpecific({ ...prev, placa: "", maquinariaId: 0, tipoActividad: "" }));
      setLastCounters({ horimetro: null, kilometraje: null, estacionHasta: null, estacionUpdatedAt: null });
      return;
    }

    if (name === "variant") {
      setSelectedVariant(value);
      setFormData((prev) => clearVariantSpecific({ ...prev, variant: value, placa: "", maquinariaId: 0, tipoActividad: "" }));
      setLastCounters({ horimetro: null, kilometraje: null, estacionHasta: null, estacionUpdatedAt: null });
      return;
    }

    if (name === "placaId") {
      const id = Number(value);
      // 1) guarda id y placa
      setFormData((prev) => ({
        ...prev,
        maquinariaId: id,
        placa: getPlacaById(id),
      }));

      try {
        // 2) counters (pasando código si existe)
        const c = await machineryService.getLastCounters(id, formData.codigoCamino || undefined);

        setLastCounters({
          horimetro: c?.horimetro ?? null,
          kilometraje: c?.kilometraje ?? null,
          estacionHasta: c?.estacionHasta ?? null,
          estacionUpdatedAt: c?.estacionUpdatedAt ?? null,
          estacionDesde: c?.estacionDesde ?? null,
          estacionAvance: c?.estacionAvance ?? null,
        });

        const isStale =
          c?.estacionUpdatedAt &&
          Date.now() - new Date(c.estacionUpdatedAt).getTime() > THIRTY_DAYS;

        // 3) precarga estaciónDesde si aplica
        setFormData((p) => ({
          ...p,
          estacionDesde:
            requiresField("Estacion") && c?.estacionHasta != null
              ? isStale
                ? "0"
                : String(c.estacionHasta)
              : p.estacionDesde || "",
          horimetro: p.horimetro ?? "",
        }));
      } catch (e) {
        setLastCounters({
          horimetro: null,
          kilometraje: null,
          estacionHasta: null,
          estacionUpdatedAt: null,
          estacionDesde: null,
          estacionAvance: null,
        });
      }
      return;
    }
  };

  function getDynamicFields () {
    if (!selectedMachineryType) return [];
    const mach = machineryFields[selectedMachineryType];
    if (!mach) return [];

    let fields = [];
    if (mach.variantes && selectedVariant) fields = [...(mach.variantes[selectedVariant] || [])];
    else fields = [...(mach.campos || [])];

    // En flujo material quitamos Boleta y Cantidad material (se manejan en boletas dinámicas)
    if (["vagoneta", "cabezal"].includes((selectedMachineryType || "").toLowerCase()) &&
        (selectedVariant || "").toLowerCase() === "material") {
      fields = fields.filter((f) => {
        const k = normKey(f);
        return k !== "boleta" && k !== "cantidad material";
      });
    }

    const t = (selectedMachineryType || "").toLowerCase();
    const v = (selectedVariant || "").toLowerCase();
    const needsTrailer = !!TRAILER_PLATES[t]?.[v];

    if (needsTrailer && !fields.some((f) => f?.toLowerCase().trim() === "placa carreta"))
      fields.push("Placa carreta");
    if (v === "carreta" && !fields.some((f) => f?.toLowerCase().includes("placa maquinaria llevada")))
      fields.push("Placa maquinaria llevada");

    // dedupe
    const seen = new Set();
    fields = fields.filter((f) => {
      const k = normKey(f);
      if (seen.has(k)) return false;
      seen.add(k);
      return true;
    });

    return fields;
  };

  const requiresField = (name) => getDynamicFields().some((f) => normKey(f) === normKey(name));

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

      case "kilometraje":
        return (
          <div className="space-y-2" key={fieldName}>
            <Label htmlFor="kilometraje">
              Kilometraje{" "}
              {lastCounters.kilometraje !== null && (
                <span className="text-xs text-muted-foreground">(último: {lastCounters.kilometraje})</span>
              )}
            </Label>
            <Input
              id="kilometraje"
              name="kilometraje"
              inputMode="numeric"
              pattern="\d*"
              maxLength={6}
              placeholder="000000"
              value={formData.kilometraje ?? ""}
              onChange={handleInputChange}
            />
            <p className="text-xs text-muted-foreground">Máximo 6 dígitos, no menor al último valor.</p>
          </div>
        );

      case "estacion": {
        if (!requiresField("Estacion")) return null;

        const ultimoHasta = lastCounters.estacionHasta;
        const ultimoDesde = lastCounters.estacionDesde ?? null;
        const ultimoAvance =
          lastCounters.estacionAvance ??
          (Number.isFinite(ultimoHasta) && Number.isFinite(ultimoDesde)
            ? Math.max(0, Number(ultimoHasta) - Number(ultimoDesde))
            : null);

        return (
          <div className="space-y-2" key={fieldName}>
            <Label>
              Estación{" "}
              {Number.isFinite(ultimoHasta) && (
                <span className="text-xs text-muted-foreground">
                  (último hasta: {ultimoHasta}
                  {Number.isFinite(ultimoAvance) ? `, avance: ${ultimoAvance} m` : ""})
                </span>
              )}
            </Label>

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

            {ultimoHasta !== null && (
              <p className="text-xs text-muted-foreground">
                Continuidad: el “Desde” de hoy debe ser ≥ {ultimoHasta}.
              </p>
            )}
          </div>
        );
      }

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

      case "fuente": {
        // ocultar fuente global en flujo material
        if (isMaterialFlow()) return null;

        const opciones = getFuenteOptions();
        if (!opciones.length) return null;

        const handleFuente = (value) => {
          setFormData((p) => ({
            ...p,
            fuente: value,
            subFuente: "",
            boleta: value === "Ríos" || value === "Tajo" ? "" : p.boleta,
            tipoMaterial: value === "Ríos" ? "" : p.tipoMaterial,
          }));
        };

        return (
          <div className="space-y-2" key={fieldName}>
            <Label>Fuente</Label>
            <Select value={formData.fuente || ""} onValueChange={handleFuente}>
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

            {formData.fuente === "Ríos" && (
              <>
                <Label className="mt-2">Río</Label>
                <Select
                  value={formData.subFuente || ""}
                  onValueChange={(v) => setFormData((p) => ({ ...p, subFuente: v }))}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Seleccionar río" />
                  </SelectTrigger>
                  <SelectContent>
                    {rivers.map((r) => (
                      <SelectItem key={r} value={r}>
                        {r}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </>
            )}

            {formData.fuente === "Tajo" && (
              <>
                <Label className="mt-2">Tajo</Label>
                <Select
                  value={formData.subFuente || ""}
                  onValueChange={(v) => setFormData((p) => ({ ...p, subFuente: v }))}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Seleccionar tajo" />
                  </SelectTrigger>
                  <SelectContent>
                    {(formData._tajos || []).map((t) => (
                      <SelectItem key={t} value={t}>
                        {t}
                      </SelectItem>
                    ))}
                    <SelectItem value="__add__">+ Agregar nuevo tajo…</SelectItem>
                  </SelectContent>
                </Select>

                {formData.subFuente === "__add__" && (
                  <div className="flex gap-2 mt-2">
                    <Input
                      placeholder="Nombre del tajo"
                      value={formData._nuevoTajo || ""}
                      onChange={(e) => setFormData((p) => ({ ...p, _nuevoTajo: e.target.value }))}
                    />
                    <Button
                      type="button"
                      onClick={() => {
                        if (!formData._nuevoTajo?.trim()) return;
                        const nuevo = formData._nuevoTajo.trim();
                        setFormData((p) => ({
                          ...p,
                          _tajos: [...(p._tajos || []), nuevo],
                          subFuente: nuevo,
                          _nuevoTajo: "",
                        }));
                      }}
                    >
                      Agregar
                    </Button>
                  </div>
                )}
              </>
            )}
          </div>
        );
      }

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

    // validaciones rápidas
    if (!formData.operadorId) {
      await showError("Operador requerido", "Debe seleccionar un operador.");
      return;
    }
    if (!formData.maquinariaId) {
      await showError("Placa requerida", "Debe seleccionar una placa de maquinaria.");
      return;
    }

    // Confirmación
    const selectedOperator = operatorsList.find((op) => op.id === Number(formData.operadorId));
    const operatorName = selectedOperator ? `${selectedOperator.name} ${selectedOperator.last}` : `ID: ${formData.operadorId}`;
    const res = await confirmAction("¿Crear reporte?", "", {
      html: `<div style="text-align:left">
        <div><b>Operador:</b> ${operatorName || "—"}</div>
        <div><b>Tipo:</b> ${selectedMachineryType || formData.tipoMaquinaria || "—"}</div>
        <div><b>Placa:</b> ${formData.placa || "—"}</div>
      </div>`,
      confirmButtonText: "Guardar",
      cancelButtonText: "Revisar",
    });
    if (!res.isConfirmed) return;

    setLoading(true);
    showLoading("Guardando...", "Por favor, espere");

    try {
      // Horímetro / Kilometraje ≥ último
      if (requiresField("Horimetro") && lastCounters.horimetro != null) {
        if (Number(formData.horimetro) < Number(lastCounters.horimetro)) {
          closeLoading();
          await showError("Horímetro inválido", "Debe ser igual o mayor al último.");
          setLoading(false);
          return;
        }
      }
      if (requiresField("Kilometraje") && lastCounters.kilometraje != null) {
        if (Number(formData.kilometraje) < Number(lastCounters.kilometraje)) {
          closeLoading();
          await showError("Kilometraje inválido", "Debe ser igual o mayor al último.");
          setLoading(false);
          return;
        }
      }

      // Continuidad estación
      if (requiresField("Estacion")) {
        const d = Number(formData.estacionDesde || 0);
        const h = Number(formData.estacionHasta || 0);

        if (Number.isFinite(d) && Number.isFinite(h) && h < d) {
          closeLoading();
          await showError("Estación inválida", "'Hasta' no puede ser menor que 'Desde'.");
          setLoading(false);
          return;
        }

        if (lastCounters.estacionHasta != null) {
          const stale =
            lastCounters.estacionUpdatedAt &&
            Date.now() - new Date(lastCounters.estacionUpdatedAt).getTime() > THIRTY_DAYS;

          if (stale && d !== Number(lastCounters.estacionHasta)) {
            closeLoading();
            await showError(
              "Continuidad requerida",
              `Debe iniciar en ${lastCounters.estacionHasta} m (último avance en este camino).`
            );
            setLoading(false);
            return;
          }
          if (!stale && d < Number(lastCounters.estacionHasta)) {
            closeLoading();
            await showError("Continuidad requerida", `El 'Desde' debe ser ≥ ${lastCounters.estacionHasta} m.`);
            setLoading(false);
            return;
          }
        }
      }

      // === Validaciones específicas para MATERIAL (vagoneta/cabezal)
      if (isMaterialFlow()) {
        const totalM3 = Number(formData.totalCantidadMaterial || 0);
        if (!(Number.isFinite(totalM3) && totalM3 > 0)) {
          closeLoading();
          await showError("Total m³ requerido", "Ingrese el total de material del día (> 0).");
          setLoading(false);
          return;
        }

        const needsBoletaIfFuel = Number(formData.combustible || 0) > 0;
        for (const [i, b] of (formData.boletas || []).entries()) {
          const isRiverOrTajo = b.fuente === "Ríos" || b.fuente === "Tajo";

          if (isRiverOrTajo && !b.subFuente) {
            closeLoading();
            await showError(
              `Seleccione el ${b.fuente === "Ríos" ? "Río" : "Tajo"} en boleta #${i + 1}`,
              "Elija la sub-fuente."
            );
            setLoading(false);
            return;
          }

          if (!isRiverOrTajo && needsBoletaIfFuel) {
            if (!/^\d{6}$/.test(String(b.boleta || ""))) {
              closeLoading();
              await showError(`Boleta #${i + 1} inválida`, "Ingrese exactamente 6 dígitos.");
              setLoading(false);
              return;
            }
          }
        }
      }

// === Construir payload limpio ===
const isMat =
  ["vagoneta", "cabezal"].includes((selectedMachineryType || "").toLowerCase()) &&
  (selectedVariant || "").toLowerCase() === "material";

// —— RAÍZ: SOLO campos permitidos por CreateReportDto ——
const base = {
  operadorId: Number(formData.operadorId),
  maquinariaId: Number(formData.maquinariaId),
  fecha: formData.fecha,
  horasOrd: formData.horasOrd === "" ? null : Number(formData.horasOrd),
  horasExt: formData.horasExt === "" ? null : Number(formData.horasExt),
  diesel: formData.combustible === "" ? null : Number(formData.combustible),
  codigoCamino: formData.codigoCamino || null,
  distrito: formData.distrito || null,
  viaticos: formData.viaticos === "" ? null : Number(formData.viaticos),
  tipoActividad: formData.tipoActividad || null,
  horaInicio: formData.horaInicio || null,
  horaFin: formData.horaFin || null,

  // Si manejas horímetro/kilometraje en raíz (DTO los acepta):
  horimetro: formData.horimetro === "" ? null : Number(formData.horimetro),
  kilometraje: formData.kilometraje === "" ? null : Number(formData.kilometraje),

  // Si usas estación “N+M”, puedes armarla aquí (opcional):
  // estacion: formData.estacionDesde && formData.estacionHasta
  //   ? `${Number(formData.estacionDesde)}+${Number(formData.estacionHasta)}`
  //   : null,
};

// —— DETALLES: aquí sí puedes mandar tipo/variante/placa y todo lo específico ——
const detalles = {
  variante: selectedVariant || formData.variant || null,
  tipoMaquinaria: selectedMachineryType || formData.tipoMaquinaria || null,
  placa: formData.placa || null,

  // métrica estación desglosada (si la usas en UI)
  ...(formData.estacionDesde || formData.estacionHasta
    ? { estacionDesde: formData.estacionDesde || "", estacionHasta: formData.estacionHasta || "" }
    : {}),

  placaCarreta: formData.placaCarreta || "",
  tipoCarga: formData.tipoCarga || "",
  destino: formData.destino || "",
  placaMaquinariaLlevada: formData.placaMaquinariaLlevada || "",
  cantidadLiquido: formData.cantidadLiquido || "",

  // flujo “no material”
  tipoMaterial: formData.tipoMaterial || "",
  cantidadMaterial: formData.cantidadMaterial || "",
  boleta: formData.boleta || "",
  fuente: formData.fuente || "",
  subFuente: formData.subFuente || "",

  // flujo MATERIAL
  ...(isMat
    ? {
        totalCantidadMaterial:
          formData.totalCantidadMaterial === "" ? null : Number(formData.totalCantidadMaterial),
        boletas: Array.isArray(formData.boletas) ? formData.boletas : [],
      }
    : {}),
};

const payload = { ...base, detalles };

// ¡y solo una vez!
const result = await machineryService.createReport(payload);

      // ✅ REGISTRAR EN AUDITORÍA
      console.log('🔍 Verificando resultado para logging:', result);
      if (result && result.success) {
        console.log('📝 Iniciando logging de auditoría para reporte...');
        console.log('🔧 Datos para logging:', {
          entity: 'reportes',
          data: result.data,
          description: `Se creó reporte de ${selectedMachineryType || formData.tipoMaquinaria} - Placa: ${formData.placa} - Operador: ${operatorName}`
        });
        
        const auditResult = await logCreate('reportes', result.data,
          `Se creó reporte de ${selectedMachineryType || formData.tipoMaquinaria} - Placa: ${formData.placa} - Operador: ${operatorName}`
        );
        
        console.log('✅ Resultado del logging de auditoría:', auditResult);
      } else {
        console.log('❌ No se realizó logging - resultado:', result);
      }

      closeLoading();
      await showSuccess("Reporte guardado", "El reporte ha sido enviado al administrador.");

      setFormData({ ...INITIAL_FORM, fecha: new Date().toISOString().split("T")[0] });
      setSelectedMachineryType("");
      setSelectedVariant("");
      setTotalHours("");
      setLastCounters({ horimetro: null, kilometraje: null, estacionHasta: null, estacionUpdatedAt: null });
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
                    No hay placas disponibles para este tipo/variante{" "}
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

          {/* Sección BOLETAS (solo material) */}
          {isMaterialFlow() && (
            <div className="space-y-3">
              <div className="flex items-center justify-between">
                <h3 className="text-lg font-semibold">Boletas del día</h3>
                <Button type="button" onClick={addBoleta}>
                  + Agregar boleta
                </Button>
              </div>

              {(formData.boletas || []).map((b, idx) => {
                const isRiverOrTajo = b.fuente === "Ríos" || b.fuente === "Tajo";
                return (
                  <div key={idx} className="border rounded-xl p-3 space-y-3 bg-white">
                    <div className="flex items-center justify-between">
                      <div className="text-sm font-medium">Boleta #{idx + 1}</div>
                      <Button type="button" variant="secondary" onClick={() => removeBoleta(idx)}>
                        Eliminar
                      </Button>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
                      {!isRiverOrTajo && (
                        <div>
                          <Label>Boleta (6 dígitos)</Label>
                          <Input
                            inputMode="numeric"
                            pattern="\d{6}"
                            maxLength={6}
                            value={b.boleta || ""}
                            onChange={(e) =>
                              updateBoleta(idx, {
                                boleta: (e.target.value || "").replace(/\D/g, "").slice(0, 6),
                              })
                            }
                            placeholder="000000"
                          />
                        </div>
                      )}

                      <div>
                        <Label>Tipo de material</Label>
                        <Select value={b.tipoMaterial || ""} onValueChange={(v) => updateBoleta(idx, { tipoMaterial: v })}>
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
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
                      <div>
                        <Label>Fuente</Label>
                        <Select
                          value={b.fuente || ""}
                          onValueChange={(v) =>
                            updateBoleta(idx, {
                              fuente: v,
                              subFuente: "",
                              boleta: v === "Ríos" || v === "Tajo" ? "" : b.boleta || "",
                            })
                          }
                        >
                          <SelectTrigger>
                            <SelectValue placeholder="Seleccionar fuente" />
                          </SelectTrigger>
                          <SelectContent>
                            {(getFuenteOptions() || ["Palo de Arco", "Ríos", "Tajo"]).map((f) => (
                              <SelectItem key={f} value={f}>
                                {f}
                              </SelectItem>
                            ))}
                          </SelectContent>
                        </Select>
                      </div>

                      {b.fuente === "Ríos" && (
                        <div>
                          <Label>Río</Label>
                          <Select value={b.subFuente || ""} onValueChange={(v) => updateBoleta(idx, { subFuente: v })}>
                            <SelectTrigger>
                              <SelectValue placeholder="Seleccionar río" />
                            </SelectTrigger>
                            <SelectContent>
                              {rivers.map((r) => (
                                <SelectItem key={r} value={r}>
                                  {r}
                                </SelectItem>
                              ))}
                            </SelectContent>
                          </Select>
                        </div>
                      )}

                      {b.fuente === "Tajo" && (
                        <div>
                          <Label>Tajo</Label>
                          <Select value={b.subFuente || ""} onValueChange={(v) => updateBoleta(idx, { subFuente: v })}>
                            <SelectTrigger>
                              <SelectValue placeholder="Seleccionar tajo" />
                            </SelectTrigger>
                            <SelectContent>
                              {(formData._tajos || []).map((t) => (
                                <SelectItem key={t} value={t}>
                                  {t}
                                </SelectItem>
                              ))}
                              <SelectItem value="__add__">+ Agregar nuevo tajo…</SelectItem>
                            </SelectContent>
                          </Select>

                          {b.subFuente === "__add__" && (
                            <div className="flex gap-2 mt-2">
                              <Input
                                placeholder="Nombre del tajo"
                                value={formData._nuevoTajo || ""}
                                onChange={(e) => setFormData((p) => ({ ...p, _nuevoTajo: e.target.value }))}
                              />
                              <Button
                                type="button"
                                onClick={() => {
                                  if (!formData._nuevoTajo?.trim()) return;
                                  const nuevo = formData._nuevoTajo.trim();
                                  setFormData((p) => ({
                                    ...p,
                                    _tajos: [...(p._tajos || []), nuevo],
                                    _nuevoTajo: "",
                                    boletas: (p.boletas || []).map((x, i) => (i === idx ? { ...x, subFuente: nuevo } : x)),
                                  }));
                                }}
                              >
                                Agregar
                              </Button>
                            </div>
                          )}
                        </div>
                      )}
                    </div>
                  </div>
                );
              })}
            </div>
          )}

          {isMaterialFlow() && (
            <div className="space-y-2">
              <Label htmlFor="totalCantidadMaterial">Total m³ del día</Label>
              <div className="flex gap-2 items-center">
                <Input
                  id="totalCantidadMaterial"
                  name="totalCantidadMaterial"
                  inputMode="numeric"
                  pattern="\d*"
                  placeholder="00"
                  maxLength={4}
                  value={formData.totalCantidadMaterial ?? ""}
                  onChange={(e) =>
                    setFormData((p) => ({
                      ...p,
                      totalCantidadMaterial: (e.target.value || "").replace(/\D/g, "").slice(0, 4),
                    }))
                  }
                />
                <span className="text-sm text-muted-foreground">m³</span>
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

