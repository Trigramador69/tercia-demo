import { Star, StarHalf } from "lucide-react";
import { cn } from "@/lib/utils";

// Calificación de 1 a 5 estrellas, redondeada a la media estrella.
export function Estrellas({ valor, className }: { valor: number; className?: string }) {
  const redondeado = Math.round(valor * 2) / 2;
  return (
    <span className={cn("inline-flex items-center gap-0.5", className)} role="img" aria-label={`${valor.toFixed(1)} de 5 estrellas`}>
      {[1, 2, 3, 4, 5].map((posicion) => {
        if (redondeado >= posicion) return <Star key={posicion} className="size-4 fill-advertencia text-advertencia" />;
        if (redondeado >= posicion - 0.5) {
          return (
            <span key={posicion} className="relative size-4">
              <Star className="absolute inset-0 size-4 text-muted-foreground/30" />
              <StarHalf className="absolute inset-0 size-4 fill-advertencia text-advertencia" />
            </span>
          );
        }
        return <Star key={posicion} className="size-4 text-muted-foreground/30" />;
      })}
    </span>
  );
}

export function SelectorEstrellas({ valor, alCambiar }: { valor: number; alCambiar: (valor: number) => void }) {
  return (
    <div className="flex items-center gap-1" role="radiogroup" aria-label="Calificación">
      {[1, 2, 3, 4, 5].map((posicion) => (
        <button
          key={posicion}
          type="button"
          role="radio"
          aria-checked={valor === posicion}
          aria-label={`${posicion} ${posicion === 1 ? "estrella" : "estrellas"}`}
          onClick={() => alCambiar(posicion)}
          className="rounded-md p-0.5 outline-none focus-visible:ring-2 focus-visible:ring-ring"
        >
          <Star
            className={cn(
              "size-7 transition-colors",
              posicion <= valor ? "fill-advertencia text-advertencia" : "text-muted-foreground/40 hover:text-advertencia",
            )}
          />
        </button>
      ))}
    </div>
  );
}
