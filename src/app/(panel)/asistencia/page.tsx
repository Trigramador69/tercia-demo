import type { Metadata } from "next";
import { EncabezadoPagina } from "@/components/panel/encabezado-pagina";
import { SeccionEnPreparacion } from "@/components/panel/seccion-en-preparacion";

export const metadata: Metadata = { title: "Asistencia" };

export default function PaginaAsistencia() {
  return (
    <>
      <EncabezadoPagina
        titulo="Asistencia"
        descripcion="Registro propio del mes y conciliación con el reporte de cada cliente."
      />
      <SeccionEnPreparacion
        contenido={[
          "Registro propio por persona y por día del mes",
          "Subir el reporte del cliente en Excel o CSV, como el que exporta un biométrico",
          "Conciliación por persona y día: coincide, no coincide o conflicto, con el detalle",
          "Resumen por cliente con los días conciliados y los conflictos por resolver",
        ]}
      />
    </>
  );
}
