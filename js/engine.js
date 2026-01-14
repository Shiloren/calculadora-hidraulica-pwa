/**
 * Calculadora Hidráulica - Motor Matemático
 * Pure JS, no DOM dependencies.
 */

const CONSTANTS = {
    g: 9.80665, // Aceleración gravedad (m/s²)
    nu: 1.004e-6 // Viscosidad cinemática agua a 20°C (m²/s)
};

const Engine = {
    /**
     * Calcula la velocidad del fluido.
     * @param {number} q Caudal (m³/s)
     * @param {number} d Diámetro interno (m)
     * @returns {number} Velocidad (m/s)
     */
    calculateVelocity: (q, d) => {
        if (d <= 0) return 0;
        const area = (Math.PI * Math.pow(d, 2)) / 4;
        return q / area;
    },

    /**
     * Calcula el Número de Reynolds.
     * @param {number} v Velocidad (m/s)
     * @param {number} d Diámetro (m)
     * @returns {number} Reynolds (adimensional)
     */
    calculateReynolds: (v, d) => {
        if (CONSTANTS.nu === 0) return 0;
        return (v * d) / CONSTANTS.nu;
    },

    /**
     * Calcula el factor de fricción (f) usando Swamee-Jain o Laminar.
     * @param {number} re Reynolds
     * @param {number} epsilon Rugosidad absoluta (m)
     * @param {number} d Diámetro (m)
     * @returns {number} Factor de fricción
     */
    calculateFrictionFactor: (re, epsilon, d) => {
        if (re === 0) return 0;
        
        // Régimen Laminar
        if (re < 2000) {
            return 64 / re;
        }
        
        // Turbulento o Transición (Usando Swamee-Jain como aproximación explícita)
        // Swamee-Jain es válida para Re > 5000 y 10^-6 < e/D < 10^-2
        // Para fines de este MVP, la usaremos por encima de 2000 con advertencia en UI.
        // f = 0.25 / [log10(e/3.7D + 5.74/Re^0.9)]^2
        
        const roughnessRatio = epsilon / (3.7 * d);
        const reynoldsTerm = 5.74 / Math.pow(re, 0.9);
        
        const logVal = Math.log10(roughnessRatio + reynoldsTerm);
        const f = 0.25 / Math.pow(logVal, 2);
        
        return f;
    },

    /**
     * Calcula pérdida de carga por Darcy-Weisbach.
     */
    calculateDarcy: (q, d, length, roughness, kLocal = 0) => {
        const v = Engine.calculateVelocity(q, d);
        const re = Engine.calculateReynolds(v, d);
        const f = Engine.calculateFrictionFactor(re, roughness, d);
        
        // Pérdida por fricción: hf = f * (L/D) * (v^2/2g)
        const frictionLoss = (f * (length / d) * Math.pow(v, 2)) / (2 * CONSTANTS.g);
        
        // Pérdida localizada: hl = K * (v^2/2g)
        const localLoss = (kLocal * Math.pow(v, 2)) / (2 * CONSTANTS.g);
        
        // Diagnóstico
        let flowRegime = 'Laminar';
        if (re >= 2000 && re < 4000) flowRegime = 'Transición';
        if (re >= 4000) flowRegime = 'Turbulento';

        return {
            method: 'Darcy-Weisbach',
            v: v,
            re: re,
            f: f,
            flowRegime: flowRegime,
            frictionLoss: frictionLoss || 0,
            localLoss: localLoss || 0,
            totalLoss: (frictionLoss + localLoss) || 0
        };
    },

    /**
     * Calcula pérdida de carga por Hazen-Williams (Solo agua).
     * V = 0.849 * C * R^0.63 * S^0.54
     * hf = 10.67 * (Q^1.852 / (C^1.852 * D^4.87)) * L
     */
    calculateHazen: (q, d, length, c, kLocal = 0) => {
         const v = Engine.calculateVelocity(q, d);
         // Hazen-Williams explícito para pérdidas (SI)
         // hf = 10.674 * L * (Q/C)^1.852 * D^-4.8704
         // Cuidado con unidades. Q en m3/s, D en m.
         
         const numerator = 10.67 * length * Math.pow(q / c, 1.852);
         const denominator = Math.pow(d, 4.8704);
         const frictionLoss = numerator / denominator;
         
         const localLoss = (kLocal * Math.pow(v, 2)) / (2 * CONSTANTS.g);

         return {
            method: 'Hazen-Williams',
            v: v,
            re: Engine.calculateReynolds(v, d), // Informativo
            frictionLoss: frictionLoss || 0,
            localLoss: localLoss || 0,
            totalLoss: (frictionLoss + localLoss) || 0,
            warning: 'Hazen-Williams solo es válido para agua a temperatura ambiente.'
         };
    }
};

// Export para testeo o uso en módulo (aunque usaremos script src en MVP simple)
if (typeof module !== 'undefined') module.exports = Engine;
