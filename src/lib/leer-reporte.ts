import type { FilaReporteCliente } from "../datos/tipos.ts";

// Convierte el reporte que entrega el cliente (exportado de su biométrico, en
// CSV o Excel) en filas de asistencia. Reconoce las columnas por su título,
// así que no importa el orden ni si dicen "CI" o "Carnet".

export type Celda = string | number | boolean | Date | null | undefined;

export interface LecturaReporte {
  filas: FilaReporteCliente[];
  // Mes que más se repite en el reporte, como "2026-09".
  mes: string | null;
  advertencias: string[];
}

type Columna = keyof FilaReporteCliente;

const titulosPorColumna: Record<Columna, string[]> = {
  codigo: ["codigo", "cod", "id", "id empleado", "codigo empleado"],
  carnetIdentidad: ["ci", "carnet", "carnet de identidad", "documento", "nro documento", "c.i."],
  nombre: ["nombre", "nombres", "nombre completo", "empleado", "funcionario"],
  sucursal: ["sucursal", "agencia", "oficina", "ubicacion"],
  fecha: ["fecha", "dia"],
  entrada: ["entrada", "hora entrada", "hora de entrada", "ingreso", "marcacion entrada"],
  salida: ["salida", "hora salida", "hora de salida", "marcacion salida"],
};

function normalizarTitulo(texto: string) {
  return texto.normalize("NFD").replace(/\p{Diacritic}/gu, "").trim().toLowerCase();
}

function dosDigitos(numero: number) {
  return String(numero).padStart(2, "0");
}

function leerFecha(valor: Celda): string | null {
  if (valor instanceof Date) {
    return `${valor.getUTCFullYear()}-${dosDigitos(valor.getUTCMonth() + 1)}-${dosDigitos(valor.getUTCDate())}`;
  }
  const texto = String(valor ?? "").trim();
  const conBarras = /^(\d{1,2})[/-](\d{1,2})[/-](\d{4})$/.exec(texto);
  if (conBarras) return `${conBarras[3]}-${dosDigitos(Number(conBarras[2]))}-${dosDigitos(Number(conBarras[1]))}`;
  const iso = /^(\d{4})-(\d{2})-(\d{2})/.exec(texto);
  if (iso) return `${iso[1]}-${iso[2]}-${iso[3]}`;
  return null;
}

function leerHora(valor: Celda): string | null {
  if (valor instanceof Date) return `${dosDigitos(valor.getUTCHours())}:${dosDigitos(valor.getUTCMinutes())}`;
  if (typeof valor === "number" && valor > 0 && valor < 1) {
    // Excel guarda las horas como fracción del día.
    const minutos = Math.round(valor * 24 * 60);
    return `${dosDigitos(Math.floor(minutos / 60))}:${dosDigitos(minutos % 60)}`;
  }
  const texto = String(valor ?? "").trim();
  const hora = /^(\d{1,2}):(\d{2})/.exec(texto);
  return hora ? `${dosDigitos(Number(hora[1]))}:${hora[2]}` : null;
}

export function leerTabla(tabla: Celda[][]): LecturaReporte {
  const advertencias: string[] = [];
  const indiceEncabezado = tabla.findIndex((fila) =>
    fila.some((celda) => titulosPorColumna.fecha.includes(normalizarTitulo(String(celda ?? "")))),
  );
  if (indiceEncabezado < 0) {
    return { filas: [], mes: null, advertencias: ["No encontramos la fila de títulos (debe tener al menos una columna «Fecha»)."] };
  }

  const encabezado = tabla[indiceEncabezado].map((celda) => normalizarTitulo(String(celda ?? "")));
  const posicion = Object.fromEntries(
    (Object.keys(titulosPorColumna) as Columna[]).map((columna) => [
      columna,
      encabezado.findIndex((titulo) => titulosPorColumna[columna].includes(titulo)),
    ]),
  ) as Record<Columna, number>;
  if (posicion.carnetIdentidad < 0) {
    return { filas: [], mes: null, advertencias: ["El reporte no tiene una columna de carnet («CI»), que es la que usamos para identificar a cada persona."] };
  }

  const filas: FilaReporteCliente[] = [];
  let descartadas = 0;
  for (const fila of tabla.slice(indiceEncabezado + 1)) {
    const valor = (columna: Columna) => (posicion[columna] >= 0 ? fila[posicion[columna]] : null);
    const fecha = leerFecha(valor("fecha"));
    const carnet = String(valor("carnetIdentidad") ?? "").trim();
    if (!fecha || carnet === "") {
      if (fila.some((celda) => String(celda ?? "").trim() !== "")) descartadas++;
      continue;
    }
    filas.push({
      codigo: String(valor("codigo") ?? "").trim(),
      carnetIdentidad: carnet,
      nombre: String(valor("nombre") ?? "").trim(),
      sucursal: String(valor("sucursal") ?? "").trim(),
      fecha,
      entrada: leerHora(valor("entrada")),
      salida: leerHora(valor("salida")),
    });
  }
  if (descartadas > 0) {
    advertencias.push(`${descartadas} ${descartadas === 1 ? "fila no tiene" : "filas no tienen"} fecha o carnet válidos y no se tomaron en cuenta.`);
  }

  const conteoPorMes = new Map<string, number>();
  for (const fila of filas) conteoPorMes.set(fila.fecha.slice(0, 7), (conteoPorMes.get(fila.fecha.slice(0, 7)) ?? 0) + 1);
  const mes = [...conteoPorMes.entries()].sort((a, b) => b[1] - a[1])[0]?.[0] ?? null;
  return { filas, mes, advertencias };
}

// Separa un CSV en celdas. Detecta si usa punto y coma, coma o tabulación, y
// respeta los valores entre comillas.
export function leerCsv(texto: string): Celda[][] {
  const sinMarca = texto.replace(/^\uFEFF/, "");
  const primeraLinea = sinMarca.split(/\r?\n/, 1)[0] ?? "";
  const separador = [";", "\t", ","].sort((a, b) => primeraLinea.split(b).length - primeraLinea.split(a).length)[0];

  return sinMarca
    .split(/\r?\n/)
    .filter((linea) => linea.trim() !== "")
    .map((linea) => {
      const celdas: string[] = [];
      let actual = "";
      let entreComillas = false;
      for (let indice = 0; indice < linea.length; indice++) {
        const caracter = linea[indice];
        if (caracter === '"') {
          if (entreComillas && linea[indice + 1] === '"') {
            actual += '"';
            indice++;
          } else {
            entreComillas = !entreComillas;
          }
        } else if (caracter === separador && !entreComillas) {
          celdas.push(actual);
          actual = "";
        } else {
          actual += caracter;
        }
      }
      celdas.push(actual);
      return celdas;
    });
}
