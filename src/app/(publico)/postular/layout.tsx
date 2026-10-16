import { Suspense } from "react";
import { IsotipoTercia } from "@/components/marca/logo-tercia";
import { PuertaNavegador } from "@/components/demo/puerta-navegador";
import { EsqueletoContenido } from "@/components/panel/esqueleto-panel";
import { empresa } from "@/datos/catalogos";

// Lo que ve el postulante: la página de empleos de la empresa, fuera del panel.
export default function LayoutPostulacion({ children }: LayoutProps<"/postular">) {
  return (
    <div className="flex min-h-svh flex-col bg-muted/40">
      <header className="border-b bg-background">
        <div className="mx-auto flex h-16 max-w-4xl items-center justify-between px-4">
          <div className="flex flex-col leading-tight">
            <span className="font-heading text-lg font-semibold">{empresa.nombre}</span>
            <span className="text-xs text-muted-foreground">Trabaje con nosotros</span>
          </div>
          <span className="text-xs text-muted-foreground">
            {empresa.oficinas.map((oficina) => oficina.ciudad).join(" · ")}
          </span>
        </div>
      </header>
      <main className="mx-auto w-full max-w-4xl flex-1 px-4 py-8">
        <Suspense fallback={<EsqueletoContenido />}>
          <PuertaNavegador>{children}</PuertaNavegador>
        </Suspense>
      </main>
      <footer className="flex items-center justify-center gap-2 py-6 text-xs text-muted-foreground">
        <IsotipoTercia className="size-5 rounded-md" />
        Postulaciones gestionadas con Tercia
      </footer>
    </div>
  );
}
