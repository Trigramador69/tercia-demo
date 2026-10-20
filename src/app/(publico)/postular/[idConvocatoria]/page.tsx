import type { Metadata } from "next";
import { FormularioPostulacion } from "@/components/postulacion/formulario-postulacion";

export const metadata: Metadata = { title: "Postular" };

export default function PaginaPostulacion() {
  return <FormularioPostulacion />;
}
