
"use client";

import { useMemo, useState } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { useToast } from "@/hooks/use-toast";
import machineryService from "@/services/machineryService";

/* ---- catálogos ---- */
const TIPOS_MAQUINARIA = [
  "vagoneta",
  "cisterna",
  "cabezal",
  "excavadora",
  "niveladora",
  "compactadora",
  "backhoe",
  "cargador",
];

// dónde mostrar cada campo
const TIPOS_CON_CANTIDAD = new Set(["vagoneta", "cisterna", "cabezal"]);
const TIPOS_CON_ESTACION = new Set(["excavadora", "niveladora", "compactadora", "backhoe", "cargador"]);

const ACTIVIDADES_POR_TIPO = {
  vagoneta: ["Acarreo de material", "Riego de agua"],
  cabezal: ["Acarreo de material", "Riego de agua"],
  cisterna: ["Riego de agua", "Transporte de agua"],
  excavadora: ["Extracción y cargo de material", "Colocación de alcantarillas", "Limpieza"],
  niveladora: ["Limpieza", "Conformación", "Lastreado"],
  backhoe: [
    "Limpieza",
    "Colocación de alcantarillas",
    "Extensión de material",
    "Carga de material",
    "Excavación",
    "Extracción de material",
    "Demolición",
  ],
  compactadora: ["Compactación"],
  cargador: ["Cargar"],
};

/* ---- helpers ---- */
const onlyDigitsMax = (v, max) => String(v || "").replace(/\D/g, "").slice(0, max);

/** Horas: solo enteros 0–18 (string controlada) */
const clampHoras = (raw) => {
  const digits = String(raw || "").replace(/\D/g, "");
  if (!digits) return "";
  const n = Math.max(0, Math.min(18, Number(digits)));
  return String(n);
};

/** Cantidad: número positivo, permite un solo punto decimal */
const sanitizeCantidad = (raw) =>
  String(raw || "")
    .replace(/[^\d.]/g, "")
    .replace(/(\..*)\./g, "$1");

export default function CreateRentalReportForm() {
  const { toast } = useToast();
  const [loading, setLoading] = useState(false);

  const [formData, setFormData] = useState({
    fecha: new Date().toISOString().split("T")[0],
    tipoMaquinaria: "",
    placa: "",
    actividad: "",
    cantidad: "", // <- visible solo para vagoneta/cisterna/cabezal
    horas: "", // <- string para controlar 0–18
    estacion: "", // <- visible solo para excavadora/niveladora/compactadora/backhoe/cargador
    boleta: "",
  });

  const actividadOptions = useMemo(
    () => (formData.tipoMaquinaria ? ACTIVIDADES_POR_TIPO[formData.tipoMaquinaria] ?? [] : []),
    [formData.tipoMaquinaria]
  );

  // flags de visibilidad
  const showCantidad = TIPOS_CON_CANTIDAD.has(formData.tipoMaquinaria);
  const showEstacion = TIPOS_CON_ESTACION.has(formData.tipoMaquinaria);

  const handleChange = (e) => {
    const { name, value } = e.target;

    if (name === "horas") {
      return setFormData((p) => ({ ...p, horas: clampHoras(value) }));
    }

    if (name === "boleta") {
      return setFormData((p) => ({ ...p, boleta: onlyDigitsMax(value, 6) }));
    }

    if (name === "cantidad") {
      return setFormData((p) => ({ ...p, cantidad: sanitizeCantidad(value) }));
    }

    setFormData((p) => ({ ...p, [name]: value }));
  };

  const handleChangeTipo = (tipo) => {
    setFormData((p) => {
      const next = {
        ...p,
        tipoMaquinaria: tipo,
        actividad: "", // resetea actividad dependiente
      };
      // si el campo se va a ocultar, limpiamos su valor
      if (!TIPOS_CON_CANTIDAD.has(tipo)) next.cantidad = "";
      if (!TIPOS_CON_ESTACION.has(tipo)) next.estacion = "";
      return next;
    });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (loading) return;

    // Validaciones mínimas
    if (!formData.tipoMaquinaria) {
      toast({ title: "Tipo requerido", description: "Selecciona el tipo de maquinaria.", variant: "destructive" });
      return;
    }
    if (!formData.actividad) {
      toast({ title: "Actividad requerida", description: "Selecciona la actividad.", variant: "destructive" });
      return;
    }
    if (formData.horas === "" || !/^\d+$/.test(formData.horas) || Number(formData.horas) > 18) {
      toast({ title: "Horas inválidas", description: "Ingresa un entero entre 0 y 18.", variant: "destructive" });
      return;
    }
    if (formData.boleta && !/^\d{6}$/.test(formData.boleta)) {
      toast({ title: "Boleta inválida", description: "Debe tener exactamente 6 dígitos (o dejar vacía).", variant: "destructive" });
      return;
    }

    const payload = {
      fecha: formData.fecha,
      tipoMaquinaria: formData.tipoMaquinaria,
      placa: formData.placa || null,
      actividad: formData.actividad,
      cantidad: showCantidad
        ? formData.cantidad === ""
          ? null
          : Number(formData.cantidad)
        : null,
      horas: Number(formData.horas),
      estacion: showEstacion ? formData.estacion || null : null,
      boleta: formData.boleta || null,
    };

    try {
      setLoading(true);
      await machineryService.createRentalReport(payload);
      toast({ title: "Boleta de alquiler creada", description: "Se registró correctamente." });

      setFormData({
        fecha: new Date().toISOString().split("T")[0],
        tipoMaquinaria: "",
        placa: "",
        actividad: "",
        cantidad: "",
        horas: "",
        estacion: "",
        boleta: "",
      });
    } catch (err) {
      console.error(err);
      toast({
        title: "Error al crear boleta",
        description: err?.response?.data?.message || "No se pudo guardar el registro.",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  return (
    <Card className="w-full max-w-3xl mx-auto">
      <CardHeader>
        <CardTitle>Boleta de Alquiler</CardTitle>
        <CardDescription>Registra el alquiler de maquinaria externa</CardDescription>
      </CardHeader>

      <CardContent>
        <form onSubmit={handleSubmit} className="space-y-5">
          {/* Fila 1: Fecha / Tipo */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="fecha">Fecha</Label>
              <Input id="fecha" name="fecha" type="date" value={formData.fecha} onChange={handleChange} required />
            </div>

            <div className="space-y-2">
              <Label>Tipo de Maquinaria</Label>
              <Select value={formData.tipoMaquinaria} onValueChange={handleChangeTipo}>
                <SelectTrigger>
                  <SelectValue placeholder="Seleccionar tipo" />
                </SelectTrigger>
                <SelectContent>
                  {TIPOS_MAQUINARIA.map((t) => (
                    <SelectItem key={t} value={t}>
                      {t}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </div>

          {/* Fila 2: Placa / (Cantidad condicional) / Horas */}
          <div className={`grid grid-cols-1 ${showCantidad ? "md:grid-cols-3" : "md:grid-cols-2"} gap-4`}>
            <div className="space-y-2">
              <Label htmlFor="placa">Placa</Label>
              <Input id="placa" name="placa" value={formData.placa} onChange={handleChange} placeholder="SM 1234" />
            </div>

            {showCantidad && (
              <div className="space-y-2">
                <Label htmlFor="cantidad">Cantidad</Label>
                <Input
                  id="cantidad"
                  name="cantidad"
                  inputMode="decimal"
                  placeholder="0.00"
                  value={formData.cantidad}
                  onChange={handleChange}
                />
              </div>
            )}

            <div className="space-y-2">
              <Label htmlFor="horas">Horas</Label>
              <Input
                id="horas"
                name="horas"
                inputMode="numeric"
                pattern="\d*"
                placeholder="0"
                value={formData.horas}
                onChange={handleChange}
              />
              <p className="text-xs text-muted-foreground">Solo enteros 0–18.</p>
            </div>
          </div>

          {/* Actividad (select dependiente) */}
          <div className="space-y-2">
            <Label>Actividad</Label>
            <Select
              value={formData.actividad}
              onValueChange={(v) => setFormData((p) => ({ ...p, actividad: v }))}
              disabled={!formData.tipoMaquinaria}
            >
              <SelectTrigger>
                <SelectValue placeholder={formData.tipoMaquinaria ? "Seleccionar actividad" : "Elige un tipo primero"} />
              </SelectTrigger>
              <SelectContent>
                {actividadOptions.map((a) => (
                  <SelectItem key={a} value={a}>
                    {a}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          {/* Fila 3: Estación (condicional) / Boleta */}
          <div className={`grid grid-cols-1 ${showEstacion ? "md:grid-cols-2" : "md:grid-cols-1"} gap-4`}>
            {showEstacion && (
              <div className="space-y-2">
                <Label htmlFor="estacion">Estación</Label>
                <Input
                  id="estacion"
                  name="estacion"
                  value={formData.estacion}
                  onChange={handleChange}
                  placeholder="0-100"
                />
              </div>
            )}

            <div className="space-y-2">
              <Label htmlFor="boleta">Boleta</Label>
              <Input
                id="boleta"
                name="boleta"
                inputMode="numeric"
                pattern="\d{6}"
                maxLength={6}
                placeholder="000000"
                value={formData.boleta}
                onChange={handleChange}
              />
            </div>
          </div>

          <Button type="submit" disabled={loading} className="w-full">
            {loading ? "Enviando..." : "Crear Boleta de Alquiler"}
          </Button>
        </form>
      </CardContent>
    </Card>
  );
}


