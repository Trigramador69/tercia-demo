"use client";

import { useState } from "react";
import { Check, UserRoundPlus } from "lucide-react";
import { toast } from "sonner";
import { SelectorSimple } from "@/components/panel/selector-simple";
import { Estrellas } from "@/components/personal/estrellas";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogClose,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Label } from "@/components/ui/label";
import { horarioPorTurno, nombresPuesto, nombresTurno } from "@/datos/catalogos";
import type { Persona, Puesto, Sucursal, Turno } from "@/datos/tipos";
import { asignarPersona } from "@/lib/demo/acciones";
import { useEstadoDemo } from "@/lib/demo/almacen";
import {
  asignacionActualDePersona,
  calificacionDePersona,
  coberturaDeSucursal,
  nombreDeSucursalConCliente,
} from "@/lib/demo/consultas";
import { iniciales, nombreCompleto } from "@/lib/formato";
import { cn } from "@/lib/utils";

// Desde una sucursal: elegir a quién asignar a un puesto y turno que falta cubrir.
export function DialogoAsignarASucursal({
  sucursal,
  puesto,
  turno,
  abierto,
  alCambiarAbierto,
}: {
  sucursal: Sucursal;
  puesto: Puesto;
  turno: Turno;
  abierto: boolean;
  alCambiarAbierto: (abierto: boolean) => void;
}) {
  const estado = useEstadoDemo();
  const [idElegido, setIdElegido] = useState<string | null>(null);

  const candidatos = estado.personas
    .filter((persona) => persona.puesto === puesto)
    .map((persona) => ({
      persona,
      asignacion: asignacionActualDePersona(estado, persona.id),
      calificacion: calificacionDePersona(estado, persona.id),
    }))
    .filter(({ asignacion }) => !(asignacion?.idSucursal === sucursal.id && asignacion.turno === turno))
    // Primero quienes están disponibles, después los de la misma ciudad, y dentro de eso los mejor calificados.
    .sort(
      (a, b) =>
        Number(!!a.asignacion) - Number(!!b.asignacion) ||
        Number(a.persona.ciudad !== sucursal.ciudad) - Number(b.persona.ciudad !== sucursal.ciudad) ||
        (b.calificacion ?? 0) - (a.calificacion ?? 0),
    );
  const elegido = candidatos.find((candidato) => candidato.persona.id === idElegido);

  function confirmar() {
    if (!elegido) return;
    asignarPersona({ idPersona: elegido.persona.id, idSucursal: sucursal.id, puesto, turno });
    toast.success(`Asignación registrada: ${nombreCompleto(elegido.persona)} en ${nombreDeSucursalConCliente(estado, sucursal.id)}.`, {
      description: elegido.asignacion ? "Su asignación anterior pasó a su historial." : undefined,
    });
    alCambiarAbierto(false);
    setIdElegido(null);
  }

  return (
    <Dialog open={abierto} onOpenChange={alCambiarAbierto}>
      <DialogContent className="sm:max-w-lg">
        <DialogHeader>
          <DialogTitle>Asignar {nombresPuesto[puesto].toLowerCase()}</DialogTitle>
          <DialogDescription>
            {nombreDeSucursalConCliente(estado, sucursal.id)} · {nombresTurno[turno]} ({horarioPorTurno[turno].entrada} a{" "}
            {horarioPorTurno[turno].salida})
          </DialogDescription>
        </DialogHeader>
        <ul className="flex max-h-80 flex-col gap-1.5 overflow-y-auto pr-1" role="radiogroup" aria-label="Persona a asignar">
          {candidatos.map(({ persona, asignacion, calificacion }) => {
            const seleccionado = persona.id === idElegido;
            return (
              <li key={persona.id}>
                <button
                  type="button"
                  role="radio"
                  aria-checked={seleccionado}
                  onClick={() => setIdElegido(persona.id)}
                  className={cn(
                    "flex w-full items-center gap-3 rounded-lg border px-3 py-2 text-left outline-none transition-colors hover:bg-muted/60 focus-visible:ring-2 focus-visible:ring-ring",
                    seleccionado && "border-primary bg-marca-suave/50",
                  )}
                >
                  <Avatar className="size-8">
                    <AvatarFallback className="bg-marca-suave text-xs text-primary">{iniciales(persona)}</AvatarFallback>
                  </Avatar>
                  <span className="flex min-w-0 flex-1 flex-col">
                    <span className="flex items-center gap-2 text-sm font-medium">
                      <span className="truncate">{nombreCompleto(persona)}</span>
                      {calificacion !== null && <Estrellas valor={calificacion} className="[&_svg]:size-3" />}
                    </span>
                    <span className="truncate text-xs text-muted-foreground">
                      {asignacion ? `Hoy en ${nombreDeSucursalConCliente(estado, asignacion.idSucursal)}` : "Sin asignación"}
                    </span>
                  </span>
                  <span className="flex shrink-0 flex-col items-end gap-1">
                    {!asignacion && <Badge className="bg-exito-suave text-exito">Disponible</Badge>}
                    {persona.ciudad !== sucursal.ciudad && <Badge variant="outline">Vive en {persona.ciudad}</Badge>}
                  </span>
                  {seleccionado && <Check className="size-4 shrink-0 text-primary" />}
                </button>
              </li>
            );
          })}
          {candidatos.length === 0 && (
            <li className="py-6 text-center text-sm text-muted-foreground">No hay personal de este puesto para asignar.</li>
          )}
        </ul>
        {elegido?.asignacion && (
          <p className="text-xs text-muted-foreground">
            Con esta asignación deja la actual y esa sucursal queda con un puesto por cubrir.
          </p>
        )}
        <DialogFooter>
          <DialogClose render={<Button variant="outline" />}>Cancelar</DialogClose>
          <Button onClick={confirmar} disabled={!elegido}>
            <UserRoundPlus />
            Asignar
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}

// Desde la ficha de una persona: elegir cliente, sucursal y turno.
export function DialogoAsignarPersona({
  persona,
  abierto,
  alCambiarAbierto,
}: {
  persona: Persona;
  abierto: boolean;
  alCambiarAbierto: (abierto: boolean) => void;
}) {
  const estado = useEstadoDemo();
  const [idCliente, setIdCliente] = useState("");
  const [idSucursal, setIdSucursal] = useState("");
  const [turno, setTurno] = useState<Turno | "">("");

  const opcionesCliente: Record<string, string> = {};
  for (const cliente of estado.clientes.filter((item) => item.estado === "activo")) {
    // Solo clientes que piden personal de este puesto.
    const pide = estado.sucursales.some(
      (sucursal) => sucursal.idCliente === cliente.id && sucursal.requerimientos.some((item) => item.puesto === persona.puesto),
    );
    if (pide) opcionesCliente[cliente.id] = cliente.nombre;
  }

  const sucursales = estado.sucursales.filter(
    (sucursal) => sucursal.idCliente === idCliente && sucursal.requerimientos.some((item) => item.puesto === persona.puesto),
  );
  const opcionesSucursal: Record<string, string> = {};
  for (const sucursal of sucursales) {
    const faltan = coberturaDeSucursal(estado, sucursal)
      .requerimientos.filter((item) => item.puesto === persona.puesto)
      .reduce((suma, item) => suma + Math.max(0, item.requeridos - item.asignados), 0);
    opcionesSucursal[sucursal.id] = `${sucursal.nombre} (${sucursal.ciudad})${faltan > 0 ? ` · falta ${faltan}` : ""}`;
  }

  const sucursal = sucursales.find((item) => item.id === idSucursal);
  const requerimientos = sucursal
    ? coberturaDeSucursal(estado, sucursal).requerimientos.filter((item) => item.puesto === persona.puesto)
    : [];
  const opcionesTurno = Object.fromEntries(
    requerimientos.map((item) => [
      item.turno,
      `${nombresTurno[item.turno]} · ${item.asignados} de ${item.requeridos}${item.asignados < item.requeridos ? " (falta)" : " (completo)"}`,
    ]),
  ) as Record<Turno, string>;
  const requerimientoElegido = requerimientos.find((item) => item.turno === turno);

  function confirmar() {
    if (!sucursal || turno === "") return;
    asignarPersona({ idPersona: persona.id, idSucursal: sucursal.id, puesto: persona.puesto, turno });
    toast.success(`Asignación registrada: ${nombreCompleto(persona)} en ${nombreDeSucursalConCliente(estado, sucursal.id)}.`);
    alCambiarAbierto(false);
    setIdCliente("");
    setIdSucursal("");
    setTurno("");
  }

  return (
    <Dialog open={abierto} onOpenChange={alCambiarAbierto}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Asignar a {nombreCompleto(persona)}</DialogTitle>
          <DialogDescription>
            {nombresPuesto[persona.puesto]} · vive en {persona.ciudad}
          </DialogDescription>
        </DialogHeader>
        <div className="flex flex-col gap-4">
          <div className="flex flex-col gap-2">
            <Label htmlFor="asignar-cliente">Cliente</Label>
            <SelectorSimple
              id="asignar-cliente"
              opciones={opcionesCliente}
              valor={idCliente}
              alCambiar={(valor) => {
                setIdCliente(valor);
                setIdSucursal("");
                setTurno("");
              }}
              textoVacio="Elija un cliente"
            />
          </div>
          <div className="flex flex-col gap-2">
            <Label htmlFor="asignar-sucursal">Sucursal</Label>
            <SelectorSimple
              id="asignar-sucursal"
              opciones={opcionesSucursal}
              valor={idSucursal}
              alCambiar={(valor) => {
                setIdSucursal(valor);
                // Se elige solo el turno si es el único del puesto o el único con lugar libre.
                const sucursalElegida = estado.sucursales.find((item) => item.id === valor);
                const delPuesto = sucursalElegida
                  ? coberturaDeSucursal(estado, sucursalElegida).requerimientos.filter((item) => item.puesto === persona.puesto)
                  : [];
                const conLugar = delPuesto.filter((item) => item.asignados < item.requeridos);
                if (delPuesto.length === 1) setTurno(delPuesto[0].turno);
                else if (conLugar.length === 1) setTurno(conLugar[0].turno);
                else setTurno("");
              }}
              textoVacio="Elija una sucursal"
              deshabilitado={idCliente === ""}
            />
          </div>
          <div className="flex flex-col gap-2">
            <Label htmlFor="asignar-turno">Turno</Label>
            <SelectorSimple
              id="asignar-turno"
              opciones={opcionesTurno}
              valor={turno}
              alCambiar={setTurno}
              textoVacio="Elija un turno"
              deshabilitado={!sucursal}
            />
          </div>
          {requerimientoElegido && requerimientoElegido.asignados >= requerimientoElegido.requeridos && (
            <p className="text-xs text-advertencia">
              Este puesto ya está cubierto: la sucursal quedaría con una persona más de las que pide.
            </p>
          )}
        </div>
        <DialogFooter>
          <DialogClose render={<Button variant="outline" />}>Cancelar</DialogClose>
          <Button onClick={confirmar} disabled={!sucursal || turno === ""}>
            <UserRoundPlus />
            Asignar
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
