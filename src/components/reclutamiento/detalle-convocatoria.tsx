"use client";

import { useState } from "react";
import Link from "next/link";
import { useParams, useRouter } from "next/navigation";
import {
  ArrowLeft,
  CalendarClock,
  ChevronRight,
  ExternalLink,
  GraduationCap,
  Lock,
  LockOpen,
  MapPin,
  Search,
  Send,
  Users,
} from "lucide-react";
import { toast } from "sonner";
import { EncabezadoPagina } from "@/components/panel/encabezado-pagina";
import { SelectorSimple } from "@/components/panel/selector-simple";
import {
  IndicadorCumplimiento,
  InsigniaEstadoConvocatoria,
} from "@/components/reclutamiento/insignias";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Checkbox } from "@/components/ui/checkbox";
import { Input } from "@/components/ui/input";
import { Slider } from "@/components/ui/slider";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import {
  estadosPostulacion,
  nombresEstadoPostulacion,
  nombresNivelEstudios,
  nombresPuesto,
  nombresTurno,
  umbralCumplimientoPorDefecto,
} from "@/datos/catalogos";
import type { Convocatoria, EstadoPostulacion } from "@/datos/tipos";
import {
  cambiarEstadoConvocatoria,
  cambiarEstadoPostulaciones,
  invitarAConvocatoria,
} from "@/lib/demo/acciones";
import { useEstadoDemo } from "@/lib/demo/almacen";
import {
  destinoDeConvocatoria,
  postulantesDeConvocatoria,
  sugeridosDeLaBase,
  type FilaPostulante,
} from "@/lib/demo/consultas";
import { formatearFecha, nombreCompleto, pluralizar } from "@/lib/formato";

type FiltroEstado = EstadoPostulacion | "todos";
type Orden = "cumplimiento" | "recientes";

const nombresOrden: Record<Orden, string> = {
  cumplimiento: "Mayor cumplimiento",
  recientes: "Más recientes",
};

export function DetalleConvocatoria() {
  const { idConvocatoria } = useParams<{ idConvocatoria: string }>();
  const estado = useEstadoDemo();
  const convocatoria = estado.convocatorias.find((item) => item.id === idConvocatoria);

  if (!convocatoria) {
    return (
      <div className="flex flex-col items-center gap-3 py-16 text-center">
        <p className="text-sm text-muted-foreground">No se encontró la convocatoria.</p>
        <Button variant="outline" render={<Link href="/convocatorias" />}>
          Volver a convocatorias
        </Button>
      </div>
    );
  }

  return <ContenidoConvocatoria convocatoria={convocatoria} />;
}

function ContenidoConvocatoria({ convocatoria }: { convocatoria: Convocatoria }) {
  const estado = useEstadoDemo();
  const [umbral, setUmbral] = useState(umbralCumplimientoPorDefecto);
  const filas = postulantesDeConvocatoria(estado, convocatoria);
  const sugeridos = sugeridosDeLaBase(estado, convocatoria, umbral);
  const { requisitos } = convocatoria;
  const abierta = convocatoria.estado === "abierta";

  function alternarEstadoConvocatoria() {
    cambiarEstadoConvocatoria(convocatoria.id, abierta ? "cerrada" : "abierta");
    toast.success(abierta ? "Convocatoria cerrada. Ya no recibe postulaciones." : "Convocatoria abierta de nuevo.");
  }

  return (
    <>
      <div>
        <Button variant="ghost" size="sm" className="-ml-2" render={<Link href="/convocatorias" />}>
          <ArrowLeft />
          Convocatorias
        </Button>
      </div>

      <EncabezadoPagina
        titulo={convocatoria.titulo}
        descripcion={
          <span className="flex flex-wrap items-center gap-x-3 gap-y-1">
            <InsigniaEstadoConvocatoria estado={convocatoria.estado} />
            <span className="flex items-center gap-1">
              <MapPin className="size-3.5" />
              {destinoDeConvocatoria(estado, convocatoria)}
            </span>
            <span className="flex items-center gap-1">
              <CalendarClock className="size-3.5" />
              {abierta ? "Cierra el" : "Cerró el"} {formatearFecha(convocatoria.fechaCierre)}
            </span>
          </span>
        }
        acciones={
          <>
            {abierta && (
              <Button variant="outline" render={<a href="/postular" target="_blank" rel="noopener" />}>
                <ExternalLink />
                Página pública
              </Button>
            )}
            <Button variant="outline" onClick={alternarEstadoConvocatoria}>
              {abierta ? <Lock /> : <LockOpen />}
              {abierta ? "Cerrar convocatoria" : "Reabrir"}
            </Button>
          </>
        }
      />

      <Card>
        <CardContent className="grid gap-4 text-sm sm:grid-cols-2 lg:grid-cols-4">
          <Dato icono={Users} etiqueta="Puestos" valor={`${nombresPuesto[convocatoria.puesto]} · ${convocatoria.cantidadPuestos}`} />
          <Dato
            icono={GraduationCap}
            etiqueta="Experiencia y estudios"
            valor={`${pluralizar(requisitos.experienciaMinimaAnios, "año", "años")} · ${nombresNivelEstudios[requisitos.nivelEstudiosMinimo]} o más`}
          />
          <Dato
            icono={MapPin}
            etiqueta="Ciudad y turno"
            valor={`${requisitos.ciudad} · ${requisitos.turnos.map((turno) => nombresTurno[turno]).join(" o ")}`}
          />
          <div className="flex flex-col gap-1.5">
            <span className="text-xs text-muted-foreground">Habilidades</span>
            <div className="flex flex-wrap gap-1">
              {requisitos.habilidades.length === 0 && <span className="text-muted-foreground">Sin habilidades específicas</span>}
              {requisitos.habilidades.map((habilidad) => (
                <Badge key={habilidad} variant="outline" className="font-normal">
                  {habilidad}
                </Badge>
              ))}
            </div>
          </div>
        </CardContent>
      </Card>

      <Tabs defaultValue="postulantes">
        <TabsList>
          <TabsTrigger value="postulantes">Postulantes ({filas.length})</TabsTrigger>
          <TabsTrigger value="sugeridos" disabled={!abierta}>
            Sugeridos de la base ({abierta ? sugeridos.length : 0})
          </TabsTrigger>
        </TabsList>
        <TabsContent value="postulantes" className="mt-4">
          <TablaPostulantes convocatoria={convocatoria} filas={filas} umbral={umbral} alCambiarUmbral={setUmbral} />
        </TabsContent>
        <TabsContent value="sugeridos" className="mt-4">
          <TablaSugeridos convocatoria={convocatoria} sugeridos={sugeridos} umbral={umbral} />
        </TabsContent>
      </Tabs>
    </>
  );
}

function Dato({ icono: Icono, etiqueta, valor }: { icono: typeof Users; etiqueta: string; valor: string }) {
  return (
    <div className="flex flex-col gap-1.5">
      <span className="flex items-center gap-1.5 text-xs text-muted-foreground">
        <Icono className="size-3.5" />
        {etiqueta}
      </span>
      <span className="font-medium">{valor}</span>
    </div>
  );
}

function TablaPostulantes({
  convocatoria,
  filas,
  umbral,
  alCambiarUmbral,
}: {
  convocatoria: Convocatoria;
  filas: FilaPostulante[];
  umbral: number;
  alCambiarUmbral: (umbral: number) => void;
}) {
  const router = useRouter();
  const [busqueda, setBusqueda] = useState("");
  const [filtroEstado, setFiltroEstado] = useState<FiltroEstado>("todos");
  const [soloQueCumplen, setSoloQueCumplen] = useState(false);
  const [orden, setOrden] = useState<Orden>("cumplimiento");
  const [seleccion, setSeleccion] = useState<string[]>([]);

  const cantidadPorEstado = Object.fromEntries(
    estadosPostulacion.map((estadoPostulacion) => [
      estadoPostulacion,
      filas.filter((fila) => fila.postulacion.estado === estadoPostulacion).length,
    ]),
  ) as Record<EstadoPostulacion, number>;
  const opcionesEstado: Record<FiltroEstado, string> = {
    todos: `Todos los estados (${filas.length})`,
    ...(Object.fromEntries(
      estadosPostulacion.map((item) => [item, `${nombresEstadoPostulacion[item]} (${cantidadPorEstado[item]})`]),
    ) as Record<EstadoPostulacion, string>),
  };

  const texto = busqueda.trim().toLowerCase();
  const visibles = filas
    .filter((fila) => filtroEstado === "todos" || fila.postulacion.estado === filtroEstado)
    .filter((fila) => !soloQueCumplen || fila.cumplimiento >= umbral)
    .filter(
      (fila) =>
        texto === "" ||
        nombreCompleto(fila.postulante).toLowerCase().includes(texto) ||
        fila.postulante.carnetIdentidad.toLowerCase().includes(texto),
    )
    .sort((a, b) =>
      orden === "cumplimiento"
        ? b.cumplimiento - a.cumplimiento || b.postulacion.fecha.localeCompare(a.postulacion.fecha)
        : b.postulacion.fecha.localeCompare(a.postulacion.fecha),
    );

  const idsVisibles = visibles.map((fila) => fila.postulacion.id);
  const seleccionVisible = seleccion.filter((id) => idsVisibles.includes(id));
  const todosSeleccionados = idsVisibles.length > 0 && seleccionVisible.length === idsVisibles.length;

  function alternarSeleccion(id: string) {
    setSeleccion(seleccion.includes(id) ? seleccion.filter((item) => item !== id) : [...seleccion, id]);
  }

  function aplicarEnLote(nuevoEstado: EstadoPostulacion) {
    cambiarEstadoPostulaciones(seleccionVisible, nuevoEstado);
    toast.success(
      `${pluralizar(seleccionVisible.length, "postulante pasó", "postulantes pasaron")} a ${nombresEstadoPostulacion[nuevoEstado].toLowerCase()}.`,
    );
    setSeleccion([]);
  }

  function cambiarEstadoIndividual(fila: FilaPostulante, nuevoEstado: EstadoPostulacion) {
    cambiarEstadoPostulaciones([fila.postulacion.id], nuevoEstado);
    toast.success(`${nombreCompleto(fila.postulante)}: ${nombresEstadoPostulacion[nuevoEstado].toLowerCase()}.`);
  }

  return (
    <div className="flex flex-col gap-4">
      <div className="flex flex-col gap-3 lg:flex-row lg:items-center">
        <div className="relative lg:w-64">
          <Search className="pointer-events-none absolute top-1/2 left-2.5 size-4 -translate-y-1/2 text-muted-foreground" />
          <Input
            value={busqueda}
            onChange={(evento) => setBusqueda(evento.target.value)}
            placeholder="Buscar por nombre o carnet"
            aria-label="Buscar postulante"
            className="pl-8"
          />
        </div>
        <SelectorSimple opciones={opcionesEstado} valor={filtroEstado} alCambiar={setFiltroEstado} className="lg:w-56" />
        <SelectorSimple opciones={nombresOrden} valor={orden} alCambiar={setOrden} className="lg:w-48" />
        <div className="flex items-center gap-3 rounded-lg border px-3 py-1.5 lg:ml-auto">
          <label className="flex items-center gap-2 text-sm font-medium whitespace-nowrap">
            <Checkbox checked={soloQueCumplen} onCheckedChange={(valor) => setSoloQueCumplen(valor === true)} />
            Cumple al menos
          </label>
          <Slider
            value={[umbral]}
            onValueChange={(valor) => alCambiarUmbral(Array.isArray(valor) ? valor[0] : valor)}
            min={10}
            max={100}
            step={10}
            className="w-28"
            aria-label="Porcentaje mínimo de cumplimiento"
          />
          <span className="w-10 text-right text-sm font-semibold tabular-nums">{umbral}%</span>
        </div>
      </div>

      <div className="flex min-h-8 flex-wrap items-center justify-between gap-2">
        <p className="text-sm text-muted-foreground">
          Mostrando {visibles.length} de {filas.length}
          {soloQueCumplen && ` · cumplen al menos el ${umbral}% de los requisitos`}
        </p>
        {seleccionVisible.length > 0 && (
          <div className="flex flex-wrap items-center gap-2">
            <span className="text-sm font-medium">{pluralizar(seleccionVisible.length, "seleccionado", "seleccionados")}</span>
            <Button size="sm" onClick={() => aplicarEnLote("preseleccionado")}>
              Preseleccionar
            </Button>
            <Button size="sm" variant="outline" onClick={() => aplicarEnLote("entrevista")}>
              Pasar a entrevista
            </Button>
            <Button size="sm" variant="outline" onClick={() => aplicarEnLote("descartado")}>
              Descartar
            </Button>
          </div>
        )}
      </div>

      <Card className="py-0">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead className="w-10 pl-4">
                <Checkbox
                  checked={todosSeleccionados}
                  onCheckedChange={(valor) => setSeleccion(valor === true ? idsVisibles : [])}
                  aria-label="Seleccionar todos"
                />
              </TableHead>
              <TableHead>Postulante</TableHead>
              <TableHead>Cumplimiento</TableHead>
              <TableHead className="hidden md:table-cell">Experiencia</TableHead>
              <TableHead className="hidden md:table-cell">Estudios</TableHead>
              <TableHead className="hidden lg:table-cell">Postuló</TableHead>
              <TableHead>Estado</TableHead>
              <TableHead className="w-8" />
            </TableRow>
          </TableHeader>
          <TableBody>
            {visibles.length === 0 && (
              <TableRow>
                <TableCell colSpan={8} className="py-10 text-center text-muted-foreground">
                  Ningún postulante coincide con los filtros.
                </TableCell>
              </TableRow>
            )}
            {visibles.map((fila) => (
              <TableRow
                key={fila.postulacion.id}
                data-state={seleccion.includes(fila.postulacion.id) ? "selected" : undefined}
                className="cursor-pointer"
                onClick={() => router.push(`/postulantes/${fila.postulante.id}?convocatoria=${convocatoria.id}`)}
              >
                <TableCell className="pl-4" onClick={(evento) => evento.stopPropagation()}>
                  <Checkbox
                    checked={seleccion.includes(fila.postulacion.id)}
                    onCheckedChange={() => alternarSeleccion(fila.postulacion.id)}
                    aria-label={`Seleccionar a ${nombreCompleto(fila.postulante)}`}
                  />
                </TableCell>
                <TableCell>
                  <div className="flex flex-col">
                    <span className="flex items-center gap-2 font-medium">
                      {nombreCompleto(fila.postulante)}
                      {fila.postulacion.origen === "invitacion" && (
                        <Badge variant="outline" className="font-normal">
                          Invitado
                        </Badge>
                      )}
                    </span>
                    <span className="text-xs text-muted-foreground">{fila.postulante.ciudad}</span>
                  </div>
                </TableCell>
                <TableCell>
                  <IndicadorCumplimiento valor={fila.cumplimiento} umbral={umbral} />
                </TableCell>
                <TableCell className="hidden md:table-cell">
                  {pluralizar(fila.postulante.experienciaAnios, "año", "años")}
                </TableCell>
                <TableCell className="hidden md:table-cell">{nombresNivelEstudios[fila.postulante.nivelEstudios]}</TableCell>
                <TableCell className="hidden text-muted-foreground lg:table-cell">{formatearFecha(fila.postulacion.fecha)}</TableCell>
                <TableCell onClick={(evento) => evento.stopPropagation()}>
                  <SelectorSimple
                    opciones={nombresEstadoPostulacion}
                    valor={fila.postulacion.estado}
                    alCambiar={(nuevo) => cambiarEstadoIndividual(fila, nuevo)}
                    className="h-7 w-40"
                  />
                </TableCell>
                <TableCell>
                  <ChevronRight className="size-4 text-muted-foreground" />
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </Card>
    </div>
  );
}

function TablaSugeridos({
  convocatoria,
  sugeridos,
  umbral,
}: {
  convocatoria: Convocatoria;
  sugeridos: ReturnType<typeof sugeridosDeLaBase>;
  umbral: number;
}) {
  const router = useRouter();

  function invitar(ids: string[]) {
    const cantidad = invitarAConvocatoria(ids, convocatoria.id);
    toast.success(`${pluralizar(cantidad, "persona invitada", "personas invitadas")} a la convocatoria.`, {
      description: cantidad === 1 ? "Ya aparece en la lista de postulantes." : "Ya aparecen en la lista de postulantes.",
    });
  }

  return (
    <div className="flex flex-col gap-4">
      <div className="flex flex-wrap items-center justify-between gap-2">
        <p className="text-sm text-muted-foreground">
          Personas que postularon a otras convocatorias y cumplen al menos el {umbral}% de estos requisitos.
        </p>
        {sugeridos.length > 0 && (
          <Button size="sm" onClick={() => invitar(sugeridos.map((item) => item.postulante.id))}>
            <Send />
            Invitar a todos ({sugeridos.length})
          </Button>
        )}
      </div>
      <Card className="py-0">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead className="pl-4">Persona</TableHead>
              <TableHead>Cumplimiento</TableHead>
              <TableHead className="hidden md:table-cell">Experiencia</TableHead>
              <TableHead className="hidden md:table-cell">Estudios</TableHead>
              <TableHead className="w-28" />
            </TableRow>
          </TableHeader>
          <TableBody>
            {sugeridos.length === 0 && (
              <TableRow>
                <TableCell colSpan={5} className="py-10 text-center text-muted-foreground">
                  No hay más personas en la base que cumplan el {umbral}%.
                </TableCell>
              </TableRow>
            )}
            {sugeridos.map(({ postulante, cumplimiento }) => (
              <TableRow key={postulante.id} className="cursor-pointer" onClick={() => router.push(`/postulantes/${postulante.id}`)}>
                <TableCell className="pl-4">
                  <div className="flex flex-col">
                    <span className="font-medium">{nombreCompleto(postulante)}</span>
                    <span className="text-xs text-muted-foreground">{postulante.ciudad}</span>
                  </div>
                </TableCell>
                <TableCell>
                  <IndicadorCumplimiento valor={cumplimiento} umbral={umbral} />
                </TableCell>
                <TableCell className="hidden md:table-cell">{pluralizar(postulante.experienciaAnios, "año", "años")}</TableCell>
                <TableCell className="hidden md:table-cell">{nombresNivelEstudios[postulante.nivelEstudios]}</TableCell>
                <TableCell onClick={(evento) => evento.stopPropagation()}>
                  <Button size="sm" variant="outline" onClick={() => invitar([postulante.id])}>
                    <Send />
                    Invitar
                  </Button>
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </Card>
    </div>
  );
}
