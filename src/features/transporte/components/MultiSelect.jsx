"use client";

import React, { useState } from "react";
import { Button } from "@/components/ui/button";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { Check } from "lucide-react";

/**
 * MultiSelect (JSX)
 * - Muestra un “botón tipo select”
 * - Al abrirse, lista vertical con checkboxes para elegir varias opciones
 *
 * props:
 *  - options: string[]
 *  - value: string[]            (seleccionadas)
 *  - onChange: (next: string[]) => void
 *  - placeholder?: string
 *  - className?: string
 */
export function MultiSelect({
  options = [],
  value = [],
  onChange,
  placeholder = "Seleccionar",
  className = "",
}) {
  const [open, setOpen] = useState(false);

  const toggle = (opt) => {
    if (!onChange) return;
    onChange(value.includes(opt) ? value.filter((v) => v !== opt) : [...value, opt]);
  };

  const clearAll = (e) => {
    e.stopPropagation();
    onChange?.([]);
  };

  const label =
    value.length === 0
      ? placeholder
      : value.length === 1
      ? value[0]
      : `${value.length} seleccionadas`;

  return (
    <Popover open={open} onOpenChange={setOpen}>
      <PopoverTrigger asChild>
        <Button type="button" variant="outline" className={`w-full justify-between ${className}`}>
          <span className={value.length ? "text-foreground" : "text-muted-foreground"}>
            {label}
          </span>
          <svg className="ml-2 h-4 w-4 opacity-60" viewBox="0 0 20 20" fill="currentColor">
            <path
              fillRule="evenodd"
              d="M5.23 7.21a.75.75 0 011.06.02L10 10.94l3.71-3.71a.75.75 0 011.08 1.04l-4.25 4.25a.75.75 0 01-1.06 0L5.21 8.27a.75.75 0 01.02-1.06z"
              clipRule="evenodd"
            />
          </svg>
        </Button>
      </PopoverTrigger>

      <PopoverContent className="w-[260px] p-0">
        <div className="flex items-center justify-between px-3 py-2 border-b">
          <span className="text-xs text-muted-foreground">{options.length} opciones</span>
          <button onClick={clearAll} className="text-xs text-blue-600 hover:underline">
            Limpiar
          </button>
        </div>

        <div className="max-h-64 overflow-y-auto py-1">
          {options.map((opt) => {
            const checked = value.includes(opt);
            return (
              <button
                key={opt}
                type="button"
                onClick={() => toggle(opt)}
                className="w-full flex items-center gap-2 px-3 py-2 text-left hover:bg-muted/60"
              >
                <span
                  className={`flex h-4 w-4 items-center justify-center rounded border ${
                    checked ? "border-blue-600 bg-blue-600 text-white" : "border-gray-300"
                  }`}
                >
                  {checked && <Check className="h-3 w-3" />}
                </span>
                <span className="text-sm">{opt}</span>
              </button>
            );
          })}
          {options.length === 0 && (
            <div className="px-3 py-3 text-sm text-muted-foreground">No hay opciones</div>
          )}
        </div>
      </PopoverContent>
    </Popover>
  );
}
export default MultiSelect;