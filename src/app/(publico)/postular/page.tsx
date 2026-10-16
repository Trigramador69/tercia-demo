import type { Metadata } from "next";
import { ListaVacantesPublicas } from "@/components/postulacion/lista-vacantes-publicas";

export const metadata: Metadata = { title: "Trabaje con nosotros" };

export default function PaginaPostular() {
  return <ListaVacantesPublicas />;
}
