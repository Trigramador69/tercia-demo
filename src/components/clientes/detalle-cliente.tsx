"use client";

import { useState } from "react";
import Link from "next/link";
import { useParams } from "next/navigation";
import { ArrowLeft, MapPin, Phone, UserRoundMinus, UserRoundPlus } from "lucide-react";
import { toast } from "sonner";
import { BarraCobertura, InsigniaFaltantes, porcentajeCobertura } from "@/components/clientes/cobertura";
import { DialogoAsignarASucursal } from "@/components/clientes/dialogos-asignacion";
import { EncabezadoPagina } from "@/components/panel/encabezado-pagina";
import { SelectorSimple } from "@/components/panel/selector-simple";
import { Estrellas } from "@/components/personal/estrellas";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Checkbox } from "@/components/ui/checkbox";
import { horarioPorTurno, nombresPuesto, nombresTurno } from "@/datos/catalogos";
import type { Ciudad, Cliente, Puesto, Sucursal, Turno } from "@/datos/tipos";
import { finalizarAsignacion } from "@/lib/demo/acciones";
import { useEstadoDemo } from "@/lib/demo/almacen";
import {
  asignacionesActuales,
  calificacionDePersona,
  coberturaDeCliente,
  type CoberturaSucursal,
} from "@/lib/demo/consultas";
import { formatearAntiguedad, formatearFecha, nombreCompleto, pluralizar } from "@/lib/formato";
import { useFiltroUrl, useFiltroUrlBooleano } from "@/lib/use-filtro-url";

interface PuestoPorCubrir {
  sucursal: Sucursal;
  puesto: Puesto;
  turno: Turno;
}

export function DetalleCliente() {
  const { idCliente } = useParams<{ idCliente: string }>();
  const { clientes } = useEstadoDemo();
  const cliente = clientes.find((item) => item.id === idCliente);

  if (!cliente) {
    return (
      <div className="flex flex-col items-center gap-3 py-16 text-center">
        <h1 className="font-heading text-lg font-semibold">No encontramos este cliente</h1>
        <Button variant="outline" nativeButton={false} render={<Link href="/clientes" />}>
          Volver a clientes
        </Button>
      </div>
    );
  }
  return <ContenidoCliente cliente={cliente} />;
}

function ContenidoCliente({ cliente }: { cliente: Cliente }) {
  const estado = useEstadoDemo();
  const puedeAsignar = estado.rol === "recursos_humanos";
  const [porCubrir, setPorCubrir] = useState<PuestoPorCubrir | null>(null);

  const cobertura = coberturaDeCliente(estado, cliente.id);
  const ciudades = Array.from(new Set(cobertura.sucursales.map((item) => item.sucursal.ciudad)));
  const opcionesCiudad = Object.fromEntries([["todas", "Todas las ciudades"], ...ciudades.map((ciudad) => [ciudad, ciudad])]) as Record<
    Ciudad | "todas",
    string
  >;
  const [ciudad, setCiudad] = useFiltroUrl<Ciudad | "todas">("ciudad", "todas", ["todas", ...ciudades]);
  const [soloFaltantes, setSoloFaltantes] = useFiltroUrlBooleano("faltantes");

  const visibles = cobertura.sucursales
    .filter((item) => ciudad === "todas" || item.sucursal.ciudad === ciudad)
    .filter((item) => !soloFaltantes || item.asignados < item.requeridos);
  const faltan = cobertura.requeridos - cobertura.asignados;
  const sucursalesConFaltantes = cobertura.sucursales.filter((item) => item.asignados < item.requeridos).length;

  return (
    <>
      <div>
        <Button variant="ghost" size="sm" className="-ml-2" nativeButton={false} render={<Link href="/clientes" />}>
          <ArrowLeft />
          Clientes y sucursales
        </Button>
      </div>

      <EncabezadoPagina
        titulo={cliente.nombre}
        descripcion={
          <span className="flex flex-wrap items-center gap-x-3 gap-y-1">
            <span>{cliente.rubro}</span>
            <span className="flex items-center gap-1">
              <Phone className="size-3.5" />
              {cliente.contactoNombre}, {cliente.contactoCargo} · {cliente.contactoTelefono}
            </span>
            <span>Cliente desde {formatearFecha(cliente.clienteDesde)}</span>
          </span>
        }
      />

      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        <Cifra etiqueta="Sucursales" valor={String(cobertura.sucursales.length)} detalle={ciudades.join(" y ")} />
        <Cifra etiqueta="Personal asignado" valor={String(cobertura.asignados)} detalle={`de ${cobertura.requeridos} que pide el cliente`} />
        <Cifra
          etiqueta="Cobertura"
          valor={`${porcentajeCobertura(cobertura.asignados, cobertura.requeridos)}%`}
          detalle={faltan > 0 ? pluralizar(faltan, "puesto sin cubrir", "puestos sin cubrir") : "Todos los puestos cubiertos"}
        />
        <Cifra
          etiqueta="Sucursales con faltantes"
          valor={String(sucursalesConFaltantes)}
          detalle={sucursalesConFaltantes > 0 ? "Requieren asignación" : "Ninguna"}
        />
      </div>

      {cobertura.sucursales.length > 1 && (
        <div className="flex flex-wrap items-center gap-3">
          {ciudades.length > 1 && (
            <SelectorSimple opciones={opcionesCiudad} valor={ciudad} alCambiar={setCiudad} className="w-52" />
          )}
          <label className="flex items-center gap-2 text-sm">
            <Checkbox checked={soloFaltantes} onCheckedChange={(valor) => setSoloFaltantes(valor === true)} />
            Solo sucursales con puestos sin cubrir
          </label>
          <span className="text-sm text-muted-foreground">
            Mostrando {visibles.length} de {cobertura.sucursales.length}
          </span>
        </div>
      )}

      <div className="grid items-start gap-4 lg:grid-cols-2">
        {visibles.map((item) => (
          <TarjetaSucursal
            key={item.sucursal.id}
            cobertura={item}
            puedeAsignar={puedeAsignar}
            alAsignar={(puesto, turno) => setPorCubrir({ sucursal: item.sucursal, puesto, turno })}
          />
        ))}
        {visibles.length === 0 && (
          <p className="py-8 text-center text-sm text-muted-foreground lg:col-span-2">Ninguna sucursal coincide con los filtros.</p>
        )}
      </div>

      {porCubrir && (
        <DialogoAsignarASucursal
          sucursal={porCubrir.sucursal}
          puesto={porCubrir.puesto}
          turno={porCubrir.turno}
          abierto
          alCambiarAbierto={(abierto) => {
            if (!abierto) setPorCubrir(null);
          }}
        />
      )}
    </>
  );
}

function Cifra({ etiqueta, valor, detalle }: { etiqueta: string; valor: string; detalle: string }) {
  return (
    <Card>
      <CardHeader>
        <CardDescription>{etiqueta}</CardDescription>
        <CardTitle className="font-heading text-3xl font-semibold tabular-nums">{valor}</CardTitle>
      </CardHeader>
      <CardContent>
        <p className="text-xs text-muted-foreground">{detalle}</p>
      </CardContent>
    </Card>
  );
}

function TarjetaSucursal({
  cobertura,
  puedeAsignar,
  alAsignar,
}: {
  cobertura: CoberturaSucursal;
  puedeAsignar: boolean;
  alAsignar: (puesto: Puesto, turno: Turno) => void;
}) {
  const estado = useEstadoDemo();
  const { sucursal } = cobertura;
  const actuales = asignacionesActuales(estado).filter((asignacion) => asignacion.idSucursal === sucursal.id);

  function quitar(idPersona: string) {
    const persona = estado.personas.find((item) => item.id === idPersona);
    const deshacer = finalizarAsignacion(idPersona);
    toast.success(`${persona ? nombreCompleto(persona) : "La persona"} ya no está en ${sucursal.nombre}.`, {
      description: "Su asignación pasó al historial y el puesto queda por cubrir.",
      action: { label: "Deshacer", onClick: deshacer },
    });
  }

  return (
    <Card>
      <CardHeader>
        <div className="flex items-start justify-between gap-2">
          <div className="flex flex-col gap-1">
            <CardTitle>{sucursal.nombre}</CardTitle>
            <CardDescription className="flex items-center gap-1">
              <MapPin className="size-3.5 shrink-0" />
              {sucursal.ciudad} · {sucursal.direccion}
            </CardDescription>
          </div>
          <InsigniaFaltantes faltan={cobertura.requeridos - cobertura.asignados} />
        </div>
        <BarraCobertura asignados={cobertura.asignados} requeridos={cobertura.requeridos} className="pt-1" />
      </CardHeader>
      <CardContent className="flex flex-col gap-4">
        {cobertura.requerimientos.map((requerimiento) => {
          const asignadas = actuales.filter(
            (asignacion) => asignacion.puesto === requerimiento.puesto && asignacion.turno === requerimiento.turno,
          );
          const vacantes = Math.max(0, requerimiento.requeridos - asignadas.length);
          return (
            <div key={`${requerimiento.puesto}-${requerimiento.turno}`} className="flex flex-col gap-2">
              <div className="flex items-center justify-between gap-2 text-sm">
                <span className="font-medium">
                  {nombresPuesto[requerimiento.puesto]} · {nombresTurno[requerimiento.turno]}
                  <span className="font-normal text-muted-foreground">
                    {" "}
                    ({horarioPorTurno[requerimiento.turno].entrada} a {horarioPorTurno[requerimiento.turno].salida})
                  </span>
                </span>
                <span className="tabular-nums text-muted-foreground">
                  {asignadas.length} de {requerimiento.requeridos}
                </span>
              </div>
              <ul className="flex flex-col gap-1.5">
                {asignadas.map((asignacion) => {
                  const persona = estado.personas.find((item) => item.id === asignacion.idPersona);
                  if (!persona) return null;
                  const calificacion = calificacionDePersona(estado, persona.id);
                  return (
                    <li key={asignacion.id} className="flex items-center gap-2 rounded-lg bg-muted/50 px-3 py-1.5 text-sm">
                      <Link href={`/personal/${persona.id}`} className="min-w-0 flex-1 truncate hover:underline">
                        {nombreCompleto(persona)}
                      </Link>
                      {calificacion !== null && <Estrellas valor={calificacion} className="hidden sm:inline-flex [&_svg]:size-3" />}
                      <span className="hidden text-xs text-muted-foreground md:inline">{formatearAntiguedad(asignacion.desde)}</span>
                      {puedeAsignar && (
                        <Button
                          variant="ghost"
                          size="icon-xs"
                          onClick={() => quitar(persona.id)}
                          aria-label={`Quitar a ${nombreCompleto(persona)} de esta sucursal`}
                          title="Quitar de esta sucursal"
                        >
                          <UserRoundMinus />
                        </Button>
                      )}
                    </li>
                  );
                })}
                {Array.from({ length: vacantes }, (_, indice) => (
                  <li
                    key={`vacante-${indice}`}
                    className="flex items-center justify-between gap-2 rounded-lg border border-dashed border-advertencia/50 px-3 py-1.5 text-sm"
                  >
                    <span className="text-advertencia">Puesto sin cubrir</span>
                    {puedeAsignar && (
                      <Button size="xs" variant="outline" onClick={() => alAsignar(requerimiento.puesto, requerimiento.turno)}>
                        <UserRoundPlus />
                        Asignar
                      </Button>
                    )}
                  </li>
                ))}
              </ul>
            </div>
          );
        })}
      </CardContent>
    </Card>
  );
}
