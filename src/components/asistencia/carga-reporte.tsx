"use client";

import { useRef, useState } from "react";
import { FileSpreadsheet, Loader2, Upload } from "lucide-react";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import type { EstadoDemo } from "@/datos/tipos";
import { normalizarCarnet } from "@/lib/conciliacion";
import { cargarReporteCliente } from "@/lib/demo/acciones";
import { obtenerEstado } from "@/lib/demo/almacen";
import { asistenciaDeCliente } from "@/lib/demo/consultas";
import { formatearMes, pluralizar } from "@/lib/formato";
import { leerCsv, leerTabla, type Celda } from "@/lib/leer-reporte";
import { cn } from "@/lib/utils";

// Tiempo de la animación del cruce, para que se note el paso en la demo.
const demoraCruceMs = 900;

async function leerArchivo(archivo: File): Promise<Celda[][]> {
  if (/\.xlsx$/i.test(archivo.name)) {
    const { readSheet } = await import("read-excel-file/browser");
    return (await readSheet(archivo)) as Celda[][];
  }
  return leerCsv(await archivo.text());
}

// El cliente al que corresponde el reporte: el que tiene más personas con el
// mismo carnet que las filas del archivo.
function clienteDelReporte(estado: EstadoDemo, carnets: Set<string>, mes: string, candidatos: string[]) {
  return candidatos
    .map((idCliente) => {
      const { personas } = asistenciaDeCliente(estado, idCliente, mes);
      return { idCliente, coincidencias: personas.filter((persona) => carnets.has(normalizarCarnet(persona.carnetIdentidad))).length };
    })
    .sort((a, b) => b.coincidencias - a.coincidencias)[0];
}

export function CargaReporte({
  idCliente,
  nombreCliente,
  mes,
  clientesConRegistro,
  alCambiarCliente,
  compacta = false,
}: {
  idCliente: string;
  nombreCliente: string;
  mes: string;
  clientesConRegistro: string[];
  alCambiarCliente: (idCliente: string) => void;
  compacta?: boolean;
}) {
  const [cruzando, setCruzando] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [arrastrando, setArrastrando] = useState(false);
  const entrada = useRef<HTMLInputElement>(null);

  async function recibir(lista: FileList | null) {
    const archivo = lista?.[0];
    if (!archivo) return;
    setError(null);
    if (!/\.(csv|txt|xlsx)$/i.test(archivo.name)) {
      setError("El reporte debe estar en Excel (.xlsx) o CSV, como lo exporta el biométrico del cliente.");
      return;
    }
    let lectura;
    try {
      lectura = leerTabla(await leerArchivo(archivo));
    } catch {
      setError("No pudimos abrir el archivo. Suba el reporte en CSV o Excel (.xlsx).");
      return;
    }
    if (lectura.filas.length === 0) {
      setError(lectura.advertencias[0] ?? "El archivo no tiene filas de asistencia.");
      return;
    }
    if (lectura.mes !== mes) {
      setError(
        `El reporte es de ${lectura.mes ? formatearMes(lectura.mes).toLowerCase() : "otro mes"}, y el registro propio que se concilia es de ${formatearMes(mes).toLowerCase()}.`,
      );
      return;
    }

    const estado = obtenerEstado();
    const carnets = new Set(lectura.filas.map((fila) => normalizarCarnet(fila.carnetIdentidad)));
    const destino = clienteDelReporte(estado, carnets, mes, clientesConRegistro);
    if (!destino || destino.coincidencias === 0) {
      setError(`Ningún carnet del reporte corresponde al personal de ${nombreCliente}. ¿Es el reporte de otro cliente?`);
      return;
    }

    setCruzando(`Cruzando ${pluralizar(lectura.filas.length, "registro", "registros")} del cliente con nuestro registro…`);
    window.setTimeout(() => {
      cargarReporteCliente({ idCliente: destino.idCliente, mes, nombreArchivo: archivo.name, filas: lectura.filas });
      setCruzando(null);
      const nombreDestino = estado.clientes.find((cliente) => cliente.id === destino.idCliente)?.nombre ?? "";
      if (destino.idCliente !== idCliente) {
        alCambiarCliente(destino.idCliente);
        toast.info(`El reporte corresponde a ${nombreDestino}; lo cargamos ahí.`);
      } else {
        toast.success(`Reporte de ${nombreDestino} cargado y conciliado.`, {
          description: lectura.advertencias[0],
        });
      }
    }, demoraCruceMs);
  }

  const entradaArchivo = (
    <input
      ref={entrada}
      type="file"
      accept=".csv,.txt,.xlsx"
      className="sr-only"
      aria-label="Reporte de asistencia del cliente"
      onChange={(evento) => {
        void recibir(evento.target.files);
        evento.target.value = "";
      }}
    />
  );

  if (compacta) {
    return (
      <div className="flex flex-col items-end gap-1">
        <Button variant="outline" size="sm" onClick={() => entrada.current?.click()} disabled={cruzando !== null}>
          {cruzando ? <Loader2 className="animate-spin" /> : <Upload />}
          {cruzando ? "Cruzando…" : "Reemplazar reporte"}
        </Button>
        {entradaArchivo}
        {error && <p className="max-w-sm text-right text-xs text-destructive">{error}</p>}
      </div>
    );
  }

  return (
    <div className="flex flex-col gap-2">
      <button
        type="button"
        onClick={() => entrada.current?.click()}
        onDragOver={(evento) => {
          evento.preventDefault();
          setArrastrando(true);
        }}
        onDragLeave={() => setArrastrando(false)}
        onDrop={(evento) => {
          evento.preventDefault();
          setArrastrando(false);
          void recibir(evento.dataTransfer.files);
        }}
        disabled={cruzando !== null}
        className={cn(
          "flex w-full flex-col items-center gap-2 rounded-xl border-2 border-dashed px-4 py-8 text-center outline-none transition-colors hover:border-primary/50 hover:bg-muted/40 focus-visible:ring-2 focus-visible:ring-ring",
          arrastrando && "border-primary bg-marca-suave/40",
          error && "border-destructive/60",
        )}
      >
        {cruzando ? (
          <>
            <Loader2 className="size-7 animate-spin text-primary" />
            <span className="font-medium">{cruzando}</span>
          </>
        ) : (
          <>
            <FileSpreadsheet className="size-7 text-muted-foreground" />
            <span className="font-medium">Suba el reporte de asistencia de {nombreCliente}</span>
            <span className="text-sm text-muted-foreground">
              Excel o CSV, como lo exporta su biométrico. Lo cruzamos con nuestro registro de {formatearMes(mes).toLowerCase()}.
            </span>
          </>
        )}
      </button>
      {entradaArchivo}
      {error && <p className="text-sm text-destructive">{error}</p>}
    </div>
  );
}
