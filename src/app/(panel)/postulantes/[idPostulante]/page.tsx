import type { Metadata } from "next";
import { FichaPostulante } from "@/components/reclutamiento/ficha-postulante";

export const metadata: Metadata = { title: "Ficha del postulante" };

export default function PaginaPostulante() {
  return <FichaPostulante />;
}
