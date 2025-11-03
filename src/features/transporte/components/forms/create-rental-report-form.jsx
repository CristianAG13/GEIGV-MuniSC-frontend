
// "use client";

// import { useMemo, useState, useEffect } from "react";
// import { Button } from "@/components/ui/button";
// import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
// import { Input } from "@/components/ui/input";
// import { Label } from "@/components/ui/label";
// import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
// import { useToast } from "@/hooks/use-toast";
// import machineryService from "@/services/machineryService";
// import operatorsService from "@/services/operatorsService";
// import { rentalSourceOptions } from "@/utils/districts";

// /* ---- catálogos ---- */
// const TIPOS_MAQUINARIA = [
//   "vagoneta",
//   "cisterna",
//   "cabezal",
//   "excavadora",
//   "niveladora",
//   "compactadora",
//   "backhoe",
//   "cargador",
// ];

// // dónde mostrar cada campo
// const TIPOS_CON_CANTIDAD = new Set(["vagoneta", "cisterna", "cabezal"]);
// const TIPOS_CON_ESTACION = new Set(["excavadora", "niveladora", "compactadora", "backhoe", "cargador"]);
// const TIPOS_CON_FUENTE = new Set(["vagoneta", "cisterna", "cabezal"]);

// const ACTIVIDADES_POR_TIPO = {
//   vagoneta: ["Acarreo de material", "Riego de agua"],
//   cabezal: ["Acarreo de material", "Riego de agua"],
//   cisterna: ["Riego de agua", "Transporte de agua"],
//   excavadora: ["Extracción y cargo de material", "Colocación de alcantarillas", "Limpieza"],
//   niveladora: ["Limpieza", "Conformación", "Lastreado"],
//   backhoe: [
//     "Limpieza",
//     "Colocación de alcantarillas",
//     "Extensión de material",
//     "Carga de material",
//     "Excavación",
//     "Extracción de material",
//     "Demolición",
//   ],
//   compactadora: ["Compactación"],
//   cargador: ["Cargar"],
// };

// /* ---- helpers ---- */
// const onlyDigitsMax = (v, max) => String(v || "").replace(/\D/g, "").slice(0, max);

// /** Horas: solo enteros 0–18 (string controlada) */
// const clampHoras = (raw) => {
//   const digits = String(raw || "").replace(/\D/g, "");
//   if (!digits) return "";
//   const n = Math.max(0, Math.min(18, Number(digits)));
//   return String(n);
// };

// /** Cantidad: número positivo, permite un solo punto decimal */
// const sanitizeCantidad = (raw) =>
//   String(raw || "")
//     .replace(/[^\d.]/g, "")
//     .replace(/(\..*)\./g, "$1");

// export default function CreateRentalReportForm() {
//   const { toast } = useToast();
//   const [loading, setLoading] = useState(false);
//   const [operatorsList, setOperatorsList] = useState([]);

//   const [formData, setFormData] = useState({
//     fecha: new Date().toISOString().split("T")[0],
//     operadorId: "",
//     tipoMaquinaria: "",
//     placa: "",
//     actividad: "",
//     cantidad: "", // <- visible solo para vagoneta/cisterna/cabezal
//     horas: "", // <- string para controlar 0–18
//     estacion: "", // <- visible solo para excavadora/niveladora/compactadora/backhoe/cargador
//     boleta: "",
//     fuente: "", // <- visible para vagoneta/cisterna/cabezal
//   });

//   const actividadOptions = useMemo(
//     () => (formData.tipoMaquinaria ? ACTIVIDADES_POR_TIPO[formData.tipoMaquinaria] ?? [] : []),
//     [formData.tipoMaquinaria]
//   );

//   // Determine fuente options based on machinery type
//   const fuenteOptions = useMemo(() => {
//     const tipoMaquinaria = formData.tipoMaquinaria?.toLowerCase();
    
//     if (!tipoMaquinaria || !TIPOS_CON_FUENTE.has(tipoMaquinaria)) {
//       return [];
//     }

//     // For rental reports, use rentalSourceOptions
//     const typeOptions = rentalSourceOptions[tipoMaquinaria];
    
//     if (typeOptions) {
//       // For vagoneta and cabezal, check if activity suggests material transport
//       if ((tipoMaquinaria === "vagoneta" || tipoMaquinaria === "cabezal") && 
//           formData.actividad?.toLowerCase().includes("material")) {
//         return typeOptions.material || [];
//       }
//       // For cisterna activities
//       if (tipoMaquinaria === "cisterna" || 
//           formData.actividad?.toLowerCase().includes("agua") || 
//           formData.actividad?.toLowerCase().includes("riego")) {
//         return typeOptions.cisterna || [];
//       }
//       // Default for the type
//       if (typeOptions.material) {
//         return typeOptions.material;
//       }
//     }

//     return rentalSourceOptions.default || [];
//   }, [formData.tipoMaquinaria, formData.actividad]);

//   // flags de visibilidad
//   const showCantidad = TIPOS_CON_CANTIDAD.has(formData.tipoMaquinaria);
//   const showEstacion = TIPOS_CON_ESTACION.has(formData.tipoMaquinaria);
//   const showFuente = TIPOS_CON_FUENTE.has(formData.tipoMaquinaria) && fuenteOptions.length > 0;

//   // Cargar operadores al montar el componente
//   useEffect(() => {
//     const loadOperators = async () => {
//       try {
//         const operators = await operatorsService.getAllOperators();
//         setOperatorsList(Array.isArray(operators) ? operators : []);
//       } catch (error) {
//         console.error("Error loading operators:", error);
//         toast({
//           title: "Error",
//           description: "No se pudieron cargar los operadores.",
//           variant: "destructive",
//         });
//       }
//     };

//     loadOperators();
//   }, [toast]);

//   const handleChange = (e) => {
//     const { name, value } = e.target;

//     if (name === "horas") {
//       return setFormData((p) => ({ ...p, horas: clampHoras(value) }));
//     }

//     if (name === "boleta") {
//       return setFormData((p) => ({ ...p, boleta: onlyDigitsMax(value, 6) }));
//     }

//     if (name === "cantidad") {
//       return setFormData((p) => ({ ...p, cantidad: sanitizeCantidad(value) }));
//     }

//     setFormData((p) => ({ ...p, [name]: value }));
//   };

//   const handleChangeTipo = (tipo) => {
//     setFormData((p) => {
//       const next = {
//         ...p,
//         tipoMaquinaria: tipo,
//         actividad: "", // resetea actividad dependiente
//       };
//       // si el campo se va a ocultar, limpiamos su valor
//       if (!TIPOS_CON_CANTIDAD.has(tipo)) next.cantidad = "";
//       if (!TIPOS_CON_ESTACION.has(tipo)) next.estacion = "";
//       if (!TIPOS_CON_FUENTE.has(tipo)) next.fuente = "";
//       return next;
//     });
//   };

//   const handleSubmit = async (e) => {
//     e.preventDefault();
//     if (loading) return;

//     // Validaciones mínimas
//     if (!formData.operadorId) {
//       toast({ title: "Operador requerido", description: "Selecciona un operador.", variant: "destructive" });
//       return;
//     }
//     if (!formData.tipoMaquinaria) {
//       toast({ title: "Tipo requerido", description: "Selecciona el tipo de maquinaria.", variant: "destructive" });
//       return;
//     }
//     if (!formData.actividad) {
//       toast({ title: "Actividad requerida", description: "Selecciona la actividad.", variant: "destructive" });
//       return;
//     }
//     if (formData.horas === "" || !/^\d+$/.test(formData.horas) || Number(formData.horas) > 18) {
//       toast({ title: "Horas inválidas", description: "Ingresa un entero entre 0 y 18.", variant: "destructive" });
//       return;
//     }
//     if (formData.boleta && !/^\d{6}$/.test(formData.boleta)) {
//       toast({ title: "Boleta inválida", description: "Debe tener exactamente 6 dígitos (o dejar vacía).", variant: "destructive" });
//       return;
//     }

//     const payload = {
//       fecha: formData.fecha,
//       operadorId: Number(formData.operadorId),
//       tipoMaquinaria: formData.tipoMaquinaria,
//       placa: formData.placa || null,
//       actividad: formData.actividad,
//       cantidad: showCantidad
//         ? formData.cantidad === ""
//           ? null
//           : Number(formData.cantidad)
//         : null,
//       horas: Number(formData.horas),
//       estacion: showEstacion ? formData.estacion || null : null,
//       boleta: formData.boleta || null,
//       fuente: showFuente ? formData.fuente || null : null,
//     };

//     try {
//       setLoading(true);
//       await machineryService.createRentalReport(payload);
//       toast({ title: "Boleta de alquiler creada", description: "Se registró correctamente." });

//       setFormData({
//         fecha: new Date().toISOString().split("T")[0],
//         operadorId: "",
//         tipoMaquinaria: "",
//         placa: "",
//         actividad: "",
//         cantidad: "",
//         horas: "",
//         estacion: "",
//         boleta: "",
//         fuente: "",
//       });
//     } catch (err) {
//       console.error(err);
//       toast({
//         title: "Error al crear boleta",
//         description: err?.response?.data?.message || "No se pudo guardar el registro.",
//         variant: "destructive",
//       });
//     } finally {
//       setLoading(false);
//     }
//   };

//   return (
//     <Card className="w-full max-w-3xl mx-auto">
//       <CardHeader>
//         <CardTitle>Boleta de Alquiler</CardTitle>
//         <CardDescription>Registra el alquiler de maquinaria externa</CardDescription>
//       </CardHeader>

//       <CardContent>
//         <form onSubmit={handleSubmit} className="space-y-5">
//           {/* Fila 1: Fecha / Operador / Tipo */}
//           <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
//             <div className="space-y-2">
//               <Label htmlFor="fecha">Fecha</Label>
//               <Input id="fecha" name="fecha" type="date" value={formData.fecha} onChange={handleChange} required />
//             </div>

//             <div className="space-y-2">
//               <Label>Operador</Label>
//               <Select 
//                 value={formData.operadorId} 
//                 onValueChange={(v) => setFormData((p) => ({ ...p, operadorId: v }))}
//               >
//                 <SelectTrigger>
//                   <SelectValue placeholder="Seleccionar operador" />
//                 </SelectTrigger>
//                 <SelectContent>
//                   {operatorsList.map((operator) => (
//                     <SelectItem key={operator.id} value={String(operator.id)}>
//                       {operator.name} {operator.last} (ID: {operator.id})
//                     </SelectItem>
//                   ))}
//                 </SelectContent>
//               </Select>
//             </div>

//             <div className="space-y-2">
//               <Label>Tipo de Maquinaria</Label>
//               <Select value={formData.tipoMaquinaria} onValueChange={handleChangeTipo}>
//                 <SelectTrigger>
//                   <SelectValue placeholder="Seleccionar tipo" />
//                 </SelectTrigger>
//                 <SelectContent>
//                   {TIPOS_MAQUINARIA.map((t) => (
//                     <SelectItem key={t} value={t}>
//                       {t}
//                     </SelectItem>
//                   ))}
//                 </SelectContent>
//               </Select>
//             </div>
//           </div>

//           {/* Fila 2: Placa / (Cantidad condicional) / Horas */}
//           <div className={`grid grid-cols-1 ${showCantidad ? "md:grid-cols-3" : "md:grid-cols-2"} gap-4`}>
//             <div className="space-y-2">
//               <Label htmlFor="placa">Placa</Label>
//               <Input id="placa" name="placa" value={formData.placa} onChange={handleChange} placeholder="SM 1234" />
//             </div>

//             {showCantidad && (
//               <div className="space-y-2">
//                 <Label htmlFor="cantidad">Cantidad</Label>
//                 <Input
//                   id="cantidad"
//                   name="cantidad"
//                   inputMode="decimal"
//                   placeholder="0.00"
//                   value={formData.cantidad}
//                   onChange={handleChange}
//                 />
//               </div>
//             )}

//             <div className="space-y-2">
//               <Label htmlFor="horas">Horas</Label>
//               <Input
//                 id="horas"
//                 name="horas"
//                 inputMode="numeric"
//                 pattern="\d*"
//                 placeholder="0"
//                 value={formData.horas}
//                 onChange={handleChange}
//               />
//               <p className="text-xs text-muted-foreground">Solo enteros 0–18.</p>
//             </div>
//           </div>

//           {/* Actividad (select dependiente) */}
//           <div className="space-y-2">
//             <Label>Actividad</Label>
//             <Select
//               value={formData.actividad}
//               onValueChange={(v) => setFormData((p) => ({ ...p, actividad: v }))}
//               disabled={!formData.tipoMaquinaria}
//             >
//               <SelectTrigger>
//                 <SelectValue placeholder={formData.tipoMaquinaria ? "Seleccionar actividad" : "Elige un tipo primero"} />
//               </SelectTrigger>
//               <SelectContent>
//                 {actividadOptions.map((a) => (
//                   <SelectItem key={a} value={a}>
//                     {a}
//                   </SelectItem>
//                 ))}
//               </SelectContent>
//             </Select>
//           </div>

//           {/* Fuente (condicional para ciertos tipos de maquinaria) */}
//           {showFuente && (
//             <div className="space-y-2">
//               <Label>Fuente</Label>
//               <Select
//                 value={formData.fuente}
//                 onValueChange={(v) => setFormData((p) => ({ ...p, fuente: v }))}
//               >
//                 <SelectTrigger>
//                   <SelectValue placeholder="Seleccionar fuente" />
//                 </SelectTrigger>
//                 <SelectContent>
//                   {fuenteOptions.map((fuente) => (
//                     <SelectItem key={fuente} value={fuente}>
//                       {fuente}
//                     </SelectItem>
//                   ))}
//                 </SelectContent>
//               </Select>
//             </div>
//           )}

//           {/* Fila 3: Estación (condicional) / Boleta */}
//           <div className={`grid grid-cols-1 ${showEstacion ? "md:grid-cols-2" : "md:grid-cols-1"} gap-4`}>
//             {showEstacion && (
//               <div className="space-y-2">
//                 <Label htmlFor="estacion">Estación</Label>
//                 <Input
//                   id="estacion"
//                   name="estacion"
//                   value={formData.estacion}
//                   onChange={handleChange}
//                   placeholder="0-100"
//                 />
//               </div>
//             )}

//             <div className="space-y-2">
//               <Label htmlFor="boleta">Boleta</Label>
//               <Input
//                 id="boleta"
//                 name="boleta"
//                 inputMode="numeric"
//                 pattern="\d{6}"
//                 maxLength={6}
//                 placeholder="000000"
//                 value={formData.boleta}
//                 onChange={handleChange}
//               />
//             </div>
//           </div>

//           <Button type="submit" disabled={loading} className="w-full">
//             {loading ? "Enviando..." : "Crear Boleta de Alquiler"}
//           </Button>
//         </form>
//       </CardContent>
//     </Card>
//   );
// }









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

/* ---- catálogos ---- */
const TIPOS_MAQUINARIA = ["vagoneta","cisterna","cabezal","excavadora","niveladora","compactadora","backhoe","cargador"];

const TIPOS_CON_CANTIDAD = new Set(["vagoneta","cisterna","cabezal"]);
const TIPOS_CON_ESTACION = new Set(["excavadora","niveladora","compactadora","backhoe","cargador"]);
const TIPOS_CON_FUENTE = new Set(["vagoneta","cisterna","cabezal"]);

const ACTIVIDADES_POR_TIPO = {
  vagoneta: ["Acarreo de material", "Riego de agua"],
  cabezal:  ["Acarreo de material", "Riego de agua"],
  cisterna: ["Riego de agua", "Transporte de agua"],
  excavadora: ["Extracción y cargo de material","Colocación de alcantarillas","Limpieza"],
  niveladora: ["Limpieza","Conformación","Lastreado"],
  backhoe: ["Limpieza","Colocación de alcantarillas","Extensión de material","Carga de material","Excavación","Extracción de material","Demolición"],
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
const sanitizeCantidad = (raw) =>
  String(raw || "").replace(/[^\d.]/g, "").replace(/(\..*)\./g, "$1");

export default function CreateRentalReportForm() {
  const { toast } = useToast();
  const [loading, setLoading] = useState(false);
  const [operatorsList, setOperatorsList] = useState([]);

  const [formData, setFormData] = useState({
    fecha: new Date().toISOString().split("T")[0],
    operadorId: "",
    tipoMaquinaria: "",
    placa: "",
    actividad: "",
    cantidad: "",
    horas: "",
    estacion: "",
    fuente: "",
    boleta: "",     // municipal
    boletaK: "",    // KYLCSA
  });

  const actividadOptions = useMemo(
    () => (formData.tipoMaquinaria ? ACTIVIDADES_POR_TIPO[formData.tipoMaquinaria] ?? [] : []),
    [formData.tipoMaquinaria]
  );

  const fuenteOptions = useMemo(() => {
    const tipo = formData.tipoMaquinaria?.toLowerCase();
    if (!tipo || !TIPOS_CON_FUENTE.has(tipo)) return [];

    const cfg = rentalSourceOptions[tipo];
    if (cfg) {
      if ((tipo === "vagoneta" || tipo === "cabezal") && formData.actividad?.toLowerCase().includes("material"))
        return cfg.material || [];
      if (tipo === "cisterna" || formData.actividad?.toLowerCase().includes("agua") || formData.actividad?.toLowerCase().includes("riego"))
        return cfg.cisterna || [];
      if (cfg.material) return cfg.material;
    }
    return rentalSourceOptions.default || [];
  }, [formData.tipoMaquinaria, formData.actividad]);

  const showCantidad = TIPOS_CON_CANTIDAD.has(formData.tipoMaquinaria);
  const showEstacion = TIPOS_CON_ESTACION.has(formData.tipoMaquinaria);
  const showFuente = TIPOS_CON_FUENTE.has(formData.tipoMaquinaria) && fuenteOptions.length > 0;

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
    if (name === "horas") return setFormData((p) => ({ ...p, horas: clampHoras(value) }));
    if (name === "boleta") return setFormData((p) => ({ ...p, boleta: onlyDigitsMax(value, 6) }));
    if (name === "boletaK") return setFormData((p) => ({ ...p, boletaK: onlyDigitsMax(value, 6) }));
    if (name === "cantidad") return setFormData((p) => ({ ...p, cantidad: sanitizeCantidad(value) }));
    setFormData((p) => ({ ...p, [name]: value }));
  };

  const handleChangeTipo = (tipo) => {
    setFormData((p) => {
      const next = { ...p, tipoMaquinaria: tipo, actividad: "" };
      if (!TIPOS_CON_CANTIDAD.has(tipo)) next.cantidad = "";
      if (!TIPOS_CON_ESTACION.has(tipo)) next.estacion = "";
      if (!TIPOS_CON_FUENTE.has(tipo)) next.fuente = "";
      return next;
    });
  };

  const handleFuenteChange = (v) => {
    setFormData((p) => ({
      ...p,
      fuente: v,
      // si es Río/Tajo no hay boletas
      boleta: (v === "Ríos" || v === "Tajo") ? "" : p.boleta,
      boletaK: (v === "Ríos" || v === "Tajo") ? "" : p.boletaK,
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (loading) return;

    // Validaciones mínimas
    if (!formData.operadorId) {
      toast({ title: "Operador requerido", description: "Selecciona un operador.", variant: "destructive" });
      return;
    }
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

    // Reglas de boletas según fuente
    if ((formData.fuente === "Ríos" || formData.fuente === "Tajo") && (formData.boleta || formData.boletaK)) {
      toast({ title: "Sin boleta", description: "Con fuente Río o Tajo no se registra número de boleta.", variant: "destructive" });
      return;
    }
    if (formData.fuente === "KYLCSA") {
      if (!/^\d{6}$/.test(formData.boletaK || "")) {
        toast({ title: "Boleta KYLCSA requerida", description: "Ingrese exactamente 6 dígitos.", variant: "destructive" });
        return;
      }
    } else if (formData.boleta && !/^\d{6}$/.test(formData.boleta)) {
      toast({ title: "Boleta inválida", description: "Debe tener exactamente 6 dígitos (o dejar vacía).", variant: "destructive" });
      return;
    }

    const payload = {
      fecha: formData.fecha,
      operadorId: Number(formData.operadorId),
      tipoMaquinaria: formData.tipoMaquinaria,
      placa: formData.placa || null,
      actividad: formData.actividad,
      cantidad: showCantidad ? (formData.cantidad === "" ? null : Number(formData.cantidad)) : null,
      horas: Number(formData.horas),
      //estacion: showEstacion ? formData.estacion || null : null,
      fuente: showFuente ? formData.fuente || null : null,
      boleta: formData.fuente === "KYLCSA" ? null : (formData.boleta || null),
      boletaKylcsa: formData.fuente === "KYLCSA" ? (formData.boletaK || null) : null,
    };

    try {
      setLoading(true);
      await machineryService.createRentalReport(payload);
      toast({ title: "Boleta de alquiler creada", description: "Se registró correctamente." });

      setFormData({
        fecha: new Date().toISOString().split("T")[0],
        operadorId: "",
        tipoMaquinaria: "",
        placa: "",
        actividad: "",
        cantidad: "",
        horas: "",
        estacion: "",
        fuente: "",
        boleta: "",
        boletaK: "",
      });
    } catch (err) {
      console.error(err);
      toast({ title: "Error al crear boleta", description: err?.response?.data?.message || "No se pudo guardar el registro.", variant: "destructive" });
    } finally {
      setLoading(false);
    }
  };

  return (
    <Card className="w-full max-w-3xl mx-auto">
      <CardHeader>
        <CardTitle>Boleta de alquiler</CardTitle>
        <CardDescription>Registra el alquiler de maquinaria externa</CardDescription>
      </CardHeader>

      <CardContent>
        <form onSubmit={handleSubmit} className="space-y-5">
           {/* Fila 1: Fecha / Operador / Tipo */}
           <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
             <div className="space-y-2">
               <Label htmlFor="fecha">Fecha</Label>
               <Input id="fecha" name="fecha" type="date" value={formData.fecha} onChange={handleChange} required />
             </div>

             <div className="space-y-2">
               <Label>Operador</Label>
                <Select 
                value={formData.operadorId} 
                onValueChange={(v) => setFormData((p) => ({ ...p, operadorId: v }))}
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
                <Label htmlFor="cantidad">Cantidad de gondola</Label>
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
          {/* Fuente */}
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

          {/* Estación + Boletas */}
          <div className={`grid grid-cols-1 ${showEstacion ? "md:grid-cols-2" : "md:grid-cols-1"} gap-4`}>

            {/* Boleta municipal (si fuente ≠ Río/Tajo/KYLCSA) */}
            {formData.fuente && !["Ríos","Tajo","KYLCSA"].includes(formData.fuente) && (
              <div className="space-y-2">
                <Label htmlFor="boleta">Boleta</Label>
                <Input id="boleta" name="boleta" inputMode="numeric" pattern="\d{6}" maxLength={6}
                       placeholder="000000" value={formData.boleta} onChange={handleChange} />
              </div>
            )}

            {/* Boleta KYLCSA */}
            {formData.fuente === "KYLCSA" && (
              <div className="space-y-2">
                <Label htmlFor="boletaK">Boleta KYLCSA</Label>
                <Input id="boletaK" name="boletaK" inputMode="numeric" pattern="\d{6}" maxLength={6}
                       placeholder="000000" value={formData.boletaK} onChange={handleChange} />
              </div>
            )}
          </div>

           <Button
  type="submit"
  disabled={loading}
  className={[
    // centrar y tamaño
    "flex items-center justify-center mx-auto",
    "px-6 py-2.5 min-w-[14rem] w-fit",    // ← un poco más largo

    // tipografía
    "text-white font-semibold text-sm",

    // borde + halo
    "border-2 border-green-700",
    "ring-1 ring-inset ring-green-900/25",

    // color con gradiente (centro más claro)
    "bg-gradient-to-b from-green-600 to-green-500",
    "hover:from-green-600 hover:to-green-400",

    // forma/sombra
    "rounded-lg shadow-md hover:shadow-lg",

    // estados
    "disabled:opacity-60 disabled:cursor-not-allowed"
  ].join(" ")}
>
     {loading ? "Enviando..." : "Crear reporte"}
</Button>
        </form>
      </CardContent>
    </Card>
  );
}


