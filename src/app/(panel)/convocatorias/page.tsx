import type { Metadata } from "next";
import { EncabezadoPagina } from "@/components/panel/encabezado-pagina";
import { SeccionEnPreparacion } from "@/components/panel/seccion-en-preparacion";

export const metadata: Metadata = { title: "Convocatorias" };

export default function PaginaConvocatorias() {
  return (
    <>
      <EncabezadoPagina
        titulo="Convocatorias"
        descripcion="Vacantes abiertas a la vez, con sus requisitos, destino y postulantes."
      />
      <SeccionEnPreparacion
        contenido={[
          "Lista de convocatorias con puesto, cliente o sucursal de destino, cantidad de puestos y de postulantes, y estado",
          "Crear convocatoria: puesto, requisitos (experiencia, estudios, ciudad, turno, habilidades) y destino",
          "Postulantes de cada convocatoria con su porcentaje de cumplimiento y el filtro de al menos 50%",
        ]}
      />
    </>
  );
}
