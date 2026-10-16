import { Badge } from "@/components/ui/badge";
import { nombresEstadoPostulacion } from "@/datos/catalogos";
import type { EstadoConvocatoria, EstadoPostulacion } from "@/datos/tipos";
import { cn } from "@/lib/utils";

const clasesPorEstadoPostulacion: Record<EstadoPostulacion, string> = {
  nuevo: "bg-marca-suave text-primary",
  preseleccionado: "bg-accent text-accent-foreground ring-1 ring-primary/30",
  entrevista: "bg-advertencia-suave text-advertencia",
  contratado: "bg-exito-suave text-exito",
  descartado: "bg-muted text-muted-foreground",
};

export function InsigniaEstadoPostulacion({ estado }: { estado: EstadoPostulacion }) {
  return <Badge className={clasesPorEstadoPostulacion[estado]}>{nombresEstadoPostulacion[estado]}</Badge>;
}

export function InsigniaEstadoConvocatoria({ estado }: { estado: EstadoConvocatoria }) {
  return estado === "abierta" ? (
    <Badge className="bg-exito-suave text-exito">Abierta</Badge>
  ) : (
    <Badge variant="secondary">Cerrada</Badge>
  );
}

// Barra corta con el porcentaje de requisitos que cumple la persona. Verde si
// llega al umbral, ámbar si está cerca, gris si está lejos.
export function IndicadorCumplimiento({
  valor,
  umbral,
  className,
}: {
  valor: number;
  umbral: number;
  className?: string;
}) {
  let color = "bg-muted-foreground/40";
  let colorTexto = "text-muted-foreground";
  if (valor >= umbral) {
    color = "bg-exito";
    colorTexto = "text-exito";
  } else if (valor >= umbral - 20) {
    color = "bg-advertencia";
    colorTexto = "text-advertencia";
  }
  return (
    <span className={cn("flex items-center gap-2", className)}>
      <span className="h-1.5 w-16 overflow-hidden rounded-full bg-muted">
        <span className={cn("block h-full rounded-full", color)} style={{ width: `${valor}%` }} />
      </span>
      <span className={cn("w-9 text-right text-sm font-medium tabular-nums", colorTexto)}>{valor}%</span>
    </span>
  );
}
