"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { ChevronRight, Search, Send } from "lucide-react";
import { EncabezadoPagina } from "@/components/panel/encabezado-pagina";
import { SelectorSimple } from "@/components/panel/selector-simple";
import { DialogoInvitar } from "@/components/reclutamiento/dialogo-invitar";
import { InsigniaEstadoPostulacion } from "@/components/reclutamiento/insignias";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Checkbox } from "@/components/ui/checkbox";
import { Input } from "@/components/ui/input";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { nombresNivelEstudios, nombresPuesto, ordenNivelEstudios } from "@/datos/catalogos";
import type { Ciudad, NivelEstudios, Puesto } from "@/datos/tipos";
import { useEstadoDemo } from "@/lib/demo/almacen";
import { puestosDePostulante } from "@/lib/demo/consultas";
import { formatearFecha, nombreCompleto, pluralizar } from "@/lib/formato";

const opcionesPuesto: Record<Puesto | "todos", string> = { todos: "Todos los puestos", ...nombresPuesto };
const opcionesCiudad: Record<Ciudad | "todas", string> = {
  todas: "Todas las ciudades",
  Cochabamba: "Cochabamba",
  "La Paz": "La Paz",
};
const opcionesExperiencia = {
  "0": "Cualquier experiencia",
  "1": "1 año o más",
  "2": "2 años o más",
  "3": "3 años o más",
  "5": "5 años o más",
};
const opcionesEstudios: Record<NivelEstudios | "todos", string> = {
  todos: "Cualquier nivel de estudios",
  secundaria: "Bachiller o más",
  tecnico: "Técnico o más",
  licenciatura: "Licenciatura",
};

export function BasePostulantes() {
  const estado = useEstadoDemo();
  const router = useRouter();
  const [busqueda, setBusqueda] = useState("");
  const [puesto, setPuesto] = useState<Puesto | "todos">("todos");
  const [ciudad, setCiudad] = useState<Ciudad | "todas">("todas");
  const [experiencia, setExperiencia] = useState<keyof typeof opcionesExperiencia>("0");
  const [estudios, setEstudios] = useState<NivelEstudios | "todos">("todos");
  const [seleccion, setSeleccion] = useState<string[]>([]);
  const [dialogoAbierto, setDialogoAbierto] = useState(false);

  const convocatoriaPorId = new Map(estado.convocatorias.map((convocatoria) => [convocatoria.id, convocatoria]));
  const filas = estado.postulantes.map((postulante) => {
    const postulaciones = estado.postulaciones
      .filter((postulacion) => postulacion.idPostulante === postulante.id)
      .sort((a, b) => b.fecha.localeCompare(a.fecha));
    return { postulante, postulaciones, puestos: puestosDePostulante(estado, postulante.id) };
  });
  const conVariasPostulaciones = filas.filter((fila) => fila.postulaciones.length > 1).length;

  const texto = busqueda.trim().toLowerCase();
  const visibles = filas
    .filter((fila) => puesto === "todos" || fila.puestos.includes(puesto))
    .filter((fila) => ciudad === "todas" || fila.postulante.ciudad === ciudad)
    .filter((fila) => fila.postulante.experienciaAnios >= Number(experiencia))
    .filter(
      (fila) =>
        estudios === "todos" || ordenNivelEstudios[fila.postulante.nivelEstudios] >= ordenNivelEstudios[estudios],
    )
    .filter(
      (fila) =>
        texto === "" ||
        nombreCompleto(fila.postulante).toLowerCase().includes(texto) ||
        fila.postulante.carnetIdentidad.toLowerCase().includes(texto) ||
        fila.postulante.habilidades.some((habilidad) => habilidad.toLowerCase().includes(texto)),
    )
    .sort((a, b) => b.postulante.fechaRegistro.localeCompare(a.postulante.fechaRegistro));

  const idsVisibles = visibles.map((fila) => fila.postulante.id);
  const seleccionVisible = seleccion.filter((id) => idsVisibles.includes(id));
  const todosSeleccionados = idsVisibles.length > 0 && seleccionVisible.length === idsVisibles.length;

  function alternarSeleccion(id: string) {
    setSeleccion(seleccion.includes(id) ? seleccion.filter((item) => item !== id) : [...seleccion, id]);
  }

  return (
    <>
      <EncabezadoPagina
        titulo="Base de postulantes"
        descripcion={`${pluralizar(estado.postulantes.length, "persona", "personas")} que alguna vez postularon · ${conVariasPostulaciones} postularon a más de una convocatoria`}
        acciones={
          <Button disabled={seleccionVisible.length === 0} onClick={() => setDialogoAbierto(true)}>
            <Send />
            Invitar a convocatoria{seleccionVisible.length > 0 ? ` (${seleccionVisible.length})` : ""}
          </Button>
        }
      />

      <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-5">
        <div className="relative sm:col-span-2 lg:col-span-1">
          <Search className="pointer-events-none absolute top-1/2 left-2.5 size-4 -translate-y-1/2 text-muted-foreground" />
          <Input
            value={busqueda}
            onChange={(evento) => setBusqueda(evento.target.value)}
            placeholder="Nombre, carnet o habilidad"
            aria-label="Buscar en la base"
            className="pl-8"
          />
        </div>
        <SelectorSimple opciones={opcionesPuesto} valor={puesto} alCambiar={setPuesto} />
        <SelectorSimple opciones={opcionesCiudad} valor={ciudad} alCambiar={setCiudad} />
        <SelectorSimple opciones={opcionesExperiencia} valor={experiencia} alCambiar={setExperiencia} />
        <SelectorSimple opciones={opcionesEstudios} valor={estudios} alCambiar={setEstudios} />
      </div>

      <p className="-mt-2 text-sm text-muted-foreground">
        Mostrando {visibles.length} de {filas.length}
        {seleccionVisible.length > 0 && ` · ${pluralizar(seleccionVisible.length, "seleccionada", "seleccionadas")}`}
      </p>

      <Card className="-mt-2 py-0">
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
              <TableHead>Persona</TableHead>
              <TableHead className="hidden sm:table-cell">Puestos</TableHead>
              <TableHead className="hidden md:table-cell">Experiencia</TableHead>
              <TableHead className="hidden md:table-cell">Estudios</TableHead>
              <TableHead>Última postulación</TableHead>
              <TableHead className="hidden lg:table-cell">En la base desde</TableHead>
              <TableHead className="w-8" />
            </TableRow>
          </TableHeader>
          <TableBody>
            {visibles.length === 0 && (
              <TableRow>
                <TableCell colSpan={8} className="py-10 text-center text-muted-foreground">
                  Nadie en la base coincide con los filtros.
                </TableCell>
              </TableRow>
            )}
            {visibles.map(({ postulante, postulaciones, puestos }) => {
              const ultima = postulaciones[0];
              return (
                <TableRow
                  key={postulante.id}
                  data-state={seleccion.includes(postulante.id) ? "selected" : undefined}
                  className="cursor-pointer"
                  onClick={() => router.push(`/postulantes/${postulante.id}`)}
                >
                  <TableCell className="pl-4" onClick={(evento) => evento.stopPropagation()}>
                    <Checkbox
                      checked={seleccion.includes(postulante.id)}
                      onCheckedChange={() => alternarSeleccion(postulante.id)}
                      aria-label={`Seleccionar a ${nombreCompleto(postulante)}`}
                    />
                  </TableCell>
                  <TableCell>
                    <div className="flex flex-col">
                      <span className="font-medium">{nombreCompleto(postulante)}</span>
                      <span className="text-xs text-muted-foreground">{postulante.ciudad}</span>
                    </div>
                  </TableCell>
                  <TableCell className="hidden sm:table-cell">
                    <div className="flex flex-wrap gap-1">
                      {puestos.map((item) => (
                        <Badge key={item} variant="outline" className="font-normal">
                          {nombresPuesto[item]}
                        </Badge>
                      ))}
                    </div>
                  </TableCell>
                  <TableCell className="hidden md:table-cell">{pluralizar(postulante.experienciaAnios, "año", "años")}</TableCell>
                  <TableCell className="hidden md:table-cell">{nombresNivelEstudios[postulante.nivelEstudios]}</TableCell>
                  <TableCell>
                    {ultima && (
                      <div className="flex flex-col items-start gap-1">
                        <InsigniaEstadoPostulacion estado={ultima.estado} />
                        <span className="max-w-48 truncate text-xs text-muted-foreground">
                          {convocatoriaPorId.get(ultima.idConvocatoria)?.titulo}
                          {postulaciones.length > 1 && ` y ${postulaciones.length - 1} más`}
                        </span>
                      </div>
                    )}
                  </TableCell>
                  <TableCell className="hidden text-muted-foreground lg:table-cell">
                    {formatearFecha(postulante.fechaRegistro)}
                  </TableCell>
                  <TableCell>
                    <ChevronRight className="size-4 text-muted-foreground" />
                  </TableCell>
                </TableRow>
              );
            })}
          </TableBody>
        </Table>
      </Card>

      <DialogoInvitar
        idsPostulantes={seleccionVisible}
        abierto={dialogoAbierto}
        alCambiarAbierto={setDialogoAbierto}
        alInvitar={() => setSeleccion([])}
      />
    </>
  );
}
