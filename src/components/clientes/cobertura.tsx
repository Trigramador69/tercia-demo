import { Badge } from "@/components/ui/badge";
import { cn } from "@/lib/utils";

export function porcentajeCobertura(asignados: number, requeridos: number) {
  return requeridos === 0 ? 100 : Math.round((asignados / requeridos) * 100);
}

// Barra de personas asignadas frente a las que pide el cliente.
export function BarraCobertura({
  asignados,
  requeridos,
  className,
}: {
  asignados: number;
  requeridos: number;
  className?: string;
}) {
  const porcentaje = porcentajeCobertura(asignados, requeridos);
  const completo = asignados >= requeridos;
  return (
    <div className={cn("flex items-center gap-3", className)}>
      <div className="h-2 flex-1 overflow-hidden rounded-full bg-muted">
        <div
          className={cn("h-full rounded-full", completo ? "bg-exito" : "bg-advertencia")}
          style={{ width: `${Math.min(100, porcentaje)}%` }}
        />
      </div>
      <span className="text-sm font-medium tabular-nums">
        {asignados}/{requeridos}
      </span>
    </div>
  );
}

export function InsigniaFaltantes({ faltan }: { faltan: number }) {
  return faltan > 0 ? (
    <Badge className="bg-advertencia-suave text-advertencia">{faltan === 1 ? "Falta 1" : `Faltan ${faltan}`}</Badge>
  ) : (
    <Badge className="bg-exito-suave text-exito">Cubierta</Badge>
  );
}
