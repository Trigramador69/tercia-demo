import type { Metadata } from "next";
import { BasePostulantes } from "@/components/reclutamiento/base-postulantes";

export const metadata: Metadata = { title: "Base de postulantes" };

export default function PaginaPostulantes() {
  return <BasePostulantes />;
}
