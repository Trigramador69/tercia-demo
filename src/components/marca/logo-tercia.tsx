import { cn } from "@/lib/utils";

// Marca de Tercia: tres barras escalonadas, por el personal que se reparte entre
// clientes y sucursales.
export function IsotipoTercia({ className }: { className?: string }) {
  return (
    <span
      className={cn(
        "flex size-8 shrink-0 items-center justify-center rounded-lg bg-primary text-primary-foreground",
        className,
      )}
    >
      <svg viewBox="0 0 24 24" className="size-[60%]" aria-hidden="true">
        <rect x="3" y="4" width="18" height="4" rx="2" fill="currentColor" />
        <rect x="6" y="10" width="15" height="4" rx="2" fill="currentColor" opacity="0.8" />
        <rect x="9" y="16" width="12" height="4" rx="2" fill="currentColor" opacity="0.6" />
      </svg>
    </span>
  );
}

export function LogoTercia({ subtitulo = "Recursos humanos" }: { subtitulo?: string }) {
  return (
    <span className="flex items-center gap-2.5">
      <IsotipoTercia />
      <span className="flex flex-col leading-tight">
        <span className="font-heading text-base font-semibold tracking-tight">Tercia</span>
        <span className="text-xs text-muted-foreground">{subtitulo}</span>
      </span>
    </span>
  );
}
