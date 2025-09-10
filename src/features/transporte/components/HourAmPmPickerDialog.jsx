"use client";

import { useEffect, useState } from "react";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogTrigger,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from "@/components/ui/dialog";
import {
  Select,
  SelectTrigger,
  SelectValue,
  SelectContent,
  SelectItem,
} from "@/components/ui/select";

/** Helpers 12h ↔ 24h (sin minutos) */
const to12hNoMin = (str) => {
  if (!str) return { h: "", ampm: "AM" };
  const [HH] = String(str).split(":");
  let H = parseInt(HH, 10);
  if (Number.isNaN(H)) return { h: "", ampm: "AM" };
  const ampm = H >= 12 ? "PM" : "AM";
  H = H % 12;
  if (H === 0) H = 12;
  return { h: String(H).padStart(2, "0"), ampm };
};

const to24hNoMin = (h, ampm) => {
  if (!h || !ampm) return "";
  let H = parseInt(h, 10) % 12;
  if (ampm === "PM") H += 12;
  if (ampm === "AM" && parseInt(h, 10) === 12) H = 0;
  return String(H).padStart(2, "0") + ":00";
};

const display12h = (str) => {
  const { h, ampm } = to12hNoMin(str);
  return h ? `${h} ${ampm}` : "Seleccionar hora";
};

/**
 * Props:
 * - value: string "HH:MM" 24h (p.ej. "08:00" | "17:00") o ""
 * - onChange(newValue): callback con "HH:00" 24h
 * - label: string (p.ej. "Hora inicio")
 * - confirmText / cancelText opcionales
 */
export function HourAmPmPickerDialog({
  value,
  onChange,
  label = "Seleccionar hora",
  confirmText = "Confirmar",
  cancelText = "Cancelar",
}) {
  const [open, setOpen] = useState(false);
  const [tmpH, setTmpH] = useState("");
  const [tmpMeridiem, setTmpMeridiem] = useState("AM");

  // Al abrir, prepara estado temporal desde "value"
  useEffect(() => {
    if (open) {
      const v = to12hNoMin(value);
      // si no hay valor aún, puedes dejar vacío o poner un default
      setTmpH(v.h || "");
      setTmpMeridiem(v.ampm || "AM");
    }
  }, [open, value]);

  const hours = Array.from({ length: 12 }, (_, i) =>
    String(i + 1).padStart(2, "0")
  );

  const handleConfirm = () => {
    const val24 = to24hNoMin(tmpH, tmpMeridiem);
    if (val24) {
      onChange && onChange(val24);
      setOpen(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <div className="space-y-2">
        <div className="text-sm font-medium">{label}</div>
        <DialogTrigger asChild>
          <Button variant="outline" className="min-w-[140px] justify-start">
            {display12h(value)}
          </Button>
        </DialogTrigger>
      </div>

      <DialogContent aria-describedby={undefined} className="sm:max-w-[420px]">
        <DialogHeader>
          <DialogTitle>{label}</DialogTitle>
        </DialogHeader>

        <div className="flex gap-3 mt-4">
          <div className="w-24">
            <div className="text-xs text-muted-foreground mb-1">Hora</div>
            <Select value={tmpH} onValueChange={setTmpH}>
              <SelectTrigger>
                <SelectValue placeholder="HH" />
              </SelectTrigger>
              <SelectContent>
                {hours.map((h) => (
                  <SelectItem key={h} value={h}>
                    {h}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          <div className="w-28">
            <div className="text-xs text-muted-foreground mb-1">AM/PM</div>
            <Select value={tmpMeridiem} onValueChange={setTmpMeridiem}>
              <SelectTrigger>
                <SelectValue placeholder="AM/PM" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="AM">AM</SelectItem>
                <SelectItem value="PM">PM</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </div>

        <DialogFooter className="mt-4">
          <Button variant="ghost" onClick={() => setOpen(false)}>
            {cancelText}
          </Button>
          <Button onClick={handleConfirm} disabled={!tmpH}>
            {confirmText}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}

export default HourAmPmPickerDialog;