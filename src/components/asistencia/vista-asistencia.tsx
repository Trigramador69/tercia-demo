"use client";

import { useState } from "react";
import Link from "next/link";
import { CheckCircle2, FileSpreadsheet, RotateCcw, Trash2 } from "lucide-react";
import { toast } from "sonner";
import { CalendarioAsistencia } from "@/components/asistencia/calendario-asistencia";
import { CargaReporte } from "@/components/asistencia/carga-reporte";
import {
  DialogoDia,
  InsigniaResultado,
  resolver,
  textoRegistroCliente,
  textoRegistroPropio,
} from "@/components/asistencia/resolucion";
import { EncabezadoPagina } from "@/components/panel/encabezado-pagina";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardAction, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { mesAsistenciaDemo } from "@/datos/catalogos";
import type { Cliente } from "@/datos/tipos";
import type { DiaConciliado } from "@/lib/conciliacion";
import { deshacerResolucion, quitarReporteCliente } from "@/lib/demo/acciones";
import { useEstadoDemo } from "@/lib/demo/almacen";
import { asistenciaDeCliente, type ResumenConciliacion } from "@/lib/demo/consultas";
import { formatearFecha, formatearMes, nombreCompleto, pluralizar } from "@/lib/formato";
import { useFiltroUrl } from "@/lib/use-filtro-url";
import { cn } from "@/lib/utils";

type FiltroDiferencias = "por_resolver" | "resueltas" | "todas";

function porcentajeConciliado(resumen: ResumenConciliacion) {
  return resumen.total === 0 ? 100 : Math.round(((resumen.coinciden + resumen.resueltos) / resumen.total) * 100);
}

export function VistaAsistencia() {
  const estado = useEstadoDemo();
  const mes = mesAsistenciaDemo;
  const clientes = estado.clientes
    .filter((cliente) => cliente.estado === "activo")
    .map((cliente) => ({ cliente, asistencia: asistenciaDeCliente(estado, cliente.id, mes) }));
  const conRegistro = clientes.filter((item) => item.asistencia.registros.length > 0);
  const idsConRegistro = conRegistro.map((item) => item.cliente.id);
  const [idCliente, setIdCliente] = useFiltroUrl<string>("cliente", idsConRegistro[0] ?? "", idsConRegistro);
  const elegido = conRegistro.find((item) => item.cliente.id === idCliente);

  return (
    <>
      <EncabezadoPagina
        titulo="Asistencia"
        descripcion={`${formatearMes(mes)} · registro propio y conciliación con el reporte de cada cliente`}
      />

      <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
        {clientes.map(({ cliente, asistencia }) => {
          const tieneRegistro = asistencia.registros.length > 0;
          const activo = cliente.id === idCliente;
          const contenido = (
            <Card className={cn("h-full transition-colors", activo && "border-primary ring-1 ring-primary/40", tieneRegistro && "group-hover:border-primary/40")}>
              <CardHeader>
                <CardTitle className="text-base">{cliente.nombre}</CardTitle>
                <CardDescription>
                  {tieneRegistro ? pluralizar(asistencia.personas.length, "persona con registro", "personas con registro") : "Sin registro cargado en la demo"}
                </CardDescription>
              </CardHeader>
              {tieneRegistro && (
                <CardContent className="flex flex-col gap-2 text-sm">
                  {asistencia.resumen ? (
                    <>
                      <div className="flex items-center justify-between">
                        <span className="text-muted-foreground">Conciliado</span>
                        <span className="font-semibold tabular-nums">{porcentajeConciliado(asistencia.resumen)}%</span>
                      </div>
                      <div className="h-1.5 overflow-hidden rounded-full bg-muted">
                        <div className="h-full rounded-full bg-exito" style={{ width: `${porcentajeConciliado(asistencia.resumen)}%` }} />
                      </div>
                      {asistencia.resumen.porResolver > 0 ? (
                        <Badge className="w-fit bg-peligro-suave text-destructive">
                          {pluralizar(asistencia.resumen.porResolver, "día por resolver", "días por resolver")}
                        </Badge>
                      ) : (
                        <Badge className="w-fit bg-exito-suave text-exito">Todo conciliado</Badge>
                      )}
                    </>
                  ) : (
                    <Badge className="w-fit bg-advertencia-suave text-advertencia">Falta el reporte del cliente</Badge>
                  )}
                </CardContent>
              )}
            </Card>
          );
          return tieneRegistro ? (
            <button
              key={cliente.id}
              type="button"
              onClick={() => setIdCliente(cliente.id)}
              className="group min-w-0 rounded-xl text-left outline-none focus-visible:ring-2 focus-visible:ring-ring"
              aria-pressed={activo}
            >
              {contenido}
            </button>
          ) : (
            <div key={cliente.id} className="min-w-0 opacity-60">
              {contenido}
            </div>
          );
        })}
      </div>

      {elegido && (
        <PanelCliente
          key={elegido.cliente.id}
          cliente={elegido.cliente}
          mes={mes}
          clientesConRegistro={idsConRegistro}
          alCambiarCliente={setIdCliente}
        />
      )}
    </>
  );
}

function PanelCliente({
  cliente,
  mes,
  clientesConRegistro,
  alCambiarCliente,
}: {
  cliente: Cliente;
  mes: string;
  clientesConRegistro: string[];
  alCambiarCliente: (idCliente: string) => void;
}) {
  const estado = useEstadoDemo();
  const puedeResolver = estado.rol === "recursos_humanos";
  const { personas, registros, reporte, conciliacion, resumen } = asistenciaDeCliente(estado, cliente.id, mes);
  const [diaElegido, setDiaElegido] = useState<string | null>(null);
  const [filtro, setFiltro] = useFiltroUrl<FiltroDiferencias>("diferencias", "por_resolver", ["por_resolver", "resueltas", "todas"]);

  const personaPorId = new Map(estado.personas.map((persona) => [persona.id, persona]));
  const sucursalPorId = new Map(estado.sucursales.map((sucursal) => [sucursal.id, sucursal]));
  const dias = conciliacion?.dias ?? null;
  const dia = dias?.find((item) => item.clave === diaElegido);
  const diferencias = (dias ?? []).filter((item) => item.resultado !== "coincide");
  const visibles = diferencias
    .filter((item) => filtro === "todas" || (filtro === "resueltas" ? item.resolucion !== null : item.resolucion === null))
    .sort((a, b) => a.fecha.localeCompare(b.fecha));

  function nombreSucursal(item: DiaConciliado) {
    const idSucursal = item.propio?.idSucursal;
    return idSucursal ? (sucursalPorId.get(idSucursal)?.nombre ?? "") : (item.cliente?.sucursal ?? "");
  }

  function quitarReporte() {
    quitarReporteCliente(cliente.id, mes);
    toast.success("Reporte quitado. Puede volver a subirlo cuando quiera.");
  }

  return (
    <div className="flex flex-col gap-6">
      <Card>
        <CardHeader>
          <CardTitle>{cliente.nombre}</CardTitle>
          <CardDescription>
            {reporte ? (
              <span className="flex flex-wrap items-center gap-x-2">
                <FileSpreadsheet className="size-3.5" />
                {reporte.nombreArchivo} · {pluralizar(reporte.filas.length, "fila", "filas")} · cargado el {formatearFecha(reporte.fechaCarga)}
              </span>
            ) : (
              "Registro propio del mes. Suba el reporte del cliente para conciliarlo."
            )}
          </CardDescription>
          {reporte && puedeResolver && (
            <CardAction className="flex items-start gap-2">
              <Button variant="ghost" size="sm" onClick={quitarReporte}>
                <Trash2 />
                Quitar
              </Button>
              <CargaReporte
                idCliente={cliente.id}
                nombreCliente={cliente.nombre}
                mes={mes}
                clientesConRegistro={clientesConRegistro}
                alCambiarCliente={alCambiarCliente}
                compacta
              />
            </CardAction>
          )}
        </CardHeader>
        <CardContent className="flex flex-col gap-5">
          {!reporte && puedeResolver && (
            <CargaReporte
              idCliente={cliente.id}
              nombreCliente={cliente.nombre}
              mes={mes}
              clientesConRegistro={clientesConRegistro}
              alCambiarCliente={alCambiarCliente}
            />
          )}

          {resumen && (
            <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-5">
              <Cifra etiqueta="Días comparados" valor={resumen.total} />
              <Cifra etiqueta="Coinciden" valor={resumen.coinciden} clase="text-exito" />
              <Cifra etiqueta="No coincide el horario" valor={resumen.noCoinciden} clase="text-advertencia" />
              <Cifra etiqueta="En conflicto" valor={resumen.conflictos} clase="text-destructive" />
              <Cifra
                etiqueta="Por resolver"
                valor={resumen.porResolver}
                detalle={resumen.resueltos > 0 ? `${resumen.resueltos} ya resueltos` : undefined}
              />
            </div>
          )}
          {conciliacion && conciliacion.filasSinPersona.length > 0 && (
            <p className="text-sm text-advertencia">
              {pluralizar(conciliacion.filasSinPersona.length, "fila del reporte tiene", "filas del reporte tienen")} un carnet que no
              corresponde al personal asignado a este cliente.
            </p>
          )}

          <CalendarioAsistencia
            mes={mes}
            personas={personas}
            registros={registros}
            dias={dias}
            alElegirDia={(item) => setDiaElegido(item.clave)}
          />
        </CardContent>
      </Card>

      {conciliacion && (
        <Card>
          <CardHeader>
            <CardTitle>Diferencias</CardTitle>
            <CardDescription>
              Días en que nuestro registro y el del cliente no dicen lo mismo. Elija cuál vale: la planilla usa esa decisión.
            </CardDescription>
          </CardHeader>
          <CardContent className="flex flex-col gap-4">
            <Tabs value={filtro} onValueChange={(valor) => setFiltro(valor as FiltroDiferencias)}>
              <TabsList>
                <TabsTrigger value="por_resolver">Por resolver ({resumen?.porResolver ?? 0})</TabsTrigger>
                <TabsTrigger value="resueltas">Resueltas ({resumen?.resueltos ?? 0})</TabsTrigger>
                <TabsTrigger value="todas">Todas ({diferencias.length})</TabsTrigger>
              </TabsList>
            </Tabs>
            {visibles.length === 0 ? (
              <div className="flex flex-col items-center gap-2 py-8 text-center text-sm text-muted-foreground">
                <CheckCircle2 className="size-8 text-exito" />
                {filtro === "por_resolver" ? "No quedan diferencias por resolver." : "No hay diferencias en esta vista."}
              </div>
            ) : (
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Fecha</TableHead>
                    <TableHead>Persona</TableHead>
                    <TableHead>Resultado</TableHead>
                    <TableHead className="hidden lg:table-cell">Nuestro registro</TableHead>
                    <TableHead className="hidden lg:table-cell">Cliente</TableHead>
                    <TableHead className="min-w-64">Detalle</TableHead>
                    {puedeResolver && <TableHead className="text-right">¿Cuál vale?</TableHead>}
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {visibles.map((item) => {
                    const persona = personaPorId.get(item.idPersona);
                    return (
                      <TableRow key={item.clave}>
                        <TableCell className="whitespace-nowrap tabular-nums">{formatearFecha(item.fecha)}</TableCell>
                        <TableCell>
                          <div className="flex flex-col">
                            {persona ? (
                              <Link href={`/personal/${persona.id}`} className="w-fit font-medium hover:underline">
                                {nombreCompleto(persona)}
                              </Link>
                            ) : (
                              <span className="font-medium">{item.cliente?.nombre}</span>
                            )}
                            <span className="text-xs text-muted-foreground">{nombreSucursal(item)}</span>
                          </div>
                        </TableCell>
                        <TableCell>
                          <InsigniaResultado dia={item} />
                        </TableCell>
                        <TableCell className="hidden whitespace-nowrap tabular-nums lg:table-cell">{textoRegistroPropio(item)}</TableCell>
                        <TableCell className="hidden whitespace-nowrap tabular-nums lg:table-cell">{textoRegistroCliente(item)}</TableCell>
                        <TableCell className="text-sm whitespace-normal">{item.detalle}</TableCell>
                        {puedeResolver && (
                          <TableCell className="text-right">
                            {item.resolucion ? (
                              <div className="flex items-center justify-end gap-2">
                                <span className="text-xs whitespace-nowrap text-muted-foreground">
                                  Vale el {item.resolucion.registroValido === "propio" ? "nuestro" : "del cliente"}
                                </span>
                                <Button
                                  variant="ghost"
                                  size="icon-xs"
                                  aria-label="Volver a dejarlo por resolver"
                                  title="Volver a dejarlo por resolver"
                                  onClick={() => deshacerResolucion({ idCliente: cliente.id, idPersona: item.idPersona, fecha: item.fecha })}
                                >
                                  <RotateCcw />
                                </Button>
                              </div>
                            ) : (
                              <div className="flex justify-end gap-1.5">
                                <Button size="xs" variant="outline" onClick={() => resolver(item, cliente.id, "propio", persona)}>
                                  Nuestro
                                </Button>
                                <Button size="xs" variant="outline" onClick={() => resolver(item, cliente.id, "cliente", persona)}>
                                  Del cliente
                                </Button>
                              </div>
                            )}
                          </TableCell>
                        )}
                      </TableRow>
                    );
                  })}
                </TableBody>
              </Table>
            )}
          </CardContent>
        </Card>
      )}

      {dia && (
        <DialogoDia
          dia={dia}
          persona={personaPorId.get(dia.idPersona)}
          nombreSucursal={nombreSucursal(dia)}
          idCliente={cliente.id}
          puedeResolver={puedeResolver}
          alCerrar={() => setDiaElegido(null)}
        />
      )}
    </div>
  );
}

function Cifra({ etiqueta, valor, clase, detalle }: { etiqueta: string; valor: number; clase?: string; detalle?: string }) {
  return (
    <div className="flex flex-col gap-0.5 rounded-lg border px-3 py-2">
      <span className="text-xs text-muted-foreground">{etiqueta}</span>
      <span className={cn("font-heading text-2xl font-semibold tabular-nums", clase)}>{valor}</span>
      {detalle && <span className="text-xs text-muted-foreground">{detalle}</span>}
    </div>
  );
}
