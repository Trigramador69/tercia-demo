"use client";

import { usePathname } from "next/navigation";
import { ShieldAlert } from "lucide-react";
import { BarraLateral } from "@/components/panel/barra-lateral";
import { SelectorRol, cambiarRol } from "@/components/panel/selector-rol";
import { Button } from "@/components/ui/button";
import { SidebarInset, SidebarProvider, SidebarTrigger } from "@/components/ui/sidebar";
import { nombresRol } from "@/datos/catalogos";
import type { Rol } from "@/datos/tipos";
import { useEstadoDemo } from "@/lib/demo/almacen";
import { puedeVerRuta, seccionDeRuta } from "@/lib/navegacion";

export function MarcoPanel({ children }: { children: React.ReactNode }) {
  const ruta = usePathname();
  const { rol } = useEstadoDemo();
  const seccion = seccionDeRuta(ruta);

  return (
    <SidebarProvider>
      <BarraLateral />
      <SidebarInset>
        <header className="sticky top-0 z-10 flex h-14 shrink-0 items-center gap-2 border-b bg-background/95 px-4 backdrop-blur supports-backdrop-filter:bg-background/80">
          <SidebarTrigger className="-ml-1" />
          <span aria-hidden="true" className="mr-1 h-4 w-px bg-border" />
          <span className="truncate text-sm font-medium">{seccion?.titulo ?? "Tercia"}</span>
          <div className="ml-auto">
            <SelectorRol />
          </div>
        </header>
        <main className="flex flex-1 flex-col gap-6 p-4 md:p-6 lg:p-8">
          {puedeVerRuta(rol, ruta) ? children : <AccesoRestringido rolNecesario={seccion?.roles[0]} />}
        </main>
      </SidebarInset>
    </SidebarProvider>
  );
}

function AccesoRestringido({ rolNecesario }: { rolNecesario?: Rol }) {
  return (
    <div className="mx-auto flex max-w-md flex-col items-center gap-3 py-16 text-center">
      <span className="flex size-12 items-center justify-center rounded-full bg-muted">
        <ShieldAlert className="size-6 text-muted-foreground" />
      </span>
      <h1 className="font-heading text-lg font-semibold">Esta sección no está disponible para su rol</h1>
      <p className="text-sm text-muted-foreground">
        {rolNecesario
          ? `La ve el rol ${nombresRol[rolNecesario]}. Puede cambiar de rol para recorrerla.`
          : "Cambie de rol para recorrerla."}
      </p>
      {rolNecesario && (
        <Button variant="outline" onClick={() => cambiarRol(rolNecesario)}>
          Ver como {nombresRol[rolNecesario]}
        </Button>
      )}
    </div>
  );
}
