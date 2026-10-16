import type {
  Asignacion,
  EstadoDemo,
  Puesto,
  Sucursal,
  Turno,
} from "@/datos/tipos";

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

export function nombreDeSucursalConCliente(estado: EstadoDemo, idSucursal: string) {
  const sucursal = estado.sucursales.find((item) => item.id === idSucursal);
  if (!sucursal) return "";
  const cliente = estado.clientes.find((item) => item.id === sucursal.idCliente);
  return cliente ? `${cliente.nombre}, ${sucursal.nombre}` : sucursal.nombre;
}
