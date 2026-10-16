import type { Metadata } from "next";
import { ListaConvocatorias } from "@/components/reclutamiento/lista-convocatorias";

export const metadata: Metadata = { title: "Convocatorias" };

export default function PaginaConvocatorias() {
  return <ListaConvocatorias />;
}
