"use client";

import { ChevronsUpDown } from "lucide-react";
import { toast } from "sonner";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuGroup,
  DropdownMenuLabel,
  DropdownMenuRadioGroup,
  DropdownMenuRadioItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { nombresRol } from "@/datos/catalogos";
import type { Rol } from "@/datos/tipos";
import { actualizarEstado, useEstadoDemo } from "@/lib/demo/almacen";

// Usuarios de ejemplo para cada rol. No hay inicio de sesión: el selector
// muestra lo que ve cada uno.
const usuarioPorRol: Record<Rol, { nombre: string; iniciales: string }> = {
  recursos_humanos: { nombre: "Lucía Vargas", iniciales: "LV" },
  gerente: { nombre: "Andrés Salazar", iniciales: "AS" },
};

const roles = Object.keys(nombresRol) as Rol[];

export function cambiarRol(rol: Rol) {
  actualizarEstado((estado) => ({ ...estado, rol }));
  toast.info(`Ahora ve la demo como ${nombresRol[rol]}.`);
}

export function SelectorRol() {
  const { rol } = useEstadoDemo();
  const usuario = usuarioPorRol[rol];

  return (
    <DropdownMenu>
      <DropdownMenuTrigger className="flex items-center gap-2.5 rounded-lg px-2 py-1.5 text-left outline-none hover:bg-muted focus-visible:ring-2 focus-visible:ring-ring aria-expanded:bg-muted">
        <Avatar className="size-8">
          <AvatarFallback className="bg-marca-suave text-xs font-medium text-primary">{usuario.iniciales}</AvatarFallback>
        </Avatar>
        <span className="hidden flex-col leading-tight sm:flex">
          <span className="text-sm font-medium">{usuario.nombre}</span>
          <span className="text-xs text-muted-foreground">{nombresRol[rol]}</span>
        </span>
        <ChevronsUpDown className="size-4 text-muted-foreground" />
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end" className="w-56">
        <DropdownMenuGroup>
          <DropdownMenuLabel>Ver la demo como</DropdownMenuLabel>
          <DropdownMenuRadioGroup value={rol} onValueChange={(valor) => cambiarRol(valor as Rol)}>
            {roles.map((opcion) => (
              <DropdownMenuRadioItem key={opcion} value={opcion}>
                <span className="flex flex-col">
                  <span>{nombresRol[opcion]}</span>
                  <span className="text-xs text-muted-foreground">{usuarioPorRol[opcion].nombre}</span>
                </span>
              </DropdownMenuRadioItem>
            ))}
          </DropdownMenuRadioGroup>
        </DropdownMenuGroup>
      </DropdownMenuContent>
    </DropdownMenu>
  );
}
