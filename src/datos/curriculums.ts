import type { Postulante } from "./tipos.ts";

// Currículums de ejemplo para la página pública de postulación. Al subir uno de
// estos archivos, el formulario se completa solo con sus datos: el
// autocompletado es determinista, sin IA. Los PDF se generan desde estos mismos
// datos con `npm run generar:ejemplos`, así que el archivo y lo que se completa
// siempre coinciden.

export type DatosCurriculum = Omit<Postulante, "id" | "fechaRegistro" | "archivoCurriculum">;

export interface CurriculumEjemplo {
  archivo: string;
  // Para qué convocatoria del guion está pensado.
  pensadoPara: string;
  perfil: string;
  datos: DatosCurriculum;
}

export const curriculumsEjemplo: CurriculumEjemplo[] = [
  {
    archivo: "CV_Valeria_Rocha.pdf",
    pensadoPara: "Recepcionista para clínica (cumple el 100%)",
    perfil:
      "Recepcionista con cuatro años de experiencia en atención de pacientes y clientes. Manejo de agenda de citas, central telefónica y herramientas de oficina. Trato cordial y orden en el registro de información.",
    datos: {
      nombres: "Valeria",
      apellidos: "Rocha Antezana",
      carnetIdentidad: "8452316 CB",
      correo: "valeria.rocha@correo.bo",
      telefono: "7215 4480",
      ciudad: "Cochabamba",
      fechaNacimiento: "1997-03-12",
      nivelEstudios: "tecnico",
      tituloEstudios: "Técnico medio en Secretariado",
      experienciaAnios: 4,
      experiencias: [
        { cargo: "Recepcionista", empresa: "Centro Médico Los Andes", desde: "2023-02-01", hasta: null },
        { cargo: "Atención al cliente", empresa: "Farmacia Santa Rita", desde: "2021-01-15", hasta: "2023-01-20" },
      ],
      habilidades: ["Atención al cliente", "Manejo de central telefónica", "Office básico", "Agenda de citas"],
      turnosDisponibles: ["manana", "tarde"],
    },
  },
  {
    archivo: "CV_Mario_Choque.pdf",
    pensadoPara: "Personal de limpieza para agencias bancarias (cumple el 86%)",
    perfil:
      "Personal de limpieza con tres años de experiencia en hoteles y galerías comerciales. Responsable, puntual y con buen manejo de productos de limpieza en oficinas y áreas de atención al público.",
    datos: {
      nombres: "Mario",
      apellidos: "Choque Limachi",
      carnetIdentidad: "6127804 LP",
      correo: "mario.choque@correo.bo",
      telefono: "6738 1952",
      ciudad: "La Paz",
      fechaNacimiento: "1990-11-04",
      nivelEstudios: "secundaria",
      tituloEstudios: "Bachiller en Humanidades",
      experienciaAnios: 3,
      experiencias: [
        { cargo: "Personal de limpieza", empresa: "Hotel Los Sauces", desde: "2022-05-02", hasta: null },
        { cargo: "Auxiliar de limpieza", empresa: "Galería Comercial Central", desde: "2021-03-01", hasta: "2022-04-15" },
      ],
      habilidades: ["Limpieza de oficinas", "Manejo de productos de limpieza", "Lavado de alfombras"],
      turnosDisponibles: ["manana"],
    },
  },
  {
    archivo: "CV_Esteban_Vargas.pdf",
    pensadoPara: "Conserje para edificio de oficinas (cumple el 100%)",
    perfil:
      "Técnico en electricidad con seis años como conserje y encargado de mantenimiento en edificios. Resuelve reparaciones eléctricas y de plomería, y coordina con la administración el cuidado de las áreas comunes.",
    datos: {
      nombres: "Esteban",
      apellidos: "Vargas Coca",
      carnetIdentidad: "5390127 CB",
      correo: "esteban.vargas@correo.bo",
      telefono: "7049 6613",
      ciudad: "Cochabamba",
      fechaNacimiento: "1986-07-23",
      nivelEstudios: "tecnico",
      tituloEstudios: "Técnico medio en Electricidad",
      experienciaAnios: 6,
      experiencias: [
        { cargo: "Encargado de mantenimiento", empresa: "Constructora Valle Alto", desde: "2022-09-01", hasta: null },
        { cargo: "Conserje", empresa: "Instituto Técnico Tunari", desde: "2020-06-01", hasta: "2022-08-15" },
        { cargo: "Portero", empresa: "Colegio San Andrés", desde: "2018-07-01", hasta: "2020-05-20" },
      ],
      habilidades: ["Mantenimiento básico", "Electricidad básica", "Plomería básica", "Pintura"],
      turnosDisponibles: ["completo", "manana"],
    },
  },
];

function normalizarNombreArchivo(nombre: string) {
  return nombre.trim().toLowerCase().replace(/\s+/g, "_");
}

// Reconoce un currículum de ejemplo por el nombre del archivo subido.
export function buscarCurriculumEjemplo(nombreArchivo: string) {
  const buscado = normalizarNombreArchivo(nombreArchivo);
  return curriculumsEjemplo.find((curriculum) => normalizarNombreArchivo(curriculum.archivo) === buscado);
}
