
// src/features/transporte/components/ReportsTable.jsx
export default function ReportsTable({ reports = [] }) {
  if (!Array.isArray(reports) || reports.length === 0) {
    return <p className="text-sm text-gray-500">No hay reportes disponibles.</p>;
  }

  // --- helpers arriba ---
  const fmt = (d) => {
    try {
      return d ? new Date(d).toLocaleDateString() : "—";
    } catch {
      return "—";
    }
  };

  // "" -> "—"
  const showText = (v) => {
    if (v === null || v === undefined) return "—";
    if (typeof v === "string" && v.trim() === "") return "—";
    return String(v);
  };

  // números: acepta 0, number o string numérico
  const showNum = (v) => {
    if (v === 0) return 0;
    const n = typeof v === "string" ? Number(v) : v;
    return Number.isFinite(n) ? n : "—";
  };

  return (
    <div className="overflow-x-auto">
      <table className="w-full text-sm border">
        <thead className="bg-gray-50">
          <tr>
            <th className="p-2 border">ID</th>
            <th className="p-2 border">Operador</th>
            <th className="p-2 border">Maquinaria</th>
            <th className="p-2 border">Actividad</th>
            <th className="p-2 border">Horímetro</th>
            <th className="p-2 border">Diésel</th>
            <th className="p-2 border">Fecha</th>
          </tr>
        </thead>
        <tbody>
          {reports.map((r) => {
            const operadorTxt = r?.operador
              ? `${r.operador?.nombre ?? ""}${
                  r.operador?.identificacion ? ` (${r.operador.identificacion})` : ""
                }`
              : r?.operadorId ?? "—";

            const maquinariaTxt = r?.maquinaria
              ? `${r.maquinaria?.tipo ?? ""}${
                  r.maquinaria?.placa ? ` - ${r.maquinaria.placa}` : ""
                }`
              : r?.maquinariaId ?? "—";

            const actividad = showText(r?.tipoActividad ?? r?.actividad);
            const horimetro = showNum(r?.horimetro);
            const diesel = showNum(r?.diesel ?? r?.combustible);
            const fecha = fmt(r?.fecha);

            return (
              <tr key={r.id}>
                <td className="p-2 border">{r.id}</td>
                <td className="p-2 border">{operadorTxt}</td>
                <td className="p-2 border">{maquinariaTxt}</td>
                <td className="p-2 border">{actividad}</td>
                <td className="p-2 border">{horimetro}</td>
                <td className="p-2 border">{diesel}</td>
                <td className="p-2 border">{fecha}</td>
              </tr>
            );
          })}
        </tbody>
      </table>
    </div>
  );
}
