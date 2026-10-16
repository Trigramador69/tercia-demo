// Tipos del modelo de datos de la demo. Las fechas van como texto ISO
// ("2026-09-14") y las horas como "HH:MM", para que se guarden tal cual en el
// navegador y se comparen sin problemas de zona horaria.

export type Ciudad = "Cochabamba" | "La Paz";

export type Puesto =
  | "limpieza"
  | "recepcion"
  | "conserje"
  | "seguridad"
  | "auxiliar_administrativo";

export type Turno = "manana" | "tarde" | "completo";

export type NivelEstudios = "secundaria" | "tecnico" | "licenciatura";

export type Rol = "recursos_humanos" | "gerente";

// --- Clientes y sucursales ---

export type EstadoCliente = "activo" | "finalizado";

export interface Cliente {
  id: string;
  nombre: string;
  rubro: string;
  ciudadPrincipal: Ciudad;
  contactoNombre: string;
  contactoCargo: string;
  contactoTelefono: string;
  clienteDesde: string;
  estado: EstadoCliente;
}

export interface RequerimientoSucursal {
  puesto: Puesto;
  turno: Turno;
  cantidad: number;
}

export interface Sucursal {
  id: string;
  idCliente: string;
  nombre: string;
  ciudad: Ciudad;
  direccion: string;
  // Días de la semana en que se trabaja: 1 = lunes ... 6 = sábado.
  diasLaborales: number[];
  requerimientos: RequerimientoSucursal[];
}

// --- Personal ---

export interface Persona {
  id: string;
  nombres: string;
  apellidos: string;
  carnetIdentidad: string;
  telefono: string;
  correo: string;
  ciudad: Ciudad;
  puesto: Puesto;
  fechaIngreso: string;
  fechaNacimiento: string;
  direccion: string;
  contactoEmergencia: string;
}

// Una asignación sin fecha de fin es la asignación actual de la persona.
// Las asignaciones cerradas forman su historial de clientes.
export interface Asignacion {
  id: string;
  idPersona: string;
  idSucursal: string;
  puesto: Puesto;
  turno: Turno;
  desde: string;
  hasta: string | null;
}

export interface Evaluacion {
  id: string;
  idPersona: string;
  fecha: string;
  estrellas: number;
  comentario: string;
  autor: string;
  idCliente: string | null;
}

export type TipoAusencia = "permiso" | "vacacion" | "baja_medica" | "falta";

export interface Ausencia {
  id: string;
  idPersona: string;
  tipo: TipoAusencia;
  desde: string;
  hasta: string;
  motivo: string;
}

// --- Reclutamiento ---

export type EstadoConvocatoria = "abierta" | "cerrada";

export interface RequisitosConvocatoria {
  experienciaMinimaAnios: number;
  nivelEstudiosMinimo: NivelEstudios;
  ciudad: Ciudad;
  turnos: Turno[];
  habilidades: string[];
}

export interface Convocatoria {
  id: string;
  titulo: string;
  puesto: Puesto;
  descripcion: string;
  idCliente: string | null;
  idSucursal: string | null;
  cantidadPuestos: number;
  requisitos: RequisitosConvocatoria;
  estado: EstadoConvocatoria;
  fechaPublicacion: string;
  fechaCierre: string;
}

export interface ExperienciaLaboral {
  cargo: string;
  empresa: string;
  desde: string;
  hasta: string | null;
}

export interface Postulante {
  id: string;
  nombres: string;
  apellidos: string;
  carnetIdentidad: string;
  correo: string;
  telefono: string;
  ciudad: Ciudad;
  fechaNacimiento: string;
  nivelEstudios: NivelEstudios;
  tituloEstudios: string;
  experienciaAnios: number;
  experiencias: ExperienciaLaboral[];
  habilidades: string[];
  turnosDisponibles: Turno[];
  archivoCurriculum: string;
  fechaRegistro: string;
}

export type EstadoPostulacion =
  | "nuevo"
  | "preseleccionado"
  | "entrevista"
  | "contratado"
  | "descartado";

// "invitacion": Recursos Humanos la sumó desde la base de postulantes.
export type OrigenPostulacion = "postulacion" | "invitacion";

export interface Postulacion {
  id: string;
  idPostulante: string;
  idConvocatoria: string;
  fecha: string;
  estado: EstadoPostulacion;
  origen: OrigenPostulacion;
}

// --- Asistencia ---

export type EstadoAsistencia =
  | "presente"
  | "falta"
  | "permiso"
  | "vacacion"
  | "baja_medica";

// Registro propio de la empresa: una fila por persona y día laboral.
export interface RegistroAsistencia {
  id: string;
  idPersona: string;
  idSucursal: string;
  fecha: string;
  estado: EstadoAsistencia;
  entrada: string | null;
  salida: string | null;
}

// Fila del reporte que entrega el cliente (por ejemplo, su biométrico).
export interface FilaReporteCliente {
  codigo: string;
  carnetIdentidad: string;
  nombre: string;
  sucursal: string;
  fecha: string;
  entrada: string | null;
  salida: string | null;
}

export interface ReporteCliente {
  id: string;
  idCliente: string;
  nombreArchivo: string;
  fechaCarga: string;
  // Mes del reporte, como "2026-09".
  mes: string;
  filas: FilaReporteCliente[];
}

// --- Estado completo de la demo ---

export interface EstadoDemo {
  version: number;
  rol: Rol;
  clientes: Cliente[];
  sucursales: Sucursal[];
  personas: Persona[];
  asignaciones: Asignacion[];
  evaluaciones: Evaluacion[];
  ausencias: Ausencia[];
  convocatorias: Convocatoria[];
  postulantes: Postulante[];
  postulaciones: Postulacion[];
  registrosAsistencia: RegistroAsistencia[];
  reportesCliente: ReporteCliente[];
}
