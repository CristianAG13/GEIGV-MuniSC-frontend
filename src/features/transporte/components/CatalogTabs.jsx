// "use client";
// import { useState } from "react";
// import { Button } from "@/components/ui/button";

// // IMPORTA TU catálogo existente (el que NO quieres cambiar)
// import MachineryAdmin from "@/features/transporte/components/MachineryAdmin";

// // IMPORTA el nuevo genérico
// import SourceCatalogAdmin from "@/features/catalog/SourceCatalogAdmin";

// export default function CatalogTabs() {
//   const [tab, setTab] = useState("maquinaria"); // 'maquinaria' | 'rios' | 'tajos'
//   const isMachinery = tab === "maquinaria";
//   const isRios = tab === "rios";
//   const isTajos = tab === "tajos";

//   return (
//     <div className="space-y-4">
//       <div className="flex gap-2 border-b border-gray-200 pb-2">
//         <Button
//           variant={isMachinery ? "default" : "secondary"}
//           onClick={() => setTab("maquinaria")}
//         >
//           🚜 Maquinaria
//         </Button>
//         <Button
//           variant={isRios ? "default" : "secondary"}
//           onClick={() => setTab("rios")}
//         >
//           💦 Ríos
//         </Button>
//         <Button
//           variant={isTajos ? "default" : "secondary"}
//           onClick={() => setTab("tajos")}
//         >
//           ⛏ Tajos
//         </Button>
//       </div>

//       {isMachinery && <MachineryAdmin />}

//       {isRios && <SourceCatalogAdmin tipo="rio" title="Catálogo de Ríos" />}

//       {isTajos && <SourceCatalogAdmin tipo="tajo" title="Catálogo de Tajos" />}
//     </div>
//   );
// }

"use client";
import { useState } from "react";
import { Button } from "@/components/ui/button";
import MachineryAdmin from "@/features/transporte/components/MachineryAdmin";
import SourceCatalogAdmin from "@/features/catalog/SourceCatalogAdmin";

export default function CatalogTabs() {
  const [tab, setTab] = useState("maquinaria");
  const isMachinery = tab === "maquinaria";
  const isRios = tab === "rios";
  const isTajos = tab === "tajos";

  const base =
    "rounded-xl px-4 py-2 shadow-sm transition-colors border text-sm font-medium inline-flex items-center gap-2";

  const machineryClasses = isMachinery
    ? "bg-emerald-500 text-white border-emerald-600 hover:bg-emerald-600"
    : "bg-emerald-100 text-emerald-800 border-emerald-200 hover:bg-emerald-200";

  const riosClasses = isRios
    ? "bg-sky-500 text-white border-sky-600 hover:bg-sky-600"
    : "bg-sky-100 text-sky-800 border-sky-200 hover:bg-sky-200";

  const tajosClasses = isTajos
    ? "bg-amber-500 text-white border-amber-600 hover:bg-amber-600"
    : "bg-amber-100 text-amber-800 border-amber-200 hover:bg-amber-200";

  return (
    <div className="space-y-4">
      <div className="flex gap-2 border-b border-gray-200 pb-2">
        <Button
          variant="ghost"
          onClick={() => setTab("maquinaria")}
          className={`${base} ${machineryClasses}`}
        >
          🚜 <span>Maquinaria</span>
        </Button>

        <Button
          variant="ghost"
          onClick={() => setTab("rios")}
          className={`${base} ${riosClasses}`}
        >
          💦 <span>Ríos</span>
        </Button>

        <Button
          variant="ghost"
          onClick={() => setTab("tajos")}
          className={`${base} ${tajosClasses}`}
        >
          ⛏ <span>Tajos</span>
        </Button>
      </div>

      {isMachinery && <MachineryAdmin />}
      {isRios && <SourceCatalogAdmin tipo="rio" title="Catálogo de Ríos" />}
      {isTajos && <SourceCatalogAdmin tipo="tajo" title="Catálogo de Tajos" />}
    </div>
  );
}
