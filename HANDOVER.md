# 🔄 Protocolo de Handover - Hydrocálculo

## 📋 Contexto del Proyecto
**Proyecto**: Hydrocálculo (PWA)
**Descripción**: Calculadora hidráulica de pérdidas de carga (Darcy-Weisbach) diseñada como herramienta profesional tipo "Apple" para ingenieros y operarios.
**Stack**: Vanilla JS (ES Modules), CSS Variables, HTML5, PWA (Manifest + SW).

## 🛠 Estado Técnico (v1.1 Premium)
- **Motor Matemático**: `src/js/engine`. Fórmulas explícitas (Swamee-Jain). **Estable**.
- **Controlador**: `src/js/app/app.js`. Maneja validación estricta y lógica de negocio.
- **UI**: `src/js/app/ui.js` + `css/styles.css`. Diseño "Apple-grade", Sticky Footer, inputs validados.
- **Persistencia**: `localStorage` para historial de cálculos (con de-duplicación).

## 🚨 Reglas Críticas (No romper)
1.  **Validación Fail-Closed**: Nunca permitir que el motor reciba `<=0` o `NaN`. La validación ocurre en `App.calculate`.
2.  **Zero-Dependency**: No instalar frameworks (React, Tailwind, etc.). CSS puro.
3.  **Mobile-First**: El botón "Calcular" debe ser siempre visible (Sticky Bottom).

## ✅ Últimos Cambios Realizados
1.  **PWA "Silent Install"**: Implementado flujo de instalación no intrusivo (Toast). En iOS abre guía visual con iconos custom; en Android lanza prompt nativo.
2.  **UI Moderno & Compacto**: Rediseño a layout "Grid Anti-Scroll". Inputs más densos, eliminación de acordeones y tipografía estilo dashboard.
3.  **Despliegue & Testing**: Publicado en GitHub Pages (`gh-pages`). Generado `src/qr.html` para testeo rápido en móviles.
4.  **Limpieza de Consulta Externa**: Eliminado análisis de marca "Locco Burger" del repositorio para mantener el foco en Hydrocálculo.
5.  **Hardening & Historial**: Validaciones estrictas y de-duplicación de historial mantenidas.

## 📝 Próximos Pasos Sugeridos
1.  Validar comportamiento de scroll en dispositivos físicos iOS (Mobile Safari tiene peculiaridades con `position: fixed` y teclado virtual).
2.  Si el usuario pide más features (ej. exportar PDF), evaluar impacto en el peso de la app (mantener ligero).

## 🤖 Instrucciones para el Siguiente Agente
- Lee `implementation_plan.md` para contexto macro.
- Antes de hacer cambios de código, lanza el servidor local (`python -m http.server`) y verifica el estado actual.
- Mantén este archivo actualizado si cambias arquitectura o lógica core.
