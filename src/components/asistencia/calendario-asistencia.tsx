"use client";

import Link from "next/link";
import { Check } from "lucide-react";
import { diaDeLaSemana, diasDelMes } from "@/datos/fechas";
import type { EstadoAsistencia, Persona, RegistroAsistencia } from "@/datos/tipos";
import { nombresEstadoAsistencia } from "@/datos/catalogos";
import type { DiaConciliado } from "@/lib/conciliacion";
import { formatearFecha, nombreCompleto } from "@/lib/formato";
import { cn } from "@/lib/utils";

const inicialDiaSemana = ["D", "L", "M", "M", "J", "V", "S"];

const letraPorAusencia: Record<Exclude<EstadoAsistencia, "presente">, string> = {
  permiso: "P",
  vacacion: "V",
  baja_medica: "B",
  falta: "F",
};

interface Celda {
  clase: string;
  contenido: React.ReactNode;
  titulo: string;
  interactiva: boolean;
}

function celdaDelRegistroPropio(registro: RegistroAsistencia | undefined): Celda | null {
  if (!registro) return null;
  if (registro.estado === "presente") {
    return {
      clase: "bg-primary/15",
      contenido: null,
      titulo: `Presente: ${registro.entrada} a ${registro.salida}`,
      interactiva: false,
    };
  }
  return {
    clase: registro.estado === "falta" ? "bg-peligro-suave text-destructive" : "bg-muted text-muted-foreground",
    contenido: letraPorAusencia[registro.estado],
    titulo: nombresEstadoAsistencia[registro.estado],
    interactiva: false,
  };
}

function celdaConciliada(dia: DiaConciliado | undefined): Celda | null {
  if (!dia) return null;
  if (dia.resolucion) {
    return {
      clase: "bg-background text-exito ring-1 ring-exito/60",
      contenido: <Check className="size-3" />,
      titulo: `Resuelto: vale el registro ${dia.resolucion.registroValido === "propio" ? "propio" : "del cliente"}. ${dia.detalle}`,
      interactiva: true,
    };
  }
  if (dia.resultado === "coincide") {
    if (dia.propio && dia.propio.estado !== "presente") {
      return { ...celdaDelRegistroPropio(dia.propio)!, titulo: dia.detalle, interactiva: true };
    }
    return { clase: "bg-exito/25", contenido: null, titulo: dia.detalle, interactiva: true };
  }
  if (dia.resultado === "no_coincide") {
    return { clase: "bg-advertencia text-white", contenido: "!", titulo: dia.detalle, interactiva: true };
  }
  return { clase: "bg-destructive text-white", contenido: "×", titulo: dia.detalle, interactiva: true };
}

export function CalendarioAsistencia({
  mes,
  personas,
  registros,
  dias,
  alElegirDia,
}: {
  mes: string;
  personas: Persona[];
  registros: RegistroAsistencia[];
  // Resultado de la conciliación; si todavía no se cargó el reporte, se muestra solo el registro propio.
  dias: DiaConciliado[] | null;
  alElegirDia: (dia: DiaConciliado) => void;
}) {
  const fechas = diasDelMes(mes);
  const registroPorClave = new Map(registros.map((registro) => [`${registro.idPersona}|${registro.fecha}`, registro]));
  const diaPorClave = new Map((dias ?? []).map((dia) => [dia.clave, dia]));

  return (
    <div className="flex flex-col gap-3">
      <div className="overflow-x-auto rounded-lg border">
        <table className="border-separate border-spacing-0 text-xs">
          <thead>
            <tr>
              <th className="sticky left-0 z-10 min-w-48 border-b bg-card px-3 py-2 text-left font-medium">Persona</th>
              {fechas.map((fecha) => {
                const diaSemana = diaDeLaSemana(fecha);
                return (
                  <th
                    key={fecha}
                    className={cn("border-b px-0.5 py-1 text-center font-normal text-muted-foreground", diaSemana === 0 && "bg-muted/60")}
                  >
                    <span className="block text-[10px]">{inicialDiaSemana[diaSemana]}</span>
                    <span className="block font-medium text-foreground tabular-nums">{Number(fecha.slice(8))}</span>
                  </th>
                );
              })}
            </tr>
          </thead>
          <tbody>
            {personas.map((persona) => (
              <tr key={persona.id} className="group">
                <th className="sticky left-0 z-10 border-b bg-card px-3 py-1 text-left font-normal group-hover:bg-muted">
                  <Link href={`/personal/${persona.id}`} className="block max-w-48 truncate hover:underline">
                    {nombreCompleto(persona)}
                  </Link>
                </th>
                {fechas.map((fecha) => {
                  const clave = `${persona.id}|${fecha}`;
                  const dia = diaPorClave.get(clave);
                  const celda = dias ? celdaConciliada(dia) : celdaDelRegistroPropio(registroPorClave.get(clave));
                  const domingo = diaDeLaSemana(fecha) === 0;
                  return (
                    <td key={fecha} className={cn("border-b p-0.5 text-center", domingo && "bg-muted/60")}>
                      {celda ? (
                        <button
                          type="button"
                          disabled={!celda.interactiva || !dia}
                          onClick={() => dia && alElegirDia(dia)}
                          title={`${nombreCompleto(persona)}, ${formatearFecha(fecha)}: ${celda.titulo}`}
                          aria-label={`${nombreCompleto(persona)}, ${formatearFecha(fecha)}: ${celda.titulo}`}
                          className={cn(
                            "flex size-5 items-center justify-center rounded text-[10px] font-semibold outline-none focus-visible:ring-2 focus-visible:ring-ring",
                            celda.clase,
                            celda.interactiva ? "cursor-pointer hover:opacity-80" : "cursor-default",
                          )}
                        >
                          {celda.contenido}
                        </button>
                      ) : (
                        <span className="block size-5" />
                      )}
                    </td>
                  );
                })}
              </tr>
            ))}
          </tbody>
        </table>
      </div>
      <Leyenda conciliado={dias !== null} />
    </div>
  );
}

function Leyenda({ conciliado }: { conciliado: boolean }) {
  const elementos: [string, React.ReactNode, string][] = conciliado
    ? [
        ["bg-exito/25", null, "Coincide"],
        ["bg-advertencia text-white", "!", "No coincide el horario"],
        ["bg-destructive text-white", "×", "Conflicto"],
        ["bg-background text-exito ring-1 ring-exito/60", <Check key="resuelto" className="size-3" />, "Resuelto"],
        ["bg-muted text-muted-foreground", "V", "Ausente en los dos registros"],
      ]
    : [
        ["bg-primary/15", null, "Presente"],
        ["bg-muted text-muted-foreground", "P", "Permiso"],
        ["bg-muted text-muted-foreground", "V", "Vacación"],
        ["bg-muted text-muted-foreground", "B", "Baja médica"],
        ["bg-peligro-suave text-destructive", "F", "Falta"],
      ];
  return (
    <div className="flex flex-wrap gap-x-4 gap-y-1.5 text-xs text-muted-foreground">
      {elementos.map(([clase, contenido, texto]) => (
        <span key={texto} className="flex items-center gap-1.5">
          <span className={cn("flex size-4 items-center justify-center rounded text-[9px] font-semibold", clase)}>{contenido}</span>
          {texto}
        </span>
      ))}
    </div>
  );
}
