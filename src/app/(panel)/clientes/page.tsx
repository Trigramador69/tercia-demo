import type { Metadata } from "next";
import { EncabezadoPagina } from "@/components/panel/encabezado-pagina";
import { SeccionEnPreparacion } from "@/components/panel/seccion-en-preparacion";

export const metadata: Metadata = { title: "Clientes y sucursales" };

export default function PaginaClientes() {
  return (
    <>
      <EncabezadoPagina
        titulo="Clientes y sucursales"
        descripcion="Cuánto personal pide cada sucursal y cuánto tiene asignado."
      />
      <SeccionEnPreparacion
        contenido={[
          "Clientes con sus sucursales, con la misma lógica para 1, 3 o 10 sucursales",
          "Cobertura por sucursal: personas requeridas por puesto y turno frente a las asignadas",
          "Asignar personal a una sucursal",
        ]}
      />
    </>
  );
}
