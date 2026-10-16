import { FileText, Mail, MapPin, Phone } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent } from "@/components/ui/card";
import { nombresNivelEstudios, nombresTurno } from "@/datos/catalogos";
import type { Postulante } from "@/datos/tipos";
import { calcularEdad, formatearMesCorto, nombreCompleto, pluralizar } from "@/lib/formato";

// El currículum de la persona tal como quedó en la base, con el formato de una
// hoja. Son los datos que se cargaron al postular (o que se leyeron del archivo).
export function VistaCurriculum({ postulante }: { postulante: Postulante }) {
  return (
    <Card className="mx-auto w-full max-w-3xl">
      <CardContent className="flex flex-col gap-6 sm:px-10 sm:py-4">
        <div className="flex items-center gap-2 text-xs text-muted-foreground">
          <FileText className="size-3.5" />
          {postulante.archivoCurriculum}
        </div>

        <header className="flex flex-col gap-2 border-b pb-5">
          <h2 className="font-heading text-2xl font-semibold tracking-tight">{nombreCompleto(postulante)}</h2>
          <p className="text-sm text-muted-foreground">
            {postulante.tituloEstudios} · {calcularEdad(postulante.fechaNacimiento)} años
          </p>
          <div className="flex flex-wrap gap-x-5 gap-y-1 text-sm">
            <span className="flex items-center gap-1.5">
              <MapPin className="size-3.5 text-muted-foreground" />
              {postulante.ciudad}
            </span>
            <span className="flex items-center gap-1.5">
              <Phone className="size-3.5 text-muted-foreground" />
              {postulante.telefono}
            </span>
            <span className="flex items-center gap-1.5">
              <Mail className="size-3.5 text-muted-foreground" />
              {postulante.correo}
            </span>
          </div>
        </header>

        <Seccion titulo="Experiencia laboral">
          {postulante.experiencias.length === 0 ? (
            <p className="text-sm text-muted-foreground">Sin experiencia laboral registrada.</p>
          ) : (
            <ul className="flex flex-col gap-3">
              {postulante.experiencias.map((experiencia) => (
                <li key={`${experiencia.empresa}-${experiencia.desde}`} className="flex flex-col gap-0.5 sm:flex-row sm:justify-between sm:gap-4">
                  <span>
                    <span className="font-medium">{experiencia.cargo}</span>
                    <span className="text-muted-foreground"> · {experiencia.empresa}</span>
                  </span>
                  <span className="shrink-0 text-sm text-muted-foreground tabular-nums">
                    {formatearMesCorto(experiencia.desde)} a {experiencia.hasta ? formatearMesCorto(experiencia.hasta) : "la fecha"}
                  </span>
                </li>
              ))}
            </ul>
          )}
          <p className="text-sm text-muted-foreground">
            Total: {pluralizar(postulante.experienciaAnios, "año", "años")} de experiencia.
          </p>
        </Seccion>

        <Seccion titulo="Formación">
          <p>
            <span className="font-medium">{postulante.tituloEstudios}</span>
            <span className="text-muted-foreground"> · {nombresNivelEstudios[postulante.nivelEstudios]}</span>
          </p>
        </Seccion>

        <Seccion titulo="Habilidades">
          <div className="flex flex-wrap gap-1.5">
            {postulante.habilidades.length === 0 && <span className="text-sm text-muted-foreground">No indica.</span>}
            {postulante.habilidades.map((habilidad) => (
              <Badge key={habilidad} variant="secondary" className="font-normal">
                {habilidad}
              </Badge>
            ))}
          </div>
        </Seccion>

        <Seccion titulo="Disponibilidad">
          <p>{postulante.turnosDisponibles.map((turno) => nombresTurno[turno]).join(", ") || "No indica."}</p>
        </Seccion>
      </CardContent>
    </Card>
  );
}

function Seccion({ titulo, children }: { titulo: string; children: React.ReactNode }) {
  return (
    <section className="flex flex-col gap-2.5">
      <h3 className="text-xs font-semibold tracking-wider text-primary uppercase">{titulo}</h3>
      {children}
    </section>
  );
}
