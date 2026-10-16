import type { Metadata } from "next";
import { DetalleConvocatoria } from "@/components/reclutamiento/detalle-convocatoria";

export const metadata: Metadata = { title: "Convocatoria" };

export default function PaginaConvocatoria() {
  return <DetalleConvocatoria />;
}
