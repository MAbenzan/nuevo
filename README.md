# Playwright + TypeScript Automation Template

Plantilla profesional para automatización de pruebas end-to-end con Playwright y TypeScript, con reporter HTML personalizado, acciones instrumentadas y estructura modular.

## Instalación
- `npm i`
- `npm run init`

## Uso
- `npm run test`
- `npm run test:headed`
- `npm run test:ui`
- `npm run report:open`

## Estructura
```
project
├─ src
│  ├─ selectors
│  │  └─ login.selectors.ts
│  ├─ steps
│  │  └─ login.steps.ts
│  ├─ actions
│  │  └─ customActions.ts
│  ├─ pages
│  │  └─ login.page.ts
│  ├─ utils
│  │  └─ reporterUtils.ts
│  └─ tests
│     └─ login.test.ts
├─ reports
│  ├─ reporter.ts
│  ├─ templates
│  │  ├─ index.html
│  │  └─ styles.css
│  └─ output
├─ playwright.config.ts
├─ tsconfig.json
├─ package.json
├─ .eslintrc.cjs
├─ .prettierrc
└─ DOCUMENTACION.md
```

## Notas
- El reporter se compila a `./dist/reports/reporter.js` y se referencia desde `playwright.config.ts`.
- Las evidencias se copian a `reports/output/assets/` y se visualizan en `reports/output/index.html`.