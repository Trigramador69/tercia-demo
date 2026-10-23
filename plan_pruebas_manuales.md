# Plan de pruebas manuales de Tercia

Recorrido completo de la demo antes del despliegue. Cada paso dice qué hacer y qué debería verse. Si algo no coincide, anótalo en la columna de observaciones con el número del paso.

**Importante:** los números esperados (cantidades, porcentajes, nombres) son los de la demo recién reiniciada y siguiendo las secciones en orden, porque cada sección cambia datos que usan las siguientes. Si te salteas algo o repites un paso, usa **Reiniciar demo** y retoma desde el inicio de esa sección; las secciones que necesitan empezar de cero lo indican.

---
    
## 0. Preparación

| # | Qué hacer | Qué debería verse | ✔ | Observaciones |
|---|---|---|---|---|
| 0.1 | `npm install` y `npm run dev`. Abrir http://localhost:3000 en Chrome | Se ve un esqueleto un instante y luego el Inicio | | |
| 0.2 | Menú lateral → **Reiniciar demo** → Reiniciar | Aviso "La demo volvió a su estado inicial" | | |
| 0.3 | Menú lateral → **Archivos de ejemplo**. Descargar los 3 currículums y los 4 reportes (2 CSV y 2 Excel) a una carpeta | Se descargan 7 archivos | | |

---

## 1. Inicio y navegación

| # | Qué hacer | Qué debería verse | ✔ | Observaciones |
|---|---|---|---|---|
| 1.1 | Mirar el Inicio | Convocatorias abiertas **3** (60 postulantes nuevos), Personal **40** (34 asignados, 6 disponibles), Cobertura **92%** (34 de 37), Asistencia de septiembre **2** reportes por conciliar | | |
| 1.2 | Mirar "Convocatorias abiertas" y "Puestos sin cubrir" | 3 convocatorias con postulantes y "cumplen"; 3 puestos sin cubrir: Banco Agencia Sacaba, Banco Agencia Calacoto, Kantuta Almacén central | | |
| 1.3 | Recorrer todas las opciones del menú lateral | Cada una abre su pantalla y se marca como activa en el menú | | |
| 1.4 | Ocultar y mostrar el menú con el botón de la esquina superior izquierda | El menú se oculta y vuelve | | |
| 1.5 | Escribir en la barra una dirección inexistente, por ejemplo `/algo` | Página "No encontramos esta página" en español con botón al inicio | | |

---

## 2. Roles

| # | Qué hacer | Qué debería verse | ✔ | Observaciones |
|---|---|---|---|---|
| 2.1 | Arriba a la derecha (Lucía Vargas) → elegir **Gerente** | Aviso de cambio de rol. Menú: Inicio, Personal, Clientes y sucursales, Planilla del mes | | |
| 2.2 | Como Gerente, en Inicio, pasar el mouse por las convocatorias | No son enlaces | | |
| 2.3 | Como Gerente, escribir `/convocatorias` en la barra | "Esta sección no está disponible para su rol" con botón para cambiar de rol | | |
| 2.4 | Recargar la página (F5) | Sigue como Gerente | | |
| 2.5 | Volver a **Recursos Humanos** | Menú: Inicio, Convocatorias, Base de postulantes, Página de postulación, Personal, Clientes y sucursales, Asistencia | | |

---

## 3. Convocatorias y postulantes

Empezar con **Reiniciar demo**.

| # | Qué hacer | Qué debería verse | ✔ | Observaciones |
|---|---|---|---|---|
| 3.1 | Menú → Convocatorias | Pestañas Abiertas (3), Cerradas (1), Todas (4). Recepcionista: 32 postulantes, 11 cumplen 50%, 26 por revisar | | |
| 3.2 | Abrir **Recepcionista para clínica** | Requisitos arriba (1 año, Técnico o más, Cochabamba, Tarde, 3 habilidades). Pestañas Postulantes (32) y Sugeridos de la base (6) | | |
| 3.3 | Marcar **Cumple al menos** (50%) | "Mostrando 11 de 32". Primero Cristian Navia Sejas con 100% | | |
| 3.4 | Mover el control del porcentaje a 60% | La lista se achica; vuelve a 50% | | |
| 3.5 | Buscar "zzz" en el buscador | "Ningún postulante coincide con los filtros"; borrar la búsqueda | | |
| 3.6 | Con el filtro de 50% activo, marcar la casilla del encabezado (seleccionar todos) → **Preseleccionar** | Aviso "11 postulantes pasaron a preseleccionado"; todos muestran Preseleccionado | | |
| 3.7 | Cambiar el estado de un postulante con su selector (por ejemplo, a Entrevista) | Aviso con el nombre y el nuevo estado | | |
| 3.8 | Hacer clic en el nombre de un postulante | Abre su ficha, con esa postulación resaltada arriba | | |
| 3.9 | En la ficha, revisar requisitos (✓ y ✗) y la pestaña **Currículum** | Lista de requisitos con lo que cumple; currículum con formato de hoja | | |
| 3.10 | Volver con el enlace de arriba ("← Recepcionista para clínica") | Vuelve con el filtro de 50% todavía activo | | |
| 3.11 | Abrir otra ficha y volver con el botón Atrás del navegador | También conserva el filtro | | |
| 3.12 | Pestaña **Sugeridos de la base** → **Invitar** a una persona | Aviso de invitación; la pestaña baja a 5 y Postulantes sube a 33; esa persona aparece con la etiqueta "Invitado" | | |
| 3.13 | Ir a Inicio | "Postulantes nuevos por revisar" bajó respecto de 60 | | |
| 3.14 | Abrir **Conserje para edificio de oficinas** → **Cerrar convocatoria** | Estado Cerrada; Sugeridos deshabilitado; desaparece el botón Página pública | | |
| 3.15 | Abrir la Página de postulación (menú) | No aparece Conserje | | |
| 3.16 | Volver a Conserje → **Reabrir** | Vuelve a estar abierta y a aparecer en la página pública | | |

--- 

## 4. Nueva convocatoria

| # | Qué hacer | Qué debería verse | ✔ | Observaciones |
|---|---|---|---|---|
| 4.1 | Convocatorias → **Nueva convocatoria** → **Publicar** sin completar nada | Errores: puesto, título, turno | | |
| 4.2 | Elegir puesto **Seguridad** | El título se completa con "Seguridad"; aparecen habilidades sugeridas | | |
| 4.3 | Cambiar el puesto a **Conserje** | El título cambia a "Conserje" | | |
| 4.4 | Escribir un título propio: "Guardia para almacén". Volver a puesto **Seguridad** | El título que escribiste no cambia | | |
| 4.5 | Cliente **Comercializadora Kantuta**, sucursal **Almacén central** | La ciudad pasa a Cochabamba | | |
| 4.6 | Marcar turno **Tarde** y habilidades **Control de accesos** y **Rondas de vigilancia** | El panel "Ya en su base" muestra **11** personas | | |
| 4.7 | Agregar la habilidad "Manejo de radio" con el campo "Otra habilidad"; luego agregar "manejo de radio" en minúsculas | Aparece una sola vez y queda marcada; el número de "Ya en su base" puede bajar, porque ahora hay un requisito más que nadie de la base tiene | | |
| 4.8 | Poner cantidad 0 y una fecha de cierre pasada → Publicar | Errores "Al menos 1" y "Elija una fecha de hoy en adelante" | | |
| 4.9 | Corregir (cantidad 1, cierre futuro) → Publicar | Abre el detalle de la nueva convocatoria y aparece en la lista y en la página pública | | |

---

## 5. Página pública de postulación

Tener **dos pestañas**: la A con el panel en Convocatorias → Recepcionista para clínica, y la B con la página de postulación.

| # | Qué hacer | Qué debería verse | ✔ | Observaciones |
|---|---|---|---|---|
| 5.1 | Pestaña B: http://localhost:3000/postular | Encabezado "Empresa ADC · Trabaje con nosotros"; tarjetas de las vacantes abiertas, sin datos internos | | |
| 5.2 | **Postular** en Recepcionista para clínica → **Enviar** sin nada | Errores en los campos y "Adjunte su currículum" | | |
| 5.3 | Subir **CV_Valeria_Rocha.pdf** (arrastrando o eligiendo) | "Leyendo su currículum…" y luego el formulario completo y resaltado (Valeria Rocha Antezana, 8452316 CB, 4 años, Técnico, turnos Mañana y Tarde, 4 habilidades) | | |
| 5.4 | Editar un campo resaltado | Deja de estar resaltado | | |
| 5.5 | Enviar sin marcar la autorización | "Necesitamos su autorización para continuar" | | |
| 5.6 | Marcar la autorización → **Enviar postulación** | "¡Gracias, Valeria!", sin mostrar porcentaje | | |
| 5.7 | Pestaña A, **sin recargar** | Postulantes subió en 1; Valeria aparece primera con **100%** y la etiqueta **Hoy** | | |
| 5.8 | Pestaña B: postular a **Personal de limpieza** subiendo **CV_Mario_Choque.pdf** y enviar | En el panel, Mario aparece en esa convocatoria con **86%** | | |
| 5.9 | Postular a **Conserje** subiendo un PDF cualquiera tuyo (no de los ejemplos) | "No pudimos leer sus datos automáticamente"; el formulario queda vacío | | |
| 5.10 | En Recepcionista, en "¿Ya postuló antes?", buscar el carnet **10751088 CB** | "Encontramos sus datos de una postulación anterior"; datos de Ramiro Quispe Bustamante, con su currículum guardado | | |
| 5.11 | Autorizar y enviar | "¡Gracias, Ramiro!" | | |
| 5.12 | Repetir 5.10 y 5.11 con el mismo carnet | "Ya hay una postulación a esta vacante con este carnet" | | |
| 5.13 | Panel → Base de postulantes | Sigue diciendo **86 personas** (84 + Valeria + Mario; Ramiro no se duplicó) | | |

---

## 6. Base de postulantes

| # | Qué hacer | Qué debería verse | ✔ | Observaciones |
|---|---|---|---|---|
| 6.1 | Menú → Base de postulantes | Lista con puestos, experiencia, estudios, última postulación | | |
| 6.2 | Filtrar puesto **Recepción** y experiencia **2 años o más** | La lista se reduce; la dirección de la página incluye los filtros | | |
| 6.3 | Abrir una ficha y volver con Atrás | Conserva los filtros | | |
| 6.4 | Buscar la habilidad "Office" | Solo personas con esa habilidad | | |
| 6.5 | Seleccionar 2 personas → **Invitar a convocatoria** → elegir una convocatoria | El diálogo muestra el porcentaje de cada una para esa vacante | | |
| 6.6 | Invitar | Aviso "2 personas invitadas"; aparecen en esa convocatoria como "Invitado" | | |
| 6.7 | En una ficha de postulante, **Invitar a otra convocatoria** eligiendo una donde ya está | "Ya está en la convocatoria" y botón deshabilitado | | |

---

## 7. Personal

| # | Qué hacer | Qué debería verse | ✔ | Observaciones |
|---|---|---|---|---|
| 7.1 | Menú → Personal | "40 personas · 34 asignadas · 6 disponibles" | | |
| 7.2 | Filtrar cliente **Banco Horizonte** | 16 personas; se habilita el filtro de sucursal | | |
| 7.3 | Sucursal **Oficina Central** | 4 personas | | |
| 7.4 | Cliente **Sin asignación (disponibles)** | 6 personas con "Disponible"; el filtro de sucursal queda deshabilitado | | |
| 7.5 | Todos los clientes, orden **Mejor calificación** | Primero los de 5 estrellas | | |
| 7.6 | Abrir una ficha y volver con "← Personal" | Conserva filtros y orden | | |
| 7.7 | En una ficha, revisar: contacto, en la empresa, asignación actual, historial de clientes, calificación, permisos | Historial con fechas en línea de tiempo; "Cliente anterior" si trabajó en el Hotel Plaza Andina | | |
| 7.8 | **Evaluar** → 3 estrellas + comentario → Guardar | La calificación promedio cambia y la evaluación aparece arriba con el nombre de Lucía Vargas | | |
| 7.9 | **Registrar** permiso con motivo | Aparece en "Permisos y ausencias" | | |

---

## 8. Clientes, sucursales y asignaciones

Empezar con **Reiniciar demo**.

| # | Qué hacer | Qué debería verse | ✔ | Observaciones |
|---|---|---|---|---|
| 8.1 | Menú → Clientes y sucursales | 4 clientes activos, 16 sucursales, 34 de 37 (92%). Banco 16/18 "Faltan 2". "Clientes anteriores: Hotel Plaza Andina" | | |
| 8.2 | Abrir **Banco Horizonte** | 10 sucursales; cifras: 16 de 18, 89%, 2 sucursales con faltantes | | |
| 8.3 | Filtrar ciudad **La Paz** | Mostrando 4 de 10 | | |
| 8.4 | Marcar "Solo sucursales con puestos sin cubrir" (con Todas las ciudades) | Mostrando 2 de 10: Agencia Sacaba y Agencia Calacoto | | |
| 8.5 | En Sacaba → **Asignar** | Lista con disponibles primero, de la misma ciudad y por calificación; primero Juan Carlos Condori Mercado | | |
| 8.6 | Elegirlo → Asignar | Aviso "Asignación registrada"; Sacaba queda cubierta | | |
| 8.7 | Ir a Inicio | Cobertura **95%** (35 de 37) | | |
| 8.8 | En una sucursal, quitar a alguien con el ícono de la persona con "−" | Aviso con **Deshacer**; aparece "Puesto sin cubrir" | | |
| 8.9 | **Deshacer** | La persona vuelve a su lugar | | |
| 8.10 | Personal → disponibles → abrir **Nelson Ayala Rojas** (seguridad) → **Asignar** | Diálogo con cliente, sucursal y turno | | |
| 8.11 | Comercializadora Kantuta → Almacén central | El turno **Tarde** se elige solo (es el que falta) | | |
| 8.12 | Asignar | Asignación actual: Kantuta, Almacén central, Tarde, "Asignación nueva" | | |
| 8.13 | **Finalizar** → luego **Deshacer** en el aviso | Queda disponible y vuelve a estar asignado | | |
| 8.14 | Cambiar a Gerente y abrir Banco Horizonte | Se ve la cobertura pero no hay botones de Asignar ni de quitar | | |

---

## 9. Asistencia y conciliación

Empezar con **Reiniciar demo** y como **Recursos Humanos**. La lista de diferencias esperadas está en `public/ejemplos/README.md`.

| # | Qué hacer | Qué debería verse | ✔ | Observaciones |
|---|---|---|---|---|
| 9.1 | Menú → Asistencia | Resumen por cliente: Banco (16 personas) y Kantuta (7) con "Falta el reporte del cliente"; Clínica y Torre "Sin registro cargado en la demo" | | |
| 9.2 | Revisar el calendario del banco (registro propio) | Grilla de personas por días de septiembre; sábados vacíos; domingos sombreados; letras V, P y F en ausencias; leyenda debajo | | |
| 9.3 | Subir **reporte-biometrico-banco-horizonte-2026-09.csv** | "Cruzando 347 registros…" y luego: 353 comparados, 345 coinciden, 4 no coincide el horario, 4 en conflicto, 8 por resolver | | |
| 9.4 | Revisar el calendario | 4 celdas ámbar con "!" y 4 rojas con "×" en las fechas de la guía | | |
| 9.5 | Revisar la tabla Diferencias | 8 filas con detalle; por ejemplo, 15 sept Marcelo Montaño Huanca: "Entrada 06:54 en nuestro registro y 08:24 en el del cliente (+90 min)" | | |
| 9.6 | Resolver una fila con **Nuestro** y otra con **Del cliente** | Avisos con Deshacer; Por resolver (6), Resueltas (2) | | |
| 9.7 | Tocar en el calendario la celda roja del **19** de Jhonny Bustamante Rojas | Diálogo: nuestro registro "Sin registro" y el cliente "07:30 a 11:30", "Solo aparece en el registro del cliente" | | |
| 9.8 | **Vale el del cliente** | La celda pasa a ✓ (resuelto) | | |
| 9.9 | Pestaña Resueltas → deshacer una con el ícono de flecha | Vuelve a Por resolver | | |
| 9.10 | Con el banco seleccionado, subir **reporte-biometrico-comercializadora-kantuta-2026-09.xlsx** (Excel) | Aviso "El reporte corresponde a Comercializadora Kantuta; lo cargamos ahí" y cambia a Kantuta: 182 comparados, 179 coinciden, 1 no coincide, 2 en conflicto | | |
| 9.11 | Subir un currículum PDF como reporte | "El reporte debe estar en Excel (.xlsx) o CSV…" | | |
| 9.12 | **Quitar** el reporte de Kantuta y volver a subir el CSV | Vuelve a conciliar igual | | |
| 9.13 | Ir a Inicio | Asistencia de septiembre "Al día" (los dos reportes cargados) | | |

---

## 10. Planilla del mes

Seguir con los datos de la sección 9, sin reiniciar.

| # | Qué hacer | Qué debería verse | ✔ | Observaciones |
|---|---|---|---|---|
| 10.1 | Cambiar a **Gerente** → Planilla del mes | Total a pagar; tarifas por puesto; Banco y Kantuta con "Preliminar" y los días por resolver | | |
| 10.2 | Revisar una fila | "Días trabajados N de M" y el monto proporcional a la tarifa del puesto | | |
| 10.3 | **Descargar planilla** | Se descarga `planilla-2026-09.csv`; se abre bien en Excel con tildes | | |
| 10.4 | Volver a Recursos Humanos, resolver todas las diferencias del banco | Por resolver (0) | | |
| 10.5 | Gerente → Planilla | Banco con "Conciliada"; el total cambió según las decisiones tomadas | | |

---

## 11. Persistencia, pestañas y reinicio

| # | Qué hacer | Qué debería verse | ✔ | Observaciones |
|---|---|---|---|---|
| 11.1 | Recargar cualquier pantalla (F5) | Los cambios hechos siguen ahí | | |
| 11.2 | Abrir la demo en dos pestañas, cambiar algo en una | La otra se actualiza sola | | |
| 11.3 | **Reiniciar demo** | Todo vuelve al estado inicial (Inicio como en 1.1) y la otra pestaña también | | |
| 11.4 | Abrir la demo en una ventana de incógnito | Arranca con los datos iniciales, independiente de la ventana normal | | |

---

## 12. Celular

En Chrome: F12 → ícono de dispositivo (Ctrl+Shift+M) → iPhone 12 o similar.

| # | Qué hacer | Qué debería verse | ✔ | Observaciones |
|---|---|---|---|---|
| 12.1 | Inicio | Tarjetas una debajo de la otra; sin desplazamiento horizontal de la página | | |
| 12.2 | Abrir el menú con el botón de arriba a la izquierda | El menú aparece como panel lateral | | |
| 12.3 | Recorrer Convocatorias, una convocatoria, Personal, Clientes, Asistencia | Las tablas largas se desplazan dentro de su recuadro, no la página entera | | |
| 12.4 | Página de postulación completa en celular | Se puede postular cómodamente | | |

---

## 13. Ensayo del guion

Con **Reiniciar demo**, hacer de corrido el recorrido de la presentación (sección 8 de `plan_Tercia.md`) y medir el tiempo.

| # | Paso del guion | ✔ | Tiempo | Observaciones |
|---|---|---|---|---|
| 13.1 | Convocatorias: tres vacantes abiertas a la vez | | | |
| 13.2 | Postular desde la página pública con CV_Valeria_Rocha.pdf | | | |
| 13.3 | Volver a la convocatoria: Valeria con 100% y "Hoy"; filtrar 50%; preseleccionar | | | |
| 13.4 | Base de postulantes: invitar a alguien a otra vacante | | | |
| 13.5 | Personal: ficha con historial, calificación y asignación | | | |
| 13.6 | Clientes: el banco con 10 sucursales y una asignación nueva | | | |
| 13.7 | Asistencia: subir el reporte del biométrico y mostrar los conflictos | | | |
| 13.8 | Planilla del mes como Gerente | | | |

---

## Cómo pasarme lo que encuentres

Para cada problema, el número del paso, qué hiciste, qué esperabas y qué pasó. Si se ve mal, una captura. Las ideas de mejora también sirven, aunque no sean errores.
