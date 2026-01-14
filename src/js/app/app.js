/**
 * Main Application Controller
 */
import { Engine } from '../engine/index.js';
import { Storage } from './storage.js';
import { UI } from './ui.js';

const App = {
    init: () => {
        // PWA Install Capture
        window.addEventListener('beforeinstallprompt', (e) => {
            e.preventDefault();
            window.deferredPrompt = e;
            // Delay showing prompt slightly for better UX
            setTimeout(UI.showInstallPrompt, 2000);
        });

        // Manual iOS check
        setTimeout(UI.showInstallPrompt, 2000);

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
        // 1. Get RAW strings first to check for emptiness/format
        const qVal = document.getElementById('input-q').value;
        const dVal = document.getElementById('input-d').value;
        const lVal = document.getElementById('input-l').value;

        // 2. Parse numbers (Fail-Closed if NaN)
        const q = UI.normalization.parse(qVal);
        const d = UI.normalization.parse(dVal);
        const l = UI.normalization.parse(lVal);

        // 3. Strict Validation
        if (isNaN(q) || isNaN(d) || isNaN(l)) {
            UI.showError("Por favor verifica los números. Usa coma (,) o punto (.).");
            return;
        }

        if (q <= 0 || d <= 0 || l <= 0) {
            UI.showError("Caudal, Diámetro y Longitud deben ser mayores a 0.");
            return;
        }

        // 4. Advanced Params
        const roughVal = document.getElementById('input-roughness').value;
        const kVal = document.getElementById('input-k').value;
        const roughness = UI.normalization.parse(roughVal);
        const k = UI.normalization.parse(kVal);

        if ((roughness < 0 && roughVal !== '') || k < 0) {
            UI.showError("Valores físicos imposibles (negativos).");
            return;
        }

        // 5. SI Conversion for Engine
        const params = {
            q: q / 1000,
            d: d / 1000,
            l: l,
            roughness: roughness / 1000,
            kLocal: k
        };

        // 6. Engine Call
        const res = Engine.calculate(params);

        // 7. Render Params
        UI.renderResults(res);

        // 8. Save (De-duplication Optimized)
        const uiInputs = { q, d, l, roughness, k };
        const lastEntry = Storage.load()[0]; // Peek last

        // Deep compare of clean values
        const isDuplicate = lastEntry && JSON.stringify(lastEntry.uiInputs) === JSON.stringify(uiInputs);

        if (!isDuplicate) {
            const historyEntry = {
                id: Date.now(),
                date: new Date().toLocaleString(),
                uiInputs: uiInputs,
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
