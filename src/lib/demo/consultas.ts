import type {
  Asignacion,
  Cliente,
  Convocatoria,
  EstadoDemo,
  Postulacion,
  Postulante,
  Puesto,
  RequisitosConvocatoria,
  Sucursal,
  Turno,
} from "@/datos/tipos";
import { calcularCumplimiento } from "@/lib/cumplimiento";

// Consultas derivadas del estado de la demo. Son funciones puras: las pantallas
// las llaman con el estado actual y React Compiler se encarga de memorizarlas.

export function asignacionesActuales(estado: EstadoDemo) {
  return estado.asignaciones.filter((asignacion) => asignacion.hasta === null);
}

export function asignacionActualDePersona(estado: EstadoDemo, idPersona: string): Asignacion | undefined {
  return estado.asignaciones.find((asignacion) => asignacion.idPersona === idPersona && asignacion.hasta === null);
}

export function calificacionDePersona(estado: EstadoDemo, idPersona: string) {
  const evaluaciones = estado.evaluaciones.filter((evaluacion) => evaluacion.idPersona === idPersona);
  if (evaluaciones.length === 0) return null;
  return evaluaciones.reduce((suma, evaluacion) => suma + evaluacion.estrellas, 0) / evaluaciones.length;
}

export interface CoberturaRequerimiento {
  puesto: Puesto;
  turno: Turno;
  requeridos: number;
  asignados: number;
}

export interface CoberturaSucursal {
  sucursal: Sucursal;
  requerimientos: CoberturaRequerimiento[];
  requeridos: number;
  asignados: number;
}

export function coberturaDeSucursal(estado: EstadoDemo, sucursal: Sucursal): CoberturaSucursal {
  const actuales = asignacionesActuales(estado).filter((asignacion) => asignacion.idSucursal === sucursal.id);
  const requerimientos = sucursal.requerimientos.map((requerimiento) => ({
    puesto: requerimiento.puesto,
    turno: requerimiento.turno,
    requeridos: requerimiento.cantidad,
    asignados: actuales.filter(
      (asignacion) => asignacion.puesto === requerimiento.puesto && asignacion.turno === requerimiento.turno,
    ).length,
  }));
  return {
    sucursal,
    requerimientos,
    requeridos: requerimientos.reduce((suma, item) => suma + item.requeridos, 0),
    asignados: requerimientos.reduce((suma, item) => suma + Math.min(item.asignados, item.requeridos), 0),
  };
}

export function coberturaDeCliente(estado: EstadoDemo, idCliente: string) {
  const sucursales = estado.sucursales
    .filter((sucursal) => sucursal.idCliente === idCliente)
    .map((sucursal) => coberturaDeSucursal(estado, sucursal));
  return {
    sucursales,
    requeridos: sucursales.reduce((suma, item) => suma + item.requeridos, 0),
    asignados: sucursales.reduce((suma, item) => suma + item.asignados, 0),
  };
}

export function coberturaGeneral(estado: EstadoDemo) {
  const sucursales = estado.sucursales.map((sucursal) => coberturaDeSucursal(estado, sucursal));
  return {
    sucursales,
    requeridos: sucursales.reduce((suma, item) => suma + item.requeridos, 0),
    asignados: sucursales.reduce((suma, item) => suma + item.asignados, 0),
  };
}

export function postulacionesDeConvocatoria(estado: EstadoDemo, idConvocatoria: string) {
  return estado.postulaciones.filter((postulacion) => postulacion.idConvocatoria === idConvocatoria);
}

export interface FilaPostulante {
  postulacion: Postulacion;
  postulante: Postulante;
  cumplimiento: number;
}

// Postulantes de una convocatoria con su porcentaje de cumplimiento.
export function postulantesDeConvocatoria(estado: EstadoDemo, convocatoria: Convocatoria): FilaPostulante[] {
  const postulantePorId = new Map(estado.postulantes.map((postulante) => [postulante.id, postulante]));
  return postulacionesDeConvocatoria(estado, convocatoria.id).flatMap((postulacion) => {
    const postulante = postulantePorId.get(postulacion.idPostulante);
    if (!postulante) return [];
    return [{ postulacion, postulante, cumplimiento: calcularCumplimiento(convocatoria.requisitos, postulante) }];
  });
}

// Personas de la base que conviene sugerir para un puesto: postularon antes al
// mismo puesto o tienen alguna de las habilidades pedidas. Sin este filtro,
// cualquiera que viva en la ciudad y sea bachiller ya cumpliría la mitad de los
// requisitos de casi cualquier vacante.
export function coincidenciasEnLaBase(
  estado: EstadoDemo,
  puesto: Puesto,
  requisitos: RequisitosConvocatoria,
  umbral: number,
  excluir: Set<string> = new Set(),
) {
  const habilidadesPedidas = new Set(requisitos.habilidades);
  return estado.postulantes
    .filter((postulante) => !excluir.has(postulante.id))
    .filter(
      (postulante) =>
        puestosDePostulante(estado, postulante.id).includes(puesto) ||
        postulante.habilidades.some((habilidad) => habilidadesPedidas.has(habilidad)),
    )
    .map((postulante) => ({ postulante, cumplimiento: calcularCumplimiento(requisitos, postulante) }))
    .filter((item) => item.cumplimiento >= umbral)
    .sort((a, b) => b.cumplimiento - a.cumplimiento);
}

// Personas de la base que no están en la convocatoria y cumplen el umbral.
export function sugeridosDeLaBase(estado: EstadoDemo, convocatoria: Convocatoria, umbral: number) {
  const yaIncluidos = new Set(
    postulacionesDeConvocatoria(estado, convocatoria.id).map((postulacion) => postulacion.idPostulante),
  );
  return coincidenciasEnLaBase(estado, convocatoria.puesto, convocatoria.requisitos, umbral, yaIncluidos);
}

// Puestos a los que postuló una persona: es su categoría dentro de la base.
export function puestosDePostulante(estado: EstadoDemo, idPostulante: string): Puesto[] {
  const convocatoriaPorId = new Map(estado.convocatorias.map((convocatoria) => [convocatoria.id, convocatoria]));
  const puestos = estado.postulaciones
    .filter((postulacion) => postulacion.idPostulante === idPostulante)
    .map((postulacion) => convocatoriaPorId.get(postulacion.idConvocatoria)?.puesto)
    .filter((puesto): puesto is Puesto => puesto !== undefined);
  return Array.from(new Set(puestos));
}

export function destinoDeConvocatoria(estado: EstadoDemo, convocatoria: Convocatoria) {
  const cliente = estado.clientes.find((item) => item.id === convocatoria.idCliente);
  const sucursal = estado.sucursales.find((item) => item.id === convocatoria.idSucursal);
  if (!cliente) return `Uso interno · ${convocatoria.requisitos.ciudad}`;
  if (!sucursal) return `${cliente.nombre} · Varias sucursales en ${convocatoria.requisitos.ciudad}`;
  return `${cliente.nombre} · ${sucursal.nombre}`;
}

export interface AsignacionDetallada {
  asignacion: Asignacion;
  sucursal: Sucursal | undefined;
  cliente: Cliente | undefined;
}

// Asignaciones de una persona, de la actual a la más antigua, con su sucursal y cliente.
export function historialDePersona(estado: EstadoDemo, idPersona: string): AsignacionDetallada[] {
  return estado.asignaciones
    .filter((asignacion) => asignacion.idPersona === idPersona)
    .sort((a, b) => Number(b.hasta === null) - Number(a.hasta === null) || b.desde.localeCompare(a.desde))
    .map((asignacion) => {
      const sucursal = estado.sucursales.find((item) => item.id === asignacion.idSucursal);
      const cliente = estado.clientes.find((item) => item.id === sucursal?.idCliente);
      return { asignacion, sucursal, cliente };
    });
}

export function nombreDeSucursalConCliente(estado: EstadoDemo, idSucursal: string) {
  const sucursal = estado.sucursales.find((item) => item.id === idSucursal);
  if (!sucursal) return "";
  const cliente = estado.clientes.find((item) => item.id === sucursal.idCliente);
  return cliente ? `${cliente.nombre}, ${sucursal.nombre}` : sucursal.nombre;
}
