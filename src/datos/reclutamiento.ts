import { calcularCumplimiento } from "../lib/cumplimiento.ts";
import type { Aleatorio } from "./aleatorio.ts";
import { fechaReferenciaDemo, habilidadesPorPuesto, turnos } from "./catalogos.ts";
import { diferenciaEnDias, sumarDias, sumarMeses } from "./fechas.ts";
import type { CrearIdentidad } from "./identidades.ts";
import { empresasAnteriores } from "./nombres.ts";
import type {
  Ciudad,
  Convocatoria,
  EstadoPostulacion,
  ExperienciaLaboral,
  NivelEstudios,
  Postulacion,
  Postulante,
  Puesto,
} from "./tipos.ts";

export const convocatoriasIniciales: Convocatoria[] = [
  {
    id: "conv-recepcion-clinica",
    titulo: "Recepcionista para clínica",
    puesto: "recepcion",
    descripcion:
      "Atención de pacientes en recepción, agenda de citas y manejo de la central telefónica en el turno de la tarde.",
    idCliente: "cli-clinica-valle-verde",
    idSucursal: "suc-cvv-cochabamba",
    cantidadPuestos: 2,
    requisitos: {
      experienciaMinimaAnios: 1,
      nivelEstudiosMinimo: "tecnico",
      ciudad: "Cochabamba",
      turnos: ["tarde"],
      habilidades: ["Atención al cliente", "Manejo de central telefónica", "Office básico"],
    },
    estado: "abierta",
    fechaPublicacion: "2026-10-05",
    fechaCierre: "2026-10-25",
  },
  {
    id: "conv-limpieza-banco-la-paz",
    titulo: "Personal de limpieza para agencias bancarias",
    puesto: "limpieza",
    descripcion:
      "Limpieza de oficinas y áreas de atención al público en agencias de La Paz, en el turno de la mañana.",
    idCliente: "cli-banco-horizonte",
    idSucursal: null,
    cantidadPuestos: 3,
    requisitos: {
      experienciaMinimaAnios: 1,
      nivelEstudiosMinimo: "secundaria",
      ciudad: "La Paz",
      turnos: ["manana"],
      habilidades: ["Limpieza de oficinas", "Manejo de productos de limpieza", "Manejo de residuos"],
    },
    estado: "abierta",
    fechaPublicacion: "2026-10-01",
    fechaCierre: "2026-10-20",
  },
  {
    id: "conv-conserje-edificio",
    titulo: "Conserje para edificio de oficinas",
    puesto: "conserje",
    descripcion:
      "Mantenimiento preventivo del edificio, control de accesos y apoyo a la administración en jornada completa.",
    idCliente: "cli-torre-mirador",
    idSucursal: "suc-tm-edificio",
    cantidadPuestos: 1,
    requisitos: {
      experienciaMinimaAnios: 2,
      nivelEstudiosMinimo: "secundaria",
      ciudad: "Cochabamba",
      turnos: ["completo"],
      habilidades: ["Mantenimiento básico", "Electricidad básica", "Plomería básica"],
    },
    estado: "abierta",
    fechaPublicacion: "2026-10-08",
    fechaCierre: "2026-10-30",
  },
  {
    id: "conv-auxiliar-contable",
    titulo: "Auxiliar contable",
    puesto: "auxiliar_administrativo",
    descripcion:
      "Registro contable, preparación de declaraciones de impuestos y apoyo en planillas de sueldos.",
    idCliente: "cli-kantuta",
    idSucursal: "suc-kt-oficina",
    cantidadPuestos: 1,
    requisitos: {
      experienciaMinimaAnios: 2,
      nivelEstudiosMinimo: "licenciatura",
      ciudad: "Cochabamba",
      turnos: ["completo"],
      habilidades: ["Contabilidad general", "Declaraciones de impuestos", "Excel avanzado"],
    },
    estado: "cerrada",
    fechaPublicacion: "2026-08-17",
    fechaCierre: "2026-09-04",
  },
];

const cantidadPostulantesPorConvocatoria: Record<string, number> = {
  "conv-recepcion-clinica": 26,
  "conv-limpieza-banco-la-paz": 22,
  "conv-conserje-edificio": 17,
  "conv-auxiliar-contable": 19,
};

// Pares de convocatorias entre las que algunas personas postulan a las dos.
const postulacionesCruzadas: [string, string, number][] = [
  ["conv-auxiliar-contable", "conv-recepcion-clinica", 6],
  ["conv-recepcion-clinica", "conv-conserje-edificio", 2],
  ["conv-limpieza-banco-la-paz", "conv-conserje-edificio", 3],
];

const cargosPorPuesto: Record<Puesto, string[]> = {
  limpieza: ["Personal de limpieza", "Auxiliar de limpieza", "Encargada de limpieza"],
  recepcion: ["Recepcionista", "Atención al cliente", "Cajera"],
  conserje: ["Conserje", "Portero", "Encargado de mantenimiento"],
  seguridad: ["Guardia de seguridad", "Vigilante"],
  auxiliar_administrativo: ["Auxiliar contable", "Asistente administrativo", "Auxiliar de oficina"],
};

const titulosPorNivel: Record<NivelEstudios, Record<Puesto, string[]>> = {
  secundaria: {
    limpieza: ["Bachiller en Humanidades"],
    recepcion: ["Bachiller en Humanidades"],
    conserje: ["Bachiller en Humanidades"],
    seguridad: ["Bachiller en Humanidades"],
    auxiliar_administrativo: ["Bachiller en Humanidades"],
  },
  tecnico: {
    limpieza: ["Técnico medio en Gastronomía", "Técnico básico en Hotelería"],
    recepcion: ["Técnico medio en Secretariado", "Técnico superior en Turismo"],
    conserje: ["Técnico medio en Electricidad", "Técnico básico en Construcción civil"],
    seguridad: ["Técnico básico en Seguridad industrial"],
    auxiliar_administrativo: ["Técnico superior en Contabilidad", "Técnico medio en Secretariado ejecutivo"],
  },
  licenciatura: {
    limpieza: ["Licenciatura en Administración de Empresas"],
    recepcion: ["Licenciatura en Comunicación Social", "Licenciatura en Turismo"],
    conserje: ["Licenciatura en Ingeniería Civil (egresado)"],
    seguridad: ["Licenciatura en Derecho (egresado)"],
    auxiliar_administrativo: ["Licenciatura en Contaduría Pública", "Licenciatura en Administración de Empresas"],
  },
};

export interface ReclutamientoGenerado {
  postulantes: Postulante[];
  postulaciones: Postulacion[];
}

function crearExperiencias(aleatorio: Aleatorio, puesto: Puesto, anios: number): ExperienciaLaboral[] {
  const experiencias: ExperienciaLaboral[] = [];
  let mesesRestantes = Math.round(anios * 12);
  let fin: string | null = aleatorio.probabilidad(0.35) ? null : sumarDias(fechaReferenciaDemo, -aleatorio.entero(20, 200));
  while (mesesRestantes > 0 && experiencias.length < 3) {
    const meses = experiencias.length === 2 ? mesesRestantes : Math.min(mesesRestantes, aleatorio.entero(6, 30));
    const referencia = fin ?? fechaReferenciaDemo;
    const desde = sumarMeses(referencia, -meses);
    experiencias.push({
      cargo: aleatorio.elegir(cargosPorPuesto[puesto]),
      empresa: aleatorio.elegir(empresasAnteriores),
      desde,
      hasta: fin,
    });
    mesesRestantes -= meses;
    fin = sumarDias(desde, -aleatorio.entero(15, 90));
  }
  return experiencias;
}

export function generarReclutamiento(aleatorio: Aleatorio, crearIdentidad: CrearIdentidad): ReclutamientoGenerado {
  const postulantes: Postulante[] = [];
  const postulaciones: Postulacion[] = [];

  function fechaDePostulacion(convocatoria: Convocatoria) {
    const limite = convocatoria.fechaCierre < fechaReferenciaDemo ? convocatoria.fechaCierre : fechaReferenciaDemo;
    return sumarDias(convocatoria.fechaPublicacion, aleatorio.entero(0, diferenciaEnDias(convocatoria.fechaPublicacion, limite)));
  }

  // Cada postulante tiene una "afinidad" con la vacante que define cuántos
  // requisitos cumple. Así el porcentaje de cumplimiento sale variado.
  function crearPostulante(convocatoria: Convocatoria): Postulante {
    const { requisitos, puesto } = convocatoria;
    const afinidad = 0.05 + aleatorio.siguiente() ** 1.4 * 0.9;
    const cumple = () => aleatorio.probabilidad(afinidad);

    const otraCiudad: Ciudad = requisitos.ciudad === "Cochabamba" ? "La Paz" : "Cochabamba";
    const ciudad = aleatorio.probabilidad(0.82) ? requisitos.ciudad : otraCiudad;

    const niveles: NivelEstudios[] = ["secundaria", "tecnico", "licenciatura"];
    const indiceMinimo = niveles.indexOf(requisitos.nivelEstudiosMinimo);
    const nivelEstudios = cumple()
      ? niveles[aleatorio.entero(indiceMinimo, Math.min(indiceMinimo + 1, 2))]
      : niveles[Math.max(0, indiceMinimo - 1)];

    const experienciaAnios = cumple()
      ? requisitos.experienciaMinimaAnios + aleatorio.entero(0, 5)
      : Math.max(0, requisitos.experienciaMinimaAnios - aleatorio.entero(1, 2));

    const turnosDisponibles = cumple()
      ? Array.from(new Set([...requisitos.turnos, ...aleatorio.elegirVarios(turnos, aleatorio.entero(0, 2))]))
      : turnos.filter((turno) => !requisitos.turnos.includes(turno)).slice(0, aleatorio.entero(1, 2));

    const otrasHabilidades = habilidadesPorPuesto[puesto].filter((habilidad) => !requisitos.habilidades.includes(habilidad));
    const habilidades = [
      ...requisitos.habilidades.filter(() => cumple()),
      ...aleatorio.elegirVarios(otrasHabilidades, aleatorio.entero(0, 2)),
    ];

    const identidad = crearIdentidad(ciudad, { anioNacimientoMinimo: 1978, anioNacimientoMaximo: 2005 });
    const fechaRegistro = fechaDePostulacion(convocatoria);
    const archivo = `CV_${identidad.nombres.split(" ")[0]}_${identidad.apellidos.split(" ")[0]}.pdf`;

    const postulante: Postulante = {
      id: `pos-${String(postulantes.length + 1).padStart(3, "0")}`,
      nombres: identidad.nombres,
      apellidos: identidad.apellidos,
      carnetIdentidad: identidad.carnetIdentidad,
      correo: identidad.correo,
      telefono: identidad.telefono,
      ciudad,
      fechaNacimiento: identidad.fechaNacimiento,
      nivelEstudios,
      tituloEstudios: aleatorio.elegir(titulosPorNivel[nivelEstudios][puesto]),
      experienciaAnios,
      experiencias: crearExperiencias(aleatorio, puesto, experienciaAnios),
      habilidades,
      turnosDisponibles,
      archivoCurriculum: archivo.normalize("NFD").replace(/[̀-ͯ]/g, ""),
      fechaRegistro,
    };
    postulantes.push(postulante);
    return postulante;
  }

  function agregarPostulacion(postulante: Postulante, convocatoria: Convocatoria, fecha: string) {
    postulaciones.push({
      id: `pst-${String(postulaciones.length + 1).padStart(3, "0")}`,
      idPostulante: postulante.id,
      idConvocatoria: convocatoria.id,
      fecha,
      estado: "nuevo",
    });
  }

  for (const convocatoria of convocatoriasIniciales) {
    for (let indice = 0; indice < cantidadPostulantesPorConvocatoria[convocatoria.id]; indice++) {
      const postulante = crearPostulante(convocatoria);
      agregarPostulacion(postulante, convocatoria, postulante.fechaRegistro);
    }
  }

  // Algunas personas de la base vuelven a postular a otra convocatoria.
  for (const [idOrigen, idDestino, cantidad] of postulacionesCruzadas) {
    const destino = convocatoriasIniciales.find((convocatoria) => convocatoria.id === idDestino)!;
    const candidatos = postulaciones
      .filter((postulacion) => postulacion.idConvocatoria === idOrigen)
      .map((postulacion) => postulantes.find((postulante) => postulante.id === postulacion.idPostulante)!)
      .filter((postulante) => postulante.ciudad === destino.requisitos.ciudad)
      .filter((postulante) => !postulaciones.some((p) => p.idPostulante === postulante.id && p.idConvocatoria === idDestino));
    for (const postulante of aleatorio.elegirVarios(candidatos, cantidad)) {
      const fecha = fechaDePostulacion(destino);
      agregarPostulacion(postulante, destino, fecha > postulante.fechaRegistro ? fecha : postulante.fechaRegistro);
    }
  }

  asignarEstados(aleatorio, postulantes, postulaciones);
  return { postulantes, postulaciones };
}

function asignarEstados(aleatorio: Aleatorio, postulantes: Postulante[], postulaciones: Postulacion[]) {
  const postulantePorId = new Map(postulantes.map((postulante) => [postulante.id, postulante]));

  for (const convocatoria of convocatoriasIniciales) {
    const ordenadas = postulaciones
      .filter((postulacion) => postulacion.idConvocatoria === convocatoria.id)
      .map((postulacion) => ({
        postulacion,
        cumplimiento: calcularCumplimiento(convocatoria.requisitos, postulantePorId.get(postulacion.idPostulante)!),
      }))
      .sort((a, b) => b.cumplimiento - a.cumplimiento);

    ordenadas.forEach(({ postulacion, cumplimiento }, posicion) => {
      let estado: EstadoPostulacion = "nuevo";
      if (convocatoria.estado === "cerrada") {
        if (posicion === 0) estado = "contratado";
        else if (posicion <= 2) estado = "preseleccionado";
        else estado = "descartado";
      } else if (cumplimiento >= 70 && posicion < 3) {
        estado = posicion === 0 ? "entrevista" : "preseleccionado";
      } else if (cumplimiento < 30 && aleatorio.probabilidad(0.4)) {
        estado = "descartado";
      }
      postulacion.estado = estado;
    });
  }
}
