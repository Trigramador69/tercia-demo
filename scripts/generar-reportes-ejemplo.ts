// Genera en ejemplos/ los reportes de asistencia que entregaría cada cliente
// (como los exporta un biométrico), con las diferencias plantadas para la
// conciliación. Se ejecuta con: npm run generar:ejemplos

import { mkdirSync, writeFileSync } from "node:fs";
import { join } from "node:path";
import { mesAsistenciaDemo } from "../src/datos/catalogos.ts";
import { generarReportesDeEjemplo } from "../src/datos/semilla.ts";
import type { TipoDiferenciaPlantada } from "../src/datos/asistencia.ts";

const carpeta = join(import.meta.dirname, "..", "ejemplos");
mkdirSync(carpeta, { recursive: true });

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

function nombreArchivo(nombreCliente: string) {
  const base = nombreCliente.normalize("NFD").replace(/[̀-ͯ]/g, "").toLowerCase().replace(/\s+/g, "-");
  return `reporte-biometrico-${base}-${mesAsistenciaDemo}.csv`;
}

const lineasGuia = [
  "# Archivos de ejemplo para la conciliación",
  "",
  `Reportes de asistencia de ${mesAsistenciaDemo} tal como los entregaría cada cliente (exportados de su biométrico).`,
  "Se suben en la pantalla de Asistencia durante la demo. Están generados con `npm run generar:ejemplos`; no editarlos a mano.",
  "",
];

for (const reporte of generarReportesDeEjemplo()) {
  const encabezado = "Código;CI;Nombre;Sucursal;Fecha;Entrada;Salida";
  const filas = reporte.filas.map((fila) =>
    [fila.codigo, fila.carnetIdentidad, fila.nombre, fila.sucursal, fechaBoliviana(fila.fecha), fila.entrada ?? "", fila.salida ?? ""].join(";"),
  );
  const archivo = nombreArchivo(reporte.cliente.nombre);
  // El BOM hace que Excel abra el archivo con tildes correctas.
  writeFileSync(join(carpeta, archivo), "﻿" + [encabezado, ...filas].join("\r\n") + "\r\n", "utf8");

  lineasGuia.push(`## ${reporte.cliente.nombre}`, "", `Archivo: \`${archivo}\` (${reporte.filas.length} filas).`, "", "Diferencias plantadas:", "");
  lineasGuia.push("| Fecha | Persona | Diferencia |", "|---|---|---|");
  for (const diferencia of [...reporte.diferencias].sort((a, b) => a.fecha.localeCompare(b.fecha))) {
    const minutos = diferencia.minutos ? ` (${diferencia.minutos > 0 ? "+" : ""}${diferencia.minutos} min)` : "";
    lineasGuia.push(
      `| ${fechaBoliviana(diferencia.fecha)} | ${diferencia.persona.nombres} ${diferencia.persona.apellidos} | ${descripcionPorTipo[diferencia.tipo]}${minutos} |`,
    );
  }
  lineasGuia.push("");
  console.log(`${archivo}: ${reporte.filas.length} filas, ${reporte.diferencias.length} diferencias`);
}

writeFileSync(join(carpeta, "README.md"), lineasGuia.join("\n"), "utf8");
