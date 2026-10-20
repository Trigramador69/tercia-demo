// Genera en public/ejemplos/ los archivos que se suben durante la demo:
//  - los currículums en PDF para la página pública de postulación;
//  - los reportes de asistencia que entregaría cada cliente (como los exporta
//    un biométrico), con las diferencias plantadas para la conciliación;
//  - una guía (README.md) con qué muestra cada archivo.
// Se ejecuta con: npm run generar:ejemplos

import { mkdirSync, writeFileSync } from "node:fs";
import { join } from "node:path";
import { nombreArchivoReporte, type TipoDiferenciaPlantada } from "../src/datos/asistencia.ts";
import { mesAsistenciaDemo } from "../src/datos/catalogos.ts";
import { curriculumsEjemplo } from "../src/datos/curriculums.ts";
import { convocatoriasIniciales } from "../src/datos/reclutamiento.ts";
import { crearEstadoInicial, generarReportesDeEjemplo } from "../src/datos/semilla.ts";
import { calcularCumplimiento } from "../src/lib/cumplimiento.ts";
import { dibujarCurriculum } from "./curriculum-pdf.ts";

const carpeta = join(import.meta.dirname, "..", "public", "ejemplos");
mkdirSync(join(carpeta, "curriculums"), { recursive: true });

const marcaDeOrdenDeBytes = String.fromCharCode(0xfeff);

const descripcionPorTipo: Record<TipoDiferenciaPlantada, string> = {
  sin_marcacion_cliente: "Vino según nuestro registro; el cliente no tiene marcación",
  entrada_distinta: "Hora de entrada distinta",
  salida_distinta: "Hora de salida distinta",
  solo_en_cliente: "Día que solo aparece en el registro del cliente",
  ausente_con_marcacion: "En nuestro registro no vino (falta o permiso); el cliente tiene marcación ese día",
  sin_salida: "El cliente no tiene marcación de salida",
};

function fechaBoliviana(fecha: string) {
  const [anio, mes, dia] = fecha.split("-");
  return `${dia}/${mes}/${anio}`;
}

const guia = [
  "# Archivos de ejemplo de la demo",
  "",
  "Generados con `npm run generar:ejemplos`; no editarlos a mano. En la demo publicada se descargan desde",
  "`/ejemplos/...` o desde el botón **Archivos de ejemplo** del menú lateral.",
  "",
  "## Currículums para la página de postulación",
  "",
  "Al subir uno de estos archivos en `/postular`, el formulario se completa solo con sus datos.",
  "Con cualquier otro archivo, la persona completa el formulario a mano.",
  "",
  "| Archivo | Persona | Pensado para |",
  "|---|---|---|",
];

// 1. Currículums
for (const curriculum of curriculumsEjemplo) {
  writeFileSync(join(carpeta, "curriculums", curriculum.archivo), dibujarCurriculum(curriculum));
  guia.push(`| \`curriculums/${curriculum.archivo}\` | ${curriculum.datos.nombres} ${curriculum.datos.apellidos} | ${curriculum.pensadoPara} |`);
  const porcentajes = convocatoriasIniciales
    .filter((convocatoria) => convocatoria.estado === "abierta")
    .map((convocatoria) => `${convocatoria.titulo}: ${calcularCumplimiento(convocatoria.requisitos, curriculum.datos)}%`);
  console.log(`${curriculum.archivo} → ${porcentajes.join(" · ")}`);
}

// Persona de la base para mostrar que quien ya postuló reutiliza sus datos.
const estado = crearEstadoInicial();
const recepcion = convocatoriasIniciales.find((convocatoria) => convocatoria.id === "conv-recepcion-clinica")!;
const yaPostularon = new Set(
  estado.postulaciones.filter((postulacion) => postulacion.idConvocatoria === recepcion.id).map((postulacion) => postulacion.idPostulante),
);
const reutilizable = estado.postulantes
  .filter((postulante) => !yaPostularon.has(postulante.id) && postulante.ciudad === "Cochabamba")
  .map((postulante) => ({ postulante, cumplimiento: calcularCumplimiento(recepcion.requisitos, postulante) }))
  .sort((a, b) => b.cumplimiento - a.cumplimiento)[0];
guia.push(
  "",
  "Para mostrar que quien ya postuló antes reutiliza sus datos: en la postulación a",
  `**${recepcion.titulo}**, buscar el carnet **${reutilizable.postulante.carnetIdentidad}**`,
  `(${reutilizable.postulante.nombres} ${reutilizable.postulante.apellidos}, cumple el ${reutilizable.cumplimiento}%).`,
  "",
);

// 2. Reportes de asistencia de los clientes
guia.push(
  "## Reportes de asistencia para la conciliación",
  "",
  `Asistencia de ${mesAsistenciaDemo} tal como la entregaría cada cliente, exportada de su biométrico.`,
  "Se suben en la pantalla de Asistencia.",
  "",
);
for (const reporte of generarReportesDeEjemplo()) {
  const encabezado = "Código;CI;Nombre;Sucursal;Fecha;Entrada;Salida";
  const filas = reporte.filas.map((fila) =>
    [fila.codigo, fila.carnetIdentidad, fila.nombre, fila.sucursal, fechaBoliviana(fila.fecha), fila.entrada ?? "", fila.salida ?? ""].join(";"),
  );
  const archivo = nombreArchivoReporte(reporte.cliente.nombre, mesAsistenciaDemo);
  // La marca de orden de bytes hace que Excel abra el archivo con las tildes correctas.
  writeFileSync(join(carpeta, archivo), marcaDeOrdenDeBytes + [encabezado, ...filas].join("\r\n") + "\r\n", "utf8");

  guia.push(`### ${reporte.cliente.nombre}`, "", `Archivo: \`${archivo}\` (${reporte.filas.length} filas).`, "", "Diferencias plantadas:", "");
  guia.push("| Fecha | Persona | Diferencia |", "|---|---|---|");
  for (const diferencia of [...reporte.diferencias].sort((a, b) => a.fecha.localeCompare(b.fecha))) {
    const minutos = diferencia.minutos ? ` (${diferencia.minutos > 0 ? "+" : ""}${diferencia.minutos} min)` : "";
    guia.push(
      `| ${fechaBoliviana(diferencia.fecha)} | ${diferencia.persona.nombres} ${diferencia.persona.apellidos} | ${descripcionPorTipo[diferencia.tipo]}${minutos} |`,
    );
  }
  guia.push("");
  console.log(`${archivo}: ${reporte.filas.length} filas, ${reporte.diferencias.length} diferencias`);
}

writeFileSync(join(carpeta, "README.md"), guia.join("\n"), "utf8");
