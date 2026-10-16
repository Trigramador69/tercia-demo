"use client";

import { useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { ArrowLeft, Plus, Sparkles } from "lucide-react";
import { toast } from "sonner";
import { EncabezadoPagina } from "@/components/panel/encabezado-pagina";
import { SelectorSimple } from "@/components/panel/selector-simple";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Checkbox } from "@/components/ui/checkbox";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import {
  habilidadesPorPuesto,
  nombresNivelEstudios,
  nombresPuesto,
  nombresTurno,
  turnos,
  umbralCumplimientoPorDefecto,
} from "@/datos/catalogos";
import { sumarDias } from "@/datos/fechas";
import type { Ciudad, NivelEstudios, Puesto, RequisitosConvocatoria, Turno } from "@/datos/tipos";
import { crearConvocatoria } from "@/lib/demo/acciones";
import { useEstadoDemo } from "@/lib/demo/almacen";
import { coincidenciasEnLaBase } from "@/lib/demo/consultas";
import { fechaDeHoy, nombreCompleto } from "@/lib/formato";

const sinCliente = "interno";
const variasSucursales = "varias";

const nombresCiudad: Record<Ciudad, string> = { Cochabamba: "Cochabamba", "La Paz": "La Paz" };

export function FormularioConvocatoria() {
  const estado = useEstadoDemo();
  const router = useRouter();

  const [titulo, setTitulo] = useState("");
  const [puesto, setPuesto] = useState<Puesto | "">("");
  const [descripcion, setDescripcion] = useState("");
  const [idCliente, setIdCliente] = useState<string>(sinCliente);
  const [idSucursal, setIdSucursal] = useState<string>(variasSucursales);
  const [cantidadPuestos, setCantidadPuestos] = useState("1");
  const [experienciaMinima, setExperienciaMinima] = useState("1");
  const [nivelEstudios, setNivelEstudios] = useState<NivelEstudios>("secundaria");
  const [ciudad, setCiudad] = useState<Ciudad>("Cochabamba");
  const [turnosElegidos, setTurnosElegidos] = useState<Turno[]>([]);
  const [habilidades, setHabilidades] = useState<string[]>([]);
  const [habilidadNueva, setHabilidadNueva] = useState("");
  const [fechaCierre, setFechaCierre] = useState(sumarDias(fechaDeHoy(), 21));
  const [intentoEnviar, setIntentoEnviar] = useState(false);

  const opcionesCliente: Record<string, string> = { [sinCliente]: "Uso interno (sin cliente)" };
  for (const cliente of estado.clientes.filter((item) => item.estado === "activo")) {
    opcionesCliente[cliente.id] = cliente.nombre;
  }
  const sucursalesDelCliente = estado.sucursales.filter((sucursal) => sucursal.idCliente === idCliente);
  const opcionesSucursal: Record<string, string> = { [variasSucursales]: "Varias sucursales" };
  for (const sucursal of sucursalesDelCliente) opcionesSucursal[sucursal.id] = `${sucursal.nombre} (${sucursal.ciudad})`;

  const habilidadesSugeridas = puesto ? habilidadesPorPuesto[puesto] : [];
  const habilidadesVisibles = Array.from(new Set([...habilidadesSugeridas, ...habilidades]));

  const errores = {
    titulo: titulo.trim() === "",
    puesto: puesto === "",
    turnos: turnosElegidos.length === 0,
    cantidad: !(Number(cantidadPuestos) >= 1),
  };
  const hayErrores = Object.values(errores).some(Boolean);

  const requisitos: RequisitosConvocatoria = {
    experienciaMinimaAnios: Math.max(0, Number(experienciaMinima) || 0),
    nivelEstudiosMinimo: nivelEstudios,
    ciudad,
    turnos: turnosElegidos,
    habilidades,
  };
  const coincidencias = puesto
    ? coincidenciasEnLaBase(estado, puesto, requisitos, umbralCumplimientoPorDefecto)
    : [];

  function elegirPuesto(nuevo: Puesto) {
    setPuesto(nuevo);
    setHabilidades([]);
    if (titulo.trim() === "") setTitulo(nombresPuesto[nuevo]);
  }

  function elegirCliente(nuevo: string) {
    setIdCliente(nuevo);
    setIdSucursal(variasSucursales);
  }

  function elegirSucursal(nuevo: string) {
    setIdSucursal(nuevo);
    const sucursal = estado.sucursales.find((item) => item.id === nuevo);
    if (sucursal) setCiudad(sucursal.ciudad);
  }

  function alternar<T>(lista: T[], valor: T) {
    return lista.includes(valor) ? lista.filter((item) => item !== valor) : [...lista, valor];
  }

  function agregarHabilidad() {
    const limpia = habilidadNueva.trim();
    if (limpia === "") return;
    if (!habilidades.includes(limpia)) setHabilidades([...habilidades, limpia]);
    setHabilidadNueva("");
  }

  function publicar(evento: React.FormEvent) {
    evento.preventDefault();
    setIntentoEnviar(true);
    if (hayErrores || puesto === "") return;
    const convocatoria = crearConvocatoria({
      titulo: titulo.trim(),
      puesto,
      descripcion: descripcion.trim(),
      idCliente: idCliente === sinCliente ? null : idCliente,
      idSucursal: idSucursal === variasSucursales ? null : idSucursal,
      cantidadPuestos: Number(cantidadPuestos),
      requisitos,
      fechaPublicacion: fechaDeHoy(),
      fechaCierre,
    });
    toast.success("Convocatoria publicada.", { description: "Ya aparece en la página de postulación." });
    router.push(`/convocatorias/${convocatoria.id}`);
  }

  return (
    <form onSubmit={publicar} className="flex flex-col gap-6" noValidate>
      <div>
        <Button variant="ghost" size="sm" className="-ml-2" render={<Link href="/convocatorias" />}>
          <ArrowLeft />
          Convocatorias
        </Button>
      </div>
      <EncabezadoPagina
        titulo="Nueva convocatoria"
        descripcion="Defina el puesto, los requisitos y a dónde va la persona contratada."
      />

      <div className="grid items-start gap-6 lg:grid-cols-[1fr_20rem]">
        <div className="flex flex-col gap-6">
          <Card>
            <CardHeader>
              <CardTitle>Puesto</CardTitle>
            </CardHeader>
            <CardContent className="grid gap-4 sm:grid-cols-2">
              <Campo etiqueta="Puesto" id="puesto" error={intentoEnviar && errores.puesto ? "Elija un puesto." : undefined}>
                <SelectorSimple
                  id="puesto"
                  opciones={nombresPuesto}
                  valor={puesto}
                  alCambiar={elegirPuesto}
                  textoVacio="Elija un puesto"
                  invalido={intentoEnviar && errores.puesto}
                />
              </Campo>
              <Campo etiqueta="Título de la convocatoria" id="titulo" error={intentoEnviar && errores.titulo ? "Escriba un título." : undefined}>
                <Input
                  id="titulo"
                  value={titulo}
                  onChange={(evento) => setTitulo(evento.target.value)}
                  placeholder="Por ejemplo: Recepcionista para clínica"
                  aria-invalid={(intentoEnviar && errores.titulo) || undefined}
                />
              </Campo>
              <Campo etiqueta="Descripción" id="descripcion" className="sm:col-span-2">
                <Textarea
                  id="descripcion"
                  value={descripcion}
                  onChange={(evento) => setDescripcion(evento.target.value)}
                  placeholder="Tareas principales y condiciones del puesto"
                  rows={3}
                />
              </Campo>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Destino</CardTitle>
              <CardDescription>Cliente y sucursal donde va a trabajar la persona.</CardDescription>
            </CardHeader>
            <CardContent className="grid gap-4 sm:grid-cols-3">
              <Campo etiqueta="Cliente" id="cliente">
                <SelectorSimple id="cliente" opciones={opcionesCliente} valor={idCliente} alCambiar={elegirCliente} />
              </Campo>
              <Campo etiqueta="Sucursal" id="sucursal">
                <SelectorSimple id="sucursal" opciones={opcionesSucursal} valor={idSucursal} alCambiar={elegirSucursal} />
              </Campo>
              <Campo etiqueta="Cantidad de puestos" id="cantidad" error={intentoEnviar && errores.cantidad ? "Al menos 1." : undefined}>
                <Input
                  id="cantidad"
                  type="number"
                  min={1}
                  value={cantidadPuestos}
                  onChange={(evento) => setCantidadPuestos(evento.target.value)}
                  aria-invalid={(intentoEnviar && errores.cantidad) || undefined}
                />
              </Campo>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Requisitos</CardTitle>
              <CardDescription>
                Cada requisito cuenta para el porcentaje de cumplimiento; cada habilidad cuenta por separado.
              </CardDescription>
            </CardHeader>
            <CardContent className="flex flex-col gap-5">
              <div className="grid gap-4 sm:grid-cols-3">
                <Campo etiqueta="Experiencia mínima (años)" id="experiencia">
                  <Input
                    id="experiencia"
                    type="number"
                    min={0}
                    value={experienciaMinima}
                    onChange={(evento) => setExperienciaMinima(evento.target.value)}
                  />
                </Campo>
                <Campo etiqueta="Estudios mínimos" id="estudios">
                  <SelectorSimple id="estudios" opciones={nombresNivelEstudios} valor={nivelEstudios} alCambiar={setNivelEstudios} />
                </Campo>
                <Campo etiqueta="Ciudad" id="ciudad">
                  <SelectorSimple id="ciudad" opciones={nombresCiudad} valor={ciudad} alCambiar={setCiudad} />
                </Campo>
              </div>

              <fieldset className="flex flex-col gap-2">
                <legend className="mb-2 text-sm font-medium">Disponibilidad de turno</legend>
                <div className="flex flex-wrap gap-x-6 gap-y-2">
                  {turnos.map((turno) => (
                    <label key={turno} className="flex items-center gap-2 text-sm">
                      <Checkbox
                        checked={turnosElegidos.includes(turno)}
                        onCheckedChange={() => setTurnosElegidos(alternar(turnosElegidos, turno))}
                      />
                      {nombresTurno[turno]}
                    </label>
                  ))}
                </div>
                {intentoEnviar && errores.turnos && <p className="text-xs text-destructive">Elija al menos un turno.</p>}
              </fieldset>

              <fieldset className="flex flex-col gap-2">
                <legend className="mb-2 text-sm font-medium">Habilidades</legend>
                {habilidadesVisibles.length === 0 && (
                  <p className="text-sm text-muted-foreground">Elija un puesto para ver las habilidades sugeridas.</p>
                )}
                <div className="grid gap-2 sm:grid-cols-2">
                  {habilidadesVisibles.map((habilidad) => (
                    <label key={habilidad} className="flex items-center gap-2 text-sm">
                      <Checkbox
                        checked={habilidades.includes(habilidad)}
                        onCheckedChange={() => setHabilidades(alternar(habilidades, habilidad))}
                      />
                      {habilidad}
                    </label>
                  ))}
                </div>
                <div className="mt-1 flex max-w-sm gap-2">
                  <Input
                    value={habilidadNueva}
                    onChange={(evento) => setHabilidadNueva(evento.target.value)}
                    onKeyDown={(evento) => {
                      if (evento.key === "Enter") {
                        evento.preventDefault();
                        agregarHabilidad();
                      }
                    }}
                    placeholder="Otra habilidad"
                    aria-label="Otra habilidad"
                  />
                  <Button type="button" variant="outline" onClick={agregarHabilidad}>
                    <Plus />
                    Agregar
                  </Button>
                </div>
              </fieldset>
            </CardContent>
          </Card>
        </div>

        <div className="flex flex-col gap-4 lg:sticky lg:top-20">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Sparkles className="size-4 text-primary" />
                Ya en su base
              </CardTitle>
              <CardDescription>
                Personas que postularon antes a este puesto o tienen alguna de las habilidades pedidas, y cumplen al
                menos el {umbralCumplimientoPorDefecto}% de estos requisitos.
              </CardDescription>
            </CardHeader>
            <CardContent className="flex flex-col gap-3">
              {puesto === "" ? (
                <p className="text-sm text-muted-foreground">Elija un puesto para buscar coincidencias.</p>
              ) : (
                <>
                  <p className="font-heading text-3xl font-semibold tabular-nums">{coincidencias.length}</p>
                  <ul className="flex flex-col gap-1 text-sm">
                    {coincidencias.slice(0, 4).map(({ postulante, cumplimiento }) => (
                      <li key={postulante.id} className="flex justify-between gap-2">
                        <span className="truncate">{nombreCompleto(postulante)}</span>
                        <span className="tabular-nums text-muted-foreground">{cumplimiento}%</span>
                      </li>
                    ))}
                  </ul>
                  {coincidencias.length > 0 && (
                    <p className="text-xs text-muted-foreground">Al publicar, puede invitarlas desde la convocatoria.</p>
                  )}
                </>
              )}
            </CardContent>
          </Card>

          <Card>
            <CardContent className="flex flex-col gap-4">
              <Campo etiqueta="Recibe postulaciones hasta" id="cierre">
                <Input id="cierre" type="date" value={fechaCierre} onChange={(evento) => setFechaCierre(evento.target.value)} />
              </Campo>
              <Button type="submit" className="w-full">
                Publicar convocatoria
              </Button>
              {intentoEnviar && hayErrores && (
                <p className="text-center text-xs text-destructive">Revise los campos marcados.</p>
              )}
            </CardContent>
          </Card>
        </div>
      </div>
    </form>
  );
}

function Campo({
  etiqueta,
  id,
  error,
  className,
  children,
}: {
  etiqueta: string;
  id: string;
  error?: string;
  className?: string;
  children: React.ReactNode;
}) {
  return (
    <div className={`flex flex-col gap-2 ${className ?? ""}`}>
      <Label htmlFor={id}>{etiqueta}</Label>
      {children}
      {error && <p className="text-xs text-destructive">{error}</p>}
    </div>
  );
}
