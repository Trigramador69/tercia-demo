"use client";

import Link from "next/link";
import { ArrowRight, Building, CalendarCheck, Megaphone, Users, type LucideIcon } from "lucide-react";
import { EncabezadoPagina } from "@/components/panel/encabezado-pagina";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";
import {
  mesAsistenciaDemo,
  nombresPuesto,
  nombresRol,
  nombresTurno,
  umbralCumplimientoPorDefecto,
} from "@/datos/catalogos";
import { clientesConAsistencia } from "@/datos/asistencia";
import { useEstadoDemo } from "@/lib/demo/almacen";
import {
  asignacionesActuales,
  coberturaGeneral,
  postulacionesDeConvocatoria,
} from "@/lib/demo/consultas";
import { calcularCumplimiento } from "@/lib/cumplimiento";
import { fechaDeHoy, formatearFechaLarga, formatearNombreMes, pluralizar } from "@/lib/formato";
import { puedeVerRuta } from "@/lib/navegacion";

export function VistaInicio() {
  const estado = useEstadoDemo();
  const { rol } = estado;

  const convocatoriasAbiertas = estado.convocatorias.filter((convocatoria) => convocatoria.estado === "abierta");
  const postulantesNuevos = estado.postulaciones.filter(
    (postulacion) =>
      postulacion.estado === "nuevo" &&
      convocatoriasAbiertas.some((convocatoria) => convocatoria.id === postulacion.idConvocatoria),
  ).length;

  const idsAsignados = new Set(asignacionesActuales(estado).map((asignacion) => asignacion.idPersona));
  const disponibles = estado.personas.length - idsAsignados.size;

  const cobertura = coberturaGeneral(estado);
  const porcentajeCobertura = cobertura.requeridos ? Math.round((cobertura.asignados / cobertura.requeridos) * 100) : 100;
  const faltantes = cobertura.sucursales
    .flatMap((item) =>
      item.requerimientos
        .filter((requerimiento) => requerimiento.asignados < requerimiento.requeridos)
        .map((requerimiento) => ({ sucursal: item.sucursal, ...requerimiento })),
    );

  const reportesCargados = new Set(
    estado.reportesCliente.filter((reporte) => reporte.mes === mesAsistenciaDemo).map((reporte) => reporte.idCliente),
  );
  const reportesPendientes = clientesConAsistencia.filter((idCliente) => !reportesCargados.has(idCliente)).length;

  const clientePorId = new Map(estado.clientes.map((cliente) => [cliente.id, cliente]));

  return (
    <>
      <EncabezadoPagina
        titulo="Inicio"
        descripcion={`${formatearFechaLarga(fechaDeHoy())} · Vista de ${nombresRol[rol]}`}
      />

      <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
        <Indicador
          titulo="Convocatorias abiertas"
          valor={convocatoriasAbiertas.length}
          detalle={pluralizar(postulantesNuevos, "postulante nuevo por revisar", "postulantes nuevos por revisar")}
          icono={Megaphone}
          ruta={puedeVerRuta(rol, "/convocatorias") ? "/convocatorias" : undefined}
        />
        <Indicador
          titulo="Personal"
          valor={estado.personas.length}
          detalle={`${idsAsignados.size} asignados · ${pluralizar(disponibles, "disponible", "disponibles")}`}
          icono={Users}
          ruta="/personal"
        />
        <Indicador
          titulo="Cobertura de sucursales"
          valor={`${porcentajeCobertura}%`}
          detalle={`${cobertura.asignados} de ${cobertura.requeridos} puestos cubiertos`}
          icono={Building}
          ruta="/clientes"
        >
          <Progress value={porcentajeCobertura} className="mt-3" />
        </Indicador>
        <Indicador
          titulo={`Asistencia de ${formatearNombreMes(mesAsistenciaDemo)}`}
          valor={reportesPendientes === 0 ? "Al día" : reportesPendientes}
          detalle={
            reportesPendientes === 0
              ? "Todos los reportes de clientes cargados"
              : pluralizar(reportesPendientes, "reporte de cliente por conciliar", "reportes de clientes por conciliar")
          }
          icono={CalendarCheck}
          ruta={puedeVerRuta(rol, "/asistencia") ? "/asistencia" : "/planilla"}
        />
      </div>

      <div className="grid gap-4 lg:grid-cols-2">
        <Card>
          <CardHeader>
            <CardTitle>Convocatorias abiertas</CardTitle>
            <CardDescription>
              Postulantes que cumplen al menos el {umbralCumplimientoPorDefecto}% de los requisitos.
            </CardDescription>
          </CardHeader>
          <CardContent className="flex flex-col divide-y">
            {convocatoriasAbiertas.map((convocatoria) => {
              const postulaciones = postulacionesDeConvocatoria(estado, convocatoria.id);
              const aptos = postulaciones.filter((postulacion) => {
                const postulante = estado.postulantes.find((item) => item.id === postulacion.idPostulante);
                return postulante && calcularCumplimiento(convocatoria.requisitos, postulante) >= umbralCumplimientoPorDefecto;
              }).length;
              const cliente = convocatoria.idCliente ? clientePorId.get(convocatoria.idCliente) : undefined;
              // El Gerente ve el resumen pero no entra a las convocatorias.
              const enlazable = puedeVerRuta(rol, "/convocatorias");
              const clasesFila =
                "group/fila flex flex-col gap-2 py-3 outline-none first:pt-0 last:pb-0 focus-visible:ring-2 focus-visible:ring-ring sm:flex-row sm:items-center sm:justify-between sm:gap-4";
              const contenido = (
                <>
                  <div className="min-w-0">
                    <p className={`text-sm font-medium sm:truncate ${enlazable ? "group-hover/fila:underline" : ""}`}>
                      {convocatoria.titulo}
                    </p>
                    <p className="truncate text-xs text-muted-foreground">
                      {cliente?.nombre ?? "Uso interno"} · {pluralizar(convocatoria.cantidadPuestos, "puesto", "puestos")}
                    </p>
                  </div>
                  <div className="flex shrink-0 items-center gap-2">
                    <Badge variant="secondary">{pluralizar(postulaciones.length, "postulante", "postulantes")}</Badge>
                    <Badge className="bg-exito-suave text-exito">{aptos} cumplen</Badge>
                  </div>
                </>
              );
              return enlazable ? (
                <Link key={convocatoria.id} href={`/convocatorias/${convocatoria.id}`} className={clasesFila}>
                  {contenido}
                </Link>
              ) : (
                <div key={convocatoria.id} className={clasesFila}>
                  {contenido}
                </div>
              );
            })}
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Puestos sin cubrir</CardTitle>
            <CardDescription>Sucursales que piden más personal del que tienen asignado.</CardDescription>
          </CardHeader>
          <CardContent className="flex flex-col divide-y">
            {faltantes.length === 0 && (
              <p className="text-sm text-muted-foreground">Todas las sucursales están cubiertas.</p>
            )}
            {faltantes.map((faltante) => (
              <div
                key={`${faltante.sucursal.id}-${faltante.puesto}-${faltante.turno}`}
                className="flex items-center justify-between gap-4 py-3 first:pt-0 last:pb-0"
              >
                <div className="min-w-0">
                  <p className="truncate text-sm font-medium">
                    {clientePorId.get(faltante.sucursal.idCliente)?.nombre}, {faltante.sucursal.nombre}
                  </p>
                  <p className="truncate text-xs text-muted-foreground">
                    {nombresPuesto[faltante.puesto]} · {nombresTurno[faltante.turno]} · {faltante.sucursal.ciudad}
                  </p>
                </div>
                <Badge className="shrink-0 bg-advertencia-suave text-advertencia">
                  Faltan {faltante.requeridos - faltante.asignados}
                </Badge>
              </div>
            ))}
          </CardContent>
        </Card>
      </div>
    </>
  );
}

function Indicador({
  titulo,
  valor,
  detalle,
  icono: Icono,
  ruta,
  children,
}: {
  titulo: string;
  valor: React.ReactNode;
  detalle: string;
  icono: LucideIcon;
  ruta?: string;
  children?: React.ReactNode;
}) {
  const contenido = (
    <Card className="h-full transition-colors group-hover:border-primary/40">
      <CardHeader>
        <CardDescription className="flex items-center justify-between gap-2">
          <span>{titulo}</span>
          <Icono className="size-4" />
        </CardDescription>
        <CardTitle className="font-heading text-3xl font-semibold tabular-nums">{valor}</CardTitle>
      </CardHeader>
      <CardContent>
        <p className="flex items-center gap-1 text-xs text-muted-foreground">
          {detalle}
          {ruta && <ArrowRight className="size-3 opacity-0 transition-opacity group-hover:opacity-100" />}
        </p>
        {children}
      </CardContent>
    </Card>
  );
  if (!ruta) return contenido;
  return (
    <Link href={ruta} className="group min-w-0 rounded-xl outline-none focus-visible:ring-2 focus-visible:ring-ring">
      {contenido}
    </Link>
  );
}
