"use client";

import Link from "next/link";
import { useRouter, useSearchParams } from "next/navigation";
import { ChevronRight, Search } from "lucide-react";
import { EncabezadoPagina } from "@/components/panel/encabezado-pagina";
import { SelectorSimple } from "@/components/panel/selector-simple";
import { Estrellas } from "@/components/personal/estrellas";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { Card } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { nombresPuesto, nombresTurno } from "@/datos/catalogos";
import type { Ciudad, Puesto } from "@/datos/tipos";
import { useEstadoDemo } from "@/lib/demo/almacen";
import { asignacionActualDePersona, calificacionDePersona } from "@/lib/demo/consultas";
import { formatearAntiguedad, iniciales, nombreCompleto, pluralizar } from "@/lib/formato";
import { useFiltroUrl, useFiltroUrlTexto } from "@/lib/use-filtro-url";

const sinAsignacion = "disponibles";
const todos = "todos";

type Orden = "nombre" | "calificacion" | "antiguedad";
const nombresOrden: Record<Orden, string> = {
  nombre: "Ordenar por nombre",
  calificacion: "Mejor calificación",
  antiguedad: "Más antigüedad",
};
const opcionesPuesto: Record<Puesto | typeof todos, string> = { todos: "Todos los puestos", ...nombresPuesto };
const opcionesCiudad: Record<Ciudad | "todas", string> = { todas: "Todas las ciudades", Cochabamba: "Cochabamba", "La Paz": "La Paz" };

export function ListaPersonal() {
  const estado = useEstadoDemo();
  const router = useRouter();
  const filtrosActuales = useSearchParams().toString();

  const clientesActivos = estado.clientes.filter((cliente) => cliente.estado === "activo");
  const opcionesCliente: Record<string, string> = { [todos]: "Todos los clientes", [sinAsignacion]: "Sin asignación (disponibles)" };
  for (const cliente of clientesActivos) opcionesCliente[cliente.id] = cliente.nombre;

  const [busqueda, setBusqueda] = useFiltroUrlTexto("buscar");
  const [idCliente, setIdCliente] = useFiltroUrl<string>("cliente", todos, Object.keys(opcionesCliente));
  const sucursalesDelCliente = estado.sucursales.filter((sucursal) => sucursal.idCliente === idCliente);
  const opcionesSucursal: Record<string, string> = { [todos]: "Todas las sucursales" };
  for (const sucursal of sucursalesDelCliente) opcionesSucursal[sucursal.id] = sucursal.nombre;
  const [idSucursal, setIdSucursal] = useFiltroUrl<string>("sucursal", todos, Object.keys(opcionesSucursal));
  const [ciudad, setCiudad] = useFiltroUrl<Ciudad | "todas">("ciudad", "todas", ["todas", "Cochabamba", "La Paz"]);
  const [puesto, setPuesto] = useFiltroUrl<Puesto | typeof todos>("puesto", todos, Object.keys(opcionesPuesto) as (Puesto | typeof todos)[]);
  const [orden, setOrden] = useFiltroUrl<Orden>("orden", "nombre", ["nombre", "calificacion", "antiguedad"]);

  const filas = estado.personas.map((persona) => {
    const asignacion = asignacionActualDePersona(estado, persona.id);
    const sucursal = estado.sucursales.find((item) => item.id === asignacion?.idSucursal);
    const cliente = estado.clientes.find((item) => item.id === sucursal?.idCliente);
    return { persona, asignacion, sucursal, cliente, calificacion: calificacionDePersona(estado, persona.id) };
  });
  const asignadas = filas.filter((fila) => fila.asignacion).length;

  const texto = busqueda.trim().toLowerCase();
  const visibles = filas
    .filter((fila) => {
      if (idCliente === todos) return true;
      if (idCliente === sinAsignacion) return !fila.asignacion;
      return fila.cliente?.id === idCliente;
    })
    .filter((fila) => idSucursal === todos || fila.sucursal?.id === idSucursal)
    .filter((fila) => ciudad === "todas" || fila.persona.ciudad === ciudad)
    .filter((fila) => puesto === todos || fila.persona.puesto === puesto)
    .filter(
      (fila) =>
        texto === "" ||
        nombreCompleto(fila.persona).toLowerCase().includes(texto) ||
        fila.persona.carnetIdentidad.toLowerCase().includes(texto),
    )
    .sort((a, b) => {
      if (orden === "calificacion") return (b.calificacion ?? 0) - (a.calificacion ?? 0);
      if (orden === "antiguedad") return a.persona.fechaIngreso.localeCompare(b.persona.fechaIngreso);
      return nombreCompleto(a.persona).localeCompare(nombreCompleto(b.persona), "es");
    });

  const enlaceFicha = (idPersona: string) =>
    `/personal/${idPersona}${filtrosActuales ? `?filtros=${encodeURIComponent(filtrosActuales)}` : ""}`;

  function elegirCliente(valor: string) {
    setIdCliente(valor);
    setIdSucursal(todos);
  }

  return (
    <>
      <EncabezadoPagina
        titulo="Personal"
        descripcion={`${pluralizar(estado.personas.length, "persona", "personas")} · ${asignadas} asignadas · ${pluralizar(estado.personas.length - asignadas, "disponible", "disponibles")}`}
      />

      <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-6">
        <div className="relative sm:col-span-2 lg:col-span-1">
          <Search className="pointer-events-none absolute top-1/2 left-2.5 size-4 -translate-y-1/2 text-muted-foreground" />
          <Input
            value={busqueda}
            onChange={(evento) => setBusqueda(evento.target.value)}
            placeholder="Nombre o carnet"
            aria-label="Buscar personal"
            className="pl-8"
          />
        </div>
        <SelectorSimple opciones={opcionesCliente} valor={idCliente} alCambiar={elegirCliente} />
        <SelectorSimple
          opciones={opcionesSucursal}
          valor={idSucursal}
          alCambiar={setIdSucursal}
          deshabilitado={sucursalesDelCliente.length === 0}
        />
        <SelectorSimple opciones={opcionesCiudad} valor={ciudad} alCambiar={setCiudad} />
        <SelectorSimple opciones={opcionesPuesto} valor={puesto} alCambiar={setPuesto} />
        <SelectorSimple opciones={nombresOrden} valor={orden} alCambiar={setOrden} />
      </div>

      <p className="-mt-2 text-sm text-muted-foreground">
        Mostrando {visibles.length} de {filas.length}
      </p>

      <Card className="-mt-2 py-0">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead className="pl-4">Persona</TableHead>
              <TableHead className="hidden md:table-cell">Puesto</TableHead>
              <TableHead>Asignación actual</TableHead>
              <TableHead className="hidden lg:table-cell">Turno</TableHead>
              <TableHead>Calificación</TableHead>
              <TableHead className="hidden md:table-cell">Antigüedad</TableHead>
              <TableHead className="w-8" />
            </TableRow>
          </TableHeader>
          <TableBody>
            {visibles.length === 0 && (
              <TableRow>
                <TableCell colSpan={7} className="py-10 text-center text-muted-foreground">
                  Nadie coincide con los filtros.
                </TableCell>
              </TableRow>
            )}
            {visibles.map(({ persona, asignacion, sucursal, cliente, calificacion }) => (
              <TableRow key={persona.id} className="cursor-pointer" onClick={() => router.push(enlaceFicha(persona.id))}>
                <TableCell className="pl-4">
                  <div className="flex items-center gap-3">
                    <Avatar className="size-8">
                      <AvatarFallback className="bg-marca-suave text-xs text-primary">{iniciales(persona)}</AvatarFallback>
                    </Avatar>
                    <div className="flex flex-col">
                      <Link
                        href={enlaceFicha(persona.id)}
                        className="w-fit rounded-sm font-medium outline-none hover:underline focus-visible:ring-2 focus-visible:ring-ring"
                        onClick={(evento) => evento.stopPropagation()}
                      >
                        {nombreCompleto(persona)}
                      </Link>
                      <span className="text-xs text-muted-foreground">{persona.ciudad}</span>
                    </div>
                  </div>
                </TableCell>
                <TableCell className="hidden md:table-cell">{nombresPuesto[persona.puesto]}</TableCell>
                <TableCell>
                  {asignacion ? (
                    <div className="flex flex-col">
                      <span>{cliente?.nombre}</span>
                      <span className="text-xs text-muted-foreground">{sucursal?.nombre}</span>
                    </div>
                  ) : (
                    <Badge className="bg-advertencia-suave text-advertencia">Disponible</Badge>
                  )}
                </TableCell>
                <TableCell className="hidden lg:table-cell">{asignacion ? nombresTurno[asignacion.turno] : "-"}</TableCell>
                <TableCell>
                  {calificacion === null ? (
                    <span className="text-xs text-muted-foreground">Sin evaluaciones</span>
                  ) : (
                    <span className="flex items-center gap-2">
                      <Estrellas valor={calificacion} />
                      <span className="text-xs text-muted-foreground tabular-nums">{calificacion.toFixed(1)}</span>
                    </span>
                  )}
                </TableCell>
                <TableCell className="hidden text-muted-foreground md:table-cell">{formatearAntiguedad(persona.fechaIngreso)}</TableCell>
                <TableCell>
                  <ChevronRight className="size-4 text-muted-foreground" />
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </Card>
    </>
  );
}
