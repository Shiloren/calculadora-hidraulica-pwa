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
1.  **Hardening & Chaos Monkey**: El sistema sobrevivió a pruebas de estrés ("Chaos Monkey"). Se implementó validación estricta y manejo de errores para valores negativos, cero, y no numéricos.
2.  **UX Premium & Rebranding**: Renombrado a "Hydrocálculo". Interfaz "Apple-grade" con tipografía, colores y sombras refinadas.
3.  **Sticky Footer & Layout**: Solución robusta para botones de acción fijos en móviles (`position: fixed`).
4.  **Lógica de Historial**: Implementada de-duplicación para evitar entradas repetidas en `localStorage`.
5.  **Onboarding PWA**: Detección de SO para instrucciones de instalación.

## 📝 Próximos Pasos Sugeridos
1.  Validar comportamiento de scroll en dispositivos físicos iOS (Mobile Safari tiene peculiaridades con `position: fixed` y teclado virtual).
2.  Si el usuario pide más features (ej. exportar PDF), evaluar impacto en el peso de la app (mantener ligero).

## 🤖 Instrucciones para el Siguiente Agente
- Lee `implementation_plan.md` para contexto macro.
- Antes de hacer cambios de código, lanza el servidor local (`python -m http.server`) y verifica el estado actual.
- Mantén este archivo actualizado si cambias arquitectura o lógica core.
