/* ==========================================================================
   Dashboard Academus - Proteção de rota e dados do usuário
   ========================================================================== */

(function () {
    // Protege a rota: se não houver sessão, volta para o login
    var userRaw = sessionStorage.getItem('unioeste_user');
    if (!userRaw) {
        window.location.replace('index.html');
        return;
    }

    var user;
    try {
        user = JSON.parse(userRaw);
    } catch (e) {
        sessionStorage.removeItem('unioeste_user');
        window.location.replace('index.html');
        return;
    }

    document.addEventListener('DOMContentLoaded', function () {
        // Preenche nome do usuário na navbar
        var label = document.getElementById('user-label');
        if (label) {
            label.innerHTML = user.nome + ' (' + user.ra + ') <span class="caret caret-usuario"></span>';
        }

        // Botão de logout
        var btnLogout = document.getElementById('btn-logout');
        if (btnLogout) {
            btnLogout.addEventListener('click', function (ev) {
                ev.preventDefault();
                sessionStorage.removeItem('unioeste_user');
                window.location.href = 'index.html';
            });
        }

        // Botão "Módulo de Requerimento de Matrícula" - apenas feedback
        var btnMatricula = document.getElementById('btn-matricula');
        if (btnMatricula) {
            btnMatricula.addEventListener('click', function () {
                alert('Módulo de Requerimento de Matrícula (mock - não implementado)');
            });
        }
    });
})();
