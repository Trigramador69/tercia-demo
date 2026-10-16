import type {
  EstadoAsistencia,
  EstadoPostulacion,
  NivelEstudios,
  Puesto,
  Rol,
  TipoAusencia,
  Turno,
} from "./tipos.ts";

export const empresa = {
  nombre: "Empresa ADC",
  oficinas: [
    { ciudad: "Cochabamba", direccion: "Av. Ballivián 520, piso 3", principal: true },
    { ciudad: "La Paz", direccion: "Av. 16 de Julio 1440, oficina 702", principal: false },
  ],
} as const;

export const nombresPuesto: Record<Puesto, string> = {
  limpieza: "Limpieza",
  recepcion: "Recepción",
  conserje: "Conserje",
  seguridad: "Seguridad",
  auxiliar_administrativo: "Auxiliar administrativo",
};

export const puestos = Object.keys(nombresPuesto) as Puesto[];

// Tarifa mensual por puesto, en bolivianos. La planilla paga en proporción a
// los días trabajados ya conciliados.
export const tarifaMensualPorPuesto: Record<Puesto, number> = {
  limpieza: 3400,
  recepcion: 3800,
  conserje: 3600,
  seguridad: 3900,
  auxiliar_administrativo: 4300,
};

export const nombresTurno: Record<Turno, string> = {
  manana: "Mañana",
  tarde: "Tarde",
  completo: "Jornada completa",
};

export const turnos = Object.keys(nombresTurno) as Turno[];

export const horarioPorTurno: Record<Turno, { entrada: string; salida: string }> = {
  manana: { entrada: "07:00", salida: "15:00" },
  tarde: { entrada: "14:00", salida: "22:00" },
  completo: { entrada: "08:00", salida: "17:00" },
};

export const nombresNivelEstudios: Record<NivelEstudios, string> = {
  secundaria: "Bachiller",
  tecnico: "Técnico",
  licenciatura: "Licenciatura",
};

export const ordenNivelEstudios: Record<NivelEstudios, number> = {
  secundaria: 1,
  tecnico: 2,
  licenciatura: 3,
};

export const nivelesEstudios = Object.keys(nombresNivelEstudios) as NivelEstudios[];

export const habilidadesPorPuesto: Record<Puesto, string[]> = {
  limpieza: [
    "Limpieza de oficinas",
    "Manejo de productos de limpieza",
    "Limpieza hospitalaria",
    "Manejo de residuos",
    "Lavado de alfombras",
  ],
  recepcion: [
    "Atención al cliente",
    "Manejo de central telefónica",
    "Office básico",
    "Agenda de citas",
    "Inglés básico",
  ],
  conserje: [
    "Mantenimiento básico",
    "Electricidad básica",
    "Plomería básica",
    "Pintura",
    "Control de accesos",
  ],
  seguridad: [
    "Control de accesos",
    "Monitoreo de cámaras",
    "Primeros auxilios",
    "Rondas de vigilancia",
    "Licencia de conducir",
  ],
  auxiliar_administrativo: [
    "Contabilidad general",
    "Declaraciones de impuestos",
    "Excel avanzado",
    "Planillas de sueldos",
    "Archivo y correspondencia",
  ],
};

export const nombresEstadoPostulacion: Record<EstadoPostulacion, string> = {
  nuevo: "Nuevo",
  preseleccionado: "Preseleccionado",
  entrevista: "Entrevista",
  contratado: "Contratado",
  descartado: "Descartado",
};

export const estadosPostulacion = Object.keys(nombresEstadoPostulacion) as EstadoPostulacion[];

export const nombresTipoAusencia: Record<TipoAusencia, string> = {
  permiso: "Permiso",
  vacacion: "Vacación",
  baja_medica: "Baja médica",
  falta: "Falta",
};

export const nombresEstadoAsistencia: Record<EstadoAsistencia, string> = {
  presente: "Presente",
  falta: "Falta",
  permiso: "Permiso",
  vacacion: "Vacación",
  baja_medica: "Baja médica",
};

export const nombresRol: Record<Rol, string> = {
  recursos_humanos: "Recursos Humanos",
  gerente: "Gerente",
};

// Una diferencia de horario mayor a esta tolerancia se marca en la conciliación.
export const toleranciaConciliacionMinutos = 15;

// Umbral por defecto del filtro de cumplimiento de requisitos.
export const umbralCumplimientoPorDefecto = 50;

// Mes de asistencia que trae la demo, ya cerrado y listo para conciliar.
export const mesAsistenciaDemo = "2026-09";

// Fecha en la que "viven" los datos generados. Es fija para que la semilla dé
// siempre el mismo resultado, sin depender del día en que se abre la demo.
export const fechaReferenciaDemo = "2026-10-16";
