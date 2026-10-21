"use client";

import { Download, FileSpreadsheet, FileText, FolderDown } from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { clientesConAsistencia, nombreArchivoReporte } from "@/datos/asistencia";
import { mesAsistenciaDemo } from "@/datos/catalogos";
import { curriculumsEjemplo } from "@/datos/curriculums";
import { useEstadoDemo } from "@/lib/demo/almacen";
import { formatearMes } from "@/lib/formato";

// Los archivos que se suben durante la demo, para descargarlos desde cualquier
// computadora en la que se presente.
export function DialogoArchivosEjemplo({ className }: { className?: string }) {
  const { clientes } = useEstadoDemo();

  return (
    <Dialog>
      <DialogTrigger render={<Button variant="ghost" size="sm" className={className} />}>
        <FolderDown />
        Archivos de ejemplo
      </DialogTrigger>
      <DialogContent className="sm:max-w-lg">
        <DialogHeader>
          <DialogTitle>Archivos de ejemplo</DialogTitle>
          <DialogDescription>
            Descárguelos para subirlos durante la demo. Con cualquier otro archivo, la demo funciona igual pero sin
            autocompletar ni diferencias preparadas.
          </DialogDescription>
        </DialogHeader>

        <section className="flex flex-col gap-2">
          <h3 className="text-sm font-medium">Currículums para la página de postulación</h3>
          <ul className="flex flex-col divide-y rounded-lg border">
            {curriculumsEjemplo.map((curriculum) => (
              <FilaArchivo
                key={curriculum.archivo}
                icono={FileText}
                ruta={`/ejemplos/curriculums/${curriculum.archivo}`}
                nombre={curriculum.archivo}
                detalle={curriculum.pensadoPara}
              />
            ))}
          </ul>
        </section>

        <section className="flex flex-col gap-2">
          <h3 className="text-sm font-medium">Reportes de asistencia de los clientes ({formatearMes(mesAsistenciaDemo)})</h3>
          <ul className="flex flex-col divide-y rounded-lg border">
            {clientesConAsistencia.flatMap((idCliente) => {
              const nombreCliente = clientes.find((cliente) => cliente.id === idCliente)?.nombre ?? idCliente;
              const archivo = nombreArchivoReporte(nombreCliente, mesAsistenciaDemo);
              return [
                { archivo: archivo.replace(/\.csv$/, ".xlsx"), formato: "Excel" },
                { archivo, formato: "CSV" },
              ].map(({ archivo: nombre, formato }) => (
                <FilaArchivo
                  key={nombre}
                  icono={FileSpreadsheet}
                  ruta={`/ejemplos/${nombre}`}
                  nombre={nombre}
                  detalle={`Biométrico de ${nombreCliente} en ${formato}, con diferencias para conciliar`}
                />
              ));
            })}
          </ul>
        </section>
      </DialogContent>
    </Dialog>
  );
}

function FilaArchivo({
  icono: Icono,
  ruta,
  nombre,
  detalle,
}: {
  icono: typeof FileText;
  ruta: string;
  nombre: string;
  detalle: string;
}) {
  return (
    <li className="flex items-center gap-3 px-3 py-2">
      <Icono className="size-4 shrink-0 text-muted-foreground" />
      <span className="flex min-w-0 flex-1 flex-col">
        <span className="truncate text-sm font-medium">{nombre}</span>
        <span className="truncate text-xs text-muted-foreground">{detalle}</span>
      </span>
      <Button variant="outline" size="icon-sm" nativeButton={false} render={<a href={ruta} download aria-label={`Descargar ${nombre}`} />}>
        <Download />
      </Button>
    </li>
  );
}
