# Tercia

Demo de la plataforma de recursos humanos de Zékiri: reclutamiento con porcentaje de cumplimiento de requisitos, personal, clientes y sucursales, y conciliación de asistencia con el reporte de cada cliente. El plan de trabajo y el contexto están en [plan_Tercia.md](plan_Tercia.md).

Es un frontend con datos de ejemplo: no hay base de datos ni inicio de sesión. Los cambios que se hacen durante la demo se guardan en el navegador, y el botón **Reiniciar demo** vuelve al estado inicial.

## Cómo levantarla

```bash
npm install
npm run dev
```

Abre en http://localhost:3000. La página pública de postulación está en `/postular`.

## Estructura

| Carpeta | Contenido |
|---|---|
| `src/datos/` | Modelo de datos, catálogos y generadores de los datos de ejemplo |
| `src/lib/` | Lógica: cumplimiento de requisitos, consultas, formatos, navegación y roles |
| `src/lib/demo/almacen.ts` | Estado de la demo en `localStorage`, sincronizado entre pestañas |
| `src/components/` | Componentes de pantalla; `ui/` son los de shadcn/ui |
| `src/app/(panel)/` | Panel de Recursos Humanos y Gerente |
| `src/app/(publico)/postular/` | Lo que ve el postulante |
| `public/ejemplos/` | Archivos que se suben durante la demo: currículums en PDF y reportes del biométrico. Su guía está en `public/ejemplos/README.md` |
| `scripts/` | Script que genera los archivos de `public/ejemplos/` |

## Datos de ejemplo

Se generan con un generador pseudoaleatorio de semilla fija (`src/datos/semilla.ts`), así que salen iguales en cada carga y coinciden con los archivos de `public/ejemplos/`. Si se cambia algo de los datos, hay que:

1. regenerar los archivos de ejemplo con `npm run generar:ejemplos`;
2. subir `versionEstadoDemo` en `src/datos/semilla.ts`, para que los navegadores descarten lo guardado.

Los archivos de `src/datos/` y `src/lib/cumplimiento.ts` importan con extensión `.ts` porque también los ejecuta Node directamente desde el script.

El autocompletado del currículum es determinista: la página de postulación reconoce por su nombre los currículums de `src/datos/curriculums.ts` (los mismos que se generan en PDF) y completa el formulario con sus datos.

## Despliegue

En Vercel, importando el repositorio: detecta Next.js solo y no necesita variables de entorno ni base de datos. Cada `git push` a `main` vuelve a publicar la demo.

## Notas de Next.js 16

- Cache Components está activado. Todo lo que depende de los datos de la demo se renderiza solo en el navegador, detrás de `<PuertaNavegador>` (`use(browser())`) dentro de un `<Suspense>`.
- Antes de usar una API de Next.js, revisar `node_modules/next/dist/docs/`.
