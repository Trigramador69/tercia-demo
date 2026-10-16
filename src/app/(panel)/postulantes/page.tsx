import type { Metadata } from "next";
import { EncabezadoPagina } from "@/components/panel/encabezado-pagina";
import { SeccionEnPreparacion } from "@/components/panel/seccion-en-preparacion";

export const metadata: Metadata = { title: "Base de postulantes" };

export default function PaginaPostulantes() {
  return (
    <>
      <EncabezadoPagina
        titulo="Base de postulantes"
        descripcion="Todas las personas que alguna vez postularon, listas para otra convocatoria."
      />
      <SeccionEnPreparacion
        contenido={[
          "Filtros por puesto, ciudad y años de experiencia",
          "Ficha del postulante con su currículum, requisitos que cumple y otras convocatorias a las que postuló",
          "Invitar a una persona de la base a otra convocatoria",
        ]}
      />
    </>
  );
}
