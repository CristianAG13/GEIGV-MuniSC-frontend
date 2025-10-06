"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Switch } from "@/components/ui/switch"
import { useToast } from "@/hooks/use-toast"
import { useAuditLogger } from "@/hooks/useAuditLogger"
import machineryService from "@/services/machineryService"

export function CreateMachineryForm() {
  const { toast } = useToast()
  const { logCreate } = useAuditLogger()
  const [loading, setLoading] = useState(false)
  const [formData, setFormData] = useState({
    tipo: "",
    placa: "",
    rol: "",
    esPropietaria: true,
  })

  const handleInputChange = (e) => {
    const { name, value } = e.target
    setFormData((prev) => ({
      ...prev,
      [name]: value,
    }))
  }

  const handleSelectChange = (name, value) => {
    setFormData((prev) => ({
      ...prev,
      [name]: value,
    }))
  }

  const handleSwitchChange = (checked) => {
    setFormData((prev) => ({
      ...prev,
      esPropietaria: checked,
    }))
  }

  const handleSubmit = async (e) => {
    e.preventDefault()
    setLoading(true)

    try {
      const result = await machineryService.createMachinery(formData)
      
      if (result.success) {
        // ✅ REGISTRAR EN AUDITORÍA
        await logCreate('transporte', result.data,
          `Se registró la maquinaria ${formData.tipo} con placa ${formData.placa}`
        )
        
        toast({
          title: "Maquinaria registrada exitosamente",
          description: "La maquinaria ha sido añadida al sistema.",
        })

        // Reset form
        setFormData({
          tipo: "",
          placa: "",
          rol: "",
          esPropietaria: true,
        })
      }
    } catch (error) {
      toast({
        title: "Error al registrar maquinaria",
        description: "Hubo un problema al registrar la maquinaria. Intenta nuevamente.",
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
        <CardTitle>Registrar Nueva Maquinaria</CardTitle>
        <CardDescription>Añade una nueva maquinaria al sistema de gestión</CardDescription>
      </CardHeader>
      <CardContent>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label>Tipo de Maquinaria</Label>
              <Select value={formData.tipo} onValueChange={(value) => handleSelectChange("tipo", value)}>
                <SelectTrigger>
                  <SelectValue placeholder="Selecciona el tipo" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="Vagoneta">Vagoneta</SelectItem>
                  <SelectItem value="Cisterna">Cisterna</SelectItem>
                  <SelectItem value="Cabezales">Cabezales</SelectItem>
                  <SelectItem value="Excavadora">Excavadora</SelectItem>
                  <SelectItem value="Backhoe">Backhoe</SelectItem>
                  <SelectItem value="Compactadora">Compactadora</SelectItem>
                  <SelectItem value="Niveladora">Niveladora</SelectItem>
                  <SelectItem value="Cargador">Cargador</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2">
              <Label htmlFor="placa">Placa</Label>
              <Input
                id="placa"
                name="placa"
                type="text"
                value={formData.placa}
                onChange={handleInputChange}
                required
                placeholder="Ej: ABC-123"
                className="uppercase"
              />
            </div>
          </div>

          <div className="space-y-2">
            <Label>Rol/Función</Label>
            <Select value={formData.rol} onValueChange={(value) => handleSelectChange("rol", value)}>
              <SelectTrigger>
                <SelectValue placeholder="Selecciona el rol" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="Excavación">Excavación</SelectItem>
                <SelectItem value="Movimiento de tierra">Movimiento de tierra</SelectItem>
                <SelectItem value="Compactación">Compactación</SelectItem>
                <SelectItem value="Transporte">Transporte</SelectItem>
                <SelectItem value="Nivelación">Nivelación</SelectItem>
                <SelectItem value="Demolición">Demolición</SelectItem>
                <SelectItem value="Construcción">Construcción</SelectItem>
                <SelectItem value="Mantenimiento">Mantenimiento</SelectItem>
              </SelectContent>
            </Select>
          </div>

          <div className="flex items-center space-x-2">
            <Switch id="esPropietaria" checked={formData.esPropietaria} onCheckedChange={handleSwitchChange} />
            <Label htmlFor="esPropietaria">
              {formData.esPropietaria ? "Maquinaria Propietaria" : "Maquinaria Alquilada"}
            </Label>
          </div>

          <Button type="submit" disabled={loading} className="w-full">
            {loading ? "Registrando..." : "Registrar Maquinaria"}
          </Button>
        </form>
      </CardContent>
    </Card>
  )
}

export default CreateMachineryForm;
