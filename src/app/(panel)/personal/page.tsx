import type { Metadata } from "next";
import { EncabezadoPagina } from "@/components/panel/encabezado-pagina";
import { SeccionEnPreparacion } from "@/components/panel/seccion-en-preparacion";

export const metadata: Metadata = { title: "Personal" };

export default function PaginaPersonal() {
  return (
    <>
      <EncabezadoPagina titulo="Personal" descripcion="Quién está dónde, en qué turno y con qué calificación." />
      <SeccionEnPreparacion
        contenido={[
          "Lista con puesto, cliente y sucursal actuales, turno y calificación",
          "Filtros por cliente, sucursal, ciudad y puesto",
          "Ficha de la persona: contacto, antigüedad, asignación actual, historial de clientes, calificación y ausencias",
        ]}
      />
    </>
  );
}
