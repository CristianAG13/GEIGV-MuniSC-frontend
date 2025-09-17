import React, { useEffect, useState } from "react";
 import { FileText, Receipt, Wrench, ClipboardList } from "lucide-react";
import machineryService from "@/services/machineryService";
import CreateReportForm from "@/features/transporte/components/forms/create-report-form.jsx";
import CreateRentalReportForm from "./components/forms/create-rental-report-form";
import ReportsTable from "@/features/transporte/components/ReportsTable.jsx";
import MachineryAdmin from "@/features/transporte/components/MachineryAdmin.jsx"; // ⬅️ nueva vista
import ProtectedRoute from "@/components/ProtectedRoute.jsx";
import { useAuth } from "@/context/AuthContext.jsx";

export function TransporteModule() {
  const { user } = useAuth();
  const [activeTab, setActiveTab] = useState("maquinaria");
  const [reportes, setReportes] = useState([]);

  const hasRole = (roles) => {
    if (!user || !user.roles) return false;
    const userRoles = Array.isArray(user.roles) ? user.roles : [user.roles];
    return roles.some((r) => userRoles.includes(r));
  };

  useEffect(() => {
    if (activeTab === "reportes") loadReports();
  }, [activeTab]);

  const loadReports = async () => {
    try {
      const res = await machineryService.getAllReports({ page: 1, limit: 20 });
      setReportes(Array.isArray(res?.data) ? res.data : Array.isArray(res) ? res : []);
    } catch (e) {
      console.error("Error cargando reportes:", e?.response?.data || e);
    }
  };

  return (
    <div className="bg-white shadow-lg rounded-2xl p-6">
      <h2 className="text-2xl font-bold text-gray-800 mb-6 border-b pb-3">
        Gestión de Transporte
      </h2>

      <div className="flex flex-wrap gap-2 border-b mb-6">
        <button
          onClick={() => setActiveTab("maquinaria")}
          className={`flex items-center gap-2 px-5 py-2 text-sm font-medium rounded-t-lg transition-colors ${
            activeTab === "maquinaria"
              ? "bg-blue-600 text-white shadow-md"
              : "text-gray-600 hover:text-blue-600 hover:bg-gray-100"
          }`}
        >
          <FileText className="w-4 h-4" />
          Boleta Municipal
        </button>

        <button
          onClick={() => setActiveTab("alquiler")}
          className={`flex items-center gap-2 px-5 py-2 text-sm font-medium rounded-t-lg transition-colors ${
            activeTab === "alquiler"
              ? "bg-blue-600 text-white shadow-md"
              : "text-gray-600 hover:text-blue-600 hover:bg-gray-100"
          }`}
        >
          <Receipt className="w-4 h-4" /> {/* 👈 usa FileText para evitar crashes */}
          Boleta Alquiler
        </button>

        <button
          onClick={() => setActiveTab("reportes")}
          className={`flex items-center gap-2 px-5 py-2 text-sm font-medium rounded-t-lg transition-colors ${
            activeTab === "reportes"
              ? "bg-blue-600 text-white shadow-md"
              : "text-gray-600 hover:text-blue-600 hover:bg-gray-100"
          }`}
        >
          <ClipboardList className="w-4 h-4" />
          Reportes
        </button>

        {hasRole(["superadmin", "ingeniero", "inspector"]) && (
          <button
            onClick={() => setActiveTab("catalogo")}
            className={`flex items-center gap-2 px-5 py-2 text-sm font-medium rounded-t-lg transition-colors ${
              activeTab === "catalogo"
                ? "bg-blue-600 text-white shadow-md"
                : "text-gray-600 hover:text-blue-600 hover:bg-gray-100"
            }`}
          >
            <Wrench className="w-4 h-4" />
            Catálogo
          </button>
        )}
      </div>

      <div className="p-4">
        {activeTab === "maquinaria" && (
          <CreateReportForm onGoToCatalog={() => setActiveTab("catalogo")} />
        )}

        {activeTab === "alquiler" && <CreateRentalReportForm />}

        {activeTab === "reportes" && <ReportsTable reports={reportes} />}

        {activeTab === "catalogo" && (
          <ProtectedRoute roles={["superadmin", "ingeniero", "inspector"]}>
            <MachineryAdmin />
          </ProtectedRoute>
        )}
      </div>
    </div>
  );
}

export default TransporteModule; 