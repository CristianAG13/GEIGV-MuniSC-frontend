"use client";

import { useMemo, useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { useToast } from "@/hooks/use-toast";
import machineryService from "@/services/machineryService";
import operatorsService from "@/services/operatorsService";
import { rentalSourceOptions } from "@/utils/districts";
import { districts as districtList } from "@/utils/districts"; // si existe
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

/** Fuente y Cantidad aplican a vagoneta/cisterna/cabezal */
const TIPOS_CON_FUENTE = new Set(["vagoneta", "cisterna", "cabezal"]);
const TIPOS_CON_CANTIDAD = new Set(["vagoneta", "cisterna", "cabezal"]);

/** tipos que usan ESTACIÓN N+M */
const TIPOS_CON_ESTACION = new Set(["niveladora", "excavadora", "compactadora", "backhoe"]);

/** tipos que usan BOLETA (solo estos) */
const TIPOS_CON_BOLETA = new Set(["vagoneta", "cabezal"]);



const ACTIVIDADES_POR_TIPO = {
  vagoneta: ["Acarreo de material", "Riego de agua"],
  cabezal: ["Acarreo de material", "Riego de agua"],
  cisterna: ["Riego de agua", "Transporte de agua"],
  excavadora: ["Extracción y cargo de material", "Colocación de alcantarillas", "Limpieza"],
  niveladora: ["Limpieza", "Conformación", "Lastreado"],
  backhoe: ["Limpieza", "Colocación de alcantarillas", "Extensión de material", "Carga de material", "Excavación", "Extracción de material", "Demolición"],
  compactadora: ["Compactación"],
  cargador: ["Cargar"],
};

/* ---- helpers ---- */
const onlyDigitsMax = (v, max) => String(v || "").replace(/\D/g, "").slice(0, max);
const clampHoras = (raw) => {
  const digits = String(raw || "").replace(/\D/g, "");
  if (!digits) return "";
  const n = Math.max(0, Math.min(18, Number(digits)));
  return String(n);
};
/** número positivo con un solo punto decimal */
const sanitizeCantidad = (raw) =>
  String(raw || "").replace(/[^\d.]/g, "").replace(/(\..*)\./g, "$1");

/** Fecha local YYYY-MM-DD */
function todayLocalISO() {
  const now = new Date();
  const tz = now.getTimezoneOffset() * 60000;
  return new Date(now.getTime() - tz).toISOString().slice(0, 10);
}

const COLS = { 1: "md:grid-cols-1", 2: "md:grid-cols-2", 3: "md:grid-cols-3" };

// --- helpers (arriba del componente) ---
function normalizeFuenteRental(raw = "") {
  const s = String(raw).trim();
  if (!s) return { fuente: null, sub: null };

  // "Río Santa Barbara" -> fuente="Ríos", sub="Santa Barbara"
  if (/^r[ií]o\b/i.test(s)) return { fuente: "Ríos", sub: s.replace(/^r[ií]o\b/i, "").trim() || null };
  // "Ríos" literal
  if (/^r[ií]os\b/i.test(s)) return { fuente: "Ríos", sub: null };
  // "Tajo" literal
  if (/^tajo\b/i.test(s)) return { fuente: "Tajo", sub: null };
  // "KYLCSA" literal
  if (/^kylcsa$/i.test(s)) return { fuente: "KYLCSA", sub: null };

  // por defecto, deja el texto como fuente (si backend lo permite)
  return { fuente: s, sub: null };
}


export default function CreateRentalReportForm() {
  const { toast } = useToast();
  const [loading, setLoading] = useState(false);
  const [operatorsList, setOperatorsList] = useState([]);

  const [formData, setFormData] = useState({
    fecha: todayLocalISO(),
    operadorId: "",
    tipoMaquinaria: "",
    placa: "",
    cantidad: "",
    actividad: "",
    horas: "",
    fuente: "",
    boleta: "",   // municipal (6 dígitos)
    boletaK: "",  // KYLCSA   (6 dígitos)
    codigoCamino: "",
    distrito: "",
    estacion: "", // N+M
  });

  const actividadOptions = useMemo(
    () => (formData.tipoMaquinaria ? ACTIVIDADES_POR_TIPO[formData.tipoMaquinaria] ?? [] : []),
    [formData.tipoMaquinaria]
  );

  // Fuente depende del tipo/actividad (solo vagoneta/cisterna/cabezal)
  // Fuente depende del tipo/actividad (solo vagoneta/cisterna/cabezal)
  const fuenteOptions = useMemo(() => {
    const tipo = (formData.tipoMaquinaria || "").toLowerCase();
    if (!tipo || !TIPOS_CON_FUENTE.has(tipo)) return [];

    const act = (formData.actividad || "").toLowerCase();
    const cfg = rentalSourceOptions?.[tipo] ?? null;

    // helper: normaliza a array
    const asArray = (x) =>
      Array.isArray(x) ? x : (x && typeof x === "string" ? [x] : []);

    // 1) Si el config ya es un array (p.ej. cisterna: ["Ríos", "Pozo", ...])
    if (Array.isArray(cfg)) return cfg;

    // 2) Si no hay config para el tipo, usa default si existe
    if (!cfg) return asArray(rentalSourceOptions?.default) ?? [];

    // 3) Objeto con llaves; decide por tipo/actividad
    if (tipo === "cisterna") {
      return asArray(cfg.cisterna ?? cfg.agua ?? cfg.default ?? rentalSourceOptions?.default);
    }

    // vagoneta / cabezal
    if (act.includes("material")) {
      return asArray(cfg.material ?? rentalSourceOptions?.default);
    }
    if (act.includes("agua") || act.includes("riego") || act.includes("cisterna")) {
      return asArray(cfg.cisterna ?? cfg.agua ?? rentalSourceOptions?.default);
    }

    // fallback razonable
    return asArray(cfg.material ?? cfg.cisterna ?? rentalSourceOptions?.default);
  }, [formData.tipoMaquinaria, formData.actividad]);


  const showFuente = TIPOS_CON_FUENTE.has(formData.tipoMaquinaria) && fuenteOptions.length > 0;
  const showCantidad = TIPOS_CON_CANTIDAD.has(formData.tipoMaquinaria);

  const showEstacion = TIPOS_CON_ESTACION.has(formData.tipoMaquinaria);


  // Habilitación de boleta según fuente
  const boletaMode = TIPOS_CON_BOLETA.has(formData.tipoMaquinaria)
    ? ((formData.fuente || "").toUpperCase() === "KYLCSA" ? "kylcsa" : "municipal")
    : "disabled";

  useEffect(() => {
    (async () => {
      try {
        const operators = await operatorsService.getAllOperators();
        setOperatorsList(Array.isArray(operators) ? operators : []);
      } catch (error) {
        console.error(error);
        toast({ title: "Error", description: "No se pudieron cargar los operadores.", variant: "destructive" });
      }
    })();
  }, [toast]);

  const handleChange = (e) => {
    const { name, value } = e.target;

    if (name === "fecha") {
      const hoy = todayLocalISO();
      const v = value > hoy ? hoy : value;
      setFormData((p) => ({ ...p, fecha: v }));
      return;
    }

    if (name === "horas") {
      setFormData((p) => ({ ...p, horas: clampHoras(value) }));
      return;
    }

    if (name === "boleta") {
      setFormData((p) => ({ ...p, boleta: onlyDigitsMax(value, 6) }));
      return;
    }

    if (name === "boletaK") {
      setFormData((p) => ({ ...p, boletaK: onlyDigitsMax(value, 6) }));
      return;
    }

    if (name === "cantidad") {
      setFormData((p) => ({ ...p, cantidad: sanitizeCantidad(value) }));
      return;
    }

    if (name === "codigoCamino") {
      setFormData((p) => ({ ...p, codigoCamino: onlyDigitsMax(value, 3) }));
      return;
    }

    setFormData((p) => ({ ...p, [name]: value }));
  };


  const handleChangeTipo = (tipo) => {
    setFormData((p) => ({
      ...p,
      tipoMaquinaria: tipo,
      actividad: "",
      fuente: "",
      boleta: "",
      boletaK: "",
      estacion: TIPOS_CON_ESTACION.has(tipo) ? p.estacion : "",
      ...(TIPOS_CON_CANTIDAD.has(tipo) ? {} : { cantidad: "" }),
    }));
  };

  const handleFuenteChange = (v) => {
    setFormData((p) => ({
      ...p,
      fuente: v,
      // si cambia a KYLCSA, limpiamos la municipal; si cambia a otra, limpiamos la KYLCSA
      boleta: v === "KYLCSA" ? "" : p.boleta,
      boletaK: v === "KYLCSA" ? p.boletaK : "",
    }));
  };


  const handleSubmit = async (e) => {
    e.preventDefault();
    if (loading) return;

    if (!formData.operadorId) return toast({ title: "Encargado requerido", description: "Selecciona el encargado.", variant: "destructive" });
    if (!formData.tipoMaquinaria) return toast({ title: "Tipo requerido", description: "Selecciona el tipo de maquinaria.", variant: "destructive" });
    if (!formData.actividad) return toast({ title: "Actividad requerida", description: "Selecciona la actividad.", variant: "destructive" });
    if (formData.horas === "" || !/^\d+$/.test(formData.horas) || Number(formData.horas) > 18)
      return toast({ title: "Horas inválidas", description: "Ingresa un entero entre 0 y 18.", variant: "destructive" });

    const hoy = todayLocalISO();
    if (formData.fecha > hoy)
      return toast({ title: "Fecha inválida", description: "Solo se permiten fechas de hoy o del pasado.", variant: "destructive" });

    // Reglas de boletas según fuente
    if (showFuente) {
      if (formData.fuente === "KYLCSA") {
        if (!/^\d{6}$/.test(formData.boletaK || "")) {
          return toast({
            title: "Boleta KYLCSA requerida",
            description: "Ingrese exactamente 6 dígitos.",
            variant: "destructive",
          });
        }
      } else {
        // Municipal (incluye Río/Tajo u otras): si la escriben, debe tener 6 dígitos
        if (formData.boleta && !/^\d{6}$/.test(formData.boleta)) {
          return toast({
            title: "Boleta inválida",
            description: "Debe tener exactamente 6 dígitos (o dejar vacía).",
            variant: "destructive",
          });
        }
      }
    }

    if (!/^\d{3}$/.test(String(formData.codigoCamino || ""))) {
      return toast({
        title: "Código de camino inválido",
        description: "Debes ingresar exactamente 3 dígitos (ej. 015).",
        variant: "destructive",
      });
    }
    if (!formData.distrito) {
      return toast({
        title: "Distrito requerido",
        description: "Selecciona un distrito.",
        variant: "destructive",
      });
    }

    // Normaliza la fuente para que el backend reciba "Ríos" | "Tajo" | "KYLCSA"
    const { fuente: fuenteNorm } = normalizeFuenteRental(formData.fuente);

    // Valida cantidad (>0) cuando aplica (cisterna/vagoneta/cabezal)
    if (showCantidad) {
      const cant = Number(formData.cantidad);
      if (!Number.isFinite(cant) || cant <= 0) {
        return toast({ title: "Cantidad inválida", description: "Debe ser mayor a 0.", variant: "destructive" });
      }
    }


    const payload = {
      fecha: formData.fecha,
      operadorId: Number(formData.operadorId),
      tipoMaquinaria: formData.tipoMaquinaria,
      placa: formData.placa || null,
      actividad: formData.actividad,
      horas: Number(formData.horas),
      cantidad: showCantidad ? (formData.cantidad === "" ? null : Number(formData.cantidad)) : null,

      // ⬅️ aquí el cambio importante
      fuente: showFuente ? (fuenteNorm || null) : null,

      boleta: TIPOS_CON_BOLETA.has(formData.tipoMaquinaria)
        ? (formData.fuente === "KYLCSA" ? null : (formData.boleta || null))
        : null,
      boletaKylcsa: TIPOS_CON_BOLETA.has(formData.tipoMaquinaria)
        ? (formData.fuente === "KYLCSA" ? (formData.boletaK || null) : null)
        : null,

      codigoCamino: formData.codigoCamino,
      distrito: formData.distrito,
      estacion: showEstacion ? (formData.estacion || null) : null,
    };

    try {
      setLoading(true);
      await machineryService.createRentalReport(payload);
      toast({ title: "Boleta de alquiler creada", description: "Se registró correctamente." });
      setFormData({
        fecha: todayLocalISO(),
        operadorId: "",
        tipoMaquinaria: "",
        placa: "",
        cantidad: "",
        actividad: "",
        horas: "",
        fuente: "",
        boleta: "",
        boletaK: "",
        codigoCamino: "",
        distrito: "",
        estacion: "",
      });
    } catch (err) {
      console.error("CREATE rental error ->", err?.response?.data || err);
      toast({
        title: "Error al crear boleta",
        description: err?.response?.data?.message || "No se pudo guardar el registro.",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  }


  const handleDistritoChange = (v) =>
    setFormData((p) => ({ ...p, distrito: v }));


  // ======= Cols por fila según visibilidad =======
  const showBoletaMunicipal = boletaMode === "municipal";
  const showBoletaK = boletaMode === "kylcsa";
  const showAnyBoleta = showBoletaMunicipal || showBoletaK;

  const row1Cols = 1 + (showAnyBoleta ? 1 : 0) + (showFuente ? 1 : 0); // Encargado + (Boleta?) + (Fuente?)
  const row3Cols = showCantidad ? 2 : 1; // Cantidad? + Horas

  return (
    <Card className="w-full max-w-4xl mx-auto">
      <CardHeader>
        <CardTitle>Boleta de alquiler</CardTitle>
        <CardDescription>Registra el alquiler de maquinaria externa</CardDescription>
      </CardHeader>

      <CardContent>
        <form onSubmit={handleSubmit} className="space-y-6">
          {/* ==== Fila 1: Encargado | (N° Boleta si aplica) | (Fuente si aplica) ==== */}
          <div className={`grid grid-cols-1 ${COLS[row1Cols]} gap-4`}>
            {/* Encargado */}
            <div className="space-y-2">
              <Label>Encargado</Label>
              <Select value={formData.operadorId} onValueChange={(v) => setFormData((p) => ({ ...p, operadorId: v }))}>
                <SelectTrigger><SelectValue placeholder="Seleccionar encargado" /></SelectTrigger>
                <SelectContent>
                  {operatorsList.map((op) => (
                    <SelectItem key={op.id} value={String(op.id)}>
                      {op.name} {op.last} {op.identification ? `(${op.identification})` : ""}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            {/* N.º de boleta (solo cuando aplica) */}
            {showAnyBoleta && (
              <div className="space-y-2">
                <Label htmlFor="boleta">N.º de boleta</Label>
                {showBoletaK ? (
                  <Input
                    id="boletaK"
                    name="boletaK"
                    inputMode="numeric"
                    pattern="[0-9]{6}"
                    maxLength={6}
                    placeholder="000000 (KYLCSA)"
                    value={formData.boletaK}
                    onChange={handleChange}
                  />
                ) : (
                  showBoletaMunicipal && (
                    <Input
                      id="boleta"
                      name="boleta"
                      inputMode="numeric"
                      pattern="[0-9]{6}"
                      maxLength={6}
                      placeholder="000000"
                      value={formData.boleta}
                      onChange={handleChange}
                    />
                  )
                )}
              </div>
            )}

            {/* Fuente (solo cuando aplica) */}
            {showFuente && (
              <div className="space-y-2">
                <Label>Fuente</Label>
                <Select value={formData.fuente} onValueChange={handleFuenteChange}>
                  <SelectTrigger><SelectValue placeholder="Seleccionar fuente" /></SelectTrigger>
                  <SelectContent>
                    {fuenteOptions.map((f) => (<SelectItem key={f} value={f}>{f}</SelectItem>))}
                  </SelectContent>
                </Select>
              </div>
            )}
          </div>

          {/* ==== Fila 2: Fecha | Tipo de maquinaria | Placa ==== */}
          <div className={`grid grid-cols-1 ${COLS[3]} gap-4`}>
            <div className="space-y-2">
              <Label htmlFor="fecha">Fecha</Label>
              <Input id="fecha" name="fecha" type="date" value={formData.fecha} onChange={handleChange} max={todayLocalISO()} required />
            </div>

            <div className="space-y-2">
              <Label>Tipo de maquinaria</Label>
              <Select value={formData.tipoMaquinaria} onValueChange={handleChangeTipo}>
                <SelectTrigger><SelectValue placeholder="Seleccionar tipo" /></SelectTrigger>
                <SelectContent>
                  {TIPOS_MAQUINARIA.map((t) => (<SelectItem key={t} value={t}>{t}</SelectItem>))}
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2">
              <Label htmlFor="placa">Placa</Label>
              <Input id="placa" name="placa" value={formData.placa} onChange={handleChange} placeholder="SM 1234" />
            </div>
          </div>

          {/* ==== Fila 2.1: Código de camino | Distrito ==== */}
          <div className={`grid grid-cols-1 ${COLS[2]} gap-4`}>

            <div className="space-y-2">
              <Label>Distrito</Label>
              <Select value={formData.distrito} onValueChange={handleDistritoChange}>
                <SelectTrigger>
                  <SelectValue placeholder="Seleccionar distrito" />
                </SelectTrigger>
                <SelectContent>
                  {districtList.map((d) => (
                    <SelectItem key={d} value={d}>{d}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2">
              <Label htmlFor="codigoCamino">Código de camino</Label>
              <Input
                id="codigoCamino"
                name="codigoCamino"
                inputMode="numeric"
                pattern="[0-9]{3}"
                maxLength={3}
                placeholder="000"
                value={formData.codigoCamino}
                onChange={handleChange}
              />
              <p className="text-xs text-gray-500 mt-1">Debe tener exactamente 3 dígitos.</p>
            </div>

          </div>

          {/* ==== Fila 2.2: Estación (N+M) si aplica ==== */}
          {showEstacion && (
            <div className="grid grid-cols-1 gap-4">
              <div className="space-y-2">
                <Label htmlFor="estacion">Estación (N+M)</Label>
                <Input
                  id="estacion"
                  name="estacion"
                  placeholder="Ej: 12+500"
                  value={formData.estacion}
                  onChange={handleChange}
                />
                <p className="text-xs text-gray-500 mt-1">Formato N+M, p. ej. 12+500.</p>
              </div>
            </div>
          )}


          {/* ==== Fila 3: Cantidad (si aplica) | Horas ==== */}
          <div className={`grid grid-cols-1 ${COLS[row3Cols]} gap-4`}>
            {showCantidad && (
              <div className="space-y-2">
                <Label htmlFor="cantidad">Cantidad de góndola</Label>
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
              <Label htmlFor="horas">Horas laboradas</Label>
              <Input
                id="horas"
                name="horas"
                inputMode="numeric"
                pattern="[0-9]*"
                placeholder="0"
                value={formData.horas}
                onChange={handleChange}
              />
              <p className="text-xs text-muted-foreground">Solo enteros 0–18.</p>
            </div>
          </div>

          {/* ==== Fila 4: Tipo de actividad ==== */}
          <div className="grid grid-cols-1 gap-4">
            <div className="space-y-2">
              <Label>Tipo de actividad</Label>
              <Select
                value={formData.actividad}
                onValueChange={(v) => setFormData((p) => ({ ...p, actividad: v }))}
                disabled={!formData.tipoMaquinaria}
              >
                <SelectTrigger>
                  <SelectValue placeholder={formData.tipoMaquinaria ? "Seleccionar actividad" : "Elige un tipo primero"} />
                </SelectTrigger>
                <SelectContent>
                  {actividadOptions.map((a) => (<SelectItem key={a} value={a}>{a}</SelectItem>))}
                </SelectContent>
              </Select>
            </div>
          </div>

          <Button
            type="submit"
            disabled={loading}
            className={[
              "flex items-center justify-center mx-auto",
              "px-6 py-2.5 min-w-[14rem] w-fit",
              "text-white font-semibold text-sm",
              "border-2 border-green-700",
              "ring-1 ring-inset ring-green-900/25",
              "bg-gradient-to-b from-green-600 to-green-500",
              "hover:from-green-600 hover:to-green-400",
              "rounded-lg shadow-md hover:shadow-lg",
              "disabled:opacity-60 disabled:cursor-not-allowed",
            ].join(" ")}
          >
            {loading ? "Enviando..." : "Crear reporte"}
          </Button>
        </form>
      </CardContent>
    </Card>
  );
}
