"use client";

import type {
  Ausencia,
  Convocatoria,
  Evaluacion,
  EstadoConvocatoria,
  EstadoPostulacion,
  Postulacion,
  Postulante,
} from "@/datos/tipos";
import { actualizarEstado, obtenerEstado } from "@/lib/demo/almacen";
import { fechaDeHoy } from "@/lib/formato";

// Cambios que se pueden hacer durante la demo. Todos pasan por actualizarEstado,
// que guarda en el navegador y avisa a las pantallas abiertas.

function crearId(prefijo: string) {
  return `${prefijo}-${Date.now().toString(36)}${Math.random().toString(36).slice(2, 6)}`;
}

export function crearConvocatoria(datos: Omit<Convocatoria, "id" | "estado">) {
  const convocatoria: Convocatoria = { ...datos, id: crearId("conv"), estado: "abierta" };
  actualizarEstado((estado) => ({ ...estado, convocatorias: [convocatoria, ...estado.convocatorias] }));
  return convocatoria;
}

export function cambiarEstadoConvocatoria(idConvocatoria: string, nuevoEstado: EstadoConvocatoria) {
  actualizarEstado((estado) => ({
    ...estado,
    convocatorias: estado.convocatorias.map((convocatoria) =>
      convocatoria.id === idConvocatoria ? { ...convocatoria, estado: nuevoEstado } : convocatoria,
    ),
  }));
}

export function cambiarEstadoPostulaciones(idsPostulaciones: string[], nuevoEstado: EstadoPostulacion) {
  const ids = new Set(idsPostulaciones);
  actualizarEstado((estado) => ({
    ...estado,
    postulaciones: estado.postulaciones.map((postulacion) =>
      ids.has(postulacion.id) ? { ...postulacion, estado: nuevoEstado } : postulacion,
    ),
  }));
}

export function agregarEvaluacion(datos: Omit<Evaluacion, "id" | "fecha">) {
  const evaluacion: Evaluacion = { ...datos, id: crearId("eva"), fecha: fechaDeHoy() };
  actualizarEstado((estado) => ({ ...estado, evaluaciones: [evaluacion, ...estado.evaluaciones] }));
}

export function registrarAusencia(datos: Omit<Ausencia, "id">) {
  const ausencia: Ausencia = { ...datos, id: crearId("aus") };
  actualizarEstado((estado) => ({ ...estado, ausencias: [...estado.ausencias, ausencia] }));
}

export function normalizarCarnet(carnet: string) {
  return carnet.replace(/\s+/g, "").toUpperCase();
}

export type ResultadoPostulacion =
  | { tipo: "registrada"; postulante: Postulante; esNueva: boolean }
  | { tipo: "ya_postulo"; postulante: Postulante };

// Lo que envía la persona desde la página pública. Si su carnet ya está en la
// base, se actualizan sus datos en lugar de crear a otra persona.
export function registrarPostulacion(
  datos: Omit<Postulante, "id" | "fechaRegistro">,
  idConvocatoria: string,
): ResultadoPostulacion {
  const estado = obtenerEstado();
  const existente = estado.postulantes.find(
    (postulante) => normalizarCarnet(postulante.carnetIdentidad) === normalizarCarnet(datos.carnetIdentidad),
  );
  if (
    existente &&
    estado.postulaciones.some(
      (postulacion) => postulacion.idPostulante === existente.id && postulacion.idConvocatoria === idConvocatoria,
    )
  ) {
    return { tipo: "ya_postulo", postulante: existente };
  }

  const postulante: Postulante = existente
    ? { ...existente, ...datos }
    : { ...datos, id: crearId("pos"), fechaRegistro: fechaDeHoy() };
  const postulacion: Postulacion = {
    id: crearId("pst"),
    idPostulante: postulante.id,
    idConvocatoria,
    fecha: fechaDeHoy(),
    estado: "nuevo",
    origen: "postulacion",
  };
  actualizarEstado((actual) => ({
    ...actual,
    postulantes: existente
      ? actual.postulantes.map((item) => (item.id === postulante.id ? postulante : item))
      : [...actual.postulantes, postulante],
    postulaciones: [...actual.postulaciones, postulacion],
  }));
  return { tipo: "registrada", postulante, esNueva: !existente };
}

// Suma personas de la base a una convocatoria. Devuelve cuántas se agregaron:
// quien ya está en esa convocatoria no se duplica.
export function invitarAConvocatoria(idsPostulantes: string[], idConvocatoria: string) {
  const yaIncluidos = new Set(
    obtenerEstado()
      .postulaciones.filter((postulacion) => postulacion.idConvocatoria === idConvocatoria)
      .map((postulacion) => postulacion.idPostulante),
  );
  const nuevas: Postulacion[] = idsPostulantes
    .filter((idPostulante) => !yaIncluidos.has(idPostulante))
    .map((idPostulante) => ({
      id: crearId("pst"),
      idPostulante,
      idConvocatoria,
      fecha: fechaDeHoy(),
      estado: "nuevo",
      origen: "invitacion",
    }));
  if (nuevas.length > 0) {
    actualizarEstado((estado) => ({ ...estado, postulaciones: [...estado.postulaciones, ...nuevas] }));
  }
  return nuevas.length;
}
