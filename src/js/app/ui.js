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

    // Install Flow: "Silent & Premium"
    showInstallPrompt: () => {
        // Validation: Don't show if already installed or dismissed
        const isStandalone = window.navigator.standalone || window.matchMedia('(display-mode: standalone)').matches;
        if (isStandalone) return;
        if (localStorage.getItem('install_dismissed') === 'true') return;

        // Prevent spamming: Check if we already showed it this session
        if (sessionStorage.getItem('install_session_shown')) return;

        const isIOS = /iPad|iPhone|iPod/.test(navigator.userAgent) && !window.MSStream;

        // Logic:
        // Android -> We have `window.deferredPrompt` -> Show Toast -> Click -> Native Prompt
        // iOS -> We are on iOS -> Show Toast -> Click -> Show Visual Guide Modal

        if (window.deferredPrompt) {
            UI.showToast("¿Instalar Hydrocálculo?", "Funciona offline y es más rápida.", "Instalar", () => {
                window.deferredPrompt.prompt();
                window.deferredPrompt.userChoice.then((choice) => {
                    if (choice.outcome === 'accepted') {
                        UI.hideToast();
                    }
                });
            });
            sessionStorage.setItem('install_session_shown', 'true');
        } else if (isIOS) {
            UI.showToast("¿Usar como App?", "Añádela a tu inicios para acceso instantáneo.", "Ver cómo", () => {
                UI.showIOSGuide();
                UI.hideToast();
            });
            sessionStorage.setItem('install_session_shown', 'true');
        }
    },

    showToast: (title, subtitle, actionText, actionCallback) => {
        // Remove existing if any
        const existing = document.getElementById('install-toast');
        if (existing) existing.remove();

        const toast = document.createElement('div');
        toast.id = 'install-toast';
        toast.className = 'install-toast slide-up';
        toast.innerHTML = `
            <div class="toast-content">
                <div class="toast-title">${title}</div>
                <div class="toast-subtitle">${subtitle}</div>
            </div>
            <div class="toast-actions">
                <button id="btn-toast-action" class="btn-toast-primary">${actionText}</button>
                <button id="btn-toast-close" class="btn-toast-close">✕</button>
            </div>
        `;

        document.body.appendChild(toast);

        document.getElementById('btn-toast-action').onclick = actionCallback;
        document.getElementById('btn-toast-close').onclick = () => {
            UI.hideToast();
            localStorage.setItem('install_dismissed', 'true');
        };
    },

    hideToast: () => {
        const toast = document.getElementById('install-toast');
        if (toast) {
            toast.classList.remove('slide-up');
            toast.classList.add('slide-down');
            setTimeout(() => toast.remove(), 300);
        }
    },

    showIOSGuide: () => {
        // Reuse existing modal structure, injecting dynamic content
        let modal = document.getElementById('install-modal');
        if (!modal) {
            // Create if missing (fail-safe)
            modal = document.createElement('div');
            modal.id = 'install-modal';
            modal.className = 'install-modal hidden';
            modal.innerHTML = `
                <div class="install-sheet">
                    <div id="install-instructions" class="install-steps"></div>
                    <button id="btn-close-install" class="install-btn">Entendido</button>
                </div>
            `;
            document.body.appendChild(modal);
        }

        const content = document.getElementById('install-instructions');
        content.innerHTML = `
            <div style="text-align:center; margin-bottom:15px;">
                <img src="assets/icon-share.svg" style="height:24px; opacity:0.8;">
                <span style="font-size:20px; vertical-align:middle; margin:0 10px;">➔</span>
                <img src="assets/icon-add.svg" style="height:24px; border-radius:4px;">
            </div>
            <p style="text-align:center; font-weight:600; font-size:17px; margin-bottom:5px;">Añadir a Pantalla de Inicio</p>
            <p style="text-align:center; color:#888; font-size:14px; margin:0;">Toca el icono Compartir y selecciona "Añadir a inicio"</p>
        `;

        modal.classList.remove('hidden');

        // Re-bind close
        const closeBtn = document.getElementById('btn-close-install');
        closeBtn.onclick = () => {
            modal.classList.add('hidden');
        };
        // Also close on background click
        modal.onclick = (e) => {
            if (e.target === modal) modal.classList.add('hidden');
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
