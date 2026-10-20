import {
  nombresNivelEstudios,
  nombresTurno,
  ordenNivelEstudios,
} from "../datos/catalogos.ts";
import type { Postulante, RequisitosConvocatoria } from "../datos/tipos.ts";

export interface ResultadoRequisito {
  requisito: string;
  valorPostulante: string;
  cumple: boolean;
}

type DatosEvaluables = Pick<
  Postulante,
  "experienciaAnios" | "nivelEstudios" | "ciudad" | "turnosDisponibles" | "habilidades"
>;

function normalizar(texto: string) {
  return texto.normalize("NFD").replace(/[\u0300-\u036f]/g, "").trim().toLowerCase();
}

// Compara cada requisito de la convocatoria con los datos de la persona.
// Cada habilidad pedida cuenta como un requisito aparte.
export function evaluarRequisitos(
  requisitos: RequisitosConvocatoria,
  postulante: DatosEvaluables,
): ResultadoRequisito[] {
  const habilidadesPostulante = new Set(postulante.habilidades.map(normalizar));
  const anios = (cantidad: number) => `${cantidad} ${cantidad === 1 ? "año" : "años"}`;

  const resultados: ResultadoRequisito[] = [
    {
      requisito: `Experiencia mínima de ${anios(requisitos.experienciaMinimaAnios)}`,
      valorPostulante: anios(postulante.experienciaAnios),
      cumple: postulante.experienciaAnios >= requisitos.experienciaMinimaAnios,
    },
    {
      requisito: `Estudios: ${nombresNivelEstudios[requisitos.nivelEstudiosMinimo]} o superior`,
      valorPostulante: nombresNivelEstudios[postulante.nivelEstudios],
      cumple: ordenNivelEstudios[postulante.nivelEstudios] >= ordenNivelEstudios[requisitos.nivelEstudiosMinimo],
    },
    {
      requisito: `Vive en ${requisitos.ciudad}`,
      valorPostulante: postulante.ciudad,
      cumple: postulante.ciudad === requisitos.ciudad,
    },
    {
      requisito: `Disponibilidad de turno: ${requisitos.turnos.map((turno) => nombresTurno[turno]).join(" o ")}`,
      valorPostulante: postulante.turnosDisponibles.map((turno) => nombresTurno[turno]).join(", ") || "Sin indicar",
      cumple: requisitos.turnos.some((turno) => postulante.turnosDisponibles.includes(turno)),
    },
  ];

  for (const habilidad of requisitos.habilidades) {
    const cumple = habilidadesPostulante.has(normalizar(habilidad));
    resultados.push({
      requisito: habilidad,
      valorPostulante: cumple ? "Sí" : "No indica",
      cumple,
    });
  }

  return resultados;
}

export function calcularCumplimiento(requisitos: RequisitosConvocatoria, postulante: DatosEvaluables) {
  const resultados = evaluarRequisitos(requisitos, postulante);
  const cumplidos = resultados.filter((resultado) => resultado.cumple).length;
  return Math.round((cumplidos / resultados.length) * 100);
}
