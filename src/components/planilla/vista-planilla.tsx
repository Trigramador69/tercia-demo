"use client";

import Link from "next/link";
import { AlertTriangle, CheckCircle2, Download } from "lucide-react";
import { EncabezadoPagina } from "@/components/panel/encabezado-pagina";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardAction, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Table, TableBody, TableCell, TableFooter, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { mesAsistenciaDemo, nombresPuesto, tarifaMensualPorPuesto } from "@/datos/catalogos";
import type { Cliente, EstadoDemo, Persona } from "@/datos/tipos";
import { diaTrabajado } from "@/lib/conciliacion";
import { useEstadoDemo } from "@/lib/demo/almacen";
import { asistenciaDeCliente } from "@/lib/demo/consultas";
import { formatearMes, formatearMonto, nombreCompleto, pluralizar } from "@/lib/formato";
import { puedeVerRuta } from "@/lib/navegacion";

interface FilaPlanilla {
  persona: Persona;
  tarifa: number;
  diasLaborables: number;
  diasTrabajados: number;
  diasPorResolver: number;
  monto: number;
}

interface PlanillaCliente {
  cliente: Cliente;
  filas: FilaPlanilla[];
  total: number;
  // "conciliada": con reporte del cliente y sin días por resolver.
  estado: "conciliada" | "por_resolver" | "sin_reporte";
  diasPorResolver: number;
}

// Pago proporcional a los días trabajados sobre los días laborables del mes,
// con la tarifa mensual del puesto.
function calcularPlanilla(estado: EstadoDemo, cliente: Cliente, mes: string): PlanillaCliente {
  const { personas, registros, conciliacion, resumen } = asistenciaDeCliente(estado, cliente.id, mes);
  const filas = personas.map((persona) => {
    const propios = registros.filter((registro) => registro.idPersona === persona.id);
    const tarifa = tarifaMensualPorPuesto[persona.puesto];
    let diasTrabajados: number;
    let diasPorResolver = 0;
    if (conciliacion) {
      const dias = conciliacion.dias.filter((dia) => dia.idPersona === persona.id).map(diaTrabajado);
      diasTrabajados = dias.filter((valor) => valor === true).length;
      diasPorResolver = dias.filter((valor) => valor === null).length;
    } else {
      diasTrabajados = propios.filter((registro) => registro.estado === "presente").length;
    }
    const monto = Math.round((tarifa * diasTrabajados * 100) / Math.max(1, propios.length)) / 100;
    return { persona, tarifa, diasLaborables: propios.length, diasTrabajados, diasPorResolver, monto };
  });
  const diasPorResolver = resumen?.porResolver ?? 0;
  let estadoPlanilla: PlanillaCliente["estado"] = "conciliada";
  if (!conciliacion) estadoPlanilla = "sin_reporte";
  else if (diasPorResolver > 0) estadoPlanilla = "por_resolver";
  return {
    cliente,
    filas,
    total: filas.reduce((suma, fila) => suma + fila.monto, 0),
    estado: estadoPlanilla,
    diasPorResolver,
  };
}

function descargarCsv(planillas: PlanillaCliente[], mes: string) {
  const lineas = [["Cliente", "Persona", "Carnet", "Puesto", "Tarifa mensual (Bs)", "Días laborables", "Días trabajados", "Días por resolver", "Monto (Bs)"].join(";")];
  for (const planilla of planillas) {
    for (const fila of planilla.filas) {
      lineas.push(
        [
          planilla.cliente.nombre,
          nombreCompleto(fila.persona),
          fila.persona.carnetIdentidad,
          nombresPuesto[fila.persona.puesto],
          fila.tarifa,
          fila.diasLaborables,
          fila.diasTrabajados,
          fila.diasPorResolver,
          fila.monto.toFixed(2).replace(".", ","),
        ].join(";"),
      );
    }
  }
  const contenido = String.fromCodePoint(0xfeff) + lineas.join("\r\n");
  const enlace = document.createElement("a");
  enlace.href = URL.createObjectURL(new Blob([contenido], { type: "text/csv;charset=utf-8" }));
  enlace.download = `planilla-${mes}.csv`;
  enlace.click();
  URL.revokeObjectURL(enlace.href);
}

export function VistaPlanilla() {
  const estado = useEstadoDemo();
  const mes = mesAsistenciaDemo;
  const clientes = estado.clientes.filter((cliente) => cliente.estado === "activo");
  const planillas = clientes.map((cliente) => calcularPlanilla(estado, cliente, mes)).filter((planilla) => planilla.filas.length > 0);
  const sinAsistencia = clientes.filter((cliente) => !planillas.some((planilla) => planilla.cliente.id === cliente.id));
  const total = planillas.reduce((suma, planilla) => suma + planilla.total, 0);
  const pendientes = planillas.filter((planilla) => planilla.estado !== "conciliada").length;
  const verAsistencia = puedeVerRuta(estado.rol, "/asistencia");

  return (
    <>
      <EncabezadoPagina
        titulo={`Planilla de ${formatearMes(mes).toLowerCase()}`}
        descripcion="Días trabajados según la asistencia conciliada, con la tarifa mensual de cada puesto."
        acciones={
          <Button variant="outline" onClick={() => descargarCsv(planillas, mes)}>
            <Download />
            Descargar planilla
          </Button>
        }
      />

      <div className="grid gap-4 sm:grid-cols-3">
        <Card>
          <CardHeader>
            <CardDescription>Total a pagar</CardDescription>
            <CardTitle className="font-heading text-3xl font-semibold tabular-nums">{formatearMonto(total)}</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-xs text-muted-foreground">{pluralizar(planillas.reduce((suma, planilla) => suma + planilla.filas.length, 0), "persona", "personas")} en {pluralizar(planillas.length, "cliente", "clientes")}</p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader>
            <CardDescription>Clientes conciliados</CardDescription>
            <CardTitle className="font-heading text-3xl font-semibold tabular-nums">
              {planillas.length - pendientes} de {planillas.length}
            </CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-xs text-muted-foreground">
              {pendientes === 0 ? "Lista para pagar" : "Los montos de los clientes pendientes son preliminares"}
            </p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader>
            <CardDescription>Tarifas mensuales por puesto</CardDescription>
          </CardHeader>
          <CardContent>
            <ul className="grid grid-cols-2 gap-x-3 gap-y-0.5 text-xs">
              {Object.entries(tarifaMensualPorPuesto).map(([puesto, tarifa]) => (
                <li key={puesto} className="flex justify-between gap-2">
                  <span className="text-muted-foreground">{nombresPuesto[puesto as keyof typeof nombresPuesto]}</span>
                  <span className="tabular-nums">{formatearMonto(tarifa)}</span>
                </li>
              ))}
            </ul>
          </CardContent>
        </Card>
      </div>

      {planillas.map((planilla) => (
        <Card key={planilla.cliente.id}>
          <CardHeader>
            <CardTitle>{planilla.cliente.nombre}</CardTitle>
            <CardDescription>
              {planilla.estado === "conciliada" && "Asistencia conciliada con el reporte del cliente."}
              {planilla.estado === "por_resolver" &&
                `${pluralizar(planilla.diasPorResolver, "día sigue", "días siguen")} por resolver en la conciliación y no se cuentan hasta decidir.`}
              {planilla.estado === "sin_reporte" && "Calculada solo con nuestro registro: falta conciliar con el reporte del cliente."}
            </CardDescription>
            <CardAction className="flex items-center gap-2">
              {planilla.estado === "conciliada" ? (
                <Badge className="bg-exito-suave text-exito">
                  <CheckCircle2 />
                  Conciliada
                </Badge>
              ) : (
                <Badge className="bg-advertencia-suave text-advertencia">
                  <AlertTriangle />
                  Preliminar
                </Badge>
              )}
              {planilla.estado !== "conciliada" && verAsistencia && (
                <Button variant="outline" size="sm" nativeButton={false} render={<Link href={`/asistencia?cliente=${planilla.cliente.id}`} />}>
                  Ir a conciliar
                </Button>
              )}
            </CardAction>
          </CardHeader>
          <CardContent>
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Persona</TableHead>
                  <TableHead className="hidden md:table-cell">Puesto</TableHead>
                  <TableHead className="hidden text-right md:table-cell">Tarifa mensual</TableHead>
                  <TableHead className="text-right">Días trabajados</TableHead>
                  <TableHead className="text-right">Monto</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {planilla.filas.map((fila) => (
                  <TableRow key={fila.persona.id}>
                    <TableCell>
                      <Link href={`/personal/${fila.persona.id}`} className="font-medium hover:underline">
                        {nombreCompleto(fila.persona)}
                      </Link>
                    </TableCell>
                    <TableCell className="hidden md:table-cell">{nombresPuesto[fila.persona.puesto]}</TableCell>
                    <TableCell className="hidden text-right tabular-nums md:table-cell">{formatearMonto(fila.tarifa)}</TableCell>
                    <TableCell className="text-right tabular-nums">
                      {fila.diasTrabajados} de {fila.diasLaborables}
                      {fila.diasPorResolver > 0 && (
                        <span className="ml-1 text-xs text-advertencia">({fila.diasPorResolver} por resolver)</span>
                      )}
                      {fila.diasTrabajados > fila.diasLaborables && (
                        <span className="ml-1 text-xs text-muted-foreground">(con día extra)</span>
                      )}
                    </TableCell>
                    <TableCell className="text-right font-medium tabular-nums">{formatearMonto(fila.monto)}</TableCell>
                  </TableRow>
                ))}
              </TableBody>
              <TableFooter>
                <TableRow>
                  <TableCell className="font-medium">Total {planilla.cliente.nombre}</TableCell>
                  <TableCell className="hidden md:table-cell" />
                  <TableCell className="hidden md:table-cell" />
                  <TableCell />
                  <TableCell className="text-right font-semibold tabular-nums">{formatearMonto(planilla.total)}</TableCell>
                </TableRow>
              </TableFooter>
            </Table>
          </CardContent>
        </Card>
      ))}

      {sinAsistencia.length > 0 && (
        <p className="text-sm text-muted-foreground">
          Sin asistencia cargada en la demo: {sinAsistencia.map((cliente) => cliente.nombre).join(", ")}.
        </p>
      )}
    </>
  );
}
