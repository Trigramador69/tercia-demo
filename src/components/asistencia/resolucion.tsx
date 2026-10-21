"use client";

import { Building, Check, RotateCcw, UserRound } from "lucide-react";
import { toast } from "sonner";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { nombresEstadoAsistencia } from "@/datos/catalogos";
import type { Persona } from "@/datos/tipos";
import type { DiaConciliado, ResultadoDia } from "@/lib/conciliacion";
import { deshacerResolucion, resolverDia } from "@/lib/demo/acciones";
import { formatearFecha, formatearFechaLarga, nombreCompleto } from "@/lib/formato";
import { cn } from "@/lib/utils";

const nombresResultado: Record<ResultadoDia, string> = {
  coincide: "Coincide",
  no_coincide: "No coincide",
  conflicto: "Conflicto",
};

const clasesResultado: Record<ResultadoDia, string> = {
  coincide: "bg-exito-suave text-exito",
  no_coincide: "bg-advertencia-suave text-advertencia",
  conflicto: "bg-peligro-suave text-destructive",
};

export function InsigniaResultado({ dia }: { dia: DiaConciliado }) {
  if (dia.resolucion) {
    return (
      <Badge variant="outline" className="border-exito/50 text-exito">
        <Check />
        Resuelto
      </Badge>
    );
  }
  return <Badge className={clasesResultado[dia.resultado]}>{nombresResultado[dia.resultado]}</Badge>;
}

export function textoRegistroPropio(dia: DiaConciliado) {
  if (!dia.propio) return "Sin registro";
  if (dia.propio.estado !== "presente") return nombresEstadoAsistencia[dia.propio.estado];
  return `${dia.propio.entrada} a ${dia.propio.salida}`;
}

export function textoRegistroCliente(dia: DiaConciliado) {
  if (!dia.cliente) return "Sin marcación";
  return `${dia.cliente.entrada ?? "sin entrada"} a ${dia.cliente.salida ?? "sin salida"}`;
}

// Cómo cuenta el día en la planilla según qué registro se tome como válido.
function efecto(dia: DiaConciliado, registroValido: "propio" | "cliente") {
  if (dia.resultado === "no_coincide") return "Cuenta como día trabajado.";
  const vino = registroValido === "propio" ? dia.propio?.estado === "presente" : dia.cliente !== null;
  return vino ? "Cuenta como día trabajado." : "No cuenta como día trabajado.";
}

export function resolver(dia: DiaConciliado, idCliente: string, registroValido: "propio" | "cliente", persona?: Persona) {
  const referencia = { idCliente, idPersona: dia.idPersona, fecha: dia.fecha };
  resolverDia(referencia, registroValido);
  toast.success(
    `${persona ? `${nombreCompleto(persona)}, ` : ""}${formatearFecha(dia.fecha)}: vale el registro ${registroValido === "propio" ? "propio" : "del cliente"}.`,
    { description: efecto(dia, registroValido), action: { label: "Deshacer", onClick: () => deshacerResolucion(referencia) } },
  );
}

export function DialogoDia({
  dia,
  persona,
  nombreSucursal,
  idCliente,
  puedeResolver,
  alCerrar,
}: {
  dia: DiaConciliado;
  persona: Persona | undefined;
  nombreSucursal: string;
  idCliente: string;
  puedeResolver: boolean;
  alCerrar: () => void;
}) {
  const esDiferencia = dia.resultado !== "coincide";

  return (
    <Dialog open onOpenChange={(abierto) => !abierto && alCerrar()}>
      <DialogContent className="sm:max-w-lg">
        <DialogHeader>
          <DialogTitle>{persona ? nombreCompleto(persona) : "Persona"}</DialogTitle>
          <DialogDescription>
            {formatearFechaLarga(dia.fecha)}
            {nombreSucursal ? ` · ${nombreSucursal}` : ""}
          </DialogDescription>
        </DialogHeader>

        <div className="grid grid-cols-2 gap-3">
          <Registro
            icono={UserRound}
            titulo="Nuestro registro"
            valor={textoRegistroPropio(dia)}
            elegido={dia.resolucion?.registroValido === "propio"}
          />
          <Registro
            icono={Building}
            titulo="Reporte del cliente"
            valor={textoRegistroCliente(dia)}
            elegido={dia.resolucion?.registroValido === "cliente"}
          />
        </div>

        <div className="flex flex-col gap-2 rounded-lg bg-muted/50 p-3 text-sm">
          <span className="flex items-center gap-2">
            <InsigniaResultado dia={dia} />
            {dia.resolucion && (
              <span className="text-xs text-muted-foreground">
                Vale el registro {dia.resolucion.registroValido === "propio" ? "propio" : "del cliente"}
              </span>
            )}
          </span>
          <p>{dia.detalle}</p>
          {dia.resolucion && <p className="text-xs text-muted-foreground">{efecto(dia, dia.resolucion.registroValido)}</p>}
        </div>

        {esDiferencia && puedeResolver && (
          <div className="flex flex-col gap-2">
            {dia.resolucion ? (
              <Button
                variant="outline"
                onClick={() => deshacerResolucion({ idCliente, idPersona: dia.idPersona, fecha: dia.fecha })}
              >
                <RotateCcw />
                Volver a dejarlo por resolver
              </Button>
            ) : (
              <>
                <p className="text-sm font-medium">¿Qué registro vale para este día?</p>
                <div className="grid gap-2 sm:grid-cols-2">
                  <Button variant="outline" onClick={() => resolver(dia, idCliente, "propio", persona)}>
                    Vale nuestro registro
                  </Button>
                  <Button variant="outline" onClick={() => resolver(dia, idCliente, "cliente", persona)}>
                    Vale el del cliente
                  </Button>
                </div>
              </>
            )}
          </div>
        )}
      </DialogContent>
    </Dialog>
  );
}

function Registro({
  icono: Icono,
  titulo,
  valor,
  elegido,
}: {
  icono: typeof UserRound;
  titulo: string;
  valor: string;
  elegido: boolean;
}) {
  return (
    <div className={cn("flex flex-col gap-1 rounded-lg border p-3", elegido && "border-exito bg-exito-suave/40")}>
      <span className="flex items-center gap-1.5 text-xs text-muted-foreground">
        <Icono className="size-3.5" />
        {titulo}
        {elegido && <Check className="ml-auto size-3.5 text-exito" />}
      </span>
      <span className="font-medium tabular-nums">{valor}</span>
    </div>
  );
}
