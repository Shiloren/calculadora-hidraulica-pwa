/**
 * Cálculo de Pérdidas de Carga
 */
import { Fluids } from './fluids.js';
import { Friction } from './friction.js';

export const Losses = {
    /**
     * Darcy-Weisbach (SI Puro)
     */
    darcy: (q, d, l, roughness, kLocal) => {
        const v = Friction.velocity(q, d);
        const re = Friction.reynolds(v, d);
        const f = Friction.factor(re, roughness, d);

        // hf = f * (L/D) * (v^2 / 2g)
        const frictionLoss = (f * (l / d) * Math.pow(v, 2)) / (2 * Fluids.GRAVITY);

        // hl = K * (v^2 / 2g)
        const localLoss = (kLocal * Math.pow(v, 2)) / (2 * Fluids.GRAVITY);

        return {
            method: 'Darcy-Weisbach',
            v,
            re,
            f, // f de Darcy
            frictionLoss: frictionLoss || 0,
            localLoss: localLoss || 0,
            totalLoss: (frictionLoss + localLoss) || 0
        };
    },

    /**
     * Hazen-Williams (SI Puro) - Solo Agua
     */
    hazen: (q, d, l, c, kLocal) => {
        const v = Friction.velocity(q, d);
        const re = Friction.reynolds(v, d);

        // hf = 10.67 * L * (Q/C)^1.852 * D^-4.87
        const term1 = 10.67 * l;
        const term2 = Math.pow(q / c, 1.852);
        const term3 = Math.pow(d, 4.8704); // Exponente ajustado para SI

        const frictionLoss = (term1 * term2) / term3;
        const localLoss = (kLocal * Math.pow(v, 2)) / (2 * Fluids.GRAVITY);

        return {
            method: 'Hazen-Williams',
            v,
            re,
            frictionLoss: frictionLoss || 0,
            localLoss: localLoss || 0,
            totalLoss: (frictionLoss + localLoss) || 0
        };
    }
};
