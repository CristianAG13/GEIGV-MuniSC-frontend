// src/utils/date.js

const pad2 = (n) => String(n).padStart(2, "0");

// Normaliza el input a Date (tratando 'YYYY-MM-DD' y 'YYYY-MM-DDTHH:mm' SIN zona como LOCAL)
function toDate(input) {
  if (!input) return new Date();
  if (input instanceof Date) return input;
  if (typeof input === "number") return new Date(input);

  if (typeof input === "string") {
    // YYYY-MM-DD
    let m = input.match(/^(\d{4})-(\d{2})-(\d{2})$/);
    if (m) {
      const [_, y, mo, d] = m;
      return new Date(Number(y), Number(mo) - 1, Number(d));
    }

    // YYYY-MM-DDTHH:mm (sin Z ni offset) => interpretar como local
    m = input.match(/^(\d{4})-(\d{2})-(\d{2})T(\d{2}):(\d{2})(?::(\d{2}))?$/);
    if (m) {
      const [_, y, mo, d, h, mi, s] = m;
      return new Date(Number(y), Number(mo) - 1, Number(d), Number(h), Number(mi), Number(s || 0));
    }
  }

  // Para strings ISO con Z u offset, y cualquier otro caso, usa el parser nativo
  return new Date(input);
}

/** 'YYYY-MM-DD' (zona local) */
export function toISODateOnly(input) {
  const d = toDate(input);
  return `${d.getFullYear()}-${pad2(d.getMonth() + 1)}-${pad2(d.getDate())}`;
}

/** Hoy en 'YYYY-MM-DD' (local) */
export function todayLocalISO() {
  return toISODateOnly(new Date());
}

/** n días atrás en 'YYYY-MM-DD' (local) */
export function daysAgoISO(n = 0) {
  const d = new Date();
  d.setDate(d.getDate() - Number(n || 0));
  return toISODateOnly(d);
}

/** Alias por compatibilidad */
export function toISODate(input) {
  return toISODateOnly(input);
}

/** dd/mm/yyyy */
export function fmtDMY(input, sep = "/") {
  const d = toDate(input);
  return `${pad2(d.getDate())}${sep}${pad2(d.getMonth() + 1)}${sep}${d.getFullYear()}`;
}

/** dd/mm/yyyy HH:MM */
export function fmtDMY_HM(input, sep = "/") {
  const d = toDate(input);
  return `${fmtDMY(d, sep)} ${pad2(d.getHours())}:${pad2(d.getMinutes())}`;
}
