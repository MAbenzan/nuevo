# Documentación Técnica: Plantilla Playwright + TypeScript

## Arquitectura del Proyecto
- `src/selectors`: Define selectores de UI centralizados por página.
- `src/pages`: Page Objects que encapsulan interacción y estado.
- `src/actions`: Acciones personalizadas instrumentadas con evidencia.
- `src/steps`: Pasos lógicos reutilizables del flujo.
- `src/utils`: Utilidades comunes.
- `src/tests`: Casos de prueba usando steps, pages y acciones.
- `reports`: Reporter HTML custom, templates y salida.

## Selectores
- Ubique todos los selectores en `src/selectors`.
- Ejemplo: `login.selectors.ts` exporta funciones que retornan `Locator` a partir de `page`.

## Steps
- `src/steps` contiene funciones como `ingresarUsuario`, `ingresarPassword`, `hacerClickLogin`, `validarMensaje`.
- Cada step envuelve la acción en `test.step(...)` para trazabilidad y reporter.

## Acciones Custom
- `src/actions/customActions.ts` implementa `customClick`, `customType`, `customHover`.
- Cada acción: aplica borde rojo con `evaluate`, captura screenshot antes/después y adjunta al reporte.
- Use `new CustomActions(page, testInfo)` para inicializar.

## Pages
- `LoginPage` combina selectores y acciones para flujos de alto nivel.
- Ejemplo `login`: llena usuario y password, ejecuta click y adjunta evidencia.

## Reporter Custom
- `reports/reporter.ts` implementa `Reporter` de Playwright.
- Recopila pasos, estado, duración, adjuntos y genera `reports/output/index.html` usando `templates/index.html` y `styles.css`.
- Dashboard con Chart.js (CDN).
- Evidencias en `reports/output/assets/`.

## Ejecución de Pruebas
- `npm run test` compila y ejecuta con reporter custom.
- `npm run test:headed` para modo con navegador visible.
- `npm run test:ui` para interfaz de Playwright.

## Extensión del Framework
- Agregue nuevos módulos creando archivos en `selectors`, `pages`, `steps` y `tests`.
- Mantenga selectores en un solo lugar, evite duplicidad.
- Cree nuevas acciones en `actions` para instrumentar flujos complejos.

## Mejores Prácticas
- Use `expect` con timeouts razonables.
- Evite `waitForTimeout`; prefiera esperas basadas en estado.
- Nombre claro para steps y adjuntos.
- Mantenga el reporter y templates desacoplados.

## Modificación del Reporte
- Edite `reports/templates/index.html` y `styles.css` para ajustar layout y estilos.
- Use la estructura JSON embebida para agregar KPIs.

## Guía para Nuevos QA
- Instale dependencias y navegadores.
- Revise `login.test.ts` como ejemplo.
- Use Page Objects y Steps para reutilización.
- Verifique el reporte en `reports/output/index.html`.