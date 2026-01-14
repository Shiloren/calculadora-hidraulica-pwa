/**
 * Calculadora Hidráulica - App Controller
 * Manages UI, Events, and History.
 */

const App = {
    historyKey: 'hydro_calc_history',

    init: () => {
        App.bindEvents();
        App.loadHistory();
        App.checkInstall();
    },

    bindEvents: () => {
        document.getElementById('btn-calculate').addEventListener('click', App.handleCalculate);
        document.getElementById('select-material').addEventListener('change', App.handleMaterialChange);
        document.getElementById('btn-clear-history').addEventListener('click', App.clearHistory);

        // Cargar historial al hacer click
        document.getElementById('history-list').addEventListener('click', (e) => {
            const item = e.target.closest('.history-item');
            if (item) {
                const data = JSON.parse(decodeURIComponent(item.dataset.json));
                App.loadFromHistory(data);
            }
        });
    },

    checkInstall: () => {
        // Logic solely for showing "Add to Home Screen" hint if needed
        // For MVP we just assume standard browser behavior, user knows or sees banner
        if (localStorage.getItem('install_seen')) return;

        // Simple logic: if iOS and not standalone
        const isIOS = /iPad|iPhone|iPod/.test(navigator.userAgent) && !window.MSStream;
        const isStandalone = window.navigator.standalone || window.matchMedia('(display-mode: standalone)').matches;

        if (isIOS && !isStandalone) {
            // Show simple message - could be a toast or card
            // For simplicity in MVP, we skip complex modals unless requested.
            // We'll mark as seen to be safe.
            localStorage.setItem('install_seen', 'true');
        }
    },

    handleMaterialChange: (e) => {
        const val = e.target.value;
        const input = document.getElementById('input-roughness');
        if (val === 'custom') {
            input.style.display = 'block';
            input.focus();
        } else {
            input.style.display = 'none';
            input.value = val;
        }
    },

    loadFromHistory: (data) => {
        // Populate inputs
        document.getElementById('input-q').value = data.inputs.q;
        document.getElementById('input-d').value = data.inputs.d;
        document.getElementById('input-l').value = data.inputs.l;

        // Set advanced options if present
        if (data.inputs.k) document.getElementById('input-k').value = data.inputs.k;

        // Select logic for roughness
        const select = document.getElementById('select-material');
        const rough = data.inputs.roughness;
        let found = false;
        for (let i = 0; i < select.options.length; i++) {
            if (Math.abs(select.options[i].value - rough) < 0.00001) {
                select.selectedIndex = i;
                document.getElementById('input-roughness').style.display = 'none';
                found = true;
                break;
            }
        }
        if (!found) {
            select.value = 'custom';
            const rInput = document.getElementById('input-roughness');
            rInput.style.display = 'block';
            rInput.value = rough;
        }

        // Scroll top
        window.scrollTo({ top: 0, behavior: 'smooth' });
    },

    handleCalculate: () => {
        // 1. Get Inputs
        const q_ls = parseFloat(document.getElementById('input-q').value);
        const d_mm = parseFloat(document.getElementById('input-d').value);
        const l_m = parseFloat(document.getElementById('input-l').value);

        const roughness_mm = parseFloat(document.getElementById('input-roughness').value) || 0;
        const kLocal = parseFloat(document.getElementById('input-k').value) || 0;

        // 2. Clear Messages
        const msgWarn = document.getElementById('msg-warning');
        const msgErr = document.getElementById('msg-error');
        msgWarn.classList.add('hidden');
        msgErr.classList.add('hidden');
        document.getElementById('results-area').classList.add('hidden');

        // 3. Validation
        if (isNaN(q_ls) || isNaN(d_mm) || isNaN(l_m) || q_ls <= 0 || d_mm <= 0 || l_m <= 0) {
            msgErr.textContent = "Por favor ingresa valores válidos (mayores a 0).";
            msgErr.classList.remove('hidden');
            return;
        }

        // 4. Convert Units
        const q = q_ls / 1000; // l/s -> m3/s
        const d = d_mm / 1000; // mm -> m
        const roughness = roughness_mm / 1000; // mm -> m

        // 5. Calculate
        const res = Engine.calculateDarcy(q, d, l_m, roughness, kLocal);

        // 6. Display Results
        App.displayResults(res);

        // 7. Save to History
        App.saveToHistory({
            q: q_ls, d: d_mm, l: l_m, roughness: roughness_mm, k: kLocal
        }, res);
    },

    displayResults: (res) => {
        const area = document.getElementById('results-area');
        area.classList.remove('hidden');
        area.scrollIntoView({ behavior: 'smooth', block: 'start' });

        document.getElementById('res-total').textContent = res.totalLoss.toFixed(3) + ' m';
        document.getElementById('res-friction').textContent = res.frictionLoss.toFixed(3) + ' m';
        document.getElementById('res-local').textContent = res.localLoss.toFixed(3) + ' m';

        const v = res.v;
        const vEl = document.getElementById('res-velocity');
        vEl.textContent = v.toFixed(2) + ' m/s';

        // Velocity Color Check
        if (v < 0.6 || v > 3.0) {
            vEl.style.color = 'var(--color-warning)';
        } else {
            vEl.style.color = 'var(--color-success)';
        }

        document.getElementById('res-reynolds').textContent = Math.round(res.re).toLocaleString();

        const regEl = document.getElementById('res-regime');
        regEl.textContent = res.flowRegime;

        // Regime Logic
        if (res.flowRegime === 'Laminar') regEl.style.color = 'var(--color-success)';
        else if (res.flowRegime === 'Transición') regEl.style.color = 'var(--color-warning)';
        else regEl.style.color = 'var(--color-text-main)';

        // Warnings
        if (res.flowRegime === 'Transición') {
            const w = document.getElementById('msg-warning');
            w.textContent = "⚠ Flujo en transición. El cálculo puede ser inestable.";
            w.classList.remove('hidden');
        }
        if (v > 3.0) {
            const w = document.getElementById('msg-warning');
            w.textContent = (w.textContent ? w.textContent + "\n" : "") + "⚠ Velocidad alta (> 3 m/s). Riesgo de erosión/ruido.";
            w.classList.remove('hidden');
        } else if (v < 0.6) {
            const w = document.getElementById('msg-warning');
            w.textContent = (w.textContent ? w.textContent + "\n" : "") + "⚠ Velocidad baja (< 0.6 m/s). Riesgo de sedimentación.";
            w.classList.remove('hidden');
        }
    },

    saveToHistory: (inputs, results) => {
        const newItem = {
            id: Date.now(),
            date: new Date().toLocaleString('es-ES'),
            inputs: inputs,
            results: { total: results.totalLoss.toFixed(2) + 'm' }
        };

        let history = JSON.parse(localStorage.getItem(App.historyKey) || '[]');
        history.unshift(newItem);
        if (history.length > 20) history = history.slice(0, 20);

        localStorage.setItem(App.historyKey, JSON.stringify(history));
        App.renderHistory(history);
    },

    loadHistory: () => {
        const history = JSON.parse(localStorage.getItem(App.historyKey) || '[]');
        App.renderHistory(history);
    },

    clearHistory: () => {
        if (confirm('¿Borrar todo el historial?')) {
            localStorage.removeItem(App.historyKey);
            App.renderHistory([]);
        }
    },

    renderHistory: (history) => {
        const list = document.getElementById('history-list');
        list.innerHTML = '';

        if (history.length === 0) {
            list.innerHTML = '<div class="empty-state">No hay cálculos recientes</div>';
            return;
        }

        history.forEach(item => {
            const div = document.createElement('div');
            div.className = 'history-item';
            div.dataset.json = encodeURIComponent(JSON.stringify(item));
            div.innerHTML = `
                <div class="h-date">${item.date}</div>
                <div class="h-summary">Q: ${item.inputs.q} l/s | \u00D8: ${item.inputs.d} mm | L: ${item.inputs.l} m</div>
                <div class="h-result">Pérdida: ${item.results.total}</div>
            `;
            list.appendChild(div);
        });
    }
};

// Start
document.addEventListener('DOMContentLoaded', App.init);
