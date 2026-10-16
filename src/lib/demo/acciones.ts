"use client";

import type {
  Convocatoria,
  EstadoConvocatoria,
  EstadoPostulacion,
  Postulacion,
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
