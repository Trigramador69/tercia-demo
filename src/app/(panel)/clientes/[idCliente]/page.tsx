import type { Metadata } from "next";
import { DetalleCliente } from "@/components/clientes/detalle-cliente";

export const metadata: Metadata = { title: "Cliente" };

export default function PaginaCliente() {
  return <DetalleCliente />;
}
