# Archivos de ejemplo de la demo

Generados con `npm run generar:ejemplos`; no editarlos a mano. En la demo publicada se descargan desde
`/ejemplos/...` o desde el botón **Archivos de ejemplo** del menú lateral.

## Currículums para la página de postulación

Al subir uno de estos archivos en `/postular`, el formulario se completa solo con sus datos.
Con cualquier otro archivo, la persona completa el formulario a mano.

| Archivo | Persona | Pensado para |
|---|---|---|
| `curriculums/CV_Valeria_Rocha.pdf` | Valeria Rocha Antezana | Recepcionista para clínica (cumple el 100%) |
| `curriculums/CV_Mario_Choque.pdf` | Mario Choque Limachi | Personal de limpieza para agencias bancarias (cumple el 86%) |
| `curriculums/CV_Esteban_Vargas.pdf` | Esteban Vargas Coca | Conserje para edificio de oficinas (cumple el 100%) |

Para mostrar que quien ya postuló antes reutiliza sus datos: en la postulación a
**Recepcionista para clínica**, buscar el carnet **10751088 CB**
(Ramiro Quispe Bustamante, cumple el 86%).

## Reportes de asistencia para la conciliación

Asistencia de 2026-09 tal como la entregaría cada cliente, exportada de su biométrico.
Se suben en la pantalla de Asistencia.

### Banco Horizonte

Archivo: `reporte-biometrico-banco-horizonte-2026-09.csv` (347 filas).

Diferencias plantadas:

| Fecha | Persona | Diferencia |
|---|---|---|
| 03/09/2026 | Freddy Mamani Ticona | Hora de entrada distinta (+35 min) |
| 08/09/2026 | Brenda Huanca Quispe | Vino según nuestro registro; el cliente no tiene marcación |
| 10/09/2026 | Nelly Guzmán Orellana | Hora de salida distinta (-110 min) |
| 15/09/2026 | Marcelo Montaño Huanca | Hora de entrada distinta (+90 min) |
| 19/09/2026 | Jhonny Bustamante Rojas | Día que solo aparece en el registro del cliente |
| 22/09/2026 | Mariela Rojas Galarza | En nuestro registro no vino (falta o permiso); el cliente tiene marcación ese día |
| 24/09/2026 | Fernando Villarroel Ríos | En nuestro registro no vino (falta o permiso); el cliente tiene marcación ese día |
| 29/09/2026 | Nelson Peredo López | El cliente no tiene marcación de salida |

### Comercializadora Kantuta

Archivo: `reporte-biometrico-comercializadora-kantuta-2026-09.csv` (179 filas).

Diferencias plantadas:

| Fecha | Persona | Diferencia |
|---|---|---|
| 12/09/2026 | Carmen Rosa Ugarte Ayala | Vino según nuestro registro; el cliente no tiene marcación |
| 17/09/2026 | Delia Zurita Sejas | En nuestro registro no vino (falta o permiso); el cliente tiene marcación ese día |
| 23/09/2026 | María Elena Ticona Gonzales | Hora de entrada distinta (+45 min) |
