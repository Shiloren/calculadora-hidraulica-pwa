/**
 * Diagnóstico y Validaciones de Rango
 */

export const Diagnostics = {
    analyze: (results) => {
        const warnings = [];
        const errors = [];
        let regime = 'Indeterminado';

        // 1. Régimen
        if (results.re < 2000) regime = 'Laminar';
        else if (results.re >= 2000 && results.re < 4000) {
            regime = 'Transición';
            warnings.push("Flujo en zona de transición (Re 2000-4000). Resultados inestables.");
        }
        else regime = 'Turbulento';

        // 2. Velocidad
        if (results.v < 0.6) warnings.push("Velocidad baja (< 0.6 m/s). Riesgo de sedimentación.");
        if (results.v > 3.0) warnings.push("Velocidad alta (> 3.0 m/s). Posible ruido/erosión.");

        return {
            regime,
            warnings,
            errors
        };
    }
};
