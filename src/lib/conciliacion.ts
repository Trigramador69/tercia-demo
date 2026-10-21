import { nombresEstadoAsistencia, toleranciaConciliacionMinutos } from "../datos/catalogos.ts";
import { horaAMinutos } from "../datos/fechas.ts";
import type {
  FilaReporteCliente,
  Persona,
  RegistroAsistencia,
  ResolucionConciliacion,
} from "../datos/tipos.ts";

// Cruce del registro propio de asistencia con el reporte del cliente, por
// persona y día:
//  - coincide: los dos dicen lo mismo (con horarios dentro de la tolerancia);
//  - no coincide: los dos registran que vino, pero los horarios difieren;
//  - conflicto: uno dice que vino y el otro no, o el día está en uno solo.

export type ResultadoDia = "coincide" | "no_coincide" | "conflicto";

export interface DiaConciliado {
  clave: string;
  idPersona: string;
  fecha: string;
  propio: RegistroAsistencia | null;
  cliente: FilaReporteCliente | null;
  resultado: ResultadoDia;
  detalle: string;
  resolucion: ResolucionConciliacion | null;
}

export interface ResultadoConciliacion {
  dias: DiaConciliado[];
  // Filas del reporte cuyo carnet no corresponde a nadie de nuestro personal.
  filasSinPersona: FilaReporteCliente[];
}

export function normalizarCarnet(carnet: string) {
  return carnet.replace(/\s+/g, "").toUpperCase();
}

function diferenciaMinutos(propia: string, delCliente: string) {
  return horaAMinutos(delCliente) - horaAMinutos(propia);
}

function conSigno(minutos: number) {
  return `${minutos > 0 ? "+" : ""}${minutos} min`;
}

function compararDia(propio: RegistroAsistencia | null, cliente: FilaReporteCliente | null): { resultado: ResultadoDia; detalle: string } {
  if (!propio && cliente) {
    return {
      resultado: "conflicto",
      detalle: `Solo aparece en el registro del cliente (${cliente.entrada ?? "sin entrada"} a ${cliente.salida ?? "sin salida"}).`,
    };
  }
  if (!propio) return { resultado: "coincide", detalle: "" };

  if (propio.estado !== "presente") {
    const ausencia = nombresEstadoAsistencia[propio.estado];
    if (!cliente) return { resultado: "coincide", detalle: `Ausente en los dos registros (${ausencia}).` };
    return {
      resultado: "conflicto",
      detalle: `En nuestro registro figura ${ausencia.toLowerCase()}; el cliente tiene marcación de ${cliente.entrada ?? "?"} a ${cliente.salida ?? "?"}.`,
    };
  }

  if (!cliente) {
    return {
      resultado: "conflicto",
      detalle: `En nuestro registro vino (${propio.entrada} a ${propio.salida}); en el del cliente no hay marcación.`,
    };
  }

  const diferencias: string[] = [];
  if (!cliente.entrada) {
    diferencias.push("El cliente no tiene marcación de entrada.");
  } else {
    const minutos = diferenciaMinutos(propio.entrada!, cliente.entrada);
    if (Math.abs(minutos) > toleranciaConciliacionMinutos) {
      diferencias.push(`Entrada ${propio.entrada} en nuestro registro y ${cliente.entrada} en el del cliente (${conSigno(minutos)}).`);
    }
  }
  if (!cliente.salida) {
    diferencias.push("El cliente no tiene marcación de salida.");
  } else {
    const minutos = diferenciaMinutos(propio.salida!, cliente.salida);
    if (Math.abs(minutos) > toleranciaConciliacionMinutos) {
      diferencias.push(`Salida ${propio.salida} en nuestro registro y ${cliente.salida} en el del cliente (${conSigno(minutos)}).`);
    }
  }
  if (diferencias.length > 0) return { resultado: "no_coincide", detalle: diferencias.join(" ") };
  return { resultado: "coincide", detalle: "Entrada y salida coinciden." };
}

export function conciliar(
  registrosPropios: RegistroAsistencia[],
  filasCliente: FilaReporteCliente[],
  personas: Persona[],
  resoluciones: ResolucionConciliacion[],
): ResultadoConciliacion {
  const personaPorCarnet = new Map(personas.map((persona) => [normalizarCarnet(persona.carnetIdentidad), persona]));
  const idsDelRegistro = new Set(registrosPropios.map((registro) => registro.idPersona));
  const propios = new Map(registrosPropios.map((registro) => [`${registro.idPersona}|${registro.fecha}`, registro]));
  const delCliente = new Map<string, FilaReporteCliente>();
  const filasSinPersona: FilaReporteCliente[] = [];

  for (const fila of filasCliente) {
    const persona = personaPorCarnet.get(normalizarCarnet(fila.carnetIdentidad));
    if (!persona || !idsDelRegistro.has(persona.id)) {
      filasSinPersona.push(fila);
      continue;
    }
    delCliente.set(`${persona.id}|${fila.fecha}`, fila);
  }

  const resolucionPorClave = new Map(resoluciones.map((resolucion) => [`${resolucion.idPersona}|${resolucion.fecha}`, resolucion]));
  const claves = Array.from(new Set([...propios.keys(), ...delCliente.keys()])).sort();
  const dias = claves.map((clave) => {
    const [idPersona, fecha] = clave.split("|");
    const propio = propios.get(clave) ?? null;
    const cliente = delCliente.get(clave) ?? null;
    const { resultado, detalle } = compararDia(propio, cliente);
    return {
      clave,
      idPersona,
      fecha,
      propio,
      cliente,
      resultado,
      detalle,
      resolucion: resultado === "coincide" ? null : (resolucionPorClave.get(clave) ?? null),
    };
  });

  return { dias, filasSinPersona };
}

// Si la persona trabajó ese día, según los registros y la resolución tomada.
// Devuelve null mientras el día siga en conflicto sin resolver.
export function diaTrabajado(dia: DiaConciliado): boolean | null {
  const vinoSegunPropio = dia.propio?.estado === "presente";
  const vinoSegunCliente = dia.cliente !== null;
  if (dia.resultado === "coincide") return vinoSegunPropio;
  if (dia.resultado === "no_coincide") return true;
  if (!dia.resolucion) return null;
  return dia.resolucion.registroValido === "propio" ? vinoSegunPropio : vinoSegunCliente;
}
