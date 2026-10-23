"use client";

import Link from "next/link";
import { Briefcase, CalendarClock, MapPin } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { nombresPuesto, nombresTurno } from "@/datos/catalogos";
import { useEstadoDemo } from "@/lib/demo/almacen";
import { formatearFecha, pluralizar } from "@/lib/formato";

// Más habilidades se resumen como "+N" para que las tarjetas no cambien de tamaño.
const maximoHabilidadesVisibles = 3;

export function ListaVacantesPublicas() {
  const { convocatorias } = useEstadoDemo();
  const abiertas = convocatorias.filter((convocatoria) => convocatoria.estado === "abierta");

  return (
    <div className="flex flex-col gap-6">
      <div className="flex flex-col gap-1">
        <h1 className="font-heading text-2xl font-semibold tracking-tight">Vacantes abiertas</h1>
        <p className="text-sm text-muted-foreground">
          Elija una vacante, cargue sus datos y suba su currículum. Si ya postuló antes, sus datos se reutilizan.
        </p>
      </div>
      <div className="grid gap-4 md:grid-cols-2">
        {abiertas.map((convocatoria) => {
          const habilidades = convocatoria.requisitos.habilidades;
          const visibles = habilidades.slice(0, maximoHabilidadesVisibles);
          const restantes = habilidades.length - visibles.length;
          return (
            <Card key={convocatoria.id} className="h-full">
              <CardHeader>
                <CardTitle className="line-clamp-1" title={convocatoria.titulo}>
                  {convocatoria.titulo}
                </CardTitle>
                {/* Siempre dos líneas, para que todas las tarjetas tengan la misma forma. */}
                <CardDescription className="line-clamp-2 min-h-10" title={convocatoria.descripcion}>
                  {convocatoria.descripcion || `Buscamos ${nombresPuesto[convocatoria.puesto].toLowerCase()} para ${convocatoria.requisitos.ciudad}.`}
                </CardDescription>
              </CardHeader>
              <CardContent className="flex flex-1 flex-col gap-2 text-sm text-muted-foreground">
                <span className="flex items-center gap-2">
                  <Briefcase className="size-4" />
                  {nombresPuesto[convocatoria.puesto]} · {pluralizar(convocatoria.cantidadPuestos, "puesto", "puestos")}
                </span>
                <span className="flex items-center gap-2">
                  <MapPin className="size-4" />
                  {convocatoria.requisitos.ciudad} · {convocatoria.requisitos.turnos.map((turno) => nombresTurno[turno]).join(" o ")}
                </span>
                <span className="flex items-center gap-2">
                  <CalendarClock className="size-4" />
                  Recibe postulaciones hasta el {formatearFecha(convocatoria.fechaCierre)}
                </span>
                {/* Reserva el alto de dos filas de habilidades, entren en una o en dos. */}
                <div className="flex min-h-14 flex-wrap content-start gap-1.5 pt-1">
                  {visibles.map((habilidad) => (
                    <Badge key={habilidad} variant="outline">
                      {habilidad}
                    </Badge>
                  ))}
                  {restantes > 0 && (
                    <Badge variant="secondary" title={habilidades.slice(maximoHabilidadesVisibles).join(", ")}>
                      +{restantes}
                    </Badge>
                  )}
                </div>
              </CardContent>
              <CardFooter className="mt-auto">
                <Button className="w-full" nativeButton={false} render={<Link href={`/postular/${convocatoria.id}`} />}>
                  Postular
                </Button>
              </CardFooter>
            </Card>
          );
        })}
      </div>
    </div>
  );
}
