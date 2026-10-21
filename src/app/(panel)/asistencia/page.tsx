import type { Metadata } from "next";
import { VistaAsistencia } from "@/components/asistencia/vista-asistencia";

export const metadata: Metadata = { title: "Asistencia" };

export default function PaginaAsistencia() {
  return <VistaAsistencia />;
}
