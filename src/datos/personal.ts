import type { Aleatorio } from "./aleatorio.ts";
import { empresa, fechaReferenciaDemo } from "./catalogos.ts";
import { clientesIniciales, sucursalesIniciales } from "./clientes.ts";
import { sumarDias, sumarMeses } from "./fechas.ts";
import type { CrearIdentidad } from "./identidades.ts";
import type {
  Asignacion,
  Ausencia,
  Ciudad,
  Evaluacion,
  Persona,
  Puesto,
  Sucursal,
  TipoAusencia,
  Turno,
} from "./tipos.ts";

// Puestos de sucursal que quedan sin cubrir a propósito, para que la cobertura
// muestre faltantes: [id de sucursal, puesto, turno].
const vacantesSinCubrir: [string, Puesto, Turno][] = [
  ["suc-bh-sacaba", "limpieza", "manana"],
  ["suc-bh-calacoto", "seguridad", "completo"],
  ["suc-kt-almacen", "seguridad", "tarde"],
];

// Personal sin asignación actual: recién ingresados o que terminaron en un cliente.
const personalDisponible: { puesto: Puesto; ciudad: Ciudad; recienIngresado: boolean }[] = [
  { puesto: "limpieza", ciudad: "Cochabamba", recienIngresado: true },
  { puesto: "limpieza", ciudad: "La Paz", recienIngresado: false },
  { puesto: "recepcion", ciudad: "La Paz", recienIngresado: false },
  { puesto: "seguridad", ciudad: "Cochabamba", recienIngresado: false },
  { puesto: "conserje", ciudad: "Cochabamba", recienIngresado: true },
  { puesto: "auxiliar_administrativo", ciudad: "Cochabamba", recienIngresado: false },
];

const proporcionMujeresPorPuesto: Record<Puesto, number> = {
  limpieza: 0.65,
  recepcion: 0.75,
  conserje: 0.15,
  seguridad: 0.15,
  auxiliar_administrativo: 0.5,
};

const comentariosPorEstrellas: Record<number, string[]> = {
  5: [
    "Muy puntual y responsable. El cliente pidió que se quede de forma fija.",
    "Excelente trato con el personal del cliente. Siempre dispuesta a apoyar.",
    "Destaca por su orden y cuidado. Ninguna observación en el periodo.",
    "El cliente la felicitó por escrito. Ideal para clientes exigentes.",
    "Resuelve sin que se lo pidan. Muy buena referencia del supervisor.",
  ],
  4: [
    "Buen desempeño en general. Cumple con lo asignado.",
    "Responsable y cordial. Mejoró su puntualidad en el último mes.",
    "El cliente está conforme. Puede asumir más responsabilidades.",
    "Trabajo prolijo. Tuvo un par de atrasos justificados.",
  ],
  3: [
    "Cumple, pero necesita seguimiento en puntualidad.",
    "El cliente pidió reforzar la atención en horarios de mayor movimiento.",
    "Desempeño aceptable. Se recomienda capacitación en el uso de insumos.",
  ],
};

const motivosPorTipoAusencia: Record<TipoAusencia, string[]> = {
  permiso: ["Trámite personal", "Cita médica", "Asunto familiar", "Reunión en el colegio de su hija"],
  vacacion: ["Vacación anual", "Vacación acumulada"],
  baja_medica: ["Resfrío fuerte con certificado médico", "Esguince de tobillo", "Gastroenteritis"],
  falta: ["Sin justificar", "Avisó tarde, no presentó respaldo"],
};

// Días que se suman a la fecha de inicio: 0 es una ausencia de un solo día.
const duracionEnDiasPorTipoAusencia: Record<TipoAusencia, [number, number]> = {
  permiso: [0, 0],
  vacacion: [4, 9],
  baja_medica: [1, 3],
  falta: [0, 0],
};

export interface PersonalGenerado {
  personas: Persona[];
  asignaciones: Asignacion[];
  evaluaciones: Evaluacion[];
  ausencias: Ausencia[];
}

export function generarPersonal(aleatorio: Aleatorio, crearIdentidad: CrearIdentidad): PersonalGenerado {
  const personas: Persona[] = [];
  const asignaciones: Asignacion[] = [];
  const evaluaciones: Evaluacion[] = [];
  const ausencias: Ausencia[] = [];

  const clientePorId = new Map(clientesIniciales.map((cliente) => [cliente.id, cliente]));
  const pendientesSinCubrir = vacantesSinCubrir.map((vacante) => [...vacante]);

  function crearPersona(puesto: Puesto, ciudad: Ciudad, fechaIngreso: string) {
    const identidad = crearIdentidad(ciudad, { mujer: aleatorio.probabilidad(proporcionMujeresPorPuesto[puesto]) });
    const persona: Persona = {
      id: `per-${String(personas.length + 1).padStart(3, "0")}`,
      ...identidad,
      ciudad,
      puesto,
      fechaIngreso,
    };
    personas.push(persona);
    return persona;
  }

  function agregarAsignacion(
    idPersona: string,
    sucursal: Sucursal,
    puesto: Puesto,
    turno: Turno,
    desde: string,
    hasta: string | null,
  ) {
    asignaciones.push({
      id: `asg-${String(asignaciones.length + 1).padStart(3, "0")}`,
      idPersona,
      idSucursal: sucursal.id,
      puesto,
      turno,
      desde,
      hasta,
    });
  }

  // Sucursales anteriores posibles para alguien de este puesto y ciudad.
  function sucursalesHistoricas(puesto: Puesto, ciudad: Ciudad, inicio: string, fin: string, excluirCliente: string | null) {
    return sucursalesIniciales.filter((sucursal) => {
      const cliente = clientePorId.get(sucursal.idCliente)!;
      if (sucursal.ciudad !== ciudad || cliente.id === excluirCliente) return false;
      if (inicio < cliente.clienteDesde) return false;
      if (cliente.estado === "finalizado") return fin <= "2024-06-30";
      return sucursal.requerimientos.some((requerimiento) => requerimiento.puesto === puesto);
    });
  }

  // Arma hacia atrás de 0 a 3 asignaciones anteriores y devuelve la fecha de ingreso.
  function generarHistorial(persona: Persona, finDelHistorial: string, clienteActual: string | null, cantidad: number) {
    let fin = finDelHistorial;
    let clienteSiguiente = clienteActual;
    let ingreso = sumarDias(finDelHistorial, 1);
    for (let indice = 0; indice < cantidad; indice++) {
      const meses = aleatorio.entero(4, 16);
      const inicio = sumarDias(sumarMeses(fin, -meses), 1);
      const opciones = sucursalesHistoricas(persona.puesto, persona.ciudad, inicio, fin, clienteSiguiente);
      if (opciones.length === 0) break;
      const sucursal = aleatorio.elegir(opciones);
      const requerimiento = sucursal.requerimientos.find((item) => item.puesto === persona.puesto);
      agregarAsignacion(persona.id, sucursal, persona.puesto, requerimiento?.turno ?? "manana", inicio, fin);
      ingreso = inicio;
      clienteSiguiente = sucursal.idCliente;
      fin = sumarDias(inicio, -aleatorio.entero(1, 20));
    }
    return ingreso;
  }

  function cantidadHistorial() {
    const valor = aleatorio.siguiente();
    if (valor < 0.15) return 0;
    if (valor < 0.55) return 1;
    if (valor < 0.85) return 2;
    return 3;
  }

  // 1. Personal asignado a cada puesto requerido por las sucursales activas.
  for (const sucursal of sucursalesIniciales) {
    for (const requerimiento of sucursal.requerimientos) {
      for (let lugar = 0; lugar < requerimiento.cantidad; lugar++) {
        const indiceVacante = pendientesSinCubrir.findIndex(
          ([idSucursal, puesto, turno]) =>
            idSucursal === sucursal.id && puesto === requerimiento.puesto && turno === requerimiento.turno,
        );
        if (indiceVacante >= 0) {
          pendientesSinCubrir.splice(indiceVacante, 1);
          continue;
        }

        const desdeActual = sumarMeses("2026-09-01", -aleatorio.entero(1, 40));
        const persona = crearPersona(requerimiento.puesto, sucursal.ciudad, desdeActual);
        agregarAsignacion(persona.id, sucursal, requerimiento.puesto, requerimiento.turno, desdeActual, null);
        persona.fechaIngreso = generarHistorial(
          persona,
          sumarDias(desdeActual, -aleatorio.entero(3, 25)),
          sucursal.idCliente,
          cantidadHistorial(),
        );
        if (persona.fechaIngreso > desdeActual) persona.fechaIngreso = desdeActual;
      }
    }
  }

  // 2. Personal disponible, sin asignación actual.
  for (const disponible of personalDisponible) {
    if (disponible.recienIngresado) {
      crearPersona(disponible.puesto, disponible.ciudad, sumarDias(fechaReferenciaDemo, -aleatorio.entero(3, 12)));
      continue;
    }
    const persona = crearPersona(disponible.puesto, disponible.ciudad, fechaReferenciaDemo);
    const finUltimaAsignacion = sumarDias("2026-08-31", -aleatorio.entero(0, 25));
    persona.fechaIngreso = generarHistorial(persona, finUltimaAsignacion, null, aleatorio.entero(1, 3));
  }

  // 3. Evaluaciones: el promedio de estrellas es la calificación de la persona.
  for (const persona of personas) {
    const asignacionesDePersona = asignaciones.filter((asignacion) => asignacion.idPersona === persona.id);
    if (asignacionesDePersona.length === 0) continue;

    const esBanco = asignacionesDePersona.some(
      (asignacion) => asignacion.hasta === null && asignacion.idSucursal.startsWith("suc-bh-"),
    );
    const nivelBase = esBanco ? aleatorio.elegir([4, 5, 5]) : aleatorio.elegir([3, 4, 4, 5]);
    const cantidad = aleatorio.entero(1, Math.min(4, asignacionesDePersona.length + 2));

    for (let indice = 0; indice < cantidad; indice++) {
      const asignacion = aleatorio.elegir(asignacionesDePersona);
      const finAsignacion = asignacion.hasta ?? fechaReferenciaDemo;
      const fecha = sumarDias(asignacion.desde, aleatorio.entero(30, 200));
      const estrellas = Math.max(3, Math.min(5, nivelBase + aleatorio.elegir([-1, 0, 0, 0, 1])));
      const sucursal = sucursalesIniciales.find((item) => item.id === asignacion.idSucursal)!;
      const cliente = clientePorId.get(sucursal.idCliente)!;
      evaluaciones.push({
        id: `eva-${String(evaluaciones.length + 1).padStart(3, "0")}`,
        idPersona: persona.id,
        fecha: fecha < finAsignacion ? fecha : finAsignacion,
        estrellas,
        comentario: aleatorio.elegir(comentariosPorEstrellas[estrellas]),
        autor: aleatorio.probabilidad(0.5) ? `${cliente.contactoNombre}, ${cliente.nombre}` : `Supervisión de ${empresa.nombre}`,
        idCliente: cliente.id,
      });
    }
  }
  evaluaciones.sort((a, b) => b.fecha.localeCompare(a.fecha));

  // 4. Permisos y ausencias de los últimos meses.
  for (const persona of personas) {
    if (!aleatorio.probabilidad(0.55)) continue;
    const cantidad = aleatorio.entero(1, 3);
    for (let indice = 0; indice < cantidad; indice++) {
      const tipo = aleatorio.elegir<TipoAusencia>(["permiso", "permiso", "vacacion", "baja_medica", "falta"]);
      const desde = sumarDias("2026-04-01", aleatorio.entero(0, 150));
      if (desde < persona.fechaIngreso) continue;
      const [duracionMinima, duracionMaxima] = duracionEnDiasPorTipoAusencia[tipo];
      const duracion = aleatorio.entero(duracionMinima, duracionMaxima);
      ausencias.push({
        id: `aus-${String(ausencias.length + 1).padStart(3, "0")}`,
        idPersona: persona.id,
        tipo,
        desde,
        hasta: sumarDias(desde, duracion),
        motivo: aleatorio.elegir(motivosPorTipoAusencia[tipo]),
      });
    }
  }

  return { personas, asignaciones, evaluaciones, ausencias };
}
