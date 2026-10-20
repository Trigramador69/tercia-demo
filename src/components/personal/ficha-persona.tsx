"use client";

import { useState } from "react";
import Link from "next/link";
import { useParams, useSearchParams } from "next/navigation";
import { ArrowLeft, Building, CalendarPlus, Clock, MapPin, MessageSquarePlus, type LucideIcon } from "lucide-react";
import { toast } from "sonner";
import { SelectorSimple } from "@/components/panel/selector-simple";
import { usuarioPorRol } from "@/components/panel/selector-rol";
import { Estrellas, SelectorEstrellas } from "@/components/personal/estrellas";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardAction, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import {
  Dialog,
  DialogClose,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import {
  horarioPorTurno,
  nombresPuesto,
  nombresTipoAusencia,
  nombresTurno,
} from "@/datos/catalogos";
import { diferenciaEnDias } from "@/datos/fechas";
import type { Persona, TipoAusencia } from "@/datos/tipos";
import { agregarEvaluacion, registrarAusencia } from "@/lib/demo/acciones";
import { useEstadoDemo } from "@/lib/demo/almacen";
import { calificacionDePersona, historialDePersona } from "@/lib/demo/consultas";
import {
  calcularEdad,
  fechaDeHoy,
  formatearAntiguedad,
  formatearFecha,
  iniciales,
  nombreCompleto,
  pluralizar,
} from "@/lib/formato";
import { cn } from "@/lib/utils";

// Menos de este tiempo en la empresa se muestra como "Nuevo ingreso".
const diasNuevoIngreso = 90;

const clasesPorTipoAusencia: Record<TipoAusencia, string> = {
  permiso: "bg-marca-suave text-primary",
  vacacion: "bg-exito-suave text-exito",
  baja_medica: "bg-advertencia-suave text-advertencia",
  falta: "bg-peligro-suave text-destructive",
};

export function FichaPersona() {
  const { idPersona } = useParams<{ idPersona: string }>();
  const filtrosDeOrigen = useSearchParams().get("filtros");
  const estado = useEstadoDemo();
  const persona = estado.personas.find((item) => item.id === idPersona);
  const enlaceVolver = `/personal${filtrosDeOrigen ? `?${filtrosDeOrigen}` : ""}`;

  if (!persona) {
    return (
      <div className="flex flex-col items-center gap-3 py-16 text-center">
        <h1 className="font-heading text-lg font-semibold">No encontramos a esta persona</h1>
        <Button variant="outline" nativeButton={false} render={<Link href="/personal" />}>
          Volver al personal
        </Button>
      </div>
    );
  }

  return <ContenidoFicha persona={persona} enlaceVolver={enlaceVolver} />;
}

function ContenidoFicha({ persona, enlaceVolver }: { persona: Persona; enlaceVolver: string }) {
  const estado = useEstadoDemo();
  const [dialogoEvaluacion, setDialogoEvaluacion] = useState(false);
  const [dialogoAusencia, setDialogoAusencia] = useState(false);

  const historial = historialDePersona(estado, persona.id);
  const actual = historial.find((item) => item.asignacion.hasta === null);
  const anteriores = historial.filter((item) => item.asignacion.hasta !== null);
  const clientesDistintos = new Set(historial.map((item) => item.cliente?.id)).size;
  const calificacion = calificacionDePersona(estado, persona.id);
  const evaluaciones = estado.evaluaciones
    .filter((evaluacion) => evaluacion.idPersona === persona.id)
    .sort((a, b) => b.fecha.localeCompare(a.fecha));
  const ausencias = estado.ausencias
    .filter((ausencia) => ausencia.idPersona === persona.id)
    .sort((a, b) => b.desde.localeCompare(a.desde));
  const esNuevoIngreso = diferenciaEnDias(persona.fechaIngreso, fechaDeHoy()) < diasNuevoIngreso;

  return (
    <>
      <div>
        <Button variant="ghost" size="sm" className="-ml-2" nativeButton={false} render={<Link href={enlaceVolver} />}>
          <ArrowLeft />
          Personal
        </Button>
      </div>

      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div className="flex items-center gap-4">
          <Avatar className="size-14">
            <AvatarFallback className="bg-marca-suave text-lg font-medium text-primary">{iniciales(persona)}</AvatarFallback>
          </Avatar>
          <div className="flex flex-col gap-1">
            <h1 className="font-heading text-2xl font-semibold tracking-tight">{nombreCompleto(persona)}</h1>
            <div className="flex flex-wrap items-center gap-x-3 gap-y-1 text-sm text-muted-foreground">
              <span>
                {nombresPuesto[persona.puesto]} · {persona.ciudad}
              </span>
              {calificacion !== null && (
                <span className="flex items-center gap-1.5">
                  <Estrellas valor={calificacion} />
                  <span className="tabular-nums">{calificacion.toFixed(1)}</span>
                </span>
              )}
              {esNuevoIngreso && <Badge className="bg-marca-suave text-primary">Nuevo ingreso</Badge>}
              {!actual && <Badge className="bg-advertencia-suave text-advertencia">Disponible</Badge>}
            </div>
          </div>
        </div>
      </div>

      <div className="grid items-start gap-6 lg:grid-cols-[18rem_1fr]">
        <div className="flex flex-col gap-4">
          <Card>
            <CardHeader>
              <CardTitle>Contacto</CardTitle>
            </CardHeader>
            <CardContent>
              <dl className="flex flex-col gap-3 text-sm">
                <Dato etiqueta="Celular" valor={persona.telefono} />
                <Dato etiqueta="Correo" valor={persona.correo} />
                <Dato etiqueta="Dirección" valor={persona.direccion} />
                <Dato etiqueta="Contacto de emergencia" valor={persona.contactoEmergencia} />
              </dl>
            </CardContent>
          </Card>
          <Card>
            <CardHeader>
              <CardTitle>En la empresa</CardTitle>
            </CardHeader>
            <CardContent>
              <dl className="flex flex-col gap-3 text-sm">
                <Dato etiqueta="Fecha de ingreso" valor={formatearFecha(persona.fechaIngreso)} />
                <Dato etiqueta="Antigüedad" valor={formatearAntiguedad(persona.fechaIngreso)} />
                <Dato etiqueta="Clientes en los que trabajó" valor={String(clientesDistintos)} />
                <Dato etiqueta="Carnet de identidad" valor={persona.carnetIdentidad} />
                <Dato etiqueta="Edad" valor={`${calcularEdad(persona.fechaNacimiento)} años`} />
              </dl>
            </CardContent>
          </Card>
        </div>

        <div className="flex flex-col gap-4">
          <Card className={cn(actual && "border-primary/30")}>
            <CardHeader>
              <CardTitle>Asignación actual</CardTitle>
            </CardHeader>
            <CardContent>
              {actual ? (
                <div className="grid gap-4 text-sm sm:grid-cols-3">
                  <DatoConIcono icono={Building} etiqueta="Cliente y sucursal">
                    <span className="font-medium">{actual.cliente?.nombre}</span>
                    <span className="text-muted-foreground">{actual.sucursal?.nombre}</span>
                  </DatoConIcono>
                  <DatoConIcono icono={Clock} etiqueta="Turno">
                    <span className="font-medium">{nombresTurno[actual.asignacion.turno]}</span>
                    <span className="text-muted-foreground">
                      {horarioPorTurno[actual.asignacion.turno].entrada} a {horarioPorTurno[actual.asignacion.turno].salida}
                    </span>
                  </DatoConIcono>
                  <DatoConIcono icono={MapPin} etiqueta="Desde">
                    <span className="font-medium">{formatearFecha(actual.asignacion.desde)}</span>
                    <span className="text-muted-foreground">{formatearAntiguedad(actual.asignacion.desde)} en este cliente</span>
                  </DatoConIcono>
                </div>
              ) : (
                <p className="text-sm text-muted-foreground">
                  No tiene una asignación vigente. Está disponible para asignarla a un cliente.
                </p>
              )}
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Historial de clientes</CardTitle>
              <CardDescription>
                {anteriores.length === 0
                  ? "Todavía no trabajó con otros clientes."
                  : `${pluralizar(anteriores.length, "asignación anterior", "asignaciones anteriores")}.`}
              </CardDescription>
            </CardHeader>
            <CardContent>
              <ol className="relative flex flex-col gap-5 border-l pl-5">
                {historial.map(({ asignacion, sucursal, cliente }) => (
                  <li key={asignacion.id} className="relative">
                    <span
                      className={cn(
                        "absolute top-1.5 -left-[25px] size-2.5 rounded-full ring-4 ring-card",
                        asignacion.hasta === null ? "bg-primary" : "bg-muted-foreground/40",
                      )}
                    />
                    <div className="flex flex-col gap-0.5 sm:flex-row sm:justify-between sm:gap-4">
                      <span>
                        <span className="font-medium">{cliente?.nombre}</span>
                        <span className="text-muted-foreground"> · {sucursal?.nombre}</span>
                        {cliente?.estado === "finalizado" && (
                          <Badge variant="outline" className="ml-2 font-normal">
                            Cliente anterior
                          </Badge>
                        )}
                      </span>
                      <span className="shrink-0 text-sm text-muted-foreground tabular-nums">
                        {formatearFecha(asignacion.desde)} a {asignacion.hasta ? formatearFecha(asignacion.hasta) : "hoy"}
                      </span>
                    </div>
                    <p className="text-sm text-muted-foreground">
                      {nombresPuesto[asignacion.puesto]} · {nombresTurno[asignacion.turno]} ·{" "}
                      {formatearAntiguedad(asignacion.desde, asignacion.hasta ?? fechaDeHoy())}
                    </p>
                  </li>
                ))}
                {historial.length === 0 && <li className="text-sm text-muted-foreground">Sin asignaciones registradas.</li>}
              </ol>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Calificación</CardTitle>
              <CardDescription>
                {calificacion === null
                  ? "Todavía no tiene evaluaciones."
                  : `Promedio de ${pluralizar(evaluaciones.length, "evaluación", "evaluaciones")} de clientes y supervisión.`}
              </CardDescription>
              <CardAction>
                <Button variant="outline" size="sm" onClick={() => setDialogoEvaluacion(true)}>
                  <MessageSquarePlus />
                  Evaluar
                </Button>
              </CardAction>
            </CardHeader>
            <CardContent className="flex flex-col gap-4">
              {calificacion !== null && (
                <div className="flex items-center gap-3">
                  <span className="font-heading text-4xl font-semibold tabular-nums">{calificacion.toFixed(1)}</span>
                  <Estrellas valor={calificacion} className="[&_svg]:size-5" />
                </div>
              )}
              <ul className="flex flex-col divide-y">
                {evaluaciones.map((evaluacion) => (
                  <li key={evaluacion.id} className="flex flex-col gap-1 py-3 first:pt-0 last:pb-0">
                    <div className="flex flex-wrap items-center justify-between gap-2">
                      <Estrellas valor={evaluacion.estrellas} />
                      <span className="text-xs text-muted-foreground">{formatearFecha(evaluacion.fecha)}</span>
                    </div>
                    <p className="text-sm">{evaluacion.comentario}</p>
                    <p className="text-xs text-muted-foreground">{evaluacion.autor}</p>
                  </li>
                ))}
              </ul>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Permisos y ausencias</CardTitle>
              <CardDescription>
                {ausencias.length === 0 ? "Sin permisos ni ausencias registrados." : pluralizar(ausencias.length, "registro", "registros")}
              </CardDescription>
              <CardAction>
                <Button variant="outline" size="sm" onClick={() => setDialogoAusencia(true)}>
                  <CalendarPlus />
                  Registrar
                </Button>
              </CardAction>
            </CardHeader>
            {ausencias.length > 0 && (
              <CardContent>
                <ul className="flex flex-col divide-y">
                  {ausencias.map((ausencia) => {
                    const dias = diferenciaEnDias(ausencia.desde, ausencia.hasta) + 1;
                    return (
                      <li key={ausencia.id} className="flex flex-wrap items-center gap-x-3 gap-y-1 py-2.5 text-sm first:pt-0 last:pb-0">
                        <Badge className={clasesPorTipoAusencia[ausencia.tipo]}>{nombresTipoAusencia[ausencia.tipo]}</Badge>
                        <span className="tabular-nums">
                          {dias === 1 ? formatearFecha(ausencia.desde) : `${formatearFecha(ausencia.desde)} a ${formatearFecha(ausencia.hasta)}`}
                        </span>
                        <span className="text-muted-foreground">
                          {pluralizar(dias, "día", "días")} · {ausencia.motivo}
                        </span>
                      </li>
                    );
                  })}
                </ul>
              </CardContent>
            )}
          </Card>
        </div>
      </div>

      <DialogoEvaluacion
        persona={persona}
        clientes={historial.flatMap((item) => (item.cliente ? [item.cliente] : []))}
        abierto={dialogoEvaluacion}
        alCambiarAbierto={setDialogoEvaluacion}
      />
      <DialogoAusencia persona={persona} abierto={dialogoAusencia} alCambiarAbierto={setDialogoAusencia} />
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

function DatoConIcono({
  icono: Icono,
  etiqueta,
  children,
}: {
  icono: LucideIcon;
  etiqueta: string;
  children: React.ReactNode;
}) {
  return (
    <div className="flex flex-col gap-1">
      <span className="flex items-center gap-1.5 text-xs text-muted-foreground">
        <Icono className="size-3.5" />
        {etiqueta}
      </span>
      {children}
    </div>
  );
}

const sinCliente = "ninguno";

function DialogoEvaluacion({
  persona,
  clientes,
  abierto,
  alCambiarAbierto,
}: {
  persona: Persona;
  clientes: { id: string; nombre: string }[];
  abierto: boolean;
  alCambiarAbierto: (abierto: boolean) => void;
}) {
  const { rol } = useEstadoDemo();
  const [estrellas, setEstrellas] = useState(0);
  const [comentario, setComentario] = useState("");
  const [idCliente, setIdCliente] = useState(clientes[0]?.id ?? sinCliente);
  const opcionesCliente: Record<string, string> = { [sinCliente]: "Evaluación interna" };
  for (const cliente of clientes) opcionesCliente[cliente.id] = cliente.nombre;

  function guardar() {
    agregarEvaluacion({
      idPersona: persona.id,
      estrellas,
      comentario: comentario.trim(),
      autor: usuarioPorRol[rol].nombre,
      idCliente: idCliente === sinCliente ? null : idCliente,
    });
    toast.success(`Evaluación registrada para ${nombreCompleto(persona)}.`);
    alCambiarAbierto(false);
    setEstrellas(0);
    setComentario("");
  }

  return (
    <Dialog open={abierto} onOpenChange={alCambiarAbierto}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Evaluar a {nombreCompleto(persona)}</DialogTitle>
          <DialogDescription>La calificación ayuda a decidir a quién enviar a los clientes más exigentes.</DialogDescription>
        </DialogHeader>
        <div className="flex flex-col gap-4">
          <SelectorEstrellas valor={estrellas} alCambiar={setEstrellas} />
          <div className="flex flex-col gap-2">
            <Label htmlFor="cliente-evaluacion">Cliente</Label>
            <SelectorSimple id="cliente-evaluacion" opciones={opcionesCliente} valor={idCliente} alCambiar={setIdCliente} />
          </div>
          <div className="flex flex-col gap-2">
            <Label htmlFor="comentario-evaluacion">Comentario</Label>
            <Textarea
              id="comentario-evaluacion"
              value={comentario}
              onChange={(evento) => setComentario(evento.target.value)}
              placeholder="Por ejemplo: muy puntual, el cliente pidió que se quede."
              rows={3}
            />
          </div>
        </div>
        <DialogFooter>
          <DialogClose render={<Button variant="outline" />}>Cancelar</DialogClose>
          <Button onClick={guardar} disabled={estrellas === 0 || comentario.trim() === ""}>
            Guardar evaluación
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}

function DialogoAusencia({
  persona,
  abierto,
  alCambiarAbierto,
}: {
  persona: Persona;
  abierto: boolean;
  alCambiarAbierto: (abierto: boolean) => void;
}) {
  const [tipo, setTipo] = useState<TipoAusencia>("permiso");
  const [desde, setDesde] = useState(fechaDeHoy());
  const [hasta, setHasta] = useState(fechaDeHoy());
  const [motivo, setMotivo] = useState("");
  const fechasValidas = desde !== "" && hasta !== "" && hasta >= desde;

  function guardar() {
    registrarAusencia({ idPersona: persona.id, tipo, desde, hasta, motivo: motivo.trim() });
    toast.success(`${nombresTipoAusencia[tipo]} registrado para ${nombreCompleto(persona)}.`);
    alCambiarAbierto(false);
    setMotivo("");
  }

  return (
    <Dialog open={abierto} onOpenChange={alCambiarAbierto}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Registrar permiso o ausencia</DialogTitle>
          <DialogDescription>{nombreCompleto(persona)}</DialogDescription>
        </DialogHeader>
        <div className="grid gap-4 sm:grid-cols-2">
          <div className="flex flex-col gap-2 sm:col-span-2">
            <Label htmlFor="tipo-ausencia">Tipo</Label>
            <SelectorSimple id="tipo-ausencia" opciones={nombresTipoAusencia} valor={tipo} alCambiar={setTipo} />
          </div>
          <div className="flex flex-col gap-2">
            <Label htmlFor="desde-ausencia">Desde</Label>
            <Input
              id="desde-ausencia"
              type="date"
              value={desde}
              onChange={(evento) => {
                setDesde(evento.target.value);
                if (hasta < evento.target.value) setHasta(evento.target.value);
              }}
            />
          </div>
          <div className="flex flex-col gap-2">
            <Label htmlFor="hasta-ausencia">Hasta</Label>
            <Input id="hasta-ausencia" type="date" min={desde} value={hasta} onChange={(evento) => setHasta(evento.target.value)} />
          </div>
          <div className="flex flex-col gap-2 sm:col-span-2">
            <Label htmlFor="motivo-ausencia">Motivo</Label>
            <Input
              id="motivo-ausencia"
              value={motivo}
              onChange={(evento) => setMotivo(evento.target.value)}
              placeholder="Por ejemplo: cita médica"
            />
          </div>
        </div>
        <DialogFooter>
          <DialogClose render={<Button variant="outline" />}>Cancelar</DialogClose>
          <Button onClick={guardar} disabled={!fechasValidas || motivo.trim() === ""}>
            Registrar
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
