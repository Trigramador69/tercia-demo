// Operaciones con fechas en texto ISO ("2026-09-14") y horas "HH:MM".
// Se calculan en UTC para que no dependan de la zona horaria del navegador.

function aFechaUtc(fecha: string) {
  const [anio, mes, dia] = fecha.split("-").map(Number);
  return new Date(Date.UTC(anio, mes - 1, dia));
}

function aTextoIso(fecha: Date) {
  return fecha.toISOString().slice(0, 10);
}

export function sumarDias(fecha: string, dias: number) {
  const resultado = aFechaUtc(fecha);
  resultado.setUTCDate(resultado.getUTCDate() + dias);
  return aTextoIso(resultado);
}

export function sumarMeses(fecha: string, meses: number) {
  const resultado = aFechaUtc(fecha);
  resultado.setUTCMonth(resultado.getUTCMonth() + meses);
  return aTextoIso(resultado);
}

// 0 = domingo, 1 = lunes ... 6 = sábado.
export function diaDeLaSemana(fecha: string) {
  return aFechaUtc(fecha).getUTCDay();
}

export function diasDelMes(mes: string) {
  const [anio, numeroMes] = mes.split("-").map(Number);
  const cantidad = new Date(Date.UTC(anio, numeroMes, 0)).getUTCDate();
  return Array.from({ length: cantidad }, (_, indice) =>
    `${mes}-${String(indice + 1).padStart(2, "0")}`,
  );
}

export function diferenciaEnDias(desde: string, hasta: string) {
  return Math.round((aFechaUtc(hasta).getTime() - aFechaUtc(desde).getTime()) / 86400000);
}

export function horaAMinutos(hora: string) {
  const [horas, minutos] = hora.split(":").map(Number);
  return horas * 60 + minutos;
}

export function minutosAHora(minutosDelDia: number) {
  const horas = Math.floor(minutosDelDia / 60);
  const minutos = minutosDelDia % 60;
  return `${String(horas).padStart(2, "0")}:${String(minutos).padStart(2, "0")}`;
}

export function desplazarHora(hora: string, minutos: number) {
  return minutosAHora(horaAMinutos(hora) + minutos);
}

export function estaEnRango(fecha: string, desde: string, hasta: string | null) {
  return fecha >= desde && (hasta === null || fecha <= hasta);
}
