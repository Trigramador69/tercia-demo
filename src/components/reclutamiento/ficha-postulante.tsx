"use client";

import { useState } from "react";
import Link from "next/link";
import { useParams, useSearchParams } from "next/navigation";
import { ArrowLeft, Check, Send, X } from "lucide-react";
import { toast } from "sonner";
import { SelectorSimple } from "@/components/panel/selector-simple";
import { DialogoInvitar } from "@/components/reclutamiento/dialogo-invitar";
import { InsigniaEstadoConvocatoria } from "@/components/reclutamiento/insignias";
import { VistaCurriculum } from "@/components/reclutamiento/vista-curriculum";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import {
  nombresEstadoPostulacion,
  nombresNivelEstudios,
  nombresTurno,
  umbralCumplimientoPorDefecto,
} from "@/datos/catalogos";
import type { Convocatoria, EstadoPostulacion, Postulacion, Postulante } from "@/datos/tipos";
import { cambiarEstadoPostulaciones } from "@/lib/demo/acciones";
import { useEstadoDemo } from "@/lib/demo/almacen";
import { destinoDeConvocatoria } from "@/lib/demo/consultas";
import { evaluarRequisitos } from "@/lib/cumplimiento";
import { calcularEdad, formatearFecha, iniciales, nombreCompleto, pluralizar } from "@/lib/formato";
import { cn } from "@/lib/utils";

export function FichaPostulante() {
  const { idPostulante } = useParams<{ idPostulante: string }>();
  const parametros = useSearchParams();
  const idConvocatoriaOrigen = parametros.get("convocatoria");
  const filtrosDeOrigen = parametros.get("filtros");
  const estado = useEstadoDemo();
  const postulante = estado.postulantes.find((item) => item.id === idPostulante);
  const [dialogoAbierto, setDialogoAbierto] = useState(false);

  if (!postulante) {
    return (
      <div className="flex flex-col items-center gap-3 py-16 text-center">
        <h1 className="font-heading text-lg font-semibold">No encontramos a esta persona</h1>
        <p className="text-sm text-muted-foreground">
          Puede que se haya agregado durante la demo y que la demo se haya reiniciado después.
        </p>
        <Button variant="outline" nativeButton={false} render={<Link href="/postulantes" />}>
          Volver a la base de postulantes
        </Button>
      </div>
    );
  }

  const convocatoriaPorId = new Map(estado.convocatorias.map((convocatoria) => [convocatoria.id, convocatoria]));
  const convocatoriaOrigen = idConvocatoriaOrigen ? convocatoriaPorId.get(idConvocatoriaOrigen) : undefined;
  // La postulación desde la que se llegó va primero; el resto, de la más reciente a la más antigua.
  const postulaciones = estado.postulaciones
    .filter((postulacion) => postulacion.idPostulante === postulante.id)
    .sort(
      (a, b) =>
        Number(b.idConvocatoria === idConvocatoriaOrigen) - Number(a.idConvocatoria === idConvocatoriaOrigen) ||
        b.fecha.localeCompare(a.fecha),
    );

  return (
    <>
      <div>
        <Button
          variant="ghost"
          size="sm"
          className="-ml-2"
          nativeButton={false} render={
            <Link
              href={
                convocatoriaOrigen
                  ? `/convocatorias/${convocatoriaOrigen.id}${filtrosDeOrigen ? `?${filtrosDeOrigen}` : ""}`
                  : "/postulantes"
              }
            />
          }
        >
          <ArrowLeft />
          {convocatoriaOrigen ? convocatoriaOrigen.titulo : "Base de postulantes"}
        </Button>
      </div>

      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div className="flex items-center gap-4">
          <Avatar className="size-14">
            <AvatarFallback className="bg-marca-suave text-lg font-medium text-primary">{iniciales(postulante)}</AvatarFallback>
          </Avatar>
          <div className="flex flex-col gap-1">
            <h1 className="font-heading text-2xl font-semibold tracking-tight">{nombreCompleto(postulante)}</h1>
            <p className="text-sm text-muted-foreground">
              {postulante.ciudad} · {pluralizar(postulante.experienciaAnios, "año", "años")} de experiencia ·{" "}
              {nombresNivelEstudios[postulante.nivelEstudios]}
            </p>
          </div>
        </div>
        <Button onClick={() => setDialogoAbierto(true)}>
          <Send />
          Invitar a otra convocatoria
        </Button>
      </div>

      <div className="grid items-start gap-6 lg:grid-cols-[18rem_1fr]">
        <div className="flex flex-col gap-4">
          <Card>
            <CardHeader>
              <CardTitle>Datos</CardTitle>
            </CardHeader>
            <CardContent>
              <dl className="flex flex-col gap-3 text-sm">
                <Dato etiqueta="Carnet de identidad" valor={postulante.carnetIdentidad} />
                <Dato etiqueta="Teléfono" valor={postulante.telefono} />
                <Dato etiqueta="Correo" valor={postulante.correo} />
                <Dato etiqueta="Edad" valor={`${calcularEdad(postulante.fechaNacimiento)} años`} />
                <Dato etiqueta="En la base desde" valor={formatearFecha(postulante.fechaRegistro)} />
              </dl>
            </CardContent>
          </Card>
          <Card>
            <CardHeader>
              <CardTitle>Disponibilidad y habilidades</CardTitle>
            </CardHeader>
            <CardContent className="flex flex-col gap-3 text-sm">
              <p>{postulante.turnosDisponibles.map((turno) => nombresTurno[turno]).join(", ") || "Sin indicar"}</p>
              <div className="flex flex-wrap gap-1.5">
                {postulante.habilidades.map((habilidad) => (
                  <Badge key={habilidad} variant="secondary" className="font-normal">
                    {habilidad}
                  </Badge>
                ))}
              </div>
            </CardContent>
          </Card>
        </div>

        <Tabs defaultValue="postulaciones">
          <TabsList>
            <TabsTrigger value="postulaciones">Postulaciones ({postulaciones.length})</TabsTrigger>
            <TabsTrigger value="curriculum">Currículum</TabsTrigger>
          </TabsList>
          <TabsContent value="postulaciones" className="mt-4 flex flex-col gap-4">
            {postulaciones.map((postulacion) => {
              const convocatoria = convocatoriaPorId.get(postulacion.idConvocatoria);
              if (!convocatoria) return null;
              return (
                <TarjetaPostulacion
                  key={postulacion.id}
                  postulante={postulante}
                  postulacion={postulacion}
                  convocatoria={convocatoria}
                  destacada={postulacion.idConvocatoria === idConvocatoriaOrigen}
                />
              );
            })}
          </TabsContent>
          <TabsContent value="curriculum" className="mt-4">
            <VistaCurriculum postulante={postulante} />
          </TabsContent>
        </Tabs>
      </div>

      <DialogoInvitar idsPostulantes={[postulante.id]} abierto={dialogoAbierto} alCambiarAbierto={setDialogoAbierto} />
    </>
  );
}

function Dato({ etiqueta, valor }: { etiqueta: string; valor: string }) {
  return (
    <div className="flex flex-col gap-0.5">
      <dt className="text-xs text-muted-foreground">{etiqueta}</dt>
      <dd className="break-words">{valor}</dd>
    </div>
  );
}

function TarjetaPostulacion({
  postulante,
  postulacion,
  convocatoria,
  destacada,
}: {
  postulante: Postulante;
  postulacion: Postulacion;
  convocatoria: Convocatoria;
  destacada: boolean;
}) {
  const estado = useEstadoDemo();
  const resultados = evaluarRequisitos(convocatoria.requisitos, postulante);
  const cumplidos = resultados.filter((resultado) => resultado.cumple).length;
  const cumplimiento = Math.round((cumplidos / resultados.length) * 100);
  const llegaAlUmbral = cumplimiento >= umbralCumplimientoPorDefecto;

  function cambiarEstado(nuevo: EstadoPostulacion) {
    cambiarEstadoPostulaciones([postulacion.id], nuevo);
    toast.success(`${convocatoria.titulo}: ${nombresEstadoPostulacion[nuevo].toLowerCase()}.`);
  }

  return (
    <Card className={cn(destacada && "ring-2 ring-primary/40")}>
      <CardHeader className="flex flex-wrap items-start justify-between gap-3">
        <div className="flex flex-col gap-1">
          <CardTitle className="flex flex-wrap items-center gap-2">
            <Link href={`/convocatorias/${convocatoria.id}`} className="hover:underline">
              {convocatoria.titulo}
            </Link>
            <InsigniaEstadoConvocatoria estado={convocatoria.estado} />
          </CardTitle>
          <CardDescription>
            {destinoDeConvocatoria(estado, convocatoria)} · {postulacion.origen === "invitacion" ? "Invitado el" : "Postuló el"}{" "}
            {formatearFecha(postulacion.fecha)}
          </CardDescription>
        </div>
        <div className="flex shrink-0 items-center gap-3">
          <div className="flex flex-col items-end">
            <span className={cn("font-heading text-2xl font-semibold tabular-nums", llegaAlUmbral ? "text-exito" : "text-advertencia")}>
              {cumplimiento}%
            </span>
            <span className="text-xs text-muted-foreground">
              {cumplidos} de {resultados.length} requisitos
            </span>
          </div>
          <SelectorSimple
            opciones={nombresEstadoPostulacion}
            valor={postulacion.estado}
            alCambiar={cambiarEstado}
            className="w-40"
          />
        </div>
      </CardHeader>
      <CardContent>
        <ul className="grid gap-x-6 gap-y-2 text-sm sm:grid-cols-2">
          {resultados.map((resultado) => (
            <li key={resultado.requisito} className="flex items-start gap-2">
              {resultado.cumple ? (
                <Check className="mt-0.5 size-4 shrink-0 text-exito" aria-label="Cumple" />
              ) : (
                <X className="mt-0.5 size-4 shrink-0 text-destructive" aria-label="No cumple" />
              )}
              <span className="flex flex-col">
                <span>{resultado.requisito}</span>
                <span className="text-xs text-muted-foreground">{resultado.valorPostulante}</span>
              </span>
            </li>
          ))}
        </ul>
      </CardContent>
    </Card>
  );
}
