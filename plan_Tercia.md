# Demo del módulo de Recursos Humanos — Plan de trabajo y contexto

Preparado el 16/10/2026 para arrancar el proyecto en un **repositorio nuevo**, separado de Yaku. Este documento se sostiene solo: quien lo lea no necesita conocer Yaku ni la conversación en la que se decidió.

---

## 1. Contexto

### Quiénes somos

- **Zékiri** es la empresa que desarrolla software. **Yaku** es su plataforma SaaS para negocios: inventario, pedidos, entregas, CRM, contenido para redes, personal y sucursales.
- **Diego Trigo** es el desarrollador a cargo.
- **Dani** lleva la relación con el cliente.

### Por qué una demo aparte

- **El cliente:** Tueri es una tercerizadora de personal de Cochabamba, con oficina también en La Paz y en expansión.
- **Lo que ya se le mostró:** una demo dentro de Yaku, con personal asignado a clientes y a sus sucursales.
- **La conclusión de la revisión del 15/10 con Dani:** Tueri necesita bastante más que eso, sobre todo reclutamiento con currículums y el cruce de asistencia con el registro de sus clientes. Esto se arma **fuera de Yaku**, como una demo independiente.
- **Qué tipo de demo:** un **frontend con datos de ejemplo, recorrible y accionable**, que muestre todo lo que tendría el módulo y cómo funcionaría. El trabajo va en las pantallas; solo se hace funcional lo que de verdad lo necesite para convencer.

### Para quién es

Dani pidió explícitamente **no ponerle el nombre de Tueri**: se presenta como **Tercia**, la plataforma de recursos humanos de Zékiri, con una empresa de ejemplo genérica, y sirve para varios clientes.

- **Tercerizadoras de personal** (Tueri y otras): reclutan personal y lo asignan a sus clientes (bancos, clínicas, comercializadoras) y a las sucursales de cada uno.
- **Empresas de limpieza:** otra ya contactó a Zékiri. Hacen lo mismo en un rubro específico.
- **Cualquier empresa con sucursales:** recluta y reparte su propio personal entre sus sucursales.

Los textos, los datos de ejemplo y los nombres de las pantallas tienen que servir a cualquiera de los tres.

### Fecha

Dani propone presentar la demo el **jueves 22/10/2026**. Hay que confirmarla con ella.

---

## 2. Qué dolores resuelve (de la reunión con Dani)

1. **Currículums perdidos en el correo.** Tienen varias convocatorias abiertas a la vez, les llegan muchos currículums por correo mezclados con todo lo demás, y los revisan uno por uno.
2. **Sin una base de postulantes.** Quien postuló una vez no queda registrado para otra vacante.
3. **Sin un primer filtro.** Necesitan ver quiénes cumplen al menos el 40 o 50% de los requisitos.
4. **Asignaciones dispersas.** Por ejemplo, "estos 6 van al banco, estos 3 a la comercializadora", con sucursal y turno. Un mismo cliente puede pedir personal para 3 o para 10 de sus sucursales.
5. **Conciliación de asistencia a mano.** Tienen su propio registro, y el cliente (por ejemplo, el biométrico del banco) les pasa el suyo. Hoy los cruzan a mano para ver si coinciden, y con eso pagan a fin de mes.
6. **Sin ficha completa de cada persona.** Necesitan ver puesto, cliente y sucursal actuales, antigüedad, historial de clientes, contacto, permisos y una calificación por estrellas para saber a quién mandar a sus clientes más importantes.
7. **Dos roles:** gerente y recursos humanos.

**Fuera de esta demo:** pruebas psicotécnicas, entrevistas en línea y garantías. Dani lo dijo explícitamente; "ellos nos dirán si es algo que necesitan".

**Referencias:**

- Plataformas como "Evaluar" hacen esto, pero son caras. Nuestra propuesta es lo básico bien hecho.
- **Richi** (Zékiri) hizo una plataforma de asistencias para colegios. Dani la va a pasar como referencia para la parte de asistencia.

---

## 3. Qué muestra la demo

Ordenado por prioridad. Lo **esencial** es lo que Dani pidió; lo demás entra si da el tiempo.

### 3.1 Reclutamiento (esencial, lo más nuevo)

| Pantalla | Qué hace |
|---|---|
| Convocatorias | Vacantes abiertas a la vez (recepcionista, limpieza, conserje, contador), con requisitos, cliente o sucursal de destino, cantidad de puestos y de postulantes, y estado (abierta o cerrada) |
| Crear convocatoria | Puesto, requisitos (experiencia mínima, estudios, ciudad, disponibilidad de turno, habilidades) y destino |
| Página pública de postulación | Lo que ve el postulante: elige la vacante, carga sus datos y sube su currículum. **Autocompletado desde el currículum:** los campos se llenan solos y la persona los revisa. Si ya postuló antes, reutiliza sus datos |
| Postulantes de una convocatoria | Lista con el **porcentaje de cumplimiento de requisitos**, el filtro "cumple al menos 50%" y orden por cumplimiento. Estados: nuevo, preseleccionado, entrevista, contratado, descartado |
| Ficha del postulante | Datos, currículum, qué requisitos cumple y cuáles no, y otras convocatorias a las que postuló |
| Base de postulantes | Todas las personas que alguna vez postularon, filtrables por categoría (puesto, ciudad, experiencia), para invitarlas a otra convocatoria |

### 3.2 Personal (esencial)

| Pantalla | Qué hace |
|---|---|
| Lista de personal | Puesto, cliente y sucursal actuales, turno y calificación. Filtros por cliente, sucursal, ciudad y puesto |
| Ficha de la persona | Contacto, fecha de ingreso y antigüedad, asignación actual, **historial de clientes con fechas**, calificación de 1 a 5 estrellas con comentarios, y permisos o ausencias |

### 3.3 Clientes, sucursales y asignaciones (esencial)

- **Clientes y sus sucursales:** la lógica tiene que ser la misma para 1, 3 o 10 sucursales.
- **Cobertura por sucursal:** cuántas personas pide, por puesto y turno, y cuántas tiene.
- **Asignar personal a una sucursal:** desde la sucursal, o desde la ficha de la persona.

### 3.4 Asistencia y conciliación (esencial, el otro dolor grande)

- **Registro propio:** la asistencia de la empresa, por persona y por día del mes.
- **Subir el reporte del cliente:** Excel o CSV, como el que exporta un biométrico.
- **Conciliación automática:** para cada persona y día, **coincide / no coincide / conflicto**, con el detalle. Por ejemplo: "en nuestro registro vino, en el del cliente no" o "entró a las 8:00 en uno y a las 9:30 en el otro".
- **Resumen por cliente:** días conciliados y días en conflicto por resolver.

### 3.5 Planilla del mes (si da el tiempo)

- Días trabajados ya conciliados, monto por persona y total por cliente, listos para el pago de fin de mes.

### 3.6 Roles (si da el tiempo)

- Un selector de **Gerente** y **Recursos Humanos** que muestre que cada uno ve lo suyo. No hace falta inicio de sesión real.

---

## 4. Qué funciona de verdad y qué es simulado

| Pieza | Propuesta |
|---|---|
| Navegación, listas, fichas, filtros y cambios de estado | Funcionan sobre los datos de ejemplo. Lo que se cambia queda guardado en el navegador, y un botón "Reiniciar demo" vuelve al estado inicial |
| Porcentaje de cumplimiento de requisitos | **Funcional:** compara los requisitos de la vacante con los datos de la persona |
| Postulación pública | **Funcional dentro de la demo:** quien postula aparece en la lista de postulantes con su porcentaje |
| Conciliación de asistencia | **Funcional:** se sube un Excel o CSV de ejemplo, preparado con diferencias plantadas, y se cruza de verdad. Es lo que más convence en una reunión |
| Autocompletado desde el currículum | **A decidir:** real (IA leyendo el PDF) o simulado (un currículum de ejemplo que llena los campos). Lo real impresiona más, pero suma riesgo y costo a una demo |
| Planilla | Calculada a partir de la asistencia conciliada |

---

## 5. Datos de ejemplo

- **Empresa:** "Empresa ADC" (nombre provisional), con oficina principal en Cochabamba y otra en La Paz.
- **Clientes:** 4 o 5 de distintos rubros: un banco con 10 sucursales, una comercializadora con 3, una clínica, un edificio de oficinas.
- **Personal:** unas 40 personas.
  - **Puestos:** limpieza, recepción, conserje, seguridad, auxiliar administrativo.
  - **Asignación:** turnos y sucursales repartidos.
  - **Historial:** de 1 a 3 clientes anteriores.
  - **Calificaciones:** variadas, de 3 a 5 estrellas, con algún comentario.
- **Convocatorias:** 3 abiertas y 1 cerrada.
- **Postulantes:** de 15 a 30 por convocatoria, con cumplimientos variados para que el filtro del 50% muestre algo. Algunas personas postulan a más de una convocatoria.
- **Asistencia:** un mes completo para el personal de 2 clientes, y un reporte del cliente con 5 a 10 diferencias plantadas (faltas, horarios distintos, un día que solo aparece en un registro).
- **Nombres:** realistas de Bolivia, pero inventados. **Nada de datos reales de Tueri.**

---

## 6. Cómo construirlo (propuesta)

- **Tecnología:** Next.js (App Router), Tailwind CSS y componentes shadcn/ui, para que se vea como un producto de Zékiri. Antes de escribir código, revisar la versión de Next.js instalada y su documentación, porque cambia seguido.
- **Sin base de datos:**
  - los datos de ejemplo van en archivos del proyecto (JSON o TypeScript);
  - lo que se cambia en la demo se guarda en el navegador;
  - no hay nada que cuidar después de la demo.
- **Archivos de ejemplo para la conciliación:** dejar en el repositorio el Excel o CSV del cliente, listo para subir durante la demo.
- **Despliegue:** Vercel, en un proyecto propio. El dominio está por decidir.

**Convenciones de Zékiri:**

- **Interfaz:** en español neutro, sin voseo ni regionalismos.
- **Sin emojis:** se usan íconos (por ejemplo, lucide-react).
- **Nombres en el código:** también en español, completos y sin abreviaturas crípticas.
- **Documentos de trabajo:** en Markdown.
- **Commits y push:** los hace Diego; Claude le pasa los comandos.

---

## 7. Cronograma (con la demo el jueves 22/10)

| Día | Trabajo |
|---|---|
| **Viernes 16/10** | Repositorio, estructura, navegación, diseño base y datos de ejemplo |
| **Lunes 19/10** | Reclutamiento: convocatorias, postulantes con porcentaje de cumplimiento, ficha del postulante y base de postulantes |
| **Martes 20/10** | Página pública de postulación con autocompletado. Personal: lista y ficha con historial y calificación |
| **Miércoles 21/10** | Clientes, sucursales y asignaciones. Asistencia: subida del reporte del cliente y conciliación. Si da el tiempo: planilla y selector de rol. Despliegue |
| **Jueves 22/10** | Recorrido completo de prueba, ajustes y guion de la presentación. Demo |

---

## 8. Recorrido sugerido para presentarla

1. **Convocatorias:** "tienen tres vacantes abiertas a la vez".
2. **Postulación:** postular desde la página pública con un currículum, y ver cómo se autocompleta.
3. **Postulantes:** volver a la convocatoria, ver al nuevo postulante con su porcentaje, filtrar "cumple al menos 50%" y preseleccionar.
4. **Base de postulantes:** reutilizar a alguien para otra vacante.
5. **Personal:** abrir la ficha de una persona, con su historial de clientes, su calificación y su asignación actual.
6. **Clientes:** el banco y sus 10 sucursales, con la cobertura de cada una y una asignación nueva.
7. **Asistencia:** subir el reporte del biométrico y ver la conciliación con los conflictos marcados.
8. **Planilla del mes**, si se construyó.

---

## 9. Decisiones

### Tomadas (16/10/2026)

1. **Nombre de la plataforma:** **Tercia**. Reemplaza a "Módulo de Recursos Humanos" en la interfaz y la presentación.
2. **Autocompletado del currículum:** determinista, sin IA. Los currículums de ejemplo del repositorio se reconocen al subirlos y llenan los campos con sus datos; con cualquier otro archivo, la persona llena el formulario a mano.
3. **Planilla:** tarifa por puesto.
4. **Conciliación:** una diferencia de más de 15 minutos en la hora de entrada o salida se marca como conflicto.
5. **Filtro de cumplimiento:** 50% por defecto y ajustable.
6. **Roles:** Recursos Humanos opera el reclutamiento, la asistencia y las asignaciones; el Gerente ve resúmenes, cobertura y planilla.
7. **Asistencia de ejemplo:** para el banco (10 sucursales) y la comercializadora (3 sucursales).

### Pendientes

1. **Dominio del despliegue.**
2. **Nombre de la empresa de ejemplo:** ¿queda "Empresa ADC"?
3. **Fecha de la demo:** confirmar el jueves 22/10 con Dani.
4. **Referencia de Richi:** pedirle a Dani la plataforma de asistencias para colegios y revisarla antes del miércoles.

---

## Anexo — Transcripción de la reunión con Dani (15/10/2026)

> Tueri es una empresa que terciariza servicios es decir que por ejemplo, No sé si una clínica o qué sé yo, ¿no? Entonces, él tiene todo el personal que pueden ser también contadores o cualquier otro tipo de personal que puede ser operativo o administrativo, pero digamos que los recluta y los presta, digamos, a las otras empresas. Entonces, la mayoría de las empresas privadas, creo que públicas también, les conviene contratar el servicio así terciarizado, porque no se hacen cargo de toda la carga patronal, digamos, ¿no? Entonces, bueno, empresas que terciarizan recursos humanos como, que son terciarizadoras de recursos humanos como Tueri, hay varias, pero, bueno, ahí entra la complicación de que, uno, sacan una convocatoria y les llegan varios currículums y tienen que revisar uno por uno porque les llega el correo y, bueno, al mismo tiempo al correo le siguen llegando de otras convocatorias o de otras cosas. Entonces, ahí la verdad que se pierde, se pierde mucho tiempo porque no lanzan una convocatoria a la vez, ¿no? Y además, ¿cuántos, cuántos currículums recibirán a la vez? Y, bueno, ahí, ahí es un poco complicado.
>
> Entonces, sí creo ahí que podemos hacer alguna plataforma, alguna cosa y yo en mi búsqueda de trabajo sí me ha tocado muchas veces no solo mandar mi currículum, sino entrar a una plataforma, registrar mis datos o subir mi currículum y que con la, no sé si con la IA o con algo, ya se jalan mis datos al formulario y como que se autocompletan y hay que revisar. Y después hay otras plataformas más avanzadas que incluso te dan las pruebas psicotécnicas y demás. Bueno, creo que eso es muy avanzado.
>
> Lo que podríamos hacer ahora es enfocarnos en que se puedan recibir las postulaciones y se vaya armando una base de datos de los postulantes y que vaya habiendo una, un primer filtro, digamos, ¿no? O que haya una clasificación por categorías o qué sé yo. Entonces, cosa que ya le pueda dar al usuario una lista de quiénes han postulado y quiénes cumplen por lo menos un 40 o 50% de los requisitos como primer filtro, ¿no? Entonces, creo que eso va a ser súper útil. Es un feature que les va a servir bastante.
>
> Y ya después de eso, que está la gestión del personal, bueno, la convocatoria, él tiene todo su personal y dice, bueno, estos seis van a ir a este banco, estos otros tres van a ir a esta comercializadora y, bueno, así de acuerdo a lo que necesiten. Entonces, hay turnos y me dice, tengo que yo ver la asistencia con lo que tengo registrado y también con la empresa, que puede ser el banco que tiene su biométrico, digamos, que le pasa su registro. Entonces, él tiene que como que cuadrar con los dos registros para ver las asistencias y con eso ya a fin de mes hacer el pago.
>
> Y, bueno, o sea, entre el registro del uno más el registro que él tiene, igual ahí hay como que un tiempo que tiene que estar haciendo para verificar que tienen el mismo registro, ¿no? Entonces, tal vez subir el reporte del cliente y que lo contraste con el registro que se tiene y automáticamente le diga coincide, no coincide o este día está en conflicto porque aquí dice que ha venido y aquí no. Entonces, bueno, ese es otro tema. Y después, sí, la asignación del personal de cuándo ha entrado, cuándo ha salido, cuánto se le está pagando, tener los datos de ese personal, ¿no? La información de contactos y es que, bueno, no sé si les pedirán garantía, eso creo que podemos obviarlo en este momento.
>
> Ellos nos dirán si es algo que necesitan. Creo que sería importante también tener una especie de calificación, ¿no? De este empleado ha tenido buen feedback, digamos, entonces ya lo tienen con cinco estrellas, cuatro estrellas, no sé. Me parece que sería bueno porque así él sabe dónde mandar a sus clientes más importantes.
>
> Obviamente todos tienen que ser buenos, pero, bueno, siempre hay alguien que se destaca y con quien más puede confiar, entonces tener esa clasificación también puede ser bueno. Y de lo que me has mandado aquí, sí, este es el de Tueri, ¿no? Claro, aquí obviamente no, en equipo, ¿no? Entonces, sí, igual un rol para el gerente y luego la gente de recursos humanos. Tendría que tener también, o sea, que tú puedas entrar a ver al empleado y que ahí te diga a qué cliente está asignado, o sea, cuánto tiempo ya está trabajando con Tueri, con cuántos clientes ha trabajado, en qué tiempos, que puedas tener toda esa data de esa persona, ¿no? Si son nuevos, si son antiguos, el tema de permisos, un poco parecido a, no sé si es igual, pero, bueno, el Rich ha hecho también una plataforma para colegios, entonces ahí también había el reporte de asistencias, ¿no? Entonces, bueno, te voy a pasar el que ha hecho para que los, no sé si lo has visto, creo que se lo he presentado a Pau, pero, bueno, te lo voy a pasar igual, tal vez te sirve algo de referencia.
>
> Entonces, claro, esto está súper bien, ¿no? Entonces, qué está haciendo el puesto, es limpieza, es recepción, conserje, con qué cliente está, en qué sucursal, en qué turno. De hecho, esta empresa está en Cochabamba, tiene también, o sea, su principal está en Cochabamba y tiene también en La Paz y, bueno, se está expandiendo. Entonces, le va a servir también por sucursal, incluso si está con un banco, el mismo banco le puede decir, necesito para 10 de mis sucursales.
>
> Entonces, es el mismo cliente, pero con 10 sucursales y ahí también ver cómo se hace, cómo se hace el manejo, ¿no? Por ahí pueden ser 3, pero pueden ser 10 también. Entonces, creo que la misma lógica funcionaría sin importar la cantidad de sucursales que haya, ¿no? Entonces, eso es lo que necesita Tueri. Sí, esto, como te digo, como base lo he visto bien, pero no sé si es necesario hacer algo más robusto por esto que te cuento de la, del reclutamiento.
>
> Y en otros casos, como otra empresa de limpieza, igual que nos ha contactado, ellos prácticamente hacen lo mismo, ¿no? Entonces, dan limpieza a muchas empresas, entonces igual tienen que reclutar. Obviamente, ya es un rubro específico porque solo hacen limpieza, pero sí necesitan reclutar, asignar a sus diferentes clientes, entonces tener todo centralizado. Y también serviría para cualquier otra empresa que si bien no tiene que mandar a su personal a otros clientes, sí lo tiene que mandar a otras sucursales y tiene que hacer el reclutamiento y estos filtros.
>
> Hay plataformas aquí, creo que una se llama Evaluar, otra se llama, ay, bueno, ya no me acuerdo, pero esas creo que sí son, deben ser más caras, me imagino, ¿no? Entonces, con que tengamos una plataforma que haga lo básico de que la persona se registre, quede en sus datos, en una base de datos y esté ahí su currículum y luego pueda aplicar directamente a otras vacantes en la plataforma, puede funcionar bien. Sin necesidad de agregar todavía que se hagan pruebas, pruebas psicotécnicas y demás. Entonces, eso es, ¿cómo lo ves? Sí, yo voy a volver a contactarlo a este chico y yo creo que para la próxima semana, pero entonces para proponerle fechas también le podría decir el próximo jueves, ¿o cómo lo ves? Ya, súper.
>
> Sí, y como te digo, esto nos va a servir ya para varios clientes. Entonces, no le pongas específicamente Tuery, digamos, no, pero Empresa ADC y sí lo vamos a poder mostrar como módulo de recursos humanos a varios clientes. Súper, Diego, mil gracias y ya cualquier cosita igual me escribes.
