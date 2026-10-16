import {
  Building,
  CalendarCheck,
  Contact,
  Globe,
  LayoutDashboard,
  Megaphone,
  Users,
  Wallet,
  type LucideIcon,
} from "lucide-react";
import type { Rol } from "@/datos/tipos";

export interface SeccionNavegacion {
  titulo: string;
  ruta: string;
  icono: LucideIcon;
  roles: Rol[];
  // Se abre en otra pestaña: es lo que ve el postulante, fuera del panel.
  externa?: boolean;
}

export interface GrupoNavegacion {
  titulo: string;
  secciones: SeccionNavegacion[];
}

const ambosRoles: Rol[] = ["recursos_humanos", "gerente"];

// Recursos Humanos opera el reclutamiento, la asistencia y las asignaciones;
// el Gerente ve resúmenes, cobertura y planilla.
export const gruposNavegacion: GrupoNavegacion[] = [
  {
    titulo: "General",
    secciones: [{ titulo: "Inicio", ruta: "/", icono: LayoutDashboard, roles: ambosRoles }],
  },
  {
    titulo: "Reclutamiento",
    secciones: [
      { titulo: "Convocatorias", ruta: "/convocatorias", icono: Megaphone, roles: ["recursos_humanos"] },
      { titulo: "Base de postulantes", ruta: "/postulantes", icono: Contact, roles: ["recursos_humanos"] },
      { titulo: "Página de postulación", ruta: "/postular", icono: Globe, roles: ["recursos_humanos"], externa: true },
    ],
  },
  {
    titulo: "Operación",
    secciones: [
      { titulo: "Personal", ruta: "/personal", icono: Users, roles: ambosRoles },
      { titulo: "Clientes y sucursales", ruta: "/clientes", icono: Building, roles: ambosRoles },
      { titulo: "Asistencia", ruta: "/asistencia", icono: CalendarCheck, roles: ["recursos_humanos"] },
      { titulo: "Planilla del mes", ruta: "/planilla", icono: Wallet, roles: ["gerente"] },
    ],
  },
];

const todasLasSecciones = gruposNavegacion.flatMap((grupo) => grupo.secciones);

// Sección a la que pertenece una ruta, incluidas sus subrutas (/personal/per-001).
export function seccionDeRuta(ruta: string) {
  if (ruta === "/") return todasLasSecciones[0];
  return todasLasSecciones.find((seccion) => seccion.ruta !== "/" && (ruta === seccion.ruta || ruta.startsWith(`${seccion.ruta}/`)));
}

export function puedeVerRuta(rol: Rol, ruta: string) {
  const seccion = seccionDeRuta(ruta);
  return !seccion || seccion.roles.includes(rol);
}
