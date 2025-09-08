"use client"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { CreateReportForm } from "@/features/transporte/components/forms/create-report-form.jsx";
import { CreateRentalReportForm } from "@/features/transporte/components/forms/create-rental-report-form.jsx";
import { CreateMaterialReportForm } from "@/features/transporte/components/forms/create-material-report-form.jsx";
import { CreateMachineryForm } from "@/features/transporte/components/forms/create-machinery-form.jsx";
export default function Maquinaria() {
  return (
    <div className="min-h-screen bg-gray-50 py-8">
      <div className="container mx-auto px-4">
        <div className="text-center mb-8">
          <h1 className="text-3xl font-bold text-gray-900 mb-2">Sistema de Gestión de Maquinaria</h1>
          <p className="text-gray-600">Administra reportes y maquinaria de manera eficiente</p>
        </div>

        <Tabs defaultValue="reports" className="w-full">
          <TabsList className="grid w-full grid-cols-4 mb-8">
            <TabsTrigger value="reports">Reportes Diarios</TabsTrigger>
            <TabsTrigger value="rental">Alquiler</TabsTrigger>
            <TabsTrigger value="materials">Materiales</TabsTrigger>
            <TabsTrigger value="machinery">Maquinaria</TabsTrigger>
          </TabsList>

          <TabsContent value="reports">
            <CreateReportForm />
          </TabsContent>

          <TabsContent value="rental">
            <CreateRentalReportForm />
          </TabsContent>

          <TabsContent value="materials">
            <CreateMaterialReportForm />
          </TabsContent>

          <TabsContent value="machinery">
            <CreateMachineryForm />
          </TabsContent>
        </Tabs>
      </div>
    </div>
  )
}
