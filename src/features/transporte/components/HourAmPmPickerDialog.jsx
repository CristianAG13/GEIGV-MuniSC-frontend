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

/* ===== 12h ↔ 24h con minutos ===== */
const to12h = (str) => {
  if (!str) return { h: "", m: "00", ampm: "AM" };
  const [HH, MM = "00"] = String(str).split(":");
  let H = parseInt(HH, 10);
  if (Number.isNaN(H)) return { h: "", m: "00", ampm: "AM" };
  const ampm = H >= 12 ? "PM" : "AM";
  H = H % 12;
  if (H === 0) H = 12;
  return { h: String(H).padStart(2, "0"), m: String(parseInt(MM, 10)).padStart(2, "0"), ampm };
};

const to24h = (h, m, ampm) => {
  if (!h || !m || !ampm) return "";
  let H = parseInt(h, 10) % 12;
  if (ampm === "PM") H += 12;
  if (ampm === "AM" && parseInt(h, 10) === 12) H = 0;
  return `${String(H).padStart(2, "0")}:${String(parseInt(m, 10)).padStart(2, "0")}`;
};

const display12h = (str) => {
  const { h, m, ampm } = to12h(str);
  return h ? `${h}:${m} ${ampm}` : "Seleccionar hora";
};

/**
 * Props:
 * - value: string "HH:MM" 24h o ""
 * - onChange(newValue): callback con "HH:MM" 24h
 * - label: string
 * - confirmText / cancelText opcionales
 */
export default function HourAmPmPickerDialog({
  value,
  onChange,
  label = "Seleccionar hora",
  confirmText = "Confirmar",
  cancelText = "Cancelar",
}) {
  const [open, setOpen] = useState(false);
  const [tmpH, setTmpH] = useState("");
  const [tmpM, setTmpM] = useState("00");
  const [tmpMeridiem, setTmpMeridiem] = useState("AM");

  useEffect(() => {
    if (open) {
      const v = to12h(value);
      setTmpH(v.h || "");
      setTmpM(v.m || "00");
      setTmpMeridiem(v.ampm || "AM");
    }
  }, [open, value]);

  const hours = Array.from({ length: 12 }, (_, i) => String(i + 1).padStart(2, "0"));
  const minutes = ["00","05","10","15","20","25","30","35","40","45","50","55"];

  const handleConfirm = () => {
    const val24 = to24h(tmpH, tmpM, tmpMeridiem);
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
          <Button variant="outline" className="min-w-[160px] justify-start">
            {display12h(value)}
          </Button>
        </DialogTrigger>
      </div>

      <DialogContent aria-describedby={undefined} className="sm:max-w-[460px]">
        <DialogHeader>
          <DialogTitle>{label}</DialogTitle>
        </DialogHeader>

        <div className="flex gap-3 mt-4">
          <div className="w-24">
            <div className="text-xs text-muted-foreground mb-1">Hora</div>
            <Select value={tmpH} onValueChange={setTmpH}>
              <SelectTrigger><SelectValue placeholder="HH" /></SelectTrigger>
              <SelectContent>{hours.map((h) => (<SelectItem key={h} value={h}>{h}</SelectItem>))}</SelectContent>
            </Select>
          </div>

          <div className="w-24">
            <div className="text-xs text-muted-foreground mb-1">Minutos</div>
            <Select value={tmpM} onValueChange={setTmpM}>
              <SelectTrigger><SelectValue placeholder="MM" /></SelectTrigger>
              <SelectContent>{minutes.map((m) => (<SelectItem key={m} value={m}>{m}</SelectItem>))}</SelectContent>
            </Select>
          </div>

          <div className="w-28">
            <div className="text-xs text-muted-foreground mb-1">AM/PM</div>
            <Select value={tmpMeridiem} onValueChange={setTmpMeridiem}>
              <SelectTrigger><SelectValue placeholder="AM/PM" /></SelectTrigger>
              <SelectContent>
                <SelectItem value="AM">AM</SelectItem>
                <SelectItem value="PM">PM</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </div>

        <DialogFooter className="mt-4">
          <Button variant="ghost" onClick={() => setOpen(false)}>{cancelText}</Button>
          <Button onClick={handleConfirm} disabled={!tmpH || !tmpM}>{confirmText}</Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
