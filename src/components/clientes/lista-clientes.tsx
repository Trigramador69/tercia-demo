"use client";

import Link from "next/link";
import { Building, MapPin, Phone, Users } from "lucide-react";
import { BarraCobertura, InsigniaFaltantes, porcentajeCobertura } from "@/components/clientes/cobertura";
import { EncabezadoPagina } from "@/components/panel/encabezado-pagina";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { useEstadoDemo } from "@/lib/demo/almacen";
import { coberturaDeCliente, coberturaGeneral } from "@/lib/demo/consultas";
import { formatearFecha, pluralizar } from "@/lib/formato";

export function ListaClientes() {
  const estado = useEstadoDemo();
  const activos = estado.clientes.filter((cliente) => cliente.estado === "activo");
  const anteriores = estado.clientes.filter((cliente) => cliente.estado === "finalizado");
  const general = coberturaGeneral(estado);
  const totalSucursales = estado.sucursales.filter((sucursal) => activos.some((cliente) => cliente.id === sucursal.idCliente)).length;

  return (
    <>
      <EncabezadoPagina
        titulo="Clientes y sucursales"
        descripcion={`${pluralizar(activos.length, "cliente activo", "clientes activos")} · ${pluralizar(totalSucursales, "sucursal", "sucursales")} · ${general.asignados} de ${general.requeridos} puestos cubiertos (${porcentajeCobertura(general.asignados, general.requeridos)}%)`}
      />

      <div className="grid gap-4 md:grid-cols-2">
        {activos.map((cliente) => {
          const cobertura = coberturaDeCliente(estado, cliente.id);
          const faltan = cobertura.requeridos - cobertura.asignados;
          const ciudades = Array.from(new Set(cobertura.sucursales.map((item) => item.sucursal.ciudad)));
          const sucursalesConFaltantes = cobertura.sucursales.filter((item) => item.asignados < item.requeridos).length;
          return (
            <Link
              key={cliente.id}
              href={`/clientes/${cliente.id}`}
              className="group min-w-0 rounded-xl outline-none focus-visible:ring-2 focus-visible:ring-ring"
            >
              <Card className="h-full transition-colors group-hover:border-primary/40">
                <CardHeader>
                  <div className="flex items-start justify-between gap-2">
                    <div className="flex items-center gap-3">
                      <span className="flex size-10 shrink-0 items-center justify-center rounded-lg bg-marca-suave text-primary">
                        <Building className="size-5" />
                      </span>
                      <div className="flex flex-col">
                        <CardTitle>{cliente.nombre}</CardTitle>
                        <CardDescription>{cliente.rubro}</CardDescription>
                      </div>
                    </div>
                    <InsigniaFaltantes faltan={faltan} />
                  </div>
                </CardHeader>
                <CardContent className="flex flex-col gap-3 text-sm">
                  <div className="flex flex-wrap gap-x-4 gap-y-1 text-muted-foreground">
                    <span className="flex items-center gap-1.5">
                      <MapPin className="size-3.5" />
                      {pluralizar(cobertura.sucursales.length, "sucursal", "sucursales")} en {ciudades.join(" y ")}
                    </span>
                    <span className="flex items-center gap-1.5">
                      <Users className="size-3.5" />
                      {pluralizar(cobertura.asignados, "persona asignada", "personas asignadas")}
                    </span>
                  </div>
                  <BarraCobertura asignados={cobertura.asignados} requeridos={cobertura.requeridos} />
                  {sucursalesConFaltantes > 0 && (
                    <p className="text-xs text-advertencia">
                      {pluralizar(sucursalesConFaltantes, "sucursal con puestos sin cubrir", "sucursales con puestos sin cubrir")}
                    </p>
                  )}
                </CardContent>
                <CardFooter className="flex flex-wrap justify-between gap-2 text-xs text-muted-foreground">
                  <span className="flex items-center gap-1.5">
                    <Phone className="size-3.5" />
                    {cliente.contactoNombre}, {cliente.contactoCargo}
                  </span>
                  <span>Cliente desde {formatearFecha(cliente.clienteDesde)}</span>
                </CardFooter>
              </Card>
            </Link>
          );
        })}
      </div>

      {anteriores.length > 0 && (
        <section className="flex flex-col gap-2">
          <h2 className="text-sm font-medium text-muted-foreground">Clientes anteriores</h2>
          <div className="flex flex-wrap gap-2">
            {anteriores.map((cliente) => (
              <Badge key={cliente.id} variant="outline" className="font-normal">
                {cliente.nombre} · {cliente.rubro}
              </Badge>
            ))}
          </div>
        </section>
      )}
    </>
  );
}
