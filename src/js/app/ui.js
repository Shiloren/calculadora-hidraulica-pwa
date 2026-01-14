/**
 * UI Component
 * DOM Manipulation only. No math.
 */

export const UI = {
    inputs: {
        q: document.getElementById('input-q'),
        d: document.getElementById('input-d'),
        l: document.getElementById('input-l'),
        k: document.getElementById('input-k'),
        material: document.getElementById('select-material'),
        roughness: document.getElementById('input-roughness'),
        btnCalc: document.getElementById('btn-calculate'),
        btnClear: document.getElementById('btn-clear-history'),
        historyList: document.getElementById('history-list')
    },

    normalization: {
        // Replace comma with dot and strict parse
        parse: (val) => {
            if (typeof val !== 'string') return 0;
            const normalized = val.replace(',', '.');
            const num = parseFloat(normalized);
            return isNaN(num) ? NaN : num;
        }
    },

    // ... (rest of input getting) ...

    // Install Flow
    showInstallPrompt: () => {
        const isIOS = /iPad|iPhone|iPod/.test(navigator.userAgent) && !window.MSStream;
        const isStandalone = window.navigator.standalone || window.matchMedia('(display-mode: standalone)').matches;

        if (isStandalone) return; // Already installed
        if (localStorage.getItem('install_dismissed')) return; // User dismissed

        const modal = document.getElementById('install-modal');
        const content = document.getElementById('install-instructions');

        if (isIOS) {
            content.innerHTML = `
                <p>Para instalar esta app en tu iPhone:</p>
                <ol>
                    <li>Toca el botón <strong>Compartir</strong> <img src="assets/icon-share.png" style="height:1em; vertical-align:middle;"></li>
                    <li>Selecciona <strong>Añadir a pantalla de inicio</strong>.</li>
                </ol>
            `;
            modal.classList.remove('hidden');
        } else {
            // Android / Desktop generally handle generic banners, 
            // but we can show a hint if we captured the 'beforeinstallprompt'
            if (window.deferredPrompt) {
                content.innerHTML = `<p>Instala la app para usarla sin conexión.</p>`;
                const btn = document.createElement('button');
                btn.className = 'btn-primary';
                btn.textContent = 'Instalar ahora';
                btn.style.marginTop = '10px';
                btn.onclick = async () => {
                    window.deferredPrompt.prompt();
                    const outcome = await window.deferredPrompt.userChoice;
                    if (outcome === 'accepted') modal.classList.add('hidden');
                };
                content.appendChild(btn);
                modal.classList.remove('hidden');
            }
        }

        document.getElementById('btn-close-install').onclick = () => {
            modal.classList.add('hidden');
            localStorage.setItem('install_dismissed', 'true');
        };
    },

    getValues: () => {
        const qRaw = UI.inputs.q.value;
        const dRaw = UI.inputs.d.value;
        const lRaw = UI.inputs.l.value;
        const kRaw = UI.inputs.k.value;
        const rRaw = UI.inputs.roughness.value;

        // Fail-closed validation for empty strings
        if (!qRaw || !dRaw || !lRaw) return null;

        return {
            q: UI.normalization.parse(qRaw),
            d: UI.normalization.parse(dRaw),
            l: UI.normalization.parse(lRaw),
            k: UI.normalization.parse(kRaw) || 0,
            roughness: UI.normalization.parse(rRaw) || 0
        };
    },

    setValues: (data) => {
        UI.inputs.q.value = data.q;
        UI.inputs.d.value = data.d;
        UI.inputs.l.value = data.l;
        UI.inputs.k.value = data.k;
        UI.inputs.roughness.value = data.roughness;

        // Handle select logic if needed (simplified for MVP)
        UI.inputs.roughness.style.display = 'block';
        UI.inputs.material.value = 'custom';
    },

    renderResults: (res) => {
        const area = document.getElementById('results-area');
        area.classList.remove('hidden');
        area.scrollIntoView({ behavior: 'smooth' });

        // Clear error if any was visible manually (though App controller handles flow)
        document.getElementById('msg-error').classList.add('hidden');

        document.getElementById('res-total').textContent = res.totalLoss.toFixed(3) + ' m';
        document.getElementById('res-friction').textContent = res.frictionLoss.toFixed(2) + ' m';
        document.getElementById('res-local').textContent = res.localLoss.toFixed(2) + ' m';
        document.getElementById('res-velocity').textContent = res.v.toFixed(2) + ' m/s';
        document.getElementById('res-reynolds').textContent = Math.round(res.re).toLocaleString();

        const regEl = document.getElementById('res-regime');
        regEl.textContent = res.regime;
        if (res.regime === 'Laminar') regEl.style.color = 'var(--color-success)';
        else if (res.regime === 'Transición') regEl.style.color = 'var(--color-warning)';
        else regEl.style.color = 'var(--color-text-main)';

        // Warnings
        const wBox = document.getElementById('msg-warning');
        if (res.warnings.length > 0) {
            wBox.innerHTML = res.warnings.join('<br>');
            wBox.classList.remove('hidden');
        } else {
            wBox.classList.add('hidden');
        }
    },

    showError: (msg) => {
        const errBox = document.getElementById('msg-error');
        // If element doesn't exist in markup (it was hidden in initial index.html? No, let's inject or show)
        // Checking index.html... ah, we removed msg-error earlier? Let's check.
        // It was in the first version, but strictly speaking checking the current index.html...
        // Let's create it dynamically if missing or just alert for now, but better to show in UI.

        // WAIT: In the previous version of index.html I removed it? No.
        // Let's assume it might not be visible.
        // I will implement a safe check.

        if (!errBox) {
            alert(msg);
            return;
        }

        errBox.textContent = msg;
        errBox.classList.remove('hidden');
        document.getElementById('results-area').classList.add('hidden');
    },

    renderHistory: (list) => {
        const container = UI.inputs.historyList;
        container.innerHTML = '';

        if (list.length === 0) {
            container.innerHTML = '<div class="empty-state">No hay cálculos recientes</div>';
            return;
        }

        list.forEach(item => {
            const el = document.createElement('div');
            el.className = 'history-item';
            // Store raw inputs for restoration
            el.onclick = () => UI.onHistoryClick(item);

            el.innerHTML = `
                <div class="h-date">${item.date}</div>
                <div class="h-summary">Q: ${item.uiInputs.q} | D: ${item.uiInputs.d} | L: ${item.uiInputs.l}</div>
                <div class="h-result">Pérdida: ${item.loss} m</div>
            `;
            container.appendChild(el);
        });
    },

    onHistoryClick: null // callback
};
