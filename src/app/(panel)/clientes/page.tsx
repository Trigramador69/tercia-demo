import type { Metadata } from "next";
import { ListaClientes } from "@/components/clientes/lista-clientes";

export const metadata: Metadata = { title: "Clientes y sucursales" };

export default function PaginaClientes() {
  return <ListaClientes />;
}
