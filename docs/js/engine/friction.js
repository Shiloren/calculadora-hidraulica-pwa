/**
 * Cálculo de Fricción
 */
import { Fluids } from './fluids.js';

export const Friction = {
    /**
     * Calcula Velocidad Media (V = Q/A)
     */
    velocity: (q, d) => {
        if (d <= 0) return 0;
        const area = (Math.PI * Math.pow(d, 2)) / 4;
        return q / area;
    },

    /**
     * Calcula Reynolds (Re = V*D / nu)
     */
    reynolds: (v, d) => {
        if (Fluids.WATER_20C.nu === 0) return 0;
        return (v * d) / Fluids.WATER_20C.nu;
    },

    /**
     * Factor de fricción 'f' (Darcy)
     * Laminar: 64/Re
     * Turbulento: Swamee-Jain
     */
    factor: (re, epsilon, d) => {
        if (re <= 0) return 0;

        if (re < 2000) {
            return 64 / re;
        }

        // Swamee-Jain approximation
        // f = 0.25 / [log10( epsilon/(3.7*D) + 5.74/(Re^0.9) )]^2
        const roughnessRatio = epsilon / (3.7 * d);
        const reynoldsTerm = 5.74 / Math.pow(re, 0.9);
        const logVal = Math.log10(roughnessRatio + reynoldsTerm);

        return 0.25 / Math.pow(logVal, 2);
    }
};
