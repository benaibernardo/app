/**
 * BENAI APP — Módulo Core Compartilhado
 * benai-core.js v1.0
 *
 * Importar em todas as páginas filhas APÓS auth.js:
 *   <script src="auth.js"></script>
 *   <script src="benai-core.js"></script>
 *
 * Fornece: tema, toast, formatação monetária, backup/restore.
 * Cada página ainda mantém sua própria lógica de dados e cloud.
 */
(function (global) {
    'use strict';

    // ─────────────────────────────────────────────
    // TEMA
    // Detecta automaticamente o ícone de tema pelo ID
    // Suporta: data-lucide (lucide icons) e fa- classes (font awesome)
    // IDs aceitos: 'theme-icon', 'themeIcon'
    // ─────────────────────────────────────────────
    function _getThemeIcon() {
        return document.getElementById('theme-icon') ||
               document.getElementById('themeIcon');
    }

    function _applyTheme(isDark) {
        const el = _getThemeIcon();
        if (!el) return;

        if (el.hasAttribute('data-lucide')) {
            el.setAttribute('data-lucide', isDark ? 'moon' : 'sun');
            if (typeof lucide !== 'undefined') lucide.createIcons();
        } else {
            // Font Awesome
            if (isDark) {
                el.classList.remove('fa-sun');
                el.classList.add('fa-moon');
            } else {
                el.classList.remove('fa-moon');
                el.classList.add('fa-sun');
            }
        }
    }

    function initTheme() {
        const saved = localStorage.getItem('theme');
        const isDark = saved === 'dark' || (!saved); // padrão: dark
        if (isDark) {
            document.documentElement.setAttribute('data-theme', 'dark');
        } else {
            document.documentElement.removeAttribute('data-theme');
        }
        _applyTheme(isDark);
    }

    function toggleTheme() {
        const currentlyDark = document.documentElement.getAttribute('data-theme') === 'dark';
        if (currentlyDark) {
            document.documentElement.removeAttribute('data-theme');
            localStorage.setItem('theme', 'light');
            _applyTheme(false);
        } else {
            document.documentElement.setAttribute('data-theme', 'dark');
            localStorage.setItem('theme', 'dark');
            _applyTheme(true);
        }
    }

    // Alias usado pela dieta
    const toggleLocalTheme = toggleTheme;

    // ─────────────────────────────────────────────
    // TOAST
    // Detecta automaticamente o elemento de toast e seu span de texto
    // IDs aceitos: 'toast' com filho 'toast-msg', 'toast-text' ou 'toastMsg'
    // ─────────────────────────────────────────────
    function showToast(msg) {
        const t = document.getElementById('toast');
        if (!t) return;

        const msgEl = document.getElementById('toast-msg') ||
                      document.getElementById('toast-text') ||
                      document.getElementById('toastMsg');

        if (msgEl) msgEl.innerText = msg;

        // Suporta dois sistemas de animação: translateX e opacity/translate-y
        if (t.classList.contains('translate-y-20') || t.classList.contains('opacity-0')) {
            t.classList.remove('translate-y-20', 'opacity-0');
            setTimeout(() => t.classList.add('translate-y-20', 'opacity-0'), 3000);
        } else if (t.style.transform !== undefined && t.style.transform.includes('translateX')) {
            t.style.transform = 'translateX(0)';
            setTimeout(() => t.style.transform = 'translateX(150%)', 3000);
        } else {
            t.classList.add('show');
            setTimeout(() => t.classList.remove('show'), 3000);
        }
    }

    // Alias: algumas páginas chamam toast() diretamente
    const toast = showToast;

    // ─────────────────────────────────────────────
    // FORMATAÇÃO MONETÁRIA (PT-BR)
    // ─────────────────────────────────────────────
    function parseMoney(s) {
        if (typeof s === 'number') return s;
        if (!s) return 0;
        return parseFloat(String(s).replace(/[^0-9,]/g, '').replace(',', '.')) || 0;
    }

    function fmtMoney(n) {
        return Number(n).toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' });
    }

    function maskMoney(input) {
        let v = input.value.replace(/\D/g, '');
        v = (v / 100).toFixed(2) + '';
        v = v.replace('.', ',');
        v = v.replace(/(\d)(?=(\d{3})+(?!\d))/g, '$1.');
        input.value = 'R$ ' + v;
    }

    // ─────────────────────────────────────────────
    // BACKUP & RESTORE
    // Uso: BenaiCore.backupJSON(db, 'finance_backup.json')
    //      BenaiCore.restoreJSON(inputEl, function(data){ db = data; saveData(); })
    // ─────────────────────────────────────────────
    function backupJSON(data, filename) {
        const blob = new Blob([JSON.stringify(data, null, 2)], { type: 'application/json' });
        const a = document.createElement('a');
        a.href = URL.createObjectURL(blob);
        a.download = filename || 'benai_backup.json';
        a.click();
        URL.revokeObjectURL(a.href);
    }

    function restoreJSON(input, onSuccess, onError) {
        const file = input.files[0];
        if (!file) return;
        const reader = new FileReader();
        reader.onload = function (e) {
            try {
                const data = JSON.parse(e.target.result);
                if (typeof onSuccess === 'function') onSuccess(data);
            } catch (err) {
                if (typeof onError === 'function') onError(err);
                else alert('Arquivo inválido ou corrompido.');
            }
        };
        reader.readAsText(file);
    }

    // ─────────────────────────────────────────────
    // GUARD DE SEGURANÇA
    // Verifica se é seguro gravar na nuvem — evita sobrescrever com dados vazios
    // Uso: if (!BenaiCore.safeToSave(db.transactions, DB_KEY)) return;
    // ─────────────────────────────────────────────
    function safeToSave(dataArray, localStorageKey) {
        if (!dataArray || dataArray.length === 0) {
            const existing = localStorage.getItem(localStorageKey);
            if (existing) {
                try {
                    const parsed = JSON.parse(existing);
                    const key = Object.keys(parsed).find(k => Array.isArray(parsed[k]) && parsed[k].length > 0);
                    if (key) {
                        console.warn('[BENAI CORE] Save bloqueado: array vazio mas localStorage tem dados. Nuvem preservada.');
                        return false;
                    }
                } catch (e) {}
            }
        }
        return true;
    }

    // ─────────────────────────────────────────────
    // EXPORTAR
    // ─────────────────────────────────────────────
    global.BenaiCore = {
        initTheme,
        toggleTheme,
        toggleLocalTheme,
        showToast,
        toast,
        parseMoney,
        fmtMoney,
        maskMoney,
        backupJSON,
        restoreJSON,
        safeToSave,
    };

    // Expor globalmente as funções mais chamadas para compatibilidade
    // (as páginas chamam initTheme(), toast(), etc. diretamente sem prefixo)
    global.initTheme      = initTheme;
    global.toggleTheme    = toggleTheme;
    global.toggleLocalTheme = toggleLocalTheme;
    global.showToast      = showToast;
    global.toast          = toast;
    global.parseMoney     = parseMoney;
    global.fmtMoney       = fmtMoney;
    global.maskMoney      = maskMoney;

}(window));
