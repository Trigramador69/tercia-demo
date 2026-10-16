// Formatos de presentación. Todo se muestra en español de Bolivia.

const formatoFechaCorta = new Intl.DateTimeFormat("es-BO", { day: "numeric", month: "short", year: "numeric", timeZone: "UTC" });
const formatoFechaLarga = new Intl.DateTimeFormat("es-BO", { day: "numeric", month: "long", year: "numeric", timeZone: "UTC" });
const formatoMes = new Intl.DateTimeFormat("es-BO", { month: "long", year: "numeric", timeZone: "UTC" });
const formatoMonto = new Intl.NumberFormat("es-BO", { minimumFractionDigits: 0, maximumFractionDigits: 2 });

function aFecha(fechaIso: string) {
  return new Date(`${fechaIso.slice(0, 10)}T00:00:00Z`);
}

export function formatearFecha(fechaIso: string) {
  return formatoFechaCorta.format(aFecha(fechaIso));
}

export function formatearFechaLarga(fechaIso: string) {
  return formatoFechaLarga.format(aFecha(fechaIso));
}

// "2026-09" -> "Septiembre de 2026"
export function formatearMes(mes: string) {
  const texto = formatoMes.format(aFecha(`${mes}-01`));
  return texto.charAt(0).toUpperCase() + texto.slice(1);
}

// "2026-09" -> "septiembre"
export function formatearNombreMes(mes: string) {
  return new Intl.DateTimeFormat("es-BO", { month: "long", timeZone: "UTC" }).format(aFecha(`${mes}-01`));
}

export function formatearMonto(monto: number) {
  return `Bs ${formatoMonto.format(monto)}`;
}

export function nombreCompleto(persona: { nombres: string; apellidos: string }) {
  return `${persona.nombres} ${persona.apellidos}`;
}

export function iniciales(persona: { nombres: string; apellidos: string }) {
  return `${persona.nombres.charAt(0)}${persona.apellidos.charAt(0)}`.toUpperCase();
}

export function fechaDeHoy() {
  const hoy = new Date();
  return `${hoy.getFullYear()}-${String(hoy.getMonth() + 1).padStart(2, "0")}-${String(hoy.getDate()).padStart(2, "0")}`;
}

// Antigüedad legible: "2 años y 3 meses", "5 meses", "12 días".
export function formatearAntiguedad(desde: string, hasta: string = fechaDeHoy()) {
  const inicio = aFecha(desde);
  const fin = aFecha(hasta);
  let meses = (fin.getUTCFullYear() - inicio.getUTCFullYear()) * 12 + (fin.getUTCMonth() - inicio.getUTCMonth());
  if (fin.getUTCDate() < inicio.getUTCDate()) meses -= 1;
  if (meses <= 0) {
    const dias = Math.max(0, Math.round((fin.getTime() - inicio.getTime()) / 86400000));
    return dias === 1 ? "1 día" : `${dias} días`;
  }
  const anios = Math.floor(meses / 12);
  const mesesRestantes = meses % 12;
  const textoAnios = anios === 1 ? "1 año" : `${anios} años`;
  const textoMeses = mesesRestantes === 1 ? "1 mes" : `${mesesRestantes} meses`;
  if (anios === 0) return textoMeses;
  if (mesesRestantes === 0) return textoAnios;
  return `${textoAnios} y ${textoMeses}`;
}

export function pluralizar(cantidad: number, singular: string, plural: string) {
  return `${cantidad} ${cantidad === 1 ? singular : plural}`;
}
