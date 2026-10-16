"use client";

import { useState } from "react";
import { Send } from "lucide-react";
import { toast } from "sonner";
import { SelectorSimple } from "@/components/panel/selector-simple";
import { IndicadorCumplimiento } from "@/components/reclutamiento/insignias";
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
import { umbralCumplimientoPorDefecto } from "@/datos/catalogos";
import { invitarAConvocatoria } from "@/lib/demo/acciones";
import { useEstadoDemo } from "@/lib/demo/almacen";
import { calcularCumplimiento } from "@/lib/cumplimiento";
import { nombreCompleto, pluralizar } from "@/lib/formato";

// Invita a una o varias personas de la base a una convocatoria abierta. Antes
// de confirmar muestra cuánto cumple cada una con los requisitos elegidos.
export function DialogoInvitar({
  idsPostulantes,
  abierto,
  alCambiarAbierto,
  alInvitar,
}: {
  idsPostulantes: string[];
  abierto: boolean;
  alCambiarAbierto: (abierto: boolean) => void;
  alInvitar?: () => void;
}) {
  const estado = useEstadoDemo();
  const abiertas = estado.convocatorias.filter((convocatoria) => convocatoria.estado === "abierta");
  const [idConvocatoria, setIdConvocatoria] = useState("");

  const opciones: Record<string, string> = {};
  for (const convocatoria of abiertas) opciones[convocatoria.id] = convocatoria.titulo;

  const convocatoria = abiertas.find((item) => item.id === idConvocatoria);
  const personas = estado.postulantes.filter((postulante) => idsPostulantes.includes(postulante.id));
  const yaIncluidos = new Set(
    estado.postulaciones
      .filter((postulacion) => postulacion.idConvocatoria === idConvocatoria)
      .map((postulacion) => postulacion.idPostulante),
  );
  const porInvitar = personas.filter((persona) => !yaIncluidos.has(persona.id));

  function confirmar() {
    if (!convocatoria) return;
    const cantidad = invitarAConvocatoria(idsPostulantes, convocatoria.id);
    toast.success(`${pluralizar(cantidad, "persona invitada", "personas invitadas")} a ${convocatoria.titulo}.`, {
      description:
        cantidad === 1
          ? "Aparece como nueva en la lista de postulantes."
          : "Aparecen como nuevas en la lista de postulantes.",
    });
    alCambiarAbierto(false);
    setIdConvocatoria("");
    alInvitar?.();
  }

  return (
    <Dialog open={abierto} onOpenChange={alCambiarAbierto}>
      <DialogContent className="sm:max-w-lg">
        <DialogHeader>
          <DialogTitle>Invitar a una convocatoria</DialogTitle>
          <DialogDescription>
            {personas.length === 1
              ? `${nombreCompleto(personas[0])} pasa a la lista de postulantes de la convocatoria que elija.`
              : `Las ${personas.length} personas seleccionadas pasan a la lista de postulantes de la convocatoria que elija.`}
          </DialogDescription>
        </DialogHeader>

        <div className="flex flex-col gap-2">
          <Label htmlFor="convocatoria-destino">Convocatoria</Label>
          <SelectorSimple
            id="convocatoria-destino"
            opciones={opciones}
            valor={idConvocatoria}
            alCambiar={setIdConvocatoria}
            textoVacio="Elija una convocatoria abierta"
          />
        </div>

        {convocatoria && (
          <ul className="flex max-h-64 flex-col divide-y overflow-y-auto rounded-lg border">
            {personas.map((persona) => (
              <li key={persona.id} className="flex items-center justify-between gap-3 px-3 py-2 text-sm">
                <span className="truncate">{nombreCompleto(persona)}</span>
                {yaIncluidos.has(persona.id) ? (
                  <Badge variant="secondary">Ya está en la convocatoria</Badge>
                ) : (
                  <IndicadorCumplimiento
                    valor={calcularCumplimiento(convocatoria.requisitos, persona)}
                    umbral={umbralCumplimientoPorDefecto}
                  />
                )}
              </li>
            ))}
          </ul>
        )}

        <DialogFooter>
          <DialogClose render={<Button variant="outline" />}>Cancelar</DialogClose>
          <Button onClick={confirmar} disabled={!convocatoria || porInvitar.length === 0}>
            <Send />
            {porInvitar.length > 1 ? `Invitar a ${porInvitar.length}` : "Invitar"}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
