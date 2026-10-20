import type { Metadata } from "next";
import { ListaPersonal } from "@/components/personal/lista-personal";

export const metadata: Metadata = { title: "Personal" };

export default function PaginaPersonal() {
  return <ListaPersonal />;
}
