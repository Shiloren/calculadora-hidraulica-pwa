/**
 * Main Application Controller
 */
import { Engine } from '../engine/index.js';
import { Storage } from './storage.js';
import { UI } from './ui.js';

const App = {
    init: () => {
        // Init History
        UI.renderHistory(Storage.load());

        // Bind Events
        UI.inputs.btnCalc.addEventListener('click', App.calculate);
        UI.inputs.btnClear.addEventListener('click', App.clearHistory);
        UI.inputs.material.addEventListener('change', (e) => {
            const val = e.target.value;
            if (val !== 'custom') {
                UI.inputs.roughness.value = val;
                UI.inputs.roughness.style.display = 'none';
            } else {
                UI.inputs.roughness.style.display = 'block';
            }
        });

        // History Callback
        UI.onHistoryClick = (item) => {
            UI.setValues(item.uiInputs);
            window.scrollTo({ top: 0, behavior: 'smooth' });
        };
    },

    calculate: () => {
        const raw = UI.getValues();
        if (!raw) {
            UI.showError("Por favor completa los campos Q, D, L con valores mayores a 0.");
            return;
        }

        // Strict Validation (Chaos Monkey Fix)
        if (raw.q <= 0 || raw.d <= 0 || raw.l <= 0) {
            UI.showError("Caudal, Diámetro y Longitud deben ser positivos.");
            return;
        }
        if (raw.roughness < 0 || raw.k < 0) {
            UI.showError("La rugosidad y coef. K no pueden ser negativos.");
            return;
        }

        // SI Conversion (UI -> Engine)
        // Q: l/s -> m3/s
        // D: mm -> m
        // Roughness: mm -> m

        const params = {
            q: raw.q / 1000,
            d: raw.d / 1000,
            l: raw.l,
            roughness: raw.roughness / 1000,
            kLocal: raw.k
        };

        // Engine Call
        const res = Engine.calculate(params);

        // Render Params
        UI.renderResults(res);

        // Save (De-duplication Check)
        const uiInputs = raw;
        const lastEntry = Storage.load()[0]; // Peek last

        // Simple deep compare of inputs
        const isDuplicate = lastEntry && JSON.stringify(lastEntry.uiInputs) === JSON.stringify(uiInputs);

        if (!isDuplicate) {
            const historyEntry = {
                id: Date.now(),
                date: new Date().toLocaleString(),
                uiInputs: raw,
                loss: res.totalLoss.toFixed(3)
            };
            const newList = Storage.save(historyEntry);
            UI.renderHistory(newList);
        }
    },

    clearHistory: () => {
        if (confirm("¿Borrar historial?")) {
            Storage.clear();
            UI.renderHistory([]);
        }
    }
};

document.addEventListener('DOMContentLoaded', App.init);
