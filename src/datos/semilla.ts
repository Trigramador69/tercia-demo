import { crearAleatorio } from "./aleatorio.ts";
import {
  clientesConAsistencia,
  generarAusenciasDelMes,
  generarRegistrosAsistencia,
  generarReporteCliente,
} from "./asistencia.ts";
import { mesAsistenciaDemo } from "./catalogos.ts";
import { clientesIniciales, sucursalesIniciales } from "./clientes.ts";
import { crearGeneradorIdentidades } from "./identidades.ts";
import { generarPersonal } from "./personal.ts";
import { convocatoriasIniciales, generarReclutamiento } from "./reclutamiento.ts";
import type { EstadoDemo } from "./tipos.ts";

// Cambiar esta versión descarta lo guardado en los navegadores y vuelve a la semilla.
export const versionEstadoDemo = 2;

// Cada parte usa su propia semilla para que un cambio en una no altere las demás.
const semillas = {
  identidades: 20261022,
  personal: 1601,
  reclutamiento: 1602,
  asistencia: 1603,
  reporteCliente: 1604,
};

function generarBase() {
  const crearIdentidad = crearGeneradorIdentidades(crearAleatorio(semillas.identidades));
  const personal = generarPersonal(crearAleatorio(semillas.personal), crearIdentidad);
  const reclutamiento = generarReclutamiento(crearAleatorio(semillas.reclutamiento), crearIdentidad);

  const datosAsistencia = {
    personas: personal.personas,
    asignaciones: personal.asignaciones,
    sucursales: sucursalesIniciales,
  };
  const ausencias = [
    ...personal.ausencias,
    ...generarAusenciasDelMes(datosAsistencia, mesAsistenciaDemo, personal.ausencias.length + 1),
  ];
  const registrosAsistencia = generarRegistrosAsistencia(
    crearAleatorio(semillas.asistencia),
    datosAsistencia,
    ausencias,
    mesAsistenciaDemo,
  );

  return { personal, reclutamiento, ausencias, registrosAsistencia, datosAsistencia };
}

export function crearEstadoInicial(): EstadoDemo {
  const { personal, reclutamiento, ausencias, registrosAsistencia } = generarBase();
  return {
    version: versionEstadoDemo,
    rol: "recursos_humanos",
    clientes: structuredClone(clientesIniciales),
    sucursales: structuredClone(sucursalesIniciales),
    personas: personal.personas,
    asignaciones: personal.asignaciones,
    evaluaciones: personal.evaluaciones,
    ausencias,
    convocatorias: structuredClone(convocatoriasIniciales),
    postulantes: reclutamiento.postulantes,
    postulaciones: reclutamiento.postulaciones,
    registrosAsistencia,
    reportesCliente: [],
  };
}

// Reportes que entregaría cada cliente con asistencia, con sus diferencias
// plantadas. Los usa el script que deja los archivos de ejemplo en el repositorio.
export function generarReportesDeEjemplo() {
  const { registrosAsistencia, datosAsistencia } = generarBase();
  const aleatorio = crearAleatorio(semillas.reporteCliente);
  return clientesConAsistencia.map((idCliente) => ({
    cliente: clientesIniciales.find((cliente) => cliente.id === idCliente)!,
    ...generarReporteCliente(aleatorio, datosAsistencia, registrosAsistencia, idCliente, mesAsistenciaDemo),
  }));
}
