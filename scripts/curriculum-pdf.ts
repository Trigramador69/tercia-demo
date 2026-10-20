import { nombresNivelEstudios, nombresTurno } from "../src/datos/catalogos.ts";
import type { CurriculumEjemplo } from "../src/datos/curriculums.ts";
import { PaginaPdf, type Color } from "./pdf-simple.ts";

const acento: Color = { r: 0.12, g: 0.48, b: 0.5 };
const gris: Color = { r: 0.42, g: 0.45, b: 0.48 };
const meses = ["ene", "feb", "mar", "abr", "may", "jun", "jul", "ago", "sept", "oct", "nov", "dic"];

function mesCorto(fecha: string) {
  const [anio, mes] = fecha.split("-");
  return `${meses[Number(mes) - 1]} ${anio}`;
}

function edad(fechaNacimiento: string) {
  const [anio, mes, dia] = fechaNacimiento.split("-").map(Number);
  const referencia = { anio: 2026, mes: 10, dia: 16 };
  const cumplio = referencia.mes > mes || (referencia.mes === mes && referencia.dia >= dia);
  return referencia.anio - anio - (cumplio ? 0 : 1);
}

// Dibuja un currículum de una página con el formato de una hoja de vida común.
export function dibujarCurriculum({ datos, perfil }: CurriculumEjemplo) {
  const pagina = new PaginaPdf();
  const margen = 60;
  const anchoUtil = pagina.ancho - margen * 2;
  let y = pagina.alto - 72;

  pagina.texto(margen, y, `${datos.nombres} ${datos.apellidos}`, { tamanio: 24, negrita: true });
  y -= 22;
  pagina.texto(margen, y, datos.tituloEstudios, { tamanio: 12, color: acento });
  y -= 20;
  pagina.texto(
    margen,
    y,
    `${datos.ciudad} · ${datos.telefono} · ${datos.correo} · C.I. ${datos.carnetIdentidad} · ${edad(datos.fechaNacimiento)} años`,
    { tamanio: 9.5, color: gris },
  );
  y -= 16;
  pagina.linea(margen, y, pagina.ancho - margen, y, acento, 1.2);
  y -= 28;

  function seccion(titulo: string) {
    pagina.texto(margen, y, titulo.toUpperCase(), { tamanio: 10, negrita: true, color: acento });
    y -= 18;
  }

  seccion("Perfil");
  for (const linea of PaginaPdf.cortarEnLineas(perfil, anchoUtil, 10.5)) {
    pagina.texto(margen, y, linea, { tamanio: 10.5 });
    y -= 15;
  }
  y -= 14;

  seccion("Experiencia laboral");
  for (const experiencia of datos.experiencias) {
    pagina.texto(margen, y, experiencia.cargo, { tamanio: 11, negrita: true });
    const periodo = `${mesCorto(experiencia.desde)} a ${experiencia.hasta ? mesCorto(experiencia.hasta) : "la fecha"}`;
    pagina.texto(pagina.ancho - margen - PaginaPdf.anchoAproximado(periodo, 9.5), y, periodo, { tamanio: 9.5, color: gris });
    y -= 15;
    pagina.texto(margen, y, experiencia.empresa, { tamanio: 10, color: gris });
    y -= 22;
  }
  pagina.texto(margen, y, `Experiencia total: ${datos.experienciaAnios} años.`, { tamanio: 10 });
  y -= 30;

  seccion("Formación");
  pagina.texto(margen, y, datos.tituloEstudios, { tamanio: 11, negrita: true });
  y -= 15;
  pagina.texto(margen, y, `Nivel: ${nombresNivelEstudios[datos.nivelEstudios]}`, { tamanio: 10, color: gris });
  y -= 30;

  seccion("Habilidades");
  for (const habilidad of datos.habilidades) {
    pagina.texto(margen + 4, y, `·  ${habilidad}`, { tamanio: 10.5 });
    y -= 15;
  }
  y -= 15;

  seccion("Disponibilidad");
  pagina.texto(margen, y, datos.turnosDisponibles.map((turno) => nombresTurno[turno]).join(", "), { tamanio: 10.5 });

  return pagina.aBytes(`Currículum de ${datos.nombres} ${datos.apellidos}`);
}
