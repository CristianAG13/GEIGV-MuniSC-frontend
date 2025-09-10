"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import machineryService from "@/services/machineryService"


export function CreateRentalReportForm() {
  const { toast } = useToast()
  const [loading, setLoading] = useState(false)
  const [formData, setFormData] = useState({
    fecha: new Date().toISOString().split("T")[0],
    tipoMaquinaria: "",
    horas: 0,
    valorHora: 0,
    total: 0,
    proveedor: "",
    observaciones: "",
  })

  const handleInputChange = (e) => {
    const { name, value } = e.target
    const newFormData = {
      ...formData,
      [name]: ["horas", "valorHora", "total"].includes(name) ? Number(value) : value,
    }

    // Auto-calculate total when hours or valorHora change
    if (name === "horas" || name === "valorHora") {
      newFormData.total = newFormData.horas * newFormData.valorHora
    }

    setFormData(newFormData)
  }

  const handleSubmit = async (e) => {
    e.preventDefault()
    setLoading(true)

    try {
      await machineryService.createRentalReport(formData)
      toast({
        title: "Reporte de alquiler creado exitosamente",
        description: "El reporte ha sido enviado al administrador.",
      })

      // Reset form
      setFormData({
        fecha: new Date().toISOString().split("T")[0],
        tipoMaquinaria: "",
        horas: 0,
        valorHora: 0,
        total: 0,
        proveedor: "",
        observaciones: "",
      })
    } catch (error) {
      toast({
        title: "Error al crear reporte de alquiler",
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
        <CardTitle>Crear Reporte de Alquiler</CardTitle>
        <CardDescription>Registra el alquiler de maquinaria externa</CardDescription>
      </CardHeader>
      <CardContent>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="fecha">Fecha</Label>
              <Input id="fecha" name="fecha" type="date" value={formData.fecha} onChange={handleInputChange} required />
            </div>

            <div className="space-y-2">
              <Label htmlFor="tipoMaquinaria">Tipo de Maquinaria</Label>
              <Input
                id="tipoMaquinaria"
                name="tipoMaquinaria"
                type="text"
                value={formData.tipoMaquinaria}
                onChange={handleInputChange}
                required
                placeholder="Ej: Excavadora, Bulldozer, Grúa..."
              />
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="space-y-2">
              <Label htmlFor="horas">Horas Trabajadas</Label>
              <Input
                id="horas"
                name="horas"
                type="number"
                step="0.1"
                value={formData.horas}
                onChange={handleInputChange}
                required
                min="0"
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="valorHora">Valor por Hora</Label>
              <Input
                id="valorHora"
                name="valorHora"
                type="number"
                step="0.01"
                value={formData.valorHora}
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
            <Label htmlFor="proveedor">Proveedor</Label>
            <Input
              id="proveedor"
              name="proveedor"
              type="text"
              value={formData.proveedor}
              onChange={handleInputChange}
              required
              placeholder="Nombre del proveedor de la maquinaria"
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="observaciones">Observaciones (Opcional)</Label>
            <Textarea
              id="observaciones"
              name="observaciones"
              value={formData.observaciones}
              onChange={handleInputChange}
              placeholder="Observaciones adicionales sobre el alquiler..."
              rows={2}
            />
          </div>

          <Button type="submit" disabled={loading} className="w-full">
            {loading ? "Enviando..." : "Crear Reporte de Alquiler"}
          </Button>
        </form>
      </CardContent>
    </Card>
  )
}
export default CreateRentalReportForm;