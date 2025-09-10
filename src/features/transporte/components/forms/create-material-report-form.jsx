"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import machineryService from "@/services/machineryService"


export function CreateMaterialReportForm() {
  const { toast } = useToast()
  const [loading, setLoading] = useState(false)
  const [formData, setFormData] = useState({
    reportId: 0,
    tipo: "",
    cantidad: 0,
    unidad: "",
    valorUnitario: 0,
    total: 0,
    fuente: "",
    fecha: new Date().toISOString().split("T")[0],
  })

  const handleInputChange = (e) => {
    const { name, value } = e.target
    const newFormData = {
      ...formData,
      [name]: ["reportId", "cantidad", "valorUnitario", "total"].includes(name) ? Number(value) : value,
    }

    // Auto-calculate total when cantidad or valorUnitario change
    if (name === "cantidad" || name === "valorUnitario") {
      newFormData.total = newFormData.cantidad * newFormData.valorUnitario
    }

    setFormData(newFormData)
  }

  const handleSelectChange = (name, value) => {
    setFormData((prev) => ({
      ...prev,
      [name]: value,
    }))
  }

  const handleSubmit = async (e) => {
    e.preventDefault()
    setLoading(true)

    try {
      await machineryService.createMaterialReport(formData)
      toast({
        title: "Reporte de material creado exitosamente",
        description: "El reporte ha sido enviado al administrador.",
      })

      // Reset form
      setFormData({
        reportId: 0,
        tipo: "",
        cantidad: 0,
        unidad: "",
        valorUnitario: 0,
        total: 0,
        fuente: "",
        fecha: new Date().toISOString().split("T")[0],
      })
    } catch (error) {
      toast({
        title: "Error al crear reporte de material",
        description: "Hubo un problema al enviar el reporte. Intenta nuevamente.",
        variant: "destructive",
      })
      console.error("Error:", error)
    } finally {
      setLoading(false)
    }
  }

  return (
    <Card className="w-full max-w-2xl mx-auto">
      <CardHeader>
        <CardTitle>Crear Reporte de Material</CardTitle>
        <CardDescription>Registra el uso de materiales en las operaciones</CardDescription>
      </CardHeader>
      <CardContent>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="reportId">ID del Reporte</Label>
              <Input
                id="reportId"
                name="reportId"
                type="number"
                value={formData.reportId}
                onChange={handleInputChange}
                required
                min="1"
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="fecha">Fecha</Label>
              <Input id="fecha" name="fecha" type="date" value={formData.fecha} onChange={handleInputChange} required />
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="tipo">Tipo de Material</Label>
              <Input
                id="tipo"
                name="tipo"
                type="text"
                value={formData.tipo}
                onChange={handleInputChange}
                required
                placeholder="Ej: Cemento, Arena, Grava..."
              />
            </div>

            <div className="space-y-2">
              <Label>Unidad</Label>
              <Select value={formData.unidad} onValueChange={(value) => handleSelectChange("unidad", value)}>
                <SelectTrigger>
                  <SelectValue placeholder="Selecciona la unidad" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="kg">Kilogramos (kg)</SelectItem>
                  <SelectItem value="ton">Toneladas (ton)</SelectItem>
                  <SelectItem value="m3">Metros cúbicos (m³)</SelectItem>
                  <SelectItem value="m2">Metros cuadrados (m²)</SelectItem>
                  <SelectItem value="unidad">Unidades</SelectItem>
                  <SelectItem value="litros">Litros</SelectItem>
                  <SelectItem value="galones">Galones</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="space-y-2">
              <Label htmlFor="cantidad">Cantidad</Label>
              <Input
                id="cantidad"
                name="cantidad"
                type="number"
                step="0.01"
                value={formData.cantidad}
                onChange={handleInputChange}
                required
                min="0"
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="valorUnitario">Valor Unitario</Label>
              <Input
                id="valorUnitario"
                name="valorUnitario"
                type="number"
                step="0.01"
                value={formData.valorUnitario}
                onChange={handleInputChange}
                required
                min="0"
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="total">Total</Label>
              <Input
                id="total"
                name="total"
                type="number"
                step="0.01"
                value={formData.total}
                onChange={handleInputChange}
                required
                min="0"
                readOnly
                className="bg-gray-50"
              />
            </div>
          </div>

          <div className="space-y-2">
            <Label htmlFor="fuente">Fuente/Proveedor</Label>
            <Input
              id="fuente"
              name="fuente"
              type="text"
              value={formData.fuente}
              onChange={handleInputChange}
              required
              placeholder="Nombre del proveedor o fuente del material"
            />
          </div>

          <Button type="submit" disabled={loading} className="w-full">
            {loading ? "Enviando..." : "Crear Reporte de Material"}
          </Button>
        </form>
      </CardContent>
    </Card>
  )
}

export default CreateMaterialReportForm;
