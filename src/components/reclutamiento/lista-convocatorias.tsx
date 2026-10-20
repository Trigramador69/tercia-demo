"use client";

import { useState } from "react";
import Link from "next/link";
import { CalendarClock, MapPin, Plus, Users } from "lucide-react";
import { EncabezadoPagina } from "@/components/panel/encabezado-pagina";
import { InsigniaEstadoConvocatoria } from "@/components/reclutamiento/insignias";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { nombresPuesto, umbralCumplimientoPorDefecto } from "@/datos/catalogos";
import type { EstadoConvocatoria } from "@/datos/tipos";
import { useEstadoDemo } from "@/lib/demo/almacen";
import { destinoDeConvocatoria, postulantesDeConvocatoria } from "@/lib/demo/consultas";
import { formatearFecha, pluralizar } from "@/lib/formato";

type Filtro = EstadoConvocatoria | "todas";

export function ListaConvocatorias() {
  const estado = useEstadoDemo();
  const [filtro, setFiltro] = useState<Filtro>("abierta");

  const cantidadPorEstado = {
    abierta: estado.convocatorias.filter((convocatoria) => convocatoria.estado === "abierta").length,
    cerrada: estado.convocatorias.filter((convocatoria) => convocatoria.estado === "cerrada").length,
    todas: estado.convocatorias.length,
  };
  const visibles = estado.convocatorias.filter((convocatoria) => filtro === "todas" || convocatoria.estado === filtro);

  return (
    <>
      <EncabezadoPagina
        titulo="Convocatorias"
        descripcion="Vacantes abiertas a la vez, con sus requisitos, destino y postulantes."
        acciones={
          <Button nativeButton={false} render={<Link href="/convocatorias/nueva" />}>
            <Plus />
            Nueva convocatoria
          </Button>
        }
      />

      <Tabs value={filtro} onValueChange={(valor) => setFiltro(valor as Filtro)}>
        <TabsList>
          <TabsTrigger value="abierta">Abiertas ({cantidadPorEstado.abierta})</TabsTrigger>
          <TabsTrigger value="cerrada">Cerradas ({cantidadPorEstado.cerrada})</TabsTrigger>
          <TabsTrigger value="todas">Todas ({cantidadPorEstado.todas})</TabsTrigger>
        </TabsList>
      </Tabs>

      {visibles.length === 0 && (
        <p className="py-12 text-center text-sm text-muted-foreground">No hay convocatorias en esta vista.</p>
      )}

      <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-3">
        {visibles.map((convocatoria) => {
          const filas = postulantesDeConvocatoria(estado, convocatoria);
          const cumplen = filas.filter((fila) => fila.cumplimiento >= umbralCumplimientoPorDefecto).length;
          const nuevos = filas.filter((fila) => fila.postulacion.estado === "nuevo").length;
          return (
            <Link
              key={convocatoria.id}
              href={`/convocatorias/${convocatoria.id}`}
              className="group min-w-0 rounded-xl outline-none focus-visible:ring-2 focus-visible:ring-ring"
            >
              <Card className="h-full transition-colors group-hover:border-primary/40">
                <CardHeader>
                  <div className="flex items-start justify-between gap-2">
                    <CardTitle className="leading-snug">{convocatoria.titulo}</CardTitle>
                    <InsigniaEstadoConvocatoria estado={convocatoria.estado} />
                  </div>
                  <CardDescription>
                    {nombresPuesto[convocatoria.puesto]} · {pluralizar(convocatoria.cantidadPuestos, "puesto", "puestos")}
                  </CardDescription>
                </CardHeader>
                <CardContent className="flex flex-1 flex-col gap-2 text-sm text-muted-foreground">
                  <span className="flex items-center gap-2">
                    <MapPin className="size-4 shrink-0" />
                    <span className="truncate">{destinoDeConvocatoria(estado, convocatoria)}</span>
                  </span>
                  <span className="flex items-center gap-2">
                    <CalendarClock className="size-4 shrink-0" />
                    {convocatoria.estado === "abierta" ? "Cierra el" : "Cerró el"} {formatearFecha(convocatoria.fechaCierre)}
                  </span>
                  <div className="flex flex-wrap gap-1.5 pt-1">
                    {convocatoria.requisitos.habilidades.map((habilidad) => (
                      <Badge key={habilidad} variant="outline" className="font-normal">
                        {habilidad}
                      </Badge>
                    ))}
                  </div>
                </CardContent>
                <CardFooter className="grid grid-cols-3 gap-2 text-center">
                  <Cifra valor={filas.length} etiqueta="Postulantes" icono />
                  <Cifra valor={cumplen} etiqueta={`Cumplen ${umbralCumplimientoPorDefecto}%`} resaltada />
                  <Cifra valor={nuevos} etiqueta="Por revisar" />
                </CardFooter>
              </Card>
            </Link>
          );
        })}
      </div>
    </>
  );
}

function Cifra({
  valor,
  etiqueta,
  resaltada,
  icono,
}: {
  valor: number;
  etiqueta: string;
  resaltada?: boolean;
  icono?: boolean;
}) {
  return (
    <span className="flex flex-col">
      <span className={`flex items-center justify-center gap-1 text-lg font-semibold tabular-nums ${resaltada ? "text-exito" : ""}`}>
        {icono && <Users className="size-4 text-muted-foreground" />}
        {valor}
      </span>
      <span className="text-xs text-muted-foreground">{etiqueta}</span>
    </span>
  );
}
