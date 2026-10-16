import { Hammer } from "lucide-react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";

// Marcador para las pantallas que todavía no se construyeron. Lista lo que va a
// tener cada una, según el plan de trabajo.
export function SeccionEnPreparacion({ contenido }: { contenido: string[] }) {
  return (
    <Card className="border-dashed">
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Hammer className="size-4 text-muted-foreground" />
          Pantalla en preparación
        </CardTitle>
        <CardDescription>Esto es lo que va a mostrar:</CardDescription>
      </CardHeader>
      <CardContent>
        <ul className="list-disc space-y-1 pl-5 text-sm text-muted-foreground">
          {contenido.map((item) => (
            <li key={item}>{item}</li>
          ))}
        </ul>
      </CardContent>
    </Card>
  );
}
