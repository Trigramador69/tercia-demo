import type { Metadata } from "next";
import { FormularioConvocatoria } from "@/components/reclutamiento/formulario-convocatoria";

export const metadata: Metadata = { title: "Nueva convocatoria" };

export default function PaginaNuevaConvocatoria() {
  return <FormularioConvocatoria />;
}
