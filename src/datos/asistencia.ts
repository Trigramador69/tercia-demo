import type { Aleatorio } from "./aleatorio.ts";
import { horarioPorTurno } from "./catalogos.ts";
import { diaDeLaSemana, diasDelMes, desplazarHora, estaEnRango } from "./fechas.ts";
import type {
  Asignacion,
  Ausencia,
  EstadoAsistencia,
  FilaReporteCliente,
  Persona,
  RegistroAsistencia,
  Sucursal,
  TipoAusencia,
} from "./tipos.ts";

// Clientes con asistencia cargada en la demo.
export const clientesConAsistencia = ["cli-banco-horizonte", "cli-kantuta"];

interface DatosAsistencia {
  personas: Persona[];
  asignaciones: Asignacion[];
  sucursales: Sucursal[];
}

interface AusenciaPlantada {
  cliente: string;
  posicion: number;
  tipo: TipoAusencia;
  desde: string;
  hasta: string;
  motivo: string;
}

// Ausencias de septiembre que figuran en el registro propio. Las personas se
// eligen por su posición dentro del personal de cada cliente, ordenado por id.
const ausenciasPlantadas: AusenciaPlantada[] = [
  { cliente: "cli-banco-horizonte", posicion: 2, tipo: "vacacion", desde: "2026-09-14", hasta: "2026-09-18", motivo: "Vacación anual" },
  { cliente: "cli-banco-horizonte", posicion: 5, tipo: "permiso", desde: "2026-09-24", hasta: "2026-09-24", motivo: "Cita médica" },
  { cliente: "cli-banco-horizonte", posicion: 7, tipo: "falta", desde: "2026-09-22", hasta: "2026-09-22", motivo: "Sin justificar" },
  { cliente: "cli-kantuta", posicion: 1, tipo: "baja_medica", desde: "2026-09-08", hasta: "2026-09-09", motivo: "Resfrío fuerte con certificado médico" },
  { cliente: "cli-kantuta", posicion: 3, tipo: "falta", desde: "2026-09-17", hasta: "2026-09-17", motivo: "Avisó tarde, no presentó respaldo" },
];

export type TipoDiferenciaPlantada =
  | "sin_marcacion_cliente"
  | "entrada_distinta"
  | "salida_distinta"
  | "solo_en_cliente"
  | "ausente_con_marcacion"
  | "sin_salida";

interface DiferenciaPlantada {
  cliente: string;
  posicion: number;
  fecha: string;
  tipo: TipoDiferenciaPlantada;
  minutos?: number;
}

// Diferencias que el reporte del cliente trae a propósito para la conciliación.
const diferenciasPlantadas: DiferenciaPlantada[] = [
  { cliente: "cli-banco-horizonte", posicion: 0, fecha: "2026-09-08", tipo: "sin_marcacion_cliente" },
  { cliente: "cli-banco-horizonte", posicion: 1, fecha: "2026-09-15", tipo: "entrada_distinta", minutos: 90 },
  { cliente: "cli-banco-horizonte", posicion: 7, fecha: "2026-09-22", tipo: "ausente_con_marcacion" },
  { cliente: "cli-banco-horizonte", posicion: 3, fecha: "2026-09-10", tipo: "salida_distinta", minutos: -110 },
  { cliente: "cli-banco-horizonte", posicion: 4, fecha: "2026-09-19", tipo: "solo_en_cliente" },
  { cliente: "cli-banco-horizonte", posicion: 5, fecha: "2026-09-24", tipo: "ausente_con_marcacion" },
  { cliente: "cli-banco-horizonte", posicion: 6, fecha: "2026-09-03", tipo: "entrada_distinta", minutos: 35 },
  { cliente: "cli-banco-horizonte", posicion: 8, fecha: "2026-09-29", tipo: "sin_salida" },
  { cliente: "cli-kantuta", posicion: 0, fecha: "2026-09-12", tipo: "sin_marcacion_cliente" },
  { cliente: "cli-kantuta", posicion: 2, fecha: "2026-09-23", tipo: "entrada_distinta", minutos: 45 },
  { cliente: "cli-kantuta", posicion: 3, fecha: "2026-09-17", tipo: "ausente_con_marcacion" },
];

const estadoPorTipoAusencia: Record<TipoAusencia, EstadoAsistencia> = {
  permiso: "permiso",
  vacacion: "vacacion",
  baja_medica: "baja_medica",
  falta: "falta",
};

// Asignaciones del mes para un cliente, ordenadas por persona.
function asignacionesDelCliente(datos: DatosAsistencia, idCliente: string, mes: string) {
  const dias = diasDelMes(mes);
  const sucursalesDelCliente = new Set(
    datos.sucursales.filter((sucursal) => sucursal.idCliente === idCliente).map((sucursal) => sucursal.id),
  );
  return datos.asignaciones
    .filter((asignacion) => sucursalesDelCliente.has(asignacion.idSucursal))
    .filter((asignacion) => estaEnRango(dias[0], asignacion.desde, asignacion.hasta))
    .sort((a, b) => a.idPersona.localeCompare(b.idPersona));
}

export function generarAusenciasDelMes(datos: DatosAsistencia, mes: string, idInicial: number): Ausencia[] {
  return ausenciasPlantadas.map((plantada, indice) => {
    const asignacion = asignacionesDelCliente(datos, plantada.cliente, mes)[plantada.posicion];
    return {
      id: `aus-${String(idInicial + indice).padStart(3, "0")}`,
      idPersona: asignacion.idPersona,
      tipo: plantada.tipo,
      desde: plantada.desde,
      hasta: plantada.hasta,
      motivo: plantada.motivo,
    };
  });
}

export function generarRegistrosAsistencia(
  aleatorio: Aleatorio,
  datos: DatosAsistencia,
  ausencias: Ausencia[],
  mes: string,
): RegistroAsistencia[] {
  const registros: RegistroAsistencia[] = [];
  const sucursalPorId = new Map(datos.sucursales.map((sucursal) => [sucursal.id, sucursal]));

  for (const idCliente of clientesConAsistencia) {
    for (const asignacion of asignacionesDelCliente(datos, idCliente, mes)) {
      const sucursal = sucursalPorId.get(asignacion.idSucursal)!;
      const horario = horarioPorTurno[asignacion.turno];
      for (const fecha of diasDelMes(mes)) {
        if (!sucursal.diasLaborales.includes(diaDeLaSemana(fecha))) continue;
        if (!estaEnRango(fecha, asignacion.desde, asignacion.hasta)) continue;
        const ausencia = ausencias.find(
          (item) => item.idPersona === asignacion.idPersona && estaEnRango(fecha, item.desde, item.hasta),
        );
        const estado = ausencia ? estadoPorTipoAusencia[ausencia.tipo] : "presente";
        registros.push({
          id: `reg-${String(registros.length + 1).padStart(4, "0")}`,
          idPersona: asignacion.idPersona,
          idSucursal: asignacion.idSucursal,
          fecha,
          estado,
          entrada: estado === "presente" ? desplazarHora(horario.entrada, aleatorio.entero(-12, 6)) : null,
          salida: estado === "presente" ? desplazarHora(horario.salida, aleatorio.entero(-3, 18)) : null,
        });
      }
    }
  }
  return registros;
}

export interface ReporteClienteGenerado {
  filas: FilaReporteCliente[];
  diferencias: { persona: Persona; fecha: string; tipo: TipoDiferenciaPlantada; minutos?: number }[];
}

// Arma el reporte que entregaría el biométrico del cliente: casi todo coincide
// con el registro propio (con unos minutos de diferencia) salvo las diferencias
// plantadas.
export function generarReporteCliente(
  aleatorio: Aleatorio,
  datos: DatosAsistencia,
  registros: RegistroAsistencia[],
  idCliente: string,
  mes: string,
): ReporteClienteGenerado {
  const personaPorId = new Map(datos.personas.map((persona) => [persona.id, persona]));
  const sucursalPorId = new Map(datos.sucursales.map((sucursal) => [sucursal.id, sucursal]));
  const asignaciones = asignacionesDelCliente(datos, idCliente, mes);
  const prefijoCodigo = idCliente === "cli-banco-horizonte" ? "BH" : "KT";

  const diferencias = diferenciasPlantadas
    .filter((diferencia) => diferencia.cliente === idCliente)
    .map((diferencia) => ({
      ...diferencia,
      persona: personaPorId.get(asignaciones[diferencia.posicion].idPersona)!,
    }));

  function crearFila(persona: Persona, idSucursal: string, fecha: string, entrada: string | null, salida: string | null): FilaReporteCliente {
    const posicion = asignaciones.findIndex((asignacion) => asignacion.idPersona === persona.id);
    return {
      codigo: `${prefijoCodigo}-${String(410 + posicion * 7).padStart(4, "0")}`,
      carnetIdentidad: persona.carnetIdentidad,
      nombre: `${persona.apellidos} ${persona.nombres}`.toUpperCase(),
      sucursal: sucursalPorId.get(idSucursal)!.nombre,
      fecha,
      entrada,
      salida,
    };
  }

  const filas: FilaReporteCliente[] = [];
  const idsPersonas = new Set(asignaciones.map((asignacion) => asignacion.idPersona));

  for (const registro of registros) {
    if (!idsPersonas.has(registro.idPersona)) continue;
    const persona = personaPorId.get(registro.idPersona)!;
    const diferencia = diferencias.find((item) => item.persona.id === persona.id && item.fecha === registro.fecha);
    const ruido = () => aleatorio.entero(-4, 4);

    if (registro.estado !== "presente") {
      if (diferencia?.tipo === "ausente_con_marcacion") {
        const horario = horarioPorTurno[asignaciones.find((item) => item.idPersona === persona.id)!.turno];
        filas.push(crearFila(persona, registro.idSucursal, registro.fecha, desplazarHora(horario.entrada, ruido()), desplazarHora(horario.salida, ruido())));
      }
      continue;
    }
    if (diferencia?.tipo === "sin_marcacion_cliente") continue;

    let entrada = desplazarHora(registro.entrada!, ruido());
    let salida: string | null = desplazarHora(registro.salida!, ruido());
    if (diferencia?.tipo === "entrada_distinta") entrada = desplazarHora(registro.entrada!, diferencia.minutos!);
    if (diferencia?.tipo === "salida_distinta") salida = desplazarHora(registro.salida!, diferencia.minutos!);
    if (diferencia?.tipo === "sin_salida") salida = null;
    filas.push(crearFila(persona, registro.idSucursal, registro.fecha, entrada, salida));
  }

  // Días que solo aparecen en el registro del cliente (por ejemplo, un sábado extra).
  for (const diferencia of diferencias.filter((item) => item.tipo === "solo_en_cliente")) {
    const asignacion = asignaciones.find((item) => item.idPersona === diferencia.persona.id)!;
    const horario = horarioPorTurno[asignacion.turno];
    filas.push(crearFila(diferencia.persona, asignacion.idSucursal, diferencia.fecha, desplazarHora(horario.entrada, 30), desplazarHora(horario.entrada, 270)));
  }

  filas.sort((a, b) => a.fecha.localeCompare(b.fecha) || a.codigo.localeCompare(b.codigo));
  return { filas, diferencias: diferencias.map(({ persona, fecha, tipo, minutos }) => ({ persona, fecha, tipo, minutos })) };
}
