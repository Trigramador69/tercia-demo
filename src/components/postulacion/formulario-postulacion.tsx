"use client";

import { useState } from "react";
import Link from "next/link";
import { useParams } from "next/navigation";
import {
  ArrowLeft,
  CalendarClock,
  CheckCircle2,
  FileText,
  Loader2,
  MapPin,
  Search,
  Sparkles,
  Upload,
  UserRoundCheck,
} from "lucide-react";
import { SelectorSimple } from "@/components/panel/selector-simple";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Checkbox } from "@/components/ui/checkbox";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  habilidadesPorPuesto,
  nombresNivelEstudios,
  nombresPuesto,
  nombresTurno,
  turnos,
} from "@/datos/catalogos";
import { buscarCurriculumEjemplo } from "@/datos/curriculums";
import type { Ciudad, Convocatoria, ExperienciaLaboral, NivelEstudios, Postulante, Turno } from "@/datos/tipos";
import { normalizarCarnet, registrarPostulacion } from "@/lib/demo/acciones";
import { useEstadoDemo } from "@/lib/demo/almacen";
import { formatearFecha, formatearMesCorto, pluralizar } from "@/lib/formato";
import { cn } from "@/lib/utils";

const nombresCiudad: Record<Ciudad, string> = { Cochabamba: "Cochabamba", "La Paz": "La Paz" };
// Tiempo de la animación de lectura del currículum, para que se note el paso.
const demoraLecturaMs = 1400;

interface Formulario {
  nombres: string;
  apellidos: string;
  carnetIdentidad: string;
  telefono: string;
  correo: string;
  ciudad: Ciudad | "";
  fechaNacimiento: string;
  nivelEstudios: NivelEstudios | "";
  tituloEstudios: string;
  experienciaAnios: string;
  habilidades: string[];
  turnosDisponibles: Turno[];
}

type CampoTexto = Exclude<keyof Formulario, "habilidades" | "turnosDisponibles">;

const formularioVacio: Formulario = {
  nombres: "",
  apellidos: "",
  carnetIdentidad: "",
  telefono: "",
  correo: "",
  ciudad: "",
  fechaNacimiento: "",
  nivelEstudios: "",
  tituloEstudios: "",
  experienciaAnios: "",
  habilidades: [],
  turnosDisponibles: [],
};

function aFormulario(datos: Omit<Postulante, "id" | "fechaRegistro" | "archivoCurriculum">): Formulario {
  return {
    nombres: datos.nombres,
    apellidos: datos.apellidos,
    carnetIdentidad: datos.carnetIdentidad,
    telefono: datos.telefono,
    correo: datos.correo,
    ciudad: datos.ciudad,
    fechaNacimiento: datos.fechaNacimiento,
    nivelEstudios: datos.nivelEstudios,
    tituloEstudios: datos.tituloEstudios,
    experienciaAnios: String(datos.experienciaAnios),
    habilidades: datos.habilidades,
    turnosDisponibles: datos.turnosDisponibles,
  };
}

export function FormularioPostulacion() {
  const { idConvocatoria } = useParams<{ idConvocatoria: string }>();
  const { convocatorias } = useEstadoDemo();
  const convocatoria = convocatorias.find((item) => item.id === idConvocatoria);

  if (!convocatoria || convocatoria.estado !== "abierta") {
    return (
      <div className="flex flex-col items-center gap-3 py-16 text-center">
        <h1 className="font-heading text-xl font-semibold">Esta vacante ya no recibe postulaciones</h1>
        <p className="text-sm text-muted-foreground">Puede revisar las otras vacantes abiertas.</p>
        <Button variant="outline" nativeButton={false} render={<Link href="/postular" />}>
          Ver vacantes abiertas
        </Button>
      </div>
    );
  }

  return <ContenidoPostulacion convocatoria={convocatoria} />;
}

function ContenidoPostulacion({ convocatoria }: { convocatoria: Convocatoria }) {
  const { postulantes } = useEstadoDemo();
  const [formulario, setFormulario] = useState<Formulario>(formularioVacio);
  const [experiencias, setExperiencias] = useState<ExperienciaLaboral[]>([]);
  const [autocompletados, setAutocompletados] = useState<(keyof Formulario)[]>([]);
  const [archivo, setArchivo] = useState<string | null>(null);
  const [lectura, setLectura] = useState<"sin_archivo" | "leyendo" | "reconocido" | "no_reconocido">("sin_archivo");
  const [carnetBuscado, setCarnetBuscado] = useState("");
  const [busqueda, setBusqueda] = useState<"sin_buscar" | "encontrado" | "no_encontrado">("sin_buscar");
  const [fechaPostulacionAnterior, setFechaPostulacionAnterior] = useState<string | null>(null);
  const [consentimiento, setConsentimiento] = useState(false);
  const [intentoEnviar, setIntentoEnviar] = useState(false);
  const [errorEnvio, setErrorEnvio] = useState<string | null>(null);
  const [enviado, setEnviado] = useState<{ nombre: string; telefono: string; correo: string } | null>(null);
  const [arrastrando, setArrastrando] = useState(false);

  const habilidadesOpciones = Array.from(
    new Set([...convocatoria.requisitos.habilidades, ...habilidadesPorPuesto[convocatoria.puesto], ...formulario.habilidades]),
  );

  const correoValido = /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(formulario.correo.trim());
  const errores = {
    nombres: formulario.nombres.trim() === "",
    apellidos: formulario.apellidos.trim() === "",
    carnetIdentidad: formulario.carnetIdentidad.trim() === "",
    telefono: formulario.telefono.trim() === "",
    correo: !correoValido,
    ciudad: formulario.ciudad === "",
    nivelEstudios: formulario.nivelEstudios === "",
    experienciaAnios: formulario.experienciaAnios === "" || Number(formulario.experienciaAnios) < 0,
    turnos: formulario.turnosDisponibles.length === 0,
    archivo: archivo === null,
    consentimiento: !consentimiento,
  };
  const hayErrores = Object.values(errores).some(Boolean);
  const mostrar = (campo: keyof typeof errores) => intentoEnviar && errores[campo];

  function cambiar<Campo extends keyof Formulario>(campo: Campo, valor: Formulario[Campo]) {
    setFormulario((actual) => ({ ...actual, [campo]: valor }));
    setAutocompletados((actuales) => actuales.filter((item) => item !== campo));
    setErrorEnvio(null);
  }

  function completarCon(datos: Formulario, experienciasNuevas: ExperienciaLaboral[]) {
    setFormulario(datos);
    setExperiencias(experienciasNuevas);
    setAutocompletados(
      (Object.keys(datos) as (keyof Formulario)[]).filter((campo) => {
        const valor = datos[campo];
        return Array.isArray(valor) ? valor.length > 0 : valor !== "";
      }),
    );
  }

  function recibirArchivo(lista: FileList | null) {
    const elegido = lista?.[0];
    if (!elegido) return;
    setArchivo(elegido.name);
    setLectura("leyendo");
    setErrorEnvio(null);
    const curriculum = buscarCurriculumEjemplo(elegido.name);
    window.setTimeout(() => {
      if (curriculum) {
        completarCon(aFormulario(curriculum.datos), curriculum.datos.experiencias);
        setLectura("reconocido");
      } else {
        setLectura("no_reconocido");
      }
    }, demoraLecturaMs);
  }

  function buscarPorCarnet() {
    const encontrado = postulantes.find(
      (postulante) => normalizarCarnet(postulante.carnetIdentidad) === normalizarCarnet(carnetBuscado),
    );
    if (!encontrado) {
      setBusqueda("no_encontrado");
      return;
    }
    completarCon(aFormulario(encontrado), encontrado.experiencias);
    setArchivo(encontrado.archivoCurriculum);
    setLectura("sin_archivo");
    setFechaPostulacionAnterior(encontrado.fechaRegistro);
    setBusqueda("encontrado");
  }

  function enviar(evento: React.FormEvent) {
    evento.preventDefault();
    setIntentoEnviar(true);
    if (hayErrores || formulario.ciudad === "" || formulario.nivelEstudios === "" || !archivo) return;
    const resultado = registrarPostulacion(
      {
        nombres: formulario.nombres.trim(),
        apellidos: formulario.apellidos.trim(),
        carnetIdentidad: formulario.carnetIdentidad.trim(),
        telefono: formulario.telefono.trim(),
        correo: formulario.correo.trim(),
        ciudad: formulario.ciudad,
        fechaNacimiento: formulario.fechaNacimiento,
        nivelEstudios: formulario.nivelEstudios,
        tituloEstudios: formulario.tituloEstudios.trim() || nombresNivelEstudios[formulario.nivelEstudios],
        experienciaAnios: Number(formulario.experienciaAnios),
        experiencias,
        habilidades: formulario.habilidades,
        turnosDisponibles: formulario.turnosDisponibles,
        archivoCurriculum: archivo,
      },
      convocatoria.id,
    );
    if (resultado.tipo === "ya_postulo") {
      setErrorEnvio("Ya hay una postulación a esta vacante con este carnet. No hace falta volver a postular.");
      return;
    }
    setEnviado({ nombre: formulario.nombres.trim(), telefono: formulario.telefono.trim(), correo: formulario.correo.trim() });
    window.scrollTo({ top: 0 });
  }

  if (enviado) {
    return (
      <Card className="mx-auto max-w-xl">
        <CardContent className="flex flex-col items-center gap-4 py-8 text-center">
          <span className="flex size-14 items-center justify-center rounded-full bg-exito-suave">
            <CheckCircle2 className="size-7 text-exito" />
          </span>
          <h1 className="font-heading text-2xl font-semibold">¡Gracias, {enviado.nombre}!</h1>
          <p className="text-muted-foreground">
            Recibimos su postulación a <span className="font-medium text-foreground">{convocatoria.titulo}</span>. Si su
            perfil avanza en el proceso, le contactaremos al {enviado.telefono} o a {enviado.correo}.
          </p>
          <p className="text-sm text-muted-foreground">
            Sus datos quedan guardados: para su próxima postulación solo necesitará su carnet.
          </p>
          <Button nativeButton={false} render={<Link href="/postular" />}>
            Ver otras vacantes
          </Button>
        </CardContent>
      </Card>
    );
  }

  const claseAutocompletado = (campo: keyof Formulario) =>
    autocompletados.includes(campo) ? "bg-marca-suave/60 ring-1 ring-primary/30" : undefined;

  function campoTexto(campo: CampoTexto, etiqueta: string, opciones: { tipo?: string; error?: string; className?: string } = {}) {
    return (
      <Campo etiqueta={etiqueta} id={campo} error={opciones.error} className={opciones.className}>
        <Input
          id={campo}
          type={opciones.tipo ?? "text"}
          value={formulario[campo]}
          onChange={(evento) => cambiar(campo, evento.target.value as Formulario[typeof campo])}
          className={claseAutocompletado(campo)}
          aria-invalid={opciones.error ? true : undefined}
        />
      </Campo>
    );
  }

  return (
    <form onSubmit={enviar} noValidate className="flex flex-col gap-6">
      <div>
        <Button variant="ghost" size="sm" className="-ml-2" nativeButton={false} render={<Link href="/postular" />}>
          <ArrowLeft />
          Vacantes abiertas
        </Button>
      </div>

      <div className="flex flex-col gap-2">
        <h1 className="font-heading text-2xl font-semibold tracking-tight">{convocatoria.titulo}</h1>
        <p className="flex flex-wrap items-center gap-x-4 gap-y-1 text-sm text-muted-foreground">
          <span>
            {nombresPuesto[convocatoria.puesto]} · {pluralizar(convocatoria.cantidadPuestos, "puesto", "puestos")}
          </span>
          <span className="flex items-center gap-1">
            <MapPin className="size-3.5" />
            {convocatoria.requisitos.ciudad}
          </span>
          <span className="flex items-center gap-1">
            <CalendarClock className="size-3.5" />
            Hasta el {formatearFecha(convocatoria.fechaCierre)}
          </span>
        </p>
        {convocatoria.descripcion && <p className="text-sm">{convocatoria.descripcion}</p>}
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Su currículum</CardTitle>
          <CardDescription>Súbalo y completamos el formulario con sus datos. Después puede revisarlos.</CardDescription>
        </CardHeader>
        <CardContent className="flex flex-col gap-4">
          <label
            htmlFor="archivo-curriculum"
            onDragOver={(evento) => {
              evento.preventDefault();
              setArrastrando(true);
            }}
            onDragLeave={() => setArrastrando(false)}
            onDrop={(evento) => {
              evento.preventDefault();
              setArrastrando(false);
              recibirArchivo(evento.dataTransfer.files);
            }}
            className={cn(
              "flex cursor-pointer flex-col items-center gap-2 rounded-xl border-2 border-dashed px-4 py-8 text-center transition-colors hover:border-primary/50 hover:bg-muted/40",
              arrastrando && "border-primary bg-marca-suave/40",
              mostrar("archivo") && "border-destructive/60",
            )}
          >
            {lectura === "leyendo" ? (
              <>
                <Loader2 className="size-7 animate-spin text-primary" />
                <span className="font-medium">Leyendo su currículum…</span>
                <span className="text-sm text-muted-foreground">{archivo}</span>
              </>
            ) : archivo ? (
              <>
                <FileText className="size-7 text-primary" />
                <span className="font-medium">{archivo}</span>
                <span className="text-sm text-muted-foreground">Haga clic para cambiar el archivo</span>
              </>
            ) : (
              <>
                <Upload className="size-7 text-muted-foreground" />
                <span className="font-medium">Arrastre su currículum aquí o haga clic para elegirlo</span>
                <span className="text-sm text-muted-foreground">PDF o Word</span>
              </>
            )}
          </label>
          <input
            id="archivo-curriculum"
            type="file"
            accept=".pdf,.doc,.docx"
            className="sr-only"
            onChange={(evento) => {
              recibirArchivo(evento.target.files);
              evento.target.value = "";
            }}
          />
          {mostrar("archivo") && <p className="-mt-2 text-xs text-destructive">Adjunte su currículum.</p>}

          {lectura === "reconocido" && (
            <Aviso icono={Sparkles} tono="exito">
              Completamos el formulario con los datos de su currículum. Revíselos antes de enviar; los campos completados
              están resaltados.
            </Aviso>
          )}
          {lectura === "no_reconocido" && (
            <Aviso icono={FileText} tono="neutro">
              Adjuntamos su currículum. No pudimos leer sus datos automáticamente, complete el formulario a continuación.
            </Aviso>
          )}
          {busqueda === "encontrado" && (
            <Aviso icono={UserRoundCheck} tono="exito">
              Encontramos sus datos de una postulación anterior
              {fechaPostulacionAnterior ? ` (${formatearFecha(fechaPostulacionAnterior)})` : ""}, con su currículum
              guardado. Revíselos y actualice lo que haya cambiado.
            </Aviso>
          )}

          <div className="flex flex-col gap-2 rounded-lg bg-muted/50 p-3">
            <Label htmlFor="carnet-anterior" className="text-sm">
              ¿Ya postuló antes con nosotros? Use sus datos guardados.
            </Label>
            <div className="flex max-w-md gap-2">
              <Input
                id="carnet-anterior"
                value={carnetBuscado}
                onChange={(evento) => {
                  setCarnetBuscado(evento.target.value);
                  setBusqueda("sin_buscar");
                }}
                onKeyDown={(evento) => {
                  if (evento.key === "Enter") {
                    evento.preventDefault();
                    buscarPorCarnet();
                  }
                }}
                placeholder="Número de carnet"
                className="bg-background"
              />
              <Button type="button" variant="outline" onClick={buscarPorCarnet} disabled={carnetBuscado.trim() === ""}>
                <Search />
                Buscar
              </Button>
            </div>
            {busqueda === "no_encontrado" && (
              <p className="text-xs text-muted-foreground">
                No encontramos postulaciones con ese carnet. Puede subir su currículum o completar el formulario.
              </p>
            )}
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Sus datos</CardTitle>
        </CardHeader>
        <CardContent className="grid gap-4 sm:grid-cols-2">
          {campoTexto("nombres", "Nombres", { error: mostrar("nombres") ? "Escriba sus nombres." : undefined })}
          {campoTexto("apellidos", "Apellidos", { error: mostrar("apellidos") ? "Escriba sus apellidos." : undefined })}
          {campoTexto("carnetIdentidad", "Carnet de identidad", {
            error: mostrar("carnetIdentidad") ? "Escriba su número de carnet." : undefined,
          })}
          {campoTexto("fechaNacimiento", "Fecha de nacimiento", { tipo: "date" })}
          {campoTexto("telefono", "Celular", { tipo: "tel", error: mostrar("telefono") ? "Escriba un número de contacto." : undefined })}
          {campoTexto("correo", "Correo electrónico", {
            tipo: "email",
            error: mostrar("correo") ? "Escriba un correo válido." : undefined,
          })}
          <Campo etiqueta="Ciudad donde vive" id="ciudad" error={mostrar("ciudad") ? "Elija su ciudad." : undefined}>
            <SelectorSimple
              id="ciudad"
              opciones={nombresCiudad}
              valor={formulario.ciudad}
              alCambiar={(valor) => cambiar("ciudad", valor)}
              textoVacio="Elija su ciudad"
              className={claseAutocompletado("ciudad")}
              invalido={mostrar("ciudad")}
            />
          </Campo>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Formación y experiencia</CardTitle>
        </CardHeader>
        <CardContent className="flex flex-col gap-4">
          <div className="grid gap-4 sm:grid-cols-3">
            <Campo etiqueta="Nivel de estudios" id="nivel" error={mostrar("nivelEstudios") ? "Elija su nivel de estudios." : undefined}>
              <SelectorSimple
                id="nivel"
                opciones={nombresNivelEstudios}
                valor={formulario.nivelEstudios}
                alCambiar={(valor) => cambiar("nivelEstudios", valor)}
                textoVacio="Elija un nivel"
                className={claseAutocompletado("nivelEstudios")}
                invalido={mostrar("nivelEstudios")}
              />
            </Campo>
            {campoTexto("tituloEstudios", "Título obtenido")}
            {campoTexto("experienciaAnios", "Años de experiencia", {
              tipo: "number",
              error: mostrar("experienciaAnios") ? "Indique sus años de experiencia (0 si no tiene)." : undefined,
            })}
          </div>
          {experiencias.length > 0 && (
            <div className="flex flex-col gap-2">
              <span className="text-sm font-medium">Experiencia que figura en su currículum</span>
              <ul className="flex flex-col divide-y rounded-lg border">
                {experiencias.map((experiencia) => (
                  <li
                    key={`${experiencia.empresa}-${experiencia.desde}`}
                    className="flex flex-col gap-0.5 px-3 py-2 text-sm sm:flex-row sm:justify-between"
                  >
                    <span>
                      <span className="font-medium">{experiencia.cargo}</span>
                      <span className="text-muted-foreground"> · {experiencia.empresa}</span>
                    </span>
                    <span className="text-muted-foreground tabular-nums">
                      {formatearMesCorto(experiencia.desde)} a {experiencia.hasta ? formatearMesCorto(experiencia.hasta) : "la fecha"}
                    </span>
                  </li>
                ))}
              </ul>
            </div>
          )}
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Disponibilidad y habilidades</CardTitle>
        </CardHeader>
        <CardContent className="flex flex-col gap-5">
          <fieldset className="flex flex-col gap-2">
            <legend className="mb-2 text-sm font-medium">¿En qué turnos puede trabajar?</legend>
            <div className={cn("flex flex-wrap gap-x-6 gap-y-2 rounded-lg", claseAutocompletado("turnosDisponibles") && "bg-marca-suave/60 p-2")}>
              {turnos.map((turno) => (
                <label key={turno} className="flex items-center gap-2 text-sm">
                  <Checkbox
                    checked={formulario.turnosDisponibles.includes(turno)}
                    onCheckedChange={() =>
                      cambiar(
                        "turnosDisponibles",
                        formulario.turnosDisponibles.includes(turno)
                          ? formulario.turnosDisponibles.filter((item) => item !== turno)
                          : [...formulario.turnosDisponibles, turno],
                      )
                    }
                  />
                  {nombresTurno[turno]}
                </label>
              ))}
            </div>
            {mostrar("turnos") && <p className="text-xs text-destructive">Elija al menos un turno.</p>}
          </fieldset>
          <fieldset className="flex flex-col gap-2">
            <legend className="mb-2 text-sm font-medium">Habilidades</legend>
            <div className={cn("grid gap-2 rounded-lg sm:grid-cols-2", claseAutocompletado("habilidades") && "bg-marca-suave/60 p-2")}>
              {habilidadesOpciones.map((habilidad) => (
                <label key={habilidad} className="flex items-center gap-2 text-sm">
                  <Checkbox
                    checked={formulario.habilidades.includes(habilidad)}
                    onCheckedChange={() =>
                      cambiar(
                        "habilidades",
                        formulario.habilidades.includes(habilidad)
                          ? formulario.habilidades.filter((item) => item !== habilidad)
                          : [...formulario.habilidades, habilidad],
                      )
                    }
                  />
                  {habilidad}
                </label>
              ))}
            </div>
          </fieldset>
        </CardContent>
      </Card>

      <div className="flex flex-col gap-4">
        <label className="flex items-start gap-2 text-sm">
          <Checkbox checked={consentimiento} onCheckedChange={(valor) => setConsentimiento(valor === true)} className="mt-0.5" />
          <span>
            Autorizo que se guarden mis datos y mi currículum para este y otros procesos de selección.
            {mostrar("consentimiento") && <span className="block text-xs text-destructive">Necesitamos su autorización para continuar.</span>}
          </span>
        </label>
        {errorEnvio && <p className="text-sm text-destructive">{errorEnvio}</p>}
        {intentoEnviar && hayErrores && <p className="text-sm text-destructive">Revise los campos marcados.</p>}
        <Button type="submit" size="lg" className="sm:w-fit sm:px-8" disabled={lectura === "leyendo"}>
          Enviar postulación
        </Button>
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
    <div className={cn("flex flex-col gap-2", className)}>
      <Label htmlFor={id}>{etiqueta}</Label>
      {children}
      {error && <p className="text-xs text-destructive">{error}</p>}
    </div>
  );
}

function Aviso({
  icono: Icono,
  tono,
  children,
}: {
  icono: typeof Sparkles;
  tono: "exito" | "neutro";
  children: React.ReactNode;
}) {
  return (
    <div
      role="status"
      className={cn(
        "flex items-start gap-2.5 rounded-lg px-3 py-2.5 text-sm",
        tono === "exito" ? "bg-exito-suave text-foreground" : "bg-muted text-foreground",
      )}
    >
      <Icono className={cn("mt-0.5 size-4 shrink-0", tono === "exito" ? "text-exito" : "text-muted-foreground")} />
      <span>{children}</span>
    </div>
  );
}
