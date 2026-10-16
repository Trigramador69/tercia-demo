import type { Metadata } from "next";
import { EncabezadoPagina } from "@/components/panel/encabezado-pagina";
import { SeccionEnPreparacion } from "@/components/panel/seccion-en-preparacion";

export const metadata: Metadata = { title: "Planilla del mes" };

export default function PaginaPlanilla() {
  return (
    <>
      <EncabezadoPagina
        titulo="Planilla del mes"
        descripcion="Días trabajados ya conciliados y monto a pagar, con la tarifa de cada puesto."
      />
      <SeccionEnPreparacion
        contenido={[
          "Días trabajados conciliados por persona",
          "Monto por persona según la tarifa mensual de su puesto",
          "Total por cliente, listo para el pago de fin de mes",
        ]}
      />
    </>
  );
}
