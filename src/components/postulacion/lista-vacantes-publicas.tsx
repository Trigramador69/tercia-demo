"use client";

import { Briefcase, CalendarClock, MapPin } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { nombresPuesto, nombresTurno } from "@/datos/catalogos";
import { useEstadoDemo } from "@/lib/demo/almacen";
import { formatearFecha, pluralizar } from "@/lib/formato";

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
        {abiertas.map((convocatoria) => (
          <Card key={convocatoria.id}>
            <CardHeader>
              <CardTitle>{convocatoria.titulo}</CardTitle>
              <CardDescription>{convocatoria.descripcion}</CardDescription>
            </CardHeader>
            <CardContent className="flex flex-col gap-2 text-sm text-muted-foreground">
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
              <div className="flex flex-wrap gap-1.5 pt-1">
                {convocatoria.requisitos.habilidades.map((habilidad) => (
                  <Badge key={habilidad} variant="outline">
                    {habilidad}
                  </Badge>
                ))}
              </div>
            </CardContent>
            <CardFooter>
              <Button className="w-full" disabled>
                Postular
              </Button>
            </CardFooter>
          </Card>
        ))}
      </div>
    </div>
  );
}
