## Objetivo

* Entregar una plantilla profesional lista para automatizar con Playwright y TypeScript, incluyendo estructura modular, acciones custom con evidencia visual, reporter HTML personalizado, ESLint/Prettier, ejemplos de test y documentación.

## Estructura del Proyecto

* `project/`

  * `src/`

    * `selectors/` → constantes de selectores (ej. `login.selectors.ts`)

    * `steps/` → pasos del flujo (ej. `login.steps.ts`)

    * `actions/` → `customActions.ts` con click/type/hover instrumentados

    * `pages/` → `login.page.ts` (Page Object usa selectors + actions)

    * `utils/` → `reporterUtils.ts` helpers comunes

    * `tests/` → `login.test.ts` usa selectors, steps y acciones

  * `reports/`

    * `reporter.ts` (Reporter custom de Playwright)

    * `templates/` → `index.html`, `styles.css`

    * `assets/` → copias de evidencias (screenshots)

    * `output/` → `index.html` generado y recursos

  * `playwright.config.ts`

  * `package.json`

  * `tsconfig.json`

  * `.eslintrc.cjs`, `.prettierrc`

  * `README.md`, `DOCUMENTACION.md`

## Dependencias y Configuración

* Core: `@playwright/test`, `typescript`

* Lint/Format: `eslint`, `@typescript-eslint/parser`, `@typescript-eslint/eslint-plugin`, `eslint-plugin-playwright`, `prettier`, `eslint-config-prettier`

* Reporter: `chart.js` (para dashboard)

* Scripts preparan build TS a `dist/` y usan reporter compilado: `./dist/reports/reporter.js`.

## Scripts de NPM

* `build`: compila TypeScript a `dist/`

* `clean`: limpia `dist/` y `reports/output/`

* `test`: `npm run build && playwright test --reporter=./dist/reports/reporter.js`

* `test:headed`: ejecuta en modo headed

* `test:ui`: `playwright test --ui` (para debug)

* `lint`: corre ESLint

* `format`: corre Prettier

* `report:open`: abre `reports/output/index.html`

* `init`: `playwright install --with-deps`

## Configuración de Playwright

* `playwright.config.ts`:

  * `testDir: './src/tests'`

  * `use`: `baseURL`, `headless`, `screenshot: 'only-on-failure'`, `video: 'retain-on-failure'`, `trace: 'on-first-retry'`

  * `reporter`: apunta a `./dist/reports/reporter.js`

  * `outputDir`: `./reports/.artifacts` para adjuntos

## Estándares de Código

* ESLint con reglas para TS y Playwright (no `test.only` en CI, nombres consistentes)

* Prettier para estilo (comillas simples, 2 espacios, etc.)

## Selectores, Pages y Steps

* `selectors/login.selectors.ts`: exporta funciones que retornan `Locator` basadas en `page`

* `pages/login.page.ts`: clase `LoginPage` que usa selectors y `CustomActions`

* `steps/login.steps.ts`: funciones lógicas:

  * `ingresarUsuario(page, actions, testInfo, usuario)`

  * `ingresarPassword(page, actions, testInfo, password)`

  * `clickLogin(page, actions, testInfo)`

  * `validarMensaje(page, testInfo, esperado)`

* Cada step envuelve acciones dentro de `test.step(...)` para ser capturadas por el reporter.

## Acciones Personalizadas

* `actions/customActions.ts`: clase `CustomActions` con:

  * `customClick(locator)`

  * `customType(locator, text)`

  * `customHover(locator)`

* Comportamiento de cada acción:

  * Dibuja borde rojo: `await locator.evaluate(el => { el.style.border = '3px solid red'; })`

  * Toma screenshot antes y después

  * Adjunta evidencias con `testInfo.attach(...)`

  * Ejecuta la acción real Playwright

* Recibe `page` y `testInfo` en constructor para adjuntos y contexto.

## Reporter Custom (HTML)

* Implementa `Reporter` de Playwright:

  * Escucha `onBegin`, `onTestBegin`, `onStepBegin`, `onStepEnd`, `onTestEnd`, `onEnd`

  * Recopila pasos, estado, duración, adjuntos (screenshots)

  * Genera `reports/output/index.html` a partir de `templates/index.html` y `styles.css`

  * Copia/organiza evidencias en `reports/output/assets/`

  * Dashboard: gráficos con Chart.js (tests por estado, duración por test)

  * Resumen final: totales, tiempos, suites

* Soporta abrir reporte offline con evidencia embebida o referenciada.

## Caso de Prueba Ejemplo

* `src/tests/login.test.ts`:

  * Navega a una página pública ficticia (`https://demo.playwright.dev/todomvc` o un mock simple)

  * Usa `LoginPage` + `CustomActions` + steps

  * Captura screenshots

  * Valida mensaje de login (simulado con UI ficticia o ruta demo)

  * Utiliza `test.step` para granularidad del reporter

## Documentación Técnica

* `DOCUMENTACION.md`:

  * Arquitectura y responsabilidades por carpeta

  * Guía de selectores/steps/pages/acciones

  * Cómo ejecutar y depurar pruebas

  * Cómo extender el framework (nuevos módulos/pages)

  * Mejores prácticas (esperas explícitas, flakiness, datos)

  * Cómo modificar el reporter (templates, estilos, KPIs)

  * Onboarding para QA

* `README.md`: instalación, scripts, uso rápido.

## Instalación y Uso

* `npm i` para dependencias

* `npm run init` para instalar navegadores

* `npm run test` para ejecutar y generar reporte

* `npm run report:open` para ver HTML

## Verificación y Calidad

* Validación local:

  * Ejecutar `lint` y `format`

  * Correr `test` y revisar `reports/output/index.html`

  * Confirmar que los pasos muestran borde rojo y evidencias

## Entregables

* Código completo del proyecto

* Reporter HTML con templates y ejemplo de output

* Acciones custom instrumentadas

* Caso de prueba ejemplo `login.test.ts`

* Documentación exhaustiva `DOCUMENTACION.md` y `README.md`

* Configuración de ESLint/Prettier/TS/Playwright y scripts

## Próximas Extensiones (opcionales)

* Soporte multi-ambiente por `env` (QA/Stage/Prod)

* Integración CI (GitHub Actions) para publicar reporte como artefacto

* Datos de test externos (JSON/YAML) y `fixtures` de Playwright

