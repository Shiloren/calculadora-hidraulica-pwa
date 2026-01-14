/**
 * Engine Facade
 */
import { Losses } from './losses.js';
import { Diagnostics } from './diagnostics.js';

export const Engine = {
    calculate: (params) => {
        // params: q, d, l, roughness, kLocal (todo SI)
        const results = Losses.darcy(
            params.q,
            params.d,
            params.l,
            params.roughness,
            params.kLocal
        );

        const diag = Diagnostics.analyze(results);

        return {
            ...results,
            ...diag
        };
    }
};
