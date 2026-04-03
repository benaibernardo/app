/**
 * BENAI APP — Módulo de Autenticação Compartilhado
 * auth.js v1.0
 *
 * Como usar em cada página:
 *   Páginas admin-only (financeiro, dieta, studionai):
 *     <script src="auth.js"></script>
 *
 *   Páginas com acesso guest (card, viagens):
 *     <script>window.BENAI_ALLOW_GUEST = true;</script>
 *     <script src="auth.js"></script>
 *
 * Este script roda de forma síncrona e imediata antes do DOM carregar.
 * Se a sessão for inválida, redireciona para index.html sem exibir nada.
 */
(function () {
    'use strict';

    var auth = sessionStorage.getItem('benai_auth');
    var role = sessionStorage.getItem('benai_role');
    var allowGuest = window.BENAI_ALLOW_GUEST === true;

    var isValid = auth === 'true' && (
        role === 'admin' ||
        (allowGuest && role === 'guest')
    );

    if (!isValid) {
        // Determina o caminho base para funcionar em qualquer subpasta
        var path = window.location.pathname;
        var base = path.substring(0, path.lastIndexOf('/') + 1);
        window.location.replace(base + 'index.html');
    }
}());
